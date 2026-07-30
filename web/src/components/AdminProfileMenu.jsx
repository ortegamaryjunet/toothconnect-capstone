import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../api/axios';

const ADMIN_PROFILE_PHOTO_STORAGE_KEY = 'toothconnect_admin_profile_photo_url';
const ADMIN_PROFILE_PHOTO_EVENT = 'admin-profile-photo-updated';

export default function AdminProfileMenu({ styles, adminName = 'Admin', profilePhotoUrl = '' }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [photoVersion, setPhotoVersion] = useState(Date.now());
  const [loadedPhotoUrl, setLoadedPhotoUrl] = useState(() =>
    profilePhotoUrl || localStorage.getItem(ADMIN_PROFILE_PHOTO_STORAGE_KEY) || ''
  );
  const profileMenuRef = useRef(null);

  useEffect(() => {
    if (profilePhotoUrl) {
      localStorage.setItem(ADMIN_PROFILE_PHOTO_STORAGE_KEY, profilePhotoUrl);
      setLoadedPhotoUrl(profilePhotoUrl);
      setPhotoVersion(Date.now());
      return;
    }

    const cachedPhotoUrl = localStorage.getItem(ADMIN_PROFILE_PHOTO_STORAGE_KEY) || '';
    setLoadedPhotoUrl(cachedPhotoUrl);
  }, [profilePhotoUrl]);

  useEffect(() => {
    if (profilePhotoUrl) return;
    let cancelled = false;
    api.get('/auth/me')
      .then((res) => {
        if (cancelled) return;
        const nextPhotoUrl = profileFileUrl(res.data.profile_photo_url);
        if (nextPhotoUrl) {
          localStorage.setItem(ADMIN_PROFILE_PHOTO_STORAGE_KEY, nextPhotoUrl);
        } else {
          localStorage.removeItem(ADMIN_PROFILE_PHOTO_STORAGE_KEY);
        }
        setLoadedPhotoUrl(nextPhotoUrl);
        setPhotoVersion(Date.now());
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [profilePhotoUrl]);

  useEffect(() => {
    function handlePhotoUpdate(event) {
      const nextPhotoUrl = event.detail?.profilePhotoUrl || '';
      if (nextPhotoUrl) {
        localStorage.setItem(ADMIN_PROFILE_PHOTO_STORAGE_KEY, nextPhotoUrl);
      } else {
        localStorage.removeItem(ADMIN_PROFILE_PHOTO_STORAGE_KEY);
      }
      setLoadedPhotoUrl(nextPhotoUrl);
      setPhotoVersion(Date.now());
    }

    window.addEventListener(ADMIN_PROFILE_PHOTO_EVENT, handlePhotoUpdate);
    return () => {
      window.removeEventListener(ADMIN_PROFILE_PHOTO_EVENT, handlePhotoUpdate);
    };
  }, []);

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
        <div style={{ ...styles.avatar, overflow: 'hidden' }}>
          {loadedPhotoUrl ? (
            <img
              src={withCacheBust(loadedPhotoUrl, photoVersion)}
              alt=""
              style={styles.avatarSmallImg || {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <i className="fi fi-rr-user" style={styles.avatarIcon}></i>
          )}
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

function profileFileUrl(fileUrl) {
  if (!fileUrl) return '';
  if (/^(https?:|blob:|data:)/i.test(fileUrl)) return fileUrl;
  const baseUrl = String(api.defaults.baseURL || '').replace(/\/api\/?$/, '');
  return `${baseUrl}${fileUrl}`;
}

function withCacheBust(url, version) {
  if (!url || /^(blob:|data:)/i.test(url)) return url;
  return `${url}${url.includes('?') ? '&' : '?'}v=${version}`;
}
