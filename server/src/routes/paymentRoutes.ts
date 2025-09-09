import express from 'express';
import { handleCcavResponse, initiatePayment } from '../controllers/paymentController';

const router = express.Router();

// Initiate payment (returns HTML to redirect to CCAvenue)
router.post('/init', initiatePayment);

// CCAvenue response/cancel callback (POST encResp)
router.post('/ccav-response', express.urlencoded({ extended: true }), handleCcavResponse);

export default router;

