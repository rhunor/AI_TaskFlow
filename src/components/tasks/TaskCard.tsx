// src/components/tasks/TaskCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Draggable } from '@hello-pangea/dnd';
import { Task, SeverityLevel } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Circle, Trash2, Edit, Calendar, AlertTriangle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  index: number;
  onComplete: (id: string, isCompleted: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const severityColors = {
  LOW: 'bg-green-100 border-green-300 text-green-800',
  MEDIUM: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  HIGH: 'bg-red-100 border-red-300 text-red-800'
};

const TaskCard: React.FC<TaskCardProps> = ({ task, index, onComplete, onDelete, onEdit }) => {
  const handleToggleComplete = () => {
    onComplete(task.id, !task.isCompleted);
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`p-3 mb-2 rounded-lg border ${
            severityColors[task.severity as SeverityLevel]
          } ${snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'} ${
            task.isCompleted ? 'opacity-70' : 'opacity-100'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 flex-1">
              <button 
                onClick={handleToggleComplete}
                className="mt-1 flex-shrink-0 text-gray-500 hover:text-blue-500 transition-colors"
              >
                {task.isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>
              
              <div className="flex-1">
                <h3 className={`font-medium ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className={`text-sm mt-1 ${task.isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                    {task.description}
                  </p>
                )}
                
                <div className="flex items-center mt-2 text-xs">
                  {task.dueDate && (
                    <div className="flex items-center text-gray-500 mr-3">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                  
                  <div className={`flex items-center ${
                    task.severity === 'HIGH' ? 'text-red-500' : 
                    task.severity === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    <span>{task.severity.charAt(0) + task.severity.slice(1).toLowerCase()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <button
                onClick={() => onEdit(task)}
                className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {task.isCompleted && task.completedAt && (
            <div className="text-xs text-gray-400 mt-2">
              Completed {formatDistanceToNow(new Date(task.completedAt), { addSuffix: true })}
            </div>
          )}
        </motion.div>
      )}
    </Draggable>
  );
};

export default TaskCard;