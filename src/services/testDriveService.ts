import { authService } from './authService';

export interface TestDriveAppointment {
  appointmentId: number;
  appointmentDate: string;
  status: string;
  userId: number;
  vehicleId: number;
  username: string;
  vehicleName: string;
}

export interface TestDriveAppointmentResponse {
  success: boolean;
  message: string;
  data: TestDriveAppointment[];
}

export interface CreateTestDriveAppointmentRequest {
  appointmentId: number;
  appointmentDate: string;
  status: string;
  userId: number;
  vehicleId: number;
  username: string;
  vehicleName: string;
}

export interface CreateTestDriveAppointmentResponse {
  success: boolean;
  message: string;
  data?: TestDriveAppointment;
}

export interface TestDriveAppointmentDetailResponse {
  success: boolean;
  message: string;
  data: TestDriveAppointment;
}

export interface UpdateTestDriveAppointmentRequest {
  appointmentId: number;
  appointmentDate: string;
  status: string;
  userId: number;
  vehicleId: number;
  username: string;
  vehicleName: string;
}

export interface UpdateTestDriveAppointmentResponse {
  success: boolean;
  message: string;
  data?: TestDriveAppointment;
}

export interface DeleteTestDriveAppointmentResponse {
  success: boolean;
  message: string;
}

class TestDriveService {
  async getTestDriveAppointments(): Promise<TestDriveAppointmentResponse> {
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

      console.log('🔄 Fetching test drive appointments from API...');
      const response = await fetch('/api/TestDriveAppointment', {
        method: 'GET',
        headers,
      });

      console.log('📡 Test Drive Appointments API Response Status:', response.status, response.statusText);

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

        console.error('❌ Test Drive Appointments API Error:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          url: response.url,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (response.status === 401) {
          console.warn('Authentication failed (401), using empty data as fallback');
          return { 
            success: true, 
            message: `Authentication required. No appointments available.`, 
            data: [] 
          };
        } else if (response.status === 403) {
          console.warn('Authorization failed (403), using empty data as fallback');
          return { 
            success: true, 
            message: `Access denied. No appointments available.`, 
            data: [] 
          };
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Test Drive Appointments API Response:', data);
      console.log('📊 Raw Response Data:', JSON.stringify(data, null, 2));
      
      // Debug username field specifically
      if (data.data && Array.isArray(data.data)) {
        console.log('🔍 Username debug in GET response:');
        data.data.forEach((appointment: TestDriveAppointment, index: number) => {
          console.log(`  Appointment ${index + 1}:`, {
            appointmentId: appointment.appointmentId,
            username: appointment.username,
            usernameType: typeof appointment.username,
            usernameLength: appointment.username ? appointment.username.length : 0
          });
        });
      }

      // Handle different API response formats
      let appointments: TestDriveAppointment[];

      if (data.data && Array.isArray(data.data)) {
        console.log('✅ Test drive appointments loaded from API');
        appointments = data.data.map((appointment: TestDriveAppointment) => ({
          appointmentId: appointment.appointmentId || 0,
          appointmentDate: appointment.appointmentDate || '',
          status: appointment.status || '',
          userId: appointment.userId || 0,
          vehicleId: appointment.vehicleId || 0,
          username: appointment.username || '',
          vehicleName: appointment.vehicleName || '',
        }));
      } else if (Array.isArray(data)) {
        // Direct array response
        appointments = data.map((appointment: TestDriveAppointment) => ({
          appointmentId: appointment.appointmentId || 0,
          appointmentDate: appointment.appointmentDate || '',
          status: appointment.status || '',
          userId: appointment.userId || 0,
          vehicleId: appointment.vehicleId || 0,
          username: appointment.username || '',
          vehicleName: appointment.vehicleName || '',
        }));
      } else {
        console.warn('⚠️ Unexpected API response format, using empty data');
        appointments = [];
      }

      return { 
        success: true, 
        message: data.message || 'Test drive appointments fetched successfully', 
        data: appointments 
      };

    } catch (error) {
      console.error('❌ Failed to fetch test drive appointments:', error);
      console.warn('🔄 Falling back to empty data');
      
      return { 
        success: true, 
        message: `API Error: ${error instanceof Error ? error.message : 'Unknown error'}. No appointments available.`, 
        data: [] 
      };
    }
  }

