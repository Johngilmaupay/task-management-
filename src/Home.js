import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  FiPlus, FiSun, FiMoon, FiUser, FiTrash, FiEdit, FiCalendar, FiLogOut, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from './firebase';
import { ref, get, set, push, onValue, remove, update } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [userId, setUserId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDueTime, setNewDueTime] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [filter, setFilter] = useState('active');
  const [sortBy, setSortBy] = useState('priority');
  const [editTask, setEditTask] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [editedDueDate, setEditedDueDate] = useState('');
  const [editedDueTime, setEditedDueTime] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('General');
  const [newPriority, setNewPriority] = useState('medium');
  const [editedCategory, setEditedCategory] = useState('General');
  const [editedPriority, setEditedPriority] = useState('medium');
  const [showOverdueModal, setShowOverdueModal] = useState(false);
  const [showOverdueDropdown, setShowOverdueDropdown] = useState(false);
  const [overdueTasks, setOverdueTasks] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const snapshot = await get(ref(db, `users/${user.uid}`));
          if (snapshot.exists()) {
            const data = snapshot.val();
            setCurrentUserName(`${data.firstName} ${data.lastName}`);
          } else {
            setCurrentUserName('User');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setCurrentUserName('User');
        }

        const tasksRef = ref(db, `tasks/${user.uid}`);
        onValue(tasksRef, (snapshot) => {
          const data = snapshot.val();
          const loadedTasks = data
            ? Object.entries(data).map(([key, val]) => ({ ...val, id: key }))
            : [];
          setTasks(loadedTasks);

          const overdue = loadedTasks.filter(task => {
            if (!task.completed && task.dueDate) {
              const due = new Date(task.dueDate);
              return !isNaN(due) && due < new Date();
            }
            return false;
          });

          setOverdueTasks(overdue);
          if (overdue.length > 0) {
            setTimeout(() => setShowOverdueModal(true), 500);
          }
        });

        setLoading(false);
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTasks(items);
  };

  const addTask = () => {
    if (newTask.trim() && userId) {
      const newTaskData = {
        text: newTask,
        completed: false,
        dueDate: newDueDate && newDueTime ? `${newDueDate} ${newDueTime}` : newDueDate,
        priority: newPriority,
        category: newCategory,
      };

      const newTaskRef = push(ref(db, `tasks/${userId}`));
      set(newTaskRef, newTaskData)
        .then(() => {
          setNewTask('');
          setNewDueDate('');
          setNewDueTime('');
          setNewCategory('General');
          setNewPriority('medium');
        })
        .catch((e) => console.error(e));
    }
  };

  const deleteTask = (taskId) => {
    if (userId) {
      remove(ref(db, `tasks/${userId}/${taskId}`));
    }
  };

  const toggleTask = (taskId) => {
    const updatedTask = tasks.find(task => task.id === taskId);
    if (updatedTask && userId) {
      update(ref(db, `tasks/${userId}/${taskId}`), {
        completed: !updatedTask.completed,
      });
    }
  };

  const startEditing = (task) => {
    setEditTask(task);
    setEditedText(task.text);
    setEditedCategory(task.category || 'General');
    setEditedPriority(task.priority || 'medium');
    if (task.dueDate) {
      const [datePart, timePart] = task.dueDate.split(' ');
      setEditedDueDate(datePart || '');
      setEditedDueTime(timePart || '');
    } else {
      setEditedDueDate('');
      setEditedDueTime('');
    }
  };

  const cancelEdit = () => {
    setEditTask(null);
    setEditedText('');
    setEditedDueDate('');
    setEditedDueTime('');
    setEditedCategory('General');
    setEditedPriority('medium');
  };

  const saveEditedTask = (taskId) => {
    if (editedText.trim() && userId) {
      const dueDateTime = editedDueDate
        ? editedDueTime
          ? `${editedDueDate} ${editedDueTime}`
          : editedDueDate
        : '';

      update(ref(db, `tasks/${userId}/${taskId}`), {
        text: editedText,
        dueDate: dueDateTime,
        category: editedCategory,
        priority: editedPriority,
      })
        .then(() => {
          cancelEdit();
        })
        .catch((error) => {
          console.error('Failed to update task:', error);
        });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const OverdueModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <h3>⚠️ Overdue Tasks</h3>
        <p>You have <strong>{overdueTasks.length}</strong> overdue task{overdueTasks.length !== 1 ? 's' : ''}.</p>
        <button
          className="dropdown-toggle"
          onClick={() => setShowOverdueDropdown(!showOverdueDropdown)}
        >
          {showOverdueDropdown ? (
            <>
              Hide Overdue Tasks <FiChevronUp />
            </>
          ) : (
            <>
              Show Overdue Tasks <FiChevronDown />
            </>
          )}
        </button>

        {showOverdueDropdown && (
          <ul className="overdue-task-list">
            {overdueTasks.map(task => (
              <li key={task.id}>
                <strong>{task.text}</strong> – <em>{task.dueDate}</em>
              </li>
            ))}
          </ul>
        )}
        <button onClick={() => setShowOverdueModal(false)}>Dismiss</button>
      </div>
    </div>
  );

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <header className="header">
        <div className="logo"><h1>TaskFlow</h1></div>
        <nav className="nav">
          <Link to="/home">🏠 Home</Link>
          <Link to="/calendar">🗓️ Calendar</Link>
          <Link to="/tasks">📝 Tasks</Link>
        </nav>
        <div className="header-controls">
          <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle">
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
          <div className="profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <FiUser size={20} />
            {showProfileMenu && (
              <div className="profile-menu">
                <button className="profile-menu-item" onClick={handleLogout}>
                  <FiLogOut /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="greeting-note modal-inline-wrapper">
          <h2>{loading ? 'Loading...' : `Hi, ${currentUserName}`}</h2>
          {showOverdueModal && <OverdueModal />}
        </div>

        <div className="dashboard">
          <div className="stats-card">
            <h3>📅 Upcoming Tasks</h3>
            <span className="accent-text">{tasks.filter(t => !t.completed).length}</span>
          </div>
          <div className="stats-card">
            <h3>⚠️ Overdue Tasks</h3>
            <p>
  You have <strong>{overdueTasks.length}</strong> overdue task
  {overdueTasks.length !== 1 ? 's' : ''}.
</p>

          </div>
          <div className="stats-card">
            <h3>✅ Completed</h3>
            <span className="accent-text">{tasks.filter(t => t.completed).length}</span>
          </div>
        </div>

        <div className="task-section">
          <div className="task-controls">
            <div className="task-input-group">
              <input
                type="text"
                placeholder="Add new task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                className="task-input"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="category-select"
              >
                <option value="General">General</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Shopping">Shopping</option>
                <option value="Other">Other</option>
              </select>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="priority-select"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="due-date-input"
              />
              <input
                type="time"
                value={newDueTime}
                onChange={(e) => setNewDueTime(e.target.value)}
                className="due-time-input"
              />
            </div>
            <button onClick={addTask} className="add-button">
              <FiPlus size={18} /> Add Task
            </button>
            <div className="filter-group">
              <select onChange={(e) => setFilter(e.target.value)} className="filter-select" value={filter}>
                <option value="active">Active</option>
                <option value="all">All Tasks</option>
                <option value="completed">Completed</option>
                
              </select>
              <select onChange={(e) => setSortBy(e.target.value)} className="filter-select">
                <option value="priority">Priority</option>
                <option value="dueDate">Due Date</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="task-list">
                  {tasks
                    .filter(task => {
                      if (filter === 'completed') return task.completed;
                      if (filter === 'active') return !task.completed;
                      return true;
                    })
                    .sort((a, b) => {
                      if (sortBy === 'priority') {
                        const priorityOrder = { high: 1, medium: 2, low: 3 };
                        return priorityOrder[a.priority] - priorityOrder[b.priority];
                      } else {
                        const valA = a[sortBy] || '';
                        const valB = b[sortBy] || '';
                        return valA.localeCompare(valB);
                      }
                    })
                    .map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`task-item ${snapshot.isDragging ? 'dragging' : ''}`}
                          >
                            <div className="task-checkbox">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTask(task.id)}
                              />
                            </div>
                            <div className="task-content">
                              {editTask?.id === task.id ? (
                                <>
                                  <input
                                    className="task-edit-input"
                                    type="text"
                                    value={editedText}
                                    onChange={(e) => setEditedText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveEditedTask(task.id);
                                      if (e.key === 'Escape') cancelEdit();
                                    }}
                                    autoFocus
                                  />
                                  <div className="edit-due-date-time">
                                    <select
                                      value={editedCategory}
                                      onChange={(e) => setEditedCategory(e.target.value)}
                                    >
                                      <option value="General">General</option>
                                      <option value="Work">Work</option>
                                      <option value="Personal">Personal</option>
                                      <option value="Shopping">Shopping</option>
                                      <option value="Other">Other</option>
                                    </select>
                                    <select
                                      value={editedPriority}
                                      onChange={(e) => setEditedPriority(e.target.value)}
                                    >
                                      <option value="high">High</option>
                                      <option value="medium">Medium</option>
                                      <option value="low">Low</option>
                                    </select>
                                    <input
                                      type="date"
                                      value={editedDueDate}
                                      onChange={(e) => setEditedDueDate(e.target.value)}
                                    />
                                    <input
                                      type="time"
                                      value={editedDueTime}
                                      onChange={(e) => setEditedDueTime(e.target.value)}
                                    />
                                  </div>
                                  <div className="edit-buttons">
                                    <button onClick={() => saveEditedTask(task.id)}>Save</button>
                                    <button onClick={cancelEdit}>Cancel</button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <span className={`task-text ${task.completed ? 'completed' : ''}`}>
                                    {task.text}
                                  </span>
                                  <div className="task-meta">
                                    {task.category && (
                                      <span className="category-badge">{task.category}</span>
                                    )}
                                    {task.priority && (
                                      <span className={`priority-badge ${task.priority}`}>
                                        {task.priority}
                                      </span>
                                    )}
                                    {task.dueDate && (
                                      <span className="due-date">
                                        <FiCalendar size={14} /> {task.dueDate}
                                      </span>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                            {!editTask && (
                              <div className="task-actions">
                                <FiEdit className="action-icon" onClick={() => startEditing(task)} />
                                <FiTrash className="action-icon" onClick={() => deleteTask(task.id)} />
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

      </main>
    </div>
  );
};

export default Home;
