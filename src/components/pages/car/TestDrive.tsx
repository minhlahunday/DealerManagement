import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { mockVehicles, mockDealers } from '../../../data/mockData';
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
    fullName: '',
    phone: '',
    email: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
    dealerId: '',
    address: '',
    identityCard: '', // CMND/CCCD
    pickupLocation: 'dealer', // dealer hoặc home
    agreement: false
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
      } else {
        console.log('⚠️ No vehicle from API, using mock data');
        const mockVehicle = mockVehicles.find(v => v.id === id);
        if (mockVehicle) {
          setSelectedVehicle(mockVehicle);
        }
      }
    } catch (error) {
      console.error('❌ Failed to fetch vehicle:', error);
      setError(error instanceof Error ? error.message : 'Lỗi khi tải thông tin xe');
      // Fallback to mock data
      const mockVehicle = mockVehicles.find(v => v.id === id);
      if (mockVehicle) {
        setSelectedVehicle(mockVehicle);
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ tên';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.email.trim()) {
      errors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }

    if (!formData.identityCard.trim()) {
      errors.identityCard = 'Vui lòng nhập CMND/CCCD';
    } else if (!/^[0-9]{9,12}$/.test(formData.identityCard)) {
      errors.identityCard = 'CMND/CCCD không hợp lệ';
    }

    if (!formData.preferredDate) {
      errors.preferredDate = 'Vui lòng chọn ngày';
    } else {
      const selectedDate = new Date(formData.preferredDate);
      const today = new Date();
      if (selectedDate < today) {
        errors.preferredDate = 'Ngày không hợp lệ';
      }
    }

    if (!formData.preferredTime) {
      errors.preferredTime = 'Vui lòng chọn giờ';
    }

    if (!formData.dealerId && formData.pickupLocation === 'dealer') {
      errors.dealerId = 'Vui lòng chọn đại lý';
    }

    if (!formData.address && formData.pickupLocation === 'home') {
      errors.address = 'Vui lòng nhập địa chỉ';
    }

    if (!formData.agreement) {
      errors.agreement = 'Vui lòng đồng ý với điều khoản';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !selectedVehicle) return;

    setIsSubmitting(true);
    try {
      // Create appointment data for API
      // Use local time to match user's selection
      const dateTimeString = `${formData.preferredDate}T${formData.preferredTime}:00`;
      const appointmentDateTime = new Date(dateTimeString);
      const isoString = appointmentDateTime.toISOString();
      
      console.log('🕐 Time formatting debug:', {
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        dateTimeString: dateTimeString,
        appointmentDateTime: appointmentDateTime,
        isoString: isoString,
        localTimeString: appointmentDateTime.toLocaleString('vi-VN'),
        localTimeOnly: appointmentDateTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        timezoneOffset: appointmentDateTime.getTimezoneOffset(),
        utcHours: appointmentDateTime.getUTCHours(),
        localHours: appointmentDateTime.getHours()
      });

      const appointmentData: CreateTestDriveAppointmentRequest = {
        appointmentId: 0, // Will be set by backend
        appointmentDate: isoString, // Use local time to match user selection
        status: 'PENDING',
        userId: 1, // Default user ID - should be from auth context
        vehicleId: parseInt(selectedVehicle.id),
        username: formData.fullName.trim() || 'Khách hàng',
        vehicleName: selectedVehicle.model,
        address: formData.address || 'Chưa cung cấp' // Backend requires Address field
      };

      // Remove appointmentId from request body as backend will generate it
      const requestBody = {
        appointmentDate: isoString, // Use local time consistently
        status: appointmentData.status,
        userId: appointmentData.userId,
        vehicleId: appointmentData.vehicleId,
        username: appointmentData.username,
        vehicleName: appointmentData.vehicleName,
        address: formData.address || 'Chưa cung cấp' // Backend requires Address field
      };

      // Validate required fields
      if (!requestBody.appointmentDate || !requestBody.vehicleId || !requestBody.username || !requestBody.address) {
        throw new Error('Thiếu thông tin bắt buộc: ngày hẹn, ID xe, tên khách hàng, hoặc địa chỉ');
      }

      // Validate date is in the future
      const appointmentDateTimeForValidation = new Date(requestBody.appointmentDate);
      const now = new Date();
      if (appointmentDateTimeForValidation <= now) {
        throw new Error('Ngày hẹn phải trong tương lai');
      }

      console.log('📋 Appointment data being sent to API:', {
        appointmentId: appointmentData.appointmentId,
        appointmentDate: appointmentData.appointmentDate,
        status: appointmentData.status,
        userId: appointmentData.userId,
        vehicleId: appointmentData.vehicleId,
        username: appointmentData.username,
        vehicleName: appointmentData.vehicleName
      });

      console.log('🔍 Form data debug:', {
        fullName: formData.fullName,
        fullNameTrimmed: formData.fullName.trim(),
        fullNameLength: formData.fullName.length,
        username: appointmentData.username
      });

      console.log('🔄 Creating test drive appointment with data:', requestBody);
      
      // Try with the cleaned request body first
      let response = await testDriveService.createTestDriveAppointment(requestBody as CreateTestDriveAppointmentRequest);
      
      // If that fails, try with the original format (including appointmentId)
      if (!response.success && response.message?.includes('400')) {
        console.log('🔄 Retrying with original format including appointmentId...');
        response = await testDriveService.createTestDriveAppointment(appointmentData);
      }

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
          {!loading && selectedVehicle && (
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
          )}
          
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

            {/* Updated Booking Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin đặt lịch</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Thông tin cá nhân</h3>
                  
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        formErrors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nhập họ và tên"
                    />
                    {formErrors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="identityCard" className="block text-sm font-medium text-gray-700 mb-2">
                      CMND/CCCD *
                    </label>
                    <input
                      type="text"
                      id="identityCard"
                      name="identityCard"
                      value={formData.identityCard}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        formErrors.identityCard ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nhập số CMND/CCCD"
                    />
                    {formErrors.identityCard && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.identityCard}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Nhập số điện thoại"
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Nhập email"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>
                </div>

                {/* Date and Time Selection */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Thời gian lái thử</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày mong muốn *
                      </label>
                      <input
                        type="date"
                        id="preferredDate"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                          formErrors.preferredDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.preferredDate && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.preferredDate}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-2">
                        Giờ mong muốn *
                      </label>
                      <select
                        id="preferredTime"
                        name="preferredTime"
                        value={formData.preferredTime}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                          formErrors.preferredTime ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Chọn giờ</option>
                        <option value="09:00">09:00</option>
                        <option value="10:00">10:00</option>
                        <option value="11:00">11:00</option>
                        <option value="14:00">14:00</option>
                        <option value="15:00">15:00</option>
                        <option value="16:00">16:00</option>
                      </select>
                      {formErrors.preferredTime && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.preferredTime}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Test Drive Location */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Địa điểm lái thử</h3>
                  
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="pickupLocation"
                        value="dealer"
                        checked={formData.pickupLocation === 'dealer'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span>Tại đại lý</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="pickupLocation"
                        value="home"
                        checked={formData.pickupLocation === 'home'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span>Tại nhà</span>
                    </label>
                  </div>

                  {formData.pickupLocation === 'dealer' ? (
                    <div>
                      <label htmlFor="dealerId" className="block text-sm font-medium text-gray-700 mb-2">
                        Chọn đại lý *
                      </label>
                      <select
                        id="dealerId"
                        name="dealerId"
                        value={formData.dealerId}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                          formErrors.dealerId ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Chọn đại lý</option>
                        {mockDealers.map(dealer => (
                          <option key={dealer.id} value={dealer.id}>
                            {dealer.name} - {dealer.address}
                          </option>
                        ))}
                      </select>
                      {formErrors.dealerId && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.dealerId}</p>
                      )}
                    </div>
                  ) : (
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
                        placeholder="Nhập địa chỉ của bạn"
                      />
                      {formErrors.address && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Nhập ghi chú nếu có"
                  />
                </div>

                {/* Agreement Checkbox */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="agreement"
                    name="agreement"
                    checked={formData.agreement}
                    onChange={(e) => setFormData(prev => ({ ...prev, agreement: e.target.checked }))
                    }
                    className="mt-1"
                  />
                  <label htmlFor="agreement" className="ml-2 text-sm text-gray-600">
                    Tôi đồng ý với các điều khoản và điều kiện của VinFast *
                  </label>
                </div>
                {formErrors.agreement && (
                  <p className="text-sm text-red-600">{formErrors.agreement}</p>
                )}

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

