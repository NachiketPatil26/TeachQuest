import express from 'express';
import { protect, adminOnly } from '../middleware/auth';
import * as analyticsController from '../controllers/analyticsController';

const router = express.Router();

// Get analytics data for admin dashboard
router.get('/', protect as unknown as express.RequestHandler, adminOnly as express.RequestHandler, async (req: express.Request, res: express.Response) => {
  try {
    const { branch } = req.query;
    const { semester } = req.query;
    
    if (!branch) {
      res.status(400).json({ message: 'Branch parameter is required' });
      return;
    }

    // Get all analytics data
    await analyticsController.getAllAnalytics(req, res);
  } catch (error) {
    console.error('Analytics route error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics data', error: error.message });
  }
});

// Get teacher-specific analytics
router.get('/teachers/:teacherId?', protect as unknown as express.RequestHandler, async (req: express.Request, res: express.Response) => {
  try {
    const teacherId = req.params.teacherId || req.user?.id;
    if (!teacherId) {
      res.status(400).json({ message: 'Teacher ID is required' });
      return;
    }

    // TODO: Implement teacher-specific analytics
    res.json({
      teacherStats: {
        totalDuties: 0,
        completedDuties: 0,
        upcomingDuties: 0
      }
    });
  } catch (error) {
    console.error('Teacher analytics route error:', error);
    res.status(500).json({ message: 'Failed to fetch teacher analytics', error: error.message });
  }
});

export default router;