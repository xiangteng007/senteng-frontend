import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
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
  Ruler,
  LogOut,
  ShoppingCart,
  ClipboardList,
  Menu,
  X,
  Layers
} from 'lucide-react';

// Import P0 pages from design-system
import MaterialCalculator from './pages/MaterialCalculator';
import CostEstimator from './pages/CostEstimator';
import EngineeringEstimateWorkspace from './pages/EngineeringEstimateWorkspace';
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
import CalendarPage from './pages/Calendar';
import QuotationsPage from './pages/Quotations';
import ChangeOrdersPage from './pages/ChangeOrders';
import PaymentsPage from './pages/Payments';
import ProfitAnalysisPage from './pages/ProfitAnalysis';
import InvoicesPage from './pages/Invoices';
import InvoiceHelperPage from './pages/InvoiceHelperPage';
import UserManagement from './pages/UserManagement';
import LoginPage from './pages/LoginPage';
// CustomersPage removed - using Clients instead
import ProcurementsPage from './pages/Procurements';
import SiteLogsPage from './pages/SiteLogs';
import IntegrationsPage from './pages/IntegrationsPage';
import StoragePage from './pages/StoragePage';
import DashboardPage from './pages/Dashboard';
import { clientsApi, projectsApi } from './services/api';

// Import shared components
import { Badge } from './components/common/Badge';
import { Card } from './components/common/Card';
import { ToastContainer } from './components/common/Toast';
import { BottomNav } from './components/layout/BottomNav';

