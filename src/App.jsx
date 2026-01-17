import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Wallet,
  HardHat,
  Package,
  Search,
  Bell,
  Calendar,
  Plus,
  MapPin,
  Phone,
  MoreHorizontal,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Star,
  FileText,
  FileSignature,
  RefreshCw,
  Receipt,
  CreditCard,
  Building2,
  TrendingUp,
  Settings,
  Link2,
  FolderOpen,
  ChevronDown,
  Calculator,
  Ruler
} from 'lucide-react';

// Import P0 pages from design-system
import MaterialCalculator from './pages/MaterialCalculator';
import CostEstimator from './pages/CostEstimator';
import QuotationEditor from './pages/QuotationEditor';
import BimManagement from './pages/BimManagement';
import ContractsPage from './pages/Contracts';
import ConstructionPage from './pages/Construction';

// Import refactored core pages with working Add functionality
import ProjectsPage from './pages/Projects';
import ClientsPage from './pages/Clients';
import VendorsPage from './pages/Vendors';
import InventoryPage from './pages/Inventory';
import FinancePage from './pages/Finance';

// Import shared components
import { Badge } from './components/common/Badge';
import { Card } from './components/common/Card';

// --- MOCK DATA (From Prompt) ---
const MOCK_DATA = {
  clients: [
    {
      id: "c-1",
      name: "林先生",
      status: "已簽約",
      source: "網路廣告",
      phone: "0912-345-678",
      email: "lin@example.com",
      address: "台北市信義區信義路五段...",
      houseType: "電梯大樓",
      condition: "新成屋",
      size: "35坪",
      budgetRange: "300-500萬",
      style: "現代簡約",
      family: "夫妻+1子",
      note: "喜歡大理石材質，主臥需有更衣室。預計明年三月入住。"
    },
    {
      id: "c-2",
      name: "陳小姐",
      status: "提案/報價",
      source: "朋友介紹",
      phone: "0922-333-444",
      email: "chen@example.com",
      address: "台北市大安區和平東路...",
      houseType: "電梯大樓",
      condition: "新成屋",
      size: "22坪",
      budgetRange: "500-800萬",
      style: "北歐風",
      family: "單身貴族",
      note: "有養兩隻貓，需貓跳台與耐磨地板，注重收納空間。"
    }
  ],
  projects: [
    {
      id: "p-1",
      code: "P-23001",
      name: "信義區林公館",
      type: "翻修",
      status: "施工中",
      progress: 65,
      dueDate: "2025-03-15",
      clientName: "林先生",
      budget: 350,
      location: "台北市信義區松高路"
    },
    {
      id: "p-2",
      code: "P-24002",
      name: "大安森林公園景觀住宅",
      type: "新建",
      status: "設計中",
      progress: 30,
      dueDate: "2025-06-20",
      clientName: "大安區公所",
      budget: 980,
      location: "台北市大安區新生南路"
    },
    {
      id: "p-3",
      code: "P-24003",
      name: "南港軟體園區辦公室",
      type: "商空",
      status: "完工驗收",
      progress: 95,
      dueDate: "2025-02-28",
      clientName: "科技股份有限公司",
      budget: 1280,
      location: "台北市南港區園區街"
    }
  ],
  accounts: [
    {
      id: "a-1",
      name: "玉山營運",
      bank: "玉山銀行",
      number: "808-1234-5678-9012",
      balance: 2360,
      note: "主要收支帳戶"
    },
    {
      id: "a-2",
      name: "公司零用金",
      bank: "現金箱",
      number: "-",
      balance: -2,
      note: "日常雜支"
    },
    {
      id: "a-3",
      name: "台新薪轉",
      bank: "台新銀行",
      number: "987-654-321",
      balance: 0,
      note: "薪轉專用"
    }
  ],
  transactions: [
    {
      id: "t-1",
      date: "2025-12-05",
      type: "收入",
      amount: 800,
      accountId: "a-1",
      projectId: "p-1",
      desc: "信義林公館 - 第2期工程款"
    },
    {
      id: "t-2",
      date: "2025-12-08",
      type: "支出",
      amount: 30,
      accountId: "a-1",
      projectId: "p-1",
      desc: "水電建材料件"
    },
    {
      id: "t-3",
      date: "2025-12-10",
      type: "支出",
      amount: 2,
      accountId: "a-2",
      projectId: "p-2",
      desc: "辦公室文具"
    }
  ],
  vendors: [
    {
      id: "v-1",
      name: "大師兄精緻木工坊",
      category: "工程工班",
      tradeType: "木工",
      contactPerson: "王大哥",
      phone: "0912-345-678",
      address: "新北市板橋區文化路一段...",
      status: "長期合作",
      rating: 4.9,
      lastProject: "信義區林公館",
      tags: ["配合度高", "手工細緻"]
    },
    {
      id: "v-2",
      name: "永亮專業水電",
      category: "工程工班",
      tradeType: "水電",
      contactPerson: "張師傅",
      phone: "0922-333-444",
      address: "新店區中興路三段...",
      status: "合作中",
      rating: 4.5,
      lastProject: "南港軟體園區辦公室",
      tags: ["配線整齊", "配合度高"]
    }
  ],
  inventory: [
    {
      id: "i-1",
      name: "Panasonic 開關",
      spec: "PN-001",
      quantity: 50,
      unit: "組",
      safeStock: 10,
      location: "A-01"
    },
    {
      id: "i-2",
      name: "得利乳膠漆 (白)",
      spec: "PT-W01",
      quantity: 5,
      unit: "桶",
      safeStock: 10,
      location: "B-02"
    },
    {
      id: "i-3",
      name: "T5 層板燈",
      spec: "LGT-T5",
      quantity: 100,
      unit: "支",
      safeStock: 20,
      location: "A-03"
    }
  ],
  todos: [
    { id: "todo-1", text: "確認信義區林公館磁磚樣品", done: false },
    { id: "todo-2", text: "回覆陳小姐報價與圖面疑問", done: true },
    { id: "todo-3", text: "預約下週三木工會議排程", done: false }
  ]
};

