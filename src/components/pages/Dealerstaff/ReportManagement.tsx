import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  DollarSign,
  Car,
  Users,
  Calendar,
  Download,
  Filter,
  Eye,
  XCircle,
  Activity,
  Clock,
  MessageSquare
} from 'lucide-react';
import { reportService, Report, CreateReportRequest, UpdateReportRequest } from '../../../services/reportService';

// Mock data for fallback - matches API response structure
const mockReports: Report[] = [
  {
    reportId: 1,
    senderName: 'customer One',
    userId: 4,
    orderId: 1001,
    reportType: 'Sales',
    createdDate: '2025-01-01',
    resolvedDate: '2025-03-31',
    content: 'xe bi loi gat mua',
    status: 'Da Xu li'
  },
  {
    reportId: 2,
    senderName: 'customer Two',
    userId: 5,
    orderId: 1002,
    reportType: 'Sales',
    createdDate: '2025-04-01',
    resolvedDate: '2025-06-30',
    content: 'xe loi pin',
    status: 'Dang Xu li'
  }
];

export const ReportManagement: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreateReportRequest>({
    reportId: 0,
    senderName: '',
    userId: 0,
    orderId: 0,
    reportType: 'Sales',
    createdDate: new Date().toISOString().split('T')[0],
    resolvedDate: '',
    content: '',
    status: 'Chua Xu li'
  });

  const [editForm, setEditForm] = useState<UpdateReportRequest>({
    reportId: 0,
    senderName: '',
    userId: 0,
    orderId: 0,
    reportType: 'Sales',
    createdDate: '',
    resolvedDate: '',
    content: '',
    status: 'Chua Xu li'
  });

  // Fetch reports from API
  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching reports from API...');
      const response = await reportService.getReports();
      console.log('📡 Reports API Response:', response);

      if (response.data && Array.isArray(response.data)) {
        console.log('✅ Reports loaded from API:', response.data);
        setReports(response.data);
      } else {
        console.log('⚠️ No reports from API, using mock data');
        setReports(mockReports);
      }
    } catch (error) {
      console.error('❌ Failed to fetch reports:', error);
      setError(error instanceof Error ? error.message : 'Lỗi khi tải danh sách báo cáo');
      // Fallback to mock data
      setReports(mockReports);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load reports on component mount
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Filter reports
  useEffect(() => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reportType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(report => report.reportType === typeFilter);
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    setFilteredReports(filtered);
  }, [reports, searchTerm, typeFilter, statusFilter]);

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
      case 'Da Xu li':
        return 'bg-green-100 text-green-800';
      case 'Dang Xu li':
        return 'bg-blue-100 text-blue-800';
      case 'Chua Xu li':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Da Xu li':
        return 'Đã xử lý';
      case 'Dang Xu li':
        return 'Đang xử lý';
      case 'Chua Xu li':
        return 'Chưa xử lý';
      default:
        return status;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sales':
        return 'bg-blue-100 text-blue-800';
      case 'inventory':
        return 'bg-purple-100 text-purple-800';
      case 'customer':
        return 'bg-green-100 text-green-800';
      case 'financial':
        return 'bg-yellow-100 text-yellow-800';
      case 'performance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sales':
        return 'Bán hàng';
      case 'inventory':
        return 'Tồn kho';
      case 'customer':
        return 'Khách hàng';
      case 'financial':
        return 'Tài chính';
      case 'performance':
        return 'Hiệu suất';
      default:
        return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sales':
        return <Car className="h-4 w-4" />;
      case 'inventory':
        return <BarChart3 className="h-4 w-4" />;
      case 'customer':
        return <Users className="h-4 w-4" />;
      case 'financial':
        return <DollarSign className="h-4 w-4" />;
      case 'performance':
        return <Activity className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const handleViewDetail = (report: Report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleEditReport = (report: Report) => {
    setEditForm({
      reportId: report.reportId,
      senderName: report.senderName,
      userId: report.userId,
      orderId: report.orderId,
      reportType: report.reportType,
      createdDate: report.createdDate,
      resolvedDate: report.resolvedDate || '',
      content: report.content,
      status: report.status
    });
    setShowEditModal(true);
  };

  const handleDeleteReport = (report: Report) => {
    setReportToDelete(report);
    setShowDeleteModal(true);
  };

  const handleCreateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const newReport = await reportService.createReport(createForm);
      
      if (newReport) {
        setSuccess('Tạo báo cáo thành công!');
        setShowCreateModal(false);
        setCreateForm({
          reportId: 0,
          senderName: '',
          userId: 0,
          orderId: 0,
          reportType: 'Sales',
          createdDate: new Date().toISOString().split('T')[0],
          resolvedDate: '',
          content: '',
          status: 'Chua Xu li'
        });
        await fetchReports();
      } else {
        setError('Không thể tạo báo cáo. Vui lòng thử lại.');
      }
    } catch (error) {
      setError('Lỗi khi tạo báo cáo: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedReport = await reportService.updateReport(editForm.reportId, editForm);
      
      if (updatedReport) {
        setSuccess('Cập nhật báo cáo thành công!');
        setShowEditModal(false);
        await fetchReports();
      } else {
        setError('Không thể cập nhật báo cáo. Vui lòng thử lại.');
      }
    } catch (error) {
      setError('Lỗi khi cập nhật báo cáo: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const success = await reportService.deleteReport(reportToDelete.reportId);
      
      if (success) {
        setSuccess('Xóa báo cáo thành công!');
        setShowDeleteModal(false);
        setReportToDelete(null);
        await fetchReports();
      } else {
        setError('Không thể xóa báo cáo. Vui lòng thử lại.');
      }
    } catch (error) {
      setError('Lỗi khi xóa báo cáo: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (report: Report) => {
    // Create a simple text file with report content
    const content = `Báo cáo #${report.reportId}
Người gửi: ${report.senderName}
Loại: ${report.reportType}
Ngày tạo: ${report.createdDate}
Trạng thái: ${report.status}
Nội dung: ${report.content}
${report.resolvedDate ? `Ngày xử lý: ${report.resolvedDate}` : ''}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bao-cao-${report.reportId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý báo cáo</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Tạo báo cáo mới
          </button>
          <button
            onClick={fetchReports}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Làm mới
          </button>
          <span className="text-sm text-gray-600">
            Tổng: {reports.length} báo cáo
          </span>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Đang tải danh sách báo cáo...</span>
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
              <h3 className="text-sm font-medium text-red-800">Lỗi</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Thành công</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{success}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info State - Show data source info */}
      {/* {!loading && reports.length > 0 && (
        <div className={`border rounded-lg p-4 mb-6 ${
          reports.some(r => mockReports.some(mr => mr.reportId === r.reportId))
            ? 'bg-blue-50 border-blue-200'
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className={`h-5 w-5 ${
                reports.some(r => mockReports.some(mr => mr.reportId === r.reportId)) ? 'text-blue-400' : 'text-green-400'
              }`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                reports.some(r => mockReports.some(mr => mr.reportId === r.reportId)) ? 'text-blue-800' : 'text-green-800'
              }`}>
                {reports.some(r => mockReports.some(mr => mr.reportId === r.reportId)) ? 'Đang sử dụng dữ liệu mẫu' : 'Dữ liệu từ Backend API'}
              </h3>
              <div className={`mt-2 text-sm ${
                reports.some(r => mockReports.some(mr => mr.reportId === r.reportId)) ? 'text-blue-700' : 'text-green-700'
              }`}>
                <p>
                  {reports.some(r => mockReports.some(mr => mr.reportId === r.reportId))
                    ? 'Backend API chưa sẵn sàng hoặc yêu cầu quyền truy cập. Hiển thị dữ liệu mẫu để demo.'
                    : `Đã tải thành công ${reports.length} báo cáo từ database.`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm báo cáo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="ALL">Tất cả loại</option>
            <option value="Sales">Bán hàng</option>
            <option value="Inventory">Tồn kho</option>
            <option value="Customer">Khách hàng</option>
            <option value="Financial">Tài chính</option>
            <option value="Performance">Hiệu suất</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="Da Xu li">Đã xử lý</option>
            <option value="Dang Xu li">Đang xử lý</option>
            <option value="Chua Xu li">Chưa xử lý</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('ALL');
              setStatusFilter('ALL');
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Làm mới
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredReports.length === 0 ? (
          <div className="p-8 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không có báo cáo nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReports.map((report) => (
              <div key={report.reportId} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getTypeIcon(report.reportType)}
                      <h3 className="text-lg font-semibold text-gray-900">
                        Báo cáo #{report.reportId}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(report.reportType)}`}>
                        {getTypeText(report.reportType)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                        {getStatusText(report.status)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{report.senderName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(report.createdDate)}</span>
                      </div>
                      {report.resolvedDate && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Xử lý: {formatDate(report.resolvedDate)}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-700 text-sm">
                      {report.content}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleViewDetail(report)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditReport(report)}
                      className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDownload(report)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      title="Tải xuống"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Chi tiết báo cáo</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID Báo cáo</label>
                  <p className="text-gray-900">#{selectedReport.reportId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Loại báo cáo</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(selectedReport.reportType)}`}>
                    {getTypeText(selectedReport.reportType)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Người gửi</label>
                  <p className="text-gray-900">{selectedReport.senderName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedReport.status)}`}>
                    {getStatusText(selectedReport.status)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User ID</label>
                  <p className="text-gray-900">{selectedReport.userId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order ID</label>
                  <p className="text-gray-900">{selectedReport.orderId || 'Không có'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Ngày tạo</label>
                <p className="text-gray-900">{formatDate(selectedReport.createdDate)}</p>
              </div>

              {selectedReport.resolvedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngày xử lý</label>
                  <p className="text-gray-900">{formatDate(selectedReport.resolvedDate)}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Nội dung</label>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedReport.content}</p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={() => handleDownload(selectedReport)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Tải xuống
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Tạo báo cáo mới</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên người gửi *</label>
                  <input
                    type="text"
                    value={createForm.senderName}
                    onChange={(e) => setCreateForm({...createForm, senderName: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập tên người gửi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User ID *</label>
                  <input
                    type="number"
                    value={createForm.userId}
                    onChange={(e) => setCreateForm({...createForm, userId: parseInt(e.target.value) || 0})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập User ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order ID *</label>
                  <input
                    type="number"
                    value={createForm.orderId}
                    onChange={(e) => setCreateForm({...createForm, orderId: parseInt(e.target.value) || 0})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập Order ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Loại báo cáo *</label>
                  <select
                    value={createForm.reportType}
                    onChange={(e) => setCreateForm({...createForm, reportType: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Sales">Bán hàng</option>
                    <option value="Inventory">Tồn kho</option>
                    <option value="Customer">Khách hàng</option>
                    <option value="Financial">Tài chính</option>
                    <option value="Performance">Hiệu suất</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngày tạo *</label>
                  <input
                    type="date"
                    value={createForm.createdDate}
                    onChange={(e) => setCreateForm({...createForm, createdDate: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trạng thái *</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({...createForm, status: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Chua Xu li">Chưa xử lý</option>
                    <option value="Dang Xu li">Đang xử lý</option>
                    <option value="Da Xu li">Đã xử lý</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nội dung *</label>
                <textarea
                  value={createForm.content}
                  onChange={(e) => setCreateForm({...createForm, content: e.target.value})}
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập nội dung báo cáo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ngày xử lý (tùy chọn)</label>
                <input
                  type="date"
                  value={createForm.resolvedDate}
                  onChange={(e) => setCreateForm({...createForm, resolvedDate: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateReport}
                disabled={loading || !createForm.senderName || !createForm.content}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang tạo...' : 'Tạo báo cáo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Report Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa báo cáo</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên người gửi *</label>
                  <input
                    type="text"
                    value={editForm.senderName}
                    onChange={(e) => setEditForm({...editForm, senderName: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User ID *</label>
                  <input
                    type="number"
                    value={editForm.userId}
                    onChange={(e) => setEditForm({...editForm, userId: parseInt(e.target.value) || 0})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order ID *</label>
                  <input
                    type="number"
                    value={editForm.orderId}
                    onChange={(e) => setEditForm({...editForm, orderId: parseInt(e.target.value) || 0})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Loại báo cáo *</label>
                  <select
                    value={editForm.reportType}
                    onChange={(e) => setEditForm({...editForm, reportType: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Sales">Bán hàng</option>
                    <option value="Inventory">Tồn kho</option>
                    <option value="Customer">Khách hàng</option>
                    <option value="Financial">Tài chính</option>
                    <option value="Performance">Hiệu suất</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngày tạo *</label>
                  <input
                    type="date"
                    value={editForm.createdDate}
                    onChange={(e) => setEditForm({...editForm, createdDate: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trạng thái *</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Chua Xu li">Chưa xử lý</option>
                    <option value="Dang Xu li">Đang xử lý</option>
                    <option value="Da Xu li">Đã xử lý</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nội dung *</label>
                <textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ngày xử lý (tùy chọn)</label>
                <input
                  type="date"
                  value={editForm.resolvedDate}
                  onChange={(e) => setEditForm({...editForm, resolvedDate: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateReport}
                disabled={loading || !editForm.senderName || !editForm.content}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && reportToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Xác nhận xóa</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Bạn có chắc chắn muốn xóa báo cáo này không?
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p><span className="font-medium">ID:</span> #{reportToDelete.reportId}</p>
                <p><span className="font-medium">Người gửi:</span> {reportToDelete.senderName}</p>
                <p><span className="font-medium">User ID:</span> {reportToDelete.userId}</p>
                <p><span className="font-medium">Order ID:</span> {reportToDelete.orderId || 'Không có'}</p>
                <p><span className="font-medium">Loại:</span> {reportToDelete.reportType}</p>
                <p><span className="font-medium">Nội dung:</span> {reportToDelete.content}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
