import * as express from 'express';
import {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  addTeacherToBranch,
  removeTeacherFromBranch
} from '../controllers/branchController';
import { protect, adminOnly } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(protect as unknown as express.RequestHandler, getBranches as unknown as express.RequestHandler)
  .post(protect as unknown as  express.RequestHandler, adminOnly as express.RequestHandler, createBranch as unknown as express.RequestHandler);

router.route('/:id')
  .get(protect as unknown as express.RequestHandler, getBranchById as unknown as express.RequestHandler)
  .put(protect as unknown as express.RequestHandler, adminOnly as express.RequestHandler, updateBranch as unknown as express.RequestHandler);

router.route('/:id/teachers')
  .post(protect as unknown as express.RequestHandler, adminOnly as express.RequestHandler, addTeacherToBranch as unknown as express.RequestHandler)
  .delete(protect as unknown as express.RequestHandler, adminOnly as express.RequestHandler, removeTeacherFromBranch as unknown as express.RequestHandler);

export default router;