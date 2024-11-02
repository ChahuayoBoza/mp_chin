import express from 'express';
import { formToken, apiCheckout, apiValidate, ipn } from '../controllers/checkoutIzipayController.js';

const router = express.Router();

// Rutas de Izipay
router.route('/formtoken').post(formToken);

// API routes
router.route('/checkout').post(apiCheckout);
router.route('/validate').post(apiValidate);
router.route('/ipn').post(ipn);

export default router;
