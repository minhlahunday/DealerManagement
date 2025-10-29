import React, { useState } from 'react';
import { BarChart3, Calendar, Download, RefreshCw, AlertCircle, TrendingUp, ShoppingCart, MapPin, Award, Palette, Car, Building2 } from 'lucide-react';
import { salesReportService, SalesReportItem } from '../../../services/salesReportService';
import { useAuth } from '../../../contexts/AuthContext';

export const SalesReportManagement: React.FC = () => {
  const { user } = useAuth();
  const isStaffEVM = user?.role === 'evm_staff';
  
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [reportData, setReportData] = useState<SalesReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchReport = async () => {
    if (!fromDate || !toDate) {
      alert('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc!');
      return;
    }

    // Convert dates to ISO string format
    const fromDateISO = new Date(fromDate).toISOString();
    const toDateISO = new Date(toDate).toISOString();

    setLoading(true);
    setError(null);
    try {
      const response = await salesReportService.getSalesReport(fromDateISO, toDateISO);
      setReportData(response.data);
      console.log('📊 Sales report:', response.data);
    } catch (err) {
      console.error('Failed to fetch sales report:', err);
      setError(`Không thể tải báo cáo: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  // Calculate totals (excluding summary row)
  const calculateTotals = () => {
    const dataWithoutSummary = reportData.filter(item => item.companyName !== 'Tổng hợp toàn hệ thống');
    return {
      totalOrders: dataWithoutSummary.reduce((sum, item) => sum + item.totalOrders, 0),
      totalSales: dataWithoutSummary.reduce((sum, item) => sum + item.totalSales, 0),
    };
  };

  const totals = calculateTotals();
  const summaryRow = reportData.find(item => item.companyName === 'Tổng hợp toàn hệ thống');

  if (!isStaffEVM) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Truy cập bị từ chối
          </h2>
          <p className="text-gray-600 text-center">
            Bạn không có quyền truy cập trang này. Chỉ staff EVM mới có thể xem báo cáo doanh số.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                Báo cáo Doanh số
              </h1>
              <p className="text-gray-600 mt-1">Xem báo cáo doanh số bán hàng theo khoảng thời gian</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Selection */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-md p-6 mb-6 border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-600 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Chọn khoảng thời gian</h2>
              <p className="text-gray-600 text-sm">Chọn ngày bắt đầu và ngày kết thúc để xem báo cáo</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Từ ngày
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Đến ngày
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                min={fromDate}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleFetchReport}
                disabled={loading || !fromDate || !toDate}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Tải báo cáo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Report Results */}
        {reportData.length > 0 && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Tổng đơn hàng</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {summaryRow ? summaryRow.totalOrders : totals.totalOrders}
                    </p>
                  </div>
                  <ShoppingCart className="w-12 h-12 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Tổng doanh số</p>
                    <p className="text-2xl font-bold text-green-600">
                      {summaryRow ? formatPrice(summaryRow.totalSales) : formatPrice(totals.totalSales)}
                    </p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Số khu vực/Đại lý</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {reportData.filter(item => item.companyName !== 'Tổng hợp toàn hệ thống').length}
                    </p>
                  </div>
                  <Building2 className="w-12 h-12 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Report Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
                <h3 className="text-lg font-bold">Chi tiết báo cáo doanh số</h3>
                <p className="text-purple-100 text-sm">
                  {fromDate && toDate && (
                    <>Từ {formatDate(fromDate)} đến {formatDate(toDate)}</>
                  )}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên đại lý/Khu vực
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Địa chỉ
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tổng đơn hàng
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tổng doanh số
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mẫu xe bán chạy
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loại xe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Màu sắc
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.map((item, index) => {
                      const isSummary = item.companyName === 'Tổng hợp toàn hệ thống';
                      
                      return (
                        <tr 
                          key={index} 
                          className={`hover:bg-gray-50 transition-colors ${
                            isSummary ? 'bg-gradient-to-r from-purple-50 to-blue-50 font-bold' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {isSummary ? (
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                              ) : (
                                <Building2 className="w-5 h-5 text-gray-400" />
                              )}
                              <div>
                                <div className={`text-sm font-semibold ${
                                  isSummary ? 'text-purple-900' : 'text-gray-900'
                                }`}>
                                  {item.companyName || 'Chưa xác định'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{item.address}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                              isSummary 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {item.totalOrders}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className={`text-sm font-bold ${
                              isSummary ? 'text-purple-600' : 'text-green-600'
                            }`}>
                              {formatPrice(item.totalSales)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm text-gray-900">{item.bestSellingModel}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Car className="w-4 h-4 text-blue-500" />
                              <span className="text-sm text-gray-900">{item.bestSellingType}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Palette className="w-4 h-4 text-gray-400" />
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-900`}>
                                {item.bestSellingColor}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && reportData.length === 0 && fromDate && toDate && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có dữ liệu</h3>
            <p className="text-gray-600">Vui lòng chọn khoảng thời gian và tải báo cáo</p>
          </div>
        )}

        {/* Initial State */}
        {!loading && reportData.length === 0 && (!fromDate || !toDate) && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chọn khoảng thời gian</h3>
            <p className="text-gray-600">Vui lòng chọn ngày bắt đầu và ngày kết thúc để xem báo cáo doanh số</p>
          </div>
        )}
      </div>
    </div>
  );
};

