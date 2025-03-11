// src/components/tasks/TaskList.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Droppable } from '@hello-pangea/dnd';
import { Task, SeverityLevel } from '@prisma/client';
import TaskCard from './TaskCard';
import { AlertTriangle, Plus } from 'lucide-react';

interface TaskListProps {
  id: string;
  title: string;
  tasks: Task[];
  severity: SeverityLevel;
  onAddTask: (severity: SeverityLevel) => void;
  onCompleteTask: (id: string, isCompleted: boolean) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
}

const severityColors = {
  LOW: 'bg-green-50 border-green-200',
  MEDIUM: 'bg-yellow-50 border-yellow-200',
  HIGH: 'bg-red-50 border-red-200'
};

const TaskList: React.FC<TaskListProps> = ({
  id,
  title,
  tasks,
  severity,
  onAddTask,
  onCompleteTask,
  onDeleteTask,
  onEditTask
}) => {
  return (
    <div className={`flex flex-col h-full rounded-lg p-2 ${severityColors[severity as keyof typeof severityColors]} border`}>
      <div className="flex items-center justify-between p-2 mb-3">
        <div className="flex items-center">
          <h2 className="font-bold text-gray-700">{title}</h2>
          <div className="ml-2 bg-white rounded-full py-0.5 px-2 text-xs">
            {tasks.length}
          </div>
        </div>
        
        <div className={`flex items-center ${
          severity === 'HIGH' ? 'text-red-500' : 
          severity === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'
        }`}>
          <AlertTriangle className="h-4 w-4 mr-1" />
          <span className="text-sm">{severity.charAt(0) + severity.slice(1).toLowerCase()}</span>
        </div>
      </div>
      
      <Droppable droppableId={id}>
        {(provided) => (
          <div 
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 overflow-y-auto"
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onComplete={onCompleteTask}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      
      <button
        onClick={() => onAddTask(severity)}
        className="mt-2 flex items-center justify-center w-full py-2 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <Plus className="h-4 w-4 mr-1" />
        <span>Add Task</span>
      </button>
    </div>
  );
};

export default TaskList;

