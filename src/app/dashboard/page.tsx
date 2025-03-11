// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Task, SeverityLevel } from '@prisma/client';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Plus, BarChart4, Trophy, Lightbulb, Loader2 } from 'lucide-react';
import TaskList from '@/components/tasks/TaskList';
import CompletedTasksList from '@/components/tasks/CompletedTasksList';
import TaskForm from '@/components/tasks/TaskForm';
import { confetti } from '@/lib/confetti';

interface TasksByStatus {
  completed: Task[];
  incompleteByPriority: {
    LOW: Task[];
    MEDIUM: Task[];
    HIGH: Task[];
  };
}

interface Suggestion {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  severity: SeverityLevel;
  reason: string;
}

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksByStatus, setTasksByStatus] = useState<TasksByStatus>({
    completed: [],
    incompleteByPriority: {
      LOW: [],
      MEDIUM: [],
      HIGH: [],
    },
  });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formSeverity, setFormSeverity] = useState<SeverityLevel>('MEDIUM');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [streakInfo, setStreakInfo] = useState({ current: 0, longest: 0 });
  const [badges, setBadges] = useState<any[]>([]);

  // Fetch tasks data
  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
      organizeTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch streak and badges
  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/user/stats');
      if (!response.ok) throw new Error('Failed to fetch user stats');
      const data = await response.json();
      setStreakInfo({
        current: data.streak?.currentStreak || 0,
        longest: data.streak?.longestStreak || 0,
      });
      setBadges(data.badges || []);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  // Fetch AI suggestions
  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/tasks/suggestions');
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  // Organize tasks by status and priority
  const organizeTasks = (tasks: Task[]) => {
    const completed = tasks.filter((task) => task.isCompleted);
    const incomplete = tasks.filter((task) => !task.isCompleted);

    const incompleteByPriority = {
      LOW: incomplete.filter((task) => task.severity === 'LOW')
        .sort((a, b) => a.position - b.position),
      MEDIUM: incomplete.filter((task) => task.severity === 'MEDIUM')
        .sort((a, b) => a.position - b.position),
      HIGH: incomplete.filter((task) => task.severity === 'HIGH')
        .sort((a, b) => a.position - b.position),
    };

    setTasksByStatus({
      completed: completed.sort((a, b) => 
        new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime()
      ),
      incompleteByPriority,
    });
  };

  useEffect(() => {
    fetchTasks();
    fetchUserStats();
    fetchSuggestions();
  }, []);

  // Add a new task
  const handleAddTask = async (taskData: Partial<Task>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) throw new Error('Failed to add task');

      const newTask = await response.json();
      setTasks([...tasks, newTask]);
      organizeTasks([...tasks, newTask]);
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  // Update an existing task
  const handleUpdateTask = async (taskData: Partial<Task>) => {
    if (!taskData.id) return;

    try {
      const response = await fetch(`/api/tasks/${taskData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) throw new Error('Failed to update task');

      const updatedTask = await response.json();
      
      const updatedTasks = tasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      );
      
      setTasks(updatedTasks);
      organizeTasks(updatedTasks);
      
      // If task was completed, fetch user stats to update streaks/badges
      if (taskData.isCompleted && !selectedTask?.isCompleted) {
        fetchUserStats();
        // Trigger confetti animation
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  // Complete/uncomplete a task
  const handleCompleteTask = (id: string, isCompleted: boolean) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      handleUpdateTask({ ...task, isCompleted });
    }
  };

  // Delete a task
  const handleDeleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete task');

      const updatedTasks = tasks.filter((task) => task.id !== id);
      setTasks(updatedTasks);
      organizeTasks(updatedTasks);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Handle drag and drop reordering
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) return;

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Moving within the same list
    if (destination.droppableId === source.droppableId) {
      const listKey = source.droppableId.split('-')[1] as SeverityLevel;
      const list = [...tasksByStatus.incompleteByPriority[listKey]];
      const [movedTask] = list.splice(source.index, 1);
      list.splice(destination.index, 0, movedTask);

      // Update positions
      const updatedList = list.map((task, index) => ({
        ...task,
        position: index,
      }));

      // Update local state
      setTasksByStatus({
        ...tasksByStatus,
        incompleteByPriority: {
          ...tasksByStatus.incompleteByPriority,
          [listKey]: updatedList,
        },
      });

      // Send updated positions to API
      try {
        await fetch('/api/tasks/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tasks: updatedList.map((task) => ({
              id: task.id,
              position: task.position,
            })),
          }),
        });
      } catch (error) {
        console.error('Error reordering tasks:', error);
      }
    } 
    // Moving between lists
    else {
      const sourceListKey = source.droppableId.split('-')[1] as SeverityLevel;
      const destListKey = destination.droppableId.split('-')[1] as SeverityLevel;
      
      const sourceList = [...tasksByStatus.incompleteByPriority[sourceListKey]];
      const destList = [...tasksByStatus.incompleteByPriority[destListKey]];
      
      // Remove from source list
      const [movedTask] = sourceList.splice(source.index, 1);
      
      // Add to destination list
      const updatedTask = { ...movedTask, severity: destListKey };
      destList.splice(destination.index, 0, updatedTask);
      
      // Update positions in both lists
      const updatedSourceList = sourceList.map((task, index) => ({
        ...task,
        position: index,
      }));
      
      const updatedDestList = destList.map((task, index) => ({
        ...task,
        position: index,
      }));
      
      // Update local state
      setTasksByStatus({
        ...tasksByStatus,
        incompleteByPriority: {
          ...tasksByStatus.incompleteByPriority,
          [sourceListKey]: updatedSourceList,
          [destListKey]: updatedDestList,
        },
      });
      
      // Update in API
      try {
        // Update all tasks in both lists
        await fetch('/api/tasks/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tasks: [
              ...updatedSourceList.map((task) => ({
                id: task.id,
                position: task.position,
              })),
              ...updatedDestList.map((task) => ({
                id: task.id,
                position: task.position,
                severity: destListKey,
              })),
            ],
          }),
        });
        
        // Update all tasks array
        const updatedTasks = tasks.map((task) => {
          if (task.id === draggableId) {
            return { ...task, severity: destListKey };
          }
          return task;
        });
        
        setTasks(updatedTasks);
      } catch (error) {
        console.error('Error reordering tasks between lists:', error);
      }
    }
  };

  // Open task form for adding or editing
  const handleOpenTaskForm = (severity?: SeverityLevel, task?: Task) => {
    if (task) {
      setSelectedTask(task);
    } else {
      setSelectedTask(null);
      if (severity) {
        setFormSeverity(severity);
      }
    }
    setShowTaskForm(true);
  };

  // Close task form
  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setSelectedTask(null);
  };

  // Handle task form submission
  const handleTaskFormSubmit = async (taskData: Partial<Task>) => {
    if (selectedTask) {
      await handleUpdateTask(taskData);
    } else {
      await handleAddTask(taskData);
    }
  };

  // Calculate progress metrics
  const totalTasks = tasks.length;
  const completedTasks = tasksByStatus.completed.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-600">Loading your tasks...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header with stats */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
            
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              {/* Progress */}
              <div className="flex items-center">
                <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-600">
                  {completedTasks} / {totalTasks} ({progressPercentage}%)
                </span>
              </div>
              
              {/* Streak */}
              <div className="flex items-center text-sm">
                <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="font-medium">{streakInfo.current} day streak</span>
              </div>
              
              {/* Add task button */}
              <button
                onClick={() => handleOpenTaskForm('MEDIUM')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="flex items-center text-blue-600 mb-2 hover:text-blue-800"
            >
              <Lightbulb className="h-5 w-5 mr-1 text-yellow-500" />
              <span className="font-medium">AI Suggested Tasks for Today</span>
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs py-0.5 px-2 rounded-full">
                {suggestions.length}
              </span>
            </button>
            
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
              >
                <h3 className="font-medium text-blue-800 mb-2">Suggested tasks to focus on today:</h3>
                <div className="space-y-2">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="flex items-start bg-white p-3 rounded-md border border-blue-200">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            suggestion.severity === 'HIGH' ? 'bg-red-500' : 
                            suggestion.severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <h4 className="font-medium">{suggestion.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{suggestion.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Task Board */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TaskList
              id="list-HIGH"
              title="Urgent"
              tasks={tasksByStatus.incompleteByPriority.HIGH}
              severity="HIGH"
              onAddTask={handleOpenTaskForm}
              onCompleteTask={handleCompleteTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={(task) => handleOpenTaskForm(undefined, task)}
            />
            
            <TaskList
              id="list-MEDIUM"
              title="Important"
              tasks={tasksByStatus.incompleteByPriority.MEDIUM}
              severity="MEDIUM"
              onAddTask={handleOpenTaskForm}
              onCompleteTask={handleCompleteTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={(task) => handleOpenTaskForm(undefined, task)}
            />
            
            <TaskList
              id="list-LOW"
              title="Normal"
              tasks={tasksByStatus.incompleteByPriority.LOW}
              severity="LOW"
              onAddTask={handleOpenTaskForm}
              onCompleteTask={handleCompleteTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={(task) => handleOpenTaskForm(undefined, task)}
            />
          </div>
        </DragDropContext>

        {/* Completed Tasks */}
        <CompletedTasksList
          tasks={tasksByStatus.completed}
          onCompleteTask={handleCompleteTask}
          onDeleteTask={handleDeleteTask}
          onEditTask={(task) => handleOpenTaskForm(undefined, task)}
        />
      </div>

      {/* Task Form Modal */}
      <AnimatePresence>
        {showTaskForm && (
          <TaskForm
            initialTask={selectedTask || undefined}
            defaultSeverity={formSeverity}
            onSubmit={handleTaskFormSubmit}
            onCancel={handleCloseTaskForm}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;