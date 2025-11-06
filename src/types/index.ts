export interface User {
  id: string;
  email: string;
  name: string;
  role: 'dealer' | 'evm_staff' | 'admin' | 'customer';
  dealerId?: string;
  dealerName?: string;
  companyName?: string;
}

export interface Vehicle {
  id: string;
  vehicleId?: number; // Backend uses vehicleId
  model: string;
  version: string;
  color: string;
  price: number;
  finalPrice?: number; // Giá sau khi áp dụng giảm giá
  discountId?: number; // ID của discount được áp dụng
  wholesalePrice?: number;
  range?: number;
  maxSpeed?: number;
  chargingTime?: string;
  features?: string[];
  images?: string[];
  stock?: number;
  description?: string;
  type?: string; // Backend field
  status?: string; // Backend field
  // New API fields
  distance?: string; // API field: "1000km"
  timecharging?: string; // API field: "5-hours"
  speed?: string; // API field: "300km/h"
  image1?: string; // API field
  image2?: string; // API field
  image3?: string; // API field
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  testDrives: TestDrive[];
  orders: Order[];
  debt?: number;
  lastPurchaseDate?: string;
  totalSpent?: number;
  companyName?: string | null;
}

export interface TestDrive {
  id: string;
  customerId: string;
  vehicleId: string;
  scheduledDate: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Order {
  id: string;
  customerId: string;
  vehicleId: string;
  dealerId?: string;
  status: 'quote' | 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  totalAmount: number;
  paymentMethod: 'cash' | 'installment';
  createdAt: string;
  deliveryDate?: string;
}

export interface Dealer {
  id: string;
  name: string;
  address: string;
  manager: string;
  phone: string;
  email: string;
  target: number;
  currentSales: number;
  debt: number;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: number;
  validFrom: string;
  validTo: string;
  applicableVehicles: string[];
}