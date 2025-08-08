import { Router } from 'express';
import { z } from 'zod';
import { Courier } from '../models';
import { createCourier, listCouriers } from '../storage';
import crypto from 'crypto';

const router = Router();

const createCourierSchema = z.object({
  name: z.string().min(1),
  vehicleType: z.enum(['bike', 'motorbike', 'car', 'van', 'truck']),
  capacity: z.number().int().positive()
});

router.get('/', async (_req, res) => {
  const couriers = await listCouriers();
  res.json(couriers);
});

router.post('/', async (req, res) => {
  const parsed = createCourierSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }

  const payload = parsed.data;
  const courier: Courier = {
    id: crypto.randomUUID(),
    name: payload.name,
    vehicleType: payload.vehicleType,
    capacity: payload.capacity,
    createdAt: new Date().toISOString()
  };

  const created = await createCourier(courier);
  res.status(201).json(created);
});

export default router;