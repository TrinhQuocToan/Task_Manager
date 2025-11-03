// Format currency (not used in Task Manager but kept for compatibility)
export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

// Format date
export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Format date only (without time)
export function formatDateOnly(dateString) {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

// Calculate percentage
export function calculatePercentage(part, total) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

// Get status badge class
export function getStatusBadgeClass(status) {
  const statusMap = {
    'Not Started': 'bg-secondary',
    'In Progress': 'bg-info',
    'Completed': 'bg-success',
    'Cancelled': 'bg-danger'
  };
  return statusMap[status] || 'bg-secondary';
}

// Get priority badge class
export function getPriorityBadgeClass(priority) {
  const priorityMap = {
    'Low': 'bg-secondary',
    'Medium': 'bg-warning',
    'High': 'bg-danger'
  };
  return priorityMap[priority] || 'bg-secondary';
}

// Get status icon
export function getStatusIcon(status) {
  const iconMap = {
    'Not Started': 'fa-circle',
    'In Progress': 'fa-spinner',
    'Completed': 'fa-check-circle',
    'Cancelled': 'fa-times-circle'
  };
  return iconMap[status] || 'fa-circle';
}
