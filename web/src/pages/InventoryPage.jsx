import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '../auth/AuthContext';
import {
  createInventoryPurchaseExpense,
  listEquipment,
  listInventoryUsageHistory,
  listMedicines,
  listSupplies,
  updateEquipment,
  updateMedicine,
  updateSupply,
} from '../api/inventory';
import { getUnreadNotificationCount } from '../api/notifications';
import api from '../api/axios';
import createInventoryPageStyles from '../styles/InventoryPage';

import clinicLogo from '../assets/adminImages/clinic-logo.png';

function formatDateOnly(value) {
  if (!value) return 'N/A';
  return String(value).slice(0, 10);
}

function formatDateTime(value) {
  if (!value) return 'N/A';
  const text = String(value);
  if (text.includes('T')) return text.replace('T', ' ').slice(0, 19);
  return text.slice(0, 19);
}

function fallback(value) {
  return value || 'N/A';
}

function formatPeso(value) {
  return `\u20B1${Number(value || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function getBranchCity(row) {
  const address = row?.branch_address || '';
  const parts = address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    return fallback(row?.branch_name);
  }

  const cityPart =
    parts.find((part) => !/\d/.test(part)) ||
    parts[parts.length - 1];

  return cityPart.replace(/\b(branch|clinic)\b/gi, '').trim() || cityPart;
}

function mapMedicineRow(row, index) {
  return {
    id: `M-${String(index + 1).padStart(4, '0')}`,
    rawId: row.id,
    branchName: getBranchCity(row),
    supplier: fallback(row.supplier),
    medicineName: fallback(row.medicine_name),
    genericName: fallback(row.generic_name),
    category: fallback(row.category),
    form: fallback(row.form),
    dosage: fallback(row.dosage),
    unit: fallback(row.unit),
    quantity: Number(row.quantity || 0),
    threshold: Number(row.low_stock_threshold || row.threshold || 0),
    pricePerItem: Number(row.price_per_item || 0),
    lastUpdated: formatDateOnly(row.updated_at || row.created_at),
    status: row.status,
  };
}

function mapEquipmentRow(row, index) {
  return {
    id: `EQ-${String(index + 1).padStart(4, '0')}`,
    rawId: row.id,
    branchName: getBranchCity(row),
    supplier: fallback(row.supplier),
    equipmentName: fallback(row.equipment_name),
    brand: fallback(row.brand),
    category: fallback(row.category),
    modelNumber: fallback(row.model_number),
    serialNumber: fallback(row.serial_number),
    purchaseDate: formatDateOnly(row.purchase_date),
    warrantyDate: formatDateOnly(row.warranty_date),
    location: fallback(row.location),
    quantity: Number(row.quantity || 0),
    threshold: Number(row.low_stock_threshold || row.threshold || 0),
    pricePerItem: Number(row.price_per_item || 0),
    lastUpdated: formatDateOnly(row.updated_at || row.created_at),
    maintenanceStatus: fallback(row.maintenance_status),
    status: row.maintenance_status || row.status,
  };
}

function mapSupplyRow(row, index) {
  return {
    id: `S-${String(index + 1).padStart(4, '0')}`,
    rawId: row.id,
    branchName: getBranchCity(row),
    supplier: fallback(row.supplier),
    supplyName: fallback(row.supply_name),
    brand: fallback(row.brand),
    category: fallback(row.category),
    unit: fallback(row.unit),
    quantity: Number(row.quantity || 0),
    threshold: Number(row.low_stock_threshold || row.threshold || 0),
    pricePerItem: Number(row.price_per_item || 0),
    lastUpdated: formatDateOnly(row.updated_at || row.created_at),
    status: row.status,
  };
}

function getSummaryStatus(item) {
  const normalizedStatus = String(item?.status || '').toLowerCase();
  const quantity = Number(item?.quantity || 0);
  const threshold = Number(item?.threshold || 0);

  if (
    normalizedStatus === 'out of stock' ||
    normalizedStatus === 'expired' ||
    normalizedStatus === 'damaged' ||
    normalizedStatus === 'needs repair' ||
    quantity <= 0
  ) {
    return 'Out of Stock';
  }

  if (
    normalizedStatus === 'low stock' ||
    normalizedStatus === 'maintenance' ||
    normalizedStatus === 'under maintenance' ||
    (threshold > 0 && quantity <= threshold)
  ) {
    return 'Low Stock';
  }

  return 'Healthy';
}

function getSummaryItemName(item, type) {
  if (type === 'medicine') return item.medicineName;
  if (type === 'equipment') return item.equipmentName;
  return item.supplyName;
}

function getSummaryColumnLabel(type) {
  if (type === 'medicine') return 'Medicine Item';
  if (type === 'equipment') return 'Equipment Item';
  if (type === 'supplies') return 'Supply Item';
  return 'Item Name';
}

const emptyExpenseInventoryRows = { medicine: [], equipment: [], supplies: [] };
const emptyExpenseItemOptions = { medicine: [], equipment: [], supplies: [] };
const expenseCategoryLabels = { medicine: 'Dental Medicine', equipment: 'Dental Equipment', supplies: 'Dental Supplies' };

function uniqueSortedNames(rows, fieldName) {
  return Array.from(
    new Set(
      rows
        .map((row) => row?.[fieldName])
        .filter((name) => typeof name === 'string' && name.trim())
        .map((name) => name.trim())
    )
  ).sort((a, b) => a.localeCompare(b));
}

function getExpenseItemName(row, category) {
  if (category === 'medicine') return row?.medicine_name;
  if (category === 'equipment') return row?.equipment_name;
  return row?.supply_name;
}

function getExpenseBranchLabel(branch) {
  const address = branch?.address || '';
  const parts = address.split(',').map((part) => part.trim()).filter(Boolean);
  if (!parts.length) return branch?.name || 'Branch';
  const cityPart = parts.find((part) => !/\d/.test(part)) || parts[parts.length - 1];
  return cityPart.replace(/\b(branch|clinic)\b/gi, '').trim() || cityPart;
}

export default function InventoryPage() {
  const { user } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockSummaryModal, setShowStockSummaryModal] = useState(false);
  const [showUsageHistoryModal, setShowUsageHistoryModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showExpenseConfirmModal, setShowExpenseConfirmModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    date: '',
    branchId: '',
    category: 'supplies',
    itemName: '',
    supplier: '',
    orderQuantity: '',
    pricePerItem: '',
    threshold: '',
  });
  const [expenseInventoryRows, setExpenseInventoryRows] = useState(emptyExpenseInventoryRows);
  const [expenseBranchOptions, setExpenseBranchOptions] = useState([]);
  const [expenseSaving, setExpenseSaving] = useState(false);
  const [expenseSaveError, setExpenseSaveError] = useState('');
  const [saveExpenseClicked, setSaveExpenseClicked] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [editForm, setEditForm] = useState({
    genericName: '',
    brand: '',
    category: '',
    form: '',
    dosage: '',
    unit: '',
    threshold: '',
    maintenanceStatus: '',
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState('');

  const [usageHistoryLoading, setUsageHistoryLoading] = useState(false);
  const [usageHistoryError, setUsageHistoryError] = useState('');
  const [usageHistoryRows, setUsageHistoryRows] = useState([]);
  const [usageHistoryFilters, setUsageHistoryFilters] = useState({
    startDate: '',
    endDate: '',
  });

  function handleUsageHistoryStartDateChange(nextStartDate) {
    setUsageHistoryFilters((prev) => {
      if (prev.endDate && nextStartDate && nextStartDate > prev.endDate) {
        setUsageHistoryError('Invalid date range. "From" must be on or before "To".');
        return prev;
      }
      if (usageHistoryError) {
        setUsageHistoryError('');
      }
      return { ...prev, startDate: nextStartDate };
    });
  }

  function handleUsageHistoryEndDateChange(nextEndDate) {
    setUsageHistoryFilters((prev) => {
      if (prev.startDate && nextEndDate && nextEndDate < prev.startDate) {
        setUsageHistoryError('Invalid date range. "To" must be on or after "From".');
        return prev;
      }
      if (usageHistoryError) {
        setUsageHistoryError('');
      }
      return { ...prev, endDate: nextEndDate };
    });
  }

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [activeTab, setActiveTab] = useState('medicine');
  const [searchValue, setSearchValue] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('');
  const [selectedStockCategory, setSelectedStockCategory] = useState('medicine');

  const [currentPages, setCurrentPages] = useState({
    medicine: 1,
    equipment: 1,
    supplies: 1,
    search: 1,
  });

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const rowsPerPage = 10;

  const [highlightedRawId, setHighlightedRawId] = useState(null);
  const highlightedRowRef = useRef(null);

  const role = String(user?.role || 'ADMIN').toUpperCase();

  const isReceptionist = role === 'RECEPTIONIST';
  const scopedBranchId = isReceptionist
    ? Number(
        user?.home_branch_id ||
          user?.branches?.[0]?.branchId ||
          user?.branches?.[0]?.id ||
          0
      ) || undefined
    : undefined;

  const profileName =
    user?.fullName ||
    user?.name ||
    user?.username ||
    (isReceptionist ? 'Receptionist' : 'Admin');

  const profilePosition = isReceptionist ? 'Receptionist' : 'Admin';

  const [notificationCount, setNotificationCount] = useState(0);
  const [medicines, setMedicines] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [supplies, setSupplies] = useState([]);

  const isMobile = screenWidth <= 850;
  const isTablet = screenWidth > 850 && screenWidth <= 1200;
  const isSmallScreen = screenWidth <= 1200;

  const styles = createInventoryPageStyles({
    isMobile,
    isTablet,
    isSmallScreen,
    desktopSidebarWidth: isReceptionist ? 250 : 230,
  });

  const receptionistHeaderStyle = isReceptionist
    ? { ...styles.adminProfile, textDecoration: 'none' }
    : styles.adminProfile;

  const sidebarMenus = {
    ADMIN: [
      { label: 'Dashboard', path: '/admin', icon: 'fi fi-rr-chart-histogram' },
      { label: 'Patient Records', path: '/adminPatients', icon: 'fi fi-rr-clipboard-user' },
      { label: 'Clinic Employee', path: '/adminEmployees', icon: 'fi fi-rr-stethoscope' },
      { label: 'Inventory', path: '/adminInventory', icon: 'fi fi-rr-boxes' },
      { label: 'Audit Logs', path: '/adminLogs', icon: 'fi fi-rr-clipboard-list' },
      { label: 'Notifications', path: '/adminNotif', icon: 'fi fi-rr-bell', badge: notificationCount },
      { label: 'Reports', path: '/adminReports', icon: 'fi fi-rr-chart-line-up' },
      { label: 'Settings', path: '/adminSettings', icon: 'fi fi-rr-settings' },
    ],

    RECEPTIONIST: [
      { label: 'Dashboard', path: '/receptionist', icon: 'fi fi-rr-chart-histogram' },
      { label: 'Appointments', path: '/receptionistAppointments', icon: 'fi fi-rr-calendar-clock' },
      { label: 'Patient Records', path: '/receptionistRecords', icon: 'fi fi-rr-clipboard-user' },
      { label: 'Receipt Verification', path: '/receptionistReceipts', icon: 'fi fi-rr-file-invoice-dollar' },
      { label: 'Patient Account', path: '/receptionistPatientAcc', icon: 'fi fi-rr-id-badge' },
      { label: 'Inventory', path: '/receptionistInventory', icon: 'fi fi-rr-boxes' },
      { label: 'Messages', path: '/receptionistMessage', icon: 'fi fi-rr-comment-alt' },
      { label: 'Online Inquiries', path: '/receptionistInquiries', icon: 'fi fi-rr-inbox-in' },
      { label: 'Notifications', path: '/receptionistNotif', icon: 'fi fi-rr-bell', badge: notificationCount },
    ],
  };

  const menuItems = sidebarMenus[role] || sidebarMenus.ADMIN;

  const inventoryMap = {
    medicine: {
      label: 'Dental Medicine',
      title: 'Dental Medicine',
      description: isReceptionist
        ? 'View medicine inventory for your assigned branch.'
        : 'View medicine inventory across clinic branches.',
      rows: medicines,
      colspan: isReceptionist ? 12 : 13,
      tableMinWidth: 1420,
    },
    equipment: {
      label: 'Dental Equipment',
      title: 'Dental Equipment',
      description: isReceptionist
        ? 'View dental equipment details for your assigned branch.'
        : 'View dental equipment details, warranty, and location.',
      rows: equipment,
      colspan: isReceptionist ? 14 : 15,
      tableMinWidth: 1650,
    },
    supplies: {
      label: 'Dental Supplies',
      title: 'Dental Supplies',
      description: isReceptionist
        ? 'View supplies and availability for your assigned branch.'
        : 'View supplies, units, and availability status.',
      rows: supplies,
      colspan: isReceptionist ? 10 : 11,
      tableMinWidth: 1250,
    },
  };

  const isSearchActive = searchValue.trim().length > 0;
  const isStockFilterActive = Boolean(stockStatusFilter);
  const isCrossCategoryActive = isSearchActive || isStockFilterActive;

  const activeRows = inventoryMap[activeTab].rows;

  function matchesStockStatusFilter(item) {
    if (!stockStatusFilter) return true;
    const status = getSummaryStatus(item);

    if (stockStatusFilter === 'in_stock') return status === 'Healthy';
    if (stockStatusFilter === 'low_stock') return status === 'Low Stock';
    if (stockStatusFilter === 'out_of_stock') return status === 'Out of Stock';

    return true;
  }

  const filteredRows = useMemo(() => {
    const search = searchValue.toLowerCase().trim();

    return activeRows.filter((item) => {
      if (!matchesStockStatusFilter(item)) return false;
      const rowText = Object.values(item).join(' ').toLowerCase();
      const matchesSearch = rowText.includes(search);
      return matchesSearch;
    });
  }, [activeRows, searchValue, stockStatusFilter]);

  const crossCategoryResults = useMemo(() => {
    const search = searchValue.toLowerCase().trim();
    if (!search && !stockStatusFilter) return [];

    function matchItem(item) {
      if (!matchesStockStatusFilter(item)) return false;
      if (!search) return true;
      return Object.values(item).join(' ').toLowerCase().includes(search);
    }

    return [
      ...medicines.filter(matchItem).map((item) => ({ ...item, _type: 'medicine', _name: item.medicineName })),
      ...equipment.filter(matchItem).map((item) => ({ ...item, _type: 'equipment', _name: item.equipmentName })),
      ...supplies.filter(matchItem).map((item) => ({ ...item, _type: 'supplies', _name: item.supplyName })),
    ];
  }, [medicines, equipment, supplies, searchValue, stockStatusFilter]);

  const searchTotalPages = Math.ceil(crossCategoryResults.length / rowsPerPage);

  const paginatedCrossResults = useMemo(() => {
    const start = (currentPages.search - 1) * rowsPerPage;
    return crossCategoryResults.slice(start, start + rowsPerPage);
  }, [crossCategoryResults, currentPages.search]);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  const currentPage = currentPages[activeTab];

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredRows.slice(start, end);
  }, [filteredRows, currentPage]);

  const stockSummaryDetailRows = useMemo(() => {
    const categorySources = [
      {
        type: 'medicine',
        label: 'Medicine',
        rows: medicines,
      },
      {
        type: 'equipment',
        label: 'Equipment',
        rows: equipment,
      },
      {
        type: 'supplies',
        label: 'Supplies',
        rows: supplies,
      },
    ];

    return categorySources
      .filter(
        (group) =>
          selectedStockCategory === 'all' || group.type === selectedStockCategory
      )
      .flatMap((group) =>
        group.rows.map((item) => ({
          id: `${group.type}-${item.rawId || item.id}`,
          type: group.type,
          category: group.label,
          branchName: item.branchName,
          name: getSummaryItemName(item, group.type),
          quantity: Number(item.quantity || 0),
          unit: fallback(item.unit),
          threshold: Number(item.threshold || 0),
          status: getSummaryStatus(item),
          lastUpdated: item.lastUpdated || 'N/A',
        }))
      );
  }, [equipment, medicines, selectedStockCategory, supplies]);

  const displayedStockSummaryRows = useMemo(() => {
    if (!stockStatusFilter) return stockSummaryDetailRows;
    return stockSummaryDetailRows.filter((row) => matchesStockStatusFilter(row));
  }, [stockSummaryDetailRows, stockStatusFilter]);

  const stockSummary = useMemo(() => {
    return stockSummaryDetailRows.reduce(
      (summary, item) => {
        summary.totalItems += 1;
        summary.totalQuantity += Number(item.quantity || 0);

        if (item.status === 'Out of Stock') {
          summary.outOfStock += 1;
        } else if (item.status === 'Low Stock') {
          summary.lowStock += 1;
        }

        return summary;
      },
      {
        totalItems: 0,
        totalQuantity: 0,
        lowStock: 0,
        outOfStock: 0,
      }
    );
  }, [stockSummaryDetailRows]);

  const computedExpense =
    Number(expenseForm.orderQuantity || 0) * Number(expenseForm.pricePerItem || 0);

  const selectedExpenseBranch = expenseBranchOptions.find(
    (b) => String(b.id) === String(expenseForm.branchId)
  );

  const expenseItemOptions = useMemo(() => {
    if (!expenseForm.branchId) return emptyExpenseItemOptions;
    const branchId = Number(expenseForm.branchId);
    const byBranch = (rows) => rows.filter((row) => Number(row.branch_id) === branchId);
    return {
      medicine: uniqueSortedNames(byBranch(expenseInventoryRows.medicine), 'medicine_name'),
      equipment: uniqueSortedNames(byBranch(expenseInventoryRows.equipment), 'equipment_name'),
      supplies: uniqueSortedNames(byBranch(expenseInventoryRows.supplies), 'supply_name'),
    };
  }, [expenseForm.branchId, expenseInventoryRows]);

  const selectedExpenseInventoryRows = useMemo(() => {
    if (!expenseForm.branchId) return [];
    const branchId = Number(expenseForm.branchId);
    return (expenseInventoryRows[expenseForm.category] || []).filter(
      (row) => Number(row.branch_id) === branchId
    );
  }, [expenseForm.branchId, expenseForm.category, expenseInventoryRows]);

  const expenseSupplierOptions = useMemo(
    () => uniqueSortedNames(selectedExpenseInventoryRows, 'supplier'),
    [selectedExpenseInventoryRows]
  );

  const expenseItemOptionsList = expenseItemOptions[expenseForm.category] || [];

  useEffect(() => {
    function handleResize() {
      setScreenWidth(window.innerWidth);
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadUsageHistory() {
      if (!showUsageHistoryModal) return;

      setUsageHistoryLoading(true);
      setUsageHistoryError('');
      try {
        const params = {};
        const startDate = usageHistoryFilters.startDate || '';
        const endDate = usageHistoryFilters.endDate || '';

        if (startDate && endDate && startDate > endDate) {
          if (!cancelled) {
            setUsageHistoryRows([]);
            setUsageHistoryError('Invalid date range. "From" must be on or before "To".');
          }
          return;
        }

        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        if (scopedBranchId) params.branch_id = scopedBranchId;

        const records = await listInventoryUsageHistory(params);
        if (!cancelled) setUsageHistoryRows(records);
      } catch (err) {
        if (!cancelled) setUsageHistoryError(err.response?.data?.message || 'Failed to load usage history.');
      } finally {
        if (!cancelled) setUsageHistoryLoading(false);
      }
    }

    loadUsageHistory();

    return () => {
      cancelled = true;
    };
  }, [showUsageHistoryModal, scopedBranchId, usageHistoryFilters.endDate, usageHistoryFilters.startDate]);

  useEffect(() => {
    let cancelled = false;

    async function fetchUnreadNotifications() {
      try {
        const count = await getUnreadNotificationCount();
        if (!cancelled) {
          setNotificationCount(count);
        }
      } catch (err) {
        if (!cancelled) {
          setNotificationCount(0);
        }
      }
    }

    fetchUnreadNotifications();
    const intervalId = window.setInterval(fetchUnreadNotifications, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const originalBodyMargin = document.body.style.margin;
    const originalBodyOverflowX = document.body.style.overflowX;
    const originalHtmlOverflowX = document.documentElement.style.overflowX;

    document.body.style.margin = '0';
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';

    return () => {
      document.body.style.margin = originalBodyMargin;
      document.body.style.overflowX = originalBodyOverflowX;
      document.documentElement.style.overflowX = originalHtmlOverflowX;
    };
  }, []);

  useEffect(() => {
    if (showLogoutModal || showEditModal || showStockSummaryModal || showUsageHistoryModal || showExpenseModal || showExpenseConfirmModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showLogoutModal, showEditModal, showStockSummaryModal, showUsageHistoryModal, showExpenseModal, showExpenseConfirmModal]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLogoutModal();
        closeEditModal();
        closeStockSummaryModal();
        closeUsageHistoryModal();
        closeExpenseModal();
        closeExpenseConfirmModal();
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  async function loadInventory() {
    setInventoryLoading(true);
    setInventoryError('');

    try {
      const [medicineRows, equipmentRows, supplyRows] = await Promise.all([
        listMedicines(scopedBranchId),
        listEquipment(scopedBranchId),
        listSupplies(scopedBranchId),
      ]);

      setMedicines(medicineRows.map(mapMedicineRow));
      setEquipment(equipmentRows.map(mapEquipmentRow));
      setSupplies(supplyRows.map(mapSupplyRow));
    } catch (err) {
      setInventoryError(
        err.response?.data?.message || 'Failed to load inventory records.'
      );
    } finally {
      setInventoryLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, [scopedBranchId]);

  // Detect highlightItemId from URL and switch to the right tab/page
  useEffect(() => {
    const rawId = Number(searchParams.get('highlightItemId'));
    if (!rawId) return;
    if (!medicines.length && !equipment.length && !supplies.length) return;

    const medIdx = medicines.findIndex((m) => m.rawId === rawId);
    if (medIdx >= 0) {
      setActiveTab('medicine');
      setCurrentPages((prev) => ({ ...prev, medicine: Math.floor(medIdx / rowsPerPage) + 1 }));
      setHighlightedRawId(rawId);
      return;
    }

    const eqIdx = equipment.findIndex((e) => e.rawId === rawId);
    if (eqIdx >= 0) {
      setActiveTab('equipment');
      setCurrentPages((prev) => ({ ...prev, equipment: Math.floor(eqIdx / rowsPerPage) + 1 }));
      setHighlightedRawId(rawId);
      return;
    }

    const supIdx = supplies.findIndex((s) => s.rawId === rawId);
    if (supIdx >= 0) {
      setActiveTab('supplies');
      setCurrentPages((prev) => ({ ...prev, supplies: Math.floor(supIdx / rowsPerPage) + 1 }));
      setHighlightedRawId(rawId);
    }
  }, [searchParams, medicines, equipment, supplies]);

  // Scroll to highlighted row and clear after 3 seconds
  useEffect(() => {
    if (!highlightedRawId) return;
    if (highlightedRowRef.current) {
      highlightedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    const timer = setTimeout(() => setHighlightedRawId(null), 3000);
    return () => clearTimeout(timer);
  }, [highlightedRawId]);

  useEffect(() => {
    setCurrentPages((prev) => ({
      ...prev,
      [activeTab]: 1,
      search: 1,
    }));
  }, [searchValue]); // tab changes reset page via handleTabChange; highlight sets page directly

  useEffect(() => {
    if (showExpenseModal) {
      refreshExpenseFormOptions();
    }
  }, [showExpenseModal]); // eslint-disable-line react-hooks/exhaustive-deps

  function openLogoutModal() {
    setShowLogoutModal(true);
  }

  function closeLogoutModal() {
    setShowLogoutModal(false);
  }

  function openStockSummaryModal() {
    setSelectedStockCategory(activeTab);
    setShowStockSummaryModal(true);
  }

  function closeStockSummaryModal() {
    setShowStockSummaryModal(false);
  }

  function openUsageHistoryModal() {
    setUsageHistoryError('');
    setShowUsageHistoryModal(true);
  }

  function closeUsageHistoryModal() {
    setShowUsageHistoryModal(false);
    setUsageHistoryError('');
  }

  function handleUsageHistoryOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeUsageHistoryModal();
    }
  }

  function handleLogout() {
    window.location.href = '/login';
  }

  function handleModalOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeLogoutModal();
    }
  }

  function handleEditOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeEditModal();
    }
  }

  function handleStockSummaryOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeStockSummaryModal();
    }
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    setSearchValue('');
    setCurrentPages((prev) => ({ ...prev, [tab]: 1 }));
    setHighlightedRawId(null);
  }

  function openEditModal(item) {
    setSelectedInventoryItem({ ...item, type: activeTab });
    setEditForm({
      genericName: item.genericName === 'N/A' ? '' : item.genericName || '',
      brand: item.brand === 'N/A' ? '' : item.brand || '',
      category: item.category === 'N/A' ? '' : item.category || '',
      form: item.form === 'N/A' ? '' : item.form || '',
      dosage: item.dosage === 'N/A' ? '' : item.dosage || '',
      unit: item.unit === 'N/A' ? '' : item.unit || '',
      threshold: Number.isFinite(Number(item.threshold)) ? String(Number(item.threshold)) : '',
      maintenanceStatus:
        item.maintenanceStatus === 'N/A'
          ? 'Available'
          : item.maintenanceStatus || 'Available',
    });
    setEditError('');
    setShowEditModal(true);
  }

  function closeEditModal() {
    setShowEditModal(false);
    setSelectedInventoryItem(null);
    setEditError('');
  }

  function handleEditFormChange(field, value) {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSaveEdit() {
    if (!selectedInventoryItem) return;

    const type = selectedInventoryItem.type;
    const thresholdValue =
      editForm.threshold === '' || editForm.threshold === null || typeof editForm.threshold === 'undefined'
        ? undefined
        : Math.max(0, Number(editForm.threshold) || 0);

    const payload =
      type === 'medicine'
        ? {
            generic_name: editForm.genericName,
            category: editForm.category,
            form: editForm.form,
            dosage: editForm.dosage,
            unit: editForm.unit,
            ...(typeof thresholdValue === 'number' ? { low_stock_threshold: thresholdValue } : {}),
          }
        : type === 'supplies'
        ? {
            brand: editForm.brand,
            category: editForm.category,
            unit: editForm.unit,
            ...(typeof thresholdValue === 'number' ? { low_stock_threshold: thresholdValue } : {}),
          }
        : {
            category: editForm.category,
            maintenance_status: editForm.maintenanceStatus,
            ...(typeof thresholdValue === 'number' ? { low_stock_threshold: thresholdValue } : {}),
          };

    setEditSaving(true);
    setEditError('');

    try {
      if (type === 'medicine') {
        await updateMedicine(selectedInventoryItem.rawId, payload);
      } else if (type === 'supplies') {
        await updateSupply(selectedInventoryItem.rawId, payload);
      } else {
        await updateEquipment(selectedInventoryItem.rawId, payload);
      }

      await loadInventory();
      closeEditModal();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update item.');
    } finally {
      setEditSaving(false);
    }
  }

  function nextPage() {
    if (currentPage < totalPages) {
      setCurrentPages((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab] + 1,
      }));
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      setCurrentPages((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab] - 1,
      }));
    }
  }

  function nextCrossPage() {
    if (currentPages.search < searchTotalPages) {
      setCurrentPages((prev) => ({ ...prev, search: prev.search + 1 }));
    }
  }

  function prevCrossPage() {
    if (currentPages.search > 1) {
      setCurrentPages((prev) => ({ ...prev, search: prev.search - 1 }));
    }
  }

  function openEditModalCross(item, type) {
    setSelectedInventoryItem({ ...item, type });
    setEditForm({
      genericName: item.genericName === 'N/A' ? '' : item.genericName || '',
      brand: item.brand === 'N/A' ? '' : item.brand || '',
      category: item.category === 'N/A' ? '' : item.category || '',
      form: item.form === 'N/A' ? '' : item.form || '',
      dosage: item.dosage === 'N/A' ? '' : item.dosage || '',
      unit: item.unit === 'N/A' ? '' : item.unit || '',
      threshold: Number.isFinite(Number(item.threshold)) ? String(Number(item.threshold)) : '',
      maintenanceStatus:
        item.maintenanceStatus === 'N/A' ? 'Available' : item.maintenanceStatus || 'Available',
    });
    setEditError('');
    setShowEditModal(true);
  }

  function openExpenseModal() {
    setShowExpenseModal(true);
  }

  function closeExpenseModal() {
    setShowExpenseModal(false);
    setExpenseSaveError('');
  }

  function closeExpenseConfirmModal() {
    setShowExpenseConfirmModal(false);
  }

  async function refreshExpenseFormOptions() {
    try {
      const [meds, equip, sups, branchesRes] = await Promise.all([
        listMedicines(),
        listEquipment(),
        listSupplies(),
        api.get('/auth/branches'),
      ]);
      const nextBranches = branchesRes.data.branches || [];
      setExpenseInventoryRows({ medicine: meds, equipment: equip, supplies: sups });
      setExpenseBranchOptions(nextBranches);
      setExpenseForm((prev) => {
        if (prev.branchId && !nextBranches.some((b) => String(b.id) === String(prev.branchId))) {
          return { ...prev, branchId: '', itemName: '' };
        }
        return prev;
      });
    } catch (err) {
      console.error('Failed to load expense form options.', err);
    }
  }

  function handleExpenseChange(field, value) {
    setExpenseForm((prev) => {
      const updatedForm = { ...prev, [field]: value };
      if (field === 'category' || field === 'branchId') {
        updatedForm.itemName = '';
        updatedForm.supplier = '';
        updatedForm.orderQuantity = '';
        updatedForm.pricePerItem = '';
        updatedForm.threshold = '';
      }
      if (field === 'itemName') {
        const matchingItem = selectedExpenseInventoryRows.find(
          (row) =>
            String(getExpenseItemName(row, prev.category) || '')
              .trim()
              .toLowerCase() === String(value || '').trim().toLowerCase()
        );
        updatedForm.supplier = matchingItem?.supplier || '';
        if (matchingItem) {
          updatedForm.pricePerItem = Number(matchingItem.price_per_item || 0);
          updatedForm.threshold =
            matchingItem?.low_stock_threshold != null
              ? String(matchingItem.low_stock_threshold)
              : '';
        } else {
          updatedForm.threshold = '';
        }
      }
      return updatedForm;
    });
  }

  function handleSaveExpense() {
    setExpenseSaveError('');
    setSaveExpenseClicked(true);
    setTimeout(() => setSaveExpenseClicked(false), 160);
    setTimeout(() => { setShowExpenseConfirmModal(true); }, 90);
  }

  async function handleConfirmExpenseSave() {
    setExpenseSaving(true);
    setExpenseSaveError('');
    try {
      const expenseRes = await createInventoryPurchaseExpense({
        branch_id: expenseForm.branchId,
        date: expenseForm.date,
        category: expenseForm.category,
        itemName: expenseForm.itemName,
        supplier: expenseForm.supplier,
        orderQuantity: expenseForm.orderQuantity,
        pricePerItem: expenseForm.pricePerItem,
      });

      const thresholdValue =
        expenseForm.threshold === '' || expenseForm.threshold === null || typeof expenseForm.threshold === 'undefined'
          ? undefined
          : Math.max(0, Number(expenseForm.threshold) || 0);

      if (typeof thresholdValue === 'number' && expenseRes?.inventory_id) {
        const inventoryId = expenseRes.inventory_id;
        const thresholdPayload = { low_stock_threshold: thresholdValue };

        if (expenseForm.category === 'medicine') {
          await updateMedicine(inventoryId, thresholdPayload);
        } else if (expenseForm.category === 'equipment') {
          await updateEquipment(inventoryId, thresholdPayload);
        } else {
          await updateSupply(inventoryId, thresholdPayload);
        }
      }

      setShowExpenseConfirmModal(false);
      await refreshExpenseFormOptions();
      await loadInventory();
      setExpenseForm((prev) => ({
        ...prev,
        itemName: '',
        supplier: '',
        orderQuantity: '',
        pricePerItem: '',
        threshold: '',
      }));
    } catch (err) {
      setExpenseSaveError(err.response?.data?.message || 'Failed to save expense.');
    } finally {
      setExpenseSaving(false);
    }
  }

  function getStatusBadgeStyle(status) {
    const normalizedStatus = String(status || '').toLowerCase();

    if (
      normalizedStatus === 'available' ||
      normalizedStatus === 'operational' ||
      normalizedStatus === 'in stock' ||
      normalizedStatus === 'healthy'
    ) {
      return {
        ...styles.statusBadge,
        ...styles.statusBadgeGreen,
      };
    }

    if (
      normalizedStatus === 'low stock' ||
      normalizedStatus === 'maintenance' ||
      normalizedStatus === 'under maintenance'
    ) {
      return {
        ...styles.statusBadge,
        ...styles.statusBadgeYellow,
      };
    }

    if (
      normalizedStatus === 'out of stock' ||
      normalizedStatus === 'expired' ||
      normalizedStatus === 'damaged' ||
      normalizedStatus === 'needs repair'
    ) {
      return {
        ...styles.statusBadge,
        ...styles.statusBadgeRed,
      };
    }

    if (normalizedStatus === 'archived' || normalizedStatus === 'retired') {
      return {
        ...styles.statusBadge,
        ...styles.statusBadgeBlue,
      };
    }

    return styles.statusBadge;
  }

  function renderMedicineRows() {
    return paginatedRows.map((item) => {
      const isHighlighted = item.rawId === highlightedRawId;
      return (
      <tr
        key={item.id}
        ref={isHighlighted ? highlightedRowRef : null}
        style={isHighlighted ? { ...styles.tableRow, background: '#fef9c3', outline: '2px solid #ca8a04', outlineOffset: '-2px', transition: 'background 0.4s' } : styles.tableRow}
      >
        <td style={styles.tableCell}>{item.id}</td>
        <td style={styles.tableCell}>{item.branchName}</td>
        <td style={styles.tableCell}>{item.supplier}</td>
        <td style={styles.tableCell}>{item.medicineName}</td>
        <td style={styles.tableCell}>{item.genericName}</td>
        <td style={styles.tableCell}>{item.category}</td>
        <td style={styles.tableCell}>{item.form}</td>
        <td style={styles.tableCell}>{item.dosage}</td>
        <td style={styles.tableCell}>{item.unit}</td>
        <td style={styles.tableCell}>{item.quantity}</td>
        <td style={styles.tableCell}>{formatPeso(item.pricePerItem)}</td>
        <td style={styles.tableCell}>
          <span style={getStatusBadgeStyle(item.status)}>{item.status}</span>
        </td>
        {!isReceptionist && (
          <td style={styles.tableCell}>
            <button
              type="button"
              style={styles.editBtn}
              onClick={() => openEditModal(item)}
            >
              Edit
            </button>
          </td>
        )}
      </tr>
      );
    });
  }

  function renderEquipmentRows() {
    return paginatedRows.map((item) => {
      const isHighlighted = item.rawId === highlightedRawId;
      return (
      <tr
        key={item.id}
        ref={isHighlighted ? highlightedRowRef : null}
        style={isHighlighted ? { ...styles.tableRow, background: '#fef9c3', outline: '2px solid #ca8a04', outlineOffset: '-2px', transition: 'background 0.4s' } : styles.tableRow}
      >
        <td style={styles.tableCell}>{item.id}</td>
        <td style={styles.tableCell}>{item.branchName}</td>
        <td style={styles.tableCell}>{item.supplier}</td>
        <td style={styles.tableCell}>{item.equipmentName}</td>
        <td style={styles.tableCell}>{item.brand}</td>
        <td style={styles.tableCell}>{item.category}</td>
        <td style={styles.tableCell}>{item.modelNumber}</td>
        <td style={styles.tableCell}>{item.serialNumber}</td>
        <td style={styles.tableCell}>{item.purchaseDate}</td>
        <td style={styles.tableCell}>{item.warrantyDate}</td>
        <td style={styles.tableCell}>{item.location}</td>
        <td style={styles.tableCell}>{item.quantity}</td>
        <td style={styles.tableCell}>{formatPeso(item.pricePerItem)}</td>
        <td style={styles.tableCell}>
          <span style={getStatusBadgeStyle(item.status)}>{item.status}</span>
        </td>
        {!isReceptionist && (
          <td style={styles.tableCell}>
            <button
              type="button"
              style={styles.editBtn}
              onClick={() => openEditModal(item)}
            >
              Edit
            </button>
          </td>
        )}
      </tr>
      );
    });
  }

  function renderSupplyRows() {
    return paginatedRows.map((item) => {
      const isHighlighted = item.rawId === highlightedRawId;
      return (
      <tr
        key={item.id}
        ref={isHighlighted ? highlightedRowRef : null}
        style={isHighlighted ? { ...styles.tableRow, background: '#fef9c3', outline: '2px solid #ca8a04', outlineOffset: '-2px', transition: 'background 0.4s' } : styles.tableRow}
      >
        <td style={styles.tableCell}>{item.id}</td>
        <td style={styles.tableCell}>{item.branchName}</td>
        <td style={styles.tableCell}>{item.supplier}</td>
        <td style={styles.tableCell}>{item.supplyName}</td>
        <td style={styles.tableCell}>{item.brand}</td>
        <td style={styles.tableCell}>{item.category}</td>
        <td style={styles.tableCell}>{item.unit}</td>
        <td style={styles.tableCell}>{item.quantity}</td>
        <td style={styles.tableCell}>{formatPeso(item.pricePerItem)}</td>
        <td style={styles.tableCell}>
          <span style={getStatusBadgeStyle(item.status)}>{item.status}</span>
        </td>
        {!isReceptionist && (
          <td style={styles.tableCell}>
            <button
              type="button"
              style={styles.editBtn}
              onClick={() => openEditModal(item)}
            >
              Edit
            </button>
          </td>
        )}
      </tr>
      );
    });
  }

  function renderCrossSearchTable() {
    const typeLabel = { medicine: 'Medicine', equipment: 'Equipment', supplies: 'Supply' };

    return (
      <>
        <div style={styles.tableHeaderRow}>
          <div>
            <h3 style={styles.tableTitle}>Search Results</h3>
            <p style={styles.tableSubtitle}>
              {inventoryLoading
                ? 'Loading inventory records...'
                : `Showing matches across medicine, equipment, and supplies${isReceptionist ? ' for your branch' : ''}.`}
            </p>
            {inventoryError && (
              <p style={{ ...styles.tableSubtitle, color: '#b91c1c' }}>{inventoryError}</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!isReceptionist && (
              <button type="button" style={styles.stockSummaryBtn} onClick={openExpenseModal}>
                Expense Input
              </button>
            )}
            <button type="button" style={styles.stockSummaryBtn} onClick={openUsageHistoryModal}>
              View Usage History
            </button>
            <button type="button" style={styles.stockSummaryBtn} onClick={openStockSummaryModal}>
              View Stock Summary
            </button>
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={{ ...styles.inventoryTable, minWidth: 850 }}>
            <thead>
              <tr>
                <th style={styles.tableHead}>ID</th>
                <th style={styles.tableHead}>Type</th>
                {!isReceptionist && <th style={styles.tableHead}>Branch</th>}
                <th style={styles.tableHead}>Item Name</th>
                <th style={styles.tableHead}>Category</th>
                <th style={styles.tableHead}>Qty</th>
                <th style={styles.tableHead}>Status</th>
                {!isReceptionist && <th style={styles.tableHead}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedCrossResults.length === 0 ? (
                <tr>
                  <td colSpan={isReceptionist ? 5 : 7} style={styles.emptyRow}>
                    No inventory records found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedCrossResults.map((item) => (
                  <tr key={`${item._type}-${item.rawId}`} style={styles.tableRow}>
                    <td style={styles.tableCell}>{item.id}</td>
                    <td style={styles.tableCell}>{typeLabel[item._type] || item._type}</td>
                    {!isReceptionist && <td style={styles.tableCell}>{item.branchName}</td>}
                    <td style={{ ...styles.tableCell, fontWeight: 600 }}>{item._name}</td>
                    <td style={styles.tableCell}>{item.category}</td>
                    <td style={styles.tableCell}>{item.quantity}</td>
                    <td style={styles.tableCell}>
                      <span style={getStatusBadgeStyle(item.status)}>{item.status}</span>
                    </td>
                    {!isReceptionist && (
                      <td style={styles.tableCell}>
                        <button
                          type="button"
                          style={styles.editBtn}
                          onClick={() => openEditModalCross(item, item._type)}
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.pagination}>
          <button
            type="button"
            onClick={prevCrossPage}
            disabled={currentPages.search === 1}
            style={{
              ...styles.pageBtn,
              ...(currentPages.search === 1 ? styles.pageBtnDisabled : {}),
            }}
          >
            <i className="fi fi-rr-angle-left"></i>
          </button>
          <span style={styles.pageInfo}>
            {crossCategoryResults.length === 0
              ? 'Page 0 of 0'
              : `Page ${currentPages.search} of ${searchTotalPages}`}
          </span>
          <button
            type="button"
            onClick={nextCrossPage}
            disabled={currentPages.search >= searchTotalPages}
            style={{
              ...styles.pageBtn,
              ...(currentPages.search >= searchTotalPages ? styles.pageBtnDisabled : {}),
            }}
          >
            <i className="fi fi-rr-angle-right"></i>
          </button>
        </div>
      </>
    );
  }

  function renderTableHead() {
    if (activeTab === 'medicine') {
      return (
        <tr>
          <th style={styles.tableHead}>ID</th>
          <th style={styles.tableHead}>Branch</th>
          <th style={styles.tableHead}>Supplier</th>
          <th style={styles.tableHead}>Medicine Name</th>
          <th style={styles.tableHead}>Generic Name</th>
          <th style={styles.tableHead}>Category</th>
          <th style={styles.tableHead}>Form</th>
          <th style={styles.tableHead}>Dosage</th>
          <th style={styles.tableHead}>Unit</th>
          <th style={styles.tableHead}>Qty</th>
          <th style={styles.tableHead}>Price per Item</th>
          <th style={styles.tableHead}>Status</th>
          {!isReceptionist && <th style={styles.tableHead}>Action</th>}
        </tr>
      );
    }

    if (activeTab === 'equipment') {
      return (
        <tr>
          <th style={styles.tableHead}>ID</th>
          <th style={styles.tableHead}>Branch</th>
          <th style={styles.tableHead}>Supplier</th>
          <th style={styles.tableHead}>Equipment Name</th>
          <th style={styles.tableHead}>Brand</th>
          <th style={styles.tableHead}>Category</th>
          <th style={styles.tableHead}>Model Number</th>
          <th style={styles.tableHead}>Serial Number</th>
          <th style={styles.tableHead}>Purchase Date</th>
          <th style={styles.tableHead}>Warranty Date</th>
          <th style={styles.tableHead}>Location</th>
          <th style={styles.tableHead}>Qty</th>
          <th style={styles.tableHead}>Price per Item</th>
          <th style={styles.tableHead}>Status</th>
          {!isReceptionist && <th style={styles.tableHead}>Action</th>}
        </tr>
      );
    }

    return (
      <tr>
        <th style={styles.tableHead}>ID</th>
        <th style={styles.tableHead}>Branch</th>
        <th style={styles.tableHead}>Supplier</th>
        <th style={styles.tableHead}>Supply Name</th>
        <th style={styles.tableHead}>Brand</th>
        <th style={styles.tableHead}>Category</th>
        <th style={styles.tableHead}>Unit</th>
        <th style={styles.tableHead}>Qty</th>
        <th style={styles.tableHead}>Price per Item</th>
        <th style={styles.tableHead}>Status</th>
        {!isReceptionist && <th style={styles.tableHead}>Action</th>}
      </tr>
    );
  }

  function renderTableBody() {
    if (paginatedRows.length === 0) {
      return (
        <tr>
          <td colSpan={inventoryMap[activeTab].colspan} style={styles.emptyRow}>
            No inventory records found.
          </td>
        </tr>
      );
    }

    if (activeTab === 'medicine') {
      return renderMedicineRows();
    }

    if (activeTab === 'equipment') {
      return renderEquipmentRows();
    }

    return renderSupplyRows();
  }

  function renderEditModalFields() {
    if (!selectedInventoryItem) return null;

    return (
      <>
        <div style={styles.formGrid}>
          <label style={styles.formGroup}>
            <span style={styles.formLabel}>Branch</span>
            <input
              type="text"
              value={selectedInventoryItem.branchName || 'N/A'}
              readOnly
              style={{
                ...styles.formInput,
                background: '#f8fafc',
                color: '#475569',
                cursor: 'not-allowed',
              }}
              aria-readonly="true"
            />
          </label>

          {selectedInventoryItem.type === 'medicine' && (
            <>
              <label style={styles.formGroup}>
                <span style={styles.formLabel}>Generic Name</span>
                <input
                  type="text"
                  value={editForm.genericName}
                  onChange={(event) =>
                    handleEditFormChange('genericName', event.target.value)
                  }
                  style={styles.formInput}
                />
              </label>

              <label style={styles.formGroup}>
                <span style={styles.formLabel}>Form</span>
                <input
                  type="text"
                  value={editForm.form}
                  onChange={(event) =>
                    handleEditFormChange('form', event.target.value)
                  }
                  style={styles.formInput}
                />
              </label>

              <label style={styles.formGroup}>
                <span style={styles.formLabel}>Dosage</span>
                <input
                  type="text"
                  value={editForm.dosage}
                  onChange={(event) =>
                    handleEditFormChange('dosage', event.target.value)
                  }
                  style={styles.formInput}
                />
              </label>
            </>
          )}

          {selectedInventoryItem.type === 'supplies' && (
            <label style={styles.formGroup}>
              <span style={styles.formLabel}>Brand</span>
              <input
                type="text"
                value={editForm.brand}
                onChange={(event) =>
                  handleEditFormChange('brand', event.target.value)
                }
                style={styles.formInput}
              />
            </label>
          )}

          <label style={styles.formGroup}>
            <span style={styles.formLabel}>Category</span>
            <input
              type="text"
              value={editForm.category}
              onChange={(event) =>
                handleEditFormChange('category', event.target.value)
              }
              style={styles.formInput}
            />
          </label>

          <label style={styles.formGroup}>
            <span style={styles.formLabel}>Low Stock Threshold</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={editForm.threshold}
              onChange={(event) =>
                handleEditFormChange('threshold', event.target.value)
              }
              style={styles.formInput}
            />
          </label>

          {selectedInventoryItem.type !== 'equipment' && (
            <label style={styles.formGroup}>
              <span style={styles.formLabel}>Unit</span>
              <input
                type="text"
                value={editForm.unit}
                onChange={(event) =>
                  handleEditFormChange('unit', event.target.value)
                }
                style={styles.formInput}
              />
            </label>
          )}

          {selectedInventoryItem.type === 'equipment' && (
            <label style={styles.formGroup}>
              <span style={styles.formLabel}>Maintenance Status</span>
              <select
                value={editForm.maintenanceStatus}
                onChange={(event) =>
                  handleEditFormChange('maintenanceStatus', event.target.value)
                }
                style={styles.formInput}
              >
                <option value="Available">Available</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Needs Repair">Needs Repair</option>
                <option value="Retired">Retired</option>
              </select>
            </label>
          )}
        </div>

        <p style={styles.helperText}>
          Item name, branch, supplier, quantity, and price are managed through
          expense input.
        </p>

        {editError && (
          <p
            style={{
              ...styles.helperText,
              background: '#fef2f2',
              color: '#b91c1c',
            }}
          >
            {editError}
          </p>
        )}
      </>
    );
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <img src={clinicLogo} alt="Clinic Logo" style={styles.logoImg} />
        </div>

        <nav style={styles.menu}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...styles.menuItem,
                  ...(isActive ? styles.menuItemActive : {}),
                }}
              >
                <i className={item.icon} style={styles.menuItemIcon}></i>
                <span style={styles.menuItemText}>{item.label}</span>

                {item.badge > 0 && (
                  <span style={styles.notificationBadge}>{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div style={styles.logoutSection}>
          <div style={styles.dropdownDivider}></div>

          <button
            type="button"
            style={{ ...styles.menuItem, ...styles.logoutItem, width: '100%' }}
            onClick={openLogoutModal}
          >
            <i
              className="fi fi-rr-sign-out-alt"
              style={styles.menuItemIcon}
            ></i>
            <span style={styles.menuItemText}>Logout</span>
          </button>
        </div>
      </aside>

      <div style={styles.mainContainer}>
        <header style={styles.topHeader}>
          <div style={styles.headerActions}>
            {isReceptionist ? (
              <Link to="/receptionistProfile" style={receptionistHeaderStyle}>
                <div style={styles.avatar}>
                  <i className="fi fi-rr-user" style={styles.avatarIcon}></i>
                </div>

                <div style={styles.adminInfo}>
                  <div style={styles.adminName}>{profileName}</div>
                  <div style={styles.adminPosition}>{profilePosition}</div>
                </div>
              </Link>
            ) : (
              <div style={styles.adminProfile}>
                <div style={styles.avatar}>
                  <i className="fi fi-rr-user" style={styles.avatarIcon}></i>
                </div>

                <div style={styles.adminInfo}>
                  <div style={styles.adminName}>{profileName}</div>
                  <div style={styles.adminPosition}>{profilePosition}</div>
                </div>
              </div>
            )}
          </div>
        </header>

        <main style={styles.mainContent}>
          <section style={styles.heroSection}>
            <div style={styles.heroContent}>
              <span style={styles.heroBadge}>Inventory Overview</span>

              <h2 style={styles.heroTitle}>
                Monitor clinic inventory, stock availability, and equipment
                records.
              </h2>

              <p style={styles.heroText}>
                Manage medicines, supplies, and dental equipment while tracking
                inventory status and clinic stock activity.
              </p>
            </div>

            <div style={styles.heroIconBox}>
              <i className="fi fi-rr-boxes" style={styles.heroIcon}></i>
            </div>
          </section>

          <section style={styles.tabCard}>
            <button
              type="button"
              onClick={() => handleTabChange('medicine')}
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'medicine' ? styles.tabBtnActive : {}),
              }}
            >
              Dental Medicine
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('equipment')}
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'equipment' ? styles.tabBtnActive : {}),
              }}
            >
              Dental Equipment
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('supplies')}
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'supplies' ? styles.tabBtnActive : {}),
              }}
            >
              Dental Supplies
            </button>
          </section>

          <section style={styles.filterCard}>
            <div style={styles.searchFilterRow}>
              <div style={styles.searchBox}>
                <i className="fi fi-rr-search" style={styles.searchIcon}></i>

                <input
                  type="text"
                  placeholder="Search across all inventory categories"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  style={styles.searchInput}
                />
              </div>

              <div style={styles.stockFilterBox}>
                <i className="fi fi-rr-filter" style={styles.stockFilterIcon}></i>
                <select
                  value={stockStatusFilter}
                  onChange={(event) => {
                    setStockStatusFilter(event.target.value);
                    setCurrentPages((prev) => ({ ...prev, medicine: 1, equipment: 1, supplies: 1, search: 1 }));
                  }}
                  style={styles.stockFilterSelect}
                  aria-label="Filter inventory by stock status"
                >
                  <option value="">All</option>
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>

          </section>

          <section style={styles.tableCard}>
            {isCrossCategoryActive ? renderCrossSearchTable() : (
              <>
                <div style={styles.tableHeaderRow}>
                  <div>
                    <h3 style={styles.tableTitle}>{inventoryMap[activeTab].title}</h3>
                    <p style={styles.tableSubtitle}>
                      {inventoryLoading
                        ? 'Loading inventory records...'
                        : inventoryMap[activeTab].description}
                    </p>
                    {inventoryError && (
                      <p style={{ ...styles.tableSubtitle, color: '#b91c1c' }}>
                        {inventoryError}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {!isReceptionist && (
                      <button type="button" style={styles.stockSummaryBtn} onClick={openExpenseModal}>
                        Expense Input
                      </button>
                    )}
                    <button
                      type="button"
                      style={styles.stockSummaryBtn}
                      onClick={openUsageHistoryModal}
                    >
                      View Usage History
                    </button>
                    <button
                      type="button"
                      style={styles.stockSummaryBtn}
                      onClick={openStockSummaryModal}
                    >
                      View Stock Summary
                    </button>
                  </div>
                </div>

                <div style={styles.tableWrapper}>
                  <table
                    style={{
                      ...styles.inventoryTable,
                      minWidth: inventoryMap[activeTab].tableMinWidth,
                    }}
                  >
                    <thead>{renderTableHead()}</thead>
                    <tbody>{renderTableBody()}</tbody>
                  </table>
                </div>

                <div style={styles.pagination}>
                  <button
                    type="button"
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    style={{
                      ...styles.pageBtn,
                      ...(currentPage === 1 ? styles.pageBtnDisabled : {}),
                    }}
                  >
                    <i className="fi fi-rr-angle-left"></i>
                  </button>

                  <span style={styles.pageInfo}>
                    {filteredRows.length === 0
                      ? 'Page 0 of 0'
                      : `Page ${currentPage} of ${totalPages}`}
                  </span>

                  <button
                    type="button"
                    onClick={nextPage}
                    disabled={currentPage >= totalPages}
                    style={{
                      ...styles.pageBtn,
                      ...(currentPage >= totalPages ? styles.pageBtnDisabled : {}),
                    }}
                  >
                    <i className="fi fi-rr-angle-right"></i>
                  </button>
                </div>
              </>
            )}
          </section>
        </main>
      </div>

      {showStockSummaryModal && (
        <div style={styles.modal} onClick={handleStockSummaryOverlayClick}>
          <div style={styles.stockSummaryModalContent}>
            <div style={styles.stockSummaryModalHeader}>
              <div>
                <h2 style={styles.stockSummaryModalTitle}>Stock Summary</h2>
                <p style={styles.stockSummaryModalText}>
                  {isReceptionist
                    ? 'Branch inventory summary for the logged-in receptionist.'
                    : 'Clinic-wide inventory summary across all branches.'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeStockSummaryModal}
                style={styles.closeBtn}
              >
                ×
              </button>
            </div>

            <div style={styles.stockSummaryGrid}>
              <div
                style={{
                  ...styles.stockMetricCard,
                  ...styles.stockMetricBlue,
                  ...styles.stockMetricClickable,
                  ...(stockStatusFilter ? {} : styles.stockMetricSelected),
                }}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setStockStatusFilter('');
                  setCurrentPages((prev) => ({ ...prev, medicine: 1, equipment: 1, supplies: 1, search: 1 }));
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setStockStatusFilter('');
                    setCurrentPages((prev) => ({ ...prev, medicine: 1, equipment: 1, supplies: 1, search: 1 }));
                  }
                }}
              >
                <span style={styles.stockMetricLabel}>Total Items</span>
                <strong style={{ ...styles.stockMetricValue, color: '#1d4ed8' }}>
                  {stockSummary.totalItems}
                </strong>
              </div>

              <div style={{ ...styles.stockMetricCard, ...styles.stockMetricGreen }}>
                <span style={styles.stockMetricLabel}>Total Quantity</span>
                <strong style={{ ...styles.stockMetricValue, color: '#059669' }}>
                  {stockSummary.totalQuantity}
                </strong>
              </div>

              <div
                style={{
                  ...styles.stockMetricCard,
                  ...styles.stockMetricOrange,
                  ...styles.stockMetricClickable,
                  ...(stockStatusFilter === 'low_stock' ? styles.stockMetricSelected : {}),
                }}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setStockStatusFilter('low_stock');
                  setCurrentPages((prev) => ({ ...prev, medicine: 1, equipment: 1, supplies: 1, search: 1 }));
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setStockStatusFilter('low_stock');
                    setCurrentPages((prev) => ({ ...prev, medicine: 1, equipment: 1, supplies: 1, search: 1 }));
                  }
                }}
              >
                <span style={styles.stockMetricLabel}>Low Stock</span>
                <strong style={{ ...styles.stockMetricValue, color: '#f97316' }}>
                  {stockSummary.lowStock}
                </strong>
              </div>

              <div
                style={{
                  ...styles.stockMetricCard,
                  ...styles.stockMetricRed,
                  ...styles.stockMetricClickable,
                  ...(stockStatusFilter === 'out_of_stock' ? styles.stockMetricSelected : {}),
                }}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setStockStatusFilter('out_of_stock');
                  setCurrentPages((prev) => ({ ...prev, medicine: 1, equipment: 1, supplies: 1, search: 1 }));
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setStockStatusFilter('out_of_stock');
                    setCurrentPages((prev) => ({ ...prev, medicine: 1, equipment: 1, supplies: 1, search: 1 }));
                  }
                }}
              >
                <span style={styles.stockMetricLabel}>Out of Stock</span>
                <strong style={{ ...styles.stockMetricValue, color: '#dc2626' }}>
                  {stockSummary.outOfStock}
                </strong>
              </div>
            </div>

            <div style={styles.stockCategoryCard}>
              <div>
                <h4 style={styles.stockCategoryTitle}>Category</h4>
                <p style={styles.stockCategoryText}>
                  Select a category to view item-level stock summary.
                </p>
              </div>

              <div style={styles.stockCategoryTabs}>
                {[
                  { key: 'all', label: 'All' },
                  { key: 'medicine', label: 'Medicine' },
                  { key: 'equipment', label: 'Equipment' },
                  { key: 'supplies', label: 'Supplies' },
                ].map((category) => (
                  <button
                    key={category.key}
                    type="button"
                    onClick={() => setSelectedStockCategory(category.key)}
                    style={{
                      ...styles.stockCategoryTab,
                      ...(selectedStockCategory === category.key
                        ? styles.stockCategoryTabActive
                        : {}),
                    }}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.stockSummaryTableWrapper}>
              <table style={styles.inventoryTable}>
                <thead>
                  <tr>
                    {selectedStockCategory === 'all' && (
                      <th style={styles.tableHead}>Category</th>
                    )}
                    {!isReceptionist && <th style={styles.tableHead}>Branch</th>}
                    <th style={styles.tableHead}>
                      {getSummaryColumnLabel(selectedStockCategory)}
                    </th>
                    <th style={styles.tableHead}>Quantity</th>
                    <th style={styles.tableHead}>Unit</th>
                    <th style={styles.tableHead}>Threshold</th>
                    <th style={styles.tableHead}>Status</th>
                    <th style={styles.tableHead}>Last Updated</th>
                  </tr>
                </thead>

                <tbody>
                  {displayedStockSummaryRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={
                          selectedStockCategory === 'all'
                            ? isReceptionist
                              ? 7
                              : 8
                            : isReceptionist
                            ? 6
                            : 7
                        }
                        style={styles.emptyRow}
                      >
                        No stock summary records found.
                      </td>
                    </tr>
                  ) : (
                    displayedStockSummaryRows.map((item) => (
                      <tr key={item.id} style={styles.tableRow}>
                        {selectedStockCategory === 'all' && (
                          <td style={styles.tableCell}>{item.category}</td>
                        )}
                        {!isReceptionist && (
                          <td style={styles.tableCell}>{item.branchName}</td>
                        )}
                        <td style={{ ...styles.tableCell, fontWeight: 700 }}>
                          {item.name}
                        </td>
                        <td style={styles.tableCell}>{item.quantity}</td>
                        <td style={styles.tableCell}>{item.unit}</td>
                        <td style={styles.tableCell}>
                          {item.threshold > 0 ? item.threshold : 'N/A'}
                        </td>
                        <td style={styles.tableCell}>
                          <span style={getStatusBadgeStyle(item.status)}>
                            {item.status === 'Healthy' ? 'In Stock' : item.status}
                          </span>
                        </td>
                        <td style={styles.tableCell}>{item.lastUpdated}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showUsageHistoryModal && (
        <div style={styles.modal} onClick={handleUsageHistoryOverlayClick}>
          <div style={styles.stockSummaryModalContent}>
            <div style={styles.stockSummaryModalHeader}>
              <div>
                <h2 style={styles.stockSummaryModalTitle}>Usage History</h2>
                <p style={styles.stockSummaryModalText}>
                  {isReceptionist
                    ? 'Inventory deductions for your assigned branch.'
                    : 'Inventory deductions across all accessible branches.'}
                </p>
              </div>

              <button type="button" onClick={closeUsageHistoryModal} style={styles.closeBtn}>
                X
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                alignItems: 'flex-end',
                marginBottom: 12,
              }}
            >
              <label style={{ ...styles.formGroup, marginBottom: 0, minWidth: 180, flex: 1 }}>
                <span style={styles.formLabel}>From</span>
                <input
                  type="date"
                  value={usageHistoryFilters.startDate}
                  max={usageHistoryFilters.endDate || ''}
                  onChange={(e) => handleUsageHistoryStartDateChange(e.target.value)}
                  style={styles.formInput}
                />
              </label>

              <label style={{ ...styles.formGroup, marginBottom: 0, minWidth: 180, flex: 1 }}>
                <span style={styles.formLabel}>To</span>
                <input
                  type="date"
                  value={usageHistoryFilters.endDate}
                  min={usageHistoryFilters.startDate || ''}
                  onChange={(e) => handleUsageHistoryEndDateChange(e.target.value)}
                  style={styles.formInput}
                />
              </label>

              <button
                type="button"
                style={{ ...styles.stockSummaryBtn, height: 42 }}
                onClick={() => {
                  setUsageHistoryFilters({ startDate: '', endDate: '' });
                  setUsageHistoryError('');
                }}
              >
                Clear Filters
              </button>
            </div>

            {usageHistoryError && (
              <p style={{ ...styles.tableSubtitle, color: '#b91c1c', marginBottom: 10 }}>
                {usageHistoryError}
              </p>
            )}

            <div style={{ ...styles.stockSummaryTableWrapper, flex: 1 }}>
              <table style={styles.inventoryTable}>
                <thead>
                  <tr>
                    <th style={styles.tableHead}>Type</th>
                    <th style={styles.tableHead}>Item Name</th>
                    <th style={styles.tableHead}>Category</th>
                    <th style={styles.tableHead}>Qty Deducted</th>
                    <th style={styles.tableHead}>Service</th>
                    <th style={styles.tableHead}>Appointment Date</th>
                    <th style={styles.tableHead}>Branch</th>
                    <th style={styles.tableHead}>Deducted Date</th>
                    <th style={styles.tableHead}>Deducted By</th>
                  </tr>
                </thead>
                <tbody>
                  {usageHistoryLoading ? (
                    <tr>
                      <td colSpan={9} style={styles.emptyRow}>
                        Loading usage history...
                      </td>
                    </tr>
                  ) : usageHistoryRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={styles.emptyRow}>
                        No usage history records found.
                      </td>
                    </tr>
                  ) : (
                    usageHistoryRows.map((row) => (
                      <tr key={row.id} style={styles.tableRow}>
                        <td style={styles.tableCell}>{String(row.type || '').toUpperCase()}</td>
                        <td style={{ ...styles.tableCell, fontWeight: 700 }}>{fallback(row.item_name)}</td>
                        <td style={styles.tableCell}>{fallback(row.category)}</td>
                        <td style={styles.tableCell}>{Number(row.qty_deducted || 0)}</td>
                        <td style={styles.tableCell}>{fallback(row.service)}</td>
                        <td style={styles.tableCell}>{formatDateTime(row.appointment_date)}</td>
                        <td style={styles.tableCell}>
                          {row.branch_address
                            ? getBranchCity({ branch_address: row.branch_address, branch_name: row.branch_name })
                            : fallback(row.branch_name)}
                        </td>
                        <td style={styles.tableCell}>{formatDateTime(row.deducted_at)}</td>
                        <td style={styles.tableCell}>
                          {fallback(
                            row.deducted_by_role ||
                              row.deductedByRole ||
                              row.recorded_by_role ||
                              row.recordedByRole ||
                              row.recorded_by ||
                              row.recordedBy ||
                              'Dentist'
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!isReceptionist && showEditModal && (
        <div style={styles.modal} onClick={handleEditOverlayClick}>
          <div style={styles.editModalContent}>
            <div style={styles.editModalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Edit Inventory Item</h2>
                <p style={styles.modalText}>
                  Only item classification fields can be updated here.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                style={styles.closeBtn}
              >
                ×
              </button>
            </div>

            {renderEditModalFields()}

            <div style={styles.editModalActions}>
              <button
                type="button"
                onClick={handleSaveEdit}
                style={styles.saveBtn}
                disabled={editSaving}
              >
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>

              <button
                type="button"
                onClick={closeEditModal}
                style={styles.cancelEditBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {!isReceptionist && showExpenseModal && (
        <div style={styles.modal} onClick={(e) => { if (e.target === e.currentTarget) closeExpenseModal(); }}>
          <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', padding: '28px 28px 24px', boxShadow: '0 8px 32px rgba(0,0,0,0.16)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a', fontFamily: 'Arial, sans-serif' }}>Expense Input</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b', fontFamily: 'Arial, sans-serif' }}>Inventory purchase expense</p>
              </div>
              <button type="button" onClick={closeExpenseModal} style={styles.closeBtn}>×</button>
            </div>

            <label style={styles.formGroup}>
              <span style={styles.formLabel}>Date</span>
              <input
                type="date"
                value={expenseForm.date}
                onChange={(e) => handleExpenseChange('date', e.target.value)}
                style={styles.formInput}
              />
            </label>

            <label style={styles.formGroup}>
              <span style={styles.formLabel}>Branch</span>
              <select
                value={expenseForm.branchId}
                onFocus={refreshExpenseFormOptions}
                onChange={(e) => handleExpenseChange('branchId', e.target.value)}
                style={styles.formInput}
              >
                <option value="">Select branch</option>
                {expenseBranchOptions.map((b) => (
                  <option key={b.id} value={b.id}>{getExpenseBranchLabel(b)}</option>
                ))}
              </select>
            </label>

            <label style={styles.formGroup}>
              <span style={styles.formLabel}>Category</span>
              <select
                value={expenseForm.category}
                onChange={(e) => handleExpenseChange('category', e.target.value)}
                style={styles.formInput}
              >
                <option value="medicine">Dental Medicine</option>
                <option value="equipment">Dental Equipment</option>
                <option value="supplies">Dental Supplies</option>
              </select>
            </label>

            <label style={styles.formGroup}>
              <span style={styles.formLabel}>Item Name</span>
              <input
                type="text"
                list="inv-expense-item-options"
                value={expenseForm.itemName}
                onChange={(e) => handleExpenseChange('itemName', e.target.value)}
                placeholder={!expenseForm.branchId ? 'Select Branch First' : expenseItemOptionsList.length ? 'Select or enter item name' : 'Enter item name'}
                style={styles.formInput}
              />
              <datalist id="inv-expense-item-options">
                {expenseItemOptionsList.map((name) => <option key={name} value={name} />)}
              </datalist>
            </label>

            <label style={styles.formGroup}>
              <span style={styles.formLabel}>Supplier</span>
              <input
                type="text"
                list="inv-expense-supplier-options"
                value={expenseForm.supplier}
                onChange={(e) => handleExpenseChange('supplier', e.target.value)}
                placeholder="Enter Supplier"
                style={styles.formInput}
              />
              <datalist id="inv-expense-supplier-options">
                {expenseSupplierOptions.map((s) => <option key={s} value={s} />)}
              </datalist>
            </label>

            <label style={styles.formGroup}>
              <span style={styles.formLabel}>Order Quantity</span>
              <input
                type="number"
                min="1"
                value={expenseForm.orderQuantity}
                placeholder="Enter Quantity"
                onChange={(e) => handleExpenseChange('orderQuantity', e.target.value === '' ? '' : Number(e.target.value))}
                style={styles.formInput}
              />
            </label>

            <label style={styles.formGroup}>
              <span style={styles.formLabel}>Price per Item</span>
              <input
                type="number"
                min="0"
                value={expenseForm.pricePerItem}
                placeholder="Enter Price Per Item"
                onChange={(e) => handleExpenseChange('pricePerItem', e.target.value === '' ? '' : Number(e.target.value))}
                style={styles.formInput}
              />
            </label>

            <label style={styles.formGroup}>
              <span style={styles.formLabel}>Low Stock Threshold</span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={expenseForm.threshold}
                placeholder={!expenseForm.itemName ? 'Select item first' : ''}
                onChange={(e) => handleExpenseChange('threshold', e.target.value)}
                style={styles.formInput}
              />
            </label>

            <div style={{ background: '#f0f9ff', borderRadius: 8, padding: '12px 14px', fontFamily: 'Arial, sans-serif' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Total Expense</p>
              <h4 style={{ margin: '4px 0 0', fontSize: 15, color: '#0f172a', fontWeight: 700 }}>
                {expenseForm.orderQuantity || 0} × {formatPeso(expenseForm.pricePerItem || 0)} = {formatPeso(computedExpense)}
              </h4>
            </div>

            {expenseSaveError && (
              <p style={{ margin: 0, fontSize: 13, color: '#b91c1c', fontFamily: 'Arial, sans-serif' }}>{expenseSaveError}</p>
            )}

            <div style={styles.editModalActions}>
              <button
                type="button"
                style={{
                  ...styles.saveBtn,
                  transform: saveExpenseClicked ? 'scale(0.97)' : 'scale(1)',
                  opacity: saveExpenseClicked ? 0.82 : 1,
                  transition: 'transform 120ms ease, opacity 120ms ease',
                }}
                onClick={handleSaveExpense}
              >
                Save Expense
              </button>
              <button type="button" style={styles.cancelEditBtn} onClick={closeExpenseModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {!isReceptionist && showExpenseConfirmModal && (
        <div style={styles.modal} onClick={(e) => { if (e.target === e.currentTarget) closeExpenseConfirmModal(); }}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-receipt" style={styles.modalIconText}></i>
            </div>
            <h2 style={styles.modalTitle}>Confirm Expense</h2>
            <p style={styles.modalText}>Please review the details before saving this expense.</p>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', marginBottom: 8 }}>
              {[
                ['Date', expenseForm.date || 'Not selected'],
                ['Branch', selectedExpenseBranch ? getExpenseBranchLabel(selectedExpenseBranch) : 'Not selected'],
                ['Category', expenseCategoryLabels[expenseForm.category] || expenseForm.category],
                ['Item Name', expenseForm.itemName || 'Not entered'],
                ['Supplier', expenseForm.supplier || 'Not entered'],
                ['Quantity', String(expenseForm.orderQuantity || 0)],
                ['Price per Item', formatPeso(expenseForm.pricePerItem || 0)],
                ['Low Stock Threshold', expenseForm.threshold === '' ? 'Not set' : String(expenseForm.threshold)],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>{label}</span>
                  <strong style={{ color: '#0f172a' }}>{val}</strong>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14 }}>
                <span style={{ color: '#374151', fontWeight: 700 }}>Total Expense</span>
                <strong style={{ color: '#2563eb', fontSize: 15 }}>{formatPeso(computedExpense)}</strong>
              </div>
            </div>
            {expenseSaveError && (
              <p style={{ ...styles.modalText, color: '#dc2626' }}>{expenseSaveError}</p>
            )}
            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.saveBtn }}
                disabled={expenseSaving}
                onClick={handleConfirmExpenseSave}
              >
                {expenseSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                disabled={expenseSaving}
                onClick={closeExpenseConfirmModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div style={styles.modal} onClick={handleModalOverlayClick}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i
                className="fi fi-rr-sign-out-alt"
                style={styles.modalIconText}
              ></i>
            </div>

            <h2 style={styles.modalTitle}>Confirm Logout</h2>

            <p style={styles.modalText}>Are you sure you want to log out?</p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={handleLogout}
              >
                Logout
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={closeLogoutModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
