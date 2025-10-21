// Payment interfaces
export interface Payment {
  paymentId: number;
  orderId: number;
  paymentDate: string;
  amount: number;
  method: string;
  status: string;
}

export interface CreatePaymentRequest {
  paymentId: number;
  orderId: number;
  paymentDate: string;
  amount: number;
  method: string;
  status: string;
}

export interface UpdatePaymentRequest {
  paymentId: number;
  orderId: number;
  paymentDate: string;
  amount: number;
  method: string;
  status: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  success?: boolean;
}

// Payment Service
export const paymentService = {
  // Create payment
  createPayment: async (paymentData: CreatePaymentRequest): Promise<ApiResponse<Payment>> => {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Token added to request headers');
      } else {
        console.warn('No token found in localStorage');
      }

      console.log('🔄 Creating payment with data:', paymentData);
      const response = await fetch('/api/Payment', {
        method: 'POST',
        headers,
        body: JSON.stringify(paymentData),
      });

      console.log('📡 Create Payment API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('📡 Create Payment API Response Data:', data);

      return {
        data: data.data,
        status: data.status || response.status,
        message: data.message || 'Success',
        success: true
      };
    } catch (error) {
      console.error('❌ Error creating payment:', error);
      throw new Error(error instanceof Error ? error.message : 'Lỗi khi tạo thanh toán');
    }
  },

  // Get all payments
  getPayments: async (): Promise<ApiResponse<Payment[]>> => {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Token added to request headers');
      } else {
        console.warn('No token found in localStorage');
      }

      console.log('🔍 Fetching payments from API...');
      const response = await fetch('/api/Payment', {
        method: 'GET',
        headers,
      });

      console.log('📡 Payment API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('📡 Payment API Response Data:', data);

      return {
        data: data.data || [],
        status: data.status || response.status,
        message: data.message || 'Success',
        success: true
      };
    } catch (error) {
      console.error('❌ Error fetching payments:', error);
      throw new Error(error instanceof Error ? error.message : 'Lỗi khi tải danh sách thanh toán');
    }
  },

  // Update payment
  updatePayment: async (id: number, paymentData: UpdatePaymentRequest): Promise<ApiResponse<Payment>> => {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Token added to request headers');
      } else {
        console.warn('No token found in localStorage');
      }

      console.log(`🔄 Updating payment ${id} with data:`, paymentData);
      const response = await fetch(`/api/Payment/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(paymentData),
      });

      console.log('📡 Update Payment API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('📡 Update Payment API Response Data:', data);

      return {
        data: data.data,
        status: data.status || response.status,
        message: data.message || 'Success',
        success: true
      };
    } catch (error) {
      console.error('❌ Error updating payment:', error);
      throw new Error(error instanceof Error ? error.message : 'Lỗi khi cập nhật thanh toán');
    }
  },

  // Delete payment
  deletePayment: async (id: number): Promise<ApiResponse<any>> => {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Token added to request headers');
      } else {
        console.warn('No token found in localStorage');
      }

      console.log(`🗑️ Deleting payment ${id}...`);
      const response = await fetch(`/api/Payment/${id}`, {
        method: 'DELETE',
        headers,
      });

      console.log('📡 Delete Payment API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('📡 Delete Payment API Response Data:', data);

      return {
        data: data.data,
        status: data.status || response.status,
        message: data.message || 'Success',
        success: true
      };
    } catch (error) {
      console.error('❌ Error deleting payment:', error);
      throw new Error(error instanceof Error ? error.message : 'Lỗi khi xóa thanh toán');
    }
  },
};

