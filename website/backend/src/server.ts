import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import { WebSocketServer, WebSocket } from 'ws';

import authRoutes from './routes/auth.routes.js';
import chatRoutes from './routes/chat.routes.js';
import eventRoutes from './routes/event.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import socialRoutes from './routes/social.routes.js';
import workRoutes from './routes/work.routes.js';
import { ensureFriendRequestsTable, ensureTextMediaColumns, syncSerialSequences } from './db.js';
import { SECRET_KEY } from './services/auth.service.js';
import pool from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS must come before body parsers so error responses (e.g. 413) still carry the header
app.use(cors({ origin: /^http:\/\/localhost(:\d+)?$/, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/', authRoutes);
app.use('/events', eventRoutes);
app.use('/chat', chatRoutes);
app.use('/notifications', notificationRoutes);
app.use('/social', socialRoutes);
app.use('/work', workRoutes);

app.get('/', (_req, res) => {
    res.send('Backend is running!');
});

// ------- WebSocket chat -------
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

// chatId -> Set of WebSocket clients in that chat room
const chatRooms = new Map<number, Set<WebSocket>>();

const addToRoom = (chatId: number, ws: WebSocket) => {
    if (!chatRooms.has(chatId)) chatRooms.set(chatId, new Set());
    chatRooms.get(chatId)!.add(ws);
};

const removeFromRooms = (ws: WebSocket) => {
    for (const [, clients] of chatRooms) clients.delete(ws);
};

const broadcast = (chatId: number, payload: unknown, exclude?: WebSocket) => {
    const clients = chatRooms.get(chatId);
    if (!clients) return;
    const text = JSON.stringify(payload);
    for (const client of clients) {
        if (client !== exclude && client.readyState === WebSocket.OPEN) {
            client.send(text);
        }
    }
};

wss.on('connection', (ws, req) => {
    const params = new URLSearchParams(req.url?.split('?')[1] ?? '');
    const token = params.get('token');
    let authenticatedUsername: string | null = null;

    if (token) {
        try {
            const payload = jwt.verify(token, SECRET_KEY) as { username?: string };
            if (typeof payload.username === 'string') authenticatedUsername = payload.username;
        } catch { /* invalid token */ }
    }

    ws.on('message', async (raw) => {
        let msg: any;
        try { msg = JSON.parse(raw.toString()); } catch { return; }

        if (msg.type === 'join_chat' && typeof msg.chatId === 'number') {
            addToRoom(msg.chatId, ws);
            ws.send(JSON.stringify({ type: 'joined', chatId: msg.chatId }));
        }

        if (msg.type === 'send_message' && authenticatedUsername && typeof msg.chatId === 'number' && typeof msg.content === 'string') {
            try {
                const userResult = await pool.query(
                    'SELECT id, username, name FROM users WHERE username = $1',
                    [authenticatedUsername],
                );
                const sender = userResult.rows[0];
                if (!sender) return;

                const msgResult = await pool.query(
                    'INSERT INTO message (chat_id, sender_id, content, sent_at) VALUES ($1, $2, $3, NOW()) RETURNING id, content, sent_at',
                    [msg.chatId, sender.id, msg.content.trim()],
                );
                const saved = msgResult.rows[0];

                const outgoing = {
                    type: 'new_message',
                    chatId: msg.chatId,
                    message: {
                        id: saved.id,
                        content: saved.content,
                        sent_at: saved.sent_at,
                        username: sender.username,
                        name: sender.name,
                    },
                };

                // echo back to sender and broadcast to other participants
                ws.send(JSON.stringify(outgoing));
                broadcast(msg.chatId, outgoing, ws);
            } catch (err) {
                console.error('WS send_message error:', err);
            }
        }
    });

    ws.on('close', () => removeFromRooms(ws));
});

const bootstrap = async () => {
    await syncSerialSequences();
    await ensureFriendRequestsTable();
    await ensureTextMediaColumns();
    httpServer.listen(PORT, () => console.log(`Backend running on port ${PORT} (DB host: ${process.env.DB_HOST ?? 'not set'})`));
};

void bootstrap();
