import express from 'express';
import {
  getDocumentsByEvent,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
} from '../controllers/documentController.js';

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getDocumentsByEvent)
  .post(createDocument);

router.route('/:documentId')
  .get(getDocument)
  .put(updateDocument)
  .patch(updateDocument)
  .delete(deleteDocument);

export default router;
