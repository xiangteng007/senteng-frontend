import React, { useState, useEffect } from 'react';
import { Search, Book, FileText, Layers, RefreshCw, ExternalLink, Sparkles, ChevronRight } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://erp-api-381507943724.asia-east1.run.app';

// 法規來源類別
const REGULATION_CATEGORIES = [
    { id: 'building', name: '建築技術規則', icon: '🏗️', pcode: 'D0070115' },
    { id: 'interior', name: '室內裝修管理', icon: '🏠', pcode: 'D0070148' },
    { id: 'structure', name: '建築構造編', icon: '🔩', pcode: 'D0070117' },
    { id: 'equipment', name: '建築設備編', icon: '⚡', pcode: 'D0070116' },
];

// CNS 分類圖示
const CNS_ICONS = {
    steel: '🔩', concrete: '🧱', board: '📋', wood: '🪵',
    coating: '🎨', tile: '🔲', glass: '🪟', insulation: '🧊',
    drafting: '📐', other: '📦',
};

export default function Regulations() {
    const [activeTab, setActiveTab] = useState('regulations'); // 'regulations' | 'cns'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [articles, setArticles] = useState([]);
    const [cnsStandards, setCnsStandards] = useState([]);
    const [cnsCategories, setCnsCategories] = useState([]);
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [syncStatus, setSyncStatus] = useState(null);
    const [aiEnabled, setAiEnabled] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null);

    // 載入法規來源
    useEffect(() => {
        loadSources();
        checkAiStatus();
    }, []);

    // 載入 CNS 分類
    useEffect(() => {
        if (activeTab === 'cns') {
            loadCnsCategories();
        }
    }, [activeTab]);

    const loadSources = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/v1/regulations/sources`);
            if (res.ok) {
                const data = await res.json();
                setSources(data);
            }
        } catch (err) {
            console.error('Failed to load sources:', err);
        }
    };

    const checkAiStatus = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/v1/regulations/ai/status`);
            if (res.ok) {
                const data = await res.json();
                setAiEnabled(data.enabled);
            }
        } catch (err) {
            console.error('Failed to check AI status:', err);
        }
    };

    const loadCnsCategories = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/v1/regulations/cns/categories`);
            if (res.ok) {
                const data = await res.json();
                setCnsCategories(data);
            }
        } catch (err) {
            console.error('Failed to load CNS categories:', err);
        }
    };

    const searchArticles = async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({ query: searchQuery, limit: '50' });
            if (selectedCategory) {
                params.append('pcode', selectedCategory);
            }
            const res = await fetch(`${API_BASE}/api/v1/regulations/search?${params}`);
            if (res.ok) {
                const data = await res.json();
                setArticles(data);
            }
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const searchCns = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (selectedCategory) params.append('category', selectedCategory);
            const res = await fetch(`${API_BASE}/api/v1/regulations/cns?${params}`);
            if (res.ok) {
                const data = await res.json();
                setCnsStandards(data);
            }
        } catch (err) {
            console.error('CNS search failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const triggerSync = async () => {
        try {
            setSyncStatus({ status: 'running' });
            await fetch(`${API_BASE}/api/v1/regulations/sync`, { method: 'POST' });
            // Poll for status
            const interval = setInterval(async () => {
                const res = await fetch(`${API_BASE}/api/v1/regulations/sync/status`);
                if (res.ok) {
                    const data = await res.json();
                    setSyncStatus(data);
                    if (data.status === 'completed' || data.status === 'failed') {
                        clearInterval(interval);
                        loadSources();
                    }
                }
            }, 2000);
        } catch (err) {
            console.error('Sync failed:', err);
            setSyncStatus({ status: 'failed', message: err.message });
        }
    };

    const generateAiSummary = async (articleId) => {
        if (!aiEnabled) return;
        try {
            const res = await fetch(`${API_BASE}/api/v1/regulations/ai/summary/article/${articleId}`, {
                method: 'POST',
            });
            if (res.ok) {
                const data = await res.json();
                setSelectedArticle({ ...selectedArticle, aiSummary: data.summary });
            }
        } catch (err) {
            console.error('AI summary failed:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Book className="w-6 h-6 text-blue-600" />
                        <h1 className="text-xl font-semibold">法規智能系統</h1>
                        {aiEnabled && (
                            <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> AI 啟用
                            </span>
                        )}
                    </div>
                    <button
                        onClick={triggerSync}
                        disabled={syncStatus?.status === 'running'}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${syncStatus?.status === 'running' ? 'animate-spin' : ''}`} />
                        {syncStatus?.status === 'running' ? `同步中 ${syncStatus.progress || 0}%` : '同步法規'}
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mt-4">
                    <button
                        onClick={() => { setActiveTab('regulations'); setSelectedCategory(null); setArticles([]); }}
                        className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'regulations' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <FileText className="w-4 h-4 inline mr-2" />
                        建築法規
                    </button>
                    <button
                        onClick={() => { setActiveTab('cns'); setSelectedCategory(null); setCnsStandards([]); }}
                        className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'cns' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Layers className="w-4 h-4 inline mr-2" />
                        CNS 標準
                    </button>
                </div>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <div className="w-64 bg-white border-r min-h-[calc(100vh-120px)] p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">
                        {activeTab === 'regulations' ? '法規分類' : 'CNS 分類'}
                    </h3>

                    {activeTab === 'regulations' ? (
                        <div className="space-y-1">
                            {REGULATION_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.pcode)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition ${selectedCategory === cat.pcode ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <span>{cat.icon}</span>
                                    <span className="text-sm">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {cnsCategories.map(cat => (
                                <button
                                    key={cat.category}
                                    onClick={() => { setSelectedCategory(cat.category); searchCns(); }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${selectedCategory === cat.category ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{CNS_ICONS[cat.category] || '📦'}</span>
                                        <span className="text-sm">{cat.label}</span>
                                    </div>
                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{cat.count}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6">
                    {/* Search */}
                    <div className="flex gap-3 mb-6">
                        <div className="flex-1 relative">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (activeTab === 'regulations' ? searchArticles() : searchCns())}
                                placeholder={activeTab === 'regulations' ? '搜尋法規條文...' : '搜尋 CNS 標準...'}
                                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <button
                            onClick={activeTab === 'regulations' ? searchArticles : searchCns}
                            disabled={loading}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? '搜尋中...' : '搜尋'}
                        </button>
                    </div>

                    {/* Results */}
                    {activeTab === 'regulations' ? (
                        <div className="space-y-3">
                            {articles.length === 0 && !loading && (
                                <div className="text-center py-12 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>輸入關鍵字搜尋法規條文</p>
                                </div>
                            )}
                            {articles.map(article => (
                                <div
                                    key={article.id}
                                    className="bg-white p-4 rounded-lg border hover:shadow-md transition cursor-pointer"
                                    onClick={() => setSelectedArticle(article)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-blue-600">
                                                    第 {article.articleNo} 條
                                                </span>
                                                {article.chapter && (
                                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                                        {article.chapter}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {article.content}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cnsStandards.length === 0 && !loading && (
                                <div className="col-span-2 text-center py-12 text-gray-500">
                                    <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>選擇分類或輸入關鍵字搜尋 CNS 標準</p>
                                </div>
                            )}
                            {cnsStandards.map(cns => (
                                <div
                                    key={cns.id}
                                    className="bg-white p-4 rounded-lg border hover:shadow-md transition"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-2xl">{CNS_ICONS[cns.category] || '📦'}</span>
                                        <div>
                                            <h4 className="font-medium text-blue-600">{cns.cnsNumber}</h4>
                                            <p className="text-sm text-gray-800">{cns.title}</p>
                                        </div>
                                    </div>
                                    {cns.scope && (
                                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{cns.scope}</p>
                                    )}
                                    {cns.sourceUrl && (
                                        <a
                                            href={cns.sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-blue-500 mt-2 hover:underline"
                                        >
                                            <ExternalLink className="w-3 h-3" /> 查看原文
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Article Detail Modal */}
            {selectedArticle && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">
                                    第 {selectedArticle.articleNo} 條
                                </h3>
                                <button
                                    onClick={() => setSelectedArticle(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <p className="text-gray-700 whitespace-pre-wrap">{selectedArticle.content}</p>

                            {aiEnabled && (
                                <div className="mt-6 pt-4 border-t">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-purple-500" />
                                            AI 摘要
                                        </h4>
                                        <button
                                            onClick={() => generateAiSummary(selectedArticle.id)}
                                            className="text-sm text-purple-600 hover:text-purple-700"
                                        >
                                            產生摘要
                                        </button>
                                    </div>
                                    {selectedArticle.aiSummary ? (
                                        <p className="text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
                                            {selectedArticle.aiSummary}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-400">點擊「產生摘要」使用 AI 分析此法規</p>
                                    )}
                                </div>
                            )}

                            {selectedArticle.sourceUrl && (
                                <a
                                    href={selectedArticle.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-blue-500 mt-4 hover:underline"
                                >
                                    <ExternalLink className="w-4 h-4" /> 查看法規原文
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
