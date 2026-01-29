/**
 * ConstructionService.ts
 *
 * 工程管理服務層 (ConstructionService)
 * 處理工程進度、里程碑、任務、日報告
 */

// ==========================================
// Types
// ==========================================

export type ConstructionStatusType =
    | 'planning'
    | 'in_progress'
    | 'on_hold'
    | 'completed'
    | 'delayed';

export type TaskStatusType = 'pending' | 'in_progress' | 'completed' | 'blocked';

export type TaskPriorityType = 'low' | 'medium' | 'high' | 'urgent';

export interface Milestone {
    id: string;
    name: string;
    dueDate: string;
    completedDate: string | null;
    completed: boolean;
    constructionId?: string;
    projectName?: string;
}

export interface ConstructionTask {
    id: string;
    name: string;
    status: TaskStatusType;
    priority: TaskPriorityType;
    assignee: string;
    startDate: string;
    endDate: string;
    progress: number;
    blockedReason?: string;
    constructionId?: string;
    projectName?: string;
}

export interface DailyReport {
    id: string;
    date: string;
    weather: string;
    temperature: string;
    workers: number;
    workHours: number;
    notes: string;
    photos: string[];
}

export interface ConstructionIssue {
    id: string;
    title: string;
    status: 'open' | 'resolved';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    createdAt: string;
    resolvedAt: string | null;
}

export interface Construction {
    id: string;
    projectId: string;
    projectName: string;
    clientName: string;
    status: ConstructionStatusType;
    progress: number;
    startDate: string;
    endDate: string;
    manager: string;
    location: string;
    budget: number;
    actualCost: number;
    milestones: Milestone[];
    tasks: ConstructionTask[];
    dailyReports: DailyReport[];
    issues: ConstructionIssue[];
}

export interface ConstructionStats {
    total: number;
    inProgress: number;
    delayed: number;
    completed: number;
    planning: number;
    upcomingMilestones: Milestone[];
    overdueTasks: ConstructionTask[];
}

export interface ConstructionFilters {
    status?: ConstructionStatusType;
    projectId?: string;
    search?: string;
}

// ==========================================
// Constants
// ==========================================

export const CONSTRUCTION_STATUS: Record<string, ConstructionStatusType> = {
    PLANNING: 'planning',
    IN_PROGRESS: 'in_progress',
    ON_HOLD: 'on_hold',
    COMPLETED: 'completed',
    DELAYED: 'delayed',
};

export const CONSTRUCTION_STATUS_LABELS: Record<ConstructionStatusType, string> = {
    planning: '規劃中',
    in_progress: '進行中',
    on_hold: '暫停',
    completed: '已完工',
    delayed: '延遲',
};

export const CONSTRUCTION_STATUS_COLORS: Record<ConstructionStatusType, string> = {
    planning: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-green-100 text-green-700',
    on_hold: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-gray-100 text-gray-700',
    delayed: 'bg-red-100 text-red-700',
};

export const TASK_STATUS: Record<string, TaskStatusType> = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    BLOCKED: 'blocked',
};

export const TASK_STATUS_LABELS: Record<TaskStatusType, string> = {
    pending: '待執行',
    in_progress: '進行中',
    completed: '已完成',
    blocked: '阻擋中',
};

export const TASK_PRIORITY: Record<string, TaskPriorityType> = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriorityType, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '緊急',
};

export const TASK_PRIORITY_COLORS: Record<TaskPriorityType, string> = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-orange-100 text-orange-600',
    urgent: 'bg-red-100 text-red-600',
};

// ==========================================
// Mock Data
// ==========================================

const mockConstructions: Construction[] = [
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
            {
                id: 'm1',
                name: '拆除完成',
                dueDate: '2026-01-20',
                completedDate: '2026-01-18',
                completed: true,
            },
            { id: 'm2', name: '水電管線', dueDate: '2026-02-10', completedDate: null, completed: false },
            { id: 'm3', name: '泥作完成', dueDate: '2026-02-28', completedDate: null, completed: false },
            { id: 'm4', name: '油漆完工', dueDate: '2026-03-15', completedDate: null, completed: false },
            { id: 'm5', name: '驗收交屋', dueDate: '2026-03-31', completedDate: null, completed: false },
        ],
        tasks: [
            {
                id: 't1',
                name: '拆除舊裝潢',
                status: TASK_STATUS.COMPLETED,
                priority: TASK_PRIORITY.HIGH,
                assignee: '王師傅',
                startDate: '2026-01-10',
                endDate: '2026-01-18',
                progress: 100,
            },
            {
                id: 't2',
                name: '水管配置',
                status: TASK_STATUS.IN_PROGRESS,
                priority: TASK_PRIORITY.HIGH,
                assignee: '李師傅',
                startDate: '2026-01-20',
                endDate: '2026-02-05',
                progress: 60,
            },
        ],
        dailyReports: [
            {
                id: 'dr1',
                date: '2026-01-17',
                weather: '晴',
                temperature: '18°C',
                workers: 5,
                workHours: 8,
                notes: '完成客廳及主臥拆除工作，明日進行廚房拆除',
                photos: [],
            },
        ],
        issues: [
            {
                id: 'i1',
                title: '發現漏水管線',
                status: 'resolved',
                priority: 'high',
                createdAt: '2026-01-16',
                resolvedAt: '2026-01-17',
            },
        ],
    },
];

