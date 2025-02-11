import * as express from 'express';
import {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  assignInvigilator,
  completeBlock,
  updateExamBlock
} from '../controllers/examController';
import { protect, adminOnly as admin } from '../middleware/auth';

const router = express.Router();

router.route('/:branch')
  .get(protect as unknown as express.RequestHandler, async (req, res, next) => {
    await getExams(req, res);
  })
  .post(protect as unknown as express.RequestHandler, admin as express.RequestHandler, async (req, res, next) => {
    await createExam(req, res);
  });

router.route('/:id')
  .get(protect as unknown as express.RequestHandler, async (req, res, next) => {
    await getExamById(req, res);
  })
  .put(protect as unknown as express.RequestHandler, admin as express.RequestHandler, async (req, res, next) => {
    await updateExam(req, res);
  })
  .delete(protect as unknown as express.RequestHandler, admin as express.RequestHandler, async (req, res, next) => {
    await deleteExam(req, res);
  });

router.route('/:id/blocks/:blockNumber/invigilator')
  .post(protect as unknown as express.RequestHandler, admin as express.RequestHandler, async (req, res, next) => {
    await assignInvigilator(req, res);
  });

router.route('/:id/blocks/:blockNumber/complete')
  .put(protect as unknown as express.RequestHandler, async (req, res, next) => {
    await completeBlock(req, res);
  });

router.route('/:id/blocks/:blockNumber')
  .patch(protect as unknown as express.RequestHandler, admin as express.RequestHandler, async (req, res, next) => {
    await updateExamBlock(req, res);
  });

export default router;