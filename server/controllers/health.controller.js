export const getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'ClubOps AI API',
    tagline: 'AI-powered operations for smarter events.',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
};
