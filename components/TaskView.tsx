
import React, { useState } from 'react';
// Fixed: Added ClipboardList to imports from lucide-react
import { Plus, CheckCircle2, Circle, Loader2, ClipboardList } from 'lucide-react';
import { LifeTask, Difficulty } from '../types';
import { decomposeTask } from '../services/geminiService';

interface TaskViewProps {
  tasks: LifeTask[];
  // Fix: Update prop signature to allow passing a task without userId, which is assigned by the backend or parent
  onAddTask: (task: Omit<LifeTask, 'userId'>) => void;
  onCompleteSubTask: (taskId: string, subTaskId: string) => void;
}

const TaskView: React.FC<TaskViewProps> = ({ tasks, onAddTask, onCompleteSubTask }) => {
  const [inputValue, setInputValue] = useState('');
  const [isDecomposing, setIsDecomposing] = useState(false);

  const handleAddTask = async () => {
    if (!inputValue.trim()) return;
    setIsDecomposing(true);
    try {
      const subTaskDrafts = await decomposeTask(inputValue);
      // Fix: Use Omit<LifeTask, 'userId'> to resolve missing property error, as userId is added later in the lifecycle
      const newTask: Omit<LifeTask, 'userId'> = {
        id: Math.random().toString(36).substr(2, 9),
        title: inputValue,
        createdAt: Date.now(),
        subTasks: subTaskDrafts.map(st => ({
          ...st,
          id: Math.random().toString(36).substr(2, 9),
          isCompleted: false
        }))
      };
      onAddTask(newTask);
      setInputValue('');
    } finally {
      setIsDecomposing(false);
    }
  };

  const difficultyLabel = (d: Difficulty) => {
    switch(d) {
      case Difficulty.EASY: return <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-md font-bold">簡單</span>;
      case Difficulty.MEDIUM: return <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-md font-bold">中等</span>;
      case Difficulty.HARD: return <span className="text-[10px] px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded-md font-bold">困難</span>;
    }
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      {/* Input Section */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100">
        <h2 className="text-lg font-bold text-emerald-900 mb-3">播下人生清單的種子</h2>
        <div className="flex gap-2">
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="輸入你想完成的事... (例如：學會煮拉麵)"
            className="flex-1 bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-3 text-black placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button 
            onClick={handleAddTask}
            disabled={isDecomposing || !inputValue.trim()}
            className="bg-emerald-600 text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {isDecomposing ? <Loader2 className="animate-spin" size={24} /> : <Plus size={24} />}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2 italic">有果 AI 將為你細分難度並轉化為經驗點數</p>
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-4">
        {tasks.length === 0 ? (
          <div className="text-center py-20 text-slate-300">
            <ClipboardList size={48} className="mx-auto mb-2 opacity-20" />
            <p>還沒有任務，快來寫下你的目標吧！</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 flex justify-between items-center">
                <span className="font-bold text-emerald-800">{task.title}</span>
                <span className="text-[10px] text-emerald-600 bg-white px-2 py-0.5 rounded-full border border-emerald-100">人生種子</span>
              </div>
              <div className="p-2">
                {task.subTasks.map(sub => (
                  <button 
                    key={sub.id}
                    onClick={() => !sub.isCompleted && onCompleteSubTask(task.id, sub.id)}
                    className={`w-full flex items-center gap-3 p-3 text-left transition-colors rounded-xl ${sub.isCompleted ? 'bg-slate-50' : 'hover:bg-emerald-50/30'}`}
                  >
                    <div className={sub.isCompleted ? 'text-emerald-500' : 'text-slate-300'}>
                      {sub.isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        {difficultyLabel(sub.difficulty)}
                        <span className={`text-xs font-bold ${sub.isCompleted ? 'text-slate-400' : 'text-amber-600'}`}>+{sub.points} pts</span>
                      </div>
                      <p className={`text-sm ${sub.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {sub.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskView;
