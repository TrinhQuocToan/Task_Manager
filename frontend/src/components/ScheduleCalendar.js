import { formatDateOnly, getStatusBadgeClass, getPriorityBadgeClass, getStatusIcon } from '../utils/format.js';

export function renderScheduleCalendar(tasks) {
  if (!tasks || tasks.length === 0) {
    return `
      <div class="text-center py-4">
        <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
        <p class="text-muted">No tasks this week</p>
      </div>
    `;
  }

  // Group tasks by date
  const tasksByDate = groupTasksByDate(tasks);
  
  // Get dates for current week
  const weekDates = getWeekDates(new Date());
  
  return `
    <div class="schedule-calendar">
      <div class="calendar-header mb-3">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="fas fa-calendar-alt me-2"></i>This week's schedule
          </h5>
          <div class="calendar-nav">
            <button class="btn btn-sm btn-outline-secondary" onclick="navigateWeek(-1)">
              <i class="fas fa-chevron-left"></i>
            </button>
            <span class="mx-2">Week ${getWeekNumber(new Date())}</span>
            <button class="btn btn-sm btn-outline-secondary" onclick="navigateWeek(1)">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
      
      <div class="calendar-week">
        ${weekDates.map(date => renderDayColumn(date, tasksByDate[date] || [])).join('')}
      </div>
    </div>
  `;
}

function groupTasksByDate(tasks) {
  const grouped = {};
  
  tasks.forEach(task => {
    if (!task.dueDate) return;
    
    const dateKey = formatDateOnly(task.dueDate);
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(task);
  });
  
  return grouped;
}

function getWeekDates(startDate) {
  const dates = [];
  const date = new Date(startDate);
  
  // Get Monday of current week
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(date.setDate(diff));
  
  // Get all 7 days
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(formatDateOnly(d.toISOString()));
  }
  
  return dates;
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function renderDayColumn(dateKey, tasks) {
  const date = new Date(dateKey);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNumber = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const isToday = formatDateOnly(new Date().toISOString()) === dateKey;
  
  // Sort tasks by priority and status
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
    const statusOrder = { 'Not Started': 1, 'In Progress': 2, 'Completed': 3, 'Cancelled': 4 };
    
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return statusOrder[a.status] - statusOrder[b.status];
  });
  
  return `
    <div class="calendar-day ${isToday ? 'today' : ''}">
      <div class="day-header">
        <div class="day-name">${dayName}</div>
        <div class="day-number ${isToday ? 'today-badge' : ''}">${dayNumber}</div>
        <div class="day-month">${month}</div>
        <div class="day-count">${tasks.length} task${tasks.length === 1 ? '' : 's'}</div>
      </div>
      <div class="day-tasks">
        ${sortedTasks.length > 0 
          ? sortedTasks.slice(0, 4).map(task => renderTaskCard(task)).join('')
          : '<div class="no-tasks text-muted text-center py-2"><small>No tasks</small></div>'
        }
        ${sortedTasks.length > 4 ? `
          <div class="more-tasks text-center">
            <small class="text-muted">+${sortedTasks.length - 4} more task${(sortedTasks.length - 4) === 1 ? '' : 's'}</small>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderTaskCard(task) {
  const statusClass = getStatusBadgeClass(task.status);
  const priorityClass = getPriorityBadgeClass(task.priority);
  const statusIcon = getStatusIcon(task.status);
  
  return `
    <div class="task-card ${statusClass}" onclick="window.location.href='/tasks/${task._id}'">
      <div class="task-card-header">
        <span class="badge ${priorityClass} badge-sm">${task.priority}</span>
        <span class="badge ${statusClass} badge-sm">
          <i class="fas ${statusIcon}"></i>
        </span>
      </div>
      <div class="task-card-title">${task.title}</div>
      ${task.categoryId ? `
        <div class="task-card-category">
          <i class="fas ${task.categoryId.icon || 'fa-tag'} me-1"></i>
          <small>${task.categoryId.name}</small>
        </div>
      ` : ''}
      ${task.description ? `
        <div class="task-card-description">
          <small class="text-muted">${task.description.substring(0, 30)}${task.description.length > 30 ? '...' : ''}</small>
        </div>
      ` : ''}
    </div>
  `;
}

// Global function for week navigation
window.navigateWeek = function(direction) {
  // TODO: Implement week navigation
  console.log('Navigate week:', direction);
  // This will be implemented to reload tasks for different week
};

