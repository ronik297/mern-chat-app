import express from 'express';

const app = express();
import authRoutes from './src/routes/auth.route.js';

app.use('/api/auth', authRoutes);

app.listen(5001, () => {
    console.log('Server is running on http://localhost:5001');
})