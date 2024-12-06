import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaPlus, FaTrashAlt, FaPen, FaArrowLeft, FaArrowRight, FaSave, FaSearch, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { fetchTasks, addTask, deleteTask, updateTask } from '../../services/taskService';
import { logout } from '../../services/authService';

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupColor, setPopupColor] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrollingEnabled, setIsScrollingEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tasksPerPage = 7;
  const taskInputRef = useRef(null);
  const taskRefs = useRef([]);
  const navigate = useNavigate();

  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedTasks = await fetchTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const showPopup = (message, color) => {
    setPopupMessage(message);
    setPopupColor(color);
    setTimeout(() => setPopupMessage(null), 1500);
  };

  const playNotificationSound = () => {
    const sound = new Audio('/notification.mp3');
    sound.play().catch(error => console.error('Error playing sound:', error));
  };

  const handleAddTask = async () => {
    if (taskInput.trim() === '' || isSubmitting) return;

    const taskExists = tasks.some(task => task.title.toLowerCase() === taskInput.toLowerCase());
    if (taskExists) {
      showPopup('Task already exists!', 'orange');
      playNotificationSound();
      return;
    }

    setIsSubmitting(true);
    try {
      const newTask = await addTask(taskInput);
      setTasks(prevTasks => [...prevTasks, newTask]);
      setTaskInput('');
      showPopup('Task added successfully!', 'green');
      playNotificationSound();
    } catch (error) {
      console.error('Error adding task:', error);
      showPopup('Error adding task', 'red');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
      showPopup('Task deleted successfully!', 'red');
      playNotificationSound();
    } catch (error) {
      console.error('Error deleting task:', error);
      showPopup('Error deleting task', 'red');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTask = (taskId) => {
    setEditingTaskId(taskId);
    const taskToEdit = tasks.find(task => task._id === taskId);
    if (taskToEdit) {
      setTaskInput(taskToEdit.title);
    }
  };

  const handleSaveEditedTask = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updatedTask = await updateTask(editingTaskId, taskInput);
      setTasks(prevTasks => prevTasks.map(task =>
        task._id === editingTaskId ? updatedTask : task
      ));
      setTaskInput('');
      setEditingTaskId(null);
      showPopup('Task updated successfully!', 'blue');
      playNotificationSound();
    } catch (error) {
      console.error('Error updating task:', error);
      showPopup('Error updating task', 'red');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleArrowNavigation = useCallback((e) => {
    const index = taskRefs.current.findIndex(ref => ref === document.activeElement);
    if (index === -1) return;

    if (e.key === 'ArrowDown' && index < taskRefs.current.length - 1) {
      taskRefs.current[index + 1].focus();
    } else if (e.key === 'ArrowUp' && index > 0) {
      taskRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const currentTaskId = tasks[index]._id;
      const actionButton = document.querySelector(`.task-item[data-id="${currentTaskId}"] .task-actions button`);
      if (actionButton) actionButton.focus();
    }
  }, [tasks]);

  useEffect(() => {
    if (editingTaskId !== null && taskInputRef.current) {
      taskInputRef.current.focus();
    }
    window.addEventListener('keydown', handleArrowNavigation);
    return () => {
      window.removeEventListener('keydown', handleArrowNavigation);
    };
  }, [editingTaskId, handleArrowNavigation]);

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentTasks = isScrollingEnabled
    ? filteredTasks
    : filteredTasks.slice(currentPage * tasksPerPage, (currentPage + 1) * tasksPerPage);

  const handleNextPage = () => {
    if ((currentPage + 1) * tasksPerPage < filteredTasks.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const toggleScrollingMode = () => {
    setIsScrollingEnabled(prev => !prev);
    showPopup(isScrollingEnabled ? 'Scrolling mode OFF' : 'Scrolling mode ON', isScrollingEnabled ? 'red' : 'green');
    playNotificationSound();
  };

  if (isLoading) {
    return <div className="loading">Loading tasks...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="task-manager">
      <div className="task-manager-header">
        <h1 className="app-title">Task Management</h1>
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
      <div className="scrolling-toggle-container">
        <label className="switch">
          <input
            type="checkbox"
            checked={isScrollingEnabled}
            onChange={toggleScrollingMode}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="task-input-wrapper">
        <div className="task-input-container">
          <input
            type="text"
            id="task-input"
            name="task"
            placeholder={editingTaskId ? 'Edit task' : 'Add new task'}
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (editingTaskId ? handleSaveEditedTask() : handleAddTask())}
            ref={taskInputRef}
          />
          <button
            className="add-task-btn"
            onClick={editingTaskId ? handleSaveEditedTask : handleAddTask}
            disabled={isSubmitting}
          >
            {editingTaskId ? <FaSave /> : <FaPlus />}
          </button>
        </div>

        <div className="search-container">
          <input
            type="search"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <FaSearch className="search-icon" />
        </div>
      </div>

      <div className={`task-list-container ${isScrollingEnabled && filteredTasks.length >= 7 ? 'scrolling-enabled' : ''}`}>
        {currentTasks.length === 0 && searchQuery ? (
          <div className="no-tasks-found">No tasks found.</div>
        ) : (
          currentTasks.map((task, index) => (
            <div className="task-item" key={task._id} data-id={task._id} tabIndex={0} ref={(el) => (taskRefs.current[index] = el)}>
              <div className="task-info">
                <span className="task-serial">{index + 1}.</span>
                <span className="task-title">{task.title}</span>
              </div>
              <div className="task-actions">
                {editingTaskId === task._id ? (
                  <button className="save-btn" onClick={handleSaveEditedTask} disabled={isSubmitting}>
                    <FaSave />
                  </button>
                ) : (
                  <button className="edit-btn" onClick={() => handleEditTask(task._id)} disabled={isSubmitting}>
                    <FaPen />
                  </button>
                )}
                <button className="delete-btn" onClick={() => handleDeleteTask(task._id)} disabled={isSubmitting}>
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredTasks.length > tasksPerPage && !isScrollingEnabled && (
        <div className="pagination-controls">
          <button className="prev-btn" onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))} disabled={currentPage === 0}>
            <FaArrowLeft />
          </button>
          <button className="next-btn" onClick={handleNextPage} disabled={(currentPage + 1) * tasksPerPage >= filteredTasks.length}>
            <FaArrowRight />
          </button>
        </div>
      )}

      {popupMessage && (
        <div className={`popup-message ${popupColor}`}>
          <span>{popupMessage}</span>
        </div>
      )}
    </div>
  );
}