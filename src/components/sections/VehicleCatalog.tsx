import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockVehicles } from '../../data/mockData';
import { Vehicle } from '../../types';
import { vehicleService } from '../../services/vehicleService';
import './VehicleCatalog.css';

export const VehicleCatalog: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    if (navigate) {
      // Preserve sidebar state when navigating
      navigate(path, { replace: false });
    }
  };

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [compareList] = useState<Vehicle[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [loading, setLoading] = useState(false);

  // Fetch vehicles from API
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        console.log('🚗 Fetching vehicles for VehicleCatalog...');
        const response = await vehicleService.getVehicles();
        
        if (response.success && response.data.length > 0) {
          console.log('✅ Vehicles loaded for catalog:', response.data.length);
          
          // Filter to only show VF7, VF8, VF9
          const vinFastVehicles = response.data.filter(vehicle => 
            vehicle.model.toUpperCase().includes('VF7') || 
            vehicle.model.toUpperCase().includes('VF8') || 
            vehicle.model.toUpperCase().includes('VF9')
          );
          
          console.log('🔍 Filtered VinFast vehicles:', vinFastVehicles.length);
          vinFastVehicles.forEach(v => console.log(`  - ${v.model} (ID: ${v.id})`));
          
          if (vinFastVehicles.length > 0) {
            setVehicles(vinFastVehicles);
          } else {
            console.warn('⚠️ No VinFast VF7/VF8/VF9 found in API, using mock data');
            setVehicles(mockVehicles);
          }
        } else {
          console.warn('⚠️ API returned no vehicles, using mock data');
          setVehicles(mockVehicles);
        }
      } catch (error) {
        console.error('❌ Error fetching vehicles for catalog:', error);
        setVehicles(mockVehicles);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleTestDrive = (vehicleId: string) => {
    // Use handleNavigation instead of direct navigate
    handleNavigation(`/portal/test-drive?vehicleId=${vehicleId}`);
  };


  return (
    <div className="bg-white">
      {/* Three Vehicle Cards Section */}
      <section className="bg-white pt-0 pb-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Những chiếc xe điện tốt nhất của chúng tôi</h2>
            <button
              onClick={() => navigate('/portal/car-product')}
              className="text-black hover:text-gray-700 text-sm font-medium"
            >
              Xem tất cả mẫu xe →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              // Loading state
              <div className="col-span-3 flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                  <p className="text-gray-600">Đang tải thông tin xe...</p>
                </div>
              </div>
            ) : (
              // Render vehicles from API
              vehicles.slice(0, 3).map((vehicle) => {
                // Get vehicle model name for display
                const getVehicleDisplayName = (model: string) => {
                  if (model.toUpperCase().includes('VF7')) return 'VF7';
                  if (model.toUpperCase().includes('VF8')) return 'VF8';
                  if (model.toUpperCase().includes('VF9')) return 'VF9';
                  return model.replace('Vinfast ', '').replace('VINFAST ', '');
                };

                // Get vehicle description
                const getVehicleDescription = (model: string) => {
                  if (model.toUpperCase().includes('VF7')) return 'SUV Nhỏ Gọn';
                  if (model.toUpperCase().includes('VF8')) return 'SUV Cỡ Trung';
                  if (model.toUpperCase().includes('VF9')) return 'SUV Đầy Đủ Kích Cỡ';
                  return 'SUV Điện';
                };

                // Get background class - now just white/light background
                const getBackgroundClass = () => {
                  return 'bg-white'; // Light background to show images clearly
                };

                // Get default image for each model
                const getDefaultImage = (model: string) => {
                  if (model.toUpperCase().includes('VF7')) return 'https://media.vov.vn/sites/default/files/styles/large/public/2024-06/a1_8.jpg';
                  if (model.toUpperCase().includes('VF8')) return 'https://vinfastotominhdao.vn/wp-content/uploads/VinFast-VF8-1.jpg';
                  if (model.toUpperCase().includes('VF9')) return 'https://vinfastotominhdao.vn/wp-content/uploads/VinFast-VF9-9.jpg';
                  return '/images/default-car.jpg';
                };

                return (
                  <div
                    key={vehicle.id}
                    className="group cursor-pointer"
                    onClick={() => navigate(`/portal/car-detail/${vehicle.id}`)}
                  >
                    <div className={`relative overflow-hidden rounded-2xl h-80 ${getBackgroundClass()}`}>
                      <img
                        src={(() => {
                          // Use API image if available, otherwise use default image for the model
                          const apiImage = vehicle.images?.[0];
                          if (apiImage && apiImage !== '/images/default-car.jpg' && apiImage.trim() !== '' && apiImage !== 'null') {
                            return apiImage;
                          }
                          return getDefaultImage(vehicle.model);
                        })()}
                        alt={getVehicleDisplayName(vehicle.model)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const defaultImg = getDefaultImage(vehicle.model);
                          if (target.src !== defaultImg && target.src !== '/images/default-car.jpg') {
                            target.src = defaultImg;
                          } else if (target.src !== '/images/default-car.jpg') {
                            target.src = '/images/default-car.jpg';
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                      
                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col justify-between p-6">
                        <div></div>
                        <div className="text-white">
                          <h3 className="text-4xl font-bold mb-2">{getVehicleDisplayName(vehicle.model)}</h3>
                          <div className="flex items-center justify-between">
                            <span className="text-base opacity-90">{getVehicleDescription(vehicle.model)}</span>
                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-opacity-40 transition-all">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
      {/* Your VinFast Journey Section */}
      <section className="bg-white py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4 px-4">Hành trình VinFast của bạn bắt đầu ngay bây giờ.</h2>
          </div>

          <div className="flex justify-center items-center">
            {/* Car Section */}
            <div
              className="group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-500 hover:scale-105 w-full max-w-3xl h-[60vh]"
              onClick={() => navigate('/portal/car-product')}
            >
              <video
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src="/videos/VF8.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>

              {/* Car Label */}
              <div className="absolute top-6 left-6">
                <span className="text-white text-3xl font-light tracking-wider">Ô tô</span>
              </div>

              {/* Car Info */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-end justify-between">
                  <div className="text-white">
                    <p className="text-sm mb-1">SUV điện với tính năng cao cấp</p>
                    <p className="text-xs opacity-80">4 cửa, 5 chỗ ngồi</p>
                  </div>
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center group-hover:bg-opacity-40 transition-all">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Motorcycle Section */}
            {/* <div
              className="group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-500 hover:scale-105"
              onClick={() => navigate('/portal/motorbike-product')}
            >
              <video
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src="/videos/Moto.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 bg-black bg-opacity-30"></div> */}

              {/* Motorcycle Label */}
              {/* <div className="absolute top-6 left-6">
                <span className="text-white text-3xl font-light tracking-wider">Xe máy điện</span>
              </div> */}

              {/* Motorcycle Info */}
              {/* <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-end justify-between">
                  <div className="text-white">
                    <p className="text-sm mb-1">Xe tay ga điện cho di chuyển đô thị</p>
                    <p className="text-xs opacity-80">2 bánh, thân thiện môi trường</p>
                  </div>
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center group-hover:bg-opacity-40 transition-all">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </section>


      {/* Content sections with updated background */}
      <div className="bg-white">
        {/* Title Section */}
        
        {/* Full-width Features Section */}
        <div className="w-full">
          {/* Features Grid */}
          <div className="grid grid-cols-12 min-h-[85vh]">
            {/* Safety System Section - 70% */}
            <div className="col-span-12 lg:col-span-8 bg-white p-16 flex flex-col">
              <div className="max-w-lg mb-8">
                <h2 className="text-5xl font-medium text-black mb-4">Hệ thống An toàn</h2>
                <p className="text-xl text-black leading-relaxed">
                  Các tính năng hỗ trợ lái xe tiên tiến được thiết kế để mang đến tương lai của việc lái xe
                </p>
              </div>
              <div className="flex-1 w-full flex items-center justify-center bg-black rounded-lg overflow-hidden" style={{ height: '66.666vh' }}>
                <video
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src="/videos/VinFast.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            {/* Interior Section - 30% */}
            <div className="col-span-12 lg:col-span-4 bg-white p-16 flex flex-col">
              <div className="max-w-lg mb-8">
                <h2 className="text-5xl font-medium text-black mb-4">Nội thất Tương lai</h2>
                <p className="text-xl text-black leading-relaxed mb-8">
                  Màn hình cảm ứng 17" với hệ thống âm thanh sống động
                </p>
                {/* <button className="bg-[#f5f5f5] text-black px-8 py-2 text-sm font-medium hover:bg-gray-200 transition-colors">
                  Tìm hiểu thêm
                </button> */}
              </div>
              <div className="flex-1 w-full rounded-lg overflow-hidden">
                <img
                  src="https://cdn1.otosaigon.com/data-resize/attachments/2306/2306072-f61b803025cb1a0a05632acee7839b23.jpg?w=750"
                  alt="VinFast Interior"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>


        {/* Comparison Table */}
        {compareList.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-black text-white">
              <h2 className="text-xl font-bold">So sánh xe điện</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium text-gray-700">Thông số</th>
                    {compareList.map(vehicle => (
                      <th key={vehicle.id} className="text-center p-4 font-medium text-gray-700">
                        {vehicle.model}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Hình ảnh</td>
                    {compareList.map(vehicle => (
                      <td key={vehicle.id} className="p-4 text-center">
                        <img 
                          src={vehicle.images?.[0] || '/images/default-car.jpg'} 
                          alt={vehicle.model} 
                          className="w-20 h-16 object-cover mx-auto rounded"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== '/images/default-car.jpg') {
                              target.src = '/images/default-car.jpg';
                            }
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Giá bán</td>
                    {compareList.map(vehicle => (
                      <td key={vehicle.id} className="p-4 text-center font-bold text-black">
                        {formatPrice(vehicle.price)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Tầm hoạt động</td>
                    {compareList.map(vehicle => (
                      <td key={vehicle.id} className="p-4 text-center">{vehicle.range} km</td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Tốc độ tối đa</td>
                    {compareList.map(vehicle => (
                      <td key={vehicle.id} className="p-4 text-center">{vehicle.maxSpeed} km/h</td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Thời gian sạc</td>
                    {compareList.map(vehicle => (
                      <td key={vehicle.id} className="p-4 text-center">{vehicle.chargingTime}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vehicle Detail Modal */}
        {selectedVehicle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedVehicle.model}</h2>
                  <button
                    onClick={() => setSelectedVehicle(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <img
                      src={selectedVehicle.images?.[0] || '/images/default-car.jpg'}
                      alt={selectedVehicle.model}
                      className="w-full h-64 object-cover rounded-lg mb-4"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== '/images/default-car.jpg') {
                          target.src = '/images/default-car.jpg';
                        }
                      }}
                    />
                    <p className="text-gray-600 mb-4">{selectedVehicle.description}</p>
                  </div>

                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-bold mb-2">Thông số kỹ thuật</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Phiên bản:</span>
                          <span className="font-medium">{selectedVehicle.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Màu sắc:</span>
                          <span className="font-medium">{selectedVehicle.color}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tầm hoạt động:</span>
                          <span className="font-medium">{selectedVehicle.range} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tốc độ tối đa:</span>
                          <span className="font-medium">{selectedVehicle.maxSpeed} km/h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Thời gian sạc:</span>
                          <span className="font-medium">{selectedVehicle.chargingTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-bold mb-2">Tính năng</h3>
                      <ul className="space-y-1">
                        {selectedVehicle.features?.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-black rounded-full"></span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-6">
                      <div className="text-3xl font-bold text-black mb-4">
                        {formatPrice(selectedVehicle.price)}
                      </div>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleTestDrive(selectedVehicle.id)}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium"
                        >
                          Đặt lái thử
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};