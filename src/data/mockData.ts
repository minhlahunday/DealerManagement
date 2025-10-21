import { Vehicle } from '../types';

export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    model: 'VF 8',
    version: 'Standard',
    color: 'Trắng',
    price: 1200000000,
    type: 'SUV',
    status: 'ACTIVE',
    stock: 5,
    images: [
      'https://vinfasttimescity.vn/wp-content/uploads/2024/08/vf31.png',
      'https://vinfastautovn.com/public/userfiles/product_image/73/XE-DIEN-VINFAST-VF3-5.png',
      'https://vinfastautovn.com/public/userfiles/product_image/73/XE-DIEN-VINFAST-VF3-5.png'
    ],
    distance: '450 km',
    speed: '180 km/h',
    timecharging: '30 phút',
    range: 450,
    maxSpeed: 180,
    chargingTime: '30 phút'
  },
  {
    id: '2',
    model: 'VF 9',
    version: 'Premium',
    color: 'Đen',
    price: 1500000000,
    type: 'SUV',
    status: 'ACTIVE',
    stock: 3,
    images: [
      'https://vinfasttimescity.vn/wp-content/uploads/2024/08/vf31.png',
      'https://vinfastautovn.com/public/userfiles/product_image/73/XE-DIEN-VINFAST-VF3-5.png'
    ],
    distance: '500 km',
    speed: '200 km/h',
    timecharging: '25 phút',
    range: 500,
    maxSpeed: 200,
    chargingTime: '25 phút'
  },
  {
    id: '3',
    model: 'VF 3',
    version: 'Basic',
    color: 'Xanh',
    price: 800000000,
    type: 'Hatchback',
    status: 'ACTIVE',
    stock: 8,
    images: [
      'https://vinfasttimescity.vn/wp-content/uploads/2024/08/vf31.png'
    ],
    distance: '300 km',
    speed: '150 km/h',
    timecharging: '45 phút',
    range: 300,
    maxSpeed: 150,
    chargingTime: '45 phút'
  }
];

export const mockDealers = [
  {
    id: '1',
    name: 'VinFast Hà Nội',
    address: '123 Đường ABC, Hà Nội',
    phone: '024-1234-5678',
    email: 'hanoi@vinfast.vn'
  },
  {
    id: '2',
    name: 'VinFast TP.HCM',
    address: '456 Đường XYZ, TP.HCM',
    phone: '028-9876-5432',
    email: 'hcm@vinfast.vn'
  },
  {
    id: '3',
    name: 'VinFast Đà Nẵng',
    address: '789 Đường DEF, Đà Nẵng',
    phone: '0236-5555-7777',
    email: 'danang@vinfast.vn'
  }
];

export const mockCustomers = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0901234567',
    address: '123 Đường ABC, Hà Nội',
    status: 'ACTIVE',
    testDrives: [],
    orders: []
  },
  {
    id: '2',
    name: 'Trần Thị B',
    email: 'tranthib@email.com',
    phone: '0987654321',
    address: '456 Đường XYZ, TP.HCM',
    status: 'ACTIVE',
    testDrives: [],
    orders: []
  }
];

export const mockReports = [
  {
    reportId: 1,
    senderName: 'customer One',
    userId: 4,
    orderId: 1001,
    reportType: 'Sales',
    createdDate: '2025-01-01',
    resolvedDate: '2025-03-31',
    content: 'xe bi loi gat mua',
    status: 'Da Xu li'
  },
  {
    reportId: 2,
    senderName: 'customer Two',
    userId: 5,
    orderId: 1002,
    reportType: 'Sales',
    createdDate: '2025-04-01',
    resolvedDate: '2025-06-30',
    content: 'xe loi pin',
    status: 'Dang Xu li'
  }
];

export const mockAppointments = [
  {
    appointmentId: 1,
    appointmentDate: '2025-01-15T10:00:00',
    status: 'PENDING',
    userId: 1,
    vehicleId: 1,
    username: 'Nguyễn Văn A',
    vehicleName: 'VF 8',
    address: '123 Đường ABC, Hà Nội'
  },
  {
    appointmentId: 2,
    appointmentDate: '2025-01-16T14:00:00',
    status: 'CONFIRMED',
    userId: 2,
    vehicleId: 2,
    username: 'Trần Thị B',
    vehicleName: 'VF 9',
    address: '456 Đường XYZ, TP.HCM'
  }
];

export const mockOrders = [
  {
    orderId: 1,
    quotationId: 1,
    userId: 1,
    vehicleId: 1,
    orderDate: '2025-01-10T10:00:00',
    status: 'PENDING',
    totalAmount: 1200000000,
    customerName: 'Nguyễn Văn A',
    vehicleName: 'VF 8',
    customerPhone: '0901234567',
    customerEmail: 'nguyenvana@email.com'
  },
  {
    orderId: 2,
    quotationId: 2,
    userId: 2,
    vehicleId: 2,
    orderDate: '2025-01-12T14:00:00',
    status: 'CONFIRMED',
    totalAmount: 1500000000,
    customerName: 'Trần Thị B',
    vehicleName: 'VF 9',
    customerPhone: '0987654321',
    customerEmail: 'tranthib@email.com'
  },
  {
    orderId: 3,
    quotationId: 3,
    userId: 3,
    vehicleId: 3,
    orderDate: '2025-01-14T09:00:00',
    status: 'DELIVERED',
    totalAmount: 800000000,
    customerName: 'Lê Văn C',
    vehicleName: 'VF 3',
    customerPhone: '0912345678',
    customerEmail: 'levanc@email.com'
  }
];

export const mockQuotations = [
  {
    quotationId: 1,
    userId: 1,
    vehicleId: 1,
    quotationDate: '2025-01-08T10:00:00',
    basePrice: 1200000000,
    discount: 50000000,
    finalPrice: 1150000000,
    status: 'ACCEPTED',
    customerName: 'Nguyễn Văn A',
    vehicleName: 'VF 8'
  },
  {
    quotationId: 2,
    userId: 2,
    vehicleId: 2,
    quotationDate: '2025-01-09T14:00:00',
    basePrice: 1500000000,
    discount: 100000000,
    finalPrice: 1400000000,
    status: 'ACCEPTED',
    customerName: 'Trần Thị B',
    vehicleName: 'VF 9'
  },
  {
    quotationId: 3,
    userId: 3,
    vehicleId: 3,
    quotationDate: '2025-01-11T09:00:00',
    basePrice: 800000000,
    discount: 20000000,
    finalPrice: 780000000,
    status: 'PENDING',
    customerName: 'Lê Văn C',
    vehicleName: 'VF 3'
  }
];
