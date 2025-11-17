import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { mockVehicles } from '../../../data/mockData';
import { Vehicle } from '../../../types';
import { vehicleService } from '../../../services/vehicleService';
import { testDriveService, CreateTestDriveAppointmentRequest } from '../../../services/testDriveService';
import { useAuth } from '../../../contexts/AuthContext';

export const TestDrive: React.FC = () => {
  const navigate = useNavigate();
  const { checkToken } = useAuth();
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get('vehicleId');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // API states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    appointmentDate: '',
    status: 'PENDING',
    userId: 0, 
    vehicleId: 0,
    address: '',
    username: '',
    vehicleName: ''
  });


  // Fetch vehicle details from API
  const fetchVehicle = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching vehicle details for ID:', id);
      const response = await vehicleService.getVehicleById(id);
      console.log('📡 Vehicle API Response:', response);

      if (response.success && response.data) {
        console.log('✅ Vehicle loaded from API:', response.data);
        setSelectedVehicle(response.data);
        // Set vehicle data in form
        setFormData(prev => ({
          ...prev,
          vehicleId: parseInt(response.data.id),
          vehicleName: response.data.model
        }));
      } else {
        console.log('⚠️ No vehicle from API, using mock data');
        const mockVehicle = mockVehicles.find(v => v.id === id);
        if (mockVehicle) {
          setSelectedVehicle(mockVehicle);
          // Set vehicle data in form
          setFormData(prev => ({
            ...prev,
            vehicleId: parseInt(mockVehicle.id),
            vehicleName: mockVehicle.model
          }));
        }
      }
    } catch (error) {
      console.error('❌ Failed to fetch vehicle:', error);
      setError(error instanceof Error ? error.message : 'Lỗi khi tải thông tin xe');
      // Fallback to mock data
      const mockVehicle = mockVehicles.find(v => v.id === id);
      if (mockVehicle) {
        setSelectedVehicle(mockVehicle);
        // Set vehicle data in form
        setFormData(prev => ({
          ...prev,
          vehicleId: parseInt(mockVehicle.id),
          vehicleName: mockVehicle.model
        }));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Check token on mount
  useEffect(() => {
    console.log('=== TestDrive Component Mounted ===');
    checkToken();
  }, [checkToken]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (vehicleId) {
      fetchVehicle(vehicleId);
    }
  }, [vehicleId, fetchVehicle]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // If updating userId, store it as a number (or 0 when empty)
    if (name === 'userId') {
      const numeric = value === '' ? 0 : Number(value);
      setFormData(prev => ({ ...prev, [name]: numeric }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate form - only validate fields that exist in API
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Vui lòng nhập tên khách hàng';
    }

    if (!formData.appointmentDate) {
      errors.appointmentDate = 'Vui lòng chọn ngày và giờ';
    } else {
      const selectedDate = new Date(formData.appointmentDate);
      const now = new Date();
      if (selectedDate <= now) {
        errors.appointmentDate = 'Ngày hẹn phải trong tương lai';
      }
    }

    if (!formData.address.trim()) {
      errors.address = 'Vui lòng nhập địa chỉ';
    }

    if (!formData.userId || formData.userId <= 0) {
      errors.userId = 'Vui lòng nhập ID khách hàng (số lớn hơn 0)';
    }

    if (!formData.vehicleId || formData.vehicleId <= 0) {
      errors.vehicleId = 'Thông tin xe không hợp lệ';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !selectedVehicle) return;

    setIsSubmitting(true);
    try {
      // Create appointment data for API using form data
      const appointmentData: CreateTestDriveAppointmentRequest = {
        appointmentId: 0, // Will be set by backend
        appointmentDate: formData.appointmentDate,
        status: formData.status,
        userId: Number(formData.userId),
        vehicleId: formData.vehicleId,
        username: formData.username.trim(),
        vehicleName: formData.vehicleName,
        address: formData.address.trim()
      };

      console.log('🔄 Creating test drive appointment with data:', appointmentData);
      
      const response = await testDriveService.createTestDriveAppointment(appointmentData);

      if (response.success) {
        console.log('✅ Test drive appointment created successfully:', response);
        setShowSuccessModal(true);
      } else {
        console.error('❌ Failed to create test drive appointment:', response.message);
        // Show detailed error message
        const errorMsg = response.message.includes('Authentication required') 
          ? '🔐 Cần đăng nhập với tài khoản hợp lệ để đặt lịch lái thử.\n\nVui lòng:\n1. Đăng nhập với tài khoản thật (không phải mock)\n2. Hoặc kiểm tra quyền truy cập API'
          : response.message;
        alert(`❌ Lỗi khi đặt lịch lái thử:\n\n${errorMsg}`);
      }
    } catch (error) {
      console.error('❌ Error creating test drive appointment:', error);
      alert(`Lỗi khi đặt lịch lái thử: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hiển thị modal thành công
  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Đặt lịch thành công!</h3>
          <p className="mt-2 text-sm text-gray-500">
            Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận lịch lái thử.
          </p>
          <div className="mt-4">
            <button
              onClick={() => navigate('/portal/dashboard')}
              className="w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Show success modal if needed
  if (showSuccessModal) {
    return <SuccessModal />;
  }

  if (!loading && !selectedVehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy xe</h2>
          <p className="text-gray-600 mb-6">Xe với ID: {vehicleId} không tồn tại hoặc đã bị xóa.</p>
          <button
            onClick={() => navigate('/portal/car-product')}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
          >
            Quay lại danh sách xe
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
        {/* Back Button */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <button 
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
            >
              <span>← Quay lại</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Đặt lịch lái thử</h1>
          
          {/* Loading Spinner */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <span className="ml-3 text-gray-600">Đang tải thông tin xe...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Lỗi khi tải dữ liệu</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info State - Show data source info */}
          {/* {!loading && selectedVehicle && (
            <div className={`border rounded-lg p-4 mb-6 ${
              selectedVehicle.id === mockVehicles.find(v => v.id === selectedVehicle.id)?.id
                ? 'bg-blue-50 border-blue-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className={`h-5 w-5 ${
                    selectedVehicle.id === mockVehicles.find(v => v.id === selectedVehicle.id)?.id ? 'text-blue-400' : 'text-green-400'
                  }`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    selectedVehicle.id === mockVehicles.find(v => v.id === selectedVehicle.id)?.id ? 'text-blue-800' : 'text-green-800'
                  }`}>
                    {selectedVehicle.id === mockVehicles.find(v => v.id === selectedVehicle.id)?.id ? 'Đang sử dụng dữ liệu mẫu' : 'Dữ liệu từ Backend API'}
                  </h3>
                  <div className={`mt-2 text-sm ${
                    selectedVehicle.id === mockVehicles.find(v => v.id === selectedVehicle.id)?.id ? 'text-blue-700' : 'text-green-700'
                  }`}>
                    <p>
                      {selectedVehicle.id === mockVehicles.find(v => v.id === selectedVehicle.id)?.id
                        ? 'Backend API chưa sẵn sàng hoặc yêu cầu quyền truy cập. Hiển thị dữ liệu mẫu để demo.'
                        : `Đã tải thành công thông tin xe từ database.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )} */}
          
          {selectedVehicle && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Vehicle Info */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin xe</h2>
                
                <div className="mb-6">
                  <img
                    src={selectedVehicle.images?.[0] || '/placeholder-vehicle.jpg'}
                    alt={selectedVehicle.model}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>

                <h3 className="text-3xl font-bold text-gray-900 mb-2">{selectedVehicle.model}</h3>
                <p className="text-lg text-gray-600 mb-2">{selectedVehicle.version} - {selectedVehicle.color}</p>
                <p className="text-3xl font-bold text-green-600 mb-6">{formatPrice(selectedVehicle.price)}</p>
                
                {/* Additional Vehicle Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin bổ sung</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">ID xe:</span>
                      <span className="ml-2 font-medium">{selectedVehicle.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Loại xe:</span>
                      <span className="ml-2 font-medium">{selectedVehicle.type || 'SUV'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Trạng thái:</span>
                      <span className="ml-2 font-medium">{selectedVehicle.status || 'ACTIVE'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tồn kho:</span>
                      <span className="ml-2 font-medium">{selectedVehicle.stock || 0} xe</span>
                    </div>
                  </div>
                </div>

                {/* Specifications */}
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="font-medium text-gray-700">Tầm hoạt động</span>
                    <span className="text-gray-900">{selectedVehicle.distance || `${selectedVehicle.range} km`}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="font-medium text-gray-700">Tốc độ tối đa</span>
                    <span className="text-gray-900">{selectedVehicle.speed || `${selectedVehicle.maxSpeed} km/h`}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="font-medium text-gray-700">Thời gian sạc</span>
                    <span className="text-gray-900">{selectedVehicle.timecharging || selectedVehicle.chargingTime}</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="font-medium text-gray-700">Tồn kho</span>
                    <span className="text-gray-900">{selectedVehicle.stock || 0} xe</span>
                  </div>
                </div>
              </div>

            {/* Updated Booking Form - Only API fields */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin đặt lịch</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Thông tin khách hàng</h3>
                  
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                      Tên khách hàng *
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        formErrors.username ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nhập tên khách hàng"
                    />
                    {formErrors.username && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                      ID khách hàng *
                    </label>
                    <input
                      type="number"
                      id="userId"
                      name="userId"
                      min={1}
                      value={formData.userId || ''}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        formErrors.userId ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nhập ID khách hàng (số)"
                    />
                    {formErrors.userId && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.userId}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        formErrors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nhập địa chỉ"
                    />
                    {formErrors.address && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                    )}
                  </div>
                </div>

                {/* Appointment Date and Time */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Thời gian lái thử</h3>
                  
                  <div>
                    <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày và giờ hẹn *
                    </label>
                    <input
                      type="datetime-local"
                      id="appointmentDate"
                      name="appointmentDate"
                      value={formData.appointmentDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().slice(0, 16)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        formErrors.appointmentDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.appointmentDate && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.appointmentDate}</p>
                    )}
                  </div>
                </div>

                {/* Vehicle Information (Read-only) */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Thông tin xe</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">ID xe:</span>
                        <span className="ml-2 font-medium">{formData.vehicleId}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tên xe:</span>
                        <span className="ml-2 font-medium">{formData.vehicleName}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Trạng thái:</span>
                        <span className="ml-2 font-medium">{formData.status}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">User ID:</span>
                        <span className="ml-2 font-medium">{formData.userId}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Đang xử lý...' : 'Đặt lịch lái thử'}
                  </button>
                </div>
              </form>
            </div>
            </div>
          )}
        </div>
      </div>
  );
};