  async createTestDriveAppointment(appointmentData: CreateTestDriveAppointmentRequest): Promise<CreateTestDriveAppointmentResponse> {
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

      console.log('🔄 Creating test drive appointment via API...', appointmentData);
      console.log('📤 Request body being sent:', JSON.stringify(appointmentData, null, 2));
      const response = await fetch('/api/TestDriveAppointment', {
        method: 'POST',
        headers,
        body: JSON.stringify(appointmentData),
      });

      console.log('📡 Create Test Drive Appointment API Response Status:', response.status, response.statusText);

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

        console.error('❌ Create Test Drive Appointment API Error:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          url: response.url,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (response.status === 401) {
          console.warn('Authentication failed (401), cannot create appointment');
          return { 
            success: false, 
            message: 'Authentication required. Please login with a valid account to create test drive appointments.' 
          };
        } else if (response.status === 403) {
          console.warn('Authorization failed (403), cannot create appointment');
          return { 
            success: false, 
            message: 'Access denied. You do not have permission to create test drive appointments.' 
          };
        } else if (response.status === 400) {
          return { 
            success: false, 
            message: `Invalid data: ${errorMessage}` 
          };
        }
        
        return { 
          success: false, 
          message: errorMessage 
        };
      }

      const data = await response.json();
      console.log('✅ Create Test Drive Appointment API Response:', data);
      console.log('📥 Response data received:', JSON.stringify(data, null, 2));

