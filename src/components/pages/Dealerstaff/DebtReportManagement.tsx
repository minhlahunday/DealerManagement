import React, { useState, useEffect } from 'react';
import { Search, DollarSign, TrendingUp, TrendingDown, AlertCircle, RefreshCw, Building2, Users } from 'lucide-react';
import { debtReportService, DebtReport } from '../../../services/debtReportService';

type TabType = 'dealers' | 'customers';

export const DebtReportManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dealers');
  const [dealersReports, setDealersReports] = useState<DebtReport[]>([]);
  const [customersReports, setCustomersReports] = useState<DebtReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch debt reports on mount
  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dealersData, customersData] = await Promise.all([
        debtReportService.getDealersDebtReport(),
        debtReportService.getCustomersDebtReport()
      ]);
      console.log('💰 Dealers reports loaded:', dealersData);
      console.log('💰 Customers reports loaded:', customersData);
      setDealersReports(dealersData);
      setCustomersReports(customersData);
    } catch (err) {
      console.error('Failed to fetch debt reports:', err);
      setError(`Không thể tải báo cáo công nợ: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Get current reports based on active tab
  const debtReports = activeTab === 'dealers' ? dealersReports : customersReports;

  // Filter debt reports
  const filteredReports = debtReports.filter(report =>
    report.customerOrDealerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const totalOrderAmount = filteredReports.reduce((sum, r) => sum + r.totalOrderAmount, 0);
  const totalPaid = filteredReports.reduce((sum, r) => sum + r.totalPaid, 0);
  const totalOutstandingDebt = filteredReports.reduce((sum, r) => sum + r.outstandingDebt, 0);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Get debt level color
  const getDebtLevelColor = (outstandingDebt: number, totalOrderAmount: number) => {
    if (outstandingDebt === 0) return 'bg-green-100 text-green-800';
    const percentage = (outstandingDebt / totalOrderAmount) * 100;
    if (percentage >= 80) return 'bg-red-100 text-red-800';
    if (percentage >= 50) return 'bg-orange-100 text-orange-800';
    if (percentage >= 20) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  // Get payment percentage
  const getPaymentPercentage = (totalPaid: number, totalOrderAmount: number) => {
    if (totalOrderAmount === 0) return 0;
    return Math.round((totalPaid / totalOrderAmount) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl shadow-2xl p-8 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <DollarSign className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Quản lý công nợ</h1>
                <p className="text-red-100 text-lg">Theo dõi và quản lý công nợ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="p-6">
          <div className="bg-white rounded-2xl shadow-lg p-2 inline-flex space-x-2">
            <button
              onClick={() => setActiveTab('dealers')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'dealers'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Building2 className="h-5 w-5" />
              <span>Đại lý</span>
              {dealersReports.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'dealers' ? 'bg-white bg-opacity-20 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {dealersReports.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'customers'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="h-5 w-5" />
              <span>Khách hàng</span>
              {customersReports.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'customers' ? 'bg-white bg-opacity-20 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {customersReports.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-6">
          {/* Total Order Amount */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(totalOrderAmount)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Paid */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đã thanh toán</p>
                <p className="text-2xl font-bold text-green-600">{formatPrice(totalPaid)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Outstanding Debt */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Công nợ</p>
                <p className="text-2xl font-bold text-red-600">{formatPrice(totalOutstandingDebt)}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
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
              placeholder={activeTab === 'dealers' ? 'Tìm kiếm theo tên đại lý...' : 'Tìm kiếm theo tên khách hàng...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200"
            />
          </div>
          <button
            onClick={fetchAllReports}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 shadow-lg font-medium"
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
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Đang tải báo cáo công nợ...</p>
            </div>
          </div>
        )}

        {/* Debt Reports Table */}
        {!loading && filteredReports.length > 0 && (
          <div className="mx-6 mb-6 bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Báo cáo công nợ ({filteredReports.length})</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {activeTab === 'dealers' ? 'Đại lý' : 'Khách hàng'}
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Tổng đơn hàng
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Đã thanh toán
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Công nợ
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Tiến độ
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReports.map((report, index) => {
                    const paymentPercentage = getPaymentPercentage(report.totalPaid, report.totalOrderAmount);
                    
                    return (
                      <tr key={index} className="hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {report.customerOrDealerName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{report.customerOrDealerName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-semibold text-gray-900">{formatPrice(report.totalOrderAmount)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-semibold text-green-600">{formatPrice(report.totalPaid)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-red-600">{formatPrice(report.outstandingDebt)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-full">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[150px]">
                                <div
                                  className={`h-2 rounded-full transition-all duration-500 ${
                                    paymentPercentage === 100 
                                      ? 'bg-green-500' 
                                      : paymentPercentage >= 50 
                                      ? 'bg-blue-500' 
                                      : 'bg-orange-500'
                                  }`}
                                  style={{ width: `${paymentPercentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold text-gray-700 min-w-[45px] text-right">
                                {paymentPercentage}%
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDebtLevelColor(report.outstandingDebt, report.totalOrderAmount)}`}>
                            {report.outstandingDebt === 0 
                              ? 'Đã thanh toán' 
                              : paymentPercentage >= 50 
                              ? 'Đang thanh toán' 
                              : 'Nợ cao'}
                          </span>
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
        {!loading && filteredReports.length === 0 && debtReports.length === 0 && (
          <div className="mx-6 mb-6 bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <DollarSign className="h-12 w-12 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có báo cáo công nợ</h3>
            <p className="text-gray-600">Báo cáo công nợ sẽ xuất hiện ở đây</p>
          </div>
        )}

        {!loading && filteredReports.length === 0 && debtReports.length > 0 && (
          <div className="mx-6 mb-6 bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
            <p className="text-gray-600">
              Không có {activeTab === 'dealers' ? 'đại lý' : 'khách hàng'} nào phù hợp với từ khóa "{searchTerm}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

