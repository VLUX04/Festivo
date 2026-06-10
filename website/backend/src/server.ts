import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import authRoutes from './routes/auth.routes.js';
import chatRoutes from './routes/chat.routes.js';
import eventRoutes from './routes/event.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import socialRoutes from './routes/social.routes.js';
import workRoutes from './routes/work.routes.js';
import { ensureFriendRequestsTable, ensureTextMediaColumns, syncSerialSequences } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.PROD) {
    app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
    console.log('Prod/container cors enabled.');
} else {
    app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
    console.log('Dev cors enabled.');
}

app.use('/', authRoutes);
app.use('/events', eventRoutes);
app.use('/chat', chatRoutes);
app.use('/notifications', notificationRoutes);
app.use('/social', socialRoutes);
app.use('/work', workRoutes);

app.get('/', (_req, res) => {
    res.send('Backend is running!');
});

const bootstrap = async () => {
    await syncSerialSequences();
    await ensureFriendRequestsTable();
    await ensureTextMediaColumns();
    app.listen(PORT, () => console.log(`Backend running on port ${PORT} (DB host: ${process.env.DB_HOST ?? 'not set'})`));
};

void bootstrap();
