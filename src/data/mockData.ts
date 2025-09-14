import { Vehicle, Customer, TestDrive, Order, Dealer, Promotion } from '../types';

export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    model: 'ElectricVM Model S',
    version: 'Premium',
    color: 'Xanh lá',
    price: 850000000,
    wholesalePrice: 750000000,
    range: 500,
    maxSpeed: 200,
    chargingTime: '8 giờ',
    features: ['Autopilot', 'Màn hình cảm ứng 17"', 'Sạc nhanh', 'Camera 360'],
    images: ['https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg'],
    stock: 15,
    description: 'Xe điện cao cấp với công nghệ tiên tiến'
  },
  {
    id: '2',
    model: 'ElectricVM Model X',
    version: 'Standard',
    color: 'Trắng',
    price: 650000000,
    wholesalePrice: 580000000,
    range: 400,
    maxSpeed: 180,
    chargingTime: '6 giờ',
    features: ['Tự động đỗ xe', 'Màn hình 12"', 'Sạc nhanh'],
    images: ['https://images.pexels.com/photos/3752169/pexels-photo-3752169.jpeg'],
    stock: 25,
    description: 'Xe điện phổ thông với tính năng cơ bản'
  }
];

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@email.com',
    phone: '0901234567',
    address: 'Hà Nội',
    testDrives: [],
    orders: []
  },
  {
    id: '2',
    name: 'Trần Thị Bình',
    email: 'binh.tran@email.com',
    phone: '0902345678',
    address: 'TP.HCM',
    testDrives: [],
    orders: []
  }
];

export const mockDealers: Dealer[] = [
  {
    id: 'dealer1',
    name: 'Đại lý Hà Nội',
    address: '123 Nguyễn Trãi, Hà Nội',
    manager: 'Trần Thị B',
    phone: '0241234567',
    email: 'hanoi@dealer.com',
    target: 1000000000,
    currentSales: 750000000,
    debt: 50000000
  },
  {
    id: 'dealer2',
    name: 'Đại lý TP.HCM',
    address: '456 Lê Lợi, TP.HCM',
    manager: 'Lê Văn C',
    phone: '0281234567',
    email: 'hcm@dealer.com',
    target: 1200000000,
    currentSales: 900000000,
    debt: 30000000
  }
];

export const mockPromotions: Promotion[] = [
  {
    id: '1',
    title: 'Khuyến mãi tháng 12',
    description: 'Giảm 50 triệu cho mọi mẫu xe',
    discount: 50000000,
    validFrom: '2024-12-01',
    validTo: '2024-12-31',
    applicableVehicles: ['1', '2']
  }
];

export const mockOrders: Order[] = [
  {
    id: '1',
    customerId: '1',
    vehicleId: '1',
    dealerId: 'dealer1',
    status: 'pending',
    totalAmount: 800000000,
    paymentMethod: 'installment',
    createdAt: '2024-12-15T10:00:00Z',
    deliveryDate: '2024-12-25'
  }
];