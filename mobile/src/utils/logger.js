const logger = {
  info(area, message, extra) {
    if (!__DEV__) return;
    extra !== undefined
      ? console.log(`[INFO][${area}]`, message, extra)
      : console.log(`[INFO][${area}]`, message);
  },

  warn(area, message, extra) {
    if (!__DEV__) return;
    extra !== undefined
      ? console.warn(`[WARN][${area}]`, message, extra)
      : console.warn(`[WARN][${area}]`, message);
  },

  // Errors always log — even in the production APK
  error(area, message, extra) {
    extra !== undefined
      ? console.error(`[ERROR][${area}]`, message, extra)
      : console.error(`[ERROR][${area}]`, message);
  },
};

export default logger;
