import React, { useState, useEffect } from 'react';
import { Search, Percent, Calendar, Tag, DollarSign, User, Eye, Edit, AlertTriangle, Plus, X, CreditCard, Trash2, Car, Sparkles } from 'lucide-react';
import { discountService, Discount, CreateDiscountRequest, UpdateDiscountRequest } from '../../../services/discountService';
import { vehicleService } from '../../../services/vehicleService';
import { Vehicle } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';

export const PricingManagement: React.FC = () => {
  const { user } = useAuth();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState<Discount | null>(null);
  const [discountToApply, setDiscountToApply] = useState<Discount | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number>(0);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [creatingDiscount, setCreatingDiscount] = useState(false);
  const [updatingDiscount, setUpdatingDiscount] = useState(false);
  const [deletingDiscount, setDeletingDiscount] = useState(false);
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [removingDiscount, setRemovingDiscount] = useState(false);
  const [createForm, setCreateForm] = useState<CreateDiscountRequest>({
    discountId: 0,
    userId: 0,
    discountCode: '',
    discountName: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE'
  });
  const [editForm, setEditForm] = useState<UpdateDiscountRequest>({
    discountId: 0,
    userId: 0,
    discountCode: '',
    discountName: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    startDate: '',
    endDate: '',
    status: 'ACTIVE'
  });

  // Vérifier le rôle evm_staff
  useEffect(() => {
    if (user && user.role !== 'evm_staff') {
      setError('Bạn không có quyền truy cập trang này. Chỉ nhân viên EVM mới có thể truy cập.');
    }
  }, [user]);

  // Charger les discounts et véhicules au montage du composant
  useEffect(() => {
    if (user?.role === 'evm_staff') {
      fetchDiscounts();
      fetchVehicles();
    }
  }, [user]);

  // Charger la liste des véhicules
  const fetchVehicles = async () => {
    setLoadingVehicles(true);
    try {
      console.log('🚗 Chargement de la liste des véhicules...');
      const response = await vehicleService.getVehicles();
      if (response.success && response.data) {
        setVehicles(response.data);
        console.log('✅ Véhicules chargés:', response.data.length);
      } else {
        console.log('⚠️ Aucun véhicule trouvé');
        setVehicles([]);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des véhicules:', error);
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  // Récupérer les discounts depuis l'API
  const fetchDiscounts = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Récupération des discounts depuis l\'API...');
      const response = await discountService.getDiscounts();
      console.log('📡 Réponse API Discounts:', response);
      console.log('📡 Response data type:', typeof response.data);
      console.log('📡 Response data is array?', Array.isArray(response.data));
      console.log('📡 Response data length:', response.data?.length);

      if (response.success) {
        const discountsArray = Array.isArray(response.data) ? response.data : [];
        setDiscounts(discountsArray);
        console.log('✅ Discounts chargés depuis l\'API:', discountsArray.length);
        console.log('✅ Discounts data:', discountsArray);
      } else {
        console.log('❌ L\'API a retourné success=false');
        setDiscounts([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des discounts:', error);
      setError(error instanceof Error ? error.message : 'Lỗi khi tải danh sách giảm giá');
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  // Voir les détails d'un discount
  const handleViewDiscount = async (discount: Discount) => {
    try {
      // Récupérer les détails depuis l'API
      const response = await discountService.getDiscountById(discount.discountId);
      if (response.success && response.data) {
        setSelectedDiscount(response.data);
      } else {
        // Fallback vers les données locales
        setSelectedDiscount(discount);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      // Fallback vers les données locales
      setSelectedDiscount(discount);
    }
    setShowDetailModal(true);
  };

  // Fonction helper pour formater la date en YYYY-MM-DD
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    // Si la date contient 'T', c'est un format ISO datetime
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    // Si c'est déjà au format YYYY-MM-DD, retourner tel quel
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    // Sinon, essayer de parser la date
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

  // Ouvrir le modal d'édition
  const handleEditDiscount = async (discount: Discount) => {
    try {
      // Récupérer les détails complets depuis l'API
      const response = await discountService.getDiscountById(discount.discountId);
      if (response.success && response.data) {
        const discountData = response.data;
        setEditForm({
          discountId: discountData.discountId,
          userId: discountData.userId,
          discountCode: discountData.discountCode,
          discountName: discountData.discountName,
          discountType: discountData.discountType,
          discountValue: discountData.discountValue,
          startDate: formatDateForInput(discountData.startDate),
          endDate: formatDateForInput(discountData.endDate),
          status: discountData.status
        });
      } else {
        // Fallback vers les données locales
        setEditForm({
          discountId: discount.discountId,
          userId: discount.userId,
          discountCode: discount.discountCode,
          discountName: discount.discountName,
          discountType: discount.discountType,
          discountValue: discount.discountValue,
          startDate: formatDateForInput(discount.startDate),
          endDate: formatDateForInput(discount.endDate),
          status: discount.status
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      // Fallback vers les données locales
      setEditForm({
        discountId: discount.discountId,
        userId: discount.userId,
        discountCode: discount.discountCode,
        discountName: discount.discountName,
        discountType: discount.discountType,
        discountValue: discount.discountValue,
        startDate: formatDateForInput(discount.startDate),
        endDate: formatDateForInput(discount.endDate),
        status: discount.status
      });
    }
    setShowEditModal(true);
  };

  // Mettre à jour un discount
  const handleUpdateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingDiscount(true);
    setError(null);
    setSuccess(null);

    try {
      // Convertir le type de discount pour la base de données
      const dbDiscountType = convertDiscountTypeForDB(editForm.discountType);
      console.log('🔄 Conversion du type de discount (édition):', {
        original: editForm.discountType,
        converted: dbDiscountType
      });
      
      const discountData: UpdateDiscountRequest = {
        discountId: editForm.discountId,
        userId: editForm.userId,
        discountCode: editForm.discountCode.trim(),
        discountName: editForm.discountName.trim(),
        discountType: dbDiscountType, // Utiliser la valeur convertie ('percent' ou 'amount')
        discountValue: Number(editForm.discountValue) || 0,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        status: editForm.status
      };

      console.log('🔄 Mise à jour du discount avec les données:', discountData);
      const response = await discountService.updateDiscount(editForm.discountId, discountData);

      if (response.success) {
        console.log('✅ Discount mis à jour avec succès:', response);
        setShowEditModal(false);
        // Rafraîchir la liste des discounts
        await fetchDiscounts();
        setSuccess('✅ Giảm giá đã được cập nhật thành công!');
      } else {
        console.error('❌ Échec de la mise à jour du discount:', response.message);
        setError(`❌ Lỗi khi cập nhật giảm giá: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du discount:', error);
      setError(`Lỗi khi cập nhật giảm giá: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUpdatingDiscount(false);
    }
  };

  // Ouvrir le modal de suppression
  const handleDeleteDiscount = (discount: Discount) => {
    setDiscountToDelete(discount);
    setShowDeleteModal(true);
  };

  // Confirmer la suppression
  const handleConfirmDelete = async () => {
    if (!discountToDelete) return;

    setDeletingDiscount(true);
    setError(null);
    setSuccess(null);

    try {
      console.log(`🗑️ Suppression du discount ${discountToDelete.discountId} via l'API...`);
      const response = await discountService.deleteDiscount(discountToDelete.discountId);

      if (response.success) {
        console.log('✅ Discount supprimé avec succès');
        // Fermer le modal immédiatement
        setShowDeleteModal(false);
        setDiscountToDelete(null);
        setDeletingDiscount(false);
        
        // Afficher le message de succès
        setSuccess('✅ Giảm giá đã được xóa thành công!');
        
        // Rafraîchir la liste des discounts avec loading
        setLoading(true);
        await fetchDiscounts();
        
        // Auto-fermer le message de succès après 5 secondes
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      } else {
        console.error('❌ Échec de la suppression du discount:', response.message);
        setError(`❌ Lỗi khi xóa giảm giá: ${response.message}`);
        setDeletingDiscount(false);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du discount:', error);
      
      // Fermer le modal même en cas d'erreur après un court délai
      setTimeout(() => {
        setShowDeleteModal(false);
        setDiscountToDelete(null);
      }, 2000);
      
      let errorMessage = 'Lỗi khi xóa giảm giá';
      if (error instanceof Error) {
        // Si l'erreur est liée au parsing JSON mais que la suppression a réussi (status 200)
        if (error.message.includes('JSON') || error.message.includes('Unexpected token')) {
          // L'API a probablement retourné du texte brut au lieu de JSON
          // Si le status était 200, considérer comme succès
          console.log('⚠️ Erreur de parsing JSON mais status 200 - suppression probablement réussie');
          setShowDeleteModal(false);
          setDiscountToDelete(null);
          setSuccess('✅ Giảm giá đã được xóa thành công!');
          setLoading(true);
          fetchDiscounts().finally(() => {
            setLoading(false);
            setTimeout(() => setSuccess(null), 5000);
          });
          setDeletingDiscount(false);
          return;
        }
        errorMessage = `Lỗi: ${error.message}`;
      }
      
      setError(errorMessage);
      setDeletingDiscount(false);
    }
  };

  // Ouvrir le modal d'application
  const handleApplyDiscount = (discount: Discount) => {
    setDiscountToApply(discount);
    setSelectedVehicleId(0);
    setShowApplyModal(true);
  };

  // Confirmer l'application du discount
  const handleConfirmApply = async () => {
    if (!discountToApply || !selectedVehicleId || selectedVehicleId === 0) {
      setError('Vui lòng chọn một xe để áp dụng giảm giá.');
      return;
    }

    setApplyingDiscount(true);
    setError(null);
    setSuccess(null);

    try {
      console.log(`🎯 Application du discount ${discountToApply.discountId} au véhicule ${selectedVehicleId}...`);
      const response = await discountService.applyDiscountToVehicle(selectedVehicleId, discountToApply.discountId);

      if (response.success) {
        console.log('✅ Discount appliqué avec succès');
        setShowApplyModal(false);
        setDiscountToApply(null);
        setSelectedVehicleId(0);
        setSuccess('✅ Giảm giá đã được áp dụng cho xe thành công!');
        
        // Auto-fermer le message après 5 secondes
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      } else {
        console.error('❌ Échec de l\'application du discount:', response.message);
        setError(`❌ Lỗi khi áp dụng giảm giá: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'application du discount:', error);
      setError(`Lỗi khi áp dụng giảm giá: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setApplyingDiscount(false);
    }
  };

  // Ouvrir le modal de retrait
  const handleRemoveDiscount = () => {
    setSelectedVehicleId(0);
    setShowRemoveModal(true);
  };

  // Confirmer le retrait du discount
  const handleConfirmRemove = async () => {
    if (!selectedVehicleId || selectedVehicleId === 0) {
      setError('Vui lòng chọn một xe để gỡ giảm giá.');
      return;
    }

    setRemovingDiscount(true);
    setError(null);
    setSuccess(null);

    try {
      console.log(`🗑️ Retrait du discount du véhicule ${selectedVehicleId}...`);
      const response = await discountService.removeDiscountFromVehicle(selectedVehicleId);

      if (response.success) {
        console.log('✅ Discount retiré avec succès');
        setShowRemoveModal(false);
        setSelectedVehicleId(0);
        setSuccess('✅ Giảm giá đã được gỡ khỏi xe thành công!');
        
        // Auto-fermer le message après 5 secondes
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      } else {
        console.error('❌ Échec du retrait du discount:', response.message);
        setError(`❌ Lỗi khi gỡ giảm giá: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors du retrait du discount:', error);
      setError(`Lỗi khi gỡ giảm giá: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setRemovingDiscount(false);
    }
  };

  // Convertir le type de discount pour la base de données
  const convertDiscountTypeForDB = (type: string): string => {
    const normalized = type.toUpperCase();
    // La base de données attend 'percent' ou 'amount' (minuscules)
    if (normalized === 'PERCENTAGE' || normalized === 'PERCENT') {
      return 'percent';
    }
    if (normalized === 'FIXED' || normalized === 'AMOUNT') {
      return 'amount';
    }
    // Si c'est déjà correct, retourner tel quel
    return type.toLowerCase();
  };

  // Créer un discount
  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingDiscount(true);
    setError(null);
    setSuccess(null);

    try {
      // Récupérer l'ID utilisateur depuis le contexte ou le formulaire
      // Si user.id existe, essayer de le convertir en nombre
      let userId = 0;
      if (user?.id) {
        const parsedId = parseInt(user.id);
        userId = isNaN(parsedId) ? 0 : parsedId;
      }
      // Si userId est toujours 0, utiliser celui du formulaire
      if (userId === 0 && createForm.userId > 0) {
        userId = createForm.userId;
      }
      
      // Convertir le type de discount pour la base de données
      const dbDiscountType = convertDiscountTypeForDB(createForm.discountType);
      console.log('🔄 Conversion du type de discount:', {
        original: createForm.discountType,
        converted: dbDiscountType
      });
      
      const discountData: CreateDiscountRequest = {
        discountId: 0,
        userId: userId,
        discountCode: createForm.discountCode.trim(),
        discountName: createForm.discountName.trim(),
        discountType: dbDiscountType, // Utiliser la valeur convertie ('percent' ou 'amount')
        discountValue: Number(createForm.discountValue) || 0,
        startDate: createForm.startDate,
        endDate: createForm.endDate,
        status: createForm.status
      };

      console.log('🔄 Création du discount avec les données:', discountData);
      const response = await discountService.createDiscount(discountData);

      if (response.success) {
        console.log('✅ Discount créé avec succès:', response);
        setShowCreateModal(false);
        // Réinitialiser le formulaire
        setCreateForm({
          discountId: 0,
          userId: 0,
          discountCode: '',
          discountName: '',
          discountType: 'PERCENTAGE',
          discountValue: 0,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          status: 'ACTIVE'
        });
        // Rafraîchir la liste des discounts
        await fetchDiscounts();
        setSuccess('✅ Giảm giá đã được tạo thành công!');
      } else {
        console.error('❌ Échec de la création du discount:', response.message);
        setError(`❌ Lỗi khi tạo giảm giá: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création du discount:', error);
      let errorMessage = 'Lỗi khi tạo giảm giá';
      
      if (error instanceof Error) {
        // Extraire un message d'erreur plus lisible
        if (error.message.includes('CHECK constraint') || error.message.includes('discount_type')) {
          errorMessage = 'Lỗi: Loại giảm giá không hợp lệ. Vui lòng chọn "Phần trăm (%)" hoặc "Số tiền cố định (VND)".';
        } else if (error.message.includes('500')) {
          errorMessage = 'Lỗi server: Vui lòng kiểm tra lại thông tin và thử lại.';
        } else {
          errorMessage = `Lỗi: ${error.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setCreatingDiscount(false);
    }
  };

  // Filtrer les discounts
  const filteredDiscounts = discounts.filter(discount =>
    discount.discountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discount.discountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discount.discountId.toString().includes(searchTerm)
  );

  // Normaliser le type de discount (gérer 'percent'/'amount' et 'PERCENTAGE'/'FIXED')
  const normalizeDiscountType = (type: string): 'PERCENTAGE' | 'FIXED' => {
    const normalized = type.toUpperCase();
    if (normalized === 'PERCENT' || normalized === 'PERCENTAGE') {
      return 'PERCENTAGE';
    }
    if (normalized === 'AMOUNT' || normalized === 'FIXED') {
      return 'FIXED';
    }
    return normalized as 'PERCENTAGE' | 'FIXED';
  };

  // Vérifier si le discount est un pourcentage
  const isPercentageDiscount = (discount: Discount): boolean => {
    const normalized = normalizeDiscountType(discount.discountType);
    return normalized === 'PERCENTAGE';
  };

  // Formater le prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Vérifier si le discount est actif
  const isDiscountActive = (discount: Discount) => {
    const now = new Date();
    const start = new Date(discount.startDate);
    const end = new Date(discount.endDate);
    return now >= start && now <= end && discount.status === 'ACTIVE';
  };

  // Obtenir le badge de statut
  const getStatusBadge = (discount: Discount) => {
    const now = new Date();
    const start = new Date(discount.startDate);
    const end = new Date(discount.endDate);

    if (discount.status === 'INACTIVE') {
      return <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">Không hoạt động</span>;
    } else if (now < start) {
      return <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">Sắp diễn ra</span>;
    } else if (now > end) {
      return <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">Đã hết hạn</span>;
    } else {
      return <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Đang diễn ra</span>;
    }
  };

  // Compter les discounts actifs
  const activeDiscountsCount = discounts.filter(d => isDiscountActive(d)).length;

  // Si l'utilisateur n'est pas evm_staff, afficher un message d'erreur
  if (user && user.role !== 'evm_staff') {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md shadow-lg border border-red-200">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Không có quyền truy cập</h2>
          </div>
          <p className="text-gray-600">
            Chỉ nhân viên EVM mới có thể truy cập trang quản lý giá và khuyến mãi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 mb-6 border border-blue-200">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Quản lý giá & Khuyến mãi</h1>
                <p className="text-gray-600 mt-1">Xem và quản lý các chương trình giảm giá</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{discounts.length}</div>
                <div className="text-sm text-gray-600">Tổng giảm giá</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{activeDiscountsCount}</div>
                <div className="text-sm text-gray-600">Đang diễn ra</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section de recherche et actions */}
        <div className="bg-white rounded-2xl p-6 mt-6 mb-6 shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm giảm giá..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchDiscounts}
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
              <button
                onClick={handleRemoveDiscount}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <X className="h-5 w-5" />
                <span>Gỡ giảm giá</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="h-5 w-5" />
                <span>Tạo giảm giá</span>
              </button>
            </div>
          </div>
        </div>

        {/* Message de succès */}
        {success && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 mb-6 shadow-lg animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-base font-bold text-green-800">{success}</p>
                  <p className="text-sm text-green-600 mt-1">Danh sách đang được làm mới...</p>
                </div>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="text-green-500 hover:text-green-700 hover:bg-green-100 rounded-lg p-1 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
         </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Lỗi khi tải dữ liệu</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Spinner de chargement */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tải danh sách giảm giá...</span>
          </div>
        )}

        {/* Grille des discounts */}
        {!loading && filteredDiscounts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDiscounts.map((discount) => (
              <div
                key={discount.discountId}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {/* En-tête de la carte avec dégradé */}
                <div className={`p-6 ${
                  isDiscountActive(discount)
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                    : 'bg-gradient-to-r from-gray-400 to-gray-500'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                        <Percent className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white text-xs font-medium">Mã giảm giá</p>
                        <p className="text-white text-xl font-bold">{discount.discountCode}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    {getStatusBadge(discount)}
                  </div>
                </div>

                {/* Corps de la carte */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <Tag className="h-5 w-5 text-blue-600" />
                    <span>{discount.discountName}</span>
                  </h3>

                  {/* Détails du discount */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-600">Loại</span>
                      </div>
                      <span className="font-bold text-green-600">{discount.discountType}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Percent className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-gray-600">Giá trị</span>
                      </div>
                      <span className="font-bold text-yellow-600">
                        {isPercentageDiscount(discount)
                          ? `${discount.discountValue}%` 
                          : formatPrice(discount.discountValue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-600">Bắt đầu</span>
                      </div>
                      <span className="font-bold text-blue-600">{formatDate(discount.startDate)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span className="text-sm text-gray-600">Kết thúc</span>
                      </div>
                      <span className="font-bold text-purple-600">{formatDate(discount.endDate)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDiscount(discount)}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Xem</span>
                      </button>
                      <button
                        onClick={() => handleEditDiscount(discount)}
                        className="flex-1 bg-green-50 hover:bg-green-100 text-green-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Sửa</span>
                      </button>
                      <button
                        onClick={() => handleDeleteDiscount(discount)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Xóa</span>
                      </button>
                    </div>
                    <button
                      onClick={() => handleApplyDiscount(discount)}
                      className="w-full bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 border border-purple-200"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Áp dụng cho xe</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message si aucun discount */}
        {!loading && filteredDiscounts.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Percent className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không có giảm giá nào</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Không tìm thấy giảm giá phù hợp với từ khóa tìm kiếm.' : 'Chưa có chương trình giảm giá nào được tạo.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium inline-flex items-center space-x-2 shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="h-5 w-5" />
                <span>Tạo giảm giá đầu tiên</span>
              </button>
            )}
          </div>
        )}

        {/* Modal de création */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header avec dégradé */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Tạo giảm giá mới</h2>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleCreateDiscount} className="p-6 bg-gray-50">
                <div className="space-y-5">
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-blue-600" />
                      <span>Mã giảm giá *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.discountCode}
                      onChange={(e) => setCreateForm({ ...createForm, discountCode: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                      placeholder="VD: DISCOUNT10"
                    />
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-indigo-600" />
                      <span>Tên giảm giá *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.discountName}
                      onChange={(e) => setCreateForm({ ...createForm, discountName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                      placeholder="VD: Giảm 10% cho khách hàng mới"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span>Loại giảm giá *</span>
                      </label>
                      <select
                        required
                        value={createForm.discountType}
                        onChange={(e) => setCreateForm({ ...createForm, discountType: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                      >
                        <option value="PERCENTAGE">Phần trăm (%)</option>
                        <option value="FIXED">Số tiền cố định (VND)</option>
                      </select>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <Percent className="h-4 w-4 text-yellow-600" />
                        <span>Giá trị giảm giá *</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={createForm.discountValue}
                        onChange={(e) => setCreateForm({ ...createForm, discountValue: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                        placeholder={createForm.discountType === 'PERCENTAGE' ? 'VD: 10' : 'VD: 100000'}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        {createForm.discountType === 'PERCENTAGE' ? 'Nhập phần trăm (0-100)' : 'Nhập số tiền (VND)'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span>Ngày bắt đầu *</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={createForm.startDate}
                        onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                      />
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span>Ngày kết thúc *</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={createForm.endDate}
                        onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-gray-600" />
                        <span>Trạng thái *</span>
                      </label>
                      <select
                        required
                        value={createForm.status}
                        onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                      >
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Không hoạt động</option>
                      </select>
                    </div>
                    {/* <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-600" />
                        <span>User ID</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={createForm.userId}
                        onChange={(e) => setCreateForm({ ...createForm, userId: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        {user?.id ? `ID người dùng: ${user.id}` : 'Tự động gán nếu để trống'}
                      </p>
                    </div> */}
                  </div>
                </div>
                <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t-2 border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={creatingDiscount}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {creatingDiscount ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Đang tạo...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5" />
                        <span>Tạo giảm giá</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal d'édition */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header avec dégradé */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <Edit className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Chỉnh sửa giảm giá</h2>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleUpdateDiscount} className="p-6 bg-gray-50">
                <div className="space-y-5">
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-blue-600" />
                      <span>Mã giảm giá *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.discountCode}
                      onChange={(e) => setEditForm({ ...editForm, discountCode: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                      placeholder="VD: DISCOUNT10"
                    />
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-indigo-600" />
                      <span>Tên giảm giá *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.discountName}
                      onChange={(e) => setEditForm({ ...editForm, discountName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                      placeholder="VD: Giảm 10% cho khách hàng mới"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span>Loại giảm giá *</span>
                      </label>
                      <select
                        required
                        value={editForm.discountType}
                        onChange={(e) => setEditForm({ ...editForm, discountType: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                      >
                        <option value="PERCENTAGE">Phần trăm (%)</option>
                        <option value="FIXED">Số tiền cố định (VND)</option>
                        {/* <option value="percent">Phần trăm (percent)</option>
                        <option value="amount">Số tiền (amount)</option> */}
                      </select>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <Percent className="h-4 w-4 text-yellow-600" />
                        <span>Giá trị giảm giá *</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={editForm.discountValue}
                        onChange={(e) => setEditForm({ ...editForm, discountValue: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                        placeholder={editForm.discountType === 'PERCENTAGE' || editForm.discountType === 'percent' ? 'VD: 10' : 'VD: 100000'}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        {editForm.discountType === 'PERCENTAGE' || editForm.discountType === 'percent' 
                          ? 'Nhập phần trăm (0-100)' 
                          : 'Nhập số tiền (VND)'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span>Ngày bắt đầu *</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={editForm.startDate}
                        onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                      />
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span>Ngày kết thúc *</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={editForm.endDate}
                        onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-gray-600" />
                        <span>Trạng thái *</span>
                      </label>
                      <select
                        required
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                      >
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Không hoạt động</option>
                      </select>
                    </div>
                    {/* <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-600" />
                        <span>User ID</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.userId}
                        onChange={(e) => setEditForm({ ...editForm, userId: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                        placeholder="0"
                      />
                    </div> */}
                  </div>
                </div>
                <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t-2 border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={updatingDiscount}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {updatingDiscount ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Đang cập nhật...</span>
                      </>
                    ) : (
                      <>
                        <Edit className="h-5 w-5" />
                        <span>Cập nhật giảm giá</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de détails */}
        {showDetailModal && selectedDiscount && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header avec dégradé */}
              <div className={`p-6 rounded-t-2xl ${
                isDiscountActive(selectedDiscount)
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  : 'bg-gradient-to-r from-gray-400 to-gray-500'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Chi tiết giảm giá</h2>
                      <p className="text-white text-sm opacity-90 mt-1">{selectedDiscount.discountCode}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="mt-4">
                  {getStatusBadge(selectedDiscount)}
                </div>
              </div>
              
              <div className="p-6 bg-gray-50">
                <div className="space-y-4">
                  {/* Tên giảm giá */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <Tag className="h-5 w-5 text-indigo-600" />
                      <label className="text-sm font-semibold text-gray-700">Tên giảm giá</label>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{selectedDiscount.discountName}</p>
                  </div>

                  {/* Grid avec ID et Loại */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-gray-200">
                      <div className="flex items-center space-x-2 mb-3">
                        <Tag className="h-4 w-4 text-blue-600" />
                        <label className="text-sm font-semibold text-gray-700">ID</label>
                      </div>
                      <p className="text-xl font-bold text-gray-900">{selectedDiscount.discountId}</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-200">
                      <div className="flex items-center space-x-2 mb-3">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <label className="text-sm font-semibold text-gray-700">Loại</label>
                      </div>
                      <p className="text-xl font-bold text-green-600">{selectedDiscount.discountType}</p>
                    </div>
                  </div>

                  {/* Giá trị */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <Percent className="h-5 w-5 text-yellow-600" />
                      <label className="text-sm font-semibold text-gray-700">Giá trị</label>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">
                      {isPercentageDiscount(selectedDiscount)
                        ? `${selectedDiscount.discountValue}%` 
                        : formatPrice(selectedDiscount.discountValue)}
                    </p>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-gray-200">
                      <div className="flex items-center space-x-2 mb-3">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <label className="text-sm font-semibold text-gray-700">Ngày bắt đầu</label>
                      </div>
                      <p className="text-lg font-bold text-blue-600">{formatDate(selectedDiscount.startDate)}</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-200">
                      <div className="flex items-center space-x-2 mb-3">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <label className="text-sm font-semibold text-gray-700">Ngày kết thúc</label>
                      </div>
                      <p className="text-lg font-bold text-purple-600">{formatDate(selectedDiscount.endDate)}</p>
                    </div>
                  </div>

                  {/* User ID */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <User className="h-4 w-4 text-gray-600" />
                      <label className="text-sm font-semibold text-gray-700">User ID</label>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{selectedDiscount.userId}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmation de suppression */}
        {showDeleteModal && discountToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              {/* Header avec dégradé rouge */}
              <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <Trash2 className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Xóa giảm giá</h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDiscountToDelete(null);
                    }}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-center text-gray-700 mb-4">
                    Bạn có chắc chắn muốn xóa giảm giá này?
                  </p>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Mã giảm giá:</span>
                        <span className="text-sm font-bold text-gray-900">{discountToDelete.discountCode}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Tên giảm giá:</span>
                        <span className="text-sm font-bold text-gray-900">{discountToDelete.discountName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Giá trị:</span>
                        <span className="text-sm font-bold text-gray-900">
                          {isPercentageDiscount(discountToDelete)
                            ? `${discountToDelete.discountValue}%`
                            : formatPrice(discountToDelete.discountValue)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-sm text-red-600 font-medium mt-4">
                    Hành động này không thể hoàn tác!
                  </p>
                </div>
                
                <div className="flex items-center justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDiscountToDelete(null);
                    }}
                    disabled={deletingDiscount}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={deletingDiscount}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {deletingDiscount ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Đang xóa...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-5 w-5" />
                        <span>Xóa giảm giá</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal d'application de discount */}
        {showApplyModal && discountToApply && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              {/* Header avec dégradé */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Áp dụng giảm giá</h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowApplyModal(false);
                      setDiscountToApply(null);
                      setSelectedVehicleId(0);
                    }}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Mã giảm giá:</span>
                        <span className="text-sm font-bold text-gray-900">{discountToApply.discountCode}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Tên giảm giá:</span>
                        <span className="text-sm font-bold text-gray-900">{discountToApply.discountName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Giá trị:</span>
                        <span className="text-sm font-bold text-gray-900">
                          {isPercentageDiscount(discountToApply)
                            ? `${discountToApply.discountValue}%`
                            : formatPrice(discountToApply.discountValue)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                      <Car className="h-5 w-5 text-purple-600" />
                      <span>Chọn xe để áp dụng giảm giá *</span>
                    </label>
                    {loadingVehicles ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                        <span className="ml-2 text-sm text-gray-600">Đang tải danh sách xe...</span>
                      </div>
                    ) : (
                      <select
                        value={selectedVehicleId}
                        onChange={(e) => setSelectedVehicleId(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 focus:bg-white transition-colors"
                        required
                      >
                        <option value="0">-- Chọn xe --</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle.vehicleId || vehicle.id} value={vehicle.vehicleId || parseInt(vehicle.id) || 0}>
                            {vehicle.model} - {vehicle.version} ({vehicle.color}) - ID: {vehicle.vehicleId || vehicle.id}
                          </option>
                        ))}
                      </select>
                    )}
                    {vehicles.length === 0 && !loadingVehicles && (
                      <p className="text-xs text-gray-500 mt-2">Không có xe nào trong hệ thống</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowApplyModal(false);
                      setDiscountToApply(null);
                      setSelectedVehicleId(0);
                    }}
                    disabled={applyingDiscount}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmApply}
                    disabled={applyingDiscount || selectedVehicleId === 0}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {applyingDiscount ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Đang áp dụng...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        <span>Áp dụng giảm giá</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de retrait de discount */}
        {showRemoveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              {/* Header avec dégradé */}
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <X className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Gỡ giảm giá</h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowRemoveModal(false);
                      setSelectedVehicleId(0);
                    }}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <p className="text-center text-gray-700 mb-4">
                    Chọn xe để gỡ giảm giá
                  </p>
                  
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                      <Car className="h-5 w-5 text-orange-600" />
                      <span>Chọn xe *</span>
                    </label>
                    {loadingVehicles ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                        <span className="ml-2 text-sm text-gray-600">Đang tải danh sách xe...</span>
                      </div>
                    ) : (
                      <select
                        value={selectedVehicleId}
                        onChange={(e) => setSelectedVehicleId(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white transition-colors"
                        required
                      >
                        <option value="0">-- Chọn xe --</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle.vehicleId || vehicle.id} value={vehicle.vehicleId || parseInt(vehicle.id) || 0}>
                            {vehicle.model} - {vehicle.version} ({vehicle.color}) - ID: {vehicle.vehicleId || vehicle.id}
                          </option>
                        ))}
                      </select>
                    )}
                    {vehicles.length === 0 && !loadingVehicles && (
                      <p className="text-xs text-gray-500 mt-2">Không có xe nào trong hệ thống</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRemoveModal(false);
                      setSelectedVehicleId(0);
                    }}
                    disabled={removingDiscount}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmRemove}
                    disabled={removingDiscount || selectedVehicleId === 0}
                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {removingDiscount ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Đang gỡ...</span>
                      </>
                    ) : (
                      <>
                        <X className="h-5 w-5" />
                        <span>Gỡ giảm giá</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

