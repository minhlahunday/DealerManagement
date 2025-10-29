import { authService } from './authService';

export interface SalesReportItem {
  companyName: string | null;
  address: string;
  totalOrders: number;
  totalSales: number;
  bestSellingModel: string;
  bestSellingType: string;
  bestSellingColor: string;
}

export interface SalesReportResponse {
  data: SalesReportItem[];
  status: number;
  message: string;
}

export const salesReportService = {
  async getSalesReport(fromDate: string, toDate: string): Promise<SalesReportResponse> {
    try {
      console.log('📊 Fetching sales report from API...');
      console.log('📅 Date range:', { fromDate, toDate });
      
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Accept': '*/*',
      };
      
      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
          console.log('✅ Token added to request');
        }
      }

      // Build query parameters
      const params = new URLSearchParams({
        fromDate: fromDate,
        toDate: toDate,
      });

      const response = await fetch(`/api/SalesReport?${params.toString()}`, {
        method: 'GET',
        headers,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('✅ Sales report loaded:', responseData);
      
      return responseData;
    } catch (error) {
      console.error('Failed to fetch sales report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Không thể tải báo cáo doanh số: ${errorMessage}`);
    }
  }
};

