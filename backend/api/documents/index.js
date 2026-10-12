import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ module: 'documents', status: 'active', timestamp: new Date().toISOString() });
});

export default router;
