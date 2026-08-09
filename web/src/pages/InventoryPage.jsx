import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '../auth/AuthContext';
import {
  createInventoryPurchaseExpense,
  listEquipment,
  listInventoryItemHistory,
  listInventoryUsageHistory,
  listMedicines,
  listSupplies,
  updateEquipment,
  updateMedicine,
  updateSupply,
} from '../api/inventory';
import { getUnreadNotificationCount } from '../api/notifications';
import api from '../api/axios';
import AdminProfileMenu from '../components/AdminProfileMenu';
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

function getMaximumStock(row) {
  return Number(
    row?.max_stock_threshold ||
      row?.maximum_stock ||
      row?.max_stock ||
      row?.stock_maximum ||
      0
  );
}

function getStockPercentageValue(quantity, maxStock) {
  const qty = Number(quantity || 0);
  const max = Number(maxStock || 0);

  if (max <= 0) return 0;

  return Math.min(100, Math.max(0, Math.round((qty / max) * 100)));
}

function formatStockPercentage(quantity, maxStock) {
  const max = Number(maxStock || 0);

  if (max <= 0) return 'N/A';

  return `${getStockPercentageValue(quantity, maxStock)}%`;
}

function formatBackendStockPercentage(row) {
  const maxStock = getMaximumStock(row);
  if (maxStock <= 0) return 'N/A';

  const percentage = Number(row?.stock_percentage);
  if (!Number.isFinite(percentage)) {
    return formatStockPercentage(row?.quantity, maxStock);
  }

  return `${Math.min(100, Math.max(0, percentage))}%`;
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
    maxStock: getMaximumStock(row),
    stockPercentage: formatBackendStockPercentage(row),
    pricePerItem: Number(row.price_per_item || 0),
    dateAdded: formatDateOnly(row.date_added || row.created_at),
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
    maxStock: getMaximumStock(row),
    stockPercentage: formatBackendStockPercentage(row),
    pricePerItem: Number(row.price_per_item || 0),
    dateAdded: formatDateOnly(row.date_added || row.created_at),
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
    maxStock: getMaximumStock(row),
    stockPercentage: formatBackendStockPercentage(row),
    pricePerItem: Number(row.price_per_item || 0),
    dateAdded: formatDateOnly(row.date_added || row.created_at),
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

function getInventoryItemName(item) {
  if (!item) return 'N/A';
  if (item.type === 'medicine') return item.medicineName || 'N/A';
  if (item.type === 'equipment') return item.equipmentName || 'N/A';
  return item.supplyName || 'N/A';
}

const emptyExpenseInventoryRows = { medicine: [], equipment: [], supplies: [] };
const emptyExpenseItemOptions = { medicine: [], equipment: [], supplies: [] };
const expenseRequiredFields = [
  'date',
  'branchId',
  'category',
  'itemName',
  'supplier',
  'orderQuantity',
  'pricePerItem',
  'threshold',
];
const expenseCategoryLabels = { medicine: 'Dental Medicine', equipment: 'Dental Equipment', supplies: 'Dental Supplies' };
const initialExpenseForm = {
  date: '',
  branchId: '',
  category: '',
  itemName: '',
  supplier: '',
  orderQuantity: '',
  pricePerItem: '',
  threshold: '',
  maxStock: '',
};
const expenseGold = '#d4af37';
const expenseGoldDark = '#9a6b00';
const expenseGoldSoft = '#fff8e1';
const expenseGoldBorder = '#f3d675';
const LETTERS_AND_SPACES_ONLY = /^[A-Za-z\s]+$/;
const editLettersOnlyFields = ['genericName', 'form', 'category', 'unit'];

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
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);
  const [showEditCancelConfirmModal, setShowEditCancelConfirmModal] = useState(false);
  const [showStockSummaryModal, setShowStockSummaryModal] = useState(false);
  const [showUsageHistoryModal, setShowUsageHistoryModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showExpenseConfirmModal, setShowExpenseConfirmModal] = useState(false);
  const [showExpenseSuccessModal, setShowExpenseSuccessModal] = useState(false);
  const [showExpenseCancelConfirmModal, setShowExpenseCancelConfirmModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState(initialExpenseForm);
  const [expenseTouchedFields, setExpenseTouchedFields] = useState({});
  const [expenseInventoryRows, setExpenseInventoryRows] = useState(emptyExpenseInventoryRows);
  const [expenseBranchOptions, setExpenseBranchOptions] = useState([]);
  const [expenseSaving, setExpenseSaving] = useState(false);
  const [expenseSaveError, setExpenseSaveError] = useState('');
  const [expenseStockLimitError, setExpenseStockLimitError] = useState(null);
  const [saveExpenseClicked, setSaveExpenseClicked] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [editForm, setEditForm] = useState({
    equipmentName: '',
    supplyName: '',
    genericName: '',
    brand: '',
    category: '',
    form: '',
    dosage: '',
    modelNumber: '',
    serialNumber: '',
    purchaseDate: '',
    warrantyDate: '',
    location: '',
    unit: '',
    threshold: '',
    maxStock: '',
    maintenanceStatus: '',
  });
  const [editTouchedFields, setEditTouchedFields] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [showItemHistory, setShowItemHistory] = useState(false);
  const [showItemHistoryCloseConfirm, setShowItemHistoryCloseConfirm] = useState(false);
  const [itemHistoryRows, setItemHistoryRows] = useState([]);
  const [itemHistoryLoading, setItemHistoryLoading] = useState(false);
  const [itemHistoryError, setItemHistoryError] = useState('');
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState('');

  const [usageHistoryLoading, setUsageHistoryLoading] = useState(false);
  const [usageHistoryError, setUsageHistoryError] = useState('');
  const [usageHistoryRows, setUsageHistoryRows] = useState([]);
  const [usageHistorySearch, setUsageHistorySearch] = useState('');
  const [isUsageClearRangePressed, setIsUsageClearRangePressed] = useState(false);
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
  const [dateAddedFromFilter, setDateAddedFromFilter] = useState('');
  const [dateAddedToFilter, setDateAddedToFilter] = useState('');
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
  const isTablet =
    !isReceptionist && screenWidth > 850 && screenWidth <= 1200;
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
      { label: 'Transactions', path: '/adminTransactions', icon: 'fi fi-rr-file-invoice-dollar' },
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
      colspan: isReceptionist ? 15 : 16,
      tableMinWidth: 1760,
    },
    equipment: {
      label: 'Dental Equipment',
      title: 'Dental Equipment',
      description: isReceptionist
        ? 'View dental equipment details for your assigned branch.'
        : 'View dental equipment details, warranty, and location.',
      rows: equipment,
      colspan: isReceptionist ? 17 : 18,
      tableMinWidth: 2000,
    },
    supplies: {
      label: 'Dental Supplies',
      title: 'Dental Supplies',
      description: isReceptionist
        ? 'View supplies and availability for your assigned branch.'
        : 'View supplies, units, and availability status.',
      rows: supplies,
      colspan: isReceptionist ? 13 : 14,
      tableMinWidth: 1600,
    },
  };

  const isSearchActive = searchValue.trim().length > 0;
  const isStockFilterActive = Boolean(stockStatusFilter);
  const isDateAddedFilterActive = Boolean(dateAddedFromFilter || dateAddedToFilter);
  const isCrossCategoryActive = isSearchActive || isStockFilterActive || isDateAddedFilterActive;

  const activeRows = inventoryMap[activeTab].rows;

  function matchesStockStatusFilter(item) {
    if (!stockStatusFilter) return true;
    const status = getSummaryStatus(item);

    if (stockStatusFilter === 'in_stock') return status === 'Healthy';
    if (stockStatusFilter === 'low_stock') return status === 'Low Stock';
    if (stockStatusFilter === 'out_of_stock') return status === 'Out of Stock';

    return true;
  }

  function matchesDateAddedFilter(item) {
    const dateAdded = String(item?.dateAdded || '').slice(0, 10);
    if (!dateAddedFromFilter && !dateAddedToFilter) return true;
    if (!dateAdded || dateAdded === 'N/A') return false;
    if (dateAddedFromFilter && dateAdded < dateAddedFromFilter) return false;
    if (dateAddedToFilter && dateAdded > dateAddedToFilter) return false;
    return true;
  }

  function resetInventoryFilterPages() {
    setCurrentPages((prev) => ({ ...prev, medicine: 1, equipment: 1, supplies: 1, search: 1 }));
  }

  function handleDateAddedFromChange(value) {
    setDateAddedFromFilter(value);
    if (dateAddedToFilter && value && dateAddedToFilter < value) {
      setDateAddedToFilter('');
    }
    resetInventoryFilterPages();
  }

  function handleDateAddedToChange(value) {
    if (dateAddedFromFilter && value && value < dateAddedFromFilter) {
      return;
    }
    setDateAddedToFilter(value);
    resetInventoryFilterPages();
  }

  const filteredRows = useMemo(() => {
    const search = searchValue.toLowerCase().trim();

    return activeRows.filter((item) => {
      if (!matchesStockStatusFilter(item)) return false;
      if (!matchesDateAddedFilter(item)) return false;
      const rowText = Object.values(item).join(' ').toLowerCase();
      const matchesSearch = rowText.includes(search);
      return matchesSearch;
    });
  }, [activeRows, searchValue, stockStatusFilter, dateAddedFromFilter, dateAddedToFilter]);

  const crossCategoryResults = useMemo(() => {
    const search = searchValue.toLowerCase().trim();
    if (!search && !stockStatusFilter && !isDateAddedFilterActive) return [];

    function matchItem(item) {
      if (!matchesStockStatusFilter(item)) return false;
      if (!matchesDateAddedFilter(item)) return false;
      if (!search) return true;
      return Object.values(item).join(' ').toLowerCase().includes(search);
    }

    return [
      ...medicines.filter(matchItem).map((item) => ({ ...item, _type: 'medicine', _name: item.medicineName })),
      ...equipment.filter(matchItem).map((item) => ({ ...item, _type: 'equipment', _name: item.equipmentName })),
      ...supplies.filter(matchItem).map((item) => ({ ...item, _type: 'supplies', _name: item.supplyName })),
    ];
  }, [medicines, equipment, supplies, searchValue, stockStatusFilter, dateAddedFromFilter, dateAddedToFilter, isDateAddedFilterActive]);

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
          maxStock: Number(item.maxStock || 0),
          stockPercentage: item.stockPercentage,
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

  const isExpenseOrderQuantityValid = Number(expenseForm.orderQuantity || 0) >= 1;

  const isExpenseFormComplete = expenseRequiredFields.every(
    (field) => String(expenseForm[field] ?? '').trim() !== ''
  ) && isExpenseOrderQuantityValid;

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
    if (!expenseForm.branchId || !expenseForm.category) return [];
    const branchId = Number(expenseForm.branchId);
    return (expenseInventoryRows[expenseForm.category] || []).filter(
      (row) => Number(row.branch_id) === branchId
    );
  }, [expenseForm.branchId, expenseForm.category, expenseInventoryRows]);

  const filteredUsageHistoryRows = useMemo(() => {
    const keyword = String(usageHistorySearch || '').trim().toLowerCase();
    if (!keyword) return usageHistoryRows;
    return usageHistoryRows.filter((row) =>
      String(row?.item_name || '').toLowerCase().includes(keyword)
    );
  }, [usageHistoryRows, usageHistorySearch]);

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

    async function loadItemHistory() {
      if (!showItemHistory || !selectedInventoryItem?.rawId || !selectedInventoryItem?.type) {
        return;
      }

      setItemHistoryLoading(true);
      setItemHistoryError('');
      try {
        const records = await listInventoryItemHistory(
          selectedInventoryItem.type,
          selectedInventoryItem.rawId
        );
        if (!cancelled) setItemHistoryRows(records);
      } catch (err) {
        if (!cancelled) {
          setItemHistoryRows([]);
          setItemHistoryError(err.response?.data?.message || 'Failed to load item history.');
        }
      } finally {
        if (!cancelled) setItemHistoryLoading(false);
      }
    }

    loadItemHistory();

    return () => {
      cancelled = true;
    };
  }, [selectedInventoryItem?.rawId, selectedInventoryItem?.type, showItemHistory]);

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
    if (
      showLogoutModal ||
      showEditModal ||
      showEditConfirmModal ||
      showEditCancelConfirmModal ||
      showItemHistory ||
      showItemHistoryCloseConfirm ||
      showStockSummaryModal ||
      showUsageHistoryModal ||
      showExpenseModal ||
      showExpenseConfirmModal ||
      showExpenseSuccessModal ||
      showExpenseCancelConfirmModal
    ) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [
    showLogoutModal,
    showEditModal,
    showEditConfirmModal,
    showEditCancelConfirmModal,
    showItemHistory,
    showItemHistoryCloseConfirm,
    showStockSummaryModal,
    showUsageHistoryModal,
    showExpenseModal,
    showExpenseConfirmModal,
    showExpenseSuccessModal,
    showExpenseCancelConfirmModal,
  ]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLogoutModal();
        closeEditModal();
        closeEditConfirmModal();
        closeEditCancelConfirmModal();
        closeItemHistoryModal();
        closeItemHistoryCloseConfirmModal();
        closeStockSummaryModal();
        closeUsageHistoryModal();
        closeExpenseModal();
        closeExpenseConfirmModal();
        closeExpenseSuccessModal();
        closeExpenseCancelConfirmModal();
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
      handleCancelEditModal();
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
      equipmentName: item.equipmentName === 'N/A' ? '' : item.equipmentName || '',
      supplyName: item.supplyName === 'N/A' ? '' : item.supplyName || '',
      genericName: item.genericName === 'N/A' ? '' : item.genericName || '',
      brand: item.brand === 'N/A' ? '' : item.brand || '',
      category: item.category === 'N/A' ? '' : item.category || '',
      form: item.form === 'N/A' ? '' : item.form || '',
      dosage: item.dosage === 'N/A' ? '' : item.dosage || '',
      modelNumber: item.modelNumber === 'N/A' ? '' : item.modelNumber || '',
      serialNumber: item.serialNumber === 'N/A' ? '' : item.serialNumber || '',
      purchaseDate: item.purchaseDate === 'N/A' ? '' : item.purchaseDate || '',
      warrantyDate: item.warrantyDate === 'N/A' ? '' : item.warrantyDate || '',
      location: item.location === 'N/A' ? '' : item.location || '',
      unit: item.unit === 'N/A' ? '' : item.unit || '',
      threshold: Number.isFinite(Number(item.threshold)) ? String(Number(item.threshold)) : '',
      maxStock: Number.isFinite(Number(item.maxStock)) && Number(item.maxStock) > 0 ? String(Number(item.maxStock)) : '',
      maintenanceStatus:
        item.maintenanceStatus === 'N/A'
          ? 'Available'
          : item.maintenanceStatus || 'Available',
    });
    setEditError('');
    setEditTouchedFields({});
    setShowItemHistory(false);
    setShowItemHistoryCloseConfirm(false);
    setItemHistoryRows([]);
    setItemHistoryError('');
    setShowEditModal(true);
  }

  function closeEditModal() {
    setShowEditModal(false);
    setShowEditConfirmModal(false);
    setShowEditCancelConfirmModal(false);
    setSelectedInventoryItem(null);
    setEditError('');
    setEditTouchedFields({});
    setShowItemHistory(false);
    setShowItemHistoryCloseConfirm(false);
    setItemHistoryRows([]);
    setItemHistoryError('');
  }

  function closeEditConfirmModal() {
    if (editSaving) return;
    setShowEditConfirmModal(false);
  }

  function handleCancelEditModal() {
    setShowEditCancelConfirmModal(true);
  }

  function closeEditCancelConfirmModal() {
    setShowEditCancelConfirmModal(false);
  }

  function confirmCancelEditModal() {
    closeEditModal();
  }

  function openItemHistoryModal() {
    setItemHistoryError('');
    setShowItemHistory(true);
  }

  function requestCloseItemHistoryModal() {
    setShowItemHistoryCloseConfirm(true);
  }

  function closeItemHistoryCloseConfirmModal() {
    setShowItemHistoryCloseConfirm(false);
  }

  function closeItemHistoryModal() {
    setShowItemHistory(false);
    setShowItemHistoryCloseConfirm(false);
    setItemHistoryError('');
  }

  function handleEditFormChange(field, value) {
    setEditTouchedFields((prev) => ({ ...prev, [field]: true }));
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleEditFieldBlur(field) {
    setEditTouchedFields((prev) => ({ ...prev, [field]: true }));
  }

  function getRequiredEditFields() {
    if (!selectedInventoryItem) return [];

    if (selectedInventoryItem.type === 'medicine') {
      return ['genericName', 'form', 'dosage', 'category', 'threshold', 'unit'];
    }

    if (selectedInventoryItem.type === 'supplies') {
      return ['brand', 'category', 'threshold', 'unit'];
    }

    return [
      'brand',
      'category',
      'modelNumber',
      'serialNumber',
      'purchaseDate',
      'warrantyDate',
      'location',
      'threshold',
      'maintenanceStatus',
    ];
  }

  function isEditFieldInvalid(field) {
    return editTouchedFields[field] && Boolean(getEditFieldError(field));
  }

  function getEditFieldError(field) {
    const value = String(editForm[field] ?? '');
    const trimmedValue = value.trim();

    if (getRequiredEditFields().includes(field) && trimmedValue === '') {
      return 'This field is required.';
    }

    if (
      editLettersOnlyFields.includes(field) &&
      trimmedValue !== '' &&
      !LETTERS_AND_SPACES_ONLY.test(trimmedValue)
    ) {
      return 'Only letters and spaces are allowed.';
    }

    return '';
  }

  function getEditFieldStyle(field) {
    return {
      ...styles.formInput,
      height: 48,
      padding: '0 14px',
      borderRadius: 15,
      borderColor: '#dbe3ef',
      background: '#ffffff',
      color: '#334155',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      ...(isEditFieldInvalid(field)
        ? { borderColor: '#dc2626', boxShadow: '0 0 0 1px #dc2626' }
        : {}),
    };
  }

  function renderEditRequiredLabel(label) {
    return (
      <span style={{ ...styles.formLabel, color: '#8b6508', fontWeight: 700 }}>
        {label} <span style={{ color: '#dc2626' }}>*</span>
      </span>
    );
  }

  function renderEditFieldError(field) {
    const message = editTouchedFields[field] ? getEditFieldError(field) : '';
    if (!message) return null;

    return (
      <span
        style={{
          color: '#dc2626',
          fontSize: 12,
          fontWeight: 700,
          fontFamily: 'Arial, sans-serif',
          lineHeight: 1.25,
        }}
      >
        {message}
      </span>
    );
  }

  function buildEditPayload() {
    if (!selectedInventoryItem) return;

    const type = selectedInventoryItem.type;
    const thresholdValue =
      editForm.threshold === '' || editForm.threshold === null || typeof editForm.threshold === 'undefined'
        ? undefined
        : Math.max(0, Number(editForm.threshold) || 0);

    const maxStockValue =
      editForm.maxStock === '' || editForm.maxStock === null || typeof editForm.maxStock === 'undefined'
        ? undefined
        : Math.max(0, Number(editForm.maxStock) || 0);

    if (typeof maxStockValue === 'number' && maxStockValue > 0 && Number(selectedInventoryItem.quantity || 0) > maxStockValue) {
      setEditError('Maximum stock cannot be lower than the current quantity.');
      return;
    }

    return type === 'medicine'
      ? {
          generic_name: editForm.genericName.trim(),
          category: editForm.category.trim(),
          form: editForm.form.trim(),
          dosage: editForm.dosage.trim(),
          unit: editForm.unit.trim(),
          ...(typeof thresholdValue === 'number' ? { low_stock_threshold: thresholdValue } : {}),
          ...(typeof maxStockValue === 'number' ? { maximum_stock: maxStockValue } : {}),
        }
      : type === 'supplies'
      ? {
          brand: editForm.brand.trim(),
          category: editForm.category.trim(),
          unit: editForm.unit.trim(),
          ...(typeof thresholdValue === 'number' ? { low_stock_threshold: thresholdValue } : {}),
          ...(typeof maxStockValue === 'number' ? { maximum_stock: maxStockValue } : {}),
        }
      : {
          brand: editForm.brand.trim(),
          category: editForm.category.trim(),
          model_number: editForm.modelNumber.trim(),
          serial_number: editForm.serialNumber.trim(),
          purchase_date: editForm.purchaseDate,
          warranty_date: editForm.warrantyDate,
          location: editForm.location.trim(),
          maintenance_status: editForm.maintenanceStatus,
          ...(typeof thresholdValue === 'number' ? { low_stock_threshold: thresholdValue } : {}),
          ...(typeof maxStockValue === 'number' ? { maximum_stock: maxStockValue } : {}),
        };
  }

  function getEditChangeSummary() {
    if (!selectedInventoryItem) return [];

    const fields =
      selectedInventoryItem.type === 'medicine'
        ? [
            ['Generic Name', selectedInventoryItem.genericName, editForm.genericName],
            ['Form', selectedInventoryItem.form, editForm.form],
            ['Dosage', selectedInventoryItem.dosage, editForm.dosage],
            ['Category', selectedInventoryItem.category, editForm.category],
            ['Critical Stock Level', selectedInventoryItem.threshold, editForm.threshold],
            ['Maximum Stock', selectedInventoryItem.maxStock, editForm.maxStock],
            ['Unit', selectedInventoryItem.unit, editForm.unit],
          ]
        : selectedInventoryItem.type === 'supplies'
        ? [
            ['Brand', selectedInventoryItem.brand, editForm.brand],
            ['Category', selectedInventoryItem.category, editForm.category],
            ['Critical Stock Level', selectedInventoryItem.threshold, editForm.threshold],
            ['Maximum Stock', selectedInventoryItem.maxStock, editForm.maxStock],
            ['Unit', selectedInventoryItem.unit, editForm.unit],
          ]
        : [
            ['Brand', selectedInventoryItem.brand, editForm.brand],
            ['Category', selectedInventoryItem.category, editForm.category],
            ['Model Number', selectedInventoryItem.modelNumber, editForm.modelNumber],
            ['Serial Number', selectedInventoryItem.serialNumber, editForm.serialNumber],
            ['Purchase Date', selectedInventoryItem.purchaseDate, editForm.purchaseDate],
            ['Warranty Date', selectedInventoryItem.warrantyDate, editForm.warrantyDate],
            ['Location', selectedInventoryItem.location, editForm.location],
            ['Critical Stock Level', selectedInventoryItem.threshold, editForm.threshold],
            ['Maximum Stock', selectedInventoryItem.maxStock, editForm.maxStock],
            ['Maintenance Status', selectedInventoryItem.maintenanceStatus, editForm.maintenanceStatus],
          ];

    return fields
      .map(([label, before, after]) => ({
        label,
        before: String(before ?? '').trim() || 'N/A',
        after: String(after ?? '').trim() || 'N/A',
      }))
      .filter((change) => change.before !== change.after);
  }

  function handleSaveEdit() {
    if (!selectedInventoryItem) return;

    setEditError('');
    const requiredFields = getRequiredEditFields();
    const hasMissingRequiredField = requiredFields.some(
      (field) => String(editForm[field] ?? '').trim() === ''
    );
    const invalidCharacterFields = editLettersOnlyFields.filter(
      (field) => String(editForm[field] ?? '').trim() !== '' && getEditFieldError(field)
    );

    if (hasMissingRequiredField || invalidCharacterFields.length) {
      const invalidFields = Array.from(new Set([...requiredFields, ...invalidCharacterFields]));
      setEditTouchedFields((prev) => ({
        ...prev,
        ...Object.fromEntries(invalidFields.map((field) => [field, true])),
      }));
      return;
    }

    const payload = buildEditPayload();
    if (!payload) return;

    if (!getEditChangeSummary().length) {
      setEditError('No changes to save.');
      return;
    }

    setShowEditConfirmModal(true);
  }

  async function handleConfirmSaveEdit() {
    if (!selectedInventoryItem) return;

    const payload = buildEditPayload();
    if (!payload) return;

    const type = selectedInventoryItem.type;

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
      setShowEditConfirmModal(false);
      closeEditModal();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update item.');
      setShowEditConfirmModal(false);
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
      equipmentName: item.equipmentName === 'N/A' ? '' : item.equipmentName || '',
      supplyName: item.supplyName === 'N/A' ? '' : item.supplyName || '',
      genericName: item.genericName === 'N/A' ? '' : item.genericName || '',
      brand: item.brand === 'N/A' ? '' : item.brand || '',
      category: item.category === 'N/A' ? '' : item.category || '',
      form: item.form === 'N/A' ? '' : item.form || '',
      dosage: item.dosage === 'N/A' ? '' : item.dosage || '',
      modelNumber: item.modelNumber === 'N/A' ? '' : item.modelNumber || '',
      serialNumber: item.serialNumber === 'N/A' ? '' : item.serialNumber || '',
      purchaseDate: item.purchaseDate === 'N/A' ? '' : item.purchaseDate || '',
      warrantyDate: item.warrantyDate === 'N/A' ? '' : item.warrantyDate || '',
      location: item.location === 'N/A' ? '' : item.location || '',
      unit: item.unit === 'N/A' ? '' : item.unit || '',
      threshold: Number.isFinite(Number(item.threshold)) ? String(Number(item.threshold)) : '',
      maxStock: Number.isFinite(Number(item.maxStock)) && Number(item.maxStock) > 0 ? String(Number(item.maxStock)) : '',
      maintenanceStatus:
        item.maintenanceStatus === 'N/A' ? 'Available' : item.maintenanceStatus || 'Available',
    });
    setEditError('');
    setEditTouchedFields({});
    setShowItemHistory(false);
    setShowItemHistoryCloseConfirm(false);
    setItemHistoryRows([]);
    setItemHistoryError('');
    setShowEditModal(true);
  }

  function openExpenseModal() {
    setShowExpenseModal(true);
  }

  function closeExpenseModal() {
    setShowExpenseModal(false);
    setShowExpenseCancelConfirmModal(false);
    setExpenseForm(initialExpenseForm);
    setExpenseSaveError('');
    setExpenseStockLimitError(null);
    setExpenseTouchedFields({});
  }

  function handleCancelExpenseModal() {
    setShowExpenseCancelConfirmModal(true);
  }

  function closeExpenseCancelConfirmModal() {
    setShowExpenseCancelConfirmModal(false);
  }

  function confirmCancelExpenseModal() {
    closeExpenseModal();
  }

  function closeExpenseConfirmModal() {
    if (expenseSaving) return;
    setShowExpenseConfirmModal(false);
  }

  function closeExpenseSuccessModal() {
    setShowExpenseSuccessModal(false);
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
    setExpenseStockLimitError(null);
    setExpenseTouchedFields((prev) => ({ ...prev, [field]: true }));
    setExpenseForm((prev) => {
      const updatedForm = { ...prev, [field]: value };
      if (field === 'category' || field === 'branchId') {
        updatedForm.itemName = '';
        updatedForm.supplier = '';
        updatedForm.orderQuantity = '';
        updatedForm.pricePerItem = '';
        updatedForm.threshold = '';
        updatedForm.maxStock = '';
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
          updatedForm.maxStock =
            getMaximumStock(matchingItem) > 0
              ? String(getMaximumStock(matchingItem))
              : '';
        } else {
          updatedForm.threshold = '';
          updatedForm.maxStock = '';
        }
      }
      return updatedForm;
    });
  }

  function handleExpenseFieldBlur(field) {
    setExpenseTouchedFields((prev) => ({ ...prev, [field]: true }));
  }

  function isExpenseFieldInvalid(field) {
    if (field === 'orderQuantity') {
      return (
        expenseTouchedFields[field] &&
        (String(expenseForm[field] ?? '').trim() === '' ||
          Number(expenseForm[field] || 0) < 1)
      );
    }

    return (
      expenseTouchedFields[field] &&
      String(expenseForm[field] ?? '').trim() === ''
    );
  }

  function getExpenseFieldError(field) {
    if (!isExpenseFieldInvalid(field)) return '';
    if (field === 'orderQuantity' && Number(expenseForm[field] || 0) < 1) {
      return 'This field is required.';
    }
    return 'This field is required.';
  }

  function renderExpenseFieldError(field) {
    const message = getExpenseFieldError(field);
    if (!message) return null;

    return (
      <span
        style={{
          color: '#dc2626',
          fontSize: 12,
          fontWeight: 700,
          fontFamily: 'Arial, sans-serif',
          lineHeight: 1.25,
        }}
      >
        {message}
      </span>
    );
  }

  function getExpenseFieldStyle(field) {
    return {
      ...styles.formInput,
      height: 48,
      padding: '0 14px',
      borderRadius: 15,
      borderColor: '#dbe3ef',
      background: '#ffffff',
      color: '#334155',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      ...(isExpenseFieldInvalid(field)
        ? { borderColor: '#dc2626', boxShadow: '0 0 0 1px #dc2626' }
        : {}),
    };
  }

  function renderRequiredLabel(label) {
    return (
      <span style={{ ...styles.formLabel, color: '#8b6508', fontWeight: 700 }}>
        {label} <span style={{ color: '#dc2626' }}>*</span>
      </span>
    );
  }

  function handleSaveExpense() {
    setExpenseSaveError('');
    setExpenseStockLimitError(null);

    if (!isExpenseFormComplete) {
      setExpenseTouchedFields((prev) => ({
        ...prev,
        ...Object.fromEntries(expenseRequiredFields.map((field) => [field, true])),
      }));
      return;
    }

    const orderQuantity = Number(expenseForm.orderQuantity || 0);
    const maxStockValue = Number(expenseForm.maxStock || 0);

    if (maxStockValue > 0) {
      const selectedExistingItem = selectedExpenseInventoryRows.find(
        (row) =>
          String(getExpenseItemName(row, expenseForm.category) || '')
            .trim()
            .toLowerCase() === String(expenseForm.itemName || '').trim().toLowerCase()
      );
      const existingQuantity = Number(selectedExistingItem?.quantity || 0);

      if (existingQuantity + orderQuantity > maxStockValue) {
        setExpenseStockLimitError({
          orderQuantity,
          currentQuantity: existingQuantity,
          maximumStock: maxStockValue,
        });
        return;
      }
    }
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

      const maxStockValue =
        expenseForm.maxStock === '' || expenseForm.maxStock === null || typeof expenseForm.maxStock === 'undefined'
          ? undefined
          : Math.max(0, Number(expenseForm.maxStock) || 0);

      if ((typeof thresholdValue === 'number' || typeof maxStockValue === 'number') && expenseRes?.inventory_id) {
        const inventoryId = expenseRes.inventory_id;
        const thresholdPayload = {
          ...(typeof thresholdValue === 'number' ? { low_stock_threshold: thresholdValue } : {}),
          ...(typeof maxStockValue === 'number' ? { maximum_stock: maxStockValue } : {}),
        };

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
      setExpenseSaving(false);
      closeExpenseModal();
      setShowExpenseSuccessModal(true);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setShowExpenseSuccessModal(false);
    } catch (err) {
      setExpenseSaveError(err.response?.data?.message || 'Failed to save expense.');
      setExpenseSaving(false);
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
        <td style={styles.tableCell}>{item.maxStock > 0 ? item.maxStock : 'N/A'}</td>
        <td style={styles.tableCell}>{item.stockPercentage}</td>
        <td style={styles.tableCell}>{formatPeso(item.pricePerItem)}</td>
        <td style={styles.tableCell}>
          <span style={getStatusBadgeStyle(getSummaryStatus(item))}>{getSummaryStatus(item) === 'Healthy' ? 'In Stock' : getSummaryStatus(item)}</span>
        </td>
        <td style={styles.tableCell}>{item.dateAdded}</td>
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
        <td style={styles.tableCell}>{item.maxStock > 0 ? item.maxStock : 'N/A'}</td>
        <td style={styles.tableCell}>{item.stockPercentage}</td>
        <td style={styles.tableCell}>{formatPeso(item.pricePerItem)}</td>
        <td style={styles.tableCell}>
          <span style={getStatusBadgeStyle(getSummaryStatus(item))}>{getSummaryStatus(item) === 'Healthy' ? 'In Stock' : getSummaryStatus(item)}</span>
        </td>
        <td style={styles.tableCell}>{item.dateAdded}</td>
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
        <td style={styles.tableCell}>{item.maxStock > 0 ? item.maxStock : 'N/A'}</td>
        <td style={styles.tableCell}>{item.stockPercentage}</td>
        <td style={styles.tableCell}>{formatPeso(item.pricePerItem)}</td>
        <td style={styles.tableCell}>
          <span style={getStatusBadgeStyle(getSummaryStatus(item))}>{getSummaryStatus(item) === 'Healthy' ? 'In Stock' : getSummaryStatus(item)}</span>
        </td>
        <td style={styles.tableCell}>{item.dateAdded}</td>
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
            <p
              style={{
                ...styles.tableSubtitle,
                color: '#b91c1c',
              }}
            >
              {inventoryError}
            </p>
          )}
        </div>

        <div style={styles.tableActionGroup}>
          {!isReceptionist && (
            <button
              type="button"
              style={styles.stockSummaryBtn}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = '#d4af37';
                event.currentTarget.style.color = '#ffffff';
                event.currentTarget.style.borderColor = '#d4af37';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = '#fff8e1';
                event.currentTarget.style.color = '#b8860b';
                event.currentTarget.style.borderColor = '#d4af37';
              }}
              onClick={openExpenseModal}
            >
              Expense Input
            </button>
          )}

          <button
            type="button"
            style={styles.stockSummaryBtn}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = '#d4af37';
              event.currentTarget.style.color = '#ffffff';
              event.currentTarget.style.borderColor = '#d4af37';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = '#fff8e1';
              event.currentTarget.style.color = '#b8860b';
              event.currentTarget.style.borderColor = '#d4af37';
            }}
            onClick={openUsageHistoryModal}
          >
            View Usage History
          </button>

          <button
            type="button"
            style={styles.stockSummaryBtn}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = '#d4af37';
              event.currentTarget.style.color = '#ffffff';
              event.currentTarget.style.borderColor = '#d4af37';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = '#fff8e1';
              event.currentTarget.style.color = '#b8860b';
              event.currentTarget.style.borderColor = '#d4af37';
            }}
            onClick={openStockSummaryModal}
          >
            View Stock Summary
          </button>
        </div>
      </div>

        <div style={styles.tableWrapper}>
          <table style={{ ...styles.inventoryTable, minWidth: 1150 }}>
            <thead>
              <tr>
                <th style={styles.tableHead}>ID</th>
                <th style={styles.tableHead}>Type</th>
                {!isReceptionist && <th style={styles.tableHead}>Branch</th>}
                <th style={styles.tableHead}>Item Name</th>
                <th style={styles.tableHead}>Category</th>
                <th style={styles.tableHead}>Qty</th>
                <th style={styles.tableHead}>Maximum Stock</th>
                <th style={styles.tableHead}>Current Stock %</th>
                <th style={styles.tableHead}>Status</th>
                <th style={styles.tableHead}>Date Added</th>
                {!isReceptionist && <th style={styles.tableHead}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedCrossResults.length === 0 ? (
                <tr>
                  <td colSpan={isReceptionist ? 9 : 10} style={styles.emptyRow}>
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
                    <td style={styles.tableCell}>{item.maxStock > 0 ? item.maxStock : 'N/A'}</td>
                    <td style={styles.tableCell}>{item.stockPercentage}</td>
                    <td style={styles.tableCell}>
                      <span style={getStatusBadgeStyle(getSummaryStatus(item))}>{getSummaryStatus(item) === 'Healthy' ? 'In Stock' : getSummaryStatus(item)}</span>
                    </td>
                    <td style={styles.tableCell}>{item.dateAdded}</td>
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
              ...styles.prevPageBtn,
              ...(currentPages.search === 1 ? styles.pageBtnDisabled : {}),
            }}
          >
            Previous
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
              ...styles.nextPageBtn,
              ...(currentPages.search >= searchTotalPages ? styles.pageBtnDisabled : {}),
            }}
          >
            Next
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
          <th style={styles.tableHead}>Maximum Stock</th>
          <th style={styles.tableHead}>Current Stock %</th>
          <th style={styles.tableHead}>Price per Item</th>
          <th style={styles.tableHead}>Status</th>
          <th style={styles.tableHead}>Date Added</th>
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
          <th style={styles.tableHead}>Maximum Stock</th>
          <th style={styles.tableHead}>Current Stock %</th>
          <th style={styles.tableHead}>Price per Item</th>
          <th style={styles.tableHead}>Status</th>
          <th style={styles.tableHead}>Date Added</th>
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
        <th style={styles.tableHead}>Maximum Stock</th>
        <th style={styles.tableHead}>Current Stock %</th>
        <th style={styles.tableHead}>Price per Item</th>
        <th style={styles.tableHead}>Status</th>
        <th style={styles.tableHead}>Date Added</th>
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

    const readOnlyFieldStyle = {
      ...styles.formInput,
      height: 48,
      padding: '0 14px',
      borderRadius: 15,
      borderColor: '#dbe3ef',
      background: '#ffffff',
      color: '#334155',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      cursor: 'not-allowed',
    };
    const editLabelStyle = { ...styles.formLabel, color: '#8b6508', fontWeight: 700 };
    const renderExpenseManagedFields = () => (
      <>
        <label style={styles.formGroup}>
          <span style={editLabelStyle}>Item Name</span>
          <input
            type="text"
            value={getInventoryItemName(selectedInventoryItem)}
            readOnly
            style={readOnlyFieldStyle}
            aria-readonly="true"
          />
        </label>

        <label style={styles.formGroup}>
          <span style={editLabelStyle}>Branch</span>
          <input
            type="text"
            value={selectedInventoryItem.branchName || 'N/A'}
            readOnly
            style={readOnlyFieldStyle}
            aria-readonly="true"
          />
        </label>

        <label style={styles.formGroup}>
          <span style={editLabelStyle}>Supplier</span>
          <input
            type="text"
            value={selectedInventoryItem.supplier || 'N/A'}
            readOnly
            style={readOnlyFieldStyle}
            aria-readonly="true"
          />
        </label>

        <label style={styles.formGroup}>
          <span style={editLabelStyle}>Quantity</span>
          <input
            type="text"
            value={String(selectedInventoryItem.quantity ?? 0)}
            readOnly
            style={readOnlyFieldStyle}
            aria-readonly="true"
          />
        </label>

        <label style={styles.formGroup}>
          <span style={editLabelStyle}>Price per Item</span>
          <input
            type="text"
            value={formatPeso(selectedInventoryItem.pricePerItem || 0)}
            readOnly
            style={readOnlyFieldStyle}
            aria-readonly="true"
          />
        </label>

        <label style={styles.formGroup}>
          <span style={editLabelStyle}>Date Added</span>
          <input
            type="text"
            value={selectedInventoryItem.dateAdded || 'N/A'}
            readOnly
            style={readOnlyFieldStyle}
            aria-readonly="true"
          />
        </label>
      </>
    );
    const renderExpenseManagedNote = () => (
      <p style={{ ...styles.helperText, border: `1px solid ${expenseGoldBorder}`, background: '#ffffff', color: expenseGoldDark, fontWeight: 700 }}>
        Item name, branch, supplier, quantity, and price are managed through
        expense input.
      </p>
    );

    if (selectedInventoryItem.type === 'equipment') {
      return (
        <>
          <div style={styles.formGrid}>
            {renderExpenseManagedFields()}

            <label style={styles.formGroup}>
              {renderEditRequiredLabel('Brand')}
              <input
                type="text"
                value={editForm.brand}
                onChange={(event) =>
                  handleEditFormChange('brand', event.target.value)
                }
                onBlur={() => handleEditFieldBlur('brand')}
                style={getEditFieldStyle('brand')}
              />
              {renderEditFieldError('brand')}
            </label>

            <label style={styles.formGroup}>
              {renderEditRequiredLabel('Category')}
              <input
                type="text"
                value={editForm.category}
                onChange={(event) =>
                  handleEditFormChange('category', event.target.value)
                }
                onBlur={() => handleEditFieldBlur('category')}
                style={getEditFieldStyle('category')}
              />
              {renderEditFieldError('category')}
            </label>

            <label style={styles.formGroup}>
              {renderEditRequiredLabel('Model Number')}
              <input
                type="text"
                value={editForm.modelNumber}
                onChange={(event) =>
                  handleEditFormChange('modelNumber', event.target.value)
                }
                onBlur={() => handleEditFieldBlur('modelNumber')}
                style={getEditFieldStyle('modelNumber')}
              />
              {renderEditFieldError('modelNumber')}
            </label>

            <label style={styles.formGroup}>
              {renderEditRequiredLabel('Serial Number')}
              <input
                type="text"
                value={editForm.serialNumber}
                onChange={(event) =>
                  handleEditFormChange('serialNumber', event.target.value)
                }
                onBlur={() => handleEditFieldBlur('serialNumber')}
                style={getEditFieldStyle('serialNumber')}
              />
              {renderEditFieldError('serialNumber')}
            </label>

            <label style={styles.formGroup}>
              {renderEditRequiredLabel('Purchase Date')}
              <input
                type="date"
                value={editForm.purchaseDate}
                onChange={(event) =>
                  handleEditFormChange('purchaseDate', event.target.value)
                }
                onBlur={() => handleEditFieldBlur('purchaseDate')}
                style={getEditFieldStyle('purchaseDate')}
              />
              {renderEditFieldError('purchaseDate')}
            </label>

            <label style={styles.formGroup}>
              {renderEditRequiredLabel('Warranty Date')}
              <input
                type="date"
                value={editForm.warrantyDate}
                onChange={(event) =>
                  handleEditFormChange('warrantyDate', event.target.value)
                }
                onBlur={() => handleEditFieldBlur('warrantyDate')}
                style={getEditFieldStyle('warrantyDate')}
              />
              {renderEditFieldError('warrantyDate')}
            </label>

            <label style={styles.formGroup}>
              {renderEditRequiredLabel('Location')}
              <input
                type="text"
                value={editForm.location}
                onChange={(event) =>
                  handleEditFormChange('location', event.target.value)
                }
                onBlur={() => handleEditFieldBlur('location')}
                style={getEditFieldStyle('location')}
              />
              {renderEditFieldError('location')}
            </label>

            <label style={styles.formGroup}>
              {renderEditRequiredLabel('Critical Stock Level')}
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={editForm.threshold}
                onChange={(event) =>
                  handleEditFormChange('threshold', event.target.value)
                }
                onBlur={() => handleEditFieldBlur('threshold')}
                onWheel={(event) => event.currentTarget.blur()}
                style={getEditFieldStyle('threshold')}
              />
              {renderEditFieldError('threshold')}
            </label>

            <label style={styles.formGroup}>
              <span style={editLabelStyle}>Maximum Stock</span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={editForm.maxStock}
                onChange={(event) =>
                  handleEditFormChange('maxStock', event.target.value)
                }
                onWheel={(event) => event.currentTarget.blur()}
                style={getEditFieldStyle('maxStock')}
              />
            </label>

            <label style={styles.formGroup}>
              {renderEditRequiredLabel('Maintenance Status')}
              <select
                value={editForm.maintenanceStatus}
                onChange={(event) =>
                  handleEditFormChange('maintenanceStatus', event.target.value)
                }
                onBlur={() => handleEditFieldBlur('maintenanceStatus')}
                style={getEditFieldStyle('maintenanceStatus')}
              >
                <option value="Available">Available</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Needs Repair">Needs Repair</option>
                <option value="Retired">Retired</option>
              </select>
              {renderEditFieldError('maintenanceStatus')}
            </label>
          </div>

          {renderExpenseManagedNote()}

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

    if (selectedInventoryItem.type === 'supplies') {
      return (
        <>
          <div style={styles.formGrid}>
            {renderExpenseManagedFields()}

            <label style={styles.formGroup}>
              {renderEditRequiredLabel('Brand')}
              <input
                type="text"
                value={editForm.brand}
                onChange={(event) =>
                  handleEditFormChange('brand', event.target.value)
                }
                onBlur={() => handleEditFieldBlur('brand')}
                style={getEditFieldStyle('brand')}
              />
              {renderEditFieldError('brand')}
            </label>

            <label style={styles.formGroup}>
              {renderEditRequiredLabel('Category')}
              <input
                type="text"
                value={editForm.category}
                onChange={(event) =>
                  handleEditFormChange('category', event.target.value)
                }
                onBlur={() => handleEditFieldBlur('category')}
                style={getEditFieldStyle('category')}
              />
              {renderEditFieldError('category')}
            </label>

            <label style={styles.formGroup}>
              {renderEditRequiredLabel('Unit')}
              <input
                type="text"
                value={editForm.unit}
                onChange={(event) =>
                  handleEditFormChange('unit', event.target.value)
                }
                onBlur={() => handleEditFieldBlur('unit')}
                style={getEditFieldStyle('unit')}
              />
              {renderEditFieldError('unit')}
            </label>

            <label style={styles.formGroup}>
              {renderEditRequiredLabel('Critical Stock Level')}
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={editForm.threshold}
                onChange={(event) =>
                  handleEditFormChange('threshold', event.target.value)
                }
                onBlur={() => handleEditFieldBlur('threshold')}
                onWheel={(event) => event.currentTarget.blur()}
                style={getEditFieldStyle('threshold')}
              />
              {renderEditFieldError('threshold')}
            </label>

            <label style={styles.formGroup}>
              <span style={editLabelStyle}>Maximum Stock</span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={editForm.maxStock}
                onChange={(event) =>
                  handleEditFormChange('maxStock', event.target.value)
                }
                onWheel={(event) => event.currentTarget.blur()}
                style={getEditFieldStyle('maxStock')}
              />
            </label>
          </div>

          {renderExpenseManagedNote()}

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
      <>
        <div style={styles.formGrid}>
          {renderExpenseManagedFields()}

          {selectedInventoryItem.type === 'medicine' && (
            <>
              <label style={styles.formGroup}>
                {renderEditRequiredLabel('Generic Name')}
                <input
                  type="text"
                  value={editForm.genericName}
                  onChange={(event) =>
                    handleEditFormChange('genericName', event.target.value)
                  }
                  onBlur={() => handleEditFieldBlur('genericName')}
                  style={getEditFieldStyle('genericName')}
                />
                {renderEditFieldError('genericName')}
              </label>

              <label style={styles.formGroup}>
                {renderEditRequiredLabel('Form')}
                <input
                  type="text"
                  value={editForm.form}
                  onChange={(event) =>
                    handleEditFormChange('form', event.target.value)
                  }
                  onBlur={() => handleEditFieldBlur('form')}
                  style={getEditFieldStyle('form')}
                />
                {renderEditFieldError('form')}
              </label>

              <label style={styles.formGroup}>
                {renderEditRequiredLabel('Dosage')}
                <input
                  type="text"
                  value={editForm.dosage}
                  onChange={(event) =>
                    handleEditFormChange('dosage', event.target.value)
                  }
                  onBlur={() => handleEditFieldBlur('dosage')}
                  style={getEditFieldStyle('dosage')}
                />
                {renderEditFieldError('dosage')}
              </label>
            </>
          )}

          {selectedInventoryItem.type === 'supplies' && (
            <label style={styles.formGroup}>
              {renderEditRequiredLabel('Brand')}
              <input
                type="text"
                value={editForm.brand}
                onChange={(event) =>
                  handleEditFormChange('brand', event.target.value)
                }
                onBlur={() => handleEditFieldBlur('brand')}
                style={getEditFieldStyle('brand')}
              />
              {renderEditFieldError('brand')}
            </label>
          )}

          <label style={styles.formGroup}>
            {renderEditRequiredLabel('Category')}
            <input
              type="text"
              value={editForm.category}
              onChange={(event) =>
                handleEditFormChange('category', event.target.value)
              }
              onBlur={() => handleEditFieldBlur('category')}
              style={getEditFieldStyle('category')}
            />
            {renderEditFieldError('category')}
          </label>

          <label style={styles.formGroup}>
            {renderEditRequiredLabel('Critical Stock Level')}
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={editForm.threshold}
              onChange={(event) =>
                handleEditFormChange('threshold', event.target.value)
              }
              onBlur={() => handleEditFieldBlur('threshold')}
              style={getEditFieldStyle('threshold')}
            />
            {renderEditFieldError('threshold')}
          </label>

          <label style={styles.formGroup}>
            <span style={editLabelStyle}>Maximum Stock</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={editForm.maxStock}
              onChange={(event) =>
                handleEditFormChange('maxStock', event.target.value)
              }
              onWheel={(event) => event.currentTarget.blur()}
              style={getEditFieldStyle('maxStock')}
            />
          </label>

          <label style={styles.formGroup}>
            {renderEditRequiredLabel('Unit')}
            <input
              type="text"
              value={editForm.unit}
              onChange={(event) =>
                handleEditFormChange('unit', event.target.value)
              }
              onBlur={() => handleEditFieldBlur('unit')}
              style={getEditFieldStyle('unit')}
            />
            {renderEditFieldError('unit')}
          </label>

        </div>

        {renderExpenseManagedNote()}

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

  function renderItemHistoryModal() {
    return (
      <div
        style={{
          ...styles.stockSummaryModalContent,
          width: isMobile ? '100%' : 'min(860px, 94vw)',
          maxWidth: '94vw',
        }}
      >
        <div style={styles.stockSummaryModalHeader}>
          <div>
            <h2 style={{ ...styles.stockSummaryModalTitle, color: '#3f2f08' }}>
              Version History
            </h2>
            <p style={{ ...styles.stockSummaryModalText, color: expenseGoldDark, fontWeight: 700 }}>
              {getInventoryItemName(selectedInventoryItem)} inventory changes
            </p>
          </div>

          <button
            type="button"
            onClick={requestCloseItemHistoryModal}
            style={{
              ...styles.cancelEditBtn,
              width: 40,
              minWidth: 40,
              height: 40,
              padding: 0,
              flexShrink: 0,
              border: 'none',
            }}
            aria-label="Close item history"
          >
            x
          </button>
        </div>

        {itemHistoryLoading ? (
          <p style={{ ...styles.helperText, margin: 0 }}>Loading history...</p>
        ) : itemHistoryError ? (
          <p style={{ ...styles.helperText, margin: 0, background: '#fef2f2', color: '#b91c1c' }}>
            {itemHistoryError}
          </p>
        ) : itemHistoryRows.length === 0 ? (
          <p style={{ ...styles.helperText, margin: 0 }}>No item history recorded yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '62vh', overflowY: 'auto', paddingRight: 4 }}>
            {itemHistoryRows.map((history) => (
              <div
                key={history.id}
                style={{
                  border: '1px solid #f3d675',
                  borderRadius: 14,
                  background: '#ffffff',
                  padding: 12,
                  fontFamily: 'Arial, sans-serif',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                  <strong style={{ color: '#172033', fontSize: 13 }}>{history.action}</strong>
                  <span style={{ color: '#64748b', fontSize: 11, whiteSpace: 'nowrap' }}>
                    {formatDateTime(history.changed_at)}
                  </span>
                </div>
                <p style={{ margin: '5px 0 8px', color: expenseGoldDark, fontSize: 12, fontWeight: 700 }}>
                  {history.summary}
                </p>
                <p style={{ margin: '0 0 8px', color: '#64748b', fontSize: 12 }}>
                  By {history.changed_by || 'Staff'}
                </p>
                {(history.changes || []).slice(0, 5).map((change) => (
                  <div
                    key={`${history.id}-${change.field}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 1fr)',
                      gap: 3,
                      padding: '7px 0',
                      borderTop: '1px solid #f8e7a6',
                    }}
                  >
                    <span style={{ color: '#334155', fontSize: 12, fontWeight: 800 }}>{change.field}</span>
                    <span style={{ color: '#64748b', fontSize: 12, lineHeight: 1.35 }}>
                      {change.before || 'N/A'} to {change.after || 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
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
              <AdminProfileMenu styles={styles} adminName={profileName} />
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

              <div style={styles.inventoryFilterControls}>
                <div style={styles.inventoryFilterGroup}>
                  <label style={styles.inventoryFilterLabel}>Status</label>
                  <select
                    value={stockStatusFilter}
                    onChange={(event) => {
                      setStockStatusFilter(event.target.value);
                      resetInventoryFilterPages();
                    }}
                    style={styles.inventoryFilterSelect}
                    aria-label="Filter inventory by stock status"
                  >
                    <option value="">All</option>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                <div style={styles.inventoryFilterGroup}>
                  <label style={styles.inventoryFilterLabel}>From</label>
                  <input
                    type="date"
                    value={dateAddedFromFilter}
                    onChange={(event) => handleDateAddedFromChange(event.target.value)}
                    style={styles.inventoryFilterInput}
                    aria-label="Filter inventory date added from"
                  />
                </div>

                <div style={styles.inventoryFilterGroup}>
                  <label style={styles.inventoryFilterLabel}>To</label>
                  <input
                    type="date"
                    value={dateAddedToFilter}
                    min={dateAddedFromFilter || undefined}
                    onChange={(event) => handleDateAddedToChange(event.target.value)}
                    style={styles.inventoryFilterInput}
                    aria-label="Filter inventory date added to"
                  />
                </div>
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

                  <div style={styles.tableButtonGroup}>
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
                      ...styles.prevPageBtn,
                      ...(currentPage === 1 ? styles.pageBtnDisabled : {}),
                    }}
                  >
                    Previous
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
                      ...styles.nextPageBtn,
                      ...(currentPage >= totalPages ? styles.pageBtnDisabled : {}),
                    }}
                  >
                    Next
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
                X
              </button>
            </div>

            <div style={styles.stockSummaryGrid}>
              <div style={{ ...styles.stockMetricCard, ...styles.stockMetricGreen }}>
                <span style={styles.stockMetricLabel}>Total Quantity</span>
                <strong style={{ ...styles.stockMetricValue, color: '#059669' }}>
                  {stockSummary.totalQuantity}
                </strong>
              </div>

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
                    <th style={styles.tableHead}>Maximum Stock</th>
                    <th style={styles.tableHead}>Current Stock %</th>
                    <th style={styles.tableHead}>Unit</th>
                    <th style={styles.tableHead}>Critical Stock Level</th>
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
                              ? 9
                              : 10
                            : isReceptionist
                            ? 8
                            : 9
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
                        <td style={styles.tableCell}>{item.maxStock > 0 ? item.maxStock : 'N/A'}</td>
                        <td style={styles.tableCell}>{item.stockPercentage}</td>
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
                style={{
                  ...styles.stockSummaryBtn,
                  height: 42,
                  transition: 'transform 120ms ease, box-shadow 120ms ease',
                  boxShadow: isUsageClearRangePressed
                    ? '0 0 0 rgba(15, 23, 42, 0)'
                    : '0 1px 0 rgba(15, 23, 42, 0.04)',
                  transform: isUsageClearRangePressed ? 'scale(0.97)' : 'scale(1)',
                }}
                onMouseDown={() => setIsUsageClearRangePressed(true)}
                onMouseUp={() => setIsUsageClearRangePressed(false)}
                onMouseLeave={() => setIsUsageClearRangePressed(false)}
                onClick={() => {
                  setUsageHistoryFilters({ startDate: '', endDate: '' });
                  setUsageHistoryError('');
                }}
              >
                Clear Range
              </button>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ ...styles.formGroup, marginBottom: 0 }}>
                <span style={styles.formLabel}>Search Item Name</span>
                <input
                  type="text"
                  value={usageHistorySearch}
                  onChange={(e) => setUsageHistorySearch(e.target.value)}
                  placeholder="Search deducted item name"
                  style={styles.formInput}
                />
              </label>
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
                  ) : filteredUsageHistoryRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={styles.emptyRow}>
                        No usage history records found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredUsageHistoryRows.map((row) => (
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
          <div
            style={{
              ...styles.editModalContent,
              border: '1px solid #e5e7eb',
              boxShadow: '0 22px 50px rgba(15, 23, 42, 0.25)',
            }}
          >
            <div style={styles.editModalHeader}>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: isMobile ? 22 : 26, fontWeight: 800, color: '#172033', fontFamily: 'Arial, sans-serif', letterSpacing: '.3px' }}>Edit Inventory Item</h2>
                <p style={{ ...styles.modalText, color: expenseGoldDark, fontWeight: 700 }}>
                  Only item classification fields can be updated here.
                </p>
              </div>

              {false && (
              <button
                type="button"
                onClick={closeEditModal}
                style={styles.closeBtn}
              >
                ×
              </button>
              )}
            </div>

            {renderEditModalFields()}

            <div
              style={{
                ...styles.editModalActions,
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <button
                type="button"
                onClick={openItemHistoryModal}
                style={{
                  ...styles.stockSummaryBtn,
                  minHeight: 40,
                  border: 'none',
                  boxShadow: 'none',
                }}
              >
                View History
              </button>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 12,
                  flexDirection: isMobile ? 'column' : 'row',
                }}
              >
                <button
                  type="button"
                  onClick={handleCancelEditModal}
                  style={styles.cancelEditBtn}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveEdit}
                  style={styles.saveBtn}
                  disabled={editSaving}
                >
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isReceptionist && showItemHistory && (
        <div style={styles.modal} onClick={(event) => { if (event.target === event.currentTarget) requestCloseItemHistoryModal(); }}>
          {renderItemHistoryModal()}
        </div>
      )}

      {!isReceptionist && showItemHistoryCloseConfirm && (
        <div style={styles.modal} onClick={(event) => { if (event.target === event.currentTarget) closeItemHistoryCloseConfirmModal(); }}>
          <div style={styles.modalContent}>
            <div style={{ ...styles.modalIcon, background: expenseGoldSoft, color: expenseGoldDark }}>
              <i className="fi fi-rr-cross-small" style={styles.modalIconText}></i>
            </div>

            <h2 style={{ ...styles.modalTitle, color: '#3f2f08' }}>Close History</h2>
            <p style={styles.modalText}>
              Do you want to close {getInventoryItemName(selectedInventoryItem)} history?
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={closeItemHistoryCloseConfirmModal}
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={closeItemHistoryModal}
                style={{ ...styles.modalButton, ...styles.saveBtn }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {!isReceptionist && showEditConfirmModal && (
        <div style={styles.modal} onClick={(event) => { if (event.target === event.currentTarget) closeEditConfirmModal(); }}>
          <div style={styles.modalContent}>
            <div style={{ ...styles.modalIcon, background: expenseGoldSoft, color: expenseGoldDark }}>
              <i className="fi fi-rr-edit" style={styles.modalIconText}></i>
            </div>

            <h2 style={{ ...styles.modalTitle, color: '#3f2f08' }}>Save Changes</h2>
            <p style={styles.modalText}>
              Do you want to save the following changes?
            </p>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18, fontFamily: 'Arial, sans-serif' }}>
              {getEditChangeSummary().map((change) => (
                <div
                  key={change.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '7px 0',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: 13,
                    textAlign: 'left',
                  }}
                >
                  <span style={{ color: '#64748b' }}>
                    {change.label}
                    <small style={{ display: 'block', color: '#94a3b8', marginTop: 2 }}>
                      {change.before === 'N/A' ? 'Added' : 'Changed'}
                    </small>
                  </span>
                  <strong style={{ color: '#0f172a', textAlign: 'right', maxWidth: 260, overflowWrap: 'anywhere' }}>
                    {change.after}
                  </strong>
                </div>
              ))}
            </div>

            {editError && (
              <p style={{ ...styles.modalText, color: '#dc2626' }}>{editError}</p>
            )}

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                disabled={editSaving}
                onClick={closeEditConfirmModal}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.saveBtn }}
                disabled={editSaving}
                onClick={handleConfirmSaveEdit}
              >
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!isReceptionist && showEditCancelConfirmModal && (
        <div style={styles.modal} onClick={(event) => { if (event.target === event.currentTarget) closeEditCancelConfirmModal(); }}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Cancel Edit</h2>
            <p style={styles.modalText}>
              Are you sure you want to cancel? The details you changed will not be saved.
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={closeEditCancelConfirmModal}
              >
                No
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={confirmCancelEditModal}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {!isReceptionist && showExpenseModal && (
        <div style={styles.modal} onClick={(e) => { if (e.target === e.currentTarget) handleCancelExpenseModal(); }}>
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 14, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', padding: '26px 28px 24px', boxShadow: '0 22px 50px rgba(15, 23, 42, 0.25)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 4 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: isMobile ? 22 : 26, fontWeight: 800, color: '#172033', fontFamily: 'Arial, sans-serif', letterSpacing: '.3px' }}>Expense Input</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: expenseGoldDark, fontFamily: 'Arial, sans-serif', fontWeight: 700 }}>Inventory purchase expense</p>
              </div>
            </div>

            <label style={styles.formGroup}>
              {renderRequiredLabel('Date')}
              <input
                type="date"
                value={expenseForm.date}
                onChange={(e) => handleExpenseChange('date', e.target.value)}
                onBlur={() => handleExpenseFieldBlur('date')}
                style={getExpenseFieldStyle('date')}
              />
              {renderExpenseFieldError('date')}
            </label>

            <label style={styles.formGroup}>
              {renderRequiredLabel('Branch')}
              <select
                value={expenseForm.branchId}
                onFocus={refreshExpenseFormOptions}
                onChange={(e) => handleExpenseChange('branchId', e.target.value)}
                onBlur={() => handleExpenseFieldBlur('branchId')}
                style={getExpenseFieldStyle('branchId')}
              >
                <option value="">Select branch</option>
                {expenseBranchOptions.map((b) => (
                  <option key={b.id} value={b.id}>{getExpenseBranchLabel(b)}</option>
                ))}
              </select>
              {renderExpenseFieldError('branchId')}
            </label>

            <label style={styles.formGroup}>
              {renderRequiredLabel('Category')}
              <select
                value={expenseForm.category}
                onChange={(e) => handleExpenseChange('category', e.target.value)}
                onBlur={() => handleExpenseFieldBlur('category')}
                style={getExpenseFieldStyle('category')}
              >
                <option value="">Select Category</option>
                <option value="medicine">Dental Medicine</option>
                <option value="equipment">Dental Equipment</option>
                <option value="supplies">Dental Supplies</option>
              </select>
              {renderExpenseFieldError('category')}
            </label>

            <label style={styles.formGroup}>
              {renderRequiredLabel('Item Name')}
              <input
                type="text"
                list="inv-expense-item-options"
                value={expenseForm.itemName}
                onChange={(e) => handleExpenseChange('itemName', e.target.value)}
                onBlur={() => handleExpenseFieldBlur('itemName')}
                placeholder={!expenseForm.branchId ? 'Select Branch First' : !expenseForm.category ? 'Select Category First' : expenseItemOptionsList.length ? 'Select or enter item name' : 'Enter item name'}
                style={getExpenseFieldStyle('itemName')}
              />
              <datalist id="inv-expense-item-options">
                {expenseItemOptionsList.map((name) => <option key={name} value={name} />)}
              </datalist>
              {renderExpenseFieldError('itemName')}
            </label>

            <label style={styles.formGroup}>
              {renderRequiredLabel('Supplier')}
              <input
                type="text"
                list="inv-expense-supplier-options"
                value={expenseForm.supplier}
                onChange={(e) => handleExpenseChange('supplier', e.target.value)}
                onBlur={() => handleExpenseFieldBlur('supplier')}
                placeholder="Enter Supplier"
                style={getExpenseFieldStyle('supplier')}
              />
              <datalist id="inv-expense-supplier-options">
                {expenseSupplierOptions.map((s) => <option key={s} value={s} />)}
              </datalist>
              {renderExpenseFieldError('supplier')}
            </label>

            <label style={styles.formGroup}>
              {renderRequiredLabel('Order Quantity')}
              <input
                type="number"
                min="1"
                value={expenseForm.orderQuantity}
                placeholder="Enter Quantity"
                onChange={(e) => handleExpenseChange('orderQuantity', e.target.value === '' ? '' : Number(e.target.value))}
                onBlur={() => handleExpenseFieldBlur('orderQuantity')}
                style={getExpenseFieldStyle('orderQuantity')}
              />
              {renderExpenseFieldError('orderQuantity')}
            </label>

            <label style={styles.formGroup}>
              {renderRequiredLabel('Price per Item')}
              <input
                type="number"
                min="0"
                value={expenseForm.pricePerItem}
                placeholder="Enter Price Per Item"
                onChange={(e) => handleExpenseChange('pricePerItem', e.target.value === '' ? '' : Number(e.target.value))}
                onBlur={() => handleExpenseFieldBlur('pricePerItem')}
                style={getExpenseFieldStyle('pricePerItem')}
              />
              {renderExpenseFieldError('pricePerItem')}
            </label>

            <label style={styles.formGroup}>
              {renderRequiredLabel('Critical Stock Level')}
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={expenseForm.threshold}
                placeholder={!expenseForm.itemName ? 'Select item first' : ''}
                onChange={(e) => handleExpenseChange('threshold', e.target.value)}
                onBlur={() => handleExpenseFieldBlur('threshold')}
                style={getExpenseFieldStyle('threshold')}
              />
              {renderExpenseFieldError('threshold')}
            </label>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 14px', fontFamily: 'Arial, sans-serif' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontWeight: 800 }}>Total Expense</p>
              <h4 style={{ margin: '4px 0 0', fontSize: 15, color: '#0f172a', fontWeight: 800 }}>
                {expenseForm.orderQuantity || 0} × {formatPeso(expenseForm.pricePerItem || 0)} = {formatPeso(computedExpense)}
              </h4>
            </div>

            {expenseSaveError && (
              <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#b91c1c', fontFamily: 'Arial, sans-serif', lineHeight: 1.45 }}>{expenseSaveError}</p>
            )}

            {expenseStockLimitError && (
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  border: '1px solid #fecaca',
                  borderRadius: 10,
                  background: '#fff1f2',
                  padding: '14px 16px',
                  fontFamily: 'Arial, sans-serif',
                }}
              >
                <i
                  className="fi fi-rr-triangle-warning"
                  style={{
                    color: '#ef4444',
                    fontSize: 24,
                    lineHeight: 1,
                    marginTop: 2,
                    flexShrink: 0,
                  }}
                ></i>

                <div style={{ minWidth: 0 }}>
                  <h4
                    style={{
                      margin: '0 0 4px',
                      color: '#dc2626',
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    Cannot save order
                  </h4>

                  <p
                    style={{
                      margin: 0,
                      color: '#334155',
                      fontSize: 13,
                      lineHeight: 1.35,
                    }}
                  >
                    The order quantity ({expenseStockLimitError.orderQuantity}) exceeds the maximum stock level ({expenseStockLimitError.maximumStock}). Please enter a quantity within the available stock limit.
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      gap: 18,
                      flexWrap: 'wrap',
                      marginTop: 8,
                      color: '#dc2626',
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    <span>Current stock: {expenseStockLimitError.currentQuantity}</span>
                    <span>Maximum allowed: {expenseStockLimitError.maximumStock}</span>
                  </div>
                </div>
              </div>
            )}

            <div style={styles.editModalActions}>
              <button type="button" style={styles.cancelEditBtn} onClick={handleCancelExpenseModal}>
                Cancel
              </button>
              <button
                type="button"
                style={{
                  ...styles.saveBtn,
                  transform: saveExpenseClicked ? 'scale(0.97)' : 'scale(1)',
                  opacity: saveExpenseClicked ? 0.82 : 1,
                  transition: 'transform 120ms ease, opacity 120ms ease',
                  cursor: 'pointer',
                }}
                onClick={handleSaveExpense}
              >
                Save Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {!isReceptionist && showExpenseConfirmModal && (
        <div style={styles.modal} onClick={(e) => { if (e.target === e.currentTarget) closeExpenseConfirmModal(); }}>
          <div style={{ ...styles.modalContent, boxShadow: '0 22px 50px rgba(15, 23, 42, 0.25)' }}>
            <div style={{ ...styles.modalIcon, background: expenseGoldSoft, color: expenseGoldDark }}>
              <i className="fi fi-rr-receipt" style={styles.modalIconText}></i>
            </div>
            <h2 style={{ ...styles.modalTitle, color: '#3f2f08' }}>Confirm Expense</h2>
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
                ['Critical Stock Level', expenseForm.threshold === '' ? 'Not set' : String(expenseForm.threshold)],
                ['Maximum Stock', expenseForm.maxStock === '' ? 'Not set' : String(expenseForm.maxStock)],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${expenseGoldBorder}`, fontSize: 13, gap: 12 }}>
                  <span style={{ color: '#000000', fontWeight: 400 }}>{label}</span>
                  <span style={{ color: '#000000', fontWeight: 400, textAlign: 'right' }}>{val}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, gap: 12 }}>
                <span style={{ color: '#000000', fontWeight: 400 }}>Total Expense</span>
                <strong style={{ color: expenseGoldDark, fontSize: 15 }}>{formatPeso(computedExpense)}</strong>
              </div>
            </div>
            {expenseSaveError && (
              <p style={{ ...styles.modalText, color: '#dc2626' }}>{expenseSaveError}</p>
            )}
            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                disabled={expenseSaving}
                onClick={closeExpenseConfirmModal}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.saveBtn }}
                disabled={expenseSaving}
                onClick={handleConfirmExpenseSave}
              >
                {expenseSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!isReceptionist && showExpenseSuccessModal && (
        <div style={styles.modal}>
          <div style={{ ...styles.modalContent, boxShadow: '0 22px 50px rgba(15, 23, 42, 0.25)' }}>
            <div style={{ ...styles.modalIcon, background: expenseGoldSoft, color: expenseGoldDark }}>
              <i className="fi fi-rr-check" style={styles.modalIconText}></i>
            </div>
            <h2 style={{ ...styles.modalTitle, color: '#3f2f08' }}>Expense saved successfully</h2>
            <p style={{ ...styles.modalText, marginBottom: 0, color: expenseGoldDark }}>
              The expense input has been saved.
            </p>
          </div>
        </div>
      )}

      {!isReceptionist && showExpenseCancelConfirmModal && (
        <div style={styles.modal} onClick={(e) => { if (e.target === e.currentTarget) closeExpenseCancelConfirmModal(); }}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Cancel Expense Input</h2>
            <p style={styles.modalText}>
              Are you sure you want to cancel? Any unsaved expense details will be discarded.
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={closeExpenseCancelConfirmModal}
              >
                No
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={confirmCancelExpenseModal}
              >
                Yes, Cancel
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
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={closeLogoutModal}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.logoutBtn }}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
