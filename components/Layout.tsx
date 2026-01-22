
import React from 'react';
import { ClipboardList, TreePine, ShoppingBag, User as UserIcon, ShieldCheck } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  points: number;
  isAdmin?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, points, isAdmin }) => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-emerald-50/30">
      {/* Header */}
      <header className="p-4 bg-white border-b border-emerald-100 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xl rotate-3">
            果
          </div>
          <h1 className="text-xl font-bold text-emerald-900">有果</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
            <span className="text-amber-600 text-xs font-black">✨ {points}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t border-emerald-100 flex justify-around py-3 px-2 shadow-lg z-40">
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'tasks' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <ClipboardList size={22} />
          <span className="text-[10px] font-bold">清單</span>
        </button>
        <button 
          onClick={() => setActiveTab('farm')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'farm' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <TreePine size={22} />
          <span className="text-[10px] font-bold">農場</span>
        </button>
        <button 
          onClick={() => setActiveTab('shop')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'shop' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <ShoppingBag size={22} />
          <span className="text-[10px] font-bold">商店</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <UserIcon size={22} />
          <span className="text-[10px] font-bold">兌換</span>
        </button>
        {isAdmin && (
          <button 
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'admin' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <ShieldCheck size={22} />
            <span className="text-[10px] font-bold">後台</span>
          </button>
        )}
      </nav>
    </div>
  );
};

export default Layout;
