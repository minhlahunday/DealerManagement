// Dealer Order Service - Handles API calls for dealer orders

export interface DealerOrder {
  dealerOrderId: number;
  userId: number;
  vehicleId: number;
  quantity: number;
  color: string | null;
  orderDate: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Dealer Order Service
class DealerOrderService {
  private baseURL = '/api/DealerOrder';

  // Get all dealer orders
  async getDealerOrders(): Promise<DealerOrder[]> {
    try {
      const token = localStorage.getItem('token');
      
      console.log('📦 Fetching dealer orders...');
      
      const response = await fetch(this.baseURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📦 Dealer Order API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Dealer Order API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<DealerOrder[]> = await response.json();
      console.log('✅ Dealer orders fetched successfully:', result);

      return result.data || [];
    } catch (error) {
      console.error('❌ Error fetching dealer orders:', error);
      throw error;
    }
  }

  // Get dealer order by ID
  async getDealerOrderById(id: number): Promise<DealerOrder> {
    try {
      const token = localStorage.getItem('token');
      
      console.log(`📦 Fetching dealer order #${id}...`);
      
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(`📦 Dealer Order #${id} API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Dealer Order API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<DealerOrder> = await response.json();
      console.log(`✅ Dealer order #${id} fetched successfully:`, result);

      if (!result.data) {
        throw new Error('No dealer order data received');
      }

      return result.data;
    } catch (error) {
      console.error(`❌ Error fetching dealer order #${id}:`, error);
      throw error;
    }
  }

  // Create new dealer order
  async createDealerOrder(orderData: Omit<DealerOrder, 'dealerOrderId'>): Promise<DealerOrder> {
    try {
      const token = localStorage.getItem('token');
      
      console.log('📦 Creating new dealer order...', orderData);
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dealerOrderId: 0,
          ...orderData
        })
      });

      console.log('📦 Create Dealer Order API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Create Dealer Order API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<DealerOrder> = await response.json();
      console.log('✅ Dealer order created successfully:', result);

      if (!result.data) {
        throw new Error('No dealer order data received');
      }

      return result.data;
    } catch (error) {
      console.error('❌ Error creating dealer order:', error);
      throw error;
    }
  }

  // Update dealer order
  async updateDealerOrder(id: number, orderData: DealerOrder): Promise<DealerOrder> {
    try {
      const token = localStorage.getItem('token');
      
      console.log(`📦 Updating dealer order #${id}...`, orderData);
      
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      console.log(`📦 Update Dealer Order #${id} API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Update Dealer Order API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<DealerOrder> = await response.json();
      console.log(`✅ Dealer order #${id} updated successfully:`, result);

      if (!result.data) {
        throw new Error('No dealer order data received');
      }

      return result.data;
    } catch (error) {
      console.error(`❌ Error updating dealer order #${id}:`, error);
      throw error;
    }
  }

  // Delete dealer order
  async deleteDealerOrder(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      
      console.log(`📦 Deleting dealer order #${id}...`);
      
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(`📦 Delete Dealer Order #${id} API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Delete Dealer Order API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`✅ Dealer order #${id} deleted successfully`);
    } catch (error) {
      console.error(`❌ Error deleting dealer order #${id}:`, error);
      throw error;
    }
  }
}

export const dealerOrderService = new DealerOrderService();