// --- HELPER COMPONENTS ---

const ProgressBar = ({ value }) => (
  <div className="w-full bg-gray-100 rounded-full h-2">
    <div
      className="bg-gray-800 h-2 rounded-full transition-all duration-500"
      style={{ width: `${value}%` }}
    />
  </div>
);

const SectionTitle = ({ title, action }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
    {action}
  </div>
);

// --- VIEW COMPONENTS ---

const Dashboard = ({ data }) => {
  const activeProjectsCount = data.projects.filter(p => ["設計中", "施工中"].includes(p.status)).length;
  const constructionCount = data.projects.filter(p => p.status === "施工中").length;
  const nearCompletionCount = data.projects.filter(p => p.progress >= 80).length;
  const monthlyIncome = data.transactions
    .filter(t => t.type === "收入")
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Derived financials for Dashboard
  const estimatedIncome = 1250; // Mock derived
  const estimatedExpense = 420; // Mock derived

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Greeting & Date */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">早安，設計總監</h1>
          <p className="text-gray-500 mt-1">今天又是充滿創意與挑戰的一天，來看看今日行程吧。</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm font-medium text-gray-500">2025年 12月 07日</p>
          <p className="text-xs text-gray-400">星期日</p>
        </div>
      </div>

      {/* Today's Schedule Card */}
      <Card className="border-l-4 border-l-gray-800">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Calendar size={20} className="text-gray-700" />
            今日行程
          </h3>
          <div className="space-x-2">
            <button className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-1.5 border rounded-lg hover:bg-gray-50 transition-colors">同步 Google</button>
            <button className="text-sm text-white bg-gray-800 hover:bg-gray-900 font-medium px-3 py-1.5 rounded-lg transition-colors">查看全部</button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <Calendar size={32} className="mb-2 opacity-50" />
          <span className="text-sm">今天無安排，享受美好時光！</span>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-gray-500 text-sm font-medium">進行中專案</span>
            <Briefcase size={18} className="text-blue-500" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">{activeProjectsCount}</span>
            <span className="text-gray-400 text-sm mb-1">個案場</span>
          </div>
        </Card>

        <Card className="flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-gray-500 text-sm font-medium">本月實收</span>
            <Wallet size={18} className="text-emerald-500" />
          </div>
          <div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">NT$ {monthlyIncome}</span>
              <span className="text-gray-400 text-sm mb-1">萬</span>
            </div>
            <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex w-fit mt-1 items-center">
              <ArrowUpRight size={12} className="mr-0.5" /> +15% 較上月
            </span>
          </div>
        </Card>

        <Card className="flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-gray-500 text-sm font-medium">施工中案場</span>
            <HardHat size={18} className="text-orange-500" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">{constructionCount}</span>
            <span className="text-gray-400 text-sm mb-1">處</span>
          </div>
        </Card>

        <Card className="flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-gray-500 text-sm font-medium">即將完工</span>
            <CheckCircle2 size={18} className="text-purple-500" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">{nearCompletionCount}</span>
            <span className="text-gray-400 text-sm mb-1">個案場</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects & Financial Overview */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">近期專案動態</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.projects.slice(0, 2).map(project => (
                <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-gray-800">{project.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{project.code}</p>
                    </div>
                    <Badge color={project.status === '施工中' ? 'orange' : 'blue'}>{project.status}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">目前進度</span>
                      <span className="font-bold text-gray-800">{project.progress}%</span>
                    </div>
                    <ProgressBar value={project.progress} />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">財務概況</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
                <p className="text-sm text-emerald-800 font-medium mb-1">預計實收</p>
                <p className="text-2xl font-bold text-emerald-900">NT$ {estimatedIncome} 萬</p>
              </Card>
              <Card className="bg-gradient-to-br from-red-50 to-white border-red-100">
                <p className="text-sm text-red-800 font-medium mb-1">預計支出</p>
                <p className="text-2xl font-bold text-red-900">NT$ {estimatedExpense} 萬</p>
              </Card>
            </div>
          </div>
        </div>

        {/* Todos */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">備忘錄</h3>
          <Card className="h-full max-h-[400px] overflow-y-auto">
            <ul className="space-y-4">
              {data.todos.map(todo => (
                <li key={todo.id} className="flex items-start gap-3 group">
                  {todo.done ? (
                    <CheckCircle2 size={20} className="text-emerald-500 mt-0.5 shrink-0" />
                  ) : (
                    <Circle size={20} className="text-gray-300 mt-0.5 shrink-0 group-hover:text-gray-400" />
                  )}
                  <span className={`text-sm leading-relaxed ${todo.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                    {todo.text}
                  </span>
                </li>
              ))}
            </ul>
            <button className="w-full mt-6 py-2 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors border border-dashed border-gray-200">
              + 新增備忘
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Clients = ({ data }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <SectionTitle
        title="客戶名單"
        action={
          <div className="flex gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜尋姓名、電話、地址…"
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 w-64"
              />
            </div>
            <button className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <Plus size={16} /> 新增客戶
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.clients.map(client => (
          <Card key={client.id} className="hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600">
                  {client.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{client.name}</h3>
                  <Badge color={client.status === '已簽約' ? 'green' : 'blue'} className="mt-1 inline-block">
                    {client.status}
                  </Badge>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-gray-400" />
                {client.phone}
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                <span className="truncate">{client.address}</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                <span className="text-gray-400">類型:</span> {client.houseType} / {client.condition}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">預算:</span> {client.budgetRange}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge color="gray">#{client.style}</Badge>
              <Badge color="gray">#{client.family}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const Projects = ({ data }) => {
  const [filter, setFilter] = useState('全部');
  const filters = ['全部', '翻修', '新建', '商空'];

  const filteredProjects = filter === '全部'
    ? data.projects
    : data.projects.filter(p => p.type === filter);

  const getStatusColor = (type) => {
    if (type === '翻修') return 'orange';
    if (type === '新建') return 'blue';
    return 'purple';
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">專案管理</h2>
          <div className="flex gap-2">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <button className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus size={16} /> 建立專案
        </button>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <Card key={project.id} className="relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 w-1 h-full bg-gray-800 group-hover:bg-gray-900 transition-colors" />
            <div className="flex justify-between items-start mb-2">
              <Badge color={getStatusColor(project.type)} className="mb-2">
                {project.type === '翻修' ? '翻' : project.type === '新建' ? '新' : '商'}
              </Badge>
              <span className={`text-xs px-2 py-1 rounded ${project.status === '施工中' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                {project.status}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">{project.name}</h3>
            <p className="text-sm text-gray-400 mb-4">{project.code}</p>

            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-400">業主</span>
                <span>{project.clientName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-400">總預算</span>
                <span>NT$ {project.budget} 萬</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-gray-400">完工日</span>
                <span>{project.dueDate}</span>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">專案進度</span>
                <span className="text-gray-900 font-bold">{project.progress}%</span>
              </div>
              <ProgressBar value={project.progress} />
            </div>
          </Card>
        ))}
      </div>

      {/* Engineering Progress Table */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">工程進度管理</h3>
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">專案</th>
                <th className="px-6 py-4">摘要</th>
                <th className="px-6 py-4 text-right">狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.projects.filter(p => ['設計中', '施工中'].includes(p.status)).map(project => (
                <tr key={project.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-gray-900">{project.name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {project.status === '施工中' ? '泥作進場，水電配管完成' : '平面圖定稿，3D渲染中'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.status === '施工中' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                      {project.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};

const Finance = ({ data }) => {
  const totalIncome = data.transactions.filter(t => t.type === '收入').reduce((acc, c) => acc + c.amount, 0);
  const totalExpense = data.transactions.filter(t => t.type === '支出').reduce((acc, c) => acc + c.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionTitle
        title="財務收支"
        action={
          <button className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Plus size={16} /> 新增一筆
          </button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white">
          <p className="text-sm text-gray-500 mb-1">本期收入</p>
          <p className="text-3xl font-bold text-emerald-600">+ NT$ {totalIncome} 萬</p>
        </Card>
        <Card className="bg-white">
          <p className="text-sm text-gray-500 mb-1">本期支出</p>
          <p className="text-3xl font-bold text-red-600">- NT$ {totalExpense} 萬</p>
        </Card>
        <Card className="bg-gray-800 text-white border-none">
          <p className="text-sm text-gray-400 mb-1">淨現金流</p>
          <p className="text-3xl font-bold">+ NT$ {totalIncome - totalExpense} 萬</p>
        </Card>
      </div>

      {/* Accounts */}
      <h3 className="text-lg font-bold text-gray-800 mt-8 mb-4">帳戶概況</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.accounts.map(account => (
          <div key={account.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wallet size={64} />
            </div>
            <h4 className="font-bold text-gray-900 text-lg mb-1">{account.name}</h4>
            <p className="text-sm text-gray-500 mb-6 font-mono">{account.bank} · {account.number}</p>

            <p className="text-xs text-gray-400 uppercase tracking-wider">帳戶餘額</p>
            <p className={`text-2xl font-bold ${account.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
              NT$ {account.balance} 萬
            </p>
          </div>
        ))}
      </div>

      {/* Transactions Table */}
      <h3 className="text-lg font-bold text-gray-800 mt-8 mb-4">近期收支明細</h3>
      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">摘要</th>
              <th className="px-6 py-4">日期</th>
              <th className="px-6 py-4">帳戶 / 專案</th>
              <th className="px-6 py-4 text-right">金額</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.transactions.map(t => {
              const accountName = data.accounts.find(a => a.id === t.accountId)?.name;
              const projectName = data.projects.find(p => p.id === t.projectId)?.name || "未指定專案";
              return (
                <tr key={t.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-gray-900">{t.desc}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono">{t.date}</td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{accountName}</div>
                    <div className="text-xs text-gray-400">{projectName}</div>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${t.type === '收入' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {t.type === '收入' ? '+' : '-'} NT$ {t.amount} 萬
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

const Vendors = ({ data }) => {
  const [filter, setFilter] = useState('全部');
  const filters = ['全部', '工程工班', '建材供應'];

  const filteredVendors = filter === '全部' ? data.vendors : data.vendors.filter(v => v.category === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">廠商管理</h2>
          <div className="flex gap-2">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <button className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus size={16} /> 新增廠商
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg-grid-cols-3 gap-6">
        {filteredVendors.map(vendor => (
          <Card key={vendor.id} className="hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-2">
              <Badge color="blue">{vendor.tradeType}</Badge>
              <div className={`px-2 py-0.5 rounded text-xs font-medium ${vendor.status === '長期合作' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                {vendor.status}
              </div>
            </div>

            <h3 className="font-bold text-gray-900 text-lg mb-1">{vendor.name}</h3>
            <div className="flex items-center gap-1 text-orange-400 text-sm mb-4">
              <Star size={14} fill="currentColor" />
              <span className="font-bold text-gray-700">{vendor.rating}</span>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                {vendor.contactPerson[0]}
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">{vendor.contactPerson}</div>
                <div className="text-gray-500 font-mono">{vendor.phone}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {vendor.tags.map(tag => (
                <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">#{tag}</span>
              ))}
            </div>

            <div className="text-xs text-gray-400 pt-3 border-t border-gray-50">
              最近合作：{vendor.lastProject}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const Inventory = ({ data }) => {
  const getStockStatus = (qty, safe) => {
    if (qty <= 0) return { label: '缺貨', color: 'bg-red-100 text-red-700' };
    if (qty <= safe) return { label: '庫存偏低', color: 'bg-orange-100 text-orange-700' };
    return { label: '充足', color: 'bg-emerald-100 text-emerald-700' };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionTitle
        title="庫存管理"
        action={
          <button className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Plus size={16} /> 新增品項
          </button>
        }
      />

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">品項資訊</th>
              <th className="px-6 py-4">規格 / 型號</th>
              <th className="px-6 py-4">庫存數量</th>
              <th className="px-6 py-4">狀態</th>
              <th className="px-6 py-4">存放位置</th>
              <th className="px-6 py-4">備註</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.inventory.map(item => {
              const status = getStockStatus(item.quantity, item.safeStock);
              return (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded text-gray-500">
                        <Package size={18} />
                      </div>
                      <span className="font-medium text-gray-900">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono">
                      {item.spec}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {item.quantity} <span className="text-gray-400 text-xs font-normal">{item.unit}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-mono">
                    {item.location}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    -
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// --- PLACEHOLDER PAGES ---

const PlaceholderPage = ({ title, icon: Icon }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100">
      <Icon size={48} className="text-gray-300 mb-4" />
      <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-400">此功能開發中，敬請期待</p>
    </div>
  </div>
);

const Quotations = () => <PlaceholderPage title="報價單管理" icon={FileText} />;
const Contracts = (props) => <ContractsPage {...props} />;
const ChangeOrders = () => <PlaceholderPage title="變更單管理" icon={RefreshCw} />;
const Invoices = () => <PlaceholderPage title="發票管理" icon={Receipt} />;
const Payments = () => <PlaceholderPage title="付款管理" icon={CreditCard} />;
const Construction = (props) => <ConstructionPage {...props} />;
const Events = () => <PlaceholderPage title="行事曆" icon={Calendar} />;
const ProfitAnalysis = () => <PlaceholderPage title="利潤分析" icon={TrendingUp} />;
const UserSettings = () => <PlaceholderPage title="使用者管理" icon={Users} />;
const Integrations = () => <PlaceholderPage title="整合設定" icon={Link2} />;
const Storage = () => <PlaceholderPage title="文件管理" icon={FolderOpen} />;

// --- MAIN LAYOUT & APP ---

const SidebarGroup = ({ label, children }) => (
  <div className="mb-4">
    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</div>
    <div className="space-y-1">{children}</div>
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${active
      ? 'bg-gray-800 text-white shadow-md'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
  >
    <Icon size={18} className={active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'} />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard data={MOCK_DATA} />;
      case 'clients': return <ClientsPage data={MOCK_DATA} />;
      case 'projects': return <ProjectsPage data={MOCK_DATA} />;
      case 'construction': return <Construction />;
      case 'events': return <Events />;
      case 'quotations': return <Quotations />;
      case 'contracts': return <Contracts />;
      case 'change-orders': return <ChangeOrders />;
      case 'invoices': return <Invoices />;
      case 'payments': return <Payments />;
      case 'finance': return <FinancePage data={MOCK_DATA} />;
      case 'profit-analysis': return <ProfitAnalysis />;
      case 'inventory': return <InventoryPage data={MOCK_DATA.inventory} addToast={console.log} />;
      case 'vendors': return <VendorsPage data={MOCK_DATA} />;
      case 'users': return <UserSettings />;
      case 'integrations': return <Integrations />;
      case 'storage': return <Storage />;
      case 'material-calc': return <MaterialCalculator />;
      case 'cost-est': return <CostEstimator />;
      case 'quotation-edit': return <QuotationEditor />;
      case 'bim': return <BimManagement />;
      default: return <Dashboard data={MOCK_DATA} />;
    }
  };

  const titles = {
    dashboard: '儀表板',
    clients: '客戶管理',
    projects: '專案管理',
    construction: '工程管理',
    events: '行事曆',
    quotations: '報價單',
    contracts: '合約管理',
    'change-orders': '變更單',
    invoices: '發票管理',
    payments: '付款管理',
    finance: '財務管理',
    'profit-analysis': '利潤分析',
    inventory: '庫存管理',
    vendors: '廠商管理',
    users: '使用者管理',
    integrations: '整合設定',
    storage: '文件管理',
    'material-calc': '材料估算',
    'cost-est': '成本估算',
    'quotation-edit': '報價編輯',
    'bim': 'BIM 管理'
  };
  const getTitle = () => titles[activeTab] || '儀表板';

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 selection:bg-gray-200">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 z-10 flex flex-col">
        <div className="p-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white text-lg font-serif shadow-lg shadow-gray-200">森</div>
            <span className="mt-0.5">森騰室內設計</span>
          </h1>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto">
          <div className="mb-2">
            <SidebarItem icon={LayoutDashboard} label="儀表板" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          </div>

          <SidebarGroup label="營運管理">
            <SidebarItem icon={Users} label="客戶管理" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />
            <SidebarItem icon={Briefcase} label="專案管理" active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} />
            <SidebarItem icon={Building2} label="工程管理" active={activeTab === 'construction'} onClick={() => setActiveTab('construction')} />
            <SidebarItem icon={Calendar} label="行事曆" active={activeTab === 'events'} onClick={() => setActiveTab('events')} />
          </SidebarGroup>

          <SidebarGroup label="商務文件">
            <SidebarItem icon={FileText} label="報價單" active={activeTab === 'quotations'} onClick={() => setActiveTab('quotations')} />
            <SidebarItem icon={FileSignature} label="合約管理" active={activeTab === 'contracts'} onClick={() => setActiveTab('contracts')} />
            <SidebarItem icon={RefreshCw} label="變更單" active={activeTab === 'change-orders'} onClick={() => setActiveTab('change-orders')} />
            <SidebarItem icon={Receipt} label="發票管理" active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} />
            <SidebarItem icon={CreditCard} label="付款管理" active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} />
          </SidebarGroup>

          <SidebarGroup label="財務庫存">
            <SidebarItem icon={Wallet} label="財務管理" active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} />
            <SidebarItem icon={TrendingUp} label="利潤分析" active={activeTab === 'profit-analysis'} onClick={() => setActiveTab('profit-analysis')} />
            <SidebarItem icon={Package} label="庫存管理" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
            <SidebarItem icon={HardHat} label="廠商管理" active={activeTab === 'vendors'} onClick={() => setActiveTab('vendors')} />
          </SidebarGroup>

          <SidebarGroup label="工程估算">
            <SidebarItem icon={Ruler} label="材料估算" active={activeTab === 'material-calc'} onClick={() => setActiveTab('material-calc')} />
            <SidebarItem icon={Calculator} label="成本估算" active={activeTab === 'cost-est'} onClick={() => setActiveTab('cost-est')} />
            <SidebarItem icon={FileText} label="報價編輯" active={activeTab === 'quotation-edit'} onClick={() => setActiveTab('quotation-edit')} />
            <SidebarItem icon={Building2} label="BIM 管理" active={activeTab === 'bim'} onClick={() => setActiveTab('bim')} />
          </SidebarGroup>

          <SidebarGroup label="設定">
            <SidebarItem icon={Users} label="使用者管理" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            <SidebarItem icon={Link2} label="整合設定" active={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')} />
            <SidebarItem icon={FolderOpen} label="文件管理" active={activeTab === 'storage'} onClick={() => setActiveTab('storage')} />
          </SidebarGroup>
        </nav>

        <div className="p-4 border-t border-gray-50">
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
              A
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">設計總監</p>
              <p className="text-xs text-gray-400">v3.2.1-debug (admin)</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">

        {/* Top Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-20 px-8 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">{getTitle()}</h2>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Bell size={20} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">Alex Chen</p>
                <p className="text-xs text-gray-400">設計總監</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold shadow-lg shadow-gray-200">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </div>

      </main>
    </div>
  );
};

export default App;
