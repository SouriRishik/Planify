import { Router } from 'express';
import { projectController } from '../controllers/projectController';
import { taskController } from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', projectController.getAll);
router.post('/', projectController.create);
router.get('/:id', projectController.getOne);
router.put('/:id', projectController.update);
router.delete('/:id', projectController.delete);

router.get('/:projectId/tasks', taskController.getByProject);
router.post('/:projectId/tasks', taskController.create);

export default router;
