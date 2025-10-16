import React, { useState, useEffect } from 'react';
import { Search, FileText, DollarSign, Calendar, User, Car, Eye, Download } from 'lucide-react';

export interface SaleContract {
  contractId: number;
  quotationId: number;
  userId: number;
  vehicleId: number;
  contractDate: string;
  totalAmount: number;
  status: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  deliveryAddress?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface SaleContractListResponse {
  success: boolean;
  message: string;
  data: SaleContract[];
}

export const ContractManagement: React.FC = () => {
  const [contracts, setContracts] = useState<SaleContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContract, setSelectedContract] = useState<SaleContract | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Load contracts when component mounts
  useEffect(() => {
    fetchContracts();
  }, []);

  // Fetch contracts from API
  const fetchContracts = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching contracts from API...');
      
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('✅ Token found, adding to headers');
      } else {
        console.warn('No token found in localStorage');
      }

      const response = await fetch('/api/SaleContract', {
        method: 'GET',
        headers,
      });

      console.log('📡 Contracts API Response status:', response.status);
      console.log('📡 Contracts API Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails = '';
        
        try {
          const errorData = await response.json();
          console.log('🔍 Contracts API Error Data:', errorData);
          errorMessage = errorData.message || errorData.error || errorData.title || errorMessage;
          errorDetails = JSON.stringify(errorData);
        } catch {
          const errorText = await response.text();
          console.log('🔍 Contracts API Error Text:', errorText);
          errorMessage = errorText || errorMessage;
        }
        
        console.error('❌ Contracts API Error:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          details: errorDetails
        });
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('📡 Contracts API Response Data:', responseData);

      // Check if response is successful (status 200 or success true)
      if (responseData.status === 200 || responseData.success) {
        // Handle different response structures
        let contractsData = [];
        
        if (responseData.data && Array.isArray(responseData.data)) {
          // Standard structure: { success: true, data: [...] }
          contractsData = responseData.data;
        } else if (Array.isArray(responseData)) {
          // Direct array response
          contractsData = responseData;
        } else if (responseData.data && typeof responseData.data === 'object') {
          // Object with data property
          contractsData = Object.values(responseData.data);
        }
        
        // Map API fields to our interface
        const mappedContracts = contractsData.map((contract: Record<string, unknown>) => ({
          contractId: contract.salesContractId || contract.contractId,
          quotationId: contract.orderId || contract.quotationId,
          userId: contract.userId || 1,
          vehicleId: contract.vehicleId || 1,
          contractDate: contract.contractDate,
          totalAmount: contract.totalAmount || contract.amount || 0,
          status: contract.status || 'PENDING',
          customerName: contract.customerName || contract.signedByDealer,
          customerPhone: contract.customerPhone,
          customerEmail: contract.customerEmail,
          deliveryAddress: contract.deliveryAddress,
          paymentMethod: contract.paymentMethod,
          notes: contract.terms || contract.notes
        }));
        
        setContracts(mappedContracts);
        console.log('✅ Contracts loaded from API:', mappedContracts.length);
        if (mappedContracts.length === 0) {
          console.log('📝 API returned empty array - no contracts available');
        }
      } else {
        console.log('❌ API returned unsuccessful response, using empty data');
        setContracts([]);
      }
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
      setError(error instanceof Error ? error.message : 'Lỗi khi tải danh sách hợp đồng');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  // View contract details
  const handleViewContract = async (contract: SaleContract) => {
    setLoadingDetail(true);
    setError(null);

    try {
      console.log(`🔍 Loading contract details for ID: ${contract.contractId}`);
      setSelectedContract(contract);
      setShowDetailModal(true);
      console.log('✅ Contract details loaded successfully');
    } catch (error) {
      console.error('❌ Error loading contract details:', error);
      alert(`Lỗi khi tải chi tiết hợp đồng: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Filter contracts
  const filteredContracts = contracts.filter(contract =>
    contract.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.contractId.toString().includes(searchTerm) ||
    contract.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.customerPhone?.includes(searchTerm)
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SIGNED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xử lý';
      case 'SIGNED':
        return 'Đã ký';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'CANCELLED':
        return 'Hủy bỏ';
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'CASH':
        return 'Tiền mặt';
      case 'BANK_TRANSFER':
        return 'Chuyển khoản';
      case 'CREDIT_CARD':
        return 'Thẻ tín dụng';
      case 'INSTALLMENT':
        return 'Trả góp';
      default:
        return method;
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 mb-8 border border-orange-200">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Quản lý hợp đồng bán hàng</h1>
              <p className="text-gray-600 mt-1">Theo dõi và quản lý các hợp đồng bán hàng</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{contracts.length}</div>
              <div className="text-sm text-gray-600">Tổng hợp đồng</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{contracts.filter(c => c.status === 'COMPLETED').length}</div>
              <div className="text-sm text-gray-600">Hoàn thành</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{contracts.filter(c => c.status === 'SIGNED').length}</div>
              <div className="text-sm text-gray-600">Đã ký</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Actions Section */}
      <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm hợp đồng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchContracts}
              disabled={loading}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Làm mới</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <span className="ml-3 text-gray-600">Đang tải danh sách hợp đồng...</span>
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

      {/* Contracts List */}
      {!loading && filteredContracts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <FileText className="h-6 w-6 text-orange-600" />
              <span>Danh sách hợp đồng ({filteredContracts.length})</span>
            </h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {filteredContracts.map((contract) => (
              <div key={contract.contractId} className="p-6 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <FileText className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="text-xl font-bold text-gray-900">
                            Hợp đồng #{contract.contractId}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}>
                            {getStatusText(contract.status)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-600">Ngày tạo</p>
                              <p className="font-semibold text-gray-900">{formatDate(contract.contractDate)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="text-xs text-gray-600">Tổng tiền</p>
                              <p className="font-semibold text-gray-900">{formatPrice(contract.totalAmount)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                            <User className="h-5 w-5 text-purple-600" />
                            <div>
                              <p className="text-xs text-gray-600">Khách hàng</p>
                              <p className="font-semibold text-gray-900">{contract.customerName || `ID: ${contract.userId}`}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Car className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="text-xs text-gray-600">Xe</p>
                              <p className="font-semibold text-gray-900">ID: {contract.vehicleId}</p>
                            </div>
                          </div>
                        </div>

                        {/* Additional Info */}
                        {contract.customerPhone && (
                          <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                            <span>📞 {contract.customerPhone}</span>
                            {contract.paymentMethod && (
                              <span>💳 {getPaymentMethodText(contract.paymentMethod)}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-6">
                    <button
                      onClick={() => handleViewContract(contract)}
                      disabled={loadingDetail}
                      className="p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-xl transition-all duration-200 disabled:opacity-50"
                      title="Xem chi tiết"
                    >
                      {loadingDetail ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      className="p-3 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-xl transition-all duration-200"
                      title="Tải xuống"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredContracts.length === 0 && contracts.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có hợp đồng nào</h3>
          <p className="text-gray-600">Hiện tại chưa có hợp đồng bán hàng nào trong hệ thống.</p>
        </div>
      )}

      {/* Contract Detail Modal */}
      {showDetailModal && selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Chi tiết hợp đồng #{selectedContract.contractId}</h2>
                    <p className="text-orange-100 text-sm">Thông tin chi tiết hợp đồng bán hàng</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white hover:text-orange-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Thông tin cơ bản</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">#{selectedContract.contractId}</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">ID Hợp đồng</p>
                        <p className="font-semibold text-gray-900">{selectedContract.contractId}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-600">Ngày tạo</p>
                        <p className="font-semibold text-gray-900">{formatDate(selectedContract.contractDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedContract.status)}`}>
                        {getStatusText(selectedContract.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer & Vehicle Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Khách hàng & Xe</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                      <User className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-xs text-gray-600">Khách hàng</p>
                        <p className="font-semibold text-gray-900">{selectedContract.customerName || `ID: ${selectedContract.userId}`}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Car className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="text-xs text-gray-600">Xe</p>
                        <p className="font-semibold text-gray-900">ID: {selectedContract.vehicleId}</p>
                      </div>
                    </div>

                    {selectedContract.customerPhone && (
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-600">Số điện thoại</p>
                          <p className="font-semibold text-gray-900">{selectedContract.customerPhone}</p>
                        </div>
                      </div>
                    )}

                    {selectedContract.customerEmail && (
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-600">Email</p>
                          <p className="font-semibold text-gray-900">{selectedContract.customerEmail}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Information */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Thông tin giá</h3>
                
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tổng tiền:</span>
                      <span className="font-semibold text-lg">{formatPrice(selectedContract.totalAmount)}</span>
                    </div>
                    
                    {selectedContract.paymentMethod && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Phương thức thanh toán:</span>
                        <span className="font-semibold text-lg">{getPaymentMethodText(selectedContract.paymentMethod)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {(selectedContract.deliveryAddress || selectedContract.notes) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Thông tin bổ sung</h3>
                  
                  <div className="space-y-4">
                    {selectedContract.deliveryAddress && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Địa chỉ giao hàng</h4>
                        <p className="text-gray-900">{selectedContract.deliveryAddress}</p>
                      </div>
                    )}

                    {selectedContract.notes && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Ghi chú</h4>
                        <p className="text-gray-900">{selectedContract.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium"
                >
                  Đóng
                </button>
                <button
                  className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg"
                >
                  <Download className="h-4 w-4" />
                  <span>Tải xuống</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
