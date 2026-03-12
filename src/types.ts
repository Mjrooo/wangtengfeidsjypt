export interface StoreInfo {
  id: number;
  name: string;
  photos: string[];
  contact: string;
  phone: string;
  email: string;
  features?: string;
  notices?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  isDistribution: boolean;
  description?: string;
  image?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  productId: number;
  productName: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled' | 'refunded';
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  createdAt: string;
  logisticsInfo?: string;
}

export interface ServiceRequest {
  id: number;
  type: 'errand' | 'housekeeping' | 'repair';
  title: string;
  description: string;
  status: 'pending' | 'assigned' | 'completed';
  customerName: string;
  customerPhone: string;
  address: string;
  createdAt: string;
}

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'staff' | 'delivery';
  permissions: string[];
}