      return { 
        success: true, 
        message: data.message || 'Test drive appointment created successfully', 
        data: data.data || data
      };

    } catch (error) {
      console.error('❌ Failed to create test drive appointment:', error);
      
      return { 
        success: false, 
        message: `Failed to create test drive appointment: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async getTestDriveAppointmentById(id: string): Promise<TestDriveAppointmentDetailResponse> {
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

      console.log('🔄 Fetching test drive appointment by ID from API...', id);
      console.log('📡 Request URL:', `/api/TestDriveAppointment/${id}`);
      console.log('📡 Request Headers:', headers);
      
      const response = await fetch(`/api/TestDriveAppointment/${id}`, {
        method: 'GET',
        headers,
      });

      console.log('📡 Test Drive Appointment Detail API Response Status:', response.status, response.statusText);
      console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));

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

        console.error('❌ Test Drive Appointment Detail API Error:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          details: errorText,
          url: `/api/TestDriveAppointment/${id}`,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (response.status === 401) {
          console.warn('Authentication failed (401), using empty data as fallback');
          const defaultAppointment: TestDriveAppointment = {
            appointmentId: parseInt(id),
            appointmentDate: '',
            status: 'UNKNOWN',
            userId: 0,
            vehicleId: 0,
            username: 'Unknown',
            vehicleName: 'Unknown Vehicle'
          };
          return { 
            success: true, 
            message: `Authentication required. Using default data.`, 
            data: defaultAppointment 
          };
        } else if (response.status === 403) {
          console.warn('Authorization failed (403), using empty data as fallback');
          const defaultAppointment: TestDriveAppointment = {
            appointmentId: parseInt(id),
            appointmentDate: '',
            status: 'UNKNOWN',
            userId: 0,
            vehicleId: 0,
            username: 'Unknown',
            vehicleName: 'Unknown Vehicle'
          };
          return { 
            success: true, 
            message: `Access denied. Using default data.`, 
            data: defaultAppointment 
          };
        } else if (response.status === 404) {
          console.warn('Test drive appointment not found (404), using default data as fallback');
          const defaultAppointment: TestDriveAppointment = {
            appointmentId: parseInt(id),
            appointmentDate: '',
            status: 'NOT_FOUND',
            userId: 0,
            vehicleId: 0,
            username: 'Unknown',
            vehicleName: 'Unknown Vehicle'
          };
          return { 
            success: true, 
            message: `Test drive appointment not found. Using default data.`, 
            data: defaultAppointment 
          };
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Test Drive Appointment Detail API Response:', data);
      console.log('📊 Raw Detail Response Data:', JSON.stringify(data, null, 2));

      // Handle different API response formats
      let appointment: TestDriveAppointment;

      if (data.data) {
        console.log('✅ Test drive appointment loaded from API');
        appointment = {
          appointmentId: data.data.appointmentId || parseInt(id),
          appointmentDate: data.data.appointmentDate || '',
          status: data.data.status || '',
          userId: data.data.userId || 0,
          vehicleId: data.data.vehicleId || 0,
          username: data.data.username || '',
          vehicleName: data.data.vehicleName || '',
        };
      } else {
        // Direct appointment object
        appointment = {
          appointmentId: data.appointmentId || parseInt(id),
          appointmentDate: data.appointmentDate || '',
          status: data.status || '',
          userId: data.userId || 0,
          vehicleId: data.vehicleId || 0,
          username: data.username || '',
          vehicleName: data.vehicleName || '',
        };
      }

      return { 
        success: true, 
        message: data.message || 'Test drive appointment fetched successfully', 
        data: appointment 
      };

    } catch (error) {
      console.error('❌ Failed to fetch test drive appointment:', error);
      console.warn('🔄 Falling back to default data');
      
      const defaultAppointment: TestDriveAppointment = {
        appointmentId: parseInt(id),
        appointmentDate: '',
        status: 'ERROR',
        userId: 0,
        vehicleId: 0,
        username: 'Unknown',
        vehicleName: 'Unknown Vehicle'
      };
      
      return { 
        success: true, 
        message: `API Error: ${error instanceof Error ? error.message : 'Unknown error'}. Using default data.`, 
        data: defaultAppointment 
      };
    }
  }

  async updateTestDriveAppointment(id: string, appointmentData: UpdateTestDriveAppointmentRequest): Promise<UpdateTestDriveAppointmentResponse> {
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

      console.log('🔄 Updating test drive appointment via API...', id);
      console.log('📡 Request URL:', `/api/TestDriveAppointment/${id}`);
      console.log('📡 Request Headers:', headers);
      console.log('📡 Request Body:', appointmentData);
      console.log('📤 PUT Request body being sent:', JSON.stringify(appointmentData, null, 2));
      
      const response = await fetch(`/api/TestDriveAppointment/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(appointmentData),
      });

      console.log('📡 Update Test Drive Appointment API Response Status:', response.status, response.statusText);
      console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));

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

        console.error('❌ Update Test Drive Appointment API Error:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          details: errorText,
          url: `/api/TestDriveAppointment/${id}`,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (response.status === 401) {
          console.warn('Authentication failed (401), cannot update appointment');
          return { 
            success: false, 
            message: 'Authentication required. Please login with a valid account to update test drive appointments.' 
          };
        } else if (response.status === 403) {
          console.warn('Authorization failed (403), cannot update appointment');
          return { 
            success: false, 
            message: 'Access denied. You do not have permission to update test drive appointments.' 
          };
        } else if (response.status === 400) {
          return { 
            success: false, 
            message: `Invalid data: ${errorMessage}` 
          };
        } else if (response.status === 404) {
          return { 
            success: false, 
            message: 'Test drive appointment not found.' 
          };
        }
        
        return { 
          success: false, 
          message: errorMessage 
        };
      }

      const data = await response.json();
      console.log('✅ Update Test Drive Appointment API Response:', data);
      console.log('📊 Raw Update Response Data:', JSON.stringify(data, null, 2));
      console.log('📥 PUT Response data received:', JSON.stringify(data, null, 2));

      // Handle different API response formats
      let updatedAppointment: TestDriveAppointment;

      if (data.data) {
        console.log('✅ Test drive appointment updated from API');
        updatedAppointment = {
          appointmentId: data.data.appointmentId || parseInt(id),
          appointmentDate: data.data.appointmentDate || '',
          status: data.data.status || '',
          userId: data.data.userId || 0,
          vehicleId: data.data.vehicleId || 0,
          username: data.data.username || '',
          vehicleName: data.data.vehicleName || '',
        };
      } else {
        // Direct appointment object
        updatedAppointment = {
          appointmentId: data.appointmentId || parseInt(id),
          appointmentDate: data.appointmentDate || '',
          status: data.status || '',
          userId: data.userId || 0,
          vehicleId: data.vehicleId || 0,
          username: data.username || '',
          vehicleName: data.vehicleName || '',
        };
      }

      return { 
        success: true, 
        message: data.message || 'Test drive appointment updated successfully', 
        data: updatedAppointment 
      };

    } catch (error) {
      console.error('❌ Failed to update test drive appointment:', error);
      
      return { 
        success: false, 
        message: `Failed to update test drive appointment: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async deleteTestDriveAppointment(id: string): Promise<DeleteTestDriveAppointmentResponse> {
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

      console.log('🗑️ Deleting test drive appointment via API...', id);
      console.log('📡 Request URL:', `/api/TestDriveAppointment/${id}`);
      console.log('📡 Request Headers:', headers);
      
      const response = await fetch(`/api/TestDriveAppointment/${id}`, {
        method: 'DELETE',
        headers,
      });

      console.log('📡 Delete Test Drive Appointment API Response Status:', response.status, response.statusText);
      console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));

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

        console.error('❌ Delete Test Drive Appointment API Error:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          details: errorText,
          url: `/api/TestDriveAppointment/${id}`,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (response.status === 401) {
          console.warn('Authentication failed (401), cannot delete appointment');
          return { 
            success: false, 
            message: 'Authentication required. Please login with a valid account to delete test drive appointments.' 
          };
        } else if (response.status === 403) {
          console.warn('Authorization failed (403), cannot delete appointment');
          return { 
            success: false, 
            message: 'Access denied. You do not have permission to delete test drive appointments.' 
          };
        } else if (response.status === 404) {
          return { 
            success: false, 
            message: 'Test drive appointment not found.' 
          };
        }
        
        return { 
          success: false, 
          message: errorMessage 
        };
      }

      const data = await response.json();
      console.log('✅ Delete Test Drive Appointment API Response:', data);
      console.log('📊 Raw Delete Response Data:', JSON.stringify(data, null, 2));

      return { 
        success: true, 
        message: data.message || 'Test drive appointment deleted successfully'
      };

    } catch (error) {
      console.error('❌ Failed to delete test drive appointment:', error);
      
      return { 
        success: false, 
        message: `Failed to delete test drive appointment: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

export const testDriveService = new TestDriveService();
