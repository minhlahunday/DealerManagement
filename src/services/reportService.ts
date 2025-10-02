import { authService } from './authService';

export interface Report {
  reportId: number;
  senderName: string;
  userId: number;
  orderId: number;
  reportType: string;
  createdDate: string;
  resolvedDate?: string;
  content: string;
  status: string;
}

export interface CreateReportRequest {
  reportId: number;
  senderName: string;
  userId: number;
  orderId: number;
  reportType: string;
  createdDate: string;
  resolvedDate?: string;
  content: string;
  status: string;
}

export interface UpdateReportRequest {
  reportId: number;
  senderName: string;
  userId: number;
  orderId: number;
  reportType: string;
  createdDate: string;
  resolvedDate?: string;
  content: string;
  status: string;
}

export interface ReportResponse {
  data: Report[];
  status: number;
  message: string;
}

class ReportService {
  async getReports(): Promise<ReportResponse> {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add token if available and valid
      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;

          if (token.startsWith('mock-token-')) {
            console.log('⚠️ Mock token added to request (will be rejected by backend)');
          } else {
            console.log('✅ Valid JWT token added to request');
            const tokenInfo = authService.getTokenInfo(token);
            if (tokenInfo) { 
              console.log('Token info:', tokenInfo); 
            }
          }
        } else {
          console.warn('⚠️ Invalid/expired token, proceeding without authentication');
        }
      } else {
        console.warn('No token found in localStorage');
      }

      console.log('🔄 Fetching reports from API...');
      const response = await fetch('/api/Report', {
        method: 'GET',
        headers,
      });

      console.log('📡 Reports API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorMessage;
          console.error('API Error Details:', errorData);
        } catch {
          console.error('Raw Error Response:', errorText);
        }

        console.error('❌ Reports API Error:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          url: response.url,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (response.status === 401) {
          console.warn('Authentication failed (401), using empty data as fallback');
          return { 
            data: [], 
            status: 200, 
            message: 'Authentication required. No reports available.' 
          };
        } else if (response.status === 403) {
          console.warn('Authorization failed (403), using empty data as fallback');
          return { 
            data: [], 
            status: 200, 
            message: 'Access denied. No reports available.' 
          };
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Reports API Response:', data);
      console.log('📊 Raw Response Data:', JSON.stringify(data, null, 2));
      
      // Debug reports data specifically
      if (data.data && Array.isArray(data.data)) {
        console.log('🔍 Reports debug in GET response:');
        data.data.forEach((report: Record<string, unknown>, index: number) => {
          console.log(`  Report ${index + 1}:`, {
            reportId: report.reportId,
            senderName: report.senderName,
            reportType: report.reportType,
            status: report.status,
            createdDate: report.createdDate,
            resolvedDate: report.resolvedDate,
            content: report.content,
            userId: report.userId,
            orderId: report.orderId
          });
        });
      }

      // Map API response to Report interface
      let reports: Report[] = [];
      if (data.data && Array.isArray(data.data)) {
        reports = data.data.map((report: Record<string, unknown>) => ({
          reportId: Number(report.reportId) || 0,
          senderName: String(report.senderName) || '',
          userId: Number(report.userId) || 0,
          orderId: Number(report.orderId) || 0,
          reportType: String(report.reportType) || '',
          createdDate: String(report.createdDate) || '',
          resolvedDate: String(report.resolvedDate) || '',
          content: String(report.content) || '',
          status: String(report.status) || ''
        }));
        console.log('✅ Reports mapped from API:', reports.length);
      }

      return {
        data: reports,
        status: data.status || 200,
        message: data.message || 'Reports fetched successfully'
      };

    } catch (error) {
      console.error('❌ Failed to fetch reports:', error);
      
      return { 
        data: [], 
        status: 500, 
        message: `Failed to fetch reports: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async getReportById(id: number): Promise<Report | null> {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      console.log(`🔍 Fetching report ${id} from API...`);
      const response = await fetch(`/api/Report/${id}`, {
        method: 'GET',
        headers,
      });

      console.log(`📡 Report ${id} API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch {
          console.error('Raw Error Response:', errorText);
        }

        console.error(`❌ Report ${id} API Error:`, errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`✅ Report ${id} API Response:`, data);
      
      return data;

    } catch (error) {
      console.error(`❌ Failed to fetch report ${id}:`, error);
      return null;
    }
  }

  async createReport(reportData: CreateReportRequest): Promise<Report | null> {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      console.log('📤 Creating new report:', JSON.stringify(reportData, null, 2));
      
      const response = await fetch('/api/Report', {
        method: 'POST',
        headers,
        body: JSON.stringify(reportData),
      });

      console.log('📡 Create Report API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch {
          console.error('Raw Error Response:', errorText);
        }

        console.error('❌ Create Report API Error:', errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Create Report API Response:', data);
      
      return data;

    } catch (error) {
      console.error('❌ Failed to create report:', error);
      return null;
    }
  }

  async updateReport(id: number, reportData: UpdateReportRequest): Promise<Report | null> {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      console.log(`📤 Updating report ${id}:`, JSON.stringify(reportData, null, 2));
      
      const response = await fetch(`/api/Report/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(reportData),
      });

      console.log(`📡 Update Report ${id} API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch {
          console.error('Raw Error Response:', errorText);
        }

        console.error(`❌ Update Report ${id} API Error:`, errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`✅ Update Report ${id} API Response:`, data);
      
      return data;

    } catch (error) {
      console.error(`❌ Failed to update report ${id}:`, error);
      return null;
    }
  }

  async deleteReport(id: number): Promise<boolean> {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      console.log(`🗑️ Deleting report ${id}...`);
      
      const response = await fetch(`/api/Report/${id}`, {
        method: 'DELETE',
        headers,
      });

      console.log(`📡 Delete Report ${id} API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch {
          console.error('Raw Error Response:', errorText);
        }

        console.error(`❌ Delete Report ${id} API Error:`, errorMessage);
        throw new Error(errorMessage);
      }

      console.log(`✅ Report ${id} deleted successfully`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to delete report ${id}:`, error);
      return false;
    }
  }
}

export const reportService = new ReportService();