// ==========================================
// Service Class
// ==========================================

class ConstructionServiceClass {
    private constructions: Construction[] = [...mockConstructions];

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getConstructions(filters: ConstructionFilters = {}): Promise<Construction[]> {
        await this.delay(300);
        let result = [...this.constructions];

        if (filters.status) {
            result = result.filter(c => c.status === filters.status);
        }
        if (filters.projectId) {
            result = result.filter(c => c.projectId === filters.projectId);
        }
        if (filters.search) {
            const term = filters.search.toLowerCase();
            result = result.filter(
                c =>
                    c.projectName.toLowerCase().includes(term) ||
                    c.clientName.toLowerCase().includes(term) ||
                    c.manager.toLowerCase().includes(term)
            );
        }

        return result;
    }

    async getConstruction(id: string): Promise<Construction | undefined> {
        await this.delay(200);
        return this.constructions.find(c => c.id === id);
    }

    async getStats(): Promise<ConstructionStats> {
        await this.delay(200);
        const all = this.constructions;
        return {
            total: all.length,
            inProgress: all.filter(c => c.status === CONSTRUCTION_STATUS.IN_PROGRESS).length,
            delayed: all.filter(c => c.status === CONSTRUCTION_STATUS.DELAYED).length,
            completed: all.filter(c => c.status === CONSTRUCTION_STATUS.COMPLETED).length,
            planning: all.filter(c => c.status === CONSTRUCTION_STATUS.PLANNING).length,
            upcomingMilestones: this.getUpcomingMilestones(7),
            overdueTasks: this.getOverdueTasks(),
        };
    }

    async updateTaskStatus(
        constructionId: string,
        taskId: string,
        status: TaskStatusType
    ): Promise<Construction | undefined> {
        await this.delay(200);
        const construction = this.constructions.find(c => c.id === constructionId);
        if (construction) {
            const task = construction.tasks.find(t => t.id === taskId);
            if (task) {
                task.status = status;
                if (status === TASK_STATUS.COMPLETED) {
                    task.progress = 100;
                }
                this.recalculateProgress(construction);
            }
        }
        return construction;
    }

    async completeMilestone(
        constructionId: string,
        milestoneId: string
    ): Promise<Construction | undefined> {
        await this.delay(200);
        const construction = this.constructions.find(c => c.id === constructionId);
        if (construction) {
            const milestone = construction.milestones.find(m => m.id === milestoneId);
            if (milestone) {
                milestone.completed = true;
                milestone.completedDate = new Date().toISOString().split('T')[0];
                this.recalculateProgress(construction);
            }
        }
        return construction;
    }

    async addDailyReport(
        constructionId: string,
        report: Partial<DailyReport>
    ): Promise<Construction | undefined> {
        await this.delay(300);
        const construction = this.constructions.find(c => c.id === constructionId);
        if (construction) {
            const newReport: DailyReport = {
                id: `dr-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                weather: report.weather || '',
                temperature: report.temperature || '',
                workers: report.workers || 0,
                workHours: report.workHours || 0,
                notes: report.notes || '',
                photos: report.photos || [],
            };
            construction.dailyReports.unshift(newReport);
        }
        return construction;
    }

    async addTask(
        constructionId: string,
        task: Partial<ConstructionTask>
    ): Promise<Construction | undefined> {
        await this.delay(300);
        const construction = this.constructions.find(c => c.id === constructionId);
        if (construction) {
            const newTask: ConstructionTask = {
                id: `t-${Date.now()}`,
                name: task.name || '',
                status: task.status || TASK_STATUS.PENDING,
                priority: task.priority || TASK_PRIORITY.MEDIUM,
                assignee: task.assignee || '',
                startDate: task.startDate || '',
                endDate: task.endDate || '',
                progress: 0,
            };
            construction.tasks.push(newTask);
        }
        return construction;
    }

    private getUpcomingMilestones(days: number): Milestone[] {
        const today = new Date();
        const future = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
        const milestones: Milestone[] = [];

        this.constructions.forEach(c => {
            c.milestones.forEach(m => {
                if (!m.completed) {
                    const dueDate = new Date(m.dueDate);
                    if (dueDate >= today && dueDate <= future) {
                        milestones.push({
                            ...m,
                            constructionId: c.id,
                            projectName: c.projectName,
                        });
                    }
                }
            });
        });

        return milestones.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }

    private getOverdueTasks(): ConstructionTask[] {
        const today = new Date().toISOString().split('T')[0];
        const tasks: ConstructionTask[] = [];

        this.constructions.forEach(c => {
            c.tasks.forEach(t => {
                if (t.status !== TASK_STATUS.COMPLETED && t.endDate < today) {
                    tasks.push({
                        ...t,
                        constructionId: c.id,
                        projectName: c.projectName,
                    });
                }
            });
        });

        return tasks;
    }

    private recalculateProgress(construction: Construction): void {
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
