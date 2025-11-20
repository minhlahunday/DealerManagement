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
          console.error('Authentication failed (401) - Invalid or missing token');
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Redirect to login page
          window.location.href = '/';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (response.status === 403) {
          console.error('Authorization failed (403) - Insufficient permissions');
          throw new Error('Truy cập bị từ chối. Bạn không có quyền truy cập tài nguyên này.');
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
        message: data.message || 'Lấy danh sách báo cáo thành công'
      };

    } catch (error) {
      console.error('❌ Failed to fetch reports:', error);
      
      // Log detailed error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('API call failed:', errorMessage);
      
      // Throw error instead of returning empty data
      throw new Error(`Không thể lấy danh sách báo cáo: ${errorMessage}`);
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

      console.log(`🔄 Updating report ${id} via API...`);
      console.log('📤 Request Data (camelCase):', reportData);
      
      // Backend expects direct object (no 'dto' wrapper) with camelCase property names
      // dates must be in YYYY-MM-DD format (DateOnly type)
      // orderId can be null if no order is associated with this report
      const requestBody = {
        reportId: reportData.reportId,
        senderName: reportData.senderName,
        userId: reportData.userId,
        orderId: reportData.orderId && reportData.orderId > 0 ? reportData.orderId : null,  // null if invalid
        reportType: reportData.reportType,
        createdDate: reportData.createdDate,  // Already formatted as YYYY-MM-DD
        resolvedDate: reportData.resolvedDate || null,  // Can be null
        content: reportData.content,
        status: reportData.status
      };
      console.log('📋 Request Body (JSON):', JSON.stringify(requestBody, null, 2));
      console.log('🔑 Headers:', headers);
      
      const response = await fetch(`/api/Report/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(requestBody),
      });

      console.log(`📡 Update Report ${id} API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response Body:', errorText);
        
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorDetails = '';
        
        try {
          const errorData = JSON.parse(errorText);
          console.error('❌ Parsed Error Data:', errorData);
          
          // Extract detailed error message from various .NET error formats
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.title) {
            errorMessage = errorData.title;
          } else if (errorData.errors) {
            // ASP.NET Core validation errors
            const validationErrors = Object.entries(errorData.errors)
              .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
              .join('; ');
            errorDetails = validationErrors;
            errorMessage = `Validation Error: ${validationErrors}`;
          }
          
          console.error('❌ Error Message:', errorMessage);
          console.error('❌ Error Details:', errorDetails);
        } catch (parseError) {
          console.error('Raw Error Response (not JSON):', errorText);
          // Try to extract meaningful info from HTML error pages
          if (errorText.includes('Exception')) {
            const exceptionMatch = errorText.match(/Exception: (.+?)<br>/);
            if (exceptionMatch) {
              errorMessage = exceptionMatch[1];
            }
          }
        }

        if (response.status === 401) {
          console.error('Authentication failed (401) - Invalid or missing token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (response.status === 403) {
          console.error('Authorization failed (403) - Insufficient permissions');
          throw new Error('Truy cập bị từ chối. Bạn không có quyền truy cập tài nguyên này.');
        } else if (response.status === 404) {
          throw new Error('Không tìm thấy báo cáo với ID này.');
        }

        throw new Error(`Cập nhật báo cáo thất bại: ${errorMessage}`);
      }

      const responseData = await response.json();
      console.log(`📡 Update Report ${id} API Response Data:`, responseData);

      if (responseData.success || response.status === 200 || response.status === 204) {
        console.log(`✅ Report ${id} updated successfully`);
        return responseData.data || responseData;
      } else {
        console.error('❌ API returned success=false:', responseData);
        throw new Error(responseData.message || 'Cập nhật báo cáo thất bại');
      }

    } catch (error) {
      console.error(`❌ Update Report ${id} API Error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new Error(`Cập nhật báo cáo thất bại: ${errorMessage}`);
    }
  }

  async deleteReport(id: number): Promise<boolean> {
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

      console.log(`🗑️ Deleting report ${id} via API...`);
      const response = await fetch(`/api/Report/${id}`, {
        method: 'DELETE',
        headers,
      });

      console.log(`📡 Delete Report ${id} API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response Body:', errorText);
        
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorMessage;
          console.error('API Error Details:', errorData);
        } catch {
          console.error('Raw Error Response:', errorText);
        }

        if (response.status === 401) {
          console.error('Authentication failed (401) - Invalid or missing token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (response.status === 403) {
          console.error('Authorization failed (403) - Insufficient permissions');
          throw new Error('Truy cập bị từ chối. Bạn không có quyền truy cập tài nguyên này.');
        } else if (response.status === 404) {
          throw new Error('Không tìm thấy báo cáo với ID này.');
        }

        throw new Error(`Xóa báo cáo thất bại: ${errorMessage}`);
      }

      // For DELETE requests, response might be empty
      let responseData = null;
      try {
        const responseText = await response.text();
        if (responseText) {
          responseData = JSON.parse(responseText);
          console.log(`📡 Delete Report ${id} API Response Data:`, responseData);
        }
      } catch {
        console.log('No response body for DELETE request');
      }

      if (response.status === 200 || response.status === 204 || (responseData && responseData.success)) {
        console.log(`✅ Report ${id} deleted successfully`);
        return true;
      } else {
        console.error('❌ Delete operation failed:', responseData);
        throw new Error(responseData?.message || 'Xóa báo cáo thất bại');
      }

    } catch (error) {
      console.error(`❌ Delete Report ${id} API Error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new Error(`Xóa báo cáo thất bại: ${errorMessage}`);
    }
  }
}

export const reportService = new ReportService();
