import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../api/axios';

const DENTIST_PROFILE_PHOTO_STORAGE_KEY = 'toothconnect_dentist_profile_photo_url';
const DENTIST_PROFILE_PHOTO_EVENT = 'dentist-profile-photo-updated';

export default function DentistProfileMenu({
  styles,
  dentistName = 'Dentist',
  specialization = 'Dentist',
  profilePhotoUrl = '',
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loadedPhotoUrl, setLoadedPhotoUrl] = useState(() =>
    profilePhotoUrl || localStorage.getItem(DENTIST_PROFILE_PHOTO_STORAGE_KEY) || ''
  );
  const [photoVersion, setPhotoVersion] = useState(Date.now());
  const profileMenuRef = useRef(null);

  useEffect(() => {
    if (profilePhotoUrl) {
      localStorage.setItem(DENTIST_PROFILE_PHOTO_STORAGE_KEY, profilePhotoUrl);
      setLoadedPhotoUrl(profilePhotoUrl);
      setPhotoVersion(Date.now());
      return;
    }

    setLoadedPhotoUrl(localStorage.getItem(DENTIST_PROFILE_PHOTO_STORAGE_KEY) || '');
  }, [profilePhotoUrl]);

  useEffect(() => {
    if (profilePhotoUrl) return;
    let cancelled = false;

    api.get('/auth/staff-profile/me')
      .then((res) => {
        if (cancelled) return;
        const nextPhotoUrl = profileFileUrl(res.data.profile?.profilePhotoUrl);
        if (nextPhotoUrl) {
          localStorage.setItem(DENTIST_PROFILE_PHOTO_STORAGE_KEY, nextPhotoUrl);
        } else {
          localStorage.removeItem(DENTIST_PROFILE_PHOTO_STORAGE_KEY);
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
        localStorage.setItem(DENTIST_PROFILE_PHOTO_STORAGE_KEY, nextPhotoUrl);
      } else {
        localStorage.removeItem(DENTIST_PROFILE_PHOTO_STORAGE_KEY);
      }
      setLoadedPhotoUrl(nextPhotoUrl);
      setPhotoVersion(Date.now());
    }

    window.addEventListener(DENTIST_PROFILE_PHOTO_EVENT, handlePhotoUpdate);
    return () => {
      window.removeEventListener(DENTIST_PROFILE_PHOTO_EVENT, handlePhotoUpdate);
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

  const triggerStyle = {
    ...styles.doctorProfile,
    border: styles.doctorProfile?.border || '1px solid #e5e7eb',
    cursor: 'pointer',
    fontFamily: styles.doctorName?.fontFamily || 'Arial, sans-serif',
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
    fontFamily: styles.doctorName?.fontFamily || 'Arial, sans-serif',
    textDecoration: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
    boxShadow: '0 10px 22px rgba(139, 101, 8, 0.18)',
  };

  return (
    <div style={wrapperStyle} ref={profileMenuRef}>
      <button
        type="button"
        style={triggerStyle}
        onClick={() => setShowProfileMenu((current) => !current)}
      >
        <div style={{ ...(styles.avatarSmall || styles.avatar), overflow: 'hidden' }}>
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

        <div style={styles.doctorInfo}>
          <div style={styles.doctorName}>{dentistName}</div>
          <div style={styles.doctorSpecialization}>{specialization}</div>
        </div>
      </button>

      {showProfileMenu && (
        <div style={dropdownStyle}>
          <Link
            to="/dentistProfile"
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
