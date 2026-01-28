/**
 * Dashboard - Rational Neutral v1.3
 *
 * Stitch-aligned layout with:
 * - Greeting header + date
 * - Today's schedule card
 * - 4 KPI stat cards
 * - Recent projects grid
 * - Finance summary
 * - Memos section
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Briefcase,
  Wallet,
  HardHat,
  CheckCircle2,
  ArrowUpRight,
  Circle,
  Plus,
  MoreHorizontal,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

// Greeting based on time
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return '早安';
  if (hour < 18) return '午安';
  return '晚安';
};

// Format date in Chinese
const formatDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return {
    full: `${year}年 ${month}月 ${day.toString().padStart(2, '0')}日`,
    weekday: `星期${weekdays[d.getDay()]}`,
  };
};

// Progress bar component
const ProgressBar = ({ value }) => (
  <div className="w-full bg-gray-100 rounded-full h-2">
    <div
      className="bg-gray-800 h-2 rounded-full transition-all duration-500"
      style={{ width: `${value}%` }}
    />
  </div>
);

const Dashboard = ({ events = [], finance = {}, projects = [], clients = [] }) => {
  const { user } = useAuth();
  const userName = user?.displayName || user?.email?.split('@')[0] || '使用者';
  const greeting = getGreeting();
  const { full: dateStr, weekday } = formatDate();

  // Calculate stats
  const activeProjectsCount = projects.filter(p =>
    ['設計中', '施工中', '進行中'].includes(p.status)
  ).length;
  const constructionCount = projects.filter(p => p.status === '施工中').length;
  const nearCompletionCount = projects.filter(p => p.progress >= 80).length;
  const monthlyIncome =
    finance.transactions
      ?.filter(t => t.type === '收入')
      ?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

  // Mock financial data
  const estimatedIncome = 1250;
  const estimatedExpense = 420;

  // Memos state
  const [memos, setMemos] = useState([
    { id: 1, text: '確認廚房大理石樣品', done: false },
    { id: 2, text: '約黃先生場勘', done: false },
    { id: 3, text: '請款單整理', done: true },
  ]);

  const toggleMemo = id => {
    setMemos(prev => prev.map(m => (m.id === id ? { ...m, done: !m.done } : m)));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ===== Header: Greeting & Date ===== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}，{userName}
          </h1>
          <p className="text-gray-500 mt-1">今天又是充滿創意與挑戰的一天，來看看今日行程吧。</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm font-medium text-gray-500">{dateStr}</p>
          <p className="text-xs text-gray-400">{weekday}</p>
        </div>
      </div>

      {/* ===== Today's Schedule Card ===== */}
      <Card className="border-l-4 border-l-gray-800">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Calendar size={20} className="text-gray-700" />
            今日行程
          </h3>
          <div className="flex gap-2">
            <button className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-1.5 border rounded-lg hover:bg-gray-50 transition-colors">
              同步 Google
            </button>
            <button className="text-sm text-white bg-gray-800 hover:bg-gray-900 font-medium px-3 py-1.5 rounded-lg transition-colors">
              查看全部
            </button>
          </div>
        </div>
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <Calendar size={32} className="mb-2 opacity-50" />
            <span className="text-sm">今天無安排，享受美好時光！</span>
          </div>
        ) : (
          <div className="space-y-3">
            {events.slice(0, 4).map(evt => (
              <div key={evt.id} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-mono font-bold text-gray-700">{evt.time}</span>
                <span className="text-sm text-gray-600">{evt.title}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ===== KPI Cards (4 columns) ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 進行中專案 */}
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

        {/* 本月實收 */}
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

        {/* 施工中案場 */}
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

        {/* 即將完工 */}
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

      {/* ===== Main Content: Projects + Finance + Memos ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Projects + Finance */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Projects */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">近期專案動態</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.slice(0, 2).map(project => (
                <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-gray-800">{project.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{project.code}</p>
                    </div>
                    <Badge color={project.status === '施工中' ? 'gray' : 'gray'}>
                      {project.status}
                    </Badge>
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
              {projects.length === 0 && (
                <Card className="col-span-2 py-8 text-center text-gray-400">
                  <Briefcase size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">目前無進行中專案</p>
                </Card>
              )}
            </div>
          </div>

          {/* Finance Summary */}
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

        {/* Right: Memos */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">備忘錄</h3>
          <Card className="h-full max-h-[400px] overflow-y-auto">
            <ul className="space-y-4">
              {memos.map(memo => (
                <li
                  key={memo.id}
                  className="flex items-start gap-3 group cursor-pointer"
                  onClick={() => toggleMemo(memo.id)}
                >
                  {memo.done ? (
                    <CheckCircle2 size={20} className="text-gray-600 mt-0.5 shrink-0" />
                  ) : (
                    <Circle
                      size={20}
                      className="text-gray-300 mt-0.5 shrink-0 group-hover:text-gray-400"
                    />
                  )}
                  <span
                    className={`text-sm leading-relaxed ${memo.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}
                  >
                    {memo.text}
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

export default Dashboard;
