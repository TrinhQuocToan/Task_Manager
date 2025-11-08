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

// Get date key in YYYY-MM-DD format for grouping
export function getDateKey(dateString) {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
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

// Check if task is overdue
export function isTaskOverdue(task) {
  // Completed or Cancelled tasks are not considered overdue
  if (task.status === 'Completed' || task.status === 'Cancelled') {
    return false;
  }
  
  if (!task.dueDate) {
    return false;
  }
  
  const now = new Date();
  const dueDate = new Date(task.dueDate);
  return dueDate < now;
}

// Format time difference to human readable string
export function formatTimeDifference(milliseconds) {
  if (milliseconds <= 0) return '';
  
  const minutes = Math.floor(milliseconds / (1000 * 60));
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  
  // Don't show anything if less than 1 minute (consider as on-time)
  if (minutes === 0) return '';
  
  if (minutes < 60) {
    // Less than 1 hour
    if (minutes === 1) return '1 minute';
    return `${minutes} minutes`;
  } else if (hours < 24) {
    // Less than 1 day
    const remainingMinutes = minutes % 60;
    if (hours === 1 && remainingMinutes === 0) return '1 hour';
    if (hours === 1) return `1 hour ${remainingMinutes} minutes`;
    if (remainingMinutes === 0) return `${hours} hours`;
    return `${hours} hours ${remainingMinutes} minutes`;
  } else {
    // 1 day or more
    const remainingHours = hours % 24;
    if (days === 1 && remainingHours === 0) return '1 day';
    if (days === 1) return `1 day ${remainingHours} hours`;
    if (remainingHours === 0) return `${days} days`;
    return `${days} days ${remainingHours} hours`;
  }
}

// Get overdue days count (kept for backward compatibility)
export function getOverdueDays(dueDate) {
  if (!dueDate) return 0;
  
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = now - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
}

// Get overdue badge text with detailed time
export function getOverdueBadgeText(task) {
  if (!task.dueDate) return '';
  
  const now = new Date();
  const due = new Date(task.dueDate);
  const diffTime = now - due;
  
  if (diffTime <= 0) return '';
  
  const timeText = formatTimeDifference(diffTime);
  return timeText ? `Overdue ${timeText}` : '';
}

// Check if task was completed late
export function wasCompletedLate(task) {
  if (task.status !== 'Completed') {
    return false;
  }
  
  if (!task.dueDate || !task.updatedAt) {
    return false;
  }
  
  const dueDate = new Date(task.dueDate);
  const completedDate = new Date(task.updatedAt);
  
  // Consider late if completed any time after deadline
  return completedDate > dueDate;
}

// Get days completed late (kept for backward compatibility)
export function getDaysCompletedLate(task) {
  if (!wasCompletedLate(task)) {
    return 0;
  }
  
  const dueDate = new Date(task.dueDate);
  const completedDate = new Date(task.updatedAt);
  const diffTime = completedDate - dueDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
}

// Get completed late badge text with detailed time
export function getCompletedLateBadgeText(task) {
  if (!wasCompletedLate(task)) {
    return '';
  }
  
  const dueDate = new Date(task.dueDate);
  const completedDate = new Date(task.updatedAt);
  const diffTime = completedDate - dueDate;
  
  if (diffTime <= 0) return '';
  
  const timeText = formatTimeDifference(diffTime);
  return timeText ? `Completed ${timeText} late` : '';
}

// Calculate completion delay message (for status change) with detailed time
export function getCompletionDelayMessage(dueDate) {
  if (!dueDate) return '';
  
  const due = new Date(dueDate);
  const now = new Date();
  
  if (now <= due) {
    return 'Task completed on time!';
  }
  
  const diffTime = now - due;
  const timeText = formatTimeDifference(diffTime);
  
  return timeText ? `Task completed ${timeText} late.` : 'Task completed late.';
}