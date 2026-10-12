import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ module: 'hospitalizations', status: 'active', timestamp: new Date().toISOString() });
});

export default router;
