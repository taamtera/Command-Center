// Utility functions for logging
function logInfo(message) {
  // Production: could integrate with external logging service
  console.info(message);
}
function logError(message) {
  // Production: could integrate with external logging service
  console.error(message);
}
module.exports = { logInfo, logError };
