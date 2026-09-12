export const configuration = () => ({
    PORT: process.env.PORT,
    JWT_SECRET:process.env.JWT_SECRET,
    HASHING_SALT_ROUNDS:process.env.HASHING_SALT_ROUNDS || 10,
    MAIL_KEY:process.env.RESEND_API_KEY,
    MAIL_FROM:process.env.MAIL_FROM
});