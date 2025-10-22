// Delivery Interface
export interface Delivery {
  deliveryId: number;
  userId?: number;
  orderId: number;
  vehicleId?: number;
  deliveryDate: string;
  deliveryAddress?: string;
  deliveryStatus?: string;
  status?: string; // Optional - may be undefined from API
  recipientName?: string;
  recipientPhone?: string;
  notes?: string;
}

// Create Delivery Request Interface
export interface CreateDeliveryRequest {
  deliveryId: number;
  userId: number;
  orderId: number;
  vehicleId: number;
  deliveryDate: string;
  deliveryStatus: string;
  notes: string;
}

// Update Delivery Request Interface
export interface UpdateDeliveryRequest {
  deliveryId: number;
  userId: number;
  orderId: number;
  vehicleId: number;
  deliveryDate: string;
  deliveryStatus: string;
  notes: string;
}

// API Response Interface
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Delivery Service
class DeliveryService {
  private baseURL = '/api/Delivery';

  // Get all deliveries
  async getDeliveries(): Promise<Delivery[]> {
    try {
      const token = localStorage.getItem('token');
      
      console.log('📦 Fetching deliveries...');
      
      const response = await fetch(this.baseURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📦 Delivery API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Delivery API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<Delivery[]> = await response.json();
      console.log('✅ Deliveries fetched successfully:', result);

      return result.data || [];
    } catch (error) {
      console.error('❌ Error fetching deliveries:', error);
      throw error;
    }
  }

  // Get delivery by ID
  async getDeliveryById(id: number): Promise<Delivery> {
    try {
      const token = localStorage.getItem('token');
      
      console.log(`📦 Fetching delivery #${id}...`);
      
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(`📦 Delivery #${id} API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Delivery API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<Delivery> = await response.json();
      console.log(`✅ Delivery #${id} fetched successfully:`, result);

      if (!result.data) {
        throw new Error('No delivery data received');
      }

      return result.data;
    } catch (error) {
      console.error(`❌ Error fetching delivery #${id}:`, error);
      throw error;
    }
  }

  // Create delivery
  async createDelivery(deliveryData: CreateDeliveryRequest): Promise<Delivery> {
    try {
      const token = localStorage.getItem('token');
      
      console.log('🚚 Creating delivery via API...');
      console.log('📤 Delivery Data:', deliveryData);
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(deliveryData)
      });

      console.log('📦 Create Delivery API Response Status:', response.status, response.statusText);
      console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response Body:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          console.error('API Error Details:', errorJson);
          throw new Error(errorJson.message || `HTTP ${response.status}: ${response.statusText}`);
        } catch {
          console.error('❌ Could not parse error response as JSON');
        }

        console.error('Raw Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<Delivery> = await response.json();
      console.log('✅ Delivery created successfully:', result);

      if (!result.data) {
        throw new Error('No delivery data received from API');
      }

      return result.data;
    } catch (error) {
      console.error('❌ Create Delivery API Error:', error);
      throw error;
    }
  }

  // Update delivery
  async updateDelivery(id: number, deliveryData: UpdateDeliveryRequest): Promise<Delivery> {
    try {
      const token = localStorage.getItem('token');
      
      console.log(`🔄 Updating delivery #${id} via API...`);
      console.log('📤 Update Data:', deliveryData);
      
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(deliveryData)
      });

      console.log(`📦 Update Delivery #${id} API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response Body:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<Delivery> = await response.json();
      console.log(`✅ Delivery #${id} updated successfully:`, result);

      if (!result.data) {
        throw new Error('No delivery data received from API');
      }

      return result.data;
    } catch (error) {
      console.error(`❌ Update Delivery #${id} API Error:`, error);
      throw error;
    }
  }

  // Delete delivery
  async deleteDelivery(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      
      console.log(`🗑️ Deleting delivery #${id} via API...`);
      
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(`📦 Delete Delivery #${id} API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response Body:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`✅ Delivery #${id} deleted successfully`);
    } catch (error) {
      console.error(`❌ Delete Delivery #${id} API Error:`, error);
      throw error;
    }
  }
}

export const deliveryService = new DeliveryService();

