
import React, { useState } from 'react';
import { Package, Truck, Info, CheckCircle, MapPin, Phone, User as UserIcon, Trash2, AlertTriangle, LogOut, History, Calendar, Quote } from 'lucide-react';
import { ProduceItem, CSAFormData, HarvestLog, UserProfile } from '../types';
import { SEEDS, EXCHANGE_REQUIREMENT } from '../constants';

interface ProfileViewProps {
  user: UserProfile | null;
  produce: ProduceItem[];
  harvestHistory: HarvestLog[];
  onExchange: (data: CSAFormData) => void;
  onReset: () => void;
  onLogout: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, produce, harvestHistory, onExchange, onReset, onLogout }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CSAFormData>({ name: '', phone: '', address: '' });
  const [submitted, setSubmitted] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const totalProduceCount = produce.reduce((acc, curr) => acc + curr.quantity, 0);
  const canExchange = totalProduceCount >= EXCHANGE_REQUIREMENT;
  const progress = Math.min((totalProduceCount / EXCHANGE_REQUIREMENT) * 100, 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) return;
    onExchange(formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
    }, 3000);
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
  };

  if (submitted) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-2xl font-bold text-emerald-900 mb-2">兌換申請已提交</h2>
        <p className="text-slate-500">我們已收到您的資訊，<br/>產季成熟時將為您配送最新鮮的蔬果！</p>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-6">
      {/* User Info Header */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm flex items-center gap-4">
        <img src={user?.picture} className="w-16 h-16 rounded-2xl border-2 border-emerald-50" alt="" />
        <div className="flex-1">
          <h2 className="text-xl font-black text-slate-800">{user?.name}</h2>
          <p className="text-xs text-slate-400 font-medium">{user?.email}</p>
        </div>
        <button onClick={onLogout} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
          <LogOut size={20} />
        </button>
      </div>

      {/* CSA Redemption Section */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
            <Package size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">實體蔬果兌換 (CSA)</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Redeem Real Produce</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-slate-500">收成箱進度</span>
            <span className="text-emerald-600 font-black">{totalProduceCount} / {EXCHANGE_REQUIREMENT} 單位</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4 shadow-inner">
            <div 
              className="h-full bg-emerald-500 transition-all duration-1000 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {produce.map(item => {
              const seed = SEEDS.find(s => s.id === item.seedId);
              return (
                <div key={item.seedId} className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                  <span className="text-lg">{seed?.icon}</span>
                  <span className="text-xs font-black text-emerald-800">x{item.quantity}</span>
                </div>
              );
            })}
            {produce.length === 0 && <span className="text-xs text-slate-300 italic py-2">目前尚無庫存，快去農場播種吧！</span>}
          </div>
        </div>

        {!showForm ? (
          <button 
            disabled={!canExchange}
            onClick={() => setShowForm(true)}
            className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all ${
              canExchange ? 'bg-amber-500 text-white shadow-lg active:scale-95' : 'bg-slate-100 text-slate-300'
            }`}
          >
            <Truck size={24} /> 兌換實體蔬果箱
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-top duration-300">
            <input required type="text" placeholder="收件人姓名" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-black font-bold focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input required type="tel" placeholder="聯絡電話" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-black font-bold focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <textarea required placeholder="配送地址" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[80px] text-black font-bold focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold">取消</button>
              <button type="submit" className="flex-[2] py-3 bg-emerald-600 text-white rounded-xl font-black shadow-lg">確認提交</button>
            </div>
          </form>
        )}
      </div>

      {/* Harvest History / Results Wall */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <History size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">有果誌</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Growth Record</p>
            </div>
          </div>
          <div className="text-[10px] font-black bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full uppercase tracking-tighter">
            Total: {harvestHistory.length}
          </div>
        </div>

        <div className="space-y-4">
          {harvestHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-300">
              <Quote className="mx-auto mb-2 opacity-20" size={32} />
              <p className="text-sm font-medium">尚未有收成紀錄，<br/>每一分努力都會在未來留下痕跡。</p>
            </div>
          ) : (
            harvestHistory.slice().reverse().map(log => (
              <div key={log.id} className="group p-4 bg-[#FBFCFA] rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{log.icon}</span>
                    <span className="font-black text-slate-700">{log.cropName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <Calendar size={12} /> {formatDate(log.timestamp)}
                  </div>
                </div>
                <div className="relative pl-6">
                  <Quote className="absolute left-0 top-0 text-emerald-100" size={16} />
                  <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
                    {log.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reset Section */}
      <div className="mt-4 pt-6 text-center">
        <button 
          onClick={() => {
            if(confirmReset) { onReset(); }
            else { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 3000); }
          }}
          className={`flex items-center justify-center gap-2 mx-auto px-6 py-3 rounded-2xl font-bold transition-all ${
            confirmReset ? 'bg-rose-600 text-white shadow-lg' : 'text-rose-400 hover:text-rose-600 text-xs'
          }`}
        >
          {confirmReset ? <AlertTriangle size={16} /> : <Trash2 size={16} />}
          {confirmReset ? '確認清除所有資料' : '清除快取並重置'}
        </button>
      </div>
    </div>
  );
};

export default ProfileView;
