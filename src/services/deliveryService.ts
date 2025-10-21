// Delivery Interface
export interface Delivery {
  deliveryId: number;
  orderId: number;
  deliveryDate: string;
  deliveryAddress: string;
  status: string;
  recipientName: string;
  recipientPhone: string;
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
}

export const deliveryService = new DeliveryService();

