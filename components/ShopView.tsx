
import React from 'react';
import { SEEDS } from '../constants';
import { ShoppingBasket } from 'lucide-react';

interface ShopViewProps {
  points: number;
  onBuy: (seedId: string) => void;
}

const ShopView: React.FC<ShopViewProps> = ({ points, onBuy }) => {
  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">當前可用點數</div>
          <div className="text-4xl font-black mb-4">✨ {points}</div>
          <p className="text-xs text-emerald-100/80 leading-relaxed">
            透過完成人生清單獲得的每一分努力，<br/>
            都能在此兌換成希望的種子。
          </p>
        </div>
        <div className="absolute -bottom-6 -right-6 text-white/10 rotate-12">
          <ShoppingBasket size={120} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {SEEDS.map(seed => (
          <div key={seed.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center text-4xl shadow-inner">
              {seed.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800">{seed.name}</h3>
              <p className="text-xs text-slate-400">成長週期：需澆水 {seed.growthSteps} 次</p>
              <div className="text-emerald-600 font-bold mt-1">{seed.price} pts</div>
            </div>
            <button 
              onClick={() => onBuy(seed.id)}
              disabled={points < seed.price}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                points >= seed.price 
                  ? 'bg-emerald-600 text-white shadow-md active:scale-95' 
                  : 'bg-slate-100 text-slate-300'
              }`}
            >
              購買
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopView;
