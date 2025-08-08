import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { Order } from '../models';
import { assignOrder, createOrder, listOrders } from '../storage';

const router = Router();

const geoPointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});

const createOrderSchema = z.object({
  pickup: geoPointSchema,
  dropoff: geoPointSchema,
  size: z.number().int().positive()
});

const assignSchema = z.object({
  orderId: z.string().min(1),
  courierId: z.string().min(1)
});

router.get('/', async (_req, res) => {
  const orders = await listOrders();
  res.json(orders);
});

router.post('/', async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }

  const payload = parsed.data;
  const order: Order = {
    id: crypto.randomUUID(),
    pickup: payload.pickup,
    dropoff: payload.dropoff,
    size: payload.size,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const created = await createOrder(order);
  res.status(201).json(created);
});

router.post('/assign', async (req, res) => {
  const parsed = assignSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }

  const { orderId, courierId } = parsed.data;
  const updated = await assignOrder(orderId, courierId);
  if (!updated) return res.status(404).json({ error: 'Order not found' });
  res.json(updated);
});

export default router;