// --- MOCK DATA (From Prompt) ---
const MOCK_DATA = {
  clients: [],
  projects: [],
  accounts: [],
  transactions: [],
  vendors: [],
  inventory: [],
  todos: []
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
            <Briefcase size={18} className="text-gray-500" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">{activeProjectsCount}</span>
            <span className="text-gray-400 text-sm mb-1">個案場</span>
          </div>
        </Card>

        <Card className="flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-gray-500 text-sm font-medium">本月實收</span>
            <Wallet size={18} className="text-gray-500" />
          </div>
          <div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">NT$ {monthlyIncome}</span>
              <span className="text-gray-400 text-sm mb-1">萬</span>
            </div>
            <span className="text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded flex w-fit mt-1 items-center">
              <ArrowUpRight size={12} className="mr-0.5" /> +15% 較上月
            </span>
          </div>
        </Card>

        <Card className="flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-gray-500 text-sm font-medium">施工中案場</span>
            <HardHat size={18} className="text-gray-500" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">{constructionCount}</span>
            <span className="text-gray-400 text-sm mb-1">處</span>
          </div>
        </Card>

        <Card className="flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-gray-500 text-sm font-medium">即將完工</span>
            <CheckCircle2 size={18} className="text-gray-500" />
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
              <Card className="bg-gray-50 border-gray-200">
                <p className="text-sm text-gray-700 font-medium mb-1">預計實收</p>
                <p className="text-2xl font-bold text-gray-900">NT$ {estimatedIncome} 萬</p>
              </Card>
              <Card className="bg-gray-100 border-gray-200">
                <p className="text-sm text-gray-700 font-medium mb-1">預計支出</p>
                <p className="text-2xl font-bold text-gray-800">NT$ {estimatedExpense} 萬</p>
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
                    <CheckCircle2 size={20} className="text-gray-600 mt-0.5 shrink-0" />
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
              <span className={`text-xs px-2 py-1 rounded ${project.status === '施工中' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-600'}`}>
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.status === '施工中' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-700'
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
          <p className="text-3xl font-bold text-gray-800">+ NT$ {totalIncome} 萬</p>
        </Card>
        <Card className="bg-white">
          <p className="text-sm text-gray-500 mb-1">本期支出</p>
          <p className="text-3xl font-bold text-gray-600">- NT$ {totalExpense} 萬</p>
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
                  <td className={`px-6 py-4 text-right font-bold ${t.type === '收入' ? 'text-gray-800' : 'text-gray-500'}`}>
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
              <Badge color="gray">{vendor.tradeType}</Badge>
              <div className={`px-2 py-0.5 rounded text-xs font-medium ${vendor.status === '長期合作' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-600'
                }`}>
                {vendor.status}
              </div>
            </div>

            <h3 className="font-bold text-gray-900 text-lg mb-1">{vendor.name}</h3>
            <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
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
    if (qty <= 0) return { label: '缺貨', color: 'bg-gray-300 text-gray-800' };
    if (qty <= safe) return { label: '庫存偏低', color: 'bg-gray-200 text-gray-700' };
    return { label: '充足', color: 'bg-gray-100 text-gray-600' };
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

const Quotations = (props) => <QuotationsPage {...props} />;
const Contracts = (props) => <ContractsPage {...props} />;
const ChangeOrders = (props) => <ChangeOrdersPage {...props} />;
const Invoices = (props) => <InvoicesPage {...props} />;
const Payments = (props) => <PaymentsPage {...props} />;
const Construction = (props) => <ConstructionPage {...props} />;
const Events = () => <CalendarPage />;
const ProfitAnalysis = (props) => <ProfitAnalysisPage {...props} />;
const UserSettings = () => <PlaceholderPage title="使用者管理" icon={Users} />;
const Integrations = () => <IntegrationsPage />;
const Storage = () => <StoragePage />;

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
  const { user, loading, signOut } = useAuth();
  // URL path to tab mappings
  const ROUTES = {
    '/': 'dashboard',
    '/dashboard': 'dashboard',
    '/clients': 'clients',
    '/projects': 'projects',
    '/events': 'events',
    '/quotations': 'quotations',
    '/contracts': 'contracts',
    '/change-orders': 'change-orders',
    '/invoices': 'invoices',
    '/payments': 'payments',
    '/finance': 'finance',
    '/profit-analysis': 'profit-analysis',
    '/inventory': 'inventory',
    '/vendors': 'vendors',
    '/users': 'users',
    '/integrations': 'integrations',
    '/storage': 'storage',
    '/engineering-estimate': 'engineering-estimate',
    '/material-calc': 'material-calc',
    '/cost-estimator': 'cost-estimator',
    '/cost-est': 'cost-estimator',
    '/quotation-edit': 'quotation-edit',
    '/bim': 'bim',
    '/invoice-helper': 'invoice-helper',
    '/procurements': 'procurements',
    '/site-logs': 'site-logs'
  };

  // Get initial tab from URL
  const getTabFromPath = (path) => ROUTES[path] || 'dashboard';
  const [activeTab, setActiveTab] = useState(() => getTabFromPath(window.location.pathname));
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch clients and projects data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsData, projectsData] = await Promise.all([
          clientsApi.getAll(),
          projectsApi.getAll()
        ]);
        // API returns { items: [], total: N }, extract the items array
        setClients(clientsData?.items || clientsData || []);
        setProjects(projectsData?.items || projectsData || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  // Proper addToast function with full signature (message, type, options)
  const addToast = (message, type = 'info', options = {}) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, action: options.action }]);
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Navigate function that updates both URL and state
  const navigate = (tab) => {
    const path = Object.keys(ROUTES).find(key => ROUTES[key] === tab && key !== '/') || '/';
    window.history.pushState({ tab }, '', path);
    setActiveTab(tab);
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state?.tab) {
        setActiveTab(event.state.tab);
      } else {
        setActiveTab(getTabFromPath(window.location.pathname));
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Set initial history state
    window.history.replaceState({ tab: activeTab }, '', window.location.pathname);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardPage events={MOCK_DATA.events || []} finance={MOCK_DATA} projects={projects} clients={clients} />;
      case 'clients': return <ClientsPage data={clients} allProjects={MOCK_DATA.projects || []} addToast={addToast} onUpdateClients={setClients} />;
      case 'projects': return <ProjectsPage
        data={{ ...MOCK_DATA, projects }}
        allClients={clients}
        addToast={addToast}
        allTransactions={transactions}
        onAddGlobalTx={(tx) => {
          const txWithId = { ...tx, id: tx.id || `tx-${Date.now()}`, createdAt: tx.createdAt || new Date().toISOString() };
          setTransactions(prev => [txWithId, ...prev]);
        }}
        onUpdateProject={(updatedProject) => {
          setProjects(prev => {
            const exists = prev.find(p => p.id === updatedProject.id);
            if (exists) {
              return prev.map(p => p.id === updatedProject.id ? updatedProject : p);
            }
            return [updatedProject, ...prev];
          });
        }}
        onDeleteProject={async (projectId) => {
          try {
            await projectsApi.delete(projectId);
            setProjects(prev => prev.filter(p => p.id !== projectId));
          } catch (error) {
            console.error('Delete project failed:', error);
            addToast(`刪除失敗: ${error.message}`, 'error');
          }
        }}
      />;
      case 'events': return <CalendarPage addToast={addToast} />;
      case 'quotations': return <QuotationsPage addToast={addToast} projects={projects} clients={clients} />;
      case 'contracts': return <Contracts />;
      case 'change-orders': return <ChangeOrders />;
      case 'invoices': return <Invoices />;
      case 'payments': return <Payments />;
      case 'finance': return <FinancePage data={MOCK_DATA} />;
      case 'profit-analysis': return <ProfitAnalysis />;
      case 'inventory': return <InventoryPage data={MOCK_DATA.inventory} addToast={addToast} />;
      case 'vendors': return <VendorsPage data={MOCK_DATA.vendors || []} addToast={addToast} />;
      case 'users': return <UserManagement addToast={addToast} />;
      case 'integrations': return <Integrations />;
      case 'storage': return <Storage />;
      case 'engineering-estimate': return <EngineeringEstimateWorkspace addToast={addToast} />;
      case 'material-calc': return <MaterialCalculator addToast={addToast} />;
      case 'cost-estimator': return <CostEstimator addToast={addToast} />;
      case 'quotation-edit': return <QuotationEditor />;
      case 'bim': return <BimManagement />;
      case 'invoice-helper': return <InvoiceHelperPage />;
      // case 'customers' removed - use clients instead
      case 'procurements': return <ProcurementsPage addToast={addToast} />;
      case 'site-logs': return <SiteLogsPage addToast={addToast} />;
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
    'engineering-estimate': '工程估算工作區',
    'quotation-edit': '報價編輯',
    'bim': 'BIM 管理',
    'invoice-helper': '發票小幫手',
    'procurements': '採購管理',
    'site-logs': '工地日誌',
    'cost-estimator': '成本估算',
    'material-calc': '材料估算'
  };
  const getTitle = () => titles[activeTab] || '儀表板';

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">載入中...</p>
        </div>
      </div>
    );
  }

  // Show login page if user is not authenticated
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 selection:bg-gray-200">

      {/* Sidebar */}
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 z-30 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-gray-200">S</div>
            <span className="mt-0.5">SENTENG</span>
          </h1>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto">
          <div className="mb-2">
            <SidebarItem icon={LayoutDashboard} label="儀表板" active={activeTab === 'dashboard'} onClick={() => navigate('dashboard')} />
          </div>

          <SidebarGroup label="營運管理">
            <SidebarItem icon={Users} label="客戶管理" active={activeTab === 'clients'} onClick={() => navigate('clients')} />

            <SidebarItem icon={Briefcase} label="專案管理" active={activeTab === 'projects'} onClick={() => navigate('projects')} />
            <SidebarItem icon={Calendar} label="行事曆" active={activeTab === 'events'} onClick={() => navigate('events')} />
          </SidebarGroup>

          <SidebarGroup label="採購工程">
            <SidebarItem icon={ShoppingCart} label="採購管理" active={activeTab === 'procurements'} onClick={() => navigate('procurements')} />
            <SidebarItem icon={ClipboardList} label="工地日誌" active={activeTab === 'site-logs'} onClick={() => navigate('site-logs')} />
          </SidebarGroup>

          <SidebarGroup label="商務文件">
            <SidebarItem icon={FileText} label="報價單" active={activeTab === 'quotations'} onClick={() => navigate('quotations')} />
            <SidebarItem icon={FileSignature} label="合約管理" active={activeTab === 'contracts'} onClick={() => navigate('contracts')} />
            <SidebarItem icon={RefreshCw} label="變更單" active={activeTab === 'change-orders'} onClick={() => navigate('change-orders')} />
            <SidebarItem icon={Receipt} label="發票管理" active={activeTab === 'invoices'} onClick={() => navigate('invoices')} />
            <SidebarItem icon={CreditCard} label="付款管理" active={activeTab === 'payments'} onClick={() => navigate('payments')} />
          </SidebarGroup>

          <SidebarGroup label="財務庫存">
            <SidebarItem icon={Wallet} label="財務管理" active={activeTab === 'finance'} onClick={() => navigate('finance')} />
            <SidebarItem icon={TrendingUp} label="利潤分析" active={activeTab === 'profit-analysis'} onClick={() => navigate('profit-analysis')} />
            <SidebarItem icon={Package} label="庫存管理" active={activeTab === 'inventory'} onClick={() => navigate('inventory')} />
            <SidebarItem icon={HardHat} label="廠商管理" active={activeTab === 'vendors'} onClick={() => navigate('vendors')} />
          </SidebarGroup>

          <SidebarGroup label="工程估算">
            <SidebarItem icon={Layers} label="工程估算" active={activeTab === 'engineering-estimate'} onClick={() => navigate('engineering-estimate')} />
            <SidebarItem icon={Calculator} label="材料估算" active={activeTab === 'material-calc'} onClick={() => navigate('material-calc')} />
            <SidebarItem icon={Ruler} label="成本估算" active={activeTab === 'cost-estimator'} onClick={() => navigate('cost-estimator')} />
            <SidebarItem icon={Building2} label="BIM 管理" active={activeTab === 'bim'} onClick={() => navigate('bim')} />
            <SidebarItem icon={Receipt} label="發票小幫手" active={activeTab === 'invoice-helper'} onClick={() => navigate('invoice-helper')} />
          </SidebarGroup>

          <SidebarGroup label="設定">
            <SidebarItem icon={Users} label="使用者管理" active={activeTab === 'users'} onClick={() => navigate('users')} />
            <SidebarItem icon={Link2} label="整合設定" active={activeTab === 'integrations'} onClick={() => navigate('integrations')} />
            <SidebarItem icon={FolderOpen} label="文件管理" active={activeTab === 'storage'} onClick={() => navigate('storage')} />
          </SidebarGroup>
        </nav>

        <div className="p-4 border-t border-gray-50">
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                {user?.displayName?.[0] || user?.email?.[0] || 'G'}
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900 truncate max-w-[100px]">{user?.displayName || '訪客'}</p>
              <p className="text-xs text-gray-400">v3.2.1 ({user?.role || 'guest'})</p>
            </div>
            <button
              onClick={signOut}
              className="p-2 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
              title="登出"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 flex-1 flex flex-col min-h-screen">

        {/* Top Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-10 px-4 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 className="text-xl font-bold text-gray-800">{getTitle()}</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Bell size={20} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{user?.displayName || '訪客'}</p>
                <p className="text-xs text-gray-400">{user?.role === 'super_admin' ? '最高管理員' : user?.role === 'admin' ? '管理員' : '使用者'}</p>
              </div>
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full object-cover shadow-lg shadow-gray-200" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold shadow-lg shadow-gray-200">
                  {user?.displayName?.[0] || user?.email?.[0] || 'G'}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </div>

      </main>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav
        currentPath={activeTab}
        onNavigate={navigate}
        className="lg:hidden"
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default App;
