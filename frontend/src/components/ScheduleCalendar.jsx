import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDateKey, getStatusBadgeClass, getPriorityBadgeClass, getStatusIcon } from '../utils/format';

const ScheduleCalendar = ({ tasks = [] }) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const navigate = useNavigate();

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-4">
        <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
        <p className="text-muted">No tasks this week</p>
      </div>
    );
  }

  // Group tasks by date
  const groupTasksByDate = (tasks) => {
    const grouped = {};
    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const dateKey = getDateKey(task.dueDate);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(task);
    });
    return grouped;
  };

  // Get week dates
  const getWeekDates = (startDate) => {
    const dates = [];
    const date = new Date(startDate);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.getFullYear(), date.getMonth(), diff);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      dates.push(getDateKey(d.toISOString()));
    }
    return dates;
  };

  // Get week date range
  const getWeekDateRange = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.getFullYear(), d.getMonth(), diff);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);

    const formatOptions = { month: 'short', day: 'numeric' };
    const startDate = monday.toLocaleDateString('en-US', formatOptions);
    const endDate = sunday.toLocaleDateString('en-US', formatOptions);
    return { startDate, endDate };
  };

  // Get category color
  const getCategoryColor = (categoryName) => {
    const colors = {
      Work: '#3b82f6',
      Personal: '#8b5cf6',
      Shopping: '#ec4899',
      Health: '#10b981',
      Finance: '#f59e0b',
      Education: '#06b6d4',
      Other: '#6b7280',
    };
    return colors[categoryName] || '#d86b22';
  };

  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + weekOffset * 7);
  const weekDates = getWeekDates(currentDate);
  const { startDate, endDate } = getWeekDateRange(currentDate);
  const tasksByDate = groupTasksByDate(tasks);

  const navigateWeek = (direction, reset = false) => {
    if (reset) {
      setWeekOffset(0);
    } else {
      setWeekOffset((prev) => prev + direction);
    }
  };

  const TaskCard = ({ task }) => {
    const statusClass = getStatusBadgeClass(task.status);
    const priorityClass = getPriorityBadgeClass(task.priority);
    const statusIcon = getStatusIcon(task.status);

    return (
      <div
        className={`task-card ${statusClass}`}
        onClick={() => navigate(`/tasks/${task._id}`)}
        style={{ cursor: 'pointer' }}
      >
        <div className="task-card-header">
          <span className={`badge ${priorityClass} badge-sm`}>{task.priority}</span>
          <span className={`badge ${statusClass} badge-sm`}>
            <i className={`fas ${statusIcon}`}></i>
          </span>
        </div>
        <div className="task-card-title">{task.title}</div>
        {task.categoryId && (
          <div
            className="task-card-category"
            style={{
              background: task.categoryId.color || getCategoryColor(task.categoryId.name),
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              marginTop: '0.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <i className={`fas ${task.categoryId.icon || 'fa-tag'}`}></i>
            <span>{task.categoryId.name}</span>
          </div>
        )}
        {task.description && (
          <div className="task-card-description">
            <small className="text-muted">
              {task.description.substring(0, 30)}
              {task.description.length > 30 ? '...' : ''}
            </small>
          </div>
        )}
      </div>
    );
  };

  const DayColumn = ({ dateKey, tasks }) => {
    const date = new Date(dateKey);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const isToday = getDateKey(new Date().toISOString()) === dateKey;

    const sortedTasks = [...tasks].sort((a, b) => {
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      const statusOrder = { 'Not Started': 1, 'In Progress': 2, Completed: 3, Cancelled: 4 };

      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return statusOrder[a.status] - statusOrder[b.status];
    });

    return (
      <div className={`calendar-day ${isToday ? 'today' : ''}`}>
        <div className="day-header">
          <div className="day-name">{dayName}</div>
          <div className={`day-number ${isToday ? 'today-badge' : ''}`}>{dayNumber}</div>
          <div className="day-month">{month}</div>
          <div className="day-count">
            {tasks.length} task{tasks.length === 1 ? '' : 's'}
          </div>
        </div>
        <div className="day-tasks">
          {sortedTasks.length > 0 ? (
            <>
              {sortedTasks.slice(0, 4).map((task) => (
                <TaskCard key={task._id} task={task} />
              ))}
              {sortedTasks.length > 4 && (
                <div className="more-tasks text-center">
                  <small className="text-muted">
                    +{sortedTasks.length - 4} more task{sortedTasks.length - 4 === 1 ? '' : 's'}
                  </small>
                </div>
              )}
            </>
          ) : (
            <div className="no-tasks text-muted text-center py-2">
              <small>No tasks</small>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="schedule-calendar">
      <div className="calendar-header mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-calendar-alt me-2"></i>This week's schedule
          </h5>
          <div className="calendar-nav">
            <button className="btn btn-sm btn-outline-secondary" onClick={() => navigateWeek(-1)}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <span className="mx-3 fw-bold" style={{ fontSize: '0.95rem' }}>
              {startDate} - {endDate}
            </span>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => navigateWeek(1)}>
              <i className="fas fa-chevron-right"></i>
            </button>
            {weekOffset !== 0 && (
              <button className="btn btn-sm btn-primary ms-2" onClick={() => navigateWeek(0, true)}>
                <i className="fas fa-calendar-day me-1"></i>Today
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="calendar-week">
        {weekDates.map((dateKey) => (
          <DayColumn key={dateKey} dateKey={dateKey} tasks={tasksByDate[dateKey] || []} />
        ))}
      </div>
    </div>
  );
};

export default ScheduleCalendar;
