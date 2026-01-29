import React, { useState, useEffect } from 'react';
import { Book, Sparkles, ExternalLink, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://erp-api-381507943724.asia-east1.run.app';

/**
 * RegulationPanel - 可嵌入估價模組的法規資訊面板
 * 根據材料類別自動顯示相關法規和 CNS 標準
 */
export default function RegulationPanel({ materialCategory, expanded = false, onToggle }) {
    const [isExpanded, setIsExpanded] = useState(expanded);
    const [regulations, setRegulations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [aiEnabled, setAiEnabled] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState([]);

    useEffect(() => {
        if (materialCategory) {
            loadRegulations();
            checkAiAndSuggest();
        }
    }, [materialCategory]);

    const loadRegulations = async () => {
        if (!materialCategory) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/v1/regulations/materials/${encodeURIComponent(materialCategory)}`);
            if (res.ok) {
                const data = await res.json();
                setRegulations(data.regulations || []);
            }
        } catch (err) {
            console.error('Failed to load regulations:', err);
        } finally {
            setLoading(false);
        }
    };

    const checkAiAndSuggest = async () => {
        try {
            // Check AI status
            const statusRes = await fetch(`${API_BASE}/api/v1/regulations/ai/status`);
            if (statusRes.ok) {
                const status = await statusRes.json();
                setAiEnabled(status.enabled);

                // Get AI suggestions if enabled
                if (status.enabled && materialCategory) {
                    const suggestRes = await fetch(`${API_BASE}/api/v1/regulations/ai/suggest/${encodeURIComponent(materialCategory)}`);
                    if (suggestRes.ok) {
                        const data = await suggestRes.json();
                        setAiSuggestions(data.suggestions || []);
                    }
                }
            }
        } catch (err) {
            console.error('AI check failed:', err);
        }
    };

    const handleToggle = () => {
        const newState = !isExpanded;
        setIsExpanded(newState);
        onToggle?.(newState);
    };

    if (!materialCategory) {
        return null;
    }

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
            {/* Header - Always visible */}
            <button
                onClick={handleToggle}
                className="w-full flex items-center justify-between p-3 hover:bg-blue-100 transition"
            >
                <div className="flex items-center gap-2">
                    <Book className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">相關法規資訊</span>
                    {regulations.length > 0 && (
                        <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full">
                            {regulations.length} 條
                        </span>
                    )}
                    {aiEnabled && aiSuggestions.length > 0 && (
                        <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> AI
                        </span>
                    )}
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-blue-600" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-blue-600" />
                )}
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="p-3 pt-0 space-y-3">
                    {loading ? (
                        <div className="text-center py-4 text-blue-600">
                            <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
                            載入中...
                        </div>
                    ) : (
                        <>
                            {/* AI Suggestions */}
                            {aiEnabled && aiSuggestions.length > 0 && (
                                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                                    <div className="flex items-center gap-1 text-xs text-purple-700 mb-2">
                                        <Sparkles className="w-3 h-3" />
                                        AI 建議相關法規
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {aiSuggestions.map((code, idx) => (
                                            <span
                                                key={idx}
                                                className="text-xs bg-white px-2 py-1 rounded border border-purple-200 text-purple-800"
                                            >
                                                {code}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Regulations List */}
                            {regulations.length > 0 ? (
                                <div className="space-y-2">
                                    {regulations.slice(0, 5).map((reg, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-white p-3 rounded border text-sm"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-blue-600">
                                                            {reg.sourceName} 第 {reg.articleNo} 條
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 text-xs line-clamp-2">
                                                        {reg.content}
                                                    </p>
                                                </div>
                                                {reg.sourceUrl && (
                                                    <a
                                                        href={reg.sourceUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 hover:text-blue-700 flex-shrink-0"
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {regulations.length > 5 && (
                                        <p className="text-xs text-blue-600 text-center">
                                            還有 {regulations.length - 5} 條相關法規...
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>此材料類別尚無對應法規</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
