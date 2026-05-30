import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import authRoutes from './routes/auth.routes.js';
import chatRoutes from './routes/chat.routes.js';
import eventRoutes from './routes/event.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
	express.urlencoded({
		extended: true,
	}),
);

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.get('/', (_req, res) => {
	res.send('Backend is running!');
});

app.use(authRoutes);
app.use('/events', eventRoutes);
app.use('/chat', chatRoutes);

app.listen(PORT, () => console.log('running broder ' + process.env.DB_HOST));
