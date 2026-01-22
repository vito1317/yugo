
import React, { useState } from 'react';
import { CloudRain, Sprout, ShoppingCart, Loader2, Sparkles, X } from 'lucide-react';
import { PlantedCrop, GrowthStage, SeedType, InventoryItem } from '../types';
import { SEEDS, WATERING_COST } from '../constants';
import { getHarvestMessage } from '../services/geminiService';

interface FarmViewProps {
  plots: (PlantedCrop | null)[];
  inventory: InventoryItem[];
  points: number;
  onPlant: (plotIndex: number, seedId: string) => void;
  onWater: (plotIndex: number) => void;
  onHarvest: (plotIndex: number) => void;
  onGoToShop: () => void;
}

const FarmView: React.FC<FarmViewProps> = ({ plots, inventory, points, onPlant, onWater, onHarvest, onGoToShop }) => {
  const [selectedPlot, setSelectedPlot] = useState<number | null>(null);
  const [celebration, setCelebration] = useState<{ isOpen: boolean; cropName: string; icon: string; message: string; loading: boolean }>({
    isOpen: false,
    cropName: '',
    icon: '',
    message: '',
    loading: false
  });

  const getSeedInfo = (seedId: string) => SEEDS.find(s => s.id === seedId);

  const handleHarvestClick = async (index: number, plot: PlantedCrop) => {
    const seed = getSeedInfo(plot.seedId);
    if (!seed) return;

    setCelebration({ isOpen: true, cropName: seed.name, icon: seed.icon, message: '', loading: true });
    
    try {
      const wisdom = await getHarvestMessage(seed.name);
      setCelebration(prev => ({ ...prev, message: wisdom, loading: false }));
      onHarvest(index);
    } catch (e) {
      setCelebration(prev => ({ ...prev, message: '誠實的努力，終會結出最甜美的果實。', loading: false }));
      onHarvest(index);
    }
  };

  const renderPlotContent = (plot: PlantedCrop | null, index: number) => {
    if (!plot) {
      return (
        <div 
          onClick={() => setSelectedPlot(index)}
          className="w-full h-full flex flex-col items-center justify-center bg-amber-100/30 rounded-2xl border-2 border-dashed border-amber-200 cursor-pointer hover:bg-amber-100/50 transition-colors"
        >
          <div className="text-amber-300 mb-1 font-bold text-2xl">+</div>
          <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest">點擊播種</span>
        </div>
      );
    }

    const seed = getSeedInfo(plot.seedId);
    if (!seed) return null;

    const isHarvestable = plot.stage === GrowthStage.HARVESTABLE;
    const canAffordWater = points >= WATERING_COST;

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-amber-50 rounded-2xl border border-amber-200 overflow-hidden shadow-sm">
        <div className={`mb-1 transition-transform duration-500 ${isHarvestable ? 'text-4xl animate-bounce' : 'text-3xl'}`}>
          {plot.stage === GrowthStage.SEED && '🕳️'}
          {plot.stage === GrowthStage.SPROUT && '🌱'}
          {plot.stage === GrowthStage.GROWING && '🌿'}
          {plot.stage === GrowthStage.MATURE && '🌳'}
          {plot.stage === GrowthStage.HARVESTABLE && seed.icon}
        </div>
        
        <div className="text-[9px] font-black text-amber-800 mb-1">{seed.name}</div>
        
        {!isHarvestable && (
          <div className="w-10 h-1 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-400 transition-all duration-500" 
              style={{ width: `${(plot.waterCount / seed.growthSteps) * 100}%` }}
            />
          </div>
        )}

        <div className="absolute inset-0 bg-emerald-900/5 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[1px]">
          {isHarvestable ? (
            <button 
              onClick={(e) => { e.stopPropagation(); handleHarvestClick(index, plot); }}
              className="bg-amber-500 text-white p-2.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
            >
              <Sparkles size={22} />
            </button>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <button 
                onClick={(e) => { e.stopPropagation(); if(canAffordWater) onWater(index); }}
                disabled={!canAffordWater}
                className={`p-2.5 rounded-full shadow-lg transition-all ${
                  canAffordWater ? 'bg-blue-500 text-white hover:scale-110 active:scale-95' : 'bg-slate-300 text-slate-100 cursor-not-allowed'
                }`}
              >
                <CloudRain size={20} />
              </button>
              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${canAffordWater ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-400'}`}>
                -{WATERING_COST} PTS
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 flex flex-col gap-6 h-full bg-[#FBFCFA]">
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-emerald-100 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
        <h2 className="text-xl font-black text-emerald-900 mb-1">我的有果農場</h2>
        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">My Yugo Farm</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {plots.map((plot, idx) => (
          <div key={idx} className="aspect-square">
            {renderPlotContent(plot, idx)}
          </div>
        ))}
      </div>

      {/* Celebration Modal */}
      {celebration.isOpen && (
        <div className="fixed inset-0 bg-emerald-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 text-center shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setCelebration({ ...celebration, isOpen: false })}
              className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 animate-ping bg-amber-100 rounded-full opacity-20"></div>
                <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center text-6xl shadow-inner relative z-10">
                  {celebration.icon}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">收成成功！</h3>
                <p className="text-emerald-600 font-bold text-sm">你獲得了 1 份高品質{celebration.cropName}</p>
              </div>

              <div className="w-full h-px bg-slate-100"></div>

              <div className="min-h-[60px] flex items-center justify-center italic">
                {celebration.loading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-emerald-500" size={24} />
                    <span className="text-[10px] text-slate-400 font-bold">正在讀取大地的智慧...</span>
                  </div>
                ) : (
                  <p className="text-slate-600 text-sm font-medium leading-relaxed px-4">
                    「 {celebration.message} 」
                  </p>
                )}
              </div>

              <button 
                onClick={() => setCelebration({ ...celebration, isOpen: false })}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
              >
                感謝收獲，繼續努力
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedPlot !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="w-full max-w-[480px] bg-white rounded-t-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-800">選擇種子播種</h3>
              <button onClick={() => setSelectedPlot(null)} className="text-slate-300 hover:text-slate-500"><X size={24} /></button>
            </div>
            
            {inventory.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center gap-6">
                <p className="text-slate-400 font-bold text-sm">倉庫空空如也，去商店看看吧！</p>
                <button 
                  onClick={() => { setSelectedPlot(null); onGoToShop(); }}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-2xl flex items-center gap-2 font-black text-sm shadow-lg"
                >
                  <ShoppingCart size={18} /> 前往商店
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {inventory.map(item => {
                  const seed = getSeedInfo(item.seedId);
                  if (!seed) return null;
                  return (
                    <button 
                      key={item.seedId}
                      onClick={() => { onPlant(selectedPlot, item.seedId); setSelectedPlot(null); }}
                      className="flex items-center gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                    >
                      <span className="text-3xl group-hover:scale-110 transition-transform">{seed.icon}</span>
                      <div className="text-left">
                        <div className="font-black text-emerald-900 text-sm">{seed.name}</div>
                        <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">存貨: {item.quantity}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmView;
