import React, { useState, useEffect } from 'react';
import { Search, DollarSign, TrendingUp, ShoppingCart, Calendar, RefreshCw, AlertCircle, User, Eye } from 'lucide-react';
import { dealerRevenueService, DealerRevenue } from '../../../services/dealerRevenueService';

export const DealerRevenueManagement: React.FC = () => {
  const [revenues, setRevenues] = useState<DealerRevenue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRevenue, setSelectedRevenue] = useState<DealerRevenue | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Fetch revenues on mount
  useEffect(() => {
    fetchRevenues();
  }, []);

  const fetchRevenues = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dealerRevenueService.getDealerRevenue();
      console.log('💰 Revenues loaded:', data);
      setRevenues(data);
    } catch (err) {
      console.error('Failed to fetch revenues:', err);
      setError(`Không thể tải báo cáo doanh thu: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // View revenue detail
  const handleViewRevenue = async (revenue: DealerRevenue) => {
    setLoadingDetail(true);
    setShowDetailModal(true);
    try {
      // Since the API response doesn't specify which field is the ID,
      // we'll use the revenue object directly for now
      // If there's a specific ID field in the response, it should be used here
      setSelectedRevenue(revenue);
      console.log('👁️ Viewing revenue detail:', revenue);
    } catch (err) {
      console.error('Failed to fetch revenue detail:', err);
      alert(`Không thể tải chi tiết: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Filter revenues
  const filteredRevenues = revenues.filter(revenue =>
    revenue.salespersonName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const totalOrders = filteredRevenues.reduce((sum, r) => sum + r.totalOrders, 0);
  const totalRevenue = filteredRevenues.reduce((sum, r) => sum + r.totalSales, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl shadow-2xl p-8 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Báo cáo doanh thu</h1>
                <p className="text-green-100 text-lg">Theo dõi doanh thu và hiệu suất bán hàng</p>
              </div>
            </div>
            
            {/* Info Banner */}
            <div className="mt-4 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-30 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">
                    <strong>✅ Lưu ý:</strong> Báo cáo doanh thu chỉ tính từ các đơn hàng đã được phê duyệt (status = "approved").
                  </p>
                  {/* <p className="text-xs text-green-100 mt-1">
                    Backend tự động lọc - Các đơn hàng ở trạng thái khác không được tính vào doanh thu.
                  </p> */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-6 pt-6">
          {/* Total Revenue */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-green-600">{formatPrice(totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Giá trị TB/Đơn</p>
                <p className="text-2xl font-bold text-purple-600">{formatPrice(averageOrderValue)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="px-6 pb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200"
            />
          </div>
          <button
            onClick={fetchRevenues}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 shadow-lg font-medium"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Đang tải...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5" />
                <span>Làm mới</span>
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Đang tải báo cáo doanh thu...</p>
            </div>
          </div>
        )}

        {/* Revenue Table */}
        {!loading && filteredRevenues.length > 0 && (
          <div className="mx-6 mb-6 bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Báo cáo doanh thu ({filteredRevenues.length})</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Tổng đơn hàng
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Tổng doanh thu
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      TB/Đơn
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Đơn đầu tiên
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Đơn cuối cùng
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRevenues.map((revenue, index) => {
                    const avgOrderValue = revenue.totalOrders > 0 ? revenue.totalSales / revenue.totalOrders : 0;
                    
                    return (
                      <tr key={index} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{revenue.salespersonName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-lg">
                            <ShoppingCart className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-gray-900">{revenue.totalOrders}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-green-600 text-lg">{formatPrice(revenue.totalSales)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-semibold text-purple-600">{formatPrice(avgOrderValue)}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(revenue.firstOrderDate)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(revenue.lastOrderDate)}</span>
                          </div>
                        </td>

                        {/* Actions Column */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleViewRevenue(revenue)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            <Eye className="h-4 w-4" />
                            Xem
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredRevenues.length === 0 && revenues.length === 0 && (
          <div className="mx-6 mb-6 bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có báo cáo doanh thu</h3>
            <p className="text-gray-600">Báo cáo doanh thu sẽ xuất hiện ở đây</p>
          </div>
        )}

        {!loading && filteredRevenues.length === 0 && revenues.length > 0 && (
          <div className="mx-6 mb-6 bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
            <p className="text-gray-600">Không có khách hàng nào phù hợp với từ khóa "{searchTerm}"</p>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedRevenue && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Chi tiết doanh thu</h2>
                      <p className="text-green-100 mt-1">Thông tin chi tiết khách hàng</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-xl p-2 transition-all duration-200"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {loadingDetail ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Đang tải chi tiết...</p>
                </div>
              ) : (
                <div className="p-8 space-y-6">
                  {/* Salesperson Info */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-l-4 border-green-500">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <User className="h-5 w-5 text-green-600" />
                      <span>Thông tin khách hàng</span>
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex justify-between items-center py-2 border-b border-green-200">
                        <span className="text-gray-600 font-medium">Tên khách hàng:</span>
                        <span className="font-bold text-gray-900">{selectedRevenue.salespersonName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sales Performance */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-l-4 border-blue-500">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <span>Hiệu suất bán hàng</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-blue-200">
                        <span className="text-gray-600 font-medium flex items-center space-x-2">
                          <ShoppingCart className="h-4 w-4" />
                          <span>Tổng đơn hàng:</span>
                        </span>
                        <span className="font-bold text-blue-600">{selectedRevenue.totalOrders}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-blue-200">
                        <span className="text-gray-600 font-medium flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span>Tổng doanh thu:</span>
                        </span>
                        <span className="font-bold text-green-600 text-lg">{formatPrice(selectedRevenue.totalSales)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 font-medium flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4" />
                          <span>Giá trị TB/Đơn:</span>
                        </span>
                        <span className="font-bold text-purple-600">
                          {formatPrice(selectedRevenue.totalOrders > 0 ? selectedRevenue.totalSales / selectedRevenue.totalOrders : 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-l-4 border-purple-500">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <span>Thời gian hoạt động</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-purple-200">
                        <span className="text-gray-600 font-medium">Đơn hàng đầu tiên:</span>
                        <span className="font-semibold text-gray-900">{formatDate(selectedRevenue.firstOrderDate)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 font-medium">Đơn hàng cuối cùng:</span>
                        <span className="font-semibold text-gray-900">{formatDate(selectedRevenue.lastOrderDate)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
