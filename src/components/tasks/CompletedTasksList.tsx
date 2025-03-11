// src/components/tasks/CompletedTasksList.tsx
import React, { useState } from 'react';
import { Task } from '@prisma/client';
import TaskCard from './TaskCard';
import { CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompletedTasksListProps {
  tasks: Task[];
  onCompleteTask: (id: string, isCompleted: boolean) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
}

const CompletedTasksList: React.FC<CompletedTasksListProps> = ({
  tasks,
  onCompleteTask,
  onDeleteTask,
  onEditTask
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full py-2"
      >
        <div className="flex items-center text-gray-600">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <h2 className="font-medium">Completed Tasks</h2>
          <div className="ml-2 bg-white rounded-full py-0.5 px-2 text-xs">
            {tasks.length}
          </div>
        </div>
        
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompletedTasksList;