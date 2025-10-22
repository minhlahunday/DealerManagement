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

  // Get dealer revenue report (only "approved" orders - backend auto-filters)
  async getDealerRevenue(): Promise<DealerRevenue[]> {
    try {
      const token = localStorage.getItem('token');
      
      console.log('💰 Fetching dealer revenue report...');
      console.log('✅ NOTE: Backend automatically filters to show only "approved" orders');
      
      // Backend already filters for "approved" orders, no query parameter needed
      const url = `${this.baseURL}`;
      console.log('📤 Request URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('💰 Dealer Revenue API Response Status:', response.status, response.statusText);

      // Handle 404 as empty list (backend returns 404 when no revenue reports exist)
      if (response.status === 404) {
        try {
          const errorData = await response.json();
          console.log('ℹ️ No dealer revenue reports found (404):', errorData.message || 'Empty list');
          return []; // Return empty array for empty state
        } catch {
          console.log('ℹ️ No dealer revenue reports found (404)');
          return []; // Return empty array for empty state
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Dealer Revenue API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<DealerRevenue[]> = await response.json();
      console.log('✅ Dealer revenue report fetched successfully ("approved" orders only):', result);

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
