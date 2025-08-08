export type GeoPoint = {
  latitude: number;
  longitude: number;
};

export type Courier = {
  id: string;
  name: string;
  vehicleType: 'bike' | 'motorbike' | 'car' | 'van' | 'truck';
  capacity: number; // maximum number of active orders
  createdAt: string;
};

export type OrderStatus = 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled';

export type Order = {
  id: string;
  pickup: GeoPoint;
  dropoff: GeoPoint;
  size: number; // units, compared against courier capacity
  status: OrderStatus;
  assignedCourierId?: string;
  createdAt: string;
};

export type DatabaseSchema = {
  couriers: Courier[];
  orders: Order[];
};

export const DEFAULT_DB: DatabaseSchema = {
  couriers: [],
  orders: []
};