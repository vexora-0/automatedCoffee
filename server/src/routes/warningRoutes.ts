import express from 'express';
import {
  getAllWarnings,
  getWarningById,
  createWarning,
  resolveWarning,
  deleteWarning
} from '../controllers/warningController';

const router = express.Router();

router.route('/')
  .get(getAllWarnings)
  .post(createWarning);

router.route('/:warningId')
  .get(getWarningById)
  .delete(deleteWarning);

router.route('/:warningId/resolve')
  .put(resolveWarning);

export default router; 