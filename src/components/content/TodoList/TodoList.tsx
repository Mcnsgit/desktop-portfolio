import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import styles from './TodoList.module.scss';

// Define task interface
interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

// Filter types
type FilterType = 'all' | 'active' | 'completed';

const TodoList: React.FC = () => {
  // Main state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Load tasks from localStorage on first render
  useEffect(() => {
    const savedTasks = localStorage.getItem('desktop-portfolio-tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        // Convert string dates back to Date objects
        const tasksWithDates = parsedTasks.map((task: Task) => ({
          ...task,
          createdAt: new Date(task.createdAt)
        }));
        setTasks(tasksWithDates);
      } catch (e) {
        console.error('Error parsing saved tasks', e);
      }
    } else {
      // Set example tasks for first-time users
      const exampleTasks: Task[] = [
        {
          id: '1',
          text: 'Welcome to my Todo App!',
          completed: false,
          createdAt: new Date()
        },
        {
          id: '2',
          text: 'Click on a task to mark it complete',
          completed: false,
          createdAt: new Date()
        },
        {
          id: '3',
          text: 'Double-click to edit a task',
          completed: false,
          createdAt: new Date()
        }
      ];
      setTasks(exampleTasks);
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('desktop-portfolio-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Add new task
  const addTask = () => {
    if (newTaskText.trim() === '') return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
      createdAt: new Date()
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskText('');
  };

  // Toggle task completion
  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Delete task
  const deleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Start editing a task
  const startEditing = (id: string, text: string) => {
    setIsEditingId(id);
    setEditText(text);
  };

  // Save edited task
  const saveEdit = () => {
    if (isEditingId && editText.trim() !== '') {
      setTasks(tasks.map(task => 
        task.id === isEditingId ? { ...task, text: editText } : task
      ));
    }
    setIsEditingId(null);
  };

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  // Get completion stats
  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;

  return (
    <div className={styles.todoContainer}>
      <div className={styles.todoHeader}>
        <h2>Task Manager</h2>
        <div className={styles.stats}>
          <span>{completedCount}/{totalCount} completed</span>
        </div>
      </div>
      
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="Add a new task..."
          className={styles.taskInput}
        />
        <button 
          onClick={addTask}
          className={styles.addButton}
          title="Add Task"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>
      
      <div className={styles.filterContainer}>
        <button 
          className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'active' ? styles.active : ''}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'completed' ? styles.active : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>
      
      <div className={styles.taskList}>
        {filteredTasks.length === 0 ? (
          <div className={styles.emptyState}>
            {filter === 'all' 
              ? "No tasks yet. Add one above!" 
              : filter === 'active' 
                ? "No active tasks. Great job!" 
                : "No completed tasks yet."}
          </div>
        ) : (
          filteredTasks.map(task => (
            <div 
              key={task.id} 
              className={`${styles.taskItem} ${task.completed ? styles.completed : ''}`}
              onClick={() => toggleTask(task.id)}
              onDoubleClick={() => !task.completed && startEditing(task.id, task.text)}
            >
              {isEditingId === task.id ? (
                <div className={styles.editContainer}>
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    onBlur={saveEdit}
                    autoFocus
                    className={styles.editInput}
                  />
                </div>
              ) : (
                <>
                  <div className={styles.taskCheck}>
                    {task.completed && <FontAwesomeIcon icon={faCheck} />}
                  </div>
                  <div className={styles.taskText}>{task.text}</div>
                  <button 
                    className={styles.deleteButton}
                    onClick={(e) => deleteTask(task.id, e)}
                    title="Delete Task"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodoList;