import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminProfileMenu({ styles, adminName = 'Admin' }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    function handleDocumentClick(event) {
      if (!profileMenuRef.current?.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const wrapperStyle = {
    position: 'relative',
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  };
  const dropdownStyle = {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: '100%',
    minWidth: 170,
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 14,
    padding: 8,
    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
    zIndex: 300,
    boxSizing: 'border-box',
  };
  const viewProfileButtonStyle = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: '#d4af37',
    color: '#ffffff',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 14,
    fontWeight: 700,
    fontFamily: 'Arial, sans-serif',
    textDecoration: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
    boxShadow: '0 10px 22px rgba(139, 101, 8, 0.18)',
  };

  return (
    <div style={wrapperStyle} ref={profileMenuRef}>
      <button
        type="button"
        style={{
          ...styles.adminProfile,
          border: styles.adminProfile?.border || '1px solid #e5e7eb',
        }}
        onClick={() => setShowProfileMenu((current) => !current)}
      >
        <div style={styles.avatar}>
          <i className="fi fi-rr-user" style={styles.avatarIcon}></i>
        </div>

        <div style={styles.adminInfo}>
          <div style={styles.adminName}>{adminName}</div>
          <div style={styles.adminPosition}>Admin</div>
        </div>
      </button>

      {showProfileMenu && (
        <div style={dropdownStyle}>
          <Link
            to="/adminSettings?section=adminAccount"
            style={viewProfileButtonStyle}
            onClick={() => setShowProfileMenu(false)}
          >
            View Profile
          </Link>
        </div>
      )}
    </div>
  );
}
