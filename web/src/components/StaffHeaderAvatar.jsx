import { useEffect, useState } from 'react';

import api from '../api/axios';

const RECEPTIONIST_PROFILE_PHOTO_STORAGE_KEY = 'toothconnect_receptionist_profile_photo_url';
const RECEPTIONIST_PROFILE_PHOTO_EVENT = 'receptionist-profile-photo-updated';

export default function StaffHeaderAvatar({ styles }) {
  const [photoUrl, setPhotoUrl] = useState(() =>
    localStorage.getItem(RECEPTIONIST_PROFILE_PHOTO_STORAGE_KEY) || ''
  );
  const [photoVersion, setPhotoVersion] = useState(Date.now());

  useEffect(() => {
    let cancelled = false;

    api.get('/auth/staff-profile/me')
      .then((res) => {
        if (cancelled) return;
        const nextPhotoUrl = profileFileUrl(res.data.profile?.profilePhotoUrl);
        if (nextPhotoUrl) {
          localStorage.setItem(RECEPTIONIST_PROFILE_PHOTO_STORAGE_KEY, nextPhotoUrl);
        } else {
          localStorage.removeItem(RECEPTIONIST_PROFILE_PHOTO_STORAGE_KEY);
        }
        setPhotoUrl(nextPhotoUrl);
        setPhotoVersion(Date.now());
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handlePhotoUpdate(event) {
      const nextPhotoUrl = event.detail?.profilePhotoUrl || '';
      if (nextPhotoUrl) {
        localStorage.setItem(RECEPTIONIST_PROFILE_PHOTO_STORAGE_KEY, nextPhotoUrl);
      } else {
        localStorage.removeItem(RECEPTIONIST_PROFILE_PHOTO_STORAGE_KEY);
      }
      setPhotoUrl(nextPhotoUrl);
      setPhotoVersion(Date.now());
    }

    window.addEventListener(RECEPTIONIST_PROFILE_PHOTO_EVENT, handlePhotoUpdate);
    return () => {
      window.removeEventListener(RECEPTIONIST_PROFILE_PHOTO_EVENT, handlePhotoUpdate);
    };
  }, []);

  const avatarStyle = {
    ...styles.avatar,
    overflow: 'hidden',
  };

  const imageStyle = styles.avatarSmallImg || {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  };

  return (
    <div style={avatarStyle}>
      {photoUrl ? (
        <img src={withCacheBust(photoUrl, photoVersion)} alt="" style={imageStyle} />
      ) : (
        <i className="fi fi-rr-user" style={styles.avatarIcon}></i>
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
