/**
 * 工程管理服務層 (ConstructionService.js)
 * 處理工程進度、里程碑、任務、日報告
 */

// ============================================
// 常量定義
// ============================================

export const CONSTRUCTION_STATUS = {
    PLANNING: 'planning',
    IN_PROGRESS: 'in_progress',
    ON_HOLD: 'on_hold',
    COMPLETED: 'completed',
    DELAYED: 'delayed'
};

export const CONSTRUCTION_STATUS_LABELS = {
    [CONSTRUCTION_STATUS.PLANNING]: '規劃中',
    [CONSTRUCTION_STATUS.IN_PROGRESS]: '進行中',
    [CONSTRUCTION_STATUS.ON_HOLD]: '暫停',
    [CONSTRUCTION_STATUS.COMPLETED]: '已完工',
    [CONSTRUCTION_STATUS.DELAYED]: '延遲'
};

export const CONSTRUCTION_STATUS_COLORS = {
    [CONSTRUCTION_STATUS.PLANNING]: 'bg-blue-100 text-blue-700',
    [CONSTRUCTION_STATUS.IN_PROGRESS]: 'bg-green-100 text-green-700',
    [CONSTRUCTION_STATUS.ON_HOLD]: 'bg-yellow-100 text-yellow-700',
    [CONSTRUCTION_STATUS.COMPLETED]: 'bg-gray-100 text-gray-700',
    [CONSTRUCTION_STATUS.DELAYED]: 'bg-red-100 text-red-700'
};

export const TASK_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    BLOCKED: 'blocked'
};

export const TASK_STATUS_LABELS = {
    [TASK_STATUS.PENDING]: '待執行',
    [TASK_STATUS.IN_PROGRESS]: '進行中',
    [TASK_STATUS.COMPLETED]: '已完成',
    [TASK_STATUS.BLOCKED]: '阻擋中'
};

export const TASK_PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
};

export const TASK_PRIORITY_LABELS = {
    [TASK_PRIORITY.LOW]: '低',
    [TASK_PRIORITY.MEDIUM]: '中',
    [TASK_PRIORITY.HIGH]: '高',
    [TASK_PRIORITY.URGENT]: '緊急'
};

export const TASK_PRIORITY_COLORS = {
    [TASK_PRIORITY.LOW]: 'bg-gray-100 text-gray-600',
    [TASK_PRIORITY.MEDIUM]: 'bg-blue-100 text-blue-600',
    [TASK_PRIORITY.HIGH]: 'bg-orange-100 text-orange-600',
    [TASK_PRIORITY.URGENT]: 'bg-red-100 text-red-600'
};

// ============================================
// Mock 資料
// ============================================

