/**
 * Parses request headers into a human-readable Device / Browser string.
 *
 * Web examples:  "Chrome / Windows", "Safari / macOS", "Firefox / Linux"
 * Mobile:        "ToothConnect App / Android", "ToothConnect App / iOS"
 * Unknown:       "Unknown"
 *
 * @param {string|undefined} userAgent  - req.headers['user-agent']
 * @param {string}           platform   - 'web' | 'mobile' (from req.body.platform)
 * @param {string|undefined} appOs      - req.headers['x-app-os']  e.g. "Android" | "iOS"
 * @returns {string}
 */
function parseDeviceBrowser(userAgent, platform, appOs) {
  // Mobile app requests are identified by platform='mobile' OR the X-App-OS header.
  if (platform === 'mobile' || appOs) {
    const os = appOs || 'Mobile';
    return `ToothConnect App / ${os}`;
  }

  if (!userAgent) return 'Unknown';

  // Detect browser — order matters (Edge/OPR must come before Chrome/Opera).
  let browser = 'Unknown';
  if (/Edg\/|EdgA\/|Edge\//.test(userAgent))      browser = 'Edge';
  else if (/OPR\/|Opera\//.test(userAgent))         browser = 'Opera';
  else if (/Firefox\//.test(userAgent))             browser = 'Firefox';
  else if (/Chrome\//.test(userAgent))              browser = 'Chrome';
  else if (/Safari\//.test(userAgent))              browser = 'Safari';

  // Detect OS.
  let os = 'Unknown';
  if (/Windows/.test(userAgent))                    os = 'Windows';
  else if (/Macintosh|Mac OS X/.test(userAgent))    os = 'macOS';
  else if (/Android/.test(userAgent))               os = 'Android';
  else if (/iPhone|iPad/.test(userAgent))           os = 'iOS';
  else if (/Linux/.test(userAgent))                 os = 'Linux';

  return `${browser} / ${os}`;
}

module.exports = { parseDeviceBrowser };
