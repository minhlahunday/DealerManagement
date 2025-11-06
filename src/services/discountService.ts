// Interfaces
export interface Discount {
  discountId: number;
  userId: number;
  discountCode: string;
  discountName: string;
  discountType: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  status: string;
}

export interface CreateDiscountRequest {
  discountId: number;
  userId: number;
  discountCode: string;
  discountName: string;
  discountType: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  status: string;
}

export interface UpdateDiscountRequest {
  discountId: number;
  userId: number;
  discountCode: string;
  discountName: string;
  discountType: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  status: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  success?: boolean;
}

// Discount Service
export const discountService = {
  // Get all discounts
  getDiscounts: async (): Promise<ApiResponse<Discount[]>> => {
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

      console.log('🔍 Fetching discounts from API...');
      const response = await fetch('/api/Discount', {
        method: 'GET',
        headers,
      });

      console.log('📡 Discounts API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('📡 Discounts API Response Data:', data);
      console.log('📡 Type of data:', typeof data);
      console.log('📡 Is array?', Array.isArray(data));

      // Handle different response formats:
      // 1. If data is directly an array
      // 2. If data is an object with a data property containing the array
      // 3. If data is an object with a data property that is an array
      let discounts: Discount[] = [];
      
      if (Array.isArray(data)) {
        // API returned array directly
        discounts = data;
        console.log('✅ API returned array directly, length:', discounts.length);
      } else if (data && typeof data === 'object') {
        // API returned object, check for data property
        if (Array.isArray(data.data)) {
          discounts = data.data;
          console.log('✅ Found discounts in data.data, length:', discounts.length);
        } else if (Array.isArray(data.discounts)) {
          discounts = data.discounts;
          console.log('✅ Found discounts in data.discounts, length:', discounts.length);
        } else {
          console.warn('⚠️ No array found in response, keys:', Object.keys(data));
        }
      }

      return {
        data: discounts,
        status: (data && typeof data === 'object' && !Array.isArray(data) ? data.status : undefined) || response.status,
        message: (data && typeof data === 'object' && !Array.isArray(data) ? data.message : undefined) || 'Success',
        success: true
      };
    } catch (error) {
      console.error('❌ Error fetching discounts:', error);
      throw new Error(error instanceof Error ? error.message : 'Lỗi khi tải danh sách giảm giá');
    }
  },

  // Create discount
  createDiscount: async (discountData: CreateDiscountRequest): Promise<ApiResponse<Discount>> => {
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

      console.log('🔄 Creating discount with data:', discountData);
      const response = await fetch('/api/Discount', {
        method: 'POST',
        headers,
        body: JSON.stringify(discountData),
      });

      console.log('📡 Create Discount API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('📡 Create Discount API Response Data:', data);

      return {
        data: data.data,
        status: data.status || response.status,
        message: data.message || 'Success',
        success: true
      };
    } catch (error) {
      console.error('❌ Error creating discount:', error);
      throw new Error(error instanceof Error ? error.message : 'Lỗi khi tạo giảm giá');
    }
  },

  // Get discount by ID
  getDiscountById: async (id: number): Promise<ApiResponse<Discount>> => {
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

      console.log(`🔍 Fetching discount by ID: ${id} from API...`);
      const response = await fetch(`/api/Discount/${id}`, {
        method: 'GET',
        headers,
      });

      console.log(`📡 Discount ${id} API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('📡 Discount Detail API Response Data:', data);

      // Handle different response formats
      let discount: Discount | null = null;
      
      if (data && typeof data === 'object') {
        if (data.discountId) {
          // Direct discount object
          discount = data;
        } else if (data.data && data.data.discountId) {
          // Wrapped in data property
          discount = data.data;
        }
      }

      if (!discount) {
        throw new Error('Discount not found in response');
      }

      return {
        data: discount,
        status: (data && typeof data === 'object' && data.status ? data.status : undefined) || response.status,
        message: (data && typeof data === 'object' && data.message ? data.message : undefined) || 'Success',
        success: true
      };
    } catch (error) {
      console.error('❌ Error fetching discount:', error);
      throw new Error(error instanceof Error ? error.message : 'Lỗi khi tải thông tin giảm giá');
    }
  },

  // Update discount
  updateDiscount: async (id: number, discountData: UpdateDiscountRequest): Promise<ApiResponse<Discount>> => {
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

      console.log(`🔄 Updating discount ${id} via API...`, discountData);
      const response = await fetch(`/api/Discount/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(discountData),
      });

      console.log(`📡 Update Discount ${id} API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('📡 Update Discount API Response Data:', data);

      // Handle different response formats
      let discount: Discount | null = null;
      
      if (data && typeof data === 'object') {
        if (data.discountId) {
          // Direct discount object
          discount = data;
        } else if (data.data && data.data.discountId) {
          // Wrapped in data property
          discount = data.data;
        }
      }

      if (!discount) {
        throw new Error('Updated discount not found in response');
      }

      return {
        data: discount,
        status: (data && typeof data === 'object' && data.status ? data.status : undefined) || response.status,
        message: (data && typeof data === 'object' && data.message ? data.message : undefined) || 'Success',
        success: true
      };
    } catch (error) {
      console.error('❌ Error updating discount:', error);
      throw new Error(error instanceof Error ? error.message : 'Lỗi khi cập nhật giảm giá');
    }
  },

  // Delete discount
  deleteDiscount: async (id: number): Promise<ApiResponse<null>> => {
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

      console.log(`🗑️ Deleting discount ${id} via API...`);
      const response = await fetch(`/api/Discount/${id}`, {
        method: 'DELETE',
        headers,
      });

      console.log(`📡 Delete Discount ${id} API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // L'API peut retourner du texte brut ou du JSON
      const responseText = await response.text();
      console.log('📡 Delete Discount API Response Text:', responseText);

      let data: any = null;
      let message = 'Deleted successfully';

      // Essayer de parser comme JSON
      try {
        data = JSON.parse(responseText);
        console.log('📡 Delete Discount API Response Data (JSON):', data);
        message = (data && typeof data === 'object' && data.message ? data.message : undefined) || message;
      } catch (jsonError) {
        // Si ce n'est pas du JSON, traiter comme texte brut
        console.log('📡 Response is plain text, not JSON');
        message = responseText || 'Deleted successfully';
      }

      return {
        data: null,
        status: (data && typeof data === 'object' && data.status ? data.status : undefined) || response.status,
        message: message,
        success: true
      };
    } catch (error) {
      console.error('❌ Error deleting discount:', error);
      throw new Error(error instanceof Error ? error.message : 'Lỗi khi xóa giảm giá');
    }
  },

  // Apply discount to vehicle
  applyDiscountToVehicle: async (vehicleId: number, discountId: number): Promise<ApiResponse<any>> => {
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

      console.log(`🎯 Applying discount ${discountId} to vehicle ${vehicleId}...`);
      const response = await fetch(`/api/Discount/apply?vehicleId=${vehicleId}&discountId=${discountId}`, {
        method: 'POST',
        headers,
      });

      console.log(`📡 Apply Discount API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // L'API peut retourner du texte brut ou du JSON
      const responseText = await response.text();
      console.log('📡 Apply Discount API Response Text:', responseText);

      let data: any = null;
      let message = 'Discount applied successfully';

      // Essayer de parser comme JSON
      try {
        data = JSON.parse(responseText);
        console.log('📡 Apply Discount API Response Data (JSON):', data);
        message = (data && typeof data === 'object' && data.message ? data.message : undefined) || message;
      } catch (jsonError) {
        // Si ce n'est pas du JSON, traiter comme texte brut
        console.log('📡 Response is plain text, not JSON');
        message = responseText || 'Discount applied successfully';
      }

      return {
        data: data,
        status: (data && typeof data === 'object' && data.status ? data.status : undefined) || response.status,
        message: message,
        success: true
      };
    } catch (error) {
      console.error('❌ Error applying discount:', error);
      throw new Error(error instanceof Error ? error.message : 'Lỗi khi áp dụng giảm giá');
    }
  },

  // Remove discount from vehicle
  removeDiscountFromVehicle: async (vehicleId: number): Promise<ApiResponse<any>> => {
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

      console.log(`🗑️ Removing discount from vehicle ${vehicleId}...`);
      const response = await fetch(`/api/Discount/remove?vehicleId=${vehicleId}`, {
        method: 'POST',
        headers,
      });

      console.log(`📡 Remove Discount API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // L'API peut retourner du texte brut ou du JSON
      const responseText = await response.text();
      console.log('📡 Remove Discount API Response Text:', responseText);

      let data: any = null;
      let message = 'Discount removed successfully';

      // Essayer de parser comme JSON
      try {
        data = JSON.parse(responseText);
        console.log('📡 Remove Discount API Response Data (JSON):', data);
        message = (data && typeof data === 'object' && data.message ? data.message : undefined) || message;
      } catch (jsonError) {
        // Si ce n'est pas du JSON, traiter comme texte brut
        console.log('📡 Response is plain text, not JSON');
        message = responseText || 'Discount removed successfully';
      }

      return {
        data: data,
        status: (data && typeof data === 'object' && data.status ? data.status : undefined) || response.status,
        message: message,
        success: true
      };
    } catch (error) {
      console.error('❌ Error removing discount:', error);
      throw new Error(error instanceof Error ? error.message : 'Lỗi khi gỡ giảm giá');
    }
  }
};