const mockConstructions = [
    {
        id: 'const-001',
        projectId: 'proj-001',
        projectName: '信義區林公館',
        clientName: '林先生',
        status: CONSTRUCTION_STATUS.IN_PROGRESS,
        progress: 65,
        startDate: '2026-01-10',
        endDate: '2026-03-31',
        manager: '陳工程師',
        location: '台北市信義區松智路1號',
        budget: 2500000,
        actualCost: 1625000,
        milestones: [
            { id: 'm1', name: '拆除完成', dueDate: '2026-01-20', completedDate: '2026-01-18', completed: true },
            { id: 'm2', name: '水電管線', dueDate: '2026-02-10', completedDate: null, completed: false },
            { id: 'm3', name: '泥作完成', dueDate: '2026-02-28', completedDate: null, completed: false },
            { id: 'm4', name: '油漆完工', dueDate: '2026-03-15', completedDate: null, completed: false },
            { id: 'm5', name: '驗收交屋', dueDate: '2026-03-31', completedDate: null, completed: false }
        ],
        tasks: [
            { id: 't1', name: '拆除舊裝潢', status: TASK_STATUS.COMPLETED, priority: TASK_PRIORITY.HIGH, assignee: '王師傅', startDate: '2026-01-10', endDate: '2026-01-18', progress: 100 },
            { id: 't2', name: '水管配置', status: TASK_STATUS.IN_PROGRESS, priority: TASK_PRIORITY.HIGH, assignee: '李師傅', startDate: '2026-01-20', endDate: '2026-02-05', progress: 60 },
            { id: 't3', name: '電線佈置', status: TASK_STATUS.IN_PROGRESS, priority: TASK_PRIORITY.HIGH, assignee: '張師傅', startDate: '2026-01-22', endDate: '2026-02-08', progress: 45 },
            { id: 't4', name: '泥作隔間', status: TASK_STATUS.PENDING, priority: TASK_PRIORITY.MEDIUM, assignee: '陳師傅', startDate: '2026-02-10', endDate: '2026-02-25', progress: 0 },
            { id: 't5', name: '地板鋪設', status: TASK_STATUS.PENDING, priority: TASK_PRIORITY.MEDIUM, assignee: '林師傅', startDate: '2026-02-26', endDate: '2026-03-05', progress: 0 },
            { id: 't6', name: '油漆粉刷', status: TASK_STATUS.PENDING, priority: TASK_PRIORITY.MEDIUM, assignee: '吳師傅', startDate: '2026-03-06', endDate: '2026-03-15', progress: 0 }
        ],
        dailyReports: [
            { id: 'dr1', date: '2026-01-17', weather: '晴', temperature: '18°C', workers: 5, workHours: 8, notes: '完成客廳及主臥拆除工作，明日進行廚房拆除', photos: [] },
            { id: 'dr2', date: '2026-01-16', weather: '多雲', temperature: '16°C', workers: 6, workHours: 8, notes: '開始進行舊裝潢拆除，進度順利', photos: [] },
            { id: 'dr3', date: '2026-01-15', weather: '晴', temperature: '17°C', workers: 3, workHours: 4, notes: '材料進場檢查，確認拆除工具齊全', photos: [] }
        ],
        issues: [
            { id: 'i1', title: '發現漏水管線', status: 'resolved', priority: 'high', createdAt: '2026-01-16', resolvedAt: '2026-01-17' }
        ]
    },
    {
        id: 'const-002',
        projectId: 'proj-002',
        projectName: '大安區王宅翻修',
        clientName: '王小姐',
        status: CONSTRUCTION_STATUS.PLANNING,
        progress: 10,
        startDate: '2026-02-01',
        endDate: '2026-04-15',
        manager: '林工程師',
        location: '台北市大安區復興南路100號',
        budget: 1800000,
        actualCost: 180000,
        milestones: [
            { id: 'm1', name: '設計定稿', dueDate: '2026-01-25', completedDate: null, completed: false },
            { id: 'm2', name: '開工', dueDate: '2026-02-01', completedDate: null, completed: false },
            { id: 'm3', name: '結構完成', dueDate: '2026-03-01', completedDate: null, completed: false },
            { id: 'm4', name: '完工驗收', dueDate: '2026-04-15', completedDate: null, completed: false }
        ],
        tasks: [
            { id: 't1', name: '設計圖確認', status: TASK_STATUS.IN_PROGRESS, priority: TASK_PRIORITY.HIGH, assignee: '設計部', startDate: '2026-01-15', endDate: '2026-01-25', progress: 70 }
        ],
        dailyReports: [],
        issues: []
    },
    {
        id: 'const-003',
        projectId: 'proj-003',
        projectName: '內湖科技園區辦公室',
        clientName: '科技公司',
        status: CONSTRUCTION_STATUS.DELAYED,
        progress: 40,
        startDate: '2025-12-01',
        endDate: '2026-02-28',
        manager: '張工程師',
        location: '台北市內湖區內湖路50號',
        budget: 5000000,
        actualCost: 2200000,
        milestones: [
            { id: 'm1', name: '拆除清空', dueDate: '2025-12-15', completedDate: '2025-12-18', completed: true },
            { id: 'm2', name: '隔間完成', dueDate: '2026-01-10', completedDate: null, completed: false },
            { id: 'm3', name: '機電完成', dueDate: '2026-01-31', completedDate: null, completed: false },
            { id: 'm4', name: '裝潢完成', dueDate: '2026-02-20', completedDate: null, completed: false },
            { id: 'm5', name: '驗收', dueDate: '2026-02-28', completedDate: null, completed: false }
        ],
        tasks: [
            { id: 't1', name: '拆除舊隔間', status: TASK_STATUS.COMPLETED, priority: TASK_PRIORITY.HIGH, assignee: '工班A', startDate: '2025-12-01', endDate: '2025-12-15', progress: 100 },
            { id: 't2', name: '新隔間施作', status: TASK_STATUS.BLOCKED, priority: TASK_PRIORITY.URGENT, assignee: '工班B', startDate: '2025-12-18', endDate: '2026-01-10', progress: 50, blockedReason: '材料延遲到貨' }
        ],
        dailyReports: [
            { id: 'dr1', date: '2026-01-16', weather: '陰', temperature: '14°C', workers: 0, workHours: 0, notes: '因材料未到暫停施工', photos: [] }
        ],
        issues: [
            { id: 'i1', title: '隔間材料延遲', status: 'open', priority: 'urgent', createdAt: '2026-01-10', resolvedAt: null }
        ]
    }
];

