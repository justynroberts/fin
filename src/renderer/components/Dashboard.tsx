/**
 * Dashboard - RSS feed and tasks
 */

import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '../store';
import { RSSFeed } from './RSSFeed';
import './Dashboard.css';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}

const Dashboard: React.FC = () => {
  const { documents, workspace } = useWorkspaceStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const recentDocs = documents.slice(0, 5);

  // Filter tasks based on completion status
  const filteredTasks = showCompleted
    ? tasks
    : tasks.filter(task => !task.completed);

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('finton-tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    if (tasks.length > 0 || localStorage.getItem('finton-tasks')) {
      localStorage.setItem('finton-tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = () => {
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
      order: tasks.length,
    };

    setTasks([...tasks, newTask]);
    setNewTaskText('');
  };

  const toggleTaskComplete = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const saveEdit = () => {
    if (!editingText.trim() || !editingTaskId) {
      setEditingTaskId(null);
      return;
    }

    setTasks(tasks.map(task =>
      task.id === editingTaskId
        ? { ...task, text: editingText.trim() }
        : task
    ));
    setEditingTaskId(null);
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditingText('');
  };

  const moveTask = (taskId: string, direction: 'up' | 'down') => {
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= tasks.length) return;

    const newTasks = [...tasks];
    [newTasks[index], newTasks[newIndex]] = [newTasks[newIndex], newTasks[index]];

    // Update order
    newTasks.forEach((task, i) => {
      task.order = i;
    });

    setTasks(newTasks);
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, taskId: string) => {
    e.preventDefault();
    if (!draggedTaskId || draggedTaskId === taskId) return;

    const draggedIndex = tasks.findIndex(t => t.id === draggedTaskId);
    const targetIndex = tasks.findIndex(t => t.id === taskId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newTasks = [...tasks];
    const [draggedTask] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, draggedTask);

    // Update order
    newTasks.forEach((task, i) => {
      task.order = i;
    });

    setTasks(newTasks);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          <span className="material-symbols-rounded dashboard-icon">pets</span>
          Finton
        </h1>
        <p className="dashboard-subtitle">{workspace?.name || 'AI-Powered Text Editor'}</p>
      </div>

      <div className="dashboard-layout">
        {/* Left Column - Recent Documents & Tasks */}
        <div className="dashboard-sidebar">
          {/* Recent Documents */}
          <div className="dashboard-card recent-docs-card">
            <div className="card-header">
              <span className="material-symbols-rounded">history</span>
              <h2>Recent</h2>
            </div>
            <div className="recent-docs-compact">
              {recentDocs.length === 0 ? (
                <div className="empty-state-small">
                  No documents yet
                </div>
              ) : (
                recentDocs.map((doc) => (
                  <div key={doc.path} className="recent-doc-item-compact">
                    <span className={`doc-icon-compact ${doc.mode}`}>
                      {doc.mode === 'markdown' && <span className="material-symbols-rounded">article</span>}
                      {doc.mode === 'notes' && <span className="material-symbols-rounded">format_text_wrap</span>}
                      {doc.mode === 'code' && <span className="material-symbols-rounded">code</span>}
                    </span>
                    <div className="doc-info-compact">
                      <div className="doc-title-compact">{doc.title}</div>
                      <div className="doc-date-compact">
                        {new Date(doc.modified).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tasks Section */}
          <div className="dashboard-card tasks-card">
            <div className="card-header">
              <span className="material-symbols-rounded">checklist</span>
              <h2>Tasks</h2>
              <button
                className="task-filter-btn"
                onClick={() => setShowCompleted(!showCompleted)}
                title={showCompleted ? "Hide completed tasks" : "Show completed tasks"}
              >
                <span className="material-symbols-rounded">
                  {showCompleted ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            <div className="tasks-list">
              {filteredTasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`task-item ${draggedTaskId === task.id ? 'dragging' : ''}`}
                  draggable={editingTaskId !== task.id}
                  onDragStart={() => handleDragStart(task.id)}
                  onDragOver={(e) => handleDragOver(e, task.id)}
                  onDragEnd={handleDragEnd}
                >
                  {editingTaskId === task.id ? (
                    <div className="task-edit-mode">
                      <input
                        type="text"
                        className="task-edit-input"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        autoFocus
                      />
                      <button className="task-btn save" onClick={saveEdit} title="Save">
                        <span className="material-symbols-rounded">check</span>
                      </button>
                      <button className="task-btn cancel" onClick={cancelEdit} title="Cancel">
                        <span className="material-symbols-rounded">close</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="task-drag-handle" title="Drag to reorder">
                        <span className="material-symbols-rounded">drag_indicator</span>
                      </div>
                      <div
                        className={`task-text ${task.completed ? 'completed' : ''}`}
                        onClick={() => startEditing(task)}
                      >
                        {task.text}
                      </div>
                      <button
                        className={`task-btn ${task.completed ? 'uncomplete' : 'complete'}`}
                        onClick={() => toggleTaskComplete(task.id)}
                        title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        <span className="material-symbols-rounded">
                          {task.completed ? 'radio_button_unchecked' : 'check_circle'}
                        </span>
                      </button>
                      {task.completed && (
                        <button
                          className="task-btn delete"
                          onClick={() => deleteTask(task.id)}
                          title="Delete task"
                        >
                          <span className="material-symbols-rounded">delete</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="empty-state-small">No tasks yet</div>
              )}
            </div>
            <div className="task-add">
              <input
                type="text"
                className="task-add-input"
                placeholder="Add a new task..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addTask();
                }}
              />
              <button className="task-add-btn" onClick={addTask} disabled={!newTaskText.trim()}>
                <span className="material-symbols-rounded">note_add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - RSS Feed */}
        <div className="dashboard-main">
          <div className="dashboard-card rss-card">
            <RSSFeed />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
