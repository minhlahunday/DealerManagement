import React, { useState, useEffect } from 'react';
import { Search, FileText, Calendar, User, Eye, Download, Edit, Trash2, Upload } from 'lucide-react';
import { saleService } from '../../../services/saleService';

export interface SaleContract {
  salesContractId: number;
  orderId: number;
  userId: number; // ✅ Added for customer info lookup
  contractDate: string;
  terms: string;
  signedByDealer: string;
  customerName: string | null;
  phone: string | null;
  email: string | null;
  paymentMethod: string | null;
  address: string | null;
  cccd: string | null;
  contractImage: string | null;
  contractFile?: string | null;
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContract, setEditingContract] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<SaleContract | null>(null);
  const [deletingContract, setDeletingContract] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingContract, setCreatingContract] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [contractToUpload, setContractToUpload] = useState<SaleContract | null>(null);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const [attachmentImageFile, setAttachmentImageFile] = useState<File | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [editForm, setEditForm] = useState<SaleContract>({
    salesContractId: 0,
    orderId: 0,
    userId: 0, // ✅ Added
    contractDate: new Date().toISOString(),
    terms: '',
    signedByDealer: '',
    customerName: '',
    phone: '',
    email: '',
    paymentMethod: '',
    address: '',
    cccd: '',
    contractImage: '',
    contractFile: ''
  });

  const [createForm, setCreateForm] = useState<SaleContract>({
    salesContractId: 0,
    orderId: 1,
    userId: 0, // ✅ Added
    contractDate: new Date().toISOString(),
    terms: 'Standard Terms and Conditions',
    signedByDealer: 'Dealer One',
    customerName: '',
    phone: '',
    email: '',
    paymentMethod: 'CASH',
    address: '',
    cccd: '',
    contractImage: '',
    contractFile: ''
  });

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
        
        // Handle 404 specifically - API endpoint might not exist yet
        if (response.status === 404) {
          console.log('📝 404 - API endpoint not found, treating as empty list');
          setContracts([]);
          return; // Don't throw error, just treat as empty list
        }
        
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
        
        // Map API fields to our interface (no transformation needed now)
        const mappedContracts = contractsData.map((contract: SaleContract) => contract);
        
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
  // Fetch user info from API
  const fetchUserInfo = async (userId: number) => {
    try {
      console.log(`🔍 Fetching customer info for userId: ${userId}`);

      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Try Customer endpoint first
      let response = await fetch(`/api/Customer/${userId}`, {
        method: 'GET',
        headers,
      });

      console.log(`📡 Customer API Response Status: ${response.status}`);

      // If Customer endpoint fails, try User endpoint
      if (!response.ok) {
        console.log('⚠️ Customer API failed, trying User endpoint...');
        response = await fetch(`/api/User/${userId}`, {
          method: 'GET',
          headers,
        });
        console.log(`📡 User API Response Status: ${response.status}`);
      }

      if (!response.ok) {
        console.warn(`⚠️ Failed to fetch user info: ${response.status}`);
        return null;
      }

      const data = await response.json();
      console.log('✅ User info fetched:', data);

      // Handle different response formats
      const userData = data.data || data;
      
      const userInfo = {
        customerName: userData.fullName || userData.name || userData.customerName || '',
        phone: userData.phone || userData.phoneNumber || '',
        email: userData.email || '',
        address: userData.address || ''
      };

      console.log('📋 Processed customer info:', userInfo);
      
      return userInfo;
    } catch (error) {
      console.error('❌ Error fetching user info:', error);
      return null;
    }
  };

  const handleViewContract = async (contract: SaleContract) => {
    setLoadingDetail(true);
    setError(null);

    try {
      console.log(`🔍 Fetching contract details for ID: ${contract.salesContractId}`);
      
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/SaleContract/${contract.salesContractId}`, {
        method: 'GET',
        headers,
      });

      console.log('📡 Contract Detail API Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          console.log('🔍 Contract Detail API Error Data:', errorData);
          errorMessage = errorData.message || errorData.error || errorData.title || errorMessage;
        } catch {
          const errorText = await response.text();
          console.log('🔍 Contract Detail API Error Text:', errorText);
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('📡 Contract Detail API Response Data:', responseData);

      if (responseData.status === 200 || responseData.data) {
        let contractData = responseData.data;
        
        // ✅ If customer info is missing but userId exists, fetch it
        if (contractData.userId && !contractData.customerName) {
          console.log('⚠️ Customer info missing in response, fetching from API...');
          const customerInfo = await fetchUserInfo(contractData.userId);
          
          if (customerInfo) {
            contractData = {
              ...contractData,
              ...customerInfo
            };
            console.log('✅ Customer info merged into contract data:', contractData);
          }
        }
        
        setSelectedContract(contractData);
        setShowDetailModal(true);
        console.log('✅ Contract details loaded successfully');
        console.log('📎 Contract Image Path:', contractData.contractImage);
      } else {
        throw new Error('Không thể tải chi tiết hợp đồng');
      }
    } catch (error) {
      console.error('❌ Error loading contract details:', error);
      alert(`Lỗi khi tải chi tiết hợp đồng: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Edit contract
  const handleEditContract = async (contract: SaleContract) => {
    console.log('🔄 Opening edit modal for contract:', contract.salesContractId);
    console.log('📝 Contract data from list:', contract);
    
    let contractData = { ...contract };
    
    // ✅ If customer info is missing but userId exists, fetch it
    if (contractData.userId && !contractData.customerName) {
      console.log('⚠️ Customer info missing, fetching from API...');
      setEditingContract(true); // Show loading state
      const customerInfo = await fetchUserInfo(contractData.userId);
      setEditingContract(false);
      
      if (customerInfo) {
        contractData = {
          ...contractData,
          ...customerInfo
        };
        console.log('✅ Customer info merged for edit:', contractData);
      }
    }
    
    const formData = {
      salesContractId: contractData.salesContractId,
      orderId: contractData.orderId,
      userId: contractData.userId, // ✅ Added
      contractDate: contractData.contractDate,
      terms: contractData.terms || '',
      signedByDealer: contractData.signedByDealer || '',
      customerName: contractData.customerName || '',
      phone: contractData.phone || '',
      email: contractData.email || '',
      paymentMethod: contractData.paymentMethod || '',
      address: contractData.address || '',
      cccd: contractData.cccd || '',
      contractImage: contractData.contractImage || '',
      contractFile: contractData.contractFile || ''
    };
    
    console.log('📝 Edit form data with customer info:', formData);
    setEditForm(formData);
    setShowEditModal(true);
    console.log('✅ Edit modal opened with full customer info');
  };

  // Update contract
  const handleUpdateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditingContract(true);

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Match backend schema exactly - all fields as strings
      const contractData = {
        salesContractId: editForm.salesContractId,
        orderId: editForm.orderId,
        contractDate: editForm.contractDate,
        terms: editForm.terms || '',
        signedByDealer: editForm.signedByDealer,
        customerName: editForm.customerName || '',
        phone: editForm.phone || '',
        email: editForm.email || '',
        paymentMethod: editForm.paymentMethod || '',
        address: editForm.address || '',
        cccd: editForm.cccd || '',
        contractImage: editForm.contractImage || '', // Backend expects contractImage (lowercase c)
        contractFile: editForm.contractFile || '' // Backend expects contractFile (lowercase c)
      };

      console.log('🔄 Updating contract with data:', contractData);
      console.log('📝 Edit Form State:', editForm);
      console.log('📝 CustomerName Debug:', {
        raw: editForm.customerName,
        type: typeof editForm.customerName,
        isNull: editForm.customerName === null,
        isEmpty: editForm.customerName === '',
        trimmed: editForm.customerName?.trim(),
        processed: contractData.customerName
      });
      const response = await fetch(`/api/SaleContract/${editForm.salesContractId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(contractData),
      });

      console.log('📡 Update Contract API Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          console.log('🔍 Update Contract API Error Data:', errorData);
          errorMessage = errorData.message || errorData.error || errorData.title || errorMessage;
        } catch {
          const errorText = await response.text();
          console.log('🔍 Update Contract API Error Text:', errorText);
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('📡 Update Contract API Response Data:', responseData);

      if (responseData.status === 200 || response.ok) {
        console.log('✅ Contract updated successfully:', responseData);
        setShowEditModal(false);
        // Refresh contracts list
        await fetchContracts();
        alert('✅ Hợp đồng đã được cập nhật thành công!');
      } else {
        throw new Error('Cập nhật hợp đồng thất bại');
      }
    } catch (error) {
      console.error('❌ Error updating contract:', error);
      alert(`Lỗi khi cập nhật hợp đồng: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setEditingContract(false);
    }
  };

  // Delete contract
  const handleDeleteContract = (contract: SaleContract) => {
    console.log('🗑️ Opening delete confirmation for contract:', contract.salesContractId);
    setContractToDelete(contract);
    setShowDeleteModal(true);
  };

  // Confirm delete contract
  const handleConfirmDelete = async () => {
    if (!contractToDelete) return;
    
    setDeletingContract(true);
    try {
      console.log(`🗑️ Deleting contract ${contractToDelete.salesContractId} via API...`);
      
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/SaleContract/${contractToDelete.salesContractId}`, {
        method: 'DELETE',
        headers,
      });

      console.log('📡 Delete Contract API Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          console.log('🔍 Delete Contract API Error Data:', errorData);
          errorMessage = errorData.message || errorData.error || errorData.title || errorMessage;
        } catch {
          const errorText = await response.text();
          console.log('🔍 Delete Contract API Error Text:', errorText);
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('📡 Delete Contract API Response Data:', responseData);

      if (response.ok || responseData.success) {
        console.log('✅ Contract deleted successfully');
        setShowDeleteModal(false);
        setContractToDelete(null);
        // Refresh contracts list
        await fetchContracts();
        alert('✅ Hợp đồng đã được xóa thành công!');
      } else {
        throw new Error('Xóa hợp đồng thất bại');
      }
    } catch (error) {
      console.error('❌ Error deleting contract:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Show more user-friendly error message
      if (errorMessage.includes('đã được sử dụng') || errorMessage.includes('foreign key')) {
        alert(`❌ ${errorMessage}\n\n💡 Gợi ý: Hợp đồng này có thể đã được sử dụng trong hệ thống và không thể xóa.`);
      } else {
        alert(`❌ Lỗi khi xóa hợp đồng: ${errorMessage}`);
      }
    } finally {
      setDeletingContract(false);
    }
  };

  // Create contract
  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingContract(true);

    try {
      // Frontend validation
      if (!createForm.orderId || createForm.orderId <= 0) {
        throw new Error('Order ID phải là số dương');
      }
      
      if (!createForm.signedByDealer || createForm.signedByDealer.trim() === '') {
        throw new Error('Tên dealer không được để trống');
      }

      if (!createForm.contractDate) {
        throw new Error('Ngày hợp đồng không được để trống');
      }
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Match backend schema exactly - all fields as strings
      const contractData = {
        salesContractId: 0, // Will be set by backend
        orderId: createForm.orderId,
        contractDate: createForm.contractDate,
        terms: createForm.terms || '',
        signedByDealer: createForm.signedByDealer,
        customerName: createForm.customerName || '',
        phone: createForm.phone || '',
        email: createForm.email || '',
        paymentMethod: createForm.paymentMethod || '',
        address: createForm.address || '',
        cccd: createForm.cccd || '',
        contractImage: createForm.contractImage || '', // Backend expects contractImage (lowercase c)
        contractFile: createForm.contractFile || '' // Backend expects contractFile (lowercase c)
      };

      console.log('🔄 Creating contract with data:', contractData);
      console.log('📤 Request body being sent:', JSON.stringify(contractData, null, 2));
      
      const response = await fetch('/api/SaleContract', {
        method: 'POST',
        headers,
        body: JSON.stringify(contractData),
      });

      console.log('📡 Create Contract API Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          console.log('🔍 Create Contract API Error Data:', errorData);
          
          // Handle validation errors
          if (response.status === 400 && errorData.errors) {
            const validationErrors = Object.values(errorData.errors).flat();
            errorMessage = `Validation errors: ${validationErrors.join(', ')}`;
          } else {
            errorMessage = errorData.message || errorData.error || errorData.title || errorMessage;
          }
        } catch {
          console.log('🔍 Failed to parse error response as JSON, trying text...');
          try {
            const errorText = await response.text();
            console.log('🔍 Create Contract API Error Text:', errorText);
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            console.log('🔍 Failed to read error response as text:', textError);
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('📡 Create Contract API Response Data:', responseData);

      console.log('✅ Contract created successfully');
      setShowCreateModal(false);
        setCreateForm({
          salesContractId: 0,
          orderId: 1,
          userId: 0, // ✅ Added
          contractDate: new Date().toISOString(),
          terms: 'Standard Terms and Conditions',
          signedByDealer: 'Dealer One',
          customerName: '',
          phone: '',
          email: '',
          paymentMethod: 'CASH',
          address: '',
          cccd: '',
          contractImage: '',
          contractFile: ''
        });
      // Refresh contracts list
      await fetchContracts();
      alert('✅ Hợp đồng đã được tạo thành công!');
    } catch (error) {
      console.error('❌ Error creating contract:', error);
      alert(`Lỗi khi tạo hợp đồng: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreatingContract(false);
    }
  };

  // Open upload modal
  const handleOpenUploadModal = (contract: SaleContract) => {
    setContractToUpload(contract);
    setAttachmentImageFile(null);
    setAttachmentFile(null);
    setShowUploadModal(true);
  };

  // Upload attachments
  const handleUploadAttachments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractToUpload) return;

    if (!attachmentImageFile && !attachmentFile) {
      alert('❌ Vui lòng chọn ít nhất một tệp để upload!');
      return;
    }

    setUploadingAttachments(true);

    try {
      console.log('📤 Uploading attachments for contract:', contractToUpload.salesContractId);
      const response = await saleService.uploadSaleContractAttachments(
        contractToUpload.salesContractId,
        attachmentImageFile,
        attachmentFile
      );

      if (response.success) {
        console.log('✅ Attachments uploaded successfully:', response);
        alert(`✅ Upload tệp đính kèm thành công!\n📎 ${response.message}`);
        setShowUploadModal(false);
        setContractToUpload(null);
        setAttachmentImageFile(null);
        setAttachmentFile(null);
        // Refresh contracts list
        await fetchContracts();
      } else {
        console.error('❌ Failed to upload attachments:', response.message);
        alert(`❌ Lỗi khi upload tệp đính kèm: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Error uploading attachments:', error);
      alert(`Lỗi khi upload tệp đính kèm: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploadingAttachments(false);
    }
  };

  // Filter contracts
  const filteredContracts = contracts.filter(contract =>
    contract.salesContractId.toString().includes(searchTerm) ||
    contract.signedByDealer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.phone?.includes(searchTerm)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 mb-6 border border-orange-200">
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
              <div className="text-2xl font-bold text-green-600">{contracts.filter(c => c.contractImage).length}</div>
              <div className="text-sm text-gray-600">Có hợp đồng</div>
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
          <div className="flex items-center gap-3">
            <button
              onClick={fetchContracts}
              disabled={loading}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-50 text-sm"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Làm mới</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-md transition-all duration-200 hover:shadow-lg text-sm"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Mẫu Hợp đồng</span>
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
              <div key={contract.salesContractId} className="p-6 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-300">
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
                            Hợp đồng #{contract.salesContractId}
                          </h3>
                          {contract.contractImage && (
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              Có hợp đồng
                          </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-600">Ngày tạo</p>
                              <p className="font-semibold text-gray-900">{formatDate(contract.contractDate)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                            <User className="h-5 w-5 text-purple-600" />
                            <div>
                              <p className="text-xs text-gray-600">Dealer</p>
                              <p className="font-semibold text-gray-900">{contract.signedByDealer}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <FileText className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="text-xs text-gray-600">Order ID</p>
                              <p className="font-semibold text-gray-900">#{contract.orderId}</p>
                            </div>
                          </div>
                        </div>

                        {/* Additional Info */}
                          <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                          {contract.customerName && <span>👤 {contract.customerName}</span>}
                          {contract.phone && <span>📞 {contract.phone}</span>}
                            {contract.paymentMethod && (
                              <span>💳 {getPaymentMethodText(contract.paymentMethod)}</span>
                            )}
                          </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-6">
                    <button
                      onClick={() => handleViewContract(contract)}
                      disabled={loadingDetail}
                      className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 disabled:opacity-50 hover:shadow-md"
                      title="Xem chi tiết"
                    >
                      {loadingDetail ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEditContract(contract)}
                      className="p-2 text-green-600 hover:text-white hover:bg-green-600 rounded-lg transition-all duration-200 hover:shadow-md"
                      title="Chỉnh sửa"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteContract(contract)}
                      className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 hover:shadow-md"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
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
                    <h2 className="text-2xl font-bold">Chi tiết hợp đồng #{selectedContract.salesContractId}</h2>
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
                        <span className="text-white font-bold text-sm">#{selectedContract.salesContractId}</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">ID Hợp đồng</p>
                        <p className="font-semibold text-gray-900">{selectedContract.salesContractId}</p>
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
                      <FileText className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-xs text-gray-600">Order ID</p>
                        <p className="font-semibold text-gray-900">#{selectedContract.orderId}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                      <User className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-xs text-gray-600">Dealer</p>
                        <p className="font-semibold text-gray-900">{selectedContract.signedByDealer}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Thông tin khách hàng</h3>
                  
                  <div className="space-y-3">
                    {selectedContract.customerName ? (
                    <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                      <User className="h-5 w-5 text-orange-600" />
                      <div>
                          <p className="text-xs text-gray-600">Tên khách hàng</p>
                          <p className="font-semibold text-gray-900">{selectedContract.customerName}</p>
                      </div>
                    </div>
                    ) : (
                      <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
                        <User className="h-5 w-5 text-gray-400" />
                      <div>
                          <p className="text-xs text-gray-500">Chưa có thông tin khách hàng</p>
                      </div>
                    </div>
                    )}

                    {selectedContract.phone && (
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-600">Số điện thoại</p>
                          <p className="font-semibold text-gray-900">{selectedContract.phone}</p>
                        </div>
                      </div>
                    )}

                    {selectedContract.email && (
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-600">Email</p>
                          <p className="font-semibold text-gray-900">{selectedContract.email}</p>
                        </div>
                      </div>
                    )}

                    {selectedContract.cccd && (
                      <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-600">CCCD</p>
                          <p className="font-semibold text-gray-900">{selectedContract.cccd}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              {selectedContract.paymentMethod && (
              <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Thông tin thanh toán</h3>
                
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Phương thức thanh toán:</span>
                        <span className="font-semibold text-lg">{getPaymentMethodText(selectedContract.paymentMethod)}</span>
                    </div>
                  </div>
                      </div>
                    )}

              {/* Attachment Files */}
              {(selectedContract.contractImage || selectedContract.contractFile) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Tệp đính kèm</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    {selectedContract.contractImage && (
                      <div className="bg-gradient-to-br from-purple-50 via-purple-25 to-pink-50 rounded-2xl p-4 border-2 border-purple-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                  </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 mb-1">Ảnh hợp đồng</p>
                              <p className="text-gray-600 text-xs truncate overflow-hidden">{selectedContract.contractImage.split('/').pop() || selectedContract.contractImage}</p>
                </div>
              </div>
                          <div className="flex space-x-2 flex-shrink-0 w-full sm:w-auto">
                            <a
                              href={`https://localhost:7216${selectedContract.contractImage.startsWith('/') ? '' : '/'}${selectedContract.contractImage}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center justify-center space-x-1 shadow-md hover:shadow-lg flex-1 sm:flex-none"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Xem</span>
                            </a>
                            <a
                              href={`https://localhost:7216${selectedContract.contractImage.startsWith('/') ? '' : '/'}${selectedContract.contractImage}`}
                              download
                              className="px-3 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-medium rounded-lg hover:from-purple-200 hover:to-pink-200 transition-all duration-200 flex items-center justify-center space-x-1 border border-purple-200 flex-1 sm:flex-none"
                            >
                              <Download className="h-3 w-3" />
                              <span>Tải</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedContract.contractFile && (
                      <div className="bg-gradient-to-br from-blue-50 via-blue-25 to-indigo-50 rounded-2xl p-4 border-2 border-blue-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                              <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 mb-1">Tệp hợp đồng</p>
                              <p className="text-gray-600 text-xs truncate overflow-hidden">{selectedContract.contractFile.split('/').pop() || selectedContract.contractFile}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0 w-full sm:w-auto">
                            <a
                              href={`https://localhost:7216${selectedContract.contractFile.startsWith('/') ? '' : '/'}${selectedContract.contractFile}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-1 shadow-md hover:shadow-lg flex-1 sm:flex-none"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Xem</span>
                            </a>
                            <a
                              href={`https://localhost:7216${selectedContract.contractFile.startsWith('/') ? '' : '/'}${selectedContract.contractFile}`}
                              download
                              className="px-3 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs font-medium rounded-lg hover:from-blue-200 hover:to-indigo-200 transition-all duration-200 flex items-center justify-center space-x-1 border border-blue-200 flex-1 sm:flex-none"
                            >
                              <Download className="h-3 w-3" />
                              <span>Tải</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              {(selectedContract.address || selectedContract.terms) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Thông tin bổ sung</h3>
                  
                  <div className="space-y-4">
                    {selectedContract.address && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Địa chỉ</h4>
                        <p className="text-gray-900">{selectedContract.address}</p>
                      </div>
                    )}

                    {selectedContract.terms && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Điều khoản</h4>
                        <p className="text-gray-900">{selectedContract.terms}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-8">
                {/* File attachment indicator */}
                {(selectedContract.contractImage || selectedContract.contractFile) && (
                  <div className="mb-3">
                    <span className="text-xs text-gray-600 font-medium">Tệp đính kèm đã upload:</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {selectedContract.contractImage && (
                    <a 
                      href={`https://localhost:7216${selectedContract.contractImage.startsWith('/') ? '' : '/'}${selectedContract.contractImage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 text-xs font-medium flex items-center gap-1.5 shadow-md hover:shadow-lg"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Xem ảnh</span>
                    </a>
                  )}
                  {selectedContract.contractFile && (
                    <a 
                      href={`https://localhost:7216${selectedContract.contractFile.startsWith('/') ? '' : '/'}${selectedContract.contractFile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-xs font-medium flex items-center gap-1.5 shadow-md hover:shadow-lg"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Xem tài liệu</span>
                    </a>
                  )}
                  
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      if (selectedContract) handleEditContract(selectedContract);
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 text-xs font-medium flex items-center gap-1.5 shadow-md hover:shadow-lg"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Chỉnh sửa</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      if (selectedContract) handleOpenUploadModal(selectedContract);
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 text-xs font-medium flex items-center gap-1.5 shadow-md hover:shadow-lg"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload tệp</span>
                  </button>
                  
                <button
                  onClick={() => setShowDetailModal(false)}
                    className="px-3 py-1.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-xs font-medium"
                >
                  Đóng
                </button>

                  {!(selectedContract.contractImage || selectedContract.contractFile) && (
                <button
                      onClick={() => {
                        setShowDetailModal(false);
                        if (selectedContract) handleOpenUploadModal(selectedContract);
                      }}
                      className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 text-xs font-medium flex items-center gap-1.5 shadow-md hover:shadow-lg"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload tệp</span>
                    </button>
                  )}
                </div>

                {/* Upload hint for empty state */}
                {!(selectedContract.contractImage || selectedContract.contractFile) && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">Chưa có tệp đính kèm nào</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Contract Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Edit className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Chỉnh sửa hợp đồng #{editForm.salesContractId}</h2>
                    <p className="text-green-100 text-sm">Cập nhật thông tin hợp đồng bán hàng</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-white hover:text-green-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                  disabled={editingContract}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <form id="edit-contract-form" onSubmit={handleUpdateContract} className="space-y-6">
                {/* Grid Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Order ID */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span>Order ID *</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={editForm.orderId}
                      onChange={(e) => setEditForm({...editForm, orderId: parseInt(e.target.value)})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                  </div>

                  {/* Contract Date */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span>Ngày hợp đồng *</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={editForm.contractDate.slice(0, 16)}
                      onChange={(e) => setEditForm({...editForm, contractDate: new Date(e.target.value).toISOString()})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                  </div>

                  {/* Signed By Dealer */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <User className="h-4 w-4 text-green-600" />
                      <span>Dealer *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.signedByDealer}
                      onChange={(e) => setEditForm({...editForm, signedByDealer: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập tên dealer"
                    />
                  </div>

                  {/* Customer Name */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <User className="h-4 w-4 text-green-600" />
                      <span>Tên khách hàng</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.customerName || ''}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        console.log('📝 CustomerName onChange:', newValue);
                        setEditForm({...editForm, customerName: newValue});
                      }}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập tên khách hàng"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>Số điện thoại</span>
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>Email</span>
                    </label>
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập email"
                    />
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span>Phương thức thanh toán</span>
                    </label>
                    <select
                      value={editForm.paymentMethod || ''}
                      onChange={(e) => setEditForm({...editForm, paymentMethod: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                    >
                      <option value="">Chọn phương thức</option>
                      <option value="CASH">Tiền mặt</option>
                      <option value="BANK_TRANSFER">Chuyển khoản</option>
                      <option value="CREDIT_CARD">Thẻ tín dụng</option>
                      <option value="INSTALLMENT">Trả góp</option>
                    </select>
                  </div>

                  {/* CCCD */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      <span>CCCD</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.cccd || ''}
                      onChange={(e) => setEditForm({...editForm, cccd: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập số CCCD"
                    />
                  </div>
                </div>

                {/* Full Width Fields */}
                <div className="space-y-6">
                  {/* Address */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Địa chỉ</span>
                    </label>
                    <textarea
                      value={editForm.address || ''}
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                      rows={2}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập địa chỉ"
                    />
                  </div>

                  {/* Terms */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span>Điều khoản</span>
                    </label>
                    <textarea
                      value={editForm.terms}
                      onChange={(e) => setEditForm({...editForm, terms: e.target.value})}
                      rows={3}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập điều khoản hợp đồng"
                    />
                  </div>

                  {/* Contract Image */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Ảnh hợp đồng</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setEditForm({...editForm, contractImage: file.name});
                        }
                      }}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    {editForm.contractImage && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Hiện tại: {editForm.contractImage}</span>
                      </div>
                    )}
                  </div>

                  {/* Contract File */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Tệp hợp đồng</span>
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setEditForm({...editForm, contractFile: file.name});
                        }
                      }}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    {editForm.contractFile && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Hiện tại: {editForm.contractFile}</span>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 rounded-b-2xl flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium text-sm"
                disabled={editingContract}
              >
                Hủy
              </button>
              <button
                type="submit"
                form="edit-contract-form"
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all duration-200 font-medium shadow-md text-sm"
                disabled={editingContract}
              >
                {editingContract && (
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                )}
                <Edit className="h-3.5 w-3.5" />
                <span>{editingContract ? 'Đang cập nhật...' : 'Cập nhật'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Contract Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Tạo hợp đồng mới</h2>
                    <p className="text-orange-100 text-sm">Tạo hợp đồng bán hàng mới</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-white hover:text-orange-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                  disabled={creatingContract}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <form id="create-contract-form" onSubmit={handleCreateContract} className="space-y-6">
                {/* Grid Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Order ID */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <FileText className="h-4 w-4 text-orange-600" />
                      <span>Order ID *</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={createForm.orderId}
                      onChange={(e) => setCreateForm({...createForm, orderId: parseInt(e.target.value)})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                  </div>

                  {/* Contract Date */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <span>Ngày hợp đồng *</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={createForm.contractDate.slice(0, 16)}
                      onChange={(e) => setCreateForm({...createForm, contractDate: new Date(e.target.value).toISOString()})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                  </div>

                  {/* Signed By Dealer */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <User className="h-4 w-4 text-orange-600" />
                      <span>Dealer *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.signedByDealer}
                      onChange={(e) => setCreateForm({...createForm, signedByDealer: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập tên dealer"
                    />
                  </div>

                  {/* Customer Name */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <User className="h-4 w-4 text-orange-600" />
                      <span>Tên khách hàng</span>
                    </label>
                    <input
                      type="text"
                      value={createForm.customerName || ''}
                      onChange={(e) => setCreateForm({...createForm, customerName: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập tên khách hàng"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>Số điện thoại</span>
                    </label>
                    <input
                      type="tel"
                      value={createForm.phone || ''}
                      onChange={(e) => setCreateForm({...createForm, phone: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>Email</span>
                    </label>
                    <input
                      type="email"
                      value={createForm.email || ''}
                      onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập email"
                    />
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span>Phương thức thanh toán</span>
                    </label>
                    <select
                      value={createForm.paymentMethod || ''}
                      onChange={(e) => setCreateForm({...createForm, paymentMethod: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                    >
                      <option value="">Chọn phương thức</option>
                      <option value="CASH">Tiền mặt</option>
                      <option value="BANK_TRANSFER">Chuyển khoản</option>
                      <option value="CREDIT_CARD">Thẻ tín dụng</option>
                      <option value="INSTALLMENT">Trả góp</option>
                    </select>
                  </div>

                  {/* CCCD */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      <span>CCCD</span>
                    </label>
                    <input
                      type="text"
                      value={createForm.cccd || ''}
                      onChange={(e) => setCreateForm({...createForm, cccd: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập số CCCD"
                    />
                  </div>
                </div>

                {/* Full Width Fields */}
                <div className="space-y-6">
                  {/* Address */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Địa chỉ</span>
                    </label>
                    <textarea
                      value={createForm.address || ''}
                      onChange={(e) => setCreateForm({...createForm, address: e.target.value})}
                      rows={2}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập địa chỉ"
                    />
                  </div>

                  {/* Terms */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <FileText className="h-4 w-4 text-orange-600" />
                      <span>Điều khoản</span>
                    </label>
                    <textarea
                      value={createForm.terms}
                      onChange={(e) => setCreateForm({...createForm, terms: e.target.value})}
                      rows={3}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập điều khoản hợp đồng"
                    />
                  </div>

                  {/* Contract Image */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Ảnh hợp đồng *</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCreateForm({...createForm, contractImage: file.name});
                        }
                      }}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-gray-50 focus:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                      required
                    />
                    {createForm.contractImage && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Đã chọn: {createForm.contractImage}</span>
                      </div>
                    )}
                  </div>

                  {/* Contract File */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Tệp hợp đồng *</span>
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCreateForm({...createForm, contractFile: file.name});
                        }
                      }}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-gray-50 focus:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                      required
                    />
                    {createForm.contractFile && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Đã chọn: {createForm.contractFile}</span>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 rounded-b-2xl flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium text-sm"
                disabled={creatingContract}
              >
                Hủy
              </button>
              <button
                type="submit"
                form="create-contract-form"
                className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all duration-200 font-medium shadow-md text-sm"
                disabled={creatingContract}
              >
                {creatingContract && (
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                )}
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>{creatingContract ? 'Đang tạo...' : 'Tạo mới'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Mẫu Hợp đồng</h2>
                    <p className="text-indigo-100 text-sm">Tham khảo mẫu hợp đồng bán hàng chuẩn</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-white hover:text-indigo-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* File Display */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border-2 border-gray-200 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-700">Hợp đồng mua bán xe máy mẫu</p>
                    <p className="text-sm text-gray-500">File hợp đồng chuẩn để tham khảo</p>
                  </div>
                </div>
                
                {/* File Container */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700">hop-dong-mua-ban-xe-may.doc</p>
                      <p className="text-xs text-gray-500">Microsoft Word Document</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      📄 DOC
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-2">
                <a 
                  href="/files/hop-dong-mua-ban-xe-may.doc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm"
                >
                  <Eye className="h-4 w-4" />
                  <span>Xem file</span>
                </a>
                <a 
                  href="/files/hop-dong-mua-ban-xe-may.doc"
                  download="mau-hop-dong-mua-ban-xe-may.doc"
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Tải xuống</span>
                </a>
              </div>

              {/* Info */}
              <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <svg className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold text-blue-800 mb-1">Hướng dẫn sử dụng</h3>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• <strong>Xem file gốc:</strong> Mở file trong tab mới (cần Microsoft Word hoặc tương đương)</p>
                      <p>• <strong>Tải xuống:</strong> Tải file hợp đồng mẫu về máy để tham khảo</p>
                      <p>• <strong>Tham khảo:</strong> Sử dụng mẫu này để tạo hợp đồng có cấu trúc tương tự</p>
                      <p>• <strong>Lưu ý:</strong> File .doc cần phần mềm hỗ trợ để xem nội dung</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium text-sm"
              >
                Đóng
                </button>
              </div>
            </div>
          </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && contractToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Trash2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Xác nhận xóa</h2>
                    <p className="text-red-100 text-sm">Xóa hợp đồng #{contractToDelete.salesContractId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-white hover:text-red-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                  disabled={deletingContract}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-8 w-8 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Bạn có chắc chắn muốn xóa hợp đồng này?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Hợp đồng #{contractToDelete.salesContractId} sẽ bị xóa vĩnh viễn và không thể khôi phục.
                  </p>
                </div>
              </div>

              {/* Contract Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Thông tin hợp đồng sẽ bị xóa:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID Hợp đồng:</span>
                    <span className="font-semibold">#{contractToDelete.salesContractId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-semibold">#{contractToDelete.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dealer:</span>
                    <span className="font-semibold">{contractToDelete.signedByDealer}</span>
                  </div>
                  {contractToDelete.customerName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Khách hàng:</span>
                      <span className="font-semibold">{contractToDelete.customerName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày tạo:</span>
                    <span className="font-semibold">{formatDate(contractToDelete.contractDate)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Cảnh báo</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>Hành động này không thể hoàn tác. Hợp đồng sẽ bị xóa vĩnh viễn khỏi hệ thống.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 rounded-b-2xl flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium text-sm"
                disabled={deletingContract}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletingContract}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all duration-200 font-medium shadow-md text-sm"
              >
                {deletingContract && (
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                )}
                <Trash2 className="h-3.5 w-3.5" />
                <span>{deletingContract ? 'Đang xóa...' : 'Xóa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Attachments Modal */}
      {showUploadModal && contractToUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Upload tệp đính kèm</h2>
                    <p className="text-purple-100 text-sm">Hợp đồng #{contractToUpload.salesContractId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-white hover:text-purple-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                  disabled={uploadingAttachments}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <form id="upload-attachments-form" onSubmit={handleUploadAttachments} className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Ảnh hợp đồng</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAttachmentImageFile(e.target.files?.[0] || null)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  {attachmentImageFile && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Đã chọn: {attachmentImageFile.name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Tệp hợp đồng</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  {attachmentFile && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Đã chọn: {attachmentFile.name}</span>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 rounded-b-2xl flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium text-sm"
                disabled={uploadingAttachments}
              >
                Hủy
              </button>
              <button
                type="submit"
                form="upload-attachments-form"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all duration-200 font-medium shadow-md text-sm"
                disabled={uploadingAttachments}
              >
                {uploadingAttachments && (
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                )}
                <Upload className="h-3.5 w-3.5" />
                <span>{uploadingAttachments ? 'Đang upload...' : 'Upload'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
