import express, { Router, Request, Response } from 'express';
import { processAiRequest } from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router: Router = express.Router();

// Process AI requests
router.post('/process', protect as unknown as express.RequestHandler, async (req: Request, res: Response) => {
  await processAiRequest(req, res);
});

export default router;