// Debt Report Interface
export interface DebtReport {
  customerOrDealerName: string;
  totalOrderAmount: number;
  totalPaid: number;
  outstandingDebt: number;
}

// API Response Interface
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Debt Report Service
class DebtReportService {
  private baseURL = '/api/DebtReport';

  // Get dealers debt report
  async getDealersDebtReport(): Promise<DebtReport[]> {
    try {
      const token = localStorage.getItem('token');
      
      console.log('💰 Fetching dealers debt report...');
      
      const response = await fetch(`${this.baseURL}/Dealers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('💰 Dealers Debt Report API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Dealers Debt Report API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<DebtReport[]> = await response.json();
      console.log('✅ Dealers debt report fetched successfully:', result);

      return result.data || [];
    } catch (error) {
      console.error('❌ Error fetching dealers debt report:', error);
      throw error;
    }
  }

  // Get customers debt report
  async getCustomersDebtReport(): Promise<DebtReport[]> {
    try {
      const token = localStorage.getItem('token');
      
      console.log('💰 Fetching customers debt report...');
      
      const response = await fetch(`${this.baseURL}/Customers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('💰 Customers Debt Report API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Customers Debt Report API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<DebtReport[]> = await response.json();
      console.log('✅ Customers debt report fetched successfully:', result);

      return result.data || [];
    } catch (error) {
      console.error('❌ Error fetching customers debt report:', error);
      throw error;
    }
  }
}

export const debtReportService = new DebtReportService();

