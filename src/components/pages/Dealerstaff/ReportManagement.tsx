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

  // Get user role from localStorage
  const getUserRole = (): string => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.role || 'dealer';
      } catch {
        return 'dealer';
      }
    }
    return 'dealer';
  };

  const userRole = getUserRole();
  const isEvmStaff = userRole === 'evm_staff';
  
  console.log('👤 Current User Role:', userRole);
  console.log('🔐 Is EVM Staff:', isEvmStaff);
  console.log('📝 Can Edit Status:', isEvmStaff ? 'YES' : 'NO - DEALER CANNOT EDIT STATUS');

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
        
        // Debug: Check each report's orderId
        response.data.forEach((report: Report, index: number) => {
          const reportData = report as unknown as Record<string, unknown>;
          console.log(`  Report ${index + 1}:`, {
            reportId: report.reportId,
            orderId: report.orderId,
            order_id: reportData.order_id, // Check snake_case
            orderIdType: typeof report.orderId,
            hasOrderId: 'orderId' in report,
            hasOrderIdSnake: 'order_id' in reportData,
            allKeys: Object.keys(report)
          });
        });
        
        // Map snake_case to camelCase if needed
        const mappedReports = response.data.map((report: Report) => {
          const reportData = report as unknown as Record<string, unknown>;
          return {
            ...report,
            // If API returns order_id instead of orderId, map it
            orderId: report.orderId ?? (reportData.order_id as number) ?? 0,
            userId: report.userId ?? (reportData.user_id as number) ?? 0
          };
        });
        
        console.log('✅ Mapped reports with orderId:', mappedReports);
        setReports(mappedReports);
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

  // Debug effect to track modal state changes
  useEffect(() => {
    console.log('🔍 Edit modal state changed:', showEditModal);
  }, [showEditModal]);

  // Debug editForm state - especially orderId
  useEffect(() => {
    if (showEditModal) {
      console.log('📝 Edit Form State:', {
        reportId: editForm.reportId,
        userId: editForm.userId,
        orderId: editForm.orderId,
        senderName: editForm.senderName,
        status: editForm.status
      });
      console.log('  ⚠️ orderId value:', editForm.orderId, '(type:', typeof editForm.orderId, ')');
    }
  }, [editForm, showEditModal]);

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
    console.log('🔄 Opening edit modal for report:', report.reportId);
    console.log('📋 Report data for editing:', report);
    
    // Get userId from report or from current logged-in user
    let validUserId = report.userId;
    
    // If userId is not valid, try to get from localStorage
    if (!validUserId || validUserId === 0) {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          // Ensure userId is a number, not string
          const userIdValue = userData.userId || userData.id || 1;
          validUserId = typeof userIdValue === 'string' ? parseInt(userIdValue) : userIdValue;
          console.log('⚠️ Using userId from localStorage:', validUserId, '(type:', typeof validUserId, ')');
        } catch {
          validUserId = 1; // Default fallback
          console.warn('⚠️ Using default userId = 1');
        }
      } else {
        validUserId = 1; // Default fallback
        console.warn('⚠️ Using default userId = 1');
      }
    }
    
    // Set edit form with only the fields that exist in API response
    setEditForm({
      reportId: report.reportId,
      senderName: report.senderName || '',
      userId: validUserId,
      orderId: report.orderId ?? 0, // Use nullish coalescing - only use 0 if null/undefined, keep 0 if it's 0
      reportType: report.reportType || 'Sales',
      createdDate: report.createdDate || new Date().toISOString().split('T')[0],
      resolvedDate: report.resolvedDate || '',
      content: report.content || '',
      status: report.status || 'Chua Xu li'
    });
    
    console.log('✅ Edit form populated with data:');
    console.log('  Original report.userId:', report.userId);
    console.log('  Original report.orderId:', report.orderId, '(type:', typeof report.orderId, ')');
    console.log('  Validated userId:', validUserId);
    console.log('  Final orderId to set:', report.orderId ?? 0);
    console.log({
      reportId: report.reportId,
      senderName: report.senderName,
      userId: validUserId,
      orderId: report.orderId ?? 0,
      reportType: report.reportType,
      createdDate: report.createdDate,
      resolvedDate: report.resolvedDate,
      content: report.content,
      status: report.status
    });
    
    setShowEditModal(true);
    console.log('✅ Edit modal state set to true');
  };

  const handleDeleteReport = (report: Report) => {
    setReportToDelete(report);
    setShowDeleteModal(true);
  };

  const handleCreateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate form data
      if (!createForm.senderName.trim()) {
        setError('Vui lòng nhập tên người gửi');
        return;
      }
      
      if (!createForm.content.trim()) {
        setError('Vui lòng nhập nội dung báo cáo');
        return;
      }
      
      if (createForm.userId <= 0) {
        setError('Vui lòng nhập User ID hợp lệ (lớn hơn 0)');
        return;
      }
      
      // Prepare form data - handle optional orderId and always set status to "Chưa xử lý"
      const formData = {
        ...createForm,
        orderId: createForm.orderId > 0 ? createForm.orderId : 0, // Set to 0 if invalid
        resolvedDate: createForm.resolvedDate || '', // Set to empty string if empty
        status: 'Chua Xu li' // Always set to "Chưa xử lý" for new reports
      };
      
      console.log('🔄 Creating report with validated data:', formData);
      
      const newReport = await reportService.createReport(formData);
      
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
      console.error('❌ Error creating report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Handle specific foreign key constraint error
      if (errorMessage.includes('FOREIGN KEY constraint') || errorMessage.includes('order_id')) {
        setError('❌ Lỗi: Order ID không tồn tại trong hệ thống. Vui lòng kiểm tra lại Order ID hoặc để trống nếu không liên quan đến đơn hàng cụ thể.');
      } else {
        setError(`Lỗi khi tạo báo cáo: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate form data
      if (!editForm.senderName.trim()) {
        setError('Vui lòng nhập tên người gửi');
        return;
      }
      
      if (!editForm.content.trim()) {
        setError('Vui lòng nhập nội dung báo cáo');
        return;
      }
      
      // Validate userId - CRITICAL for foreign key constraint
      if (!editForm.userId || editForm.userId === 0) {
        console.error('❌ Invalid userId:', editForm.userId);
        setError('Lỗi: Không tìm thấy thông tin người dùng. Vui lòng đăng xuất và đăng nhập lại.');
        setLoading(false);
        return;
      }
      
      // Prepare form data - handle optional orderId
      const formData = {
        ...editForm,
        userId: editForm.userId, // Ensure userId is always sent
        orderId: editForm.orderId > 0 ? editForm.orderId : 0, // Set to 0 if invalid
        resolvedDate: editForm.resolvedDate || '' // Set to empty string if empty
      };
      
      console.log('🔄 Updating report via API...');
      console.log('✅ userId validation passed:', formData.userId);
      console.log('📊 FORM DATA TO SEND:');
      console.log('  reportId:', formData.reportId);
      console.log('  senderName:', formData.senderName);
      console.log('  userId:', formData.userId, '(type:', typeof formData.userId, ')');
      console.log('  orderId:', formData.orderId);
      console.log('  reportType:', formData.reportType);
      console.log('  createdDate:', formData.createdDate);
      console.log('  resolvedDate:', formData.resolvedDate);
      console.log('  content:', formData.content);
      console.log('  status:', formData.status);
      console.log('📋 Full JSON:', JSON.stringify(formData, null, 2));
      
      const updatedReport = await reportService.updateReport(editForm.reportId, formData);
      
      if (updatedReport) {
        console.log('✅ Report updated successfully:', updatedReport);
        setSuccess('Cập nhật báo cáo thành công!');
        setShowEditModal(false);
        await fetchReports();
      } else {
        console.error('❌ Update returned null/undefined');
        setError('Không thể cập nhật báo cáo. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('❌ Error updating report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Handle specific foreign key constraint error
      if (errorMessage.includes('FOREIGN KEY constraint') || errorMessage.includes('order_id')) {
        setError('❌ Lỗi: Order ID không tồn tại trong hệ thống. Vui lòng kiểm tra lại Order ID hoặc để trống nếu không liên quan đến đơn hàng cụ thể.');
      } else {
        setError(`Lỗi khi cập nhật báo cáo: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🗑️ Deleting report ${reportToDelete.reportId} via API...`);
      const success = await reportService.deleteReport(reportToDelete.reportId);
      
      if (success) {
        console.log('✅ Report deleted successfully');
        setSuccess('Xóa báo cáo thành công!');
        setShowDeleteModal(false);
        setReportToDelete(null);
        await fetchReports();
      } else {
        console.error('❌ Delete returned false');
        setError('Không thể xóa báo cáo. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('❌ Error deleting report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Lỗi khi xóa báo cáo: ${errorMessage}`);
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 mb-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Quản lý khiếu nại & phản hồi</h1>
              <p className="text-blue-100 mt-1">Theo dõi và xử lý các khiếu nại hệ thống</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl px-4 py-2">
              <span className="text-white text-sm font-medium">
                Tổng: {reports.length} Khiếu nại
              </span>
            </div>
            <button
              onClick={fetchReports}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all duration-200 backdrop-blur-sm shadow-lg"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Làm mới</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Tạo khiếu nại mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Đang tải danh sách khiếu nại...</span>
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

      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Filter className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Bộ lọc và tìm kiếm</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm báo cáo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-gray-50 focus:bg-white transition-all duration-200"
            >
              <option value="ALL">Tất cả loại</option>
              <option value="Sales">Bán hàng</option>
              <option value="Inventory">Tồn kho</option>
              <option value="Customer">Khách hàng</option>
              <option value="Financial">Tài chính</option>
              <option value="Performance">Hiệu suất</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-gray-50 focus:bg-white transition-all duration-200"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="Da Xu li">Đã xử lý</option>
              <option value="Dang Xu li">Đang xử lý</option>
              <option value="Chua Xu li">Chưa xử lý</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('ALL');
              setStatusFilter('ALL');
            }}
            className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Đặt lại</span>
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có khiếu nại nào</h3>
            <p className="text-gray-500 mb-6">Hiện tại chưa có khiếu nại nào trong hệ thống</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg"
            >
              Tạo khiếu nại đầu tiên
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredReports.map((report) => (
              <div key={report.reportId} className="p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                        {getTypeIcon(report.reportType)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Khiếu nại #{report.reportId}
                        </h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(report.reportType)}`}>
                            {getTypeText(report.reportType)}
                          </span>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                            {getStatusText(report.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-xs text-blue-600 font-medium">Người gửi</p>
                          <p className="font-semibold text-gray-900">{report.senderName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-xs text-green-600 font-medium">Ngày tạo</p>
                          <p className="font-semibold text-gray-900">{formatDate(report.createdDate)}</p>
                        </div>
                      </div>
                      {report.resolvedDate && (
                        <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                          <Clock className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="text-xs text-purple-600 font-medium">Ngày xử lý</p>
                            <p className="font-semibold text-gray-900">{formatDate(report.resolvedDate)}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {report.content}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-2 ml-6">
                    <button
                      onClick={() => handleViewDetail(report)}
                      className="p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-xl transition-all duration-200 shadow-sm"
                      title="Xem chi tiết"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEditReport(report)}
                      className="p-3 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded-xl transition-all duration-200 shadow-sm"
                      title="Chỉnh sửa"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report)}
                      className="p-3 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-xl transition-all duration-200 shadow-sm"
                      title="Xóa"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDownload(report)}
                      className="p-3 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-xl transition-all duration-200 shadow-sm"
                      title="Tải xuống"
                    >
                      <Download className="h-5 w-5" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Eye className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Chi tiết khiếu nại</h2>
                    <p className="text-blue-100 text-sm">Thông tin đầy đủ về khiếu nại #{selectedReport.reportId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white hover:text-blue-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Main Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">ID Khiếu nại</p>
                      <p className="text-lg font-bold text-blue-900">#{selectedReport.reportId}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-medium">Người gửi</p>
                      <p className="text-lg font-bold text-green-900">{selectedReport.senderName}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Thông tin cơ bản</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                          <span className="text-gray-600">Loại khiếu nại:</span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(selectedReport.reportType)}`}>
                        {getTypeText(selectedReport.reportType)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Trạng thái:</span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedReport.status)}`}>
                        {getStatusText(selectedReport.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Thông tin thời gian</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Ngày tạo:</span>
                      <span className="font-semibold text-gray-900">{formatDate(selectedReport.createdDate)}</span>
                    </div>
                    {selectedReport.resolvedDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Ngày xử lý:</span>
                        <span className="font-semibold text-gray-900">{formatDate(selectedReport.resolvedDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-gray-600" />
                  <span>Nội dung khiếu nại</span>
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedReport.content}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium"
              >
                Đóng
              </button>
              <button
                onClick={() => handleDownload(selectedReport)}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Tải xuống</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Tạo khiếu nại mới</h2>
                    <p className="text-green-100 text-sm">Thêm khiếu nại mới vào hệ thống</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-white hover:text-green-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Basic Info Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Thông tin cơ bản</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span>Tên người gửi *</span>
                      </label>
                      <input
                        type="text"
                        value={createForm.senderName}
                        onChange={(e) => setCreateForm({...createForm, senderName: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Nhập tên người gửi"
                      />
                    </div>
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        <span>User ID *</span>
                      </label>
                      <input
                        type="number"
                        value={createForm.userId}
                        onChange={(e) => setCreateForm({...createForm, userId: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Nhập User ID"
                      />
                    </div>
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <span>Order ID (tùy chọn)</span>
                      </label>
                      <input
                        type="number"
                        value={createForm.orderId || ''}
                        onChange={(e) => setCreateForm({...createForm, orderId: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Nhập Order ID (để trống nếu không liên quan)"
                        min="1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Để trống nếu khiếu nại không liên quan đến đơn hàng cụ thể</p>
                    </div>
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                        <Activity className="h-4 w-4 text-blue-600" />
                              <span>Loại khiếu nại *</span>
                      </label>
                      <select
                        value={createForm.reportType}
                        onChange={(e) => setCreateForm({...createForm, reportType: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                      >
                        <option value="Sales">Khiếu nại bán hàng</option>
                        <option value="Inventory">Khiếu nại tồn kho</option>
                        <option value="Customer">Khiếu nại khách hàng</option>
                        <option value="Financial">Khiếu nại tài chính</option>
                        <option value="Performance">Khiếu nại hiệu suất</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Date Section */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Thông tin thời gian</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <span>Ngày tạo *</span>
                      </label>
                      <input
                        type="date"
                        value={createForm.createdDate}
                        onChange={(e) => setCreateForm({...createForm, createdDate: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span>Ngày xử lý (tùy chọn)</span>
                      </label>
                      <input
                        type="date"
                        value={createForm.resolvedDate}
                        onChange={(e) => setCreateForm({...createForm, resolvedDate: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>
                  
                  {/* Status Info */}
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Trạng thái:</span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        Chưa xử lý
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">Báo cáo mới sẽ được tạo với trạng thái "Chưa xử lý"</p>
                  </div>
                </div>

                {/* Content Section */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Nội dung báo cáo</span>
                  </h3>
                  <textarea
                    value={createForm.content}
                    onChange={(e) => setCreateForm({...createForm, content: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                    placeholder="Nhập nội dung báo cáo..."
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateReport}
                disabled={loading || !createForm.senderName.trim() || !createForm.content.trim() || createForm.userId <= 0}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>{loading ? 'Đang tạo...' : 'Tạo báo cáo'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Report Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Chỉnh sửa báo cáo</h2>
                    <p className="text-yellow-100 text-sm">Cập nhật thông tin báo cáo #{editForm.reportId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-white hover:text-yellow-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Basic Info Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Thông tin cơ bản</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span>Tên người gửi *</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.senderName}
                        onChange={(e) => setEditForm({...editForm, senderName: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Nhập tên người gửi"
                      />
                    </div>
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                        <Users className="h-4 w-4 text-orange-600" />
                        <span>User ID *</span>
                      </label>
                      <input
                        type="number"
                        value={editForm.userId ?? ''}
                        onChange={(e) => setEditForm({...editForm, userId: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="Nhập User ID"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <span>Loại báo cáo *</span>
                      </label>
                      <select
                        value={editForm.reportType}
                        onChange={(e) => setEditForm({...editForm, reportType: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                      >
                        <option value="Sales">Bán hàng</option>
                        <option value="Inventory">Tồn kho</option>
                        <option value="Customer">Khách hàng</option>
                        <option value="Financial">Tài chính</option>
                        <option value="Performance">Hiệu suất</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Order ID Field */}
                  <div className="mt-4">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span>Order ID (tùy chọn)</span>
                    </label>
                    <input
                      type="number"
                      value={editForm.orderId ?? ''}
                      onChange={(e) => setEditForm({...editForm, orderId: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="Nhập Order ID (để trống nếu không liên quan)"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      DEBUG - Giá trị: {editForm.orderId ?? 'null/undefined'} | Type: {typeof editForm.orderId} | Is 0: {editForm.orderId === 0 ? 'YES' : 'NO'}
                    </p>
                  </div>
                </div>

                {/* Status and Date Section */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Trạng thái và thời gian</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <span>Ngày tạo *</span>
                      </label>
                      <input
                        type="date"
                        value={editForm.createdDate}
                        onChange={(e) => setEditForm({...editForm, createdDate: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                        <Activity className="h-4 w-4 text-green-600" />
                        <span>Trạng thái *</span>
                        {/* {!isEvmStaff && (
                          <span className="text-xs text-red-600 ml-2">(Chỉ EVM Staff mới có quyền thay đổi)</span>
                        )} */}
                      </label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                        disabled={!isEvmStaff}
                        className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 appearance-none ${
                          !isEvmStaff 
                            ? 'bg-gray-200 cursor-not-allowed opacity-60' 
                            : 'bg-gray-50 focus:bg-white'
                        }`}
                      >
                        <option value="Chua Xu li">Chưa xử lý</option>
                        <option value="Dang Xu li">Đang xử lý</option>
                        <option value="Da Xu li">Đã xử lý</option>
                      </select>
                      {/* {!isEvmStaff && (
                        <p className="text-xs text-red-600 mt-1">
                          ⚠️ Bạn không có quyền thay đổi trạng thái báo cáo. Chỉ EVM Staff mới có quyền này.
                        </p>
                      )} */}
                    </div>
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span>Ngày xử lý (tùy chọn)</span>
                      </label>
                      <input
                        type="date"
                        value={editForm.resolvedDate}
                        onChange={(e) => setEditForm({...editForm, resolvedDate: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Nội dung báo cáo</span>
                  </h3>
                  <textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                    placeholder="Nhập nội dung báo cáo..."
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateReport}
                disabled={loading || !editForm.senderName.trim() || !editForm.content.trim() || !editForm.reportType.trim()}
                className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>{loading ? 'Đang cập nhật...' : 'Cập nhật báo cáo'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && reportToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Xác nhận xóa báo cáo</h2>
                    <p className="text-red-100 text-xs">Hành động này không thể hoàn tác</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-white hover:text-red-200 transition-colors p-1 hover:bg-white hover:bg-opacity-10 rounded-lg"
                  disabled={loading}
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Warning Section */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-800 mb-1">Cảnh báo</h3>
                    <p className="text-xs text-red-700">Hành động này không thể hoàn tác. Báo cáo sẽ bị xóa vĩnh viễn khỏi hệ thống.</p>
                  </div>
                </div>
              </div>

              {/* Report Info */}
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-gray-600" />
                  <span>Thông tin báo cáo sẽ bị xóa:</span>
                </h3>
                <div className="space-y-1 text-xs">
                  <p><span className="font-medium text-gray-600">ID:</span> <span className="text-gray-800">#{reportToDelete.reportId}</span></p>
                  <p><span className="font-medium text-gray-600">Người gửi:</span> <span className="text-gray-800">{reportToDelete.senderName}</span></p>
                  <p><span className="font-medium text-gray-600">Loại:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(reportToDelete.reportType)}`}>
                    {getTypeText(reportToDelete.reportType)}
                  </span></p>
                  <p><span className="font-medium text-gray-600">Trạng thái:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reportToDelete.status)}`}>
                    {getStatusText(reportToDelete.status)}
                  </span></p>
                  <p><span className="font-medium text-gray-600">Ngày tạo:</span> <span className="text-gray-800">{formatDate(reportToDelete.createdDate)}</span></p>
                  <p><span className="font-medium text-gray-600">Nội dung:</span> <span className="text-gray-800 truncate block">{reportToDelete.content}</span></p>
                </div>
              </div>

              {/* Authentication Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-semibold text-blue-800 mb-1">Lưu ý về xác thực</h3>
                    <p className="text-xs text-blue-700">Để xóa báo cáo, bạn cần đăng nhập với tài khoản hợp lệ có quyền truy cập API.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 rounded-b-2xl flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium text-sm"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium text-sm shadow-lg"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                )}
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>{loading ? 'Đang xóa...' : 'Xóa báo cáo'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
