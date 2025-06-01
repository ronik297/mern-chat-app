import jwt from 'jsonwebtoken';

export const generateJWTToken = (userId, res) => {
    const token = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.cookie('jwt', token, {
        httpOnly: true, // prevent xxs (cross-site scripting)
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', // CSRF (cross-site request forgery) protection
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    return token;
}