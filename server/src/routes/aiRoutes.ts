import express, { Router, Request, Response } from 'express';
import { processAiRequest } from '../controllers/aiController';

const router: Router = express.Router();

// Process AI requests
router.post('/process', async (req: Request, res: Response) => {
  await processAiRequest(req, res);
});

export default router;