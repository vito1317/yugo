import React, { useState, useMemo } from 'react';
import { db } from '../services/database';
import { UserRole, UserStatus, GlobalData } from '../types';
import { 
  Shield, Users, Ban, CheckCircle, UserPlus, 
  AlertTriangle, Search, Mail, ClipboardCheck, 
  Wheat, TrendingUp, Zap, BarChart3
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<GlobalData>(db.getGlobalData());
  const [searchTerm, setSearchTerm] = useState('');

  const refreshData = () => {
    setData({ ...db.getGlobalData() });
  };

  const handleToggleStatus = async (userId: string, currentStatus: UserStatus) => {
    const newStatus = currentStatus === UserStatus.ACTIVE ? UserStatus.BANNED : UserStatus.ACTIVE;
    await db.setStatus(userId, newStatus);
    refreshData();
  };

  const handleToggleRole = async (userId: string, currentRole: UserRole) => {
    const newRole = currentRole === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
    await db.setRole(userId, newRole);
    refreshData();
  };

  // 全局統計計算
  const systemStats = useMemo(() => {
    const totalPoints = data.users.reduce((acc, u) => acc + u.points, 0);
    const totalSubTasks = data.tasks.reduce((acc, t) => acc + t.subTasks.length, 0);
    // Fixed: Explicitly typed 'state' as 'any' to avoid 'unknown' property access error on line 36
    const totalProduce = Object.values(data.farmStates).reduce((acc: number, state: any) => {
      return acc + (state.produce?.reduce((pAcc: number, p: any) => pAcc + (p.quantity || 0), 0) || 0);
    }, 0);

    return { totalPoints, totalSubTasks, totalProduce };
  }, [data]);

  const filteredUsers = data.users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 偵測異常原因
  const getSuspiciousReason = (userId: string, points: number) => {
    const userTasks = data.tasks.filter(t => t.userId === userId);
    const completedCount = userTasks.reduce((acc, t) => acc + t.subTasks.filter(st => st.isCompleted).length, 0);
    
    if (points > 3000) return "極高點數 (溢出)";
    if (points > 500 && completedCount === 0) return "無任務異常獲點";
    if (points > 1000 && completedCount < 3) return "點數/任務比例失衡";
    return null;
  };

  const getUserStats = (userId: string) => {
    const tasks = data.tasks.filter(t => t.userId === userId);
    const completedSubTasks = tasks.reduce((acc, t) => acc + t.subTasks.filter(st => st.isCompleted).length, 0);
    const farmState = data.farmStates[userId] || { produce: [] };
    const totalProduce = farmState.produce?.reduce((acc: number, p: any) => acc + (p.quantity || 0), 0) || 0;
    
    return {
      taskCount: tasks.length,
      subTaskCompleted: completedSubTasks,
      produceCount: totalProduce
    };
  };

  return (
    <div className="p-4 bg-slate-50 min-h-screen pb-24">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="text-emerald-600" size={26} />
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">後台管理中心</h1>
        </div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">YUGO ADMIN SYSTEM · SECURE ACCESS</p>
      </div>

      {/* Global Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <TrendingUp size={16} className="text-amber-500 mb-2" />
          <div className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">流通總點數</div>
          <div className="text-lg font-black text-slate-800">{systemStats.totalPoints.toLocaleString()}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <Zap size={16} className="text-emerald-500 mb-2" />
          <div className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">總任務數量</div>
          <div className="text-lg font-black text-slate-800">{systemStats.totalSubTasks}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <Wheat size={16} className="text-indigo-500 mb-2" />
          <div className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">總收成數量</div>
          <div className="text-lg font-black text-slate-800">{systemStats.totalProduce}</div>
        </div>
      </div>

      {/* Search Section */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="搜尋 Email 或用戶名稱..."
          className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm text-black font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* User List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2 mb-2">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">用戶列表 ({filteredUsers.length})</h2>
          <BarChart3 size={14} className="text-slate-300" />
        </div>

        {filteredUsers.map(user => {
          const stats = getUserStats(user.id);
          const suspiciousReason = getSuspiciousReason(user.id, user.points);
          
          return (
            <div key={user.id} className={`bg-white p-5 rounded-3xl border transition-all shadow-sm ${suspiciousReason ? 'border-rose-300 ring-4 ring-rose-50' : 'border-slate-100'}`}>
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={user.picture} className="w-14 h-14 rounded-2xl border-2 border-slate-50 shadow-sm object-cover bg-slate-100" alt="" />
                    {user.status === UserStatus.BANNED && (
                      <div className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-1 border-2 border-white shadow-sm">
                        <Ban size={10} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-base flex items-center gap-2">
                      {user.name}
                      {user.role === UserRole.ADMIN && (
                        <span className="text-[8px] bg-indigo-600 text-white px-1.5 py-0.5 rounded uppercase font-black tracking-tighter shadow-sm">ADMIN</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                      <Mail size={12} className="opacity-40" /> {user.email}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-black font-mono tracking-tighter ${suspiciousReason ? 'text-rose-600' : 'text-slate-900'}`}>
                    ✨ {user.points}
                  </div>
                  {suspiciousReason && (
                    <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-rose-100 text-rose-600 rounded text-[9px] font-black uppercase animate-pulse">
                      <AlertTriangle size={10} /> {suspiciousReason}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Visualizer */}
              <div className="flex gap-2 mb-6">
                <div className="flex-1 bg-slate-50 p-2 rounded-xl flex items-center gap-2 border border-slate-100">
                  <ClipboardCheck size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-600">完成 {stats.subTaskCompleted} 任務</span>
                </div>
                <div className="flex-1 bg-slate-50 p-2 rounded-xl flex items-center gap-2 border border-slate-100">
                  <Wheat size={14} className="text-amber-500" />
                  <span className="text-[10px] font-bold text-slate-600">收成 {stats.produceCount} 蔬果</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex gap-2">
                <button 
                  onClick={() => handleToggleStatus(user.id, user.status)}
                  className={`flex-[3] py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    user.status === UserStatus.ACTIVE 
                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                    : 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                  }`}
                >
                  {user.status === UserStatus.ACTIVE ? <Ban size={14} /> : <CheckCircle size={14} />}
                  {user.status === UserStatus.ACTIVE ? '停權該用戶' : '恢復用戶權限'}
                </button>
                
                <button 
                  onClick={() => handleToggleRole(user.id, user.role)}
                  className={`flex-1 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    user.role === UserRole.ADMIN 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="變更用戶權限"
                >
                  <UserPlus size={14} />
                  {user.role === UserRole.ADMIN ? '降級' : '設為管理員'}
                </button>
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold text-sm">查無符合條件的用戶資料</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;