// Interfaces
export interface Promotion {
  promotionId: number;
  userId: number;
  promotionCode: string;
  optionName: string;
  optionValue: number;
  startDate: string;
  endDate: string;
}

export interface CreatePromotionRequest {
  promotionId: number;
  userId: number;
  promotionCode: string;
  optionName: string;
  optionValue: number;
  startDate: string;
  endDate: string;
}

export interface UpdatePromotionRequest {
  promotionId: number;
  userId: number;
  promotionCode: string;
  optionName: string;
  optionValue: number;
  startDate: string;
  endDate: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  success?: boolean;
}

// Promotion Service
export const promotionService = {
  // Create promotion
  createPromotion: async (promotionData: CreatePromotionRequest): Promise<ApiResponse<Promotion>> => {
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

      console.log('🔄 Creating promotion with data:', promotionData);
      const response = await fetch('/api/Promotion', {
        method: 'POST',
        headers,
        body: JSON.stringify(promotionData),
      });

      console.log('📡 Create Promotion API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('📡 Create Promotion API Response Data:', data);

      return {
        data: data.data,
        status: data.status || response.status,
        message: data.message || 'Success',
        success: true
      };
    } catch (error) {
      console.error('❌ Error creating promotion:', error);
      throw new Error(error instanceof Error ? error.message : 'Lỗi khi tạo khuyến mãi');
    }
  },

  // Get all promotions
  getPromotions: async (): Promise<ApiResponse<Promotion[]>> => {
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

      console.log('🔍 Fetching promotions from API...');
      const response = await fetch('/api/Promotion', {
        method: 'GET',
        headers,
      });

      console.log('📡 Promotions API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('📡 Promotions API Response Data:', data);

      return {
        data: data.data || [],
        status: data.status || response.status,
        message: data.message || 'Success',
        success: true
      };
    } catch (error) {
      console.error('❌ Error fetching promotions:', error);
      throw new Error(error instanceof Error ? error.message : 'Lỗi khi tải danh sách khuyến mãi');
    }
  },

  // Get promotion by ID
  getPromotionById: async (id: number): Promise<ApiResponse<Promotion>> => {
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

      console.log(`🔍 Fetching promotion by ID: ${id} from API...`);
      const response = await fetch(`/api/Promotion/${id}`, {
        method: 'GET',
        headers,
      });

      console.log(`📡 Promotion ${id} API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('📡 Promotion Detail API Response Data:', data);

      return {
        data: data.data,
        status: data.status || response.status,
        message: data.message || 'Success',
        success: true
      };
    } catch (error) {
      console.error('❌ Error fetching promotion:', error);
      throw new Error(error instanceof Error ? error.message : 'Lỗi khi tải thông tin khuyến mãi');
    }
  },

  // Update promotion
  updatePromotion: async (id: number, promotionData: UpdatePromotionRequest): Promise<ApiResponse<Promotion>> => {
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

      console.log(`🔄 Updating promotion ${id} via API...`, promotionData);
      const response = await fetch(`/api/Promotion/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(promotionData),
      });

      console.log(`📡 Update Promotion ${id} API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('📡 Update Promotion API Response Data:', data);

      return {
        data: data.data,
        status: data.status || response.status,
        message: data.message || 'Success',
        success: true
      };
    } catch (error) {
      console.error('❌ Error updating promotion:', error);
      throw new Error(error instanceof Error ? error.message : 'Lỗi khi cập nhật khuyến mãi');
    }
  },

  // Delete promotion
  deletePromotion: async (id: number): Promise<ApiResponse<null>> => {
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

      console.log(`🗑️ Deleting promotion ${id} via API...`);
      const response = await fetch(`/api/Promotion/${id}`, {
        method: 'DELETE',
        headers,
      });

      console.log(`📡 Delete Promotion ${id} API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('📡 Delete Promotion API Response Data:', data);

      return {
        data: null,
        status: data.status || response.status,
        message: data.message || 'Success',
        success: true
      };
    } catch (error) {
      console.error('❌ Error deleting promotion:', error);
      throw new Error(error instanceof Error ? error.message : 'Lỗi khi xóa khuyến mãi');
    }
  }
};

