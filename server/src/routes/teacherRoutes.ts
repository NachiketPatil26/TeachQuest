import * as express from 'express';
import { protect, adminOnly as admin } from '../middleware/auth';
import { allocateTeachers } from '../controllers/examController';

const router = express.Router();

router.route('/:id/allocate')
  .post(protect as unknown as express.RequestHandler, admin as express.RequestHandler, async (req, res, next) => {
    await allocateTeachers(req, res);
  });

export default router;