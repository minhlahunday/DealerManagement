// Dealer Revenue Interface
export interface DealerRevenue {
  salespersonName: string;
  totalOrders: number;
  totalSales: number;
  firstOrderDate: string;
  lastOrderDate: string;
}

// API Response Interface
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Dealer Revenue Service
class DealerRevenueService {
  private baseURL = '/api/DealerRevenue';

  // Get dealer revenue report
  async getDealerRevenue(): Promise<DealerRevenue[]> {
    try {
      const token = localStorage.getItem('token');
      
      console.log('💰 Fetching dealer revenue report...');
      
      const response = await fetch(this.baseURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('💰 Dealer Revenue API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Dealer Revenue API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<DealerRevenue[]> = await response.json();
      console.log('✅ Dealer revenue report fetched successfully:', result);

      return result.data || [];
    } catch (error) {
      console.error('❌ Error fetching dealer revenue report:', error);
      throw error;
    }
  }

  // Get dealer revenue by ID
  async getDealerRevenueById(id: number): Promise<DealerRevenue> {
    try {
      const token = localStorage.getItem('token');
      
      console.log(`💰 Fetching dealer revenue #${id}...`);
      
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(`💰 Dealer Revenue #${id} API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Dealer Revenue API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<DealerRevenue> = await response.json();
      console.log(`✅ Dealer revenue #${id} fetched successfully:`, result);

      if (!result.data) {
        throw new Error('No dealer revenue data received');
      }

      return result.data;
    } catch (error) {
      console.error(`❌ Error fetching dealer revenue #${id}:`, error);
      throw error;
    }
  }
}

export const dealerRevenueService = new DealerRevenueService();
