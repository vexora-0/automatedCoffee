import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Order from '../models/Order';
import Recipe from '../models/Recipe';
import User from '../models/User';
import Machine from '../models/Machine';
import { decryptCc, encryptCc, getIvBase64, getKeyBase64FromWorkingKey, serializeParams } from '../utils/ccavenue';
import { finalizeOrderAndUpdateInventory } from '../services/orderFinalizationService';

// Environment / merchant config - All values must be set in environment variables
const MERCHANT_ID = process.env.CCAV_MERCHANT_ID;
const ACCESS_CODE = process.env.CCAV_ACCESS_CODE;
const WORKING_KEY = process.env.CCAV_WORKING_KEY;
const PAYMENT_URL = process.env.CCAV_INIT_URL;

// The URL that CCAvenue will POST back to with encResp
const RESPONSE_URL = process.env.CCAV_RESPONSE_URL;
const CANCEL_URL = process.env.CCAV_CANCEL_URL;

// Validate required environment variables
if (!MERCHANT_ID || !ACCESS_CODE || !WORKING_KEY || !PAYMENT_URL || !RESPONSE_URL || !CANCEL_URL) {
  throw new Error('Missing required CCAvenue environment variables: CCAV_MERCHANT_ID, CCAV_ACCESS_CODE, CCAV_WORKING_KEY, CCAV_INIT_URL, CCAV_RESPONSE_URL, CCAV_CANCEL_URL');
}

export const initiatePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, machine_id, recipe_id } = req.body;

    // Validate essential entities
    const user = await User.findOne({ user_id });
    const machine = await Machine.findOne({ machine_id });
    const recipe = await Recipe.findOne({ recipe_id });

    if (!user || !machine || !recipe) {
      res.status(400).json({ success: false, message: 'Invalid user/machine/recipe' });
      return;
    }

    // Create a pending order to attach to transaction (CCAvenue typically limits to 20 chars)
    const orderId = uuidv4().replace(/-/g, '').substring(0, 20);
    await Order.create({
      order_id: orderId,
      user_id,
      machine_id,
      recipe_id,
      bill: recipe.price,
      ordered_at: new Date(),
      status: 'pending'
    });

    // Use environment URLs directly (no fallbacks for security)

    // Build billing parameters minimal required
    const params: Record<string, string | number> = {
      merchant_id: MERCHANT_ID,
      order_id: orderId,
      amount: recipe.price.toFixed(2),
      currency: 'INR',
      redirect_url: RESPONSE_URL,
      cancel_url: CANCEL_URL,
      language: 'EN',
      billing_name: user.name,
      billing_tel: user.phone_number,
      billing_email: user.email || 'customer@example.com',
      merchant_param1: user_id,
      merchant_param2: machine_id,
      merchant_param3: recipe_id,
    };

    const plain = serializeParams(params);
    const keyBase64 = getKeyBase64FromWorkingKey(WORKING_KEY);
    const ivBase64 = getIvBase64();
    const encRequest = encryptCc(plain, keyBase64, ivBase64);

    // Return an HTML form that auto-submits to CCAvenue (only encRequest and access_code as per kit)
    const formHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Redirecting...</title></head><body>
      <form id="ccavForm" method="post" action="${PAYMENT_URL}">
        <input type="hidden" name="encRequest" value="${encRequest}" />
        <input type="hidden" name="access_code" value="${ACCESS_CODE}" />
      </form>
      <script>document.getElementById('ccavForm').submit();</script>
    </body></html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(formHtml);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to initiate payment' });
  }
};

export const handleCcavResponse = async (req: Request, res: Response): Promise<void> => {
  try {
    const encResp = (req.body.encResp as string) || '';
    const keyBase64 = getKeyBase64FromWorkingKey(WORKING_KEY);
    const ivBase64 = getIvBase64();

    const decrypted = decryptCc(encResp, keyBase64, ivBase64);

    // Convert key=value&key2=value2 string to object
    const responseMap = Object.fromEntries(
      decrypted.split('&').map((pair) => {
        const [k, v] = pair.split('=');
        return [k, decodeURIComponent(v || '')];
      })
    ) as Record<string, string>;

    const orderId = responseMap['order_id'];
    const orderStatus = (responseMap['order_status'] || '').toLowerCase();

    if (!orderId) {
      res.status(400).send('Invalid response');
      return;
    }

    // Capture previous status to avoid double-deducting inventory
    const existingOrder = await Order.findOne({ order_id: orderId }).lean();

    // Map CCAvenue status to our order status
    let newStatus: 'completed' | 'failed' | 'cancelled' = 'failed';
    if (orderStatus === 'success') newStatus = 'completed';
    if (orderStatus === 'aborted') newStatus = 'cancelled';

    const updated = await Order.findOneAndUpdate(
      { order_id: orderId },
      { status: newStatus },
      { new: true }
    );

    // When payment succeeds and we just transitioned to completed, finalize order + inventory
    if (newStatus === 'completed' && updated && existingOrder?.status !== 'completed') {
      await finalizeOrderAndUpdateInventory(updated);
    }

    // Redirect the client app to success/failure page with details
    const clientBase = process.env.CLIENT_PUBLIC_URL;
    if (!clientBase) {
      res.status(500).send('CLIENT_PUBLIC_URL environment variable not configured');
      return;
    }
    let recipeName = '';
    let amount = '';

    if (updated) {
      amount = encodeURIComponent(String(updated.bill ?? '0'));
      try {
        const recipe = await Recipe.findOne({ recipe_id: updated.recipe_id });
        recipeName = encodeURIComponent(recipe?.name || 'Coffee');
      } catch {}
    }

    if (newStatus === 'completed') {
      res.redirect(`${clientBase}/product/success?recipe=${recipeName}&price=${amount}`);
    } else {
      res.redirect(`${clientBase}/product/auth?payment=${newStatus}`);
    }
  } catch (error: any) {
    res.status(500).send('Payment processing error');
  }
};

