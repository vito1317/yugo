
import { GlobalData, UserProfile, UserRole, UserStatus, LifeTask, HarvestLog } from '../types';

const DB_KEY = 'youguo_v05_database';

// 預設管理員
const ADMIN_EMAIL = 'melan0choly@gmail.com';

class AppDatabase {
  private data: GlobalData;

  constructor() {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) {
      this.data = JSON.parse(saved);
    } else {
      this.data = {
        users: [],
        tasks: [],
        farmStates: {},
        harvestHistory: {}
      };
      this.save();
    }
  }

  private save() {
    localStorage.setItem(DB_KEY, JSON.stringify(this.data));
  }

  // --- 用戶驗證與同步 ---
  async syncUser(profile: any): Promise<UserProfile> {
    let user = this.data.users.find(u => u.email === profile.email);
    
    if (!user) {
      // 首次登入
      user = {
        id: Math.random().toString(36).substr(2, 9),
        name: profile.name,
        email: profile.email,
        picture: profile.picture,
        role: profile.email === ADMIN_EMAIL ? UserRole.ADMIN : UserRole.USER,
        status: UserStatus.ACTIVE,
        points: 100,
        joinedAt: Date.now()
      };
      this.data.users.push(user);
      this.data.farmStates[user.id] = {
        plots: new Array(6).fill(null),
        inventory: [],
        produce: []
      };
      this.data.harvestHistory[user.id] = [];
      this.save();
    } else {
      user.name = profile.name;
      user.picture = profile.picture;
      this.save();
    }

    return user;
  }

  // --- 隔離的數據存取 ---
  async getTasks(userId: string): Promise<LifeTask[]> {
    return this.data.tasks.filter(t => t.userId === userId);
  }

  async addTask(userId: string, task: Omit<LifeTask, 'userId'>) {
    this.data.tasks.push({ ...task, userId });
    this.save();
  }

  async updateTask(userId: string, updatedTask: LifeTask) {
    const idx = this.data.tasks.findIndex(t => t.id === updatedTask.id && t.userId === userId);
    if (idx !== -1) {
      this.data.tasks[idx] = updatedTask;
      this.save();
    }
  }

  async getFarmState(userId: string) {
    return this.data.farmStates[userId] || { plots: new Array(6).fill(null), inventory: [], produce: [] };
  }

  async saveFarmState(userId: string, state: any) {
    this.data.farmStates[userId] = state;
    this.save();
  }

  async getHarvestHistory(userId: string): Promise<HarvestLog[]> {
    return this.data.harvestHistory[userId] || [];
  }

  async saveHarvestHistory(userId: string, history: HarvestLog[]) {
    this.data.harvestHistory[userId] = history;
    this.save();
  }

  async updateUserPoints(userId: string, points: number) {
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      user.points = points;
      this.save();
    }
  }

  // --- 管理員操作 ---
  getGlobalData(): GlobalData {
    return this.data;
  }

  async setStatus(userId: string, status: UserStatus) {
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      user.status = status;
      this.save();
    }
  }

  async setRole(userId: string, role: UserRole) {
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      user.role = role;
      this.save();
    }
  }
}

export const db = new AppDatabase();
