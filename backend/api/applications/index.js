import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ module: 'applications', status: 'active', timestamp: new Date().toISOString() });
});

export default router;
