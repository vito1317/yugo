
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import TaskView from './components/TaskView';
import FarmView from './components/FarmView';
import ShopView from './components/ShopView';
import ProfileView from './components/ProfileView';
import LoginView from './components/LoginView';
import AdminDashboard from './components/AdminDashboard';
import { db } from './services/database';
import { LifeTask, PlantedCrop, GrowthStage, InventoryItem, ProduceItem, CSAFormData, UserProfile, UserRole, HarvestLog } from './types';
import { SEEDS, WATERING_COST } from './constants';
import { getHarvestMessage } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 業務數據
  const [points, setPoints] = useState<number>(100);
  const [tasks, setTasks] = useState<LifeTask[]>([]);
  const [plots, setPlots] = useState<(PlantedCrop | null)[]>(new Array(6).fill(null));
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [produce, setProduce] = useState<ProduceItem[]>([]);
  const [harvestHistory, setHarvestHistory] = useState<HarvestLog[]>([]);

  // 1. 初始化與同步數據
  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('youguo_session');
      if (savedUser) {
        try {
          const profile = JSON.parse(savedUser);
          const freshProfile = await db.syncUser(profile);
          setUser(freshProfile);
          await loadUserData(freshProfile.id);
        } catch (e) {
          localStorage.removeItem('youguo_session');
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const loadUserData = async (userId: string) => {
    const [userTasks, farmState, history] = await Promise.all([
      db.getTasks(userId),
      db.getFarmState(userId),
      db.getHarvestHistory(userId)
    ]);
    
    setTasks(userTasks);
    setPlots(farmState.plots);
    setInventory(farmState.inventory);
    setProduce(farmState.produce);
    setHarvestHistory(history);
    
    const currentUser = db.getGlobalData().users.find(u => u.id === userId);
    if (currentUser) setPoints(currentUser.points);
  };

  // 2. 登入/登出
  const handleLogin = async (googleProfile: any) => {
    try {
      const profile = await db.syncUser(googleProfile);
      localStorage.setItem('youguo_session', JSON.stringify(googleProfile));
      setUser(profile);
      await loadUserData(profile.id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('youguo_session');
    setUser(null);
  };

  // 3. 自動儲存機制
  useEffect(() => {
    if (user) {
      db.saveFarmState(user.id, { plots, inventory, produce });
      db.updateUserPoints(user.id, points);
      db.saveHarvestHistory(user.id, harvestHistory);
    }
  }, [plots, inventory, produce, points, harvestHistory, user]);

  // --- 業務處理函式 ---
  const handleAddTask = async (newTask: Omit<LifeTask, 'userId'>) => {
    if (!user) return;
    await db.addTask(user.id, newTask);
    setTasks([newTask as LifeTask, ...tasks]);
  };

  const handleCompleteSubTask = async (taskId: string, subTaskId: string) => {
    if (!user) return;
    let earned = 0;
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        const updated = {
          ...t,
          subTasks: t.subTasks.map(st => {
            if (st.id === subTaskId && !st.isCompleted) {
              earned = st.points;
              return { ...st, isCompleted: true };
            }
            return st;
          })
        };
        db.updateTask(user.id, updated);
        return updated;
      }
      return t;
    });
    setTasks(updatedTasks);
    if (earned > 0) setPoints(prev => prev + earned);
  };

  const handleBuySeed = (seedId: string) => {
    const seed = SEEDS.find(s => s.id === seedId);
    if (!seed || points < seed.price) return;
    setPoints(prev => prev - seed.price);
    const updatedInv = [...inventory];
    const idx = updatedInv.findIndex(i => i.seedId === seedId);
    if (idx >= 0) updatedInv[idx].quantity += 1;
    else updatedInv.push({ seedId, quantity: 1 });
    setInventory(updatedInv);
  };

  const handlePlant = (plotIndex: number, seedId: string) => {
    const invIdx = inventory.findIndex(i => i.seedId === seedId);
    if (invIdx < 0 || inventory[invIdx].quantity <= 0) return;
    const newPlots = [...plots];
    newPlots[plotIndex] = { 
      id: Math.random().toString(36).substr(2, 9), 
      seedId, stage: GrowthStage.SEED, waterCount: 0, lastWatered: Date.now() 
    };
    setPlots(newPlots);
    const updatedInv = [...inventory];
    updatedInv[invIdx].quantity -= 1;
    setInventory(updatedInv.filter(i => i.quantity > 0));
  };

  const handleWater = (plotIndex: number) => {
    if (points < WATERING_COST) return;
    const plot = plots[plotIndex];
    if (!plot) return;
    const seed = SEEDS.find(s => s.id === plot.seedId);
    if (!seed) return;
    const newPlots = [...plots];
    const updatedPlot = { ...plot, waterCount: plot.waterCount + 1 };
    if (updatedPlot.waterCount >= seed.growthSteps) {
      updatedPlot.stage = Math.min(updatedPlot.stage + 1, GrowthStage.HARVESTABLE);
      updatedPlot.waterCount = 0;
    }
    newPlots[plotIndex] = updatedPlot;
    setPlots(newPlots);
    setPoints(prev => prev - WATERING_COST);
  };

  const handleHarvest = async (plotIndex: number) => {
    const plot = plots[plotIndex];
    if (!plot || plot.stage !== GrowthStage.HARVESTABLE) return;
    const seed = SEEDS.find(s => s.id === plot.seedId);
    if (!seed) return;

    // 獲取 AI 語錄並記錄歷史
    const wisdom = await getHarvestMessage(seed.name);
    const log: HarvestLog = {
      id: Math.random().toString(36).substr(2, 9),
      cropId: seed.id,
      cropName: seed.name,
      icon: seed.icon,
      message: wisdom,
      timestamp: Date.now()
    };
    setHarvestHistory(prev => [...prev, log]);

    const newProduce = [...produce];
    const pIdx = newProduce.findIndex(p => p.seedId === plot.seedId);
    if (pIdx >= 0) newProduce[pIdx].quantity += seed.harvestAmount;
    else newProduce.push({ seedId: plot.seedId, quantity: seed.harvestAmount });
    setProduce(newProduce);

    const newPlots = [...plots];
    newPlots[plotIndex] = null;
    setPlots(newPlots);
  };

  const handleExchange = (data: CSAFormData) => {
    setProduce([]);
  };

  const handleResetAllData = () => {
    localStorage.clear();
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#FBFCFA] text-emerald-600 font-black">
        <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center animate-bounce mb-4">果</div>
        正在同步雲端進度...
      </div>
    );
  }

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      points={points} 
      isAdmin={user.role === UserRole.ADMIN}
    >
      {activeTab === 'tasks' && (
        <TaskView tasks={tasks} onAddTask={handleAddTask} onCompleteSubTask={handleCompleteSubTask} />
      )}
      {activeTab === 'farm' && (
        <FarmView 
          plots={plots} inventory={inventory} points={points}
          onPlant={handlePlant} onWater={handleWater} onHarvest={handleHarvest}
          onGoToShop={() => setActiveTab('shop')}
        />
      )}
      {activeTab === 'shop' && <ShopView points={points} onBuy={handleBuySeed} />}
      {activeTab === 'profile' && (
        <ProfileView 
          user={user} produce={produce} harvestHistory={harvestHistory}
          onExchange={handleExchange} onReset={handleResetAllData} onLogout={handleLogout}
        />
      )}
      {activeTab === 'admin' && user.role === UserRole.ADMIN && (
        <AdminDashboard />
      )}
    </Layout>
  );
};

export default App;
