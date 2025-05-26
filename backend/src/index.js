import express from 'express';
import authRoutes from './routes/auth.route.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5001;

app.use('/api/auth', authRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
})