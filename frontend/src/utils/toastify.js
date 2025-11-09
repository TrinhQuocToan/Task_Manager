// Export the global Toastify library loaded from CDN
// Toastify is loaded in index.html via script tag

export const Toastify = window.Toastify;

// Helper function to show toast messages
export function showToast(message, type = 'info') {
  if (typeof window.Toastify !== 'undefined') {
    const backgroundColor = {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8'
    }[type] || '#17a2b8';

    window.Toastify({
      text: message,
      duration: 3000,
      gravity: 'top',
      position: 'right',
      backgroundColor: backgroundColor,
      stopOnFocus: true
    }).showToast();
  } else {
    console.warn('Toastify is not loaded');
    alert(message);
  }
}
