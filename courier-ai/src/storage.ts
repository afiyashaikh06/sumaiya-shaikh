import { promises as fs } from 'fs';
import path from 'path';
import { Courier, DatabaseSchema, DEFAULT_DB, Order } from './models';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function loadDatabase(): Promise<DatabaseSchema> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      await saveDatabase(DEFAULT_DB);
      return DEFAULT_DB;
    }
    throw error;
  }
}

export async function saveDatabase(db: DatabaseSchema): Promise<void> {
  await ensureDataDir();
  const json = JSON.stringify(db, null, 2);
  await fs.writeFile(DB_FILE, json, 'utf-8');
}

export async function listCouriers(): Promise<Courier[]> {
  const db = await loadDatabase();
  return db.couriers;
}

export async function createCourier(courier: Courier): Promise<Courier> {
  const db = await loadDatabase();
  db.couriers.push(courier);
  await saveDatabase(db);
  return courier;
}

export async function listOrders(): Promise<Order[]> {
  const db = await loadDatabase();
  return db.orders;
}

export async function createOrder(order: Order): Promise<Order> {
  const db = await loadDatabase();
  db.orders.push(order);
  await saveDatabase(db);
  return order;
}

export async function assignOrder(orderId: string, courierId: string): Promise<Order | undefined> {
  const db = await loadDatabase();
  const order = db.orders.find(o => o.id === orderId);
  if (!order) return undefined;
  order.assignedCourierId = courierId;
  order.status = 'assigned';
  await saveDatabase(db);
  return order;
}