import { Router } from 'express';
import { taskController } from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', taskController.getAll);
router.get('/stats', taskController.getStats);
router.put('/:id', taskController.update);
router.delete('/:id', taskController.delete);

export default router;