// ============================================
// 服務類別
// ============================================

class ConstructionServiceClass {
    constructor() {
        this.constructions = [...mockConstructions];
    }

    // 獲取所有工程
    async getConstructions(filters = {}) {
        await this._delay(300);
        let result = [...this.constructions];

        if (filters.status) {
            result = result.filter(c => c.status === filters.status);
        }
        if (filters.projectId) {
            result = result.filter(c => c.projectId === filters.projectId);
        }
        if (filters.search) {
            const term = filters.search.toLowerCase();
            result = result.filter(c =>
                c.projectName.toLowerCase().includes(term) ||
                c.clientName.toLowerCase().includes(term) ||
                c.manager.toLowerCase().includes(term)
            );
        }

        return result;
    }

    // 獲取單一工程
    async getConstruction(id) {
        await this._delay(200);
        return this.constructions.find(c => c.id === id);
    }

    // 獲取統計數據
    async getStats() {
        await this._delay(200);
        const all = this.constructions;
        return {
            total: all.length,
            inProgress: all.filter(c => c.status === CONSTRUCTION_STATUS.IN_PROGRESS).length,
            delayed: all.filter(c => c.status === CONSTRUCTION_STATUS.DELAYED).length,
            completed: all.filter(c => c.status === CONSTRUCTION_STATUS.COMPLETED).length,
            planning: all.filter(c => c.status === CONSTRUCTION_STATUS.PLANNING).length,
            upcomingMilestones: this._getUpcomingMilestones(7),
            overdueTasks: this._getOverdueTasks()
        };
    }

    // 更新任務狀態
    async updateTaskStatus(constructionId, taskId, status) {
        await this._delay(200);
        const construction = this.constructions.find(c => c.id === constructionId);
        if (construction) {
            const task = construction.tasks.find(t => t.id === taskId);
            if (task) {
                task.status = status;
                if (status === TASK_STATUS.COMPLETED) {
                    task.progress = 100;
                }
                this._recalculateProgress(construction);
            }
        }
        return construction;
    }

    // 完成里程碑
    async completeMilestone(constructionId, milestoneId) {
        await this._delay(200);
        const construction = this.constructions.find(c => c.id === constructionId);
        if (construction) {
            const milestone = construction.milestones.find(m => m.id === milestoneId);
            if (milestone) {
                milestone.completed = true;
                milestone.completedDate = new Date().toISOString().split('T')[0];
                this._recalculateProgress(construction);
            }
        }
        return construction;
    }

    // 新增每日報告
    async addDailyReport(constructionId, report) {
        await this._delay(300);
        const construction = this.constructions.find(c => c.id === constructionId);
        if (construction) {
            const newReport = {
                id: `dr-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                ...report
            };
            construction.dailyReports.unshift(newReport);
        }
        return construction;
    }

    // 新增任務
    async addTask(constructionId, task) {
        await this._delay(300);
        const construction = this.constructions.find(c => c.id === constructionId);
        if (construction) {
            const newTask = {
                id: `t-${Date.now()}`,
                status: TASK_STATUS.PENDING,
                progress: 0,
                ...task
            };
            construction.tasks.push(newTask);
        }
        return construction;
    }

    // 私有方法
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    _getUpcomingMilestones(days) {
        const today = new Date();
        const future = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
        const milestones = [];

        this.constructions.forEach(c => {
            c.milestones.forEach(m => {
                if (!m.completed) {
                    const dueDate = new Date(m.dueDate);
                    if (dueDate >= today && dueDate <= future) {
                        milestones.push({
                            ...m,
                            constructionId: c.id,
                            projectName: c.projectName
                        });
                    }
                }
            });
        });

        return milestones.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }

    _getOverdueTasks() {
        const today = new Date().toISOString().split('T')[0];
        const tasks = [];

        this.constructions.forEach(c => {
            c.tasks.forEach(t => {
                if (t.status !== TASK_STATUS.COMPLETED && t.endDate < today) {
                    tasks.push({
                        ...t,
                        constructionId: c.id,
                        projectName: c.projectName
                    });
                }
            });
        });

        return tasks;
    }

    _recalculateProgress(construction) {
        if (construction.tasks.length === 0) {
            construction.progress = 0;
            return;
        }
        const totalProgress = construction.tasks.reduce((sum, t) => sum + t.progress, 0);
        construction.progress = Math.round(totalProgress / construction.tasks.length);
    }
}

export const ConstructionService = new ConstructionServiceClass();
export default ConstructionService;
