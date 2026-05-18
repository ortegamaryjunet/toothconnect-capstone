import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '../auth/AuthContext';
import {
  listEquipment,
  listMedicines,
  listSupplies,
  updateEquipment,
  updateMedicine,
  updateSupply,
} from '../api/inventory';
import { getUnreadNotificationCount } from '../api/notifications';
import createInventoryPageStyles from '../styles/InventoryPage';

import clinicLogo from '../assets/adminImages/clinic-logo.png';

function formatDateOnly(value) {
  if (!value) return 'N/A';
  return String(value).slice(0, 10);
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

export default function InventoryPage() {
  const { user } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockSummaryModal, setShowStockSummaryModal] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [editForm, setEditForm] = useState({
    genericName: '',
    brand: '',
    category: '',
    form: '',
    dosage: '',
    unit: '',
    maintenanceStatus: '',
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState('');

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [activeTab, setActiveTab] = useState('medicine');
  const [searchValue, setSearchValue] = useState('');
  const [selectedStockCategory, setSelectedStockCategory] = useState('medicine');

  const [currentPages, setCurrentPages] = useState({
    medicine: 1,
    equipment: 1,
    supplies: 1,
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
  });

  const receptionistHeaderStyle = isReceptionist
    ? { ...styles.adminProfile, textDecoration: 'none' }
    : styles.adminProfile;

  const sidebarMenus = {
    ADMIN: [
      { label: 'Dashboard', path: '/admin', icon: 'fi fi-rr-apps' },
      {
        label: 'Patient Records',
        path: '/adminPatients',
        icon: 'fi fi-rr-clipboard-user',
      },
      {
        label: 'Clinic Employee',
        path: '/adminEmployees',
        icon: 'fi fi-rr-stethoscope',
      },
      { label: 'Inventory', path: '/adminInventory', icon: 'fi fi-rr-boxes' },
      {
        label: 'Audit Logs',
        path: '/adminLogs',
        icon: 'fi fi-rr-clipboard-list',
      },
      {
        label: 'Notifications',
        path: '/adminNotif',
        icon: 'fi fi-rr-bell',
        badge: notificationCount,
      },
      {
        label: 'Reports',
        path: '/adminReports',
        icon: 'fi fi-rr-chart-line-up',
      },
      { label: 'Settings', path: '/adminSettings', icon: 'fi fi-rr-settings' },
    ],

    RECEPTIONIST: [
      { label: 'Dashboard', path: '/receptionist', icon: 'fi fi-rr-apps' },
      {
        label: 'Appointments',
        path: '/receptionistAppointments',
        icon: 'fi fi-rr-calendar-clock',
      },
      {
        label: 'Patient Records',
        path: '/receptionistRecords',
        icon: 'fi fi-rr-clipboard-user',
      },
      {
        label: 'Receipt Verification',
        path: '/receptionistReceipts',
        icon: 'fi fi-rr-file-invoice-dollar',
      },
      {
        label: 'Patient Account',
        path: '/receptionistPatientAcc',
        icon: 'fi fi-rr-id-badge',
      },
      {
        label: 'Inventory',
        path: '/receptionistInventory',
        icon: 'fi fi-rr-boxes',
      },
      {
        label: 'Messages',
        path: '/receptionistMessage',
        icon: 'fi fi-rr-comment-alt',
      },
      {
        label: 'Notifications',
        path: '/receptionistNotif',
        icon: 'fi fi-rr-bell',
        badge: notificationCount,
      },
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

  const activeRows = inventoryMap[activeTab].rows;

  const filteredRows = useMemo(() => {
    const search = searchValue.toLowerCase().trim();

    return activeRows.filter((item) => {
      const rowText = Object.values(item).join(' ').toLowerCase();
      const matchesSearch = rowText.includes(search);
      return matchesSearch;
    });
  }, [activeRows, searchValue]);

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
    if (showLogoutModal || showEditModal || showStockSummaryModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showLogoutModal, showEditModal, showStockSummaryModal]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeLogoutModal();
        closeEditModal();
        closeStockSummaryModal();
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
    }));
  }, [searchValue]); // tab changes reset page via handleTabChange; highlight sets page directly

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
    const payload =
      type === 'medicine'
        ? {
            generic_name: editForm.genericName,
            category: editForm.category,
            form: editForm.form,
            dosage: editForm.dosage,
            unit: editForm.unit,
          }
        : type === 'supplies'
        ? {
            brand: editForm.brand,
            category: editForm.category,
            unit: editForm.unit,
          }
        : {
            category: editForm.category,
            maintenance_status: editForm.maintenanceStatus,
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
          expense input and stock activity.
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
            <div style={styles.searchBox}>
              <i className="fi fi-rr-search" style={styles.searchIcon}></i>

              <input
                type="text"
                placeholder="Search inventory item"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                style={styles.searchInput}
              />
            </div>

          </section>

          <section style={styles.tableCard}>
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

              <button
                type="button"
                style={styles.stockSummaryBtn}
                onClick={openStockSummaryModal}
              >
                View Stock Summary
              </button>
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
              <div style={{ ...styles.stockMetricCard, ...styles.stockMetricBlue }}>
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

              <div style={{ ...styles.stockMetricCard, ...styles.stockMetricOrange }}>
                <span style={styles.stockMetricLabel}>Low Stock</span>
                <strong style={{ ...styles.stockMetricValue, color: '#f97316' }}>
                  {stockSummary.lowStock}
                </strong>
              </div>

              <div style={{ ...styles.stockMetricCard, ...styles.stockMetricRed }}>
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
                  {stockSummaryDetailRows.length === 0 ? (
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
                    stockSummaryDetailRows.map((item) => (
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
                            {item.status}
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
