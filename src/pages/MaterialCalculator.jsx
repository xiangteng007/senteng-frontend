
import React, { useState, useRef, useEffect } from 'react';
import {
    Calculator, Building2, Layers, Grid3X3, Paintbrush, BarChart3,
    Info, RotateCcw, Settings2, ChevronDown, ChevronUp, Copy, Check,
    FileSpreadsheet, Plus, Trash2, ExternalLink, RefreshCw, Download, History, Save
} from 'lucide-react';
import { SectionTitle } from '../components/common/Indicators';
import { GoogleService } from '../services/GoogleService';
import { useCmmData } from '../hooks/useCmmData';
import {
    exportToExcel, exportToPDF,
    saveToHistory, getHistory, deleteFromHistory, clearHistory,
    saveDraft, getDraft
} from '../utils/exportUtils';

// ============================================
// 計算公式與常數定義
// ============================================

// 預設損耗率 (%)
const DEFAULT_WASTAGE = {
    concrete: 3,
    rebar: 5,
    formwork: 10,
    cement: 10,
    sand: 10,
    brick: 5,
    tile: 5,
    grout: 15,
    adhesive: 10,
    paint: 10,
    putty: 10,
};

// 紅磚用量對照表 (塊/m²)
const BRICK_PER_SQM = {
    '12': { label: '12牆 (12cm)', count: 64 },
    '18': { label: '18牆 (18cm)', count: 96 },
    '24': { label: '24牆 (24cm)', count: 128 },
    '37': { label: '37牆 (37cm)', count: 192 },
};

// 磁磚尺寸選項
const TILE_SIZES = [
    { label: '30×30 cm', l: 30, w: 30 },
    { label: '30×60 cm', l: 30, w: 60 },
    { label: '45×45 cm', l: 45, w: 45 },
    { label: '60×60 cm', l: 60, w: 60 },
    { label: '60×120 cm', l: 60, w: 120 },
    { label: '80×80 cm', l: 80, w: 80 },
    { label: '自訂', l: 0, w: 0 },
];

// 磁磚施工方法分類
const TILE_METHODS = [
    { value: 'none', label: '未選擇' },
    { value: 'wet', label: '濕式工法(軟底)' },
    { value: 'dry', label: '乾式工法(硬底)' },
    { value: 'semi', label: '半乾濕式(騷底)' },
    { value: 'hang', label: '乾掛式工法' },
];

// 粉光配比對照表
const PLASTER_RATIOS = {
    '1:2': { label: '1:2 粉光 (細)', cementPerM3: 650, sandPerM3: 800, desc: '細緻粉光面' },
    '1:3': { label: '1:3 打底 (粗)', cementPerM3: 450, sandPerM3: 950, desc: '一般打底用' },
};

// 牆壁厚度選項
const WALL_THICKNESS_OPTIONS = [
    { value: 'all', label: '全部厚度' },
    { value: 15, label: '15 cm' },
    { value: 18, label: '18 cm' },
    { value: 20, label: '20 cm' },
    { value: 24, label: '24 cm (1B磚)' },
    { value: 25, label: '25 cm' },
    { value: 30, label: '30 cm' },
];

// 建築類型概估指標 (依據台灣營建業界標準)
// 資料來源：公共工程委員會、高雄結構技師公會、交大結構實驗室
// 單位：鋼筋 kg/m², 混凝土 m³/m², 模板 m²/m², 砂(粉刷用) m³/m²
// 業界經驗值：鋼筋 330-400 kg/坪, 混凝土 2.4-3.0 m³/坪, 模板 3.0-4.0倍樓地板面積
const BUILDING_TYPES = [
    // RC 鋼筋混凝土結構
    { label: 'RC透天 (2-3F)', rebar: 100, concrete: 0.73, formwork: 3.0, sand: 0.18, structure: 'RC', wallThickness: 15 },
    { label: 'RC透天 (4-5F)', rebar: 112, concrete: 0.79, formwork: 3.2, sand: 0.20, structure: 'RC', wallThickness: 18 },
    { label: '別墅 (RC)', rebar: 106, concrete: 0.76, formwork: 3.0, sand: 0.18, structure: 'RC', wallThickness: 18 },
    { label: '公寓 (5-6F)', rebar: 109, concrete: 0.79, formwork: 3.3, sand: 0.20, structure: 'RC', wallThickness: 18 },
    { label: '大樓 (7-12F)', rebar: 112, concrete: 0.82, formwork: 3.4, sand: 0.22, structure: 'RC', wallThickness: 20 },
    { label: '高層 (13-20F)', rebar: 115, concrete: 0.85, formwork: 3.5, sand: 0.24, structure: 'RC', wallThickness: 25 },
    { label: '高層 (21-30F)', rebar: 121, concrete: 0.91, formwork: 3.6, sand: 0.26, structure: 'RC', wallThickness: 30 },
    { label: '超高層 (30F+)', rebar: 130, concrete: 0.95, formwork: 3.8, sand: 0.28, structure: 'SRC', wallThickness: 35 },
    { label: '辦公大樓', rebar: 115, concrete: 0.85, formwork: 3.5, sand: 0.24, structure: 'RC/SRC', wallThickness: 25 },
    { label: '工業廠房 (SC)', rebar: 45, concrete: 0.35, formwork: 2.0, sand: 0.12, structure: 'SC', wallThickness: 15 },
    { label: '地下室 (每層)', rebar: 145, concrete: 1.10, formwork: 4.0, sand: 0.30, structure: 'RC', wallThickness: 30 },
    // RB 加強磚造結構
    { label: '透天厝 (RB 3F)', rebar: 55, concrete: 0.45, formwork: 2.2, sand: 0.25, structure: 'RB', wallThickness: 24 },
    { label: '農舍/倉庫 (RB)', rebar: 45, concrete: 0.38, formwork: 1.8, sand: 0.22, structure: 'RB', wallThickness: 24 },
];

// 鋼筋規格表 (含工程常用號數)
const REBAR_SPECS = [
    { label: '#3 D10 (9.53mm)', d: 9.53, weight: 0.56 },
    { label: '#4 D13 (12.7mm)', d: 12.7, weight: 0.99 },
    { label: '#5 D16 (15.9mm)', d: 15.9, weight: 1.56 },
    { label: '#6 D19 (19.1mm)', d: 19.1, weight: 2.25 },
    { label: '#7 D22 (22.2mm)', d: 22.2, weight: 3.04 },
    { label: '#8 D25 (25.4mm)', d: 25.4, weight: 3.98 },
    { label: '#9 D29 (28.7mm)', d: 28.7, weight: 5.08 },
    { label: '#10 D32 (32.2mm)', d: 32.2, weight: 6.39 },
];

// 各部位鋼筋用量概算指標 (kg/m²) - 營造經驗數據
const REBAR_USAGE_BY_COMPONENT = {
    wall: [
        { label: 'RC牆 15cm', thickness: 15, usage: 23, desc: '主筋@20+箍筋' },
        { label: 'RC牆 18cm', thickness: 18, usage: 29, desc: '主筋@15+箍筋' },
        { label: 'RC牆 20cm', thickness: 20, usage: 34, desc: '雙層主筋+箍筋' },
        { label: 'RC牆 25cm', thickness: 25, usage: 47, desc: '雙層主筋+加強箍筋' },
        { label: 'RC牆 30cm', thickness: 30, usage: 58, desc: '雙層主筋+密箍' },
    ],
    floor: [
        { label: '樓板 12cm', thickness: 12, usage: 13, desc: '單層雙向配筋' },
        { label: '樓板 15cm', thickness: 15, usage: 17, desc: '單層雙向配筋' },
        { label: '加厚板 18cm', thickness: 18, usage: 25, desc: '雙層雙向配筋' },
        { label: '屋頂板', thickness: 12, usage: 16, desc: '含隔熱層配筋' },
    ],
    stair: [
        { label: '直跑樓梯', usage: 40, desc: '踏板+斜版' },
        { label: '迴轉樓梯', usage: 50, desc: '含中間平台' },
        { label: '懸臂樓梯', usage: 62, desc: '高配筋' },
    ],
    beam: [
        { label: '一般大梁', usage: 85, desc: '主筋+箍筋 (kg/m³)' },
        { label: '框架梁', usage: 100, desc: '高配筋 (kg/m³)' },
    ],
    column: [
        { label: '一般柱', usage: 120, desc: '主筋+箍筋 (kg/m³)' },
        { label: '框架柱', usage: 150, desc: '高配筋 (kg/m³)' },
    ],
};

// ============================================
// 結構模板計算常數
// ============================================

// 女兒牆厚度選項 (cm)
const PARAPET_THICKNESS_OPTIONS = [
    { value: 12, label: '12 cm' },
    { value: 15, label: '15 cm (常用)' },
    { value: 18, label: '18 cm' },
    { value: 20, label: '20 cm' },
    { value: 'custom', label: '自訂' },
];

// 地樑預設尺寸 (寬×高 cm)
const GROUND_BEAM_PRESETS = [
    { value: 'GB1', label: 'GB1 小地樑', width: 30, height: 50, desc: '輕型結構' },
    { value: 'GB2', label: 'GB2 一般地樑', width: 35, height: 60, desc: '透天住宅' },
    { value: 'GB3', label: 'GB3 標準地樑', width: 40, height: 70, desc: '公寓/商辦' },
    { value: 'GB4', label: 'GB4 大地樑', width: 50, height: 80, desc: '高層建築' },
    { value: 'GB5', label: 'GB5 特大地樑', width: 60, height: 100, desc: '重載結構' },
    { value: 'custom', label: '自訂尺寸', width: 0, height: 0, desc: '' },
];

// 柱子預設尺寸
const COLUMN_PRESETS = [
    { value: 'C1', label: 'C1 小柱 30×30', width: 30, depth: 30, type: 'square', desc: '輕型結構' },
    { value: 'C2', label: 'C2 一般柱 40×40', width: 40, depth: 40, type: 'square', desc: '透天住宅' },
    { value: 'C3', label: 'C3 標準柱 50×50', width: 50, depth: 50, type: 'square', desc: '公寓/商辦' },
    { value: 'C4', label: 'C4 大柱 60×60', width: 60, depth: 60, type: 'square', desc: '高層建築' },
    { value: 'C5', label: 'C5 矩形柱 40×60', width: 40, depth: 60, type: 'square', desc: '特殊配置' },
    { value: 'C6', label: 'C6 矩形柱 50×80', width: 50, depth: 80, type: 'square', desc: '大跨距' },
    { value: 'R1', label: 'R1 圓柱 Ø40', diameter: 40, type: 'round', desc: '室內裝飾' },
    { value: 'R2', label: 'R2 圓柱 Ø50', diameter: 50, type: 'round', desc: '標準圓柱' },
    { value: 'R3', label: 'R3 圓柱 Ø60', diameter: 60, type: 'round', desc: '大型圓柱' },
    { value: 'custom', label: '自訂尺寸', width: 0, depth: 0, type: 'square', desc: '' },
];

// 牆壁厚度選項 (cm)
const WALL_THICKNESS_PRESETS = [
    { value: 'W1', label: 'W1 薄牆 12cm', thickness: 12, desc: '隔間牆' },
    { value: 'W2', label: 'W2 標準牆 15cm', thickness: 15, desc: '一般RC牆' },
    { value: 'W3', label: 'W3 承重牆 18cm', thickness: 18, desc: '承重牆' },
    { value: 'W4', label: 'W4 厚牆 20cm', thickness: 20, desc: '外牆/剪力牆' },
    { value: 'W5', label: 'W5 加厚牆 25cm', thickness: 25, desc: '地下室牆' },
    { value: 'W6', label: 'W6 特厚牆 30cm', thickness: 30, desc: '擋土牆' },
    { value: 'custom', label: '自訂厚度', thickness: 0, desc: '' },
];

// 樓板厚度選項 (cm)
const FLOOR_THICKNESS_PRESETS = [
    { value: 'F1', label: 'F1 薄板 10cm', thickness: 10, desc: '輕載樓板' },
    { value: 'F2', label: 'F2 標準板 12cm', thickness: 12, desc: '一般住宅' },
    { value: 'F3', label: 'F3 加厚板 15cm', thickness: 15, desc: '商辦/公寓' },
    { value: 'F4', label: 'F4 厚板 18cm', thickness: 18, desc: '重載樓板' },
    { value: 'F5', label: 'F5 特厚板 20cm', thickness: 20, desc: '停車場/屋頂' },
    { value: 'F6', label: 'F6 筏基板 25cm', thickness: 25, desc: '筏式基礎' },
    { value: 'custom', label: '自訂厚度', thickness: 0, desc: '' },
];

// 構件配筋率 (kg/m³ 混凝土) - 用於快速估算模式
// 資料來源：台灣營建業界標準經驗值
const REBAR_RATIO_BY_COMPONENT = {
    column: { light: 100, standard: 120, heavy: 150, label: '柱' },
    beam: { light: 80, standard: 100, heavy: 130, label: '梁' },
    floor: { light: 60, standard: 75, heavy: 90, label: '樓板' },
    wall: { light: 60, standard: 70, heavy: 85, label: '牆' },
    parapet: { light: 50, standard: 60, heavy: 75, label: '女兒牆' },
    groundbeam: { light: 90, standard: 110, heavy: 140, label: '地梁' },
    foundation: { light: 80, standard: 100, heavy: 130, label: '基礎' },
};

// ============================================
// 精確配筋計算常量 (CNS 560 標準)
// ============================================

// 鋼筋號數與單位重量
const REBAR_SIZES = [
    { value: '#3', label: '#3 (D10)', diameter: 10, unitWeight: 0.560 },
    { value: '#4', label: '#4 (D13)', diameter: 13, unitWeight: 0.995 },
    { value: '#5', label: '#5 (D16)', diameter: 16, unitWeight: 1.56 },
    { value: '#6', label: '#6 (D19)', diameter: 19, unitWeight: 2.25 },
    { value: '#7', label: '#7 (D22)', diameter: 22, unitWeight: 3.04 },
    { value: '#8', label: '#8 (D25)', diameter: 25, unitWeight: 3.98 },
];

// 鋼筋間距選項 (mm)
const REBAR_SPACING_OPTIONS = [
    { value: 100, label: '@100mm (密)' },
    { value: 150, label: '@150mm' },
    { value: 200, label: '@200mm (標準)' },
    { value: 250, label: '@250mm' },
    { value: 300, label: '@300mm (疏)' },
];

// 配筋層數選項
const REBAR_LAYER_OPTIONS = [
    { value: 'single', label: '單層配筋', multiplier: 1 },
    { value: 'double', label: '雙層配筋', multiplier: 2 },
];

// 混凝土規格 (抗壓強度 kgf/cm²) + 台灣市場參考單價
const CONCRETE_GRADES = [
    { value: 140, label: "fc'140", desc: '墊層/填充', price: 2200 },
    { value: 175, label: "fc'175", desc: '輕載結構', price: 2400 },
    { value: 210, label: "fc'210", desc: '一般結構 (預設)', price: 2600 },
    { value: 245, label: "fc'245", desc: '中跨度梁柱', price: 2800 },
    { value: 280, label: "fc'280", desc: '高層建築', price: 3000 },
    { value: 315, label: "fc'315", desc: '預力構件', price: 3200 },
    { value: 350, label: "fc'350", desc: '特殊結構', price: 3500 },
];

// 柱子主筋根數選項
const COLUMN_MAIN_BAR_COUNT = [
    { value: 4, label: '4根' },
    { value: 6, label: '6根' },
    { value: 8, label: '8根' },
    { value: 10, label: '10根' },
    { value: 12, label: '12根' },
    { value: 16, label: '16根' },
];

// ============================================
// 法規參照與實務常用配置
// ============================================

// 法規參照 (建築技術規則)
const REGULATION_REFS = {
    floor: {
        code: '建技規§401',
        title: '樓板設計',
        rules: [
            '樓板最小厚度不得小於 10cm',
            '雙向板最小厚度 h ≥ L/36',
            '鋼筋間距不得大於板厚 3 倍或 45cm',
        ],
    },
    wall: {
        code: '建技規§409',
        title: '剪力牆設計',
        rules: [
            '牆厚不得小於 15cm',
            '雙向配筋，水平及垂直筋比 ≥ 0.0025',
            '鋼筋間距不得大於 45cm',
        ],
    },
    column: {
        code: '建技規§407',
        title: '柱設計',
        rules: [
            '主筋比 1% ~ 8%',
            '主筋不得少於 4 根',
            '箍筋間距 ≤ 柱最小尺寸或 d/2',
        ],
    },
    beam: {
        code: '建技規§406',
        title: '梁設計',
        rules: [
            '梁深 h ≥ 淨跨/16',
            '拉筋比 ≥ 0.004',
            '箍筋間距 ≤ d/2 或 60cm',
        ],
    },
    groundbeam: {
        code: '建技規§406',
        title: '地梁設計',
        rules: [
            '地梁深度 ≥ 淨跨/12',
            '主筋搭接長度 ≥ 40db',
            '箍筋需延伸至基礎內',
        ],
    },
    foundation: {
        code: '建技規§415',
        title: '基礎設計',
        rules: [
            '最小配筋率 ≥ 0.0018',
            '保護層厚度 ≥ 7.5cm (接地)',
            '素混凝土墊層厚度 ≥ 5cm',
        ],
    },
    parapet: {
        code: '建技規§410',
        title: '女兒牆設計',
        rules: [
            '高度超過 1.2m 需設計配筋',
            '配筋同牆體規定',
            '頂部需設壓頂梁或壓樑',
        ],
    },
};

// 地梁預設配置 (含配筋)
const GROUNDBEAM_PRESETS_REBAR = {
    'GB1': { topBar: '#5', topCount: 2, bottomBar: '#5', bottomCount: 3, stirrup: '#3', stirrupSpacing: 200, desc: '透天1-2F' },
    'GB2': { topBar: '#5', topCount: 3, bottomBar: '#5', bottomCount: 4, stirrup: '#3', stirrupSpacing: 150, desc: '透天3-4F' },
    'GB3': { topBar: '#6', topCount: 3, bottomBar: '#6', bottomCount: 4, stirrup: '#4', stirrupSpacing: 150, desc: '公寓5F' },
    'GB4': { topBar: '#6', topCount: 4, bottomBar: '#6', bottomCount: 5, stirrup: '#4', stirrupSpacing: 125, desc: '高層建築' },
    'GB5': { topBar: '#7', topCount: 4, bottomBar: '#7', bottomCount: 6, stirrup: '#4', stirrupSpacing: 100, desc: '重載結構' },
    'custom': null,
};

// 柱子預設配置 (含配筋)
const COLUMN_PRESETS_REBAR = {
    'C1': { mainBar: '#5', mainCount: 4, stirrup: '#3', stirrupSpacing: 200, desc: '透天RC' },
    'C2': { mainBar: '#5', mainCount: 8, stirrup: '#3', stirrupSpacing: 150, desc: '住宅公寓' },
    'C3': { mainBar: '#6', mainCount: 8, stirrup: '#4', stirrupSpacing: 150, desc: '商辦大樓' },
    'C4': { mainBar: '#6', mainCount: 12, stirrup: '#4', stirrupSpacing: 125, desc: '高層/地下室' },
    'C5': { mainBar: '#6', mainCount: 10, stirrup: '#4', stirrupSpacing: 150, desc: '特殊配置' },
    'C6': { mainBar: '#7', mainCount: 12, stirrup: '#4', stirrupSpacing: 125, desc: '大跨距' },
    'R1': { mainBar: '#5', mainCount: 6, stirrup: '#3', stirrupSpacing: 150, desc: '室內裝飾' },
    'R2': { mainBar: '#5', mainCount: 8, stirrup: '#3', stirrupSpacing: 150, desc: '標準圓柱' },
    'R3': { mainBar: '#6', mainCount: 10, stirrup: '#4', stirrupSpacing: 150, desc: '大型圓柱' },
    'custom': null,
};

// 梁預設配置 (含配筋)
const BEAM_PRESETS_REBAR = {
    'B1': { topBar: '#5', topCount: 2, bottomBar: '#5', bottomCount: 2, stirrup: '#3', stirrupSpacing: 200, desc: '次要梁' },
    'B2': { topBar: '#6', topCount: 2, bottomBar: '#6', bottomCount: 3, stirrup: '#3', stirrupSpacing: 150, desc: '主梁' },
    'B3': { topBar: '#6', topCount: 3, bottomBar: '#6', bottomCount: 4, stirrup: '#4', stirrupSpacing: 150, desc: '大跨距' },
    'B4': { topBar: '#7', topCount: 3, bottomBar: '#7', bottomCount: 5, stirrup: '#4', stirrupSpacing: 125, desc: '重載/長跨' },
    'custom': null,
};

// 樓板預設配置 (含配筋)
const SLAB_PRESETS_REBAR = {
    'F1': { rebarSize: '#3', spacing: 200, layer: 'single', desc: '陽台/雨遮' },
    'F2': { rebarSize: '#4', spacing: 200, layer: 'double', desc: '一般樓板' },
    'F3': { rebarSize: '#4', spacing: 150, layer: 'double', desc: '大跨距/重載' },
    'F4': { rebarSize: '#5', spacing: 150, layer: 'double', desc: '廠房/倉庫' },
    'F5': { rebarSize: '#4', spacing: 200, layer: 'double', desc: '地下室頂板' },
    'F6': { rebarSize: '#5', spacing: 150, layer: 'double', desc: '筏式基礎' },
    'custom': null,
};

// 模板類型選項
const FORMWORK_TYPES = [
    { value: 'standard', label: '普通模板', coefficient: 1.0, desc: '一般施工' },
    { value: 'fairface', label: '清水模板', coefficient: 1.4, desc: '光滑面、高品質' },
    { value: 'system', label: '系統模板', coefficient: 1.2, desc: '可重複使用、效率高' },
    { value: 'steel', label: '組合鋼模', coefficient: 1.5, desc: '柱子專用、高精度' },
];

// 施工條件係數
const CONSTRUCTION_CONDITIONS = [
    { value: 'normal', label: '標準施工', coefficient: 1.0 },
    { value: 'elevated', label: '高空作業', coefficient: 1.15 },
    { value: 'confined', label: '狹窄空間', coefficient: 1.15 },
    { value: 'complex', label: '複雜造型', coefficient: 1.25 },
];

// ============================================
// 工具函數
// ============================================

const formatNumber = (num, decimals = 2) => {
    if (isNaN(num) || num === null) return '-';
    return Number(num).toLocaleString('zh-TW', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals
    });
};

const applyWastage = (value, wastagePercent) => {
    return value * (1 + wastagePercent / 100);
};

// 鋼筋搭接長度計算 (建技規§407: 搭接長度 ≥ 40d)
const getLapLength = (rebarSpec) => {
    const spec = REBAR_SPECS.find(r => r.label.includes(rebarSpec));
    if (!spec) return 500; // 預設 50cm
    return Math.ceil(spec.d * 40); // mm
};

// 取得混凝土參考單價
const getConcretePrice = (grade) => {
    const spec = CONCRETE_GRADES.find(g => g.value === grade);
    return spec?.price || 2600;
};

// 鋼筋參考單價 (NT$/kg)
const REBAR_PRICES = {
    '#3': 28,
    '#4': 26,
    '#5': 25,
    '#6': 24,
    '#7': 23,
    '#8': 22,
    '#9': 22,
    '#10': 22,
};

// 取得鋼筋參考單價
const getRebarPrice = (rebarSize) => {
    return REBAR_PRICES[rebarSize] || 25;
};

// ============================================
// 子組件
// ============================================

// 匯出工具列組件
const ExportToolbar = ({ data, elementRef, title = '計算結果', onSaveToHistory }) => {
    const [exporting, setExporting] = useState(null);

    const handleExcelExport = async () => {
        if (!data || data.length === 0) return;
        setExporting('excel');
        try {
            await exportToExcel(data, title);
        } catch (e) {
            console.error('Excel export failed:', e);
        }
        setExporting(null);
    };

    const handlePdfExport = async () => {
        if (!elementRef?.current) return;
        setExporting('pdf');
        try {
            await exportToPDF(elementRef.current, title);
        } catch (e) {
            console.error('PDF export failed:', e);
        }
        setExporting(null);
    };

    return (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <button
                onClick={handleExcelExport}
                disabled={exporting || !data?.length}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <FileSpreadsheet size={14} />
                {exporting === 'excel' ? '匯出中...' : 'Excel'}
            </button>
            <button
                onClick={handlePdfExport}
                disabled={exporting === 'pdf'}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Download size={14} />
                {exporting === 'pdf' ? '匯出中...' : 'PDF'}
            </button>
            {onSaveToHistory && (
                <button
                    onClick={onSaveToHistory}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors ml-auto"
                >
                    <Save size={14} />
                    儲存記錄
                </button>
            )}
        </div>
    );
};

// 輸入欄位組件
const InputField = ({ label, value, onChange, unit, placeholder, type = 'number', min = 0, step = 'any' }) => (
    <div className="flex-1">
        <label className="block text-xs text-gray-500 mb-1">{label}</label>
        <div className="relative">
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                min={min}
                step={step}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
            {unit && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{unit}</span>
            )}
        </div>
    </div>
);

// 下拉選單組件
const SelectField = ({ label, value, onChange, options }) => (
    <div className="flex-1">
        <label className="block text-xs text-gray-500 mb-1">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white"
        >
            {options.map((opt, i) => (
                <option key={i} value={typeof opt === 'object' ? opt.value : opt}>
                    {typeof opt === 'object' ? opt.label : opt}
                </option>
            ))}
        </select>
    </div>
);

// 損耗率控制組件
const WastageControl = ({ wastage, setWastage, defaultValue, useCustom, setUseCustom }) => (
    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
        <span className="text-xs text-gray-500">損耗率:</span>
        <button
            onClick={() => setUseCustom(false)}
            className={`px-2 py-1 text-xs rounded ${!useCustom ? 'bg-orange-500 text-white' : 'bg-white border'}`}
        >
            預設 {defaultValue}%
        </button>
        <button
            onClick={() => setUseCustom(true)}
            className={`px-2 py-1 text-xs rounded ${useCustom ? 'bg-orange-500 text-white' : 'bg-white border'}`}
        >
            自訂
        </button>
        {useCustom && (
            <input
                type="number"
                value={wastage}
                onChange={(e) => setWastage(parseFloat(e.target.value) || 0)}
                className="w-16 px-2 py-1 border rounded text-xs text-center"
                min="0"
                max="100"
            />
        )}
        {useCustom && <span className="text-xs text-gray-500">%</span>}
    </div>
);

// 法規參照顯示組件
const RegulationReference = ({ componentType, showRules = true }) => {
    const reg = REGULATION_REFS[componentType];
    if (!reg) return null;

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
            <div className="flex items-center gap-2 text-blue-700 font-medium">
                <span>📋</span>
                <span>{reg.code} - {reg.title}</span>
            </div>
            {showRules && (
                <ul className="mt-2 space-y-1 text-blue-600 ml-5">
                    {reg.rules.map((rule, i) => (
                        <li key={i} className="list-disc">{rule}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// 預設配筋資訊顯示組件
const PresetRebarInfo = ({ preset, type }) => {
    let info = null;
    let colorClass = 'text-green-600 bg-green-50 border-green-200';

    if (type === 'column' && COLUMN_PRESETS_REBAR[preset]) {
        info = COLUMN_PRESETS_REBAR[preset];
        return (
            <div className={`text-xs p-2 rounded border ${colorClass}`}>
                <strong>常用配筋:</strong> 主筋 {info.mainCount}根{info.mainBar} + 箍筋 {info.stirrup}@{info.stirrupSpacing}mm ({info.desc})
            </div>
        );
    }
    if (type === 'groundbeam' && GROUNDBEAM_PRESETS_REBAR[preset]) {
        info = GROUNDBEAM_PRESETS_REBAR[preset];
        return (
            <div className={`text-xs p-2 rounded border ${colorClass}`}>
                <strong>常用配筋:</strong> 上筋 {info.topCount}根{info.topBar} + 下筋 {info.bottomCount}根{info.bottomBar} + 箍筋 {info.stirrup}@{info.stirrupSpacing}mm ({info.desc})
            </div>
        );
    }
    if (type === 'beam' && BEAM_PRESETS_REBAR[preset]) {
        info = BEAM_PRESETS_REBAR[preset];
        return (
            <div className={`text-xs p-2 rounded border ${colorClass}`}>
                <strong>常用配筋:</strong> 上筋 {info.topCount}根{info.topBar} + 下筋 {info.bottomCount}根{info.bottomBar} + 箍筋 {info.stirrup}@{info.stirrupSpacing}mm ({info.desc})
            </div>
        );
    }
    if (type === 'slab' && SLAB_PRESETS_REBAR[preset]) {
        info = SLAB_PRESETS_REBAR[preset];
        return (
            <div className={`text-xs p-2 rounded border ${colorClass}`}>
                <strong>常用配筋:</strong> {info.rebarSize}@{info.spacing}mm {info.layer === 'double' ? '雙層' : '單層'}雙向 ({info.desc})
            </div>
        );
    }
    return null;
};

// 結果顯示組件
const ResultDisplay = ({ label, value, unit, wastageValue, showWastage = true, onAddRecord, subType = '' }) => {
    const [copied, setCopied] = useState(false);

    const copyValue = () => {
        navigator.clipboard.writeText(wastageValue || value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleAddRecord = () => {
        if (onAddRecord && value > 0) {
            onAddRecord(subType, label, value, unit, wastageValue || value);
        }
    };

    return (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
            <div className="text-xs opacity-80 mb-1">{label}</div>
            <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{formatNumber(value)}</span>
                <span className="text-sm opacity-80 mb-1">{unit}</span>
                <div className="ml-auto flex gap-1">
                    {onAddRecord && value > 0 && (
                        <button onClick={handleAddRecord} className="p-1 hover:bg-white/20 rounded" title="加入記錄">
                            <Plus size={16} />
                        </button>
                    )}
                    <button onClick={copyValue} className="p-1 hover:bg-white/20 rounded" title="複製">
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                </div>
            </div>
            {showWastage && wastageValue && wastageValue !== value && (
                <div className="mt-2 pt-2 border-t border-white/30 text-sm">
                    含損耗: <span className="font-bold">{formatNumber(wastageValue)}</span> {unit}
                </div>
            )}
        </div>
    );
};

// 成本輸入組件
const CostInput = ({ label, quantity, unit, unitLabel, vendors = [], onChange, placeholder = {} }) => {
    const [selectedVendor, setSelectedVendor] = useState('');
    const [spec, setSpec] = useState('');
    const [price, setPrice] = useState('');
    const [note, setNote] = useState('');

    const subtotal = (parseFloat(price) || 0) * (parseFloat(quantity) || 0);

    // 當數值變更時通知父組件
    React.useEffect(() => {
        onChange?.({
            vendor: vendors.find(v => v.id === selectedVendor)?.name || '',
            vendorId: selectedVendor,
            spec,
            price: parseFloat(price) || 0,
            subtotal,
            note
        });
    }, [selectedVendor, spec, price, note, quantity]);

    return (
        <div className="bg-orange-50 rounded-lg p-3 space-y-3 border border-orange-100 mt-2">
            <div className="flex items-center gap-2 text-sm font-medium text-orange-800">
                <span className="bg-orange-200 text-orange-700 p-1 rounded">
                    <Calculator size={14} />
                </span>
                {label}成本估算
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">廠商選擇</label>
                    <select
                        value={selectedVendor}
                        onChange={(e) => setSelectedVendor(e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm bg-white"
                    >
                        <option value="">選擇廠商...</option>
                        {vendors.map(v => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">規格/種類</label>
                    <input
                        type="text"
                        value={spec}
                        onChange={(e) => setSpec(e.target.value)}
                        placeholder={placeholder.spec || "例：3000psi"}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">單價 ({unitLabel || (unit ? `元/${unit}` : '元')})</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">備註</label>
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="備註說明"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    />
                </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-orange-200/50">
                <div className="text-xs text-orange-600">
                    數量: {formatNumber(quantity)} {unit}
                </div>
                <div className="text-sm font-bold text-orange-700">
                    小計: $ {formatNumber(subtotal, 0)}
                </div>
            </div>
        </div>
    );
};


// 1️⃣ 結構工程計算器 (支援多列輸入)
const StructureCalculator = ({ onAddRecord, vendors = [], rebarSpecs = [] }) => {
    const [calcType, setCalcType] = useState('concrete');

    // 混凝土計算 - 多列支援
    const [concreteRows, setConcreteRows] = useState([
        { id: 1, name: '', length: '', width: '', height: '' }
    ]);
    const [concreteWastage, setConcreteWastage] = useState(DEFAULT_WASTAGE.concrete);
    const [concreteCustomWastage, setConcreteCustomWastage] = useState(false);
    const [concreteCost, setConcreteCost] = useState(null);

    // 泵浦車記錄
    const [pumpTruckCount, setPumpTruckCount] = useState('');
    const [pumpTruckTrips, setPumpTruckTrips] = useState('');
    const [pumpTruckNote, setPumpTruckNote] = useState('');
    const [pumpTruckCost, setPumpTruckCost] = useState(null);

    // 鋼筋計算
    const [rebarSpec, setRebarSpec] = useState(0);
    const [rebarLength, setRebarLength] = useState('');
    const [rebarCount, setRebarCount] = useState('');
    const [rebarWastage, setRebarWastage] = useState(DEFAULT_WASTAGE.rebar);
    const [rebarCustomWastage, setRebarCustomWastage] = useState(false);
    const [rebarCost, setRebarCost] = useState(null);

    // 鋼筋概算模式
    const [rebarMode, setRebarMode] = useState('exact'); // 'exact' | 'estimate'
    const [rebarEstimate, setRebarEstimate] = useState({
        wallType: 0,
        wallArea: '',
        floorType: 0,
        floorArea: '',
        stairType: 0,
        stairArea: '',
    });

    // 鋼筋概算結果計算
    const rebarEstimateResults = {
        wall: (parseFloat(rebarEstimate.wallArea) || 0) * REBAR_USAGE_BY_COMPONENT.wall[rebarEstimate.wallType]?.usage,
        floor: (parseFloat(rebarEstimate.floorArea) || 0) * REBAR_USAGE_BY_COMPONENT.floor[rebarEstimate.floorType]?.usage,
        stair: (parseFloat(rebarEstimate.stairArea) || 0) * REBAR_USAGE_BY_COMPONENT.stair[rebarEstimate.stairType]?.usage,
        get total() { return this.wall + this.floor + this.stair; }
    };

    // 模板計算
    const [formworkArea, setFormworkArea] = useState('');
    const [formworkRatio, setFormworkRatio] = useState('1.8');
    const [formworkWastage, setFormworkWastage] = useState(DEFAULT_WASTAGE.formwork);
    const [formworkCustomWastage, setFormworkCustomWastage] = useState(false);
    const [formworkCost, setFormworkCost] = useState(null);

    // 結構模板計算狀態
    const [formworkMode, setFormworkMode] = useState('estimate'); // 'estimate' | 'structure'
    const [structureType, setStructureType] = useState('parapet'); // 'parapet' | 'beam' | 'column'

    // 女兒牆狀態
    const [parapetLength, setParapetLength] = useState('');
    const [parapetThickness, setParapetThickness] = useState(15);
    const [parapetCustomThickness, setParapetCustomThickness] = useState('');
    const [parapetHeight, setParapetHeight] = useState('');
    const [parapetCount, setParapetCount] = useState(1);

    // 地樑狀態
    const [beamPreset, setBeamPreset] = useState('GB2');
    const [beamCustomWidth, setBeamCustomWidth] = useState('');
    const [beamCustomHeight, setBeamCustomHeight] = useState('');
    const [beamLength, setBeamLength] = useState('');
    const [beamCount, setBeamCount] = useState(1);
    const [beamIncludeBottom, setBeamIncludeBottom] = useState(false);

    // 柱子狀態
    const [columnPreset, setColumnPreset] = useState('C2');
    const [columnCustomWidth, setColumnCustomWidth] = useState('');
    const [columnCustomDepth, setColumnCustomDepth] = useState('');
    const [columnCustomDiameter, setColumnCustomDiameter] = useState('');
    const [columnHeight, setColumnHeight] = useState('');
    const [columnCount, setColumnCount] = useState(1);

    // 牆壁狀態
    const [wallPreset, setWallPreset] = useState('W2');
    const [wallCustomThickness, setWallCustomThickness] = useState('');
    const [wallLength, setWallLength] = useState('');
    const [wallHeight, setWallHeight] = useState('');
    const [wallCount, setWallCount] = useState(1);
    const [wallDoubleSided, setWallDoubleSided] = useState(true);
    const [wallOpeningDeduction, setWallOpeningDeduction] = useState('');

    // 樓板狀態
    const [floorPreset, setFloorPreset] = useState('F2');
    const [floorCustomThickness, setFloorCustomThickness] = useState('');
    const [floorLength, setFloorLength] = useState('');
    const [floorWidth, setFloorWidth] = useState('');
    const [floorCount, setFloorCount] = useState(1);

    // ============================================
    // 精確配筋計算 State
    // ============================================

    // 計算模式
    const [useAdvancedRebar, setUseAdvancedRebar] = useState(false);

    // 樓板配筋
    const [floorRebarSize, setFloorRebarSize] = useState('#4');
    const [floorRebarSpacing, setFloorRebarSpacing] = useState(200);
    const [floorRebarLayer, setFloorRebarLayer] = useState('double');
    const [floorConcreteGrade, setFloorConcreteGrade] = useState(210);

    // 牆體配筋
    const [wallRebarSize, setWallRebarSize] = useState('#4');
    const [wallRebarSpacing, setWallRebarSpacing] = useState(200);
    const [wallRebarLayer, setWallRebarLayer] = useState('double');
    const [wallConcreteGrade, setWallConcreteGrade] = useState(210);

    // 女兒牆配筋
    const [parapetRebarSize, setParapetRebarSize] = useState('#4');
    const [parapetRebarSpacing, setParapetRebarSpacing] = useState(200);
    const [parapetRebarLayer, setParapetRebarLayer] = useState('double');
    const [parapetConcreteGrade, setParapetConcreteGrade] = useState(210);

    // 柱子配筋
    const [columnMainBar, setColumnMainBar] = useState('#5');
    const [columnMainBarCount, setColumnMainBarCount] = useState(8);
    const [columnStirrup, setColumnStirrup] = useState('#3');
    const [columnStirrupSpacing, setColumnStirrupSpacing] = useState(150);
    const [columnConcreteGrade, setColumnConcreteGrade] = useState(210);

    // 梁配筋
    const [beamTopBar, setBeamTopBar] = useState('#5');
    const [beamTopBarCount, setBeamTopBarCount] = useState(3);
    const [beamBottomBar, setBeamBottomBar] = useState('#6');
    const [beamBottomBarCount, setBeamBottomBarCount] = useState(4);
    const [beamStirrup, setBeamStirrup] = useState('#3');
    const [beamStirrupSpacing, setBeamStirrupSpacing] = useState(150);
    const [beamConcreteGrade, setBeamConcreteGrade] = useState(210);

    // 地梁配筋
    const [groundbeamTopBar, setGroundbeamTopBar] = useState('#5');
    const [groundbeamTopBarCount, setGroundbeamTopBarCount] = useState(3);
    const [groundbeamBottomBar, setGroundbeamBottomBar] = useState('#6');
    const [groundbeamBottomBarCount, setGroundbeamBottomBarCount] = useState(4);
    const [groundbeamStirrup, setGroundbeamStirrup] = useState('#3');
    const [groundbeamStirrupSpacing, setGroundbeamStirrupSpacing] = useState(150);
    const [groundbeamConcreteGrade, setGroundbeamConcreteGrade] = useState(210);

    // Phase 2: 模板進階設定
    const [formworkType, setFormworkType] = useState('standard');
    const [constructionCondition, setConstructionCondition] = useState('normal');
    const [openingDeduction, setOpeningDeduction] = useState(0); // 開口扣除面積 (m²)

    // Phase 3: 基礎素混凝土墊層
    const [foundationLevelingEnabled, setFoundationLevelingEnabled] = useState(true);
    const [foundationLevelingThickness, setFoundationLevelingThickness] = useState(10); // cm

    // 法規參照顯示開關
    const [showRegulations, setShowRegulations] = useState(true);

    // 精確配筋計算函數
    // ============================================

    // 取得鋼筋單位重量 (kg/m)
    const getRebarUnitWeight = (size) => {
        return REBAR_SIZES.find(r => r.value === size)?.unitWeight || 0;
    };

    // 計算板類構件鋼筋 (樓板、牆、女兒牆) - 雙向配筋
    const calculateSlabRebar = (length, width, spacing, layer, rebarSize) => {
        if (!length || !width || length <= 0 || width <= 0) return 0;
        const unitWeight = getRebarUnitWeight(rebarSize);
        const layerMultiplier = layer === 'double' ? 2 : 1;

        // 雙向配筋：X向 + Y向
        const barsX = Math.ceil(width * 1000 / spacing) + 1;
        const barsY = Math.ceil(length * 1000 / spacing) + 1;

        const totalLength = (barsX * length) + (barsY * width);
        return totalLength * unitWeight * layerMultiplier;
    };

    // 計算柱鋼筋 (主筋 + 箍筋)
    const calculateColumnRebar = (height, count, preset, mainBarSize, mainBarCount, stirrupSize, stirrupSpacing) => {
        if (!height || height <= 0) return 0;
        const presetData = COLUMN_PRESETS.find(p => p.value === preset);
        const mainWeight = getRebarUnitWeight(mainBarSize);
        const stirrupWeight = getRebarUnitWeight(stirrupSize);

        // 柱周長
        let perimeter = 0;
        if (presetData?.type === 'round') {
            perimeter = Math.PI * (presetData.diameter / 100);
        } else {
            const width = (presetData?.width || 40) / 100;
            const depth = (presetData?.depth || 40) / 100;
            perimeter = (width + depth) * 2;
        }

        // 主筋重量
        const mainRebarWeight = mainBarCount * height * mainWeight * count;

        // 箍筋數量與重量
        const stirrupCount = Math.ceil(height * 1000 / stirrupSpacing) + 1;
        const stirrupRebarWeight = stirrupCount * perimeter * stirrupWeight * count;

        return mainRebarWeight + stirrupRebarWeight;
    };

    // 計算梁鋼筋 (上筋 + 下筋 + 箍筋)
    const calculateBeamRebar = (length, count, preset, topSize, topCount, bottomSize, bottomCount, stirrupSize, stirrupSpacing) => {
        if (!length || length <= 0) return 0;
        const presetData = GROUND_BEAM_PRESETS.find(p => p.value === preset);
        const topWeight = getRebarUnitWeight(topSize);
        const bottomWeight = getRebarUnitWeight(bottomSize);
        const stirrupWeight = getRebarUnitWeight(stirrupSize);

        const beamWidth = (presetData?.width || 35) / 100;
        const beamHeight = (presetData?.height || 60) / 100;

        // 上下主筋
        const topRebarWeight = topCount * length * topWeight * count;
        const bottomRebarWeight = bottomCount * length * bottomWeight * count;

        // 箍筋 (周長)
        const stirrupPerimeter = (beamWidth + beamHeight) * 2;
        const stirrupCount = Math.ceil(length * 1000 / stirrupSpacing) + 1;
        const stirrupRebarWeight = stirrupCount * stirrupPerimeter * stirrupWeight * count;

        return topRebarWeight + bottomRebarWeight + stirrupRebarWeight;
    };

    // 結構模板計算邏輯
    const getParapetFormwork = () => {
        const length = parseFloat(parapetLength) || 0;
        const height = parseFloat(parapetHeight) || 0;
        const count = parseInt(parapetCount) || 1;
        // 女兒牆內外兩面
        return length * height * 2 * count;
    };

    const getBeamFormwork = () => {
        const preset = GROUND_BEAM_PRESETS.find(p => p.value === beamPreset);
        const width = beamPreset === 'custom' ? (parseFloat(beamCustomWidth) || 0) : (preset?.width || 0);
        const height = beamPreset === 'custom' ? (parseFloat(beamCustomHeight) || 0) : (preset?.height || 0);
        const length = parseFloat(beamLength) || 0;
        const count = parseInt(beamCount) || 1;
        // 地樑兩側 + (可選)底部
        const sides = (height / 100) * 2 * length;
        const bottom = beamIncludeBottom ? (width / 100) * length : 0;
        return (sides + bottom) * count;
    };

    const getColumnFormwork = () => {
        const preset = COLUMN_PRESETS.find(p => p.value === columnPreset);
        const height = parseFloat(columnHeight) || 0;
        const count = parseInt(columnCount) || 1;

        if (columnPreset === 'custom') {
            const width = (parseFloat(columnCustomWidth) || 0) / 100;
            const depth = (parseFloat(columnCustomDepth) || 0) / 100;
            const diameter = (parseFloat(columnCustomDiameter) || 0) / 100;
            if (diameter > 0) {
                return Math.PI * diameter * height * count;
            }
            return (width + depth) * 2 * height * count;
        }

        if (preset?.type === 'round') {
            const diameter = (preset.diameter || 0) / 100;
            return Math.PI * diameter * height * count;
        }

        const width = (preset?.width || 0) / 100;
        const depth = (preset?.depth || 0) / 100;
        return (width + depth) * 2 * height * count;
    };

    const getWallFormwork = () => {
        const length = parseFloat(wallLength) || 0;
        const height = parseFloat(wallHeight) || 0;
        const count = parseInt(wallCount) || 1;
        const sides = wallDoubleSided ? 2 : 1;
        return length * height * sides * count;
    };

    const getFloorFormwork = () => {
        const length = parseFloat(floorLength) || 0;
        const width = parseFloat(floorWidth) || 0;
        const count = parseInt(floorCount) || 1;
        // 樓板模板 = 底模面積
        return length * width * count;
    };

    // =====================================
    // 構件混凝土體積計算
    // =====================================
    const getColumnConcrete = () => {
        const preset = COLUMN_PRESETS.find(p => p.value === columnPreset);
        const height = parseFloat(columnHeight) || 0;
        const count = parseInt(columnCount) || 1;

        if (columnPreset === 'custom') {
            const width = (parseFloat(columnCustomWidth) || 0) / 100;
            const depth = (parseFloat(columnCustomDepth) || 0) / 100;
            const diameter = (parseFloat(columnCustomDiameter) || 0) / 100;
            if (diameter > 0) {
                return Math.PI * Math.pow(diameter / 2, 2) * height * count;
            }
            return width * depth * height * count;
        }

        if (preset?.type === 'round') {
            const diameter = (preset.diameter || 0) / 100;
            return Math.PI * Math.pow(diameter / 2, 2) * height * count;
        }

        const width = (preset?.width || 0) / 100;
        const depth = (preset?.depth || 0) / 100;
        return width * depth * height * count;
    };

    const getBeamConcrete = () => {
        const preset = GROUND_BEAM_PRESETS.find(p => p.value === beamPreset);
        const width = beamPreset === 'custom' ? (parseFloat(beamCustomWidth) || 0) / 100 : (preset?.width || 0) / 100;
        const height = beamPreset === 'custom' ? (parseFloat(beamCustomHeight) || 0) / 100 : (preset?.height || 0) / 100;
        const length = parseFloat(beamLength) || 0;
        const count = parseInt(beamCount) || 1;
        return width * height * length * count;
    };

    const getFloorConcrete = () => {
        const preset = FLOOR_THICKNESS_PRESETS.find(p => p.value === floorPreset);
        const thickness = floorPreset === 'custom' ? (parseFloat(floorCustomThickness) || 0) / 100 : (preset?.thickness || 0) / 100;
        const length = parseFloat(floorLength) || 0;
        const width = parseFloat(floorWidth) || 0;
        const count = parseInt(floorCount) || 1;
        return length * width * thickness * count;
    };

    const getWallConcrete = () => {
        const preset = WALL_THICKNESS_PRESETS.find(p => p.value === wallPreset);
        const thickness = wallPreset === 'custom' ? (parseFloat(wallCustomThickness) || 0) / 100 : (preset?.thickness || 0) / 100;
        const length = parseFloat(wallLength) || 0;
        const height = parseFloat(wallHeight) || 0;
        const count = parseInt(wallCount) || 1;
        return length * height * thickness * count;
    };

    const getParapetConcrete = () => {
        const thickness = parapetThickness === 'custom' ? (parseFloat(parapetCustomThickness) || 0) / 100 : parapetThickness / 100;
        const length = parseFloat(parapetLength) || 0;
        const height = parseFloat(parapetHeight) || 0;
        const count = parseInt(parapetCount) || 1;
        return length * height * thickness * count;
    };

    // =====================================
    // 構件鋼筋重量計算 (支援快速估算與精確計算模式)
    // =====================================

    // 樓板鋼筋 - 支援精確計算
    const getFloorRebar = () => {
        const length = parseFloat(floorLength) || 0;
        const width = parseFloat(floorWidth) || 0;
        const count = parseInt(floorCount) || 1;

        if (useAdvancedRebar && length > 0 && width > 0) {
            return calculateSlabRebar(length, width, floorRebarSpacing, floorRebarLayer, floorRebarSize) * count;
        }
        return getFloorConcrete() * REBAR_RATIO_BY_COMPONENT.floor.standard;
    };

    // 牆體鋼筋 - 支援精確計算
    const getWallRebar = () => {
        const length = parseFloat(wallLength) || 0;
        const height = parseFloat(wallHeight) || 0;
        const count = parseInt(wallCount) || 1;

        if (useAdvancedRebar && length > 0 && height > 0) {
            return calculateSlabRebar(length, height, wallRebarSpacing, wallRebarLayer, wallRebarSize) * count;
        }
        return getWallConcrete() * REBAR_RATIO_BY_COMPONENT.wall.standard;
    };

    // 女兒牆鋼筋 - 支援精確計算
    const getParapetRebar = () => {
        const length = parseFloat(parapetLength) || 0;
        const height = parseFloat(parapetHeight) || 0;
        const count = parseInt(parapetCount) || 1;

        if (useAdvancedRebar && length > 0 && height > 0) {
            return calculateSlabRebar(length, height, parapetRebarSpacing, parapetRebarLayer, parapetRebarSize) * count;
        }
        return getParapetConcrete() * REBAR_RATIO_BY_COMPONENT.parapet.standard;
    };

    // 柱子鋼筋 - 支援精確計算
    const getColumnRebar = () => {
        const height = parseFloat(columnHeight) || 0;
        const count = parseInt(columnCount) || 1;

        if (useAdvancedRebar && height > 0) {
            return calculateColumnRebar(height, count, columnPreset, columnMainBar, columnMainBarCount, columnStirrup, columnStirrupSpacing);
        }
        return getColumnConcrete() * REBAR_RATIO_BY_COMPONENT.column.standard;
    };

    // 梁鋼筋 - 支援精確計算
    const getBeamRebar = () => {
        const length = parseFloat(beamLength) || 0;
        const count = parseInt(beamCount) || 1;

        if (useAdvancedRebar && length > 0) {
            return calculateBeamRebar(length, count, beamPreset, beamTopBar, beamTopBarCount, beamBottomBar, beamBottomBarCount, beamStirrup, beamStirrupSpacing);
        }
        return getBeamConcrete() * REBAR_RATIO_BY_COMPONENT.beam.standard;
    };

    // 地梁鋼筋 - 支援精確計算
    const getGroundbeamRebar = () => {
        const length = parseFloat(beamLength) || 0;
        const count = parseInt(beamCount) || 1;

        if (useAdvancedRebar && length > 0) {
            return calculateBeamRebar(length, count, beamPreset, groundbeamTopBar, groundbeamTopBarCount, groundbeamBottomBar, groundbeamBottomBarCount, groundbeamStirrup, groundbeamStirrupSpacing);
        }
        return getBeamConcrete() * REBAR_RATIO_BY_COMPONENT.groundbeam.standard;
    };

    const structureFormworkResult = structureType === 'parapet' ? getParapetFormwork()
        : structureType === 'beam' ? getBeamFormwork()
            : structureType === 'column' ? getColumnFormwork()
                : structureType === 'wall' ? getWallFormwork()
                    : structureType === 'floor' ? getFloorFormwork()
                        : 0;

    const structureFormworkWithWastage = applyWastage(
        structureFormworkResult,
        formworkCustomWastage ? formworkWastage : DEFAULT_WASTAGE.formwork
    );

    // 計算每列混凝土體積
    const concreteRowResults = concreteRows.map(row => {
        const volume = (parseFloat(row.length) || 0) * (parseFloat(row.width) || 0) * (parseFloat(row.height) || 0);
        return { ...row, volume };
    });

    // 總計混凝土體積
    const totalConcreteVolume = concreteRowResults.reduce((sum, row) => sum + row.volume, 0);
    const totalConcreteWithWastage = applyWastage(totalConcreteVolume, concreteCustomWastage ? concreteWastage : DEFAULT_WASTAGE.concrete);

    // 新增混凝土列
    const addConcreteRow = () => {
        const newId = Math.max(...concreteRows.map(r => r.id), 0) + 1;
        setConcreteRows([...concreteRows, { id: newId, name: '', length: '', width: '', height: '' }]);
    };

    // 刪除混凝土列
    const removeConcreteRow = (id) => {
        if (concreteRows.length <= 1) return;
        setConcreteRows(concreteRows.filter(row => row.id !== id));
    };

    // 更新混凝土列
    const updateConcreteRow = (id, field, value) => {
        setConcreteRows(concreteRows.map(row =>
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    // 清空所有列
    const clearConcreteRows = () => {
        setConcreteRows([{ id: 1, name: '', length: '', width: '', height: '' }]);
    };

    // 鋼筋計算結果
    const selectedRebar = rebarSpecs[rebarSpec] || { weight: 0 };
    const rebarWeight = selectedRebar.weight * (parseFloat(rebarLength) || 0) * (parseFloat(rebarCount) || 0);
    const rebarWithWastage = applyWastage(rebarWeight, rebarCustomWastage ? rebarWastage : DEFAULT_WASTAGE.rebar);

    // 模板計算結果
    const formworkResult = (parseFloat(formworkArea) || 0) * parseFloat(formworkRatio);
    const formworkWithWastage = applyWastage(formworkResult, formworkCustomWastage ? formworkWastage : DEFAULT_WASTAGE.formwork);

    return (
        <div className="space-y-4">
            {/* 子項目選擇 */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { id: 'concrete', label: '混凝土用量' },
                    { id: 'rebar', label: '鋼筋重量' },
                    { id: 'formwork', label: '模板面積' },
                    { id: 'component', label: '構件計算' },
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => setCalcType(item.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${calcType === item.id
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* 混凝土計算 - 多列模式 */}
            {calcType === 'concrete' && (
                <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Info size={16} />
                            公式: 體積(m³) = 長 × 寬 × 高
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{concreteRows.length} 列</span>
                            <button
                                onClick={() => concreteRows.length > 1 && removeConcreteRow(concreteRows[concreteRows.length - 1].id)}
                                disabled={concreteRows.length <= 1}
                                className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="減少一列"
                            >
                                <span className="text-lg font-bold leading-none">−</span>
                            </button>
                            <button
                                onClick={addConcreteRow}
                                className="w-7 h-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors"
                                title="新增一列"
                            >
                                <Plus size={16} />
                            </button>
                            {concreteRows.length > 1 && (
                                <button
                                    onClick={clearConcreteRows}
                                    className="text-xs text-gray-500 hover:text-gray-700 ml-1"
                                >
                                    清空
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 混凝土規格說明 */}
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <div className="font-medium text-blue-800 text-sm mb-2 flex items-center gap-2">
                            <Info size={14} />
                            混凝土規格與用途說明
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                            <div className="p-2 rounded-lg bg-white border border-gray-200">
                                <div className="font-bold text-gray-800 mb-1">2000 psi (140 kgf/cm²)</div>
                                <div className="text-gray-600">
                                    <span className="text-blue-700 font-medium">一般用途：</span>
                                    地坪、車道、人行道
                                </div>
                            </div>
                            <div className="p-2 rounded-lg bg-white border border-gray-200">
                                <div className="font-bold text-gray-800 mb-1">3000 psi (210 kgf/cm²)</div>
                                <div className="text-gray-600">
                                    <span className="text-blue-700 font-medium">標準結構：</span>
                                    樓板、梁柱、牆體
                                </div>
                            </div>
                            <div className="p-2 rounded-lg bg-white border border-gray-200">
                                <div className="font-bold text-gray-800 mb-1">4000 psi (280 kgf/cm²)</div>
                                <div className="text-gray-600">
                                    <span className="text-blue-700 font-medium">高強度：</span>
                                    高樓主結構、地下室
                                </div>
                            </div>
                            <div className="p-2 rounded-lg bg-white border border-gray-200">
                                <div className="font-bold text-gray-800 mb-1">5000+ psi (350 kgf/cm²)</div>
                                <div className="text-gray-600">
                                    <span className="text-blue-700 font-medium">特殊工程：</span>
                                    橋梁、預力構件
                                </div>
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 flex items-start gap-1">
                            <span className="text-blue-500">💡</span>
                            <span>混凝土用量需考慮損耗率（通常 3~5%）。預拌混凝土以立方公尺(m³)計價，建議多備料避免不足。</span>
                        </div>
                    </div>

                    {/* 多列輸入區 */}
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {concreteRows.map((row, index) => (
                            <div key={row.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <div className="grid grid-cols-12 gap-2 items-end">
                                    {/* 項目名稱 */}
                                    <div className="col-span-12 sm:col-span-2">
                                        <label className="block text-xs text-gray-500 mb-1">名稱</label>
                                        <input
                                            type="text"
                                            value={row.name}
                                            onChange={(e) => updateConcreteRow(row.id, 'name', e.target.value)}
                                            placeholder={`項目 ${index + 1}`}
                                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>
                                    {/* 長度 */}
                                    <div className="col-span-4 sm:col-span-2">
                                        <label className="block text-xs text-gray-500 mb-1">長度</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={row.length}
                                                onChange={(e) => updateConcreteRow(row.id, 'length', e.target.value)}
                                                placeholder="0"
                                                min="0"
                                                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-7"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">m</span>
                                        </div>
                                    </div>
                                    {/* 寬度 */}
                                    <div className="col-span-4 sm:col-span-2">
                                        <label className="block text-xs text-gray-500 mb-1">寬度</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={row.width}
                                                onChange={(e) => updateConcreteRow(row.id, 'width', e.target.value)}
                                                placeholder="0"
                                                min="0"
                                                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-7"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">m</span>
                                        </div>
                                    </div>
                                    {/* 高度/厚度 */}
                                    <div className="col-span-4 sm:col-span-2">
                                        <label className="block text-xs text-gray-500 mb-1">高度/厚度</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={row.height}
                                                onChange={(e) => updateConcreteRow(row.id, 'height', e.target.value)}
                                                placeholder="0"
                                                min="0"
                                                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-7"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">m</span>
                                        </div>
                                    </div>
                                    {/* 計算結果 */}
                                    <div className="col-span-10 sm:col-span-3 flex items-center">
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-500 mb-1">體積</label>
                                            <div className="text-sm font-bold text-orange-600">
                                                {concreteRowResults[index].volume > 0
                                                    ? `${formatNumber(concreteRowResults[index].volume, 4)} m³`
                                                    : '--'}
                                            </div>
                                        </div>
                                    </div>
                                    {/* 刪除按鈕 */}
                                    <div className="col-span-2 sm:col-span-1 flex justify-end">
                                        <button
                                            onClick={() => removeConcreteRow(row.id)}
                                            disabled={concreteRows.length <= 1}
                                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 快速新增按鈕 */}
                    <button
                        onClick={addConcreteRow}
                        className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <Plus size={16} />
                        +增加新欄位
                    </button>

                    <WastageControl
                        wastage={concreteWastage}
                        setWastage={setConcreteWastage}
                        defaultValue={DEFAULT_WASTAGE.concrete}
                        useCustom={concreteCustomWastage}
                        setUseCustom={setConcreteCustomWastage}
                    />

                    {/* 總計結果 */}
                    <ResultDisplay
                        label={`混凝土用量 (共 ${concreteRowResults.filter(r => r.volume > 0).length} 項)`}
                        value={totalConcreteVolume}
                        unit="m³"
                        wastageValue={totalConcreteWithWastage}
                        onAddRecord={(subType, label, value, unit, wastageValue) =>
                            onAddRecord(subType, label, value, unit, wastageValue, concreteCost)}
                        subType="混凝土"
                    />

                    {/* 混凝土成本計算 */}
                    <CostInput
                        label="混凝土"
                        quantity={totalConcreteWithWastage}
                        unit="m³"
                        vendors={vendors.filter(v => v.category === '建材供應' || v.tradeType?.includes('混凝土'))}
                        onChange={setConcreteCost}
                        placeholder={{ spec: '例：3000psi' }}
                    />

                    {/* 泵浦車欄位 */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 space-y-3 mt-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <span className="bg-orange-100 text-orange-600 p-1 rounded">
                                <Building2 size={16} />
                            </span>
                            混凝土泵浦車紀錄 (非必填)
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="grid grid-cols-2 gap-2">
                                <InputField label="車輛數" value={pumpTruckCount} onChange={setPumpTruckCount} unit="輛" placeholder="0" />
                                <InputField label="總車次" value={pumpTruckTrips} onChange={setPumpTruckTrips} unit="車次" placeholder="0" />
                            </div>
                            <InputField label="備註說明" value={pumpTruckNote} onChange={setPumpTruckNote} placeholder="例：45米泵浦車" type="text" />
                        </div>

                        {/* 泵浦車成本計算 */}
                        <CostInput
                            label="泵浦車"
                            quantity={parseFloat(pumpTruckTrips) || parseFloat(pumpTruckCount) || 0}
                            unit="車次"
                            vendors={vendors.filter(v => v.category === '工程工班' || v.tradeType?.includes('泵浦'))}
                            onChange={setPumpTruckCost}
                            placeholder={{ spec: '例：45米' }}
                        />

                        {(pumpTruckCount || pumpTruckTrips) && (
                            <div className="flex justify-end">
                                <button
                                    onClick={() => onAddRecord?.('結構工程', '泵浦車',
                                        `泵浦車 ${pumpTruckCount ? pumpTruckCount + '輛' : ''} ${pumpTruckTrips ? pumpTruckTrips + '車次' : ''} ${pumpTruckNote ? '(' + pumpTruckNote + ')' : ''}`,
                                        parseFloat(pumpTruckTrips) || parseFloat(pumpTruckCount) || 0, '車次', 0, pumpTruckCost)}
                                    className="px-3 py-1.5 bg-orange-100 text-orange-600 rounded text-xs hover:bg-orange-200 transition-colors flex items-center gap-1"
                                >
                                    <Plus size={12} /> 加入記錄
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 各列明細 */}
                    {concreteRowResults.filter(r => r.volume > 0).length > 1 && (
                        <div className="bg-gray-50 rounded-lg p-3 text-xs">
                            <div className="font-medium text-gray-700 mb-2">各項明細:</div>
                            <div className="space-y-1">
                                {concreteRowResults.filter(r => r.volume > 0).map((row, idx) => (
                                    <div key={row.id} className="flex justify-between text-gray-600">
                                        <span>{row.name || `項目 ${idx + 1}`} ({row.length}×{row.width}×{row.height})</span>
                                        <span className="font-medium">{formatNumber(row.volume, 4)} m³</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 鋼筋計算 */}
            {calcType === 'rebar' && (
                <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
                    {/* 子分頁切換 */}
                    <div className="flex gap-2 border-b border-gray-100 pb-3">
                        <button
                            onClick={() => setRebarMode('exact')}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${rebarMode === 'exact'
                                ? 'bg-orange-100 text-orange-700 font-medium'
                                : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            精確計算
                        </button>
                        <button
                            onClick={() => setRebarMode('estimate')}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${rebarMode === 'estimate'
                                ? 'bg-orange-100 text-orange-700 font-medium'
                                : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            部位概算
                        </button>
                    </div>

                    {/* 精確計算模式 */}
                    {rebarMode === 'exact' && (
                        <>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Info size={16} />
                                公式: 重量(kg) = 單位重量 × 長度 × 數量
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <SelectField
                                    label="鋼筋規格"
                                    value={rebarSpec}
                                    onChange={(v) => setRebarSpec(parseInt(v))}
                                    options={rebarSpecs.map((r, i) => ({ value: i, label: `${r.label} (${r.weight}kg/m)` }))}
                                />
                                <InputField label="單根長度" value={rebarLength} onChange={setRebarLength} unit="m" placeholder="0" />
                                <InputField label="數量" value={rebarCount} onChange={setRebarCount} unit="支" placeholder="0" />
                            </div>

                            {/* 鋼筋規格說明 */}
                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                <div className="font-medium text-blue-800 text-sm mb-2 flex items-center gap-2">
                                    <Info size={14} />
                                    鋼筋規格與常用部位說明
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                    <div className={`p-2 rounded-lg border ${rebarSpec === 0 ? 'bg-orange-100 border-orange-300' : 'bg-white border-gray-200'}`}>
                                        <div className="font-bold text-gray-800">#3 D10</div>
                                        <div className="text-gray-600">箍筋、繫筋</div>
                                        <div className="text-blue-600 text-[10px]">0.56 kg/m</div>
                                    </div>
                                    <div className={`p-2 rounded-lg border ${rebarSpec === 1 ? 'bg-orange-100 border-orange-300' : 'bg-white border-gray-200'}`}>
                                        <div className="font-bold text-gray-800">#4 D13</div>
                                        <div className="text-gray-600">樓板筋、牆筋</div>
                                        <div className="text-blue-600 text-[10px]">0.99 kg/m</div>
                                    </div>
                                    <div className={`p-2 rounded-lg border ${rebarSpec === 2 ? 'bg-orange-100 border-orange-300' : 'bg-white border-gray-200'}`}>
                                        <div className="font-bold text-gray-800">#5 D16</div>
                                        <div className="text-gray-600">梁主筋、柱筋</div>
                                        <div className="text-blue-600 text-[10px]">1.56 kg/m</div>
                                    </div>
                                    <div className={`p-2 rounded-lg border ${rebarSpec === 3 ? 'bg-orange-100 border-orange-300' : 'bg-white border-gray-200'}`}>
                                        <div className="font-bold text-gray-800">#6 D19</div>
                                        <div className="text-gray-600">大梁主筋</div>
                                        <div className="text-blue-600 text-[10px]">2.25 kg/m</div>
                                    </div>
                                    <div className={`p-2 rounded-lg border ${rebarSpec === 4 ? 'bg-orange-100 border-orange-300' : 'bg-white border-gray-200'}`}>
                                        <div className="font-bold text-gray-800">#7 D22</div>
                                        <div className="text-gray-600">柱主筋、基礎筋</div>
                                        <div className="text-blue-600 text-[10px]">3.04 kg/m</div>
                                    </div>
                                    <div className={`p-2 rounded-lg border ${rebarSpec === 5 ? 'bg-orange-100 border-orange-300' : 'bg-white border-gray-200'}`}>
                                        <div className="font-bold text-gray-800">#8 D25</div>
                                        <div className="text-gray-600">大柱主筋</div>
                                        <div className="text-blue-600 text-[10px]">3.98 kg/m</div>
                                    </div>
                                    <div className={`p-2 rounded-lg border ${rebarSpec === 6 ? 'bg-orange-100 border-orange-300' : 'bg-white border-gray-200'}`}>
                                        <div className="font-bold text-gray-800">#9 D29</div>
                                        <div className="text-gray-600">高樓柱筋</div>
                                        <div className="text-blue-600 text-[10px]">5.08 kg/m</div>
                                    </div>
                                    <div className={`p-2 rounded-lg border ${rebarSpec === 7 ? 'bg-orange-100 border-orange-300' : 'bg-white border-gray-200'}`}>
                                        <div className="font-bold text-gray-800">#10 D32</div>
                                        <div className="text-gray-600">特殊工程</div>
                                        <div className="text-blue-600 text-[10px]">6.39 kg/m</div>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-500 flex items-start gap-1">
                                    <span className="text-blue-500">💡</span>
                                    <span>標準鋼筋長度為 12m（可訂製 6m、9m）。搭接長度依規範約為鋼筋直徑的 40~60 倍。建議損耗率 5%。</span>
                                </div>
                            </div>

                            <WastageControl
                                wastage={rebarWastage}
                                setWastage={setRebarWastage}
                                defaultValue={DEFAULT_WASTAGE.rebar}
                                useCustom={rebarCustomWastage}
                                setUseCustom={setRebarCustomWastage}
                            />
                            <ResultDisplay
                                label="鋼筋重量"
                                value={rebarWeight}
                                unit="kg"
                                wastageValue={rebarWithWastage}
                                onAddRecord={(subType, label, value, unit, wastageValue) =>
                                    onAddRecord(subType, label, value, unit, wastageValue, rebarCost)}
                                subType="鋼筋"
                            />
                            <CostInput
                                label="鋼筋"
                                quantity={rebarWithWastage}
                                unit="kg"
                                vendors={vendors.filter(v => v.category === '建材供應' || v.tradeType?.includes('鋼筋'))}
                                onChange={setRebarCost}
                                placeholder={{ spec: '例：#4 鋼筋' }}
                            />
                        </>
                    )}

                    {/* 部位概算模式 */}
                    {rebarMode === 'estimate' && (
                        <>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Info size={16} />
                                依部位輸入面積，自動估算鋼筋用量 (營造經驗值)
                            </div>

                            {/* 牆面 */}
                            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                <div className="font-medium text-gray-700 text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    牆面鋼筋
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <SelectField
                                        label="牆體類型"
                                        value={rebarEstimate.wallType}
                                        onChange={(v) => setRebarEstimate(prev => ({ ...prev, wallType: parseInt(v) }))}
                                        options={REBAR_USAGE_BY_COMPONENT.wall.map((w, i) => ({ value: i, label: `${w.label} (${w.usage} kg/m²)` }))}
                                    />
                                    <InputField
                                        label="牆面面積"
                                        value={rebarEstimate.wallArea}
                                        onChange={(v) => setRebarEstimate(prev => ({ ...prev, wallArea: v }))}
                                        unit="m²"
                                        placeholder="0"
                                    />
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">估算用量</label>
                                        <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-orange-600">
                                            {formatNumber(rebarEstimateResults.wall)} kg
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 地板 */}
                            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                <div className="font-medium text-gray-700 text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    地板/樓板鋼筋
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <SelectField
                                        label="樓板類型"
                                        value={rebarEstimate.floorType}
                                        onChange={(v) => setRebarEstimate(prev => ({ ...prev, floorType: parseInt(v) }))}
                                        options={REBAR_USAGE_BY_COMPONENT.floor.map((f, i) => ({ value: i, label: `${f.label} (${f.usage} kg/m²)` }))}
                                    />
                                    <InputField
                                        label="樓板面積"
                                        value={rebarEstimate.floorArea}
                                        onChange={(v) => setRebarEstimate(prev => ({ ...prev, floorArea: v }))}
                                        unit="m²"
                                        placeholder="0"
                                    />
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">估算用量</label>
                                        <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-orange-600">
                                            {formatNumber(rebarEstimateResults.floor)} kg
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 樓梯 */}
                            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                <div className="font-medium text-gray-700 text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                    樓梯鋼筋
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <SelectField
                                        label="樓梯類型"
                                        value={rebarEstimate.stairType}
                                        onChange={(v) => setRebarEstimate(prev => ({ ...prev, stairType: parseInt(v) }))}
                                        options={REBAR_USAGE_BY_COMPONENT.stair.map((s, i) => ({ value: i, label: `${s.label} (${s.usage} kg/m²)` }))}
                                    />
                                    <InputField
                                        label="樓梯面積"
                                        value={rebarEstimate.stairArea}
                                        onChange={(v) => setRebarEstimate(prev => ({ ...prev, stairArea: v }))}
                                        unit="m²"
                                        placeholder="0"
                                    />
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">估算用量</label>
                                        <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-orange-600">
                                            {formatNumber(rebarEstimateResults.stair)} kg
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 總計 */}
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-orange-200 text-sm">鋼筋概算總量</div>
                                        <div className="text-3xl font-bold mt-1">
                                            {formatNumber(rebarEstimateResults.total)} <span className="text-lg">kg</span>
                                        </div>
                                        <div className="text-orange-200 text-xs mt-1">
                                            約 {formatNumber(rebarEstimateResults.total / 1000, 2)} 噸
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onAddRecord('鋼筋概算', '鋼筋概算總量', rebarEstimateResults.total, 'kg', rebarEstimateResults.total, null)}
                                        disabled={rebarEstimateResults.total <= 0}
                                        className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <Plus size={16} />
                                        加入記錄
                                    </button>
                                </div>
                                <div className="mt-3 pt-3 border-t border-white/20 grid grid-cols-3 gap-2 text-xs">
                                    <div className="flex items-center gap-1">
                                        <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                                        牆面: {formatNumber(rebarEstimateResults.wall)} kg
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-300 rounded-full"></span>
                                        地板: {formatNumber(rebarEstimateResults.floor)} kg
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="w-2 h-2 bg-purple-300 rounded-full"></span>
                                        樓梯: {formatNumber(rebarEstimateResults.stair)} kg
                                    </div>
                                </div>
                            </div>

                            {/* 參考表格 */}
                            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                                <div className="font-medium mb-2">📊 營造經驗參考值</div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    <div>牆 15cm: 23 kg/m²</div>
                                    <div>牆 20cm: 34 kg/m²</div>
                                    <div>牆 25cm: 47 kg/m²</div>
                                    <div>板 12cm: 13 kg/m²</div>
                                    <div>板 15cm: 17 kg/m²</div>
                                    <div>直跑梯: 40 kg/m²</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* 模板計算 */}
            {calcType === 'formwork' && (
                <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
                    {/* 模式切換 */}
                    <div className="flex gap-2 border-b border-gray-100 pb-3">
                        <button
                            onClick={() => setFormworkMode('estimate')}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${formworkMode === 'estimate'
                                ? 'bg-orange-100 text-orange-700 font-medium'
                                : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            建築概算
                        </button>
                        <button
                            onClick={() => setFormworkMode('structure')}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${formworkMode === 'structure'
                                ? 'bg-orange-100 text-orange-700 font-medium'
                                : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            結構模板
                        </button>
                    </div>

                    {/* 建築概算模式 */}
                    {formworkMode === 'estimate' && (
                        <>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Info size={16} />
                                公式: 模板面積 = 建築面積 × 係數 (1.3~2.2)
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <InputField label="建築面積" value={formworkArea} onChange={setFormworkArea} unit="m²" placeholder="0" />
                                <SelectField
                                    label="模板係數"
                                    value={formworkRatio}
                                    onChange={setFormworkRatio}
                                    options={[
                                        { value: '1.3', label: '1.3 - 簡單結構 (少柱少現澆板)' },
                                        { value: '1.8', label: '1.8 - 一般結構 (標準框架)' },
                                        { value: '2.2', label: '2.2 - 複雜結構 (多層住宅)' },
                                    ]}
                                />
                            </div>

                            {/* 模板係數詳細說明 */}
                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                <div className="font-medium text-blue-800 text-sm mb-2 flex items-center gap-2">
                                    <Info size={14} />
                                    模板係數說明
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                    <div className={`p-2 rounded-lg border ${formworkRatio === '1.3' ? 'bg-orange-100 border-orange-300' : 'bg-white border-gray-200'}`}>
                                        <div className="font-bold text-gray-800 mb-1">係數 1.3</div>
                                        <div className="text-gray-600 leading-relaxed">
                                            <div className="font-medium text-blue-700 mb-1">適用：簡單結構</div>
                                            <ul className="list-disc list-inside space-y-0.5">
                                                <li>少量柱子的建築</li>
                                                <li>預鑄板為主，現澆板少</li>
                                                <li>單層或簡易倉庫廠房</li>
                                                <li>開放式空間較多</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className={`p-2 rounded-lg border ${formworkRatio === '1.8' ? 'bg-orange-100 border-orange-300' : 'bg-white border-gray-200'}`}>
                                        <div className="font-bold text-gray-800 mb-1">係數 1.8</div>
                                        <div className="text-gray-600 leading-relaxed">
                                            <div className="font-medium text-blue-700 mb-1">適用：一般結構（最常用）</div>
                                            <ul className="list-disc list-inside space-y-0.5">
                                                <li>標準框架結構</li>
                                                <li>一般商業/辦公建築</li>
                                                <li>標準柱距與樓板配置</li>
                                                <li>3~5 層樓建築</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className={`p-2 rounded-lg border ${formworkRatio === '2.2' ? 'bg-orange-100 border-orange-300' : 'bg-white border-gray-200'}`}>
                                        <div className="font-bold text-gray-800 mb-1">係數 2.2</div>
                                        <div className="text-gray-600 leading-relaxed">
                                            <div className="font-medium text-blue-700 mb-1">適用：複雜結構</div>
                                            <ul className="list-disc list-inside space-y-0.5">
                                                <li>標準多層住宅大樓</li>
                                                <li>密集柱子與牆面</li>
                                                <li>多樓梯/電梯井</li>
                                                <li>複雜梁配置</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-500 flex items-start gap-1">
                                    <span className="text-blue-500">💡</span>
                                    <span>係數越高代表單位建築面積需要越多模板面積。實際使用時請依現場結構複雜度適當調整。</span>
                                </div>
                            </div>
                            <WastageControl
                                wastage={formworkWastage}
                                setWastage={setFormworkWastage}
                                defaultValue={DEFAULT_WASTAGE.formwork}
                                useCustom={formworkCustomWastage}
                                setUseCustom={setFormworkCustomWastage}
                            />
                            <ResultDisplay
                                label="模板面積"
                                value={formworkResult}
                                unit="m²"
                                wastageValue={formworkWithWastage}
                                onAddRecord={(subType, label, value, unit, wastageValue) =>
                                    onAddRecord(subType, label, value, unit, wastageValue, formworkCost)}
                                subType="模板"
                            />

                            <CostInput
                                label="模板"
                                quantity={formworkWithWastage}
                                unit="m²"
                                vendors={vendors.filter(v => v.category === '工程工班' || v.tradeType?.includes('模板'))}
                                onChange={setFormworkCost}
                                placeholder={{ spec: '例：清水模板' }}
                            />
                        </>
                    )}

                    {/* 結構模板模式 */}
                    {formworkMode === 'structure' && (
                        <>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Info size={16} />
                                依結構尺寸精確計算模板面積
                            </div>

                            {/* 結構類型選擇 */}
                            <div className="flex gap-2 flex-wrap">
                                {[
                                    { id: 'parapet', label: '女兒牆', icon: '🧱' },
                                    { id: 'beam', label: '地樑', icon: '📏' },
                                    { id: 'column', label: '柱子', icon: '🏛️' },
                                    { id: 'wall', label: '牆壁', icon: '🧱' },
                                    { id: 'floor', label: '樓板', icon: '📐' },
                                ].map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setStructureType(item.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${structureType === item.id
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                    >
                                        <span>{item.icon}</span>
                                        {item.label}
                                    </button>
                                ))}
                            </div>

                            {/* 女兒牆計算 */}
                            {structureType === 'parapet' && (
                                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                    <div className="font-medium text-gray-700 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                        女兒牆模板計算
                                        <span className="text-xs text-gray-500 font-normal">(內外雙面)</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <InputField label="長度" value={parapetLength} onChange={setParapetLength} unit="m" placeholder="0" />
                                        <SelectField
                                            label="厚度"
                                            value={parapetThickness}
                                            onChange={(v) => setParapetThickness(v === 'custom' ? 'custom' : parseInt(v))}
                                            options={PARAPET_THICKNESS_OPTIONS}
                                        />
                                        <InputField label="高度" value={parapetHeight} onChange={setParapetHeight} unit="m" placeholder="0" />
                                        <InputField label="數量" value={parapetCount} onChange={setParapetCount} unit="處" placeholder="1" />
                                    </div>
                                    {parapetThickness === 'custom' && (
                                        <InputField label="自訂厚度" value={parapetCustomThickness} onChange={setParapetCustomThickness} unit="cm" placeholder="0" />
                                    )}
                                    <div className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-200">
                                        <strong>公式:</strong> 長度 × 高度 × 2(雙面) × 數量 = {parapetLength || 0} × {parapetHeight || 0} × 2 × {parapetCount || 1} = <span className="text-orange-600 font-bold">{formatNumber(getParapetFormwork())} m²</span>
                                    </div>
                                </div>
                            )}

                            {/* 地樑計算 */}
                            {structureType === 'beam' && (
                                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                    <div className="font-medium text-gray-700 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        地樑模板計算
                                        <span className="text-xs text-gray-500 font-normal">(側面模板)</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <SelectField
                                            label="地樑規格"
                                            value={beamPreset}
                                            onChange={setBeamPreset}
                                            options={GROUND_BEAM_PRESETS.map(p => ({ value: p.value, label: `${p.label} ${p.width ? `(${p.width}×${p.height}cm)` : ''}` }))}
                                        />
                                        <InputField label="長度" value={beamLength} onChange={setBeamLength} unit="m" placeholder="0" />
                                        <InputField label="數量" value={beamCount} onChange={setBeamCount} unit="支" placeholder="1" />
                                        <div className="flex items-end pb-2">
                                            <label className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={beamIncludeBottom}
                                                    onChange={(e) => setBeamIncludeBottom(e.target.checked)}
                                                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                                />
                                                含底模
                                            </label>
                                        </div>
                                    </div>
                                    {beamPreset === 'custom' && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <InputField label="梁寬" value={beamCustomWidth} onChange={setBeamCustomWidth} unit="cm" placeholder="0" />
                                            <InputField label="梁高" value={beamCustomHeight} onChange={setBeamCustomHeight} unit="cm" placeholder="0" />
                                        </div>
                                    )}
                                    {/* 地樑規格參考表 */}
                                    <div className="bg-white p-3 rounded border border-gray-200">
                                        <div className="text-xs font-medium text-gray-600 mb-2">常用規格參考:</div>
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                                            {GROUND_BEAM_PRESETS.filter(p => p.value !== 'custom').map(p => (
                                                <div key={p.value} className={`p-2 rounded border text-center ${beamPreset === p.value ? 'bg-orange-100 border-orange-300' : 'bg-gray-50 border-gray-200'}`}>
                                                    <div className="font-bold">{p.value}</div>
                                                    <div className="text-gray-600">{p.width}×{p.height}cm</div>
                                                    <div className="text-gray-400 text-[10px]">{p.desc}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-200">
                                        <strong>公式:</strong> (梁高×2{beamIncludeBottom ? '+梁寬' : ''}) × 長度 × 數量 = <span className="text-orange-600 font-bold">{formatNumber(getBeamFormwork())} m²</span>
                                    </div>
                                </div>
                            )}

                            {/* 柱子計算 */}
                            {structureType === 'column' && (
                                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                    <div className="font-medium text-gray-700 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        柱子模板計算
                                        <span className="text-xs text-gray-500 font-normal">(四周面)</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        <SelectField
                                            label="柱子規格"
                                            value={columnPreset}
                                            onChange={setColumnPreset}
                                            options={COLUMN_PRESETS.map(p => ({ value: p.value, label: p.label }))}
                                        />
                                        <InputField label="柱高" value={columnHeight} onChange={setColumnHeight} unit="m" placeholder="0" />
                                        <InputField label="數量" value={columnCount} onChange={setColumnCount} unit="支" placeholder="1" />
                                    </div>
                                    {columnPreset === 'custom' && (
                                        <div className="grid grid-cols-3 gap-3">
                                            <InputField label="柱寬" value={columnCustomWidth} onChange={setColumnCustomWidth} unit="cm" placeholder="0" />
                                            <InputField label="柱深" value={columnCustomDepth} onChange={setColumnCustomDepth} unit="cm" placeholder="0" />
                                            <InputField label="或圓柱直徑" value={columnCustomDiameter} onChange={setColumnCustomDiameter} unit="cm" placeholder="0" />
                                        </div>
                                    )}
                                    {/* 柱子規格參考表 */}
                                    <div className="bg-white p-3 rounded border border-gray-200">
                                        <div className="text-xs font-medium text-gray-600 mb-2">常用規格參考:</div>
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                                            {COLUMN_PRESETS.filter(p => p.value !== 'custom').slice(0, 5).map(p => (
                                                <div key={p.value} className={`p-2 rounded border text-center ${columnPreset === p.value ? 'bg-orange-100 border-orange-300' : 'bg-gray-50 border-gray-200'}`}>
                                                    <div className="font-bold">{p.value}</div>
                                                    <div className="text-gray-600">{p.type === 'round' ? `Ø${p.diameter}cm` : `${p.width}×${p.depth}cm`}</div>
                                                    <div className="text-gray-400 text-[10px]">{p.desc}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mt-2">
                                            {COLUMN_PRESETS.filter(p => p.value !== 'custom').slice(5).map(p => (
                                                <div key={p.value} className={`p-2 rounded border text-center ${columnPreset === p.value ? 'bg-orange-100 border-orange-300' : 'bg-gray-50 border-gray-200'}`}>
                                                    <div className="font-bold">{p.value}</div>
                                                    <div className="text-gray-600">{p.type === 'round' ? `Ø${p.diameter}cm` : `${p.width}×${p.depth}cm`}</div>
                                                    <div className="text-gray-400 text-[10px]">{p.desc}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-200">
                                        <strong>公式:</strong> {COLUMN_PRESETS.find(p => p.value === columnPreset)?.type === 'round' ? 'π × 直徑' : '(寬+深) × 2'} × 高度 × 數量 = <span className="text-orange-600 font-bold">{formatNumber(getColumnFormwork())} m²</span>
                                    </div>
                                </div>
                            )}

                            {/* 牆壁計算 */}
                            {structureType === 'wall' && (
                                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                    <div className="font-medium text-gray-700 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                        牆壁模板計算
                                        <span className="text-xs text-gray-500 font-normal">(可選單/雙面)</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                        <SelectField
                                            label="牆壁規格"
                                            value={wallPreset}
                                            onChange={setWallPreset}
                                            options={WALL_THICKNESS_PRESETS.map(p => ({ value: p.value, label: `${p.label}` }))}
                                        />
                                        <InputField label="長度" value={wallLength} onChange={setWallLength} unit="m" placeholder="0" />
                                        <InputField label="高度" value={wallHeight} onChange={setWallHeight} unit="m" placeholder="0" />
                                        <InputField label="數量" value={wallCount} onChange={setWallCount} unit="面" placeholder="1" />
                                        <div className="flex items-end pb-2">
                                            <label className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={wallDoubleSided}
                                                    onChange={(e) => setWallDoubleSided(e.target.checked)}
                                                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                                />
                                                雙面模板
                                            </label>
                                        </div>
                                    </div>
                                    {wallPreset === 'custom' && (
                                        <InputField label="自訂厚度" value={wallCustomThickness} onChange={setWallCustomThickness} unit="cm" placeholder="0" />
                                    )}
                                    {/* 牆壁規格參考表 */}
                                    <div className="bg-white p-3 rounded border border-gray-200">
                                        <div className="text-xs font-medium text-gray-600 mb-2">常用規格參考:</div>
                                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                                            {WALL_THICKNESS_PRESETS.filter(p => p.value !== 'custom').map(p => (
                                                <div key={p.value} className={`p-2 rounded border text-center ${wallPreset === p.value ? 'bg-orange-100 border-orange-300' : 'bg-gray-50 border-gray-200'}`}>
                                                    <div className="font-bold">{p.value}</div>
                                                    <div className="text-gray-600">{p.thickness}cm</div>
                                                    <div className="text-gray-400 text-[10px]">{p.desc}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* 法規參照 */}
                                    {showRegulations && (
                                        <RegulationReference componentType="wall" />
                                    )}
                                    <div className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-200">
                                        <strong>公式:</strong> 長度 × 高度 × {wallDoubleSided ? '2(雙面)' : '1(單面)'} × 數量 = <span className="text-orange-600 font-bold">{formatNumber(getWallFormwork())} m²</span>
                                    </div>
                                </div>
                            )}

                            {/* 樓板計算 */}
                            {structureType === 'floor' && (
                                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                    <div className="font-medium text-gray-700 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                                        樓板模板計算
                                        <span className="text-xs text-gray-500 font-normal">(底模)</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <SelectField
                                            label="樓板規格"
                                            value={floorPreset}
                                            onChange={setFloorPreset}
                                            options={FLOOR_THICKNESS_PRESETS.map(p => ({ value: p.value, label: `${p.label}` }))}
                                        />
                                        <InputField label="長度" value={floorLength} onChange={setFloorLength} unit="m" placeholder="0" />
                                        <InputField label="寬度" value={floorWidth} onChange={setFloorWidth} unit="m" placeholder="0" />
                                        <InputField label="數量" value={floorCount} onChange={setFloorCount} unit="處" placeholder="1" />
                                    </div>
                                    {floorPreset === 'custom' && (
                                        <InputField label="自訂厚度" value={floorCustomThickness} onChange={setFloorCustomThickness} unit="cm" placeholder="0" />
                                    )}
                                    {/* 樓板規格參考表 */}
                                    <div className="bg-white p-3 rounded border border-gray-200">
                                        <div className="text-xs font-medium text-gray-600 mb-2">常用規格參考:</div>
                                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                                            {FLOOR_THICKNESS_PRESETS.filter(p => p.value !== 'custom').map(p => (
                                                <div key={p.value} className={`p-2 rounded border text-center ${floorPreset === p.value ? 'bg-orange-100 border-orange-300' : 'bg-gray-50 border-gray-200'}`}>
                                                    <div className="font-bold">{p.value}</div>
                                                    <div className="text-gray-600">{p.thickness}cm</div>
                                                    <div className="text-gray-400 text-[10px]">{p.desc}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* 法規參照與常用配筋 */}
                                    {showRegulations && (
                                        <div className="space-y-2">
                                            <RegulationReference componentType="floor" />
                                            <PresetRebarInfo preset={floorPreset} type="slab" />
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-200">
                                        <strong>公式:</strong> 長度 × 寬度 × 數量 = <span className="text-orange-600 font-bold">{formatNumber(getFloorFormwork())} m²</span>
                                    </div>
                                </div>
                            )}

                            {/* Phase 2: 模板進階設定 */}
                            <details className="group">
                                <summary className="text-sm font-medium text-gray-600 cursor-pointer flex items-center gap-2 hover:text-orange-700 transition-colors">
                                    <span className="transform transition-transform group-open:rotate-90">▶</span>
                                    模板進階設定
                                    <span className="text-xs text-gray-400 font-normal">(類型、施工條件、開口扣除)</span>
                                </summary>
                                <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-100 space-y-3">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">模板類型</label>
                                            <select
                                                value={formworkType}
                                                onChange={(e) => setFormworkType(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white"
                                            >
                                                {FORMWORK_TYPES.map(t => (
                                                    <option key={t.value} value={t.value}>{t.label} (×{t.coefficient})</option>
                                                ))}
                                            </select>
                                            <div className="text-[10px] text-gray-400 mt-1">
                                                {FORMWORK_TYPES.find(t => t.value === formworkType)?.desc}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">施工條件</label>
                                            <select
                                                value={constructionCondition}
                                                onChange={(e) => setConstructionCondition(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white"
                                            >
                                                {CONSTRUCTION_CONDITIONS.map(c => (
                                                    <option key={c.value} value={c.value}>{c.label} (×{c.coefficient})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">開口扣除</label>
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    value={openingDeduction}
                                                    onChange={(e) => setOpeningDeduction(parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                                    min="0"
                                                    step="0.1"
                                                    placeholder="0"
                                                />
                                                <span className="text-xs text-gray-500">m²</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* 係數摘要 */}
                                    <div className="text-xs text-orange-700 bg-orange-100 p-2 rounded">
                                        <strong>成本係數:</strong> 模板類型 ×{FORMWORK_TYPES.find(t => t.value === formworkType)?.coefficient || 1} × 施工條件 ×{CONSTRUCTION_CONDITIONS.find(c => c.value === constructionCondition)?.coefficient || 1} = <span className="font-bold">×{((FORMWORK_TYPES.find(t => t.value === formworkType)?.coefficient || 1) * (CONSTRUCTION_CONDITIONS.find(c => c.value === constructionCondition)?.coefficient || 1)).toFixed(2)}</span>
                                        {openingDeduction > 0 && <span className="ml-2">| 扣除開口: -{openingDeduction} m²</span>}
                                    </div>
                                </div>
                            </details>

                            <WastageControl
                                wastage={formworkWastage}
                                setWastage={setFormworkWastage}
                                defaultValue={DEFAULT_WASTAGE.formwork}
                                useCustom={formworkCustomWastage}
                                setUseCustom={setFormworkCustomWastage}
                            />

                            <ResultDisplay
                                label={`${structureType === 'parapet' ? '女兒牆' : structureType === 'beam' ? '地樑' : structureType === 'column' ? '柱子' : structureType === 'wall' ? '牆壁' : '樓板'}模板面積`}
                                value={structureFormworkResult}
                                unit="m²"
                                wastageValue={structureFormworkWithWastage}
                                onAddRecord={(subType, label, value, unit, wastageValue) =>
                                    onAddRecord(subType, label, value, unit, wastageValue, formworkCost)}
                                subType="模板"
                            />

                            <CostInput
                                label="模板"
                                quantity={structureFormworkWithWastage}
                                unit="m²"
                                vendors={vendors.filter(v => v.category === '工程工班' || v.tradeType?.includes('模板'))}
                                onChange={setFormworkCost}
                                placeholder={{ spec: '例：清水模板' }}
                            />
                        </>
                    )}
                </div>
            )}

            {/* 構件計算 */}
            {calcType === 'component' && (
                <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
                    <div className="font-medium text-gray-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></span>
                        構件計算器
                        <span className="text-xs text-gray-500 font-normal">(依構件類型計算模板面積與鋼筋用量)</span>
                    </div>

                    {/* 構件類型選擇 */}
                    <div className="flex gap-2 flex-wrap">
                        {[
                            { id: 'column', label: '🏛️ 柱子', color: 'green' },
                            { id: 'beam', label: '🔲 梁', color: 'blue' },
                            { id: 'floor', label: '📋 樓板', color: 'cyan' },
                            { id: 'wall', label: '🧱 牆體', color: 'purple' },
                            { id: 'parapet', label: '🏠 女兒牆', color: 'orange' },
                            { id: 'groundbeam', label: '📐 地梁', color: 'amber' },
                            { id: 'foundation', label: '🔳 基礎', color: 'gray' },
                        ].map(comp => (
                            <button
                                key={comp.id}
                                onClick={() => setStructureType(comp.id)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${structureType === comp.id
                                    ? 'bg-orange-500 text-white shadow-md'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                            >
                                {comp.label}
                            </button>
                        ))}
                    </div>

                    {/* 柱子計算 */}
                    {structureType === 'column' && (
                        <div className="bg-gradient-to-br from-green-50 to-white rounded-lg p-4 space-y-4 border border-green-100">
                            <div className="font-medium text-green-700 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                柱子材料計算
                                <span className="text-xs text-gray-500 font-normal">(模板 + 混凝土 + 鋼筋)</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <SelectField
                                    label="柱子規格"
                                    value={columnPreset}
                                    onChange={setColumnPreset}
                                    options={COLUMN_PRESETS.map(p => ({ value: p.value, label: p.label }))}
                                />
                                <InputField label="柱高" value={columnHeight} onChange={setColumnHeight} unit="m" placeholder="0" />
                                <InputField label="數量" value={columnCount} onChange={setColumnCount} unit="支" placeholder="1" />
                            </div>
                            {columnPreset === 'custom' && (
                                <div className="grid grid-cols-3 gap-3">
                                    <InputField label="柱寬" value={columnCustomWidth} onChange={setColumnCustomWidth} unit="cm" placeholder="0" />
                                    <InputField label="柱深" value={columnCustomDepth} onChange={setColumnCustomDepth} unit="cm" placeholder="0" />
                                    <InputField label="或圓柱直徑" value={columnCustomDiameter} onChange={setColumnCustomDiameter} unit="cm" placeholder="0" />
                                </div>
                            )}
                            {/* 法規參照與常用配筋 */}
                            {showRegulations && (
                                <div className="space-y-2">
                                    <RegulationReference componentType="column" />
                                    <PresetRebarInfo preset={columnPreset} type="column" />
                                </div>
                            )}
                            <div className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-200">
                                <strong>公式:</strong> {COLUMN_PRESETS.find(p => p.value === columnPreset)?.type === 'round' ? 'π × 直徑' : '(寬+深) × 2'} × 高度 × 數量 = <span className="text-orange-600 font-bold">{formatNumber(getColumnFormwork())} m²</span>
                            </div>
                            {/* 進階配筋設定 */}
                            <details className="group" open={useAdvancedRebar}>
                                <summary
                                    className="text-sm font-medium text-gray-600 cursor-pointer flex items-center gap-2 hover:text-green-700 transition-colors"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setUseAdvancedRebar(!useAdvancedRebar);
                                    }}
                                >
                                    <span className={`transform transition-transform ${useAdvancedRebar ? 'rotate-90' : ''}`}>▶</span>
                                    進階配筋設定
                                    <span className="text-xs text-gray-400 font-normal">
                                        {useAdvancedRebar ? '(精確計算模式)' : '(快速估算模式)'}
                                    </span>
                                </summary>
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                                    <div className="text-xs font-medium text-gray-500">主筋配置</div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        <SelectField
                                            label="主筋號數"
                                            value={columnMainBar}
                                            onChange={setColumnMainBar}
                                            options={REBAR_SIZES.map(r => ({ value: r.value, label: r.label }))}
                                        />
                                        <SelectField
                                            label="主筋根數"
                                            value={columnMainBarCount}
                                            onChange={(v) => setColumnMainBarCount(parseInt(v))}
                                            options={COLUMN_MAIN_BAR_COUNT.map(c => ({ value: c.value, label: c.label }))}
                                        />
                                        <SelectField
                                            label="混凝土規格"
                                            value={columnConcreteGrade}
                                            onChange={(v) => setColumnConcreteGrade(parseInt(v))}
                                            options={CONCRETE_GRADES.map(c => ({ value: c.value, label: `${c.label} ${c.desc}` }))}
                                        />
                                    </div>
                                    <div className="text-xs font-medium text-gray-500">箍筋配置</div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <SelectField
                                            label="箍筋號數"
                                            value={columnStirrup}
                                            onChange={setColumnStirrup}
                                            options={REBAR_SIZES.slice(0, 4).map(r => ({ value: r.value, label: r.label }))}
                                        />
                                        <SelectField
                                            label="箍筋間距"
                                            value={columnStirrupSpacing}
                                            onChange={(v) => setColumnStirrupSpacing(parseInt(v))}
                                            options={REBAR_SPACING_OPTIONS.map(s => ({ value: s.value, label: s.label }))}
                                        />
                                    </div>
                                </div>
                                {useAdvancedRebar && (
                                    <div className="text-xs text-green-600 bg-green-50 p-2 rounded mt-2 border border-green-200">
                                        <strong>精確計算:</strong> {columnMainBarCount}根{columnMainBar}主筋 + {columnStirrup}@{columnStirrupSpacing}mm箍筋
                                    </div>
                                )}
                            </details>
                            {/* 三項結果顯示 */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <ResultDisplay
                                    label="模板面積"
                                    value={getColumnFormwork()}
                                    unit="m²"
                                    wastageValue={applyWastage(getColumnFormwork(), formworkWastage)}
                                    onAddRecord={(subType, label, value, unit, wastageValue) =>
                                        onAddRecord(subType, label, value, unit, wastageValue, formworkCost)}
                                    subType="構件-柱子"
                                />
                                <ResultDisplay
                                    label="混凝土"
                                    value={getColumnConcrete()}
                                    unit="m³"
                                    wastageValue={applyWastage(getColumnConcrete(), concreteWastage)}
                                    onAddRecord={(subType, label, value, unit, wastageValue) =>
                                        onAddRecord(subType, label, value, unit, wastageValue, concreteCost)}
                                    subType="構件-柱子"
                                />
                                <ResultDisplay
                                    label="鋼筋"
                                    value={getColumnRebar()}
                                    unit="kg"
                                    wastageValue={applyWastage(getColumnRebar(), rebarWastage)}
                                    onAddRecord={(subType, label, value, unit, wastageValue) =>
                                        onAddRecord(subType, label, value, unit, wastageValue, rebarCost)}
                                    subType="構件-柱子"
                                />
                            </div>
                        </div>
                    )}

                    {/* 梁計算 */}
                    {structureType === 'beam' && (
                        <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-4 space-y-4 border border-blue-100">
                            <div className="font-medium text-blue-700 flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                梁材料計算
                                <span className="text-xs text-gray-500 font-normal">(模板 + 混凝土 + 鋼筋)</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <SelectField
                                    label="梁規格"
                                    value={beamPreset}
                                    onChange={setBeamPreset}
                                    options={GROUND_BEAM_PRESETS.map(p => ({ value: p.value, label: `${p.label} ${p.width ? `(${p.width}×${p.height}cm)` : ''}` }))}
                                />
                                <InputField label="長度" value={beamLength} onChange={setBeamLength} unit="m" placeholder="0" />
                                <InputField label="數量" value={beamCount} onChange={setBeamCount} unit="支" placeholder="1" />
                                <div className="flex items-end pb-2">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={beamIncludeBottom}
                                            onChange={(e) => setBeamIncludeBottom(e.target.checked)}
                                            className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                        />
                                        含底模
                                    </label>
                                </div>
                            </div>
                            {beamPreset === 'custom' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <InputField label="梁寬" value={beamCustomWidth} onChange={setBeamCustomWidth} unit="cm" placeholder="0" />
                                    <InputField label="梁高" value={beamCustomHeight} onChange={setBeamCustomHeight} unit="cm" placeholder="0" />
                                </div>
                            )}
                            {/* 法規參照與常用配筋 */}
                            {showRegulations && (
                                <div className="space-y-2">
                                    <RegulationReference componentType="beam" />
                                    <PresetRebarInfo preset={beamPreset} type="beam" />
                                </div>
                            )}
                            <div className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-200">
                                <strong>公式:</strong> (梁高×2{beamIncludeBottom ? '+梁寬' : ''}) × 長度 × 數量 = <span className="text-orange-600 font-bold">{formatNumber(getBeamFormwork())} m²</span>
                            </div>
                            {/* 進階配筋設定 */}
                            <details className="group" open={useAdvancedRebar}>
                                <summary
                                    className="text-sm font-medium text-gray-600 cursor-pointer flex items-center gap-2 hover:text-blue-700 transition-colors"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setUseAdvancedRebar(!useAdvancedRebar);
                                    }}
                                >
                                    <span className={`transform transition-transform ${useAdvancedRebar ? 'rotate-90' : ''}`}>▶</span>
                                    進階配筋設定
                                    <span className="text-xs text-gray-400 font-normal">
                                        {useAdvancedRebar ? '(精確計算模式)' : '(快速估算模式)'}
                                    </span>
                                </summary>
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                                    <div className="text-xs font-medium text-gray-500">上筋配置</div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        <SelectField
                                            label="上筋號數"
                                            value={beamTopBar}
                                            onChange={setBeamTopBar}
                                            options={REBAR_SIZES.map(r => ({ value: r.value, label: r.label }))}
                                        />
                                        <SelectField
                                            label="上筋根數"
                                            value={beamTopBarCount}
                                            onChange={(v) => setBeamTopBarCount(parseInt(v))}
                                            options={[2, 3, 4, 5, 6].map(n => ({ value: n, label: `${n}根` }))}
                                        />
                                        <SelectField
                                            label="混凝土規格"
                                            value={beamConcreteGrade}
                                            onChange={(v) => setBeamConcreteGrade(parseInt(v))}
                                            options={CONCRETE_GRADES.map(c => ({ value: c.value, label: `${c.label} ${c.desc}` }))}
                                        />
                                    </div>
                                    <div className="text-xs font-medium text-gray-500">下筋配置</div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <SelectField
                                            label="下筋號數"
                                            value={beamBottomBar}
                                            onChange={setBeamBottomBar}
                                            options={REBAR_SIZES.map(r => ({ value: r.value, label: r.label }))}
                                        />
                                        <SelectField
                                            label="下筋根數"
                                            value={beamBottomBarCount}
                                            onChange={(v) => setBeamBottomBarCount(parseInt(v))}
                                            options={[2, 3, 4, 5, 6, 8].map(n => ({ value: n, label: `${n}根` }))}
                                        />
                                    </div>
                                    <div className="text-xs font-medium text-gray-500">箍筋配置</div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <SelectField
                                            label="箍筋號數"
                                            value={beamStirrup}
                                            onChange={setBeamStirrup}
                                            options={REBAR_SIZES.slice(0, 4).map(r => ({ value: r.value, label: r.label }))}
                                        />
                                        <SelectField
                                            label="箍筋間距"
                                            value={beamStirrupSpacing}
                                            onChange={(v) => setBeamStirrupSpacing(parseInt(v))}
                                            options={REBAR_SPACING_OPTIONS.map(s => ({ value: s.value, label: s.label }))}
                                        />
                                    </div>
                                </div>
                                {useAdvancedRebar && (
                                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded mt-2 border border-blue-200">
                                        <strong>精確計算:</strong> 上筋{beamTopBarCount}根{beamTopBar} + 下筋{beamBottomBarCount}根{beamBottomBar} + {beamStirrup}@{beamStirrupSpacing}mm箍筋
                                    </div>
                                )}
                            </details>
                            {/* 三項結果顯示 */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <ResultDisplay
                                    label="模板面積"
                                    value={getBeamFormwork()}
                                    unit="m²"
                                    wastageValue={applyWastage(getBeamFormwork(), formworkWastage)}
                                    onAddRecord={(subType, label, value, unit, wastageValue) =>
                                        onAddRecord(subType, label, value, unit, wastageValue, formworkCost)}
                                    subType="構件-梁"
                                />
                                <ResultDisplay
                                    label="混凝土"
                                    value={getBeamConcrete()}
                                    unit="m³"
                                    wastageValue={applyWastage(getBeamConcrete(), concreteWastage)}
                                    onAddRecord={(subType, label, value, unit, wastageValue) =>
                                        onAddRecord(subType, label, value, unit, wastageValue, concreteCost)}
                                    subType="構件-梁"
                                />
                                <ResultDisplay
                                    label="鋼筋"
                                    value={getBeamRebar()}
                                    unit="kg"
                                    wastageValue={applyWastage(getBeamRebar(), rebarWastage)}
                                    onAddRecord={(subType, label, value, unit, wastageValue) =>
                                        onAddRecord(subType, label, value, unit, wastageValue, rebarCost)}
                                    subType="構件-梁"
                                />
                            </div>
                        </div>
                    )}

                    {/* 樓板計算 */}
                    {structureType === 'floor' && (
                        <div className="bg-gradient-to-br from-cyan-50 to-white rounded-lg p-4 space-y-4 border border-cyan-100">
                            <div className="font-medium text-cyan-700 flex items-center gap-2">
                                <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                                樓板材料計算
                                <span className="text-xs text-gray-500 font-normal">(模板 + 混凝土 + 鋼筋)</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <SelectField
                                    label="樓板規格"
                                    value={floorPreset}
                                    onChange={setFloorPreset}
                                    options={FLOOR_THICKNESS_PRESETS.map(p => ({ value: p.value, label: `${p.label}` }))}
                                />
                                <InputField label="長度" value={floorLength} onChange={setFloorLength} unit="m" placeholder="0" />
                                <InputField label="寬度" value={floorWidth} onChange={setFloorWidth} unit="m" placeholder="0" />
                                <InputField label="數量" value={floorCount} onChange={setFloorCount} unit="處" placeholder="1" />
                            </div>
                            {floorPreset === 'custom' && (
                                <InputField label="自訂厚度" value={floorCustomThickness} onChange={setFloorCustomThickness} unit="cm" placeholder="0" />
                            )}
                            <div className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-200">
                                <strong>公式:</strong> 長度 × 寬度 × 數量 = <span className="text-orange-600 font-bold">{formatNumber(getFloorFormwork())} m²</span>
                            </div>
                            {/* 進階配筋設定 */}
                            <details className="group" open={useAdvancedRebar}>
                                <summary
                                    className="text-sm font-medium text-gray-600 cursor-pointer flex items-center gap-2 hover:text-cyan-700 transition-colors"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setUseAdvancedRebar(!useAdvancedRebar);
                                    }}
                                >
                                    <span className={`transform transition-transform ${useAdvancedRebar ? 'rotate-90' : ''}`}>▶</span>
                                    進階配筋設定
                                    <span className="text-xs text-gray-400 font-normal">
                                        {useAdvancedRebar ? '(精確計算模式)' : '(快速估算模式)'}
                                    </span>
                                </summary>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <SelectField
                                        label="鋼筋號數"
                                        value={floorRebarSize}
                                        onChange={setFloorRebarSize}
                                        options={REBAR_SIZES.map(r => ({ value: r.value, label: r.label }))}
                                    />
                                    <SelectField
                                        label="配筋間距"
                                        value={floorRebarSpacing}
                                        onChange={(v) => setFloorRebarSpacing(parseInt(v))}
                                        options={REBAR_SPACING_OPTIONS.map(s => ({ value: s.value, label: s.label }))}
                                    />
                                    <SelectField
                                        label="配筋層數"
                                        value={floorRebarLayer}
                                        onChange={setFloorRebarLayer}
                                        options={REBAR_LAYER_OPTIONS.map(l => ({ value: l.value, label: l.label }))}
                                    />
                                    <SelectField
                                        label="混凝土規格"
                                        value={floorConcreteGrade}
                                        onChange={(v) => setFloorConcreteGrade(parseInt(v))}
                                        options={CONCRETE_GRADES.map(c => ({ value: c.value, label: `${c.label} ${c.desc}` }))}
                                    />
                                </div>
                                {useAdvancedRebar && (
                                    <div className="text-xs text-cyan-600 bg-cyan-50 p-2 rounded mt-2 border border-cyan-200">
                                        <strong>精確計算:</strong> {floorRebarSize} @{floorRebarSpacing}mm {floorRebarLayer === 'double' ? '雙層' : '單層'}雙向配筋
                                    </div>
                                )}
                            </details>
                            {/* 三項結果顯示 */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <ResultDisplay
                                    label="模板面積"
                                    value={getFloorFormwork()}
                                    unit="m²"
                                    wastageValue={applyWastage(getFloorFormwork(), formworkWastage)}
                                    onAddRecord={(subType, label, value, unit, wastageValue) =>
                                        onAddRecord(subType, label, value, unit, wastageValue, formworkCost)}
                                    subType="構件-樓板"
                                />
                                <ResultDisplay
                                    label="混凝土"
                                    value={getFloorConcrete()}
                                    unit="m³"
                                    wastageValue={applyWastage(getFloorConcrete(), concreteWastage)}
                                    onAddRecord={(subType, label, value, unit, wastageValue) =>
                                        onAddRecord(subType, label, value, unit, wastageValue, concreteCost)}
                                    subType="構件-樓板"
                                />
                                <ResultDisplay
                                    label="鋼筋"
                                    value={getFloorRebar()}
                                    unit="kg"
                                    wastageValue={applyWastage(getFloorRebar(), rebarWastage)}
                                    onAddRecord={(subType, label, value, unit, wastageValue) =>
                                        onAddRecord(subType, label, value, unit, wastageValue, rebarCost)}
                                    subType="構件-樓板"
                                />
                            </div>
                        </div>
                    )}

                    {/* 牆體計算 */}
                    {structureType === 'wall' && (
                        <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-4 space-y-4 border border-purple-100">
                            <div className="font-medium text-purple-700 flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                牆壁材料計算
                                <span className="text-xs text-gray-500 font-normal">(模板 + 混凝土 + 鋼筋)</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                <SelectField
                                    label="牆壁規格"
                                    value={wallPreset}
                                    onChange={setWallPreset}
                                    options={WALL_THICKNESS_PRESETS.map(p => ({ value: p.value, label: `${p.label}` }))}
                                />
                                <InputField label="長度" value={wallLength} onChange={setWallLength} unit="m" placeholder="0" />
                                <InputField label="高度" value={wallHeight} onChange={setWallHeight} unit="m" placeholder="0" />
                                <InputField label="數量" value={wallCount} onChange={setWallCount} unit="面" placeholder="1" />
                                <div className="flex items-end pb-2">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={wallDoubleSided}
                                            onChange={(e) => setWallDoubleSided(e.target.checked)}
                                            className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                        />
                                        雙面模板
                                    </label>
                                </div>
                            </div>
                            {wallPreset === 'custom' && (
                                <InputField label="自訂厚度" value={wallCustomThickness} onChange={setWallCustomThickness} unit="cm" placeholder="0" />
                            )}
                            {/* 開口扣除 */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-500 mb-1">開口扣除 (門窗)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={wallOpeningDeduction}
                                            onChange={(e) => setWallOpeningDeduction(e.target.value)}
                                            placeholder="0"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">m²</span>
                                    </div>
                                </div>
                                <div className="flex items-end">
                                    <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded border border-purple-200">
                                        淨牆面積: {formatNumber(Math.max(0, getWallFormwork() - (parseFloat(wallOpeningDeduction) || 0)))} m²
                                    </div>
                                </div>
                            </div>
                            {/* 法規參照 */}
                            {showRegulations && (
                                <RegulationReference componentType="wall" />
                            )}
                            <div className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-200">
                                <strong>公式:</strong> (長度 × 高度 × {wallDoubleSided ? '2(雙面)' : '1(單面)'} × 數量) - 開口 = <span className="text-orange-600 font-bold">{formatNumber(Math.max(0, getWallFormwork() - (parseFloat(wallOpeningDeduction) || 0)))} m²</span>
                            </div>
                            {/* 進階配筋設定 */}
                            <details className="group" open={useAdvancedRebar}>
                                <summary
                                    className="text-sm font-medium text-gray-600 cursor-pointer flex items-center gap-2 hover:text-purple-700 transition-colors"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setUseAdvancedRebar(!useAdvancedRebar);
                                    }}
                                >
                                    <span className={`transform transition-transform ${useAdvancedRebar ? 'rotate-90' : ''}`}>▶</span>
                                    進階配筋設定
                                    <span className="text-xs text-gray-400 font-normal">
                                        {useAdvancedRebar ? '(精確計算模式)' : '(快速估算模式)'}
                                    </span>
                                </summary>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <SelectField
                                        label="鋼筋號數"
                                        value={wallRebarSize}
                                        onChange={setWallRebarSize}
                                        options={REBAR_SIZES.map(r => ({ value: r.value, label: r.label }))}
                                    />
                                    <SelectField
                                        label="配筋間距"
                                        value={wallRebarSpacing}
                                        onChange={(v) => setWallRebarSpacing(parseInt(v))}
                                        options={REBAR_SPACING_OPTIONS.map(s => ({ value: s.value, label: s.label }))}
                                    />
                                    <SelectField
                                        label="配筋層數"
                                        value={wallRebarLayer}
                                        onChange={setWallRebarLayer}
                                        options={REBAR_LAYER_OPTIONS.map(l => ({ value: l.value, label: l.label }))}
                                    />
                                    <SelectField
                                        label="混凝土規格"
                                        value={wallConcreteGrade}
                                        onChange={(v) => setWallConcreteGrade(parseInt(v))}
                                        options={CONCRETE_GRADES.map(c => ({ value: c.value, label: `${c.label} ${c.desc}` }))}
                                    />
                                </div>
                                {useAdvancedRebar && (
                                    <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded mt-2 border border-purple-200">
                                        <strong>精確計算:</strong> {wallRebarSize} @{wallRebarSpacing}mm {wallRebarLayer === 'double' ? '雙層' : '單層'}雙向配筋
                                    </div>
                                )}
                            </details>
                            {/* 三項結果顯示 */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <ResultDisplay
                                    label="模板面積"
                                    value={getWallFormwork()}
                                    unit="m²"
                                    wastageValue={applyWastage(getWallFormwork(), formworkWastage)}
                                    onAddRecord={(subType, label, value, unit, wastageValue) =>
                                        onAddRecord(subType, label, value, unit, wastageValue, formworkCost)}
                                    subType="構件-牆"
                                />
                                <ResultDisplay
                                    label="混凝土"
                                    value={getWallConcrete()}
                                    unit="m³"
                                    wastageValue={applyWastage(getWallConcrete(), concreteWastage)}
                                    onAddRecord={(subType, label, value, unit, wastageValue) =>
                                        onAddRecord(subType, label, value, unit, wastageValue, concreteCost)}
                                    subType="構件-牆"
                                />
                                <ResultDisplay
                                    label="鋼筋"
                                    value={getWallRebar()}
                                    unit="kg"
                                    wastageValue={applyWastage(getWallRebar(), rebarWastage)}
                                    onAddRecord={(subType, label, value, unit, wastageValue) =>
                                        onAddRecord(subType, label, value, unit, wastageValue, rebarCost)}
                                    subType="構件-牆"
                                />
                            </div>
                        </div>
                    )}

                    {/* 女兒牆計算 */}
                    {structureType === 'parapet' && (
                        <div className="bg-gradient-to-br from-orange-50 to-white rounded-lg p-4 space-y-4 border border-orange-100">
                            <div className="font-medium text-orange-700 flex items-center gap-2">
                                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                女兒牆材料計算
                                <span className="text-xs text-gray-500 font-normal">(模板 + 混凝土 + 鋼筋)</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <InputField label="周長/長度" value={parapetLength} onChange={setParapetLength} unit="m" placeholder="0" />
                                <InputField label="高度" value={parapetHeight} onChange={setParapetHeight} unit="m" placeholder="0" />
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-500 mb-1">厚度</label>
                                    <select
                                        value={parapetThickness}
                                        onChange={(e) => setParapetThickness(e.target.value === 'custom' ? 'custom' : parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white"
                                    >
                                        {PARAPET_THICKNESS_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <InputField label="數量" value={parapetCount} onChange={setParapetCount} unit="段" placeholder="1" />
                            </div>
                            {parapetThickness === 'custom' && (
                                <InputField label="自訂厚度" value={parapetCustomThickness} onChange={setParapetCustomThickness} unit="cm" placeholder="0" />
                            )}
                            <div className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-200">
                                <strong>公式:</strong> 長度 × 高度 × 2(雙面) × 數量 = {parapetLength || 0} × {parapetHeight || 0} × 2 × {parapetCount || 1} = <span className="text-orange-600 font-bold">{formatNumber(getParapetFormwork())} m²</span>
                            </div>
                            {/* 法規參照 */}
                            {showRegulations && (
                                <RegulationReference componentType="parapet" />
                            )}
                            <details className="group" open={useAdvancedRebar}>
                                <summary
                                    className="text-sm font-medium text-gray-600 cursor-pointer flex items-center gap-2 hover:text-orange-700 transition-colors"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setUseAdvancedRebar(!useAdvancedRebar);
                                    }}
                                >
                                    <span className={`transform transition-transform ${useAdvancedRebar ? 'rotate-90' : ''}`}>▶</span>
                                    進階配筋設定
                                    <span className="text-xs text-gray-400 font-normal">
                                        {useAdvancedRebar ? '(精確計算模式)' : '(快速估算模式)'}
                                    </span>
                                </summary>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <SelectField
                                        label="鋼筋號數"
                                        value={parapetRebarSize}
                                        onChange={setParapetRebarSize}
                                        options={REBAR_SIZES.map(r => ({ value: r.value, label: r.label }))}
                                    />
                                    <SelectField
                                        label="配筋間距"
                                        value={parapetRebarSpacing}
                                        onChange={(v) => setParapetRebarSpacing(parseInt(v))}
                                        options={REBAR_SPACING_OPTIONS.map(s => ({ value: s.value, label: s.label }))}
                                    />
                                    <SelectField
                                        label="配筋層數"
                                        value={parapetRebarLayer}
                                        onChange={setParapetRebarLayer}
                                        options={REBAR_LAYER_OPTIONS.map(l => ({ value: l.value, label: l.label }))}
                                    />
                                    <SelectField
                                        label="混凝土規格"
                                        value={parapetConcreteGrade}
                                        onChange={(v) => setParapetConcreteGrade(parseInt(v))}
                                        options={CONCRETE_GRADES.map(c => ({ value: c.value, label: `${c.label} ${c.desc}` }))}
                                    />
                                </div>
                                {useAdvancedRebar && (
                                    <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded mt-2 border border-orange-200">
                                        <strong>精確計算:</strong> {parapetRebarSize} @{parapetRebarSpacing}mm {parapetRebarLayer === 'double' ? '雙層' : '單層'}雙向配筋
                                    </div>
                                )}
                            </details>
                            {/* 三項結果顯示 */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <ResultDisplay
                                    label="模板面積"
                                    value={getParapetFormwork()}
                                    unit="m²"
                                    wastageValue={applyWastage(getParapetFormwork(), formworkWastage)}
                                    onAddRecord={(subType, label, value, unit, wastageValue) =>
                                        onAddRecord(subType, label, value, unit, wastageValue, formworkCost)}
                                    subType="構件-女兒牆"
                                />
                                <ResultDisplay
                                    label="混凝土"
                                    value={getParapetConcrete()}
                                    unit="m³"
                                    wastageValue={applyWastage(getParapetConcrete(), concreteWastage)}
                                    onAddRecord={(subType, label, value, unit, wastageValue) =>
                                        onAddRecord(subType, label, value, unit, wastageValue, concreteCost)}
                                    subType="構件-女兒牆"
                                />
                                <ResultDisplay
                                    label="鋼筋"
                                    value={getParapetRebar()}
                                    unit="kg"
                                    wastageValue={applyWastage(getParapetRebar(), rebarWastage)}
                                    onAddRecord={(subType, label, value, unit, wastageValue) =>
                                        onAddRecord(subType, label, value, unit, wastageValue, rebarCost)}
                                    subType="構件-女兒牆"
                                />
                            </div>
                        </div>
                    )}

                    {/* 地梁計算 */}
                    {structureType === 'groundbeam' && (
                        <div className="bg-gradient-to-br from-amber-50 to-white rounded-lg p-4 space-y-4 border border-amber-100">
                            <div className="font-medium text-amber-700 flex items-center gap-2">
                                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                地梁材料計算
                                <span className="text-xs text-gray-500 font-normal">(模板 + 混凝土 + 鋼筋)</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <SelectField
                                    label="地梁規格"
                                    value={beamPreset}
                                    onChange={setBeamPreset}
                                    options={GROUND_BEAM_PRESETS.map(p => ({ value: p.value, label: `${p.label} ${p.width ? `(${p.width}×${p.height}cm)` : ''}` }))}
                                />
                                <InputField label="長度" value={beamLength} onChange={setBeamLength} unit="m" placeholder="0" />
                                <InputField label="數量" value={beamCount} onChange={setBeamCount} unit="支" placeholder="1" />
                                <div className="flex items-end pb-2">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={beamIncludeBottom}
                                            onChange={(e) => setBeamIncludeBottom(e.target.checked)}
                                            className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                        />
                                        含底模
                                    </label>
                                </div>
                            </div>
                            {beamPreset === 'custom' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <InputField label="梁寬" value={beamCustomWidth} onChange={setBeamCustomWidth} unit="cm" placeholder="0" />
                                    <InputField label="梁高" value={beamCustomHeight} onChange={setBeamCustomHeight} unit="cm" placeholder="0" />
                                </div>
                            )}
                            {/* 地梁規格參考表 */}
                            <div className="bg-white p-3 rounded border border-gray-200">
                                <div className="text-xs font-medium text-gray-600 mb-2">常用規格參考:</div>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                                    {GROUND_BEAM_PRESETS.filter(p => p.value !== 'custom').map(p => (
                                        <div key={p.value} className={`p-2 rounded border text-center ${beamPreset === p.value ? 'bg-orange-100 border-orange-300' : 'bg-gray-50 border-gray-200'}`}>
                                            <div className="font-bold">{p.value}</div>
                                            <div className="text-gray-600">{p.width}×{p.height}cm</div>
                                            <div className="text-gray-400 text-[10px]">{p.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-200">
                                <strong>公式:</strong> (梁高×2{beamIncludeBottom ? '+梁寬' : ''}) × 長度 × 數量 = <span className="text-orange-600 font-bold">{formatNumber(getBeamFormwork())} m²</span>
                            </div>
                            {/* 法規參照與常用配筋 */}
                            {showRegulations && (
                                <div className="space-y-2">
                                    <RegulationReference componentType="groundbeam" />
                                    <PresetRebarInfo preset={beamPreset} type="groundbeam" />
                                </div>
                            )}
                            <details className="group" open={useAdvancedRebar}>
                                <summary
                                    className="text-sm font-medium text-gray-600 cursor-pointer flex items-center gap-2 hover:text-amber-700 transition-colors"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setUseAdvancedRebar(!useAdvancedRebar);
                                    }}
                                >
                                    <span className={`transform transition-transform ${useAdvancedRebar ? 'rotate-90' : ''}`}>▶</span>
                                    進階配筋設定
                                    <span className="text-xs text-gray-400 font-normal">
                                        {useAdvancedRebar ? '(精確計算模式)' : '(快速估算模式)'}
                                    </span>
                                </summary>
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                                    <div className="text-xs font-medium text-gray-500">上筋配置</div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        <SelectField
                                            label="上筋號數"
                                            value={groundbeamTopBar}
                                            onChange={setGroundbeamTopBar}
                                            options={REBAR_SIZES.map(r => ({ value: r.value, label: r.label }))}
                                        />
                                        <SelectField
                                            label="上筋根數"
                                            value={groundbeamTopBarCount}
                                            onChange={(v) => setGroundbeamTopBarCount(parseInt(v))}
                                            options={[2, 3, 4, 5, 6].map(n => ({ value: n, label: `${n}根` }))}
                                        />
                                        <SelectField
                                            label="混凝土規格"
                                            value={groundbeamConcreteGrade}
                                            onChange={(v) => setGroundbeamConcreteGrade(parseInt(v))}
                                            options={CONCRETE_GRADES.map(c => ({ value: c.value, label: `${c.label} ${c.desc}` }))}
                                        />
                                    </div>
                                    <div className="text-xs font-medium text-gray-500">下筋配置</div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <SelectField
                                            label="下筋號數"
                                            value={groundbeamBottomBar}
                                            onChange={setGroundbeamBottomBar}
                                            options={REBAR_SIZES.map(r => ({ value: r.value, label: r.label }))}
                                        />
                                        <SelectField
                                            label="下筋根數"
                                            value={groundbeamBottomBarCount}
                                            onChange={(v) => setGroundbeamBottomBarCount(parseInt(v))}
                                            options={[2, 3, 4, 5, 6, 8].map(n => ({ value: n, label: `${n}根` }))}
                                        />
                                    </div>
                                    <div className="text-xs font-medium text-gray-500">箍筋配置</div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <SelectField
                                            label="箍筋號數"
                                            value={groundbeamStirrup}
                                            onChange={setGroundbeamStirrup}
                                            options={REBAR_SIZES.slice(0, 4).map(r => ({ value: r.value, label: r.label }))}
                                        />
                                        <SelectField
                                            label="箍筋間距"
                                            value={groundbeamStirrupSpacing}
                                            onChange={(v) => setGroundbeamStirrupSpacing(parseInt(v))}
                                            options={REBAR_SPACING_OPTIONS.map(s => ({ value: s.value, label: s.label }))}
                                        />
                                    </div>
                                </div>
                                {useAdvancedRebar && (
                                    <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded mt-2 border border-amber-200">
                                        <strong>精確計算:</strong> 上筋{groundbeamTopBarCount}根{groundbeamTopBar} + 下筋{groundbeamBottomBarCount}根{groundbeamBottomBar} + {groundbeamStirrup}@{groundbeamStirrupSpacing}mm箍筋
                                    </div>
                                )}
                            </details>
                            {/* 三項結果顯示 */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <ResultDisplay
                                    label="模板面積"
                                    value={getBeamFormwork()}
                                    unit="m²"
                                    wastageValue={applyWastage(getBeamFormwork(), formworkWastage)}
                                    onAddRecord={(subType, label, value, unit, wastageValue) =>
                                        onAddRecord(subType, label, value, unit, wastageValue, formworkCost)}
                                    subType="構件-地梁"
                                />
                                <ResultDisplay
                                    label="混凝土"
                                    value={getBeamConcrete()}
                                    unit="m³"
                                    wastageValue={applyWastage(getBeamConcrete(), concreteWastage)}
                                    onAddRecord={(subType, label, value, unit, wastageValue) =>
                                        onAddRecord(subType, label, value, unit, wastageValue, concreteCost)}
                                    subType="構件-地梁"
                                />
                                <ResultDisplay
                                    label="鋼筋"
                                    value={getGroundbeamRebar()}
                                    unit="kg"
                                    wastageValue={applyWastage(getGroundbeamRebar(), rebarWastage)}
                                    onAddRecord={(subType, label, value, unit, wastageValue) =>
                                        onAddRecord(subType, label, value, unit, wastageValue, rebarCost)}
                                    subType="構件-地梁"
                                />
                            </div>
                        </div>
                    )}

                    {/* 基礎計算 */}
                    {structureType === 'foundation' && (
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 space-y-4 border border-gray-200">
                            <div className="font-medium text-gray-700 flex items-center gap-2">
                                <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                                基礎模板計算
                                <span className="text-xs text-gray-500 font-normal">(四周側面)</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                <InputField label="長度" value={floorLength} onChange={setFloorLength} unit="m" placeholder="0" />
                                <InputField label="寬度" value={floorWidth} onChange={setFloorWidth} unit="m" placeholder="0" />
                                <InputField label="深度" value={columnHeight} onChange={setColumnHeight} unit="m" placeholder="0" />
                                <InputField label="數量" value={floorCount} onChange={setFloorCount} unit="處" placeholder="1" />
                            </div>
                            <div className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-200">
                                <strong>公式:</strong> (長+寬)×2 × 深度 × 數量 = ({floorLength || 0}+{floorWidth || 0})×2 × {columnHeight || 0} × {floorCount || 1} =
                                <span className="text-orange-600 font-bold ml-1">
                                    {formatNumber(((parseFloat(floorLength) || 0) + (parseFloat(floorWidth) || 0)) * 2 * (parseFloat(columnHeight) || 0) * (parseFloat(floorCount) || 1))} m²
                                </span>
                            </div>
                            <ResultDisplay
                                label="基礎模板面積"
                                value={((parseFloat(floorLength) || 0) + (parseFloat(floorWidth) || 0)) * 2 * (parseFloat(columnHeight) || 0) * (parseFloat(floorCount) || 1)}
                                unit="m²"
                                wastageValue={applyWastage(((parseFloat(floorLength) || 0) + (parseFloat(floorWidth) || 0)) * 2 * (parseFloat(columnHeight) || 0) * (parseFloat(floorCount) || 1), formworkWastage)}
                                onAddRecord={(subType, label, value, unit, wastageValue) =>
                                    onAddRecord(subType, label, value, unit, wastageValue, formworkCost)}
                                subType="構件-基礎"
                            />
                            <div className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-200">
                                <strong>混凝土體積:</strong> 長 × 寬 × 深 × 數量 =
                                <span className="text-blue-600 font-bold ml-1">
                                    {formatNumber((parseFloat(floorLength) || 0) * (parseFloat(floorWidth) || 0) * (parseFloat(columnHeight) || 0) * (parseFloat(floorCount) || 1))} m³
                                </span>
                            </div>
                            {/* 法規參照 */}
                            {showRegulations && (
                                <RegulationReference componentType="foundation" />
                            )}
                            {/* Phase 3: 素混凝土墊層 */}
                            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-3">
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 text-sm font-medium text-amber-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={foundationLevelingEnabled}
                                            onChange={(e) => setFoundationLevelingEnabled(e.target.checked)}
                                            className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                                        />
                                        素混凝土墊層 (Plain Concrete Leveling)
                                    </label>
                                    {foundationLevelingEnabled && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">厚度:</span>
                                            <input
                                                type="number"
                                                value={foundationLevelingThickness}
                                                onChange={(e) => setFoundationLevelingThickness(parseFloat(e.target.value) || 10)}
                                                className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-center"
                                                min="5"
                                                max="20"
                                                step="1"
                                            />
                                            <span className="text-xs text-gray-500">cm</span>
                                        </div>
                                    )}
                                </div>
                                {foundationLevelingEnabled && (
                                    <div className="text-xs text-amber-700 bg-amber-100 p-2 rounded">
                                        <strong>墊層體積:</strong> 長 × 寬 × 厚度 × 數量 = {floorLength || 0} × {floorWidth || 0} × {foundationLevelingThickness / 100} × {floorCount || 1} =
                                        <span className="font-bold ml-1">
                                            {formatNumber((parseFloat(floorLength) || 0) * (parseFloat(floorWidth) || 0) * (foundationLevelingThickness / 100) * (parseFloat(floorCount) || 1))} m³
                                        </span>
                                        <span className="text-gray-500 ml-2">(140kg/cm²低強度混凝土)</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 損耗率控制 */}
                    <WastageControl
                        wastage={formworkWastage}
                        setWastage={setFormworkWastage}
                        defaultValue={DEFAULT_WASTAGE.formwork}
                        useCustom={formworkCustomWastage}
                        setUseCustom={setFormworkCustomWastage}
                    />
                </div>
            )}
        </div>
    );
};

// 2️⃣ 泥作工程計算器 (支援多列輸入)
const MasonryCalculator = ({ onAddRecord, vendors = [] }) => {
    const [calcType, setCalcType] = useState('mortar');

    // 打底砂漿 - 多列支援
    const [mortarRows, setMortarRows] = useState([
        { id: 1, name: '', area: '', thickness: '2.5' }
    ]);
    const [mortarWastage, setMortarWastage] = useState(DEFAULT_WASTAGE.cement);
    const [mortarCustomWastage, setMortarCustomWastage] = useState(false);
    const [mortarCost, setMortarCost] = useState(null);

    // 紅磚 - 多列支援
    const [brickRows, setBrickRows] = useState([
        { id: 1, name: '', area: '', wallType: '24' }
    ]);
    const [brickWastage, setBrickWastage] = useState(DEFAULT_WASTAGE.brick);
    const [brickCustomWastage, setBrickCustomWastage] = useState(false);
    const [brickCost, setBrickCost] = useState(null);

    // 快速估算
    const [quickArea, setQuickArea] = useState('');

    // 粉光配比計算器
    const [plasterRatio, setPlasterRatio] = useState('1:3');
    const [plasterArea, setPlasterArea] = useState('');
    const [plasterThickness, setPlasterThickness] = useState('1.5');
    const [plasterCost, setPlasterCost] = useState(null);

    // 計算每列砂漿結果
    const mortarRowResults = mortarRows.map(row => {
        const thicknessRatio = parseFloat(row.thickness) / 2.5;
        const area = parseFloat(row.area) || 0;
        const cement = area * 10.6 * thicknessRatio;
        const sand = area * 42.8 * thicknessRatio;
        return { ...row, cement, sand };
    });

    // 總計砂漿
    const totalCement = mortarRowResults.reduce((sum, row) => sum + row.cement, 0);
    const totalSand = mortarRowResults.reduce((sum, row) => sum + row.sand, 0);
    const currentMortarWastage = mortarCustomWastage ? mortarWastage : DEFAULT_WASTAGE.cement;
    const totalCementWithWastage = applyWastage(totalCement, currentMortarWastage);
    const totalSandWithWastage = applyWastage(totalSand, currentMortarWastage);

    // 砂漿列操作
    const addMortarRow = () => {
        const newId = Math.max(...mortarRows.map(r => r.id), 0) + 1;
        setMortarRows([...mortarRows, { id: newId, name: '', area: '', thickness: '2.5' }]);
    };
    const removeMortarRow = (id) => {
        if (mortarRows.length <= 1) return;
        setMortarRows(mortarRows.filter(row => row.id !== id));
    };
    const updateMortarRow = (id, field, value) => {
        setMortarRows(mortarRows.map(row => row.id === id ? { ...row, [field]: value } : row));
    };
    const clearMortarRows = () => {
        setMortarRows([{ id: 1, name: '', area: '', thickness: '2.5' }]);
    };

    // 計算每列紅磚結果
    const brickRowResults = brickRows.map(row => {
        const area = parseFloat(row.area) || 0;
        const count = area * (BRICK_PER_SQM[row.wallType]?.count || 128);
        return { ...row, count };
    });

    // 總計紅磚
    const totalBricks = brickRowResults.reduce((sum, row) => sum + row.count, 0);
    const currentBrickWastage = brickCustomWastage ? brickWastage : DEFAULT_WASTAGE.brick;
    const totalBricksWithWastage = applyWastage(totalBricks, currentBrickWastage);

    // 紅磚列操作
    const addBrickRow = () => {
        const newId = Math.max(...brickRows.map(r => r.id), 0) + 1;
        setBrickRows([...brickRows, { id: newId, name: '', area: '', wallType: '24' }]);
    };
    const removeBrickRow = (id) => {
        if (brickRows.length <= 1) return;
        setBrickRows(brickRows.filter(row => row.id !== id));
    };
    const updateBrickRow = (id, field, value) => {
        setBrickRows(brickRows.map(row => row.id === id ? { ...row, [field]: value } : row));
    };
    const clearBrickRows = () => {
        setBrickRows([{ id: 1, name: '', area: '', wallType: '24' }]);
    };

    // 快速估算
    const quickCement = (parseFloat(quickArea) || 0) * 0.4;
    const quickSand = (parseFloat(quickArea) || 0) * 0.05;

    // 粉光配比計算
    const selectedPlaster = PLASTER_RATIOS[plasterRatio];
    const plasterAreaNum = parseFloat(plasterArea) || 0;
    const plasterThicknessNum = parseFloat(plasterThickness) / 100; // cm to m
    const plasterVolume = plasterAreaNum * plasterThicknessNum; // m³
    const plasterCement = plasterVolume * selectedPlaster.cementPerM3;
    const plasterSand = plasterVolume * selectedPlaster.sandPerM3;

    return (
        <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
                {[
                    { id: 'mortar', label: '打底砂漿' },
                    { id: 'plaster', label: '粉光配比' },
                    { id: 'brick', label: '紅磚用量' },
                    { id: 'quick', label: '快速估算' },
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => setCalcType(item.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${calcType === item.id ? 'bg-orange-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* 粉光配比計算器 */}
            {calcType === 'plaster' && (
                <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Info size={16} />
                        <div>
                            <p>1:2 粉光: 水泥 650kg/m³ + 砂 800kg/m³ (細緻)</p>
                            <p>1:3 打底: 水泥 450kg/m³ + 砂 950kg/m³ (一般)</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <SelectField
                            label="配比選擇"
                            value={plasterRatio}
                            onChange={setPlasterRatio}
                            options={Object.entries(PLASTER_RATIOS).map(([k, v]) => ({ value: k, label: v.label }))}
                        />
                        <InputField label="施作面積" value={plasterArea} onChange={setPlasterArea} unit="m²" placeholder="0" />
                        <InputField label="塗抹厚度" value={plasterThickness} onChange={setPlasterThickness} unit="cm" placeholder="1.5" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <ResultDisplay
                            label="水泥用量"
                            value={plasterCement}
                            unit="kg"
                            showWastage={false}
                            onAddRecord={(subType, label, value, unit, wastageValue) =>
                                onAddRecord(subType, label, value, unit, wastageValue, plasterCost)}
                            subType={`粉光 ${plasterRatio}`}
                        />
                        <ResultDisplay
                            label="砂用量"
                            value={plasterSand}
                            unit="kg"
                            showWastage={false}
                            onAddRecord={(subType, label, value, unit, wastageValue) =>
                                onAddRecord(subType, label, value, unit, wastageValue, plasterCost)}
                            subType={`粉光 ${plasterRatio}`}
                        />
                    </div>

                    <CostInput
                        label="水泥/砂"
                        quantity={plasterCement + plasterSand} // 簡易加總，實際可能需分開但此處簡化
                        unit="kg"
                        vendors={vendors.filter(v => v.category === '建材供應' || v.tradeType?.includes('水泥'))}
                        onChange={setPlasterCost}
                        placeholder={{ spec: '例：水泥+砂' }}
                    />
                </div>
            )}

            {/* 打底砂漿 - 多列模式 */}
            {calcType === 'mortar' && (
                <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Info size={16} />
                            公式: 1:3 砂漿, 基準: 2.5cm厚 → 水泥 10.6kg/m², 砂 42.8kg/m²
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{mortarRows.length} 列</span>
                            <button
                                onClick={() => mortarRows.length > 1 && removeMortarRow(mortarRows[mortarRows.length - 1].id)}
                                disabled={mortarRows.length <= 1}
                                className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <span className="text-lg font-bold leading-none">−</span>
                            </button>
                            <button
                                onClick={addMortarRow}
                                className="w-7 h-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                            {mortarRows.length > 1 && (
                                <button onClick={clearMortarRows} className="text-xs text-gray-500 hover:text-gray-700 ml-1">清空</button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {mortarRows.map((row, index) => (
                            <div key={row.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <div className="grid grid-cols-12 gap-2 items-end">
                                    <div className="col-span-12 sm:col-span-3">
                                        <label className="block text-xs text-gray-500 mb-1">名稱</label>
                                        <input
                                            type="text"
                                            value={row.name}
                                            onChange={(e) => updateMortarRow(row.id, 'name', e.target.value)}
                                            placeholder={`區域 ${index + 1}`}
                                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="col-span-5 sm:col-span-3">
                                        <label className="block text-xs text-gray-500 mb-1">施作面積</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={row.area}
                                                onChange={(e) => updateMortarRow(row.id, 'area', e.target.value)}
                                                placeholder="0"
                                                min="0"
                                                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-8"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">m²</span>
                                        </div>
                                    </div>
                                    <div className="col-span-5 sm:col-span-2">
                                        <label className="block text-xs text-gray-500 mb-1">厚度</label>
                                        <select
                                            value={row.thickness}
                                            onChange={(e) => updateMortarRow(row.id, 'thickness', e.target.value)}
                                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500"
                                        >
                                            <option value="1.5">1.5cm</option>
                                            <option value="2.0">2.0cm</option>
                                            <option value="2.5">2.5cm</option>
                                            <option value="3.0">3.0cm</option>
                                            <option value="4.0">4.0cm</option>
                                        </select>
                                    </div>
                                    <div className="col-span-10 sm:col-span-3 flex items-center gap-2">
                                        <div className="flex-1 text-xs">
                                            <span className="text-gray-500">水泥:</span> <span className="font-bold text-orange-600">{formatNumber(mortarRowResults[index].cement, 1)}kg</span>
                                            <span className="text-gray-500 ml-2">砂:</span> <span className="font-bold text-orange-600">{formatNumber(mortarRowResults[index].sand, 1)}kg</span>
                                        </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 flex justify-end">
                                        <button
                                            onClick={() => removeMortarRow(row.id)}
                                            disabled={mortarRows.length <= 1}
                                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={addMortarRow}
                        className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <Plus size={16} />
                        +增加新欄位
                    </button>

                    <WastageControl
                        wastage={mortarWastage}
                        setWastage={setMortarWastage}
                        defaultValue={DEFAULT_WASTAGE.cement}
                        useCustom={mortarCustomWastage}
                        setUseCustom={setMortarCustomWastage}
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <ResultDisplay
                            label={`水泥用量 (共 ${mortarRowResults.filter(r => r.cement > 0).length} 項)`}
                            value={totalCement}
                            unit="kg"
                            wastageValue={totalCementWithWastage}
                            onAddRecord={(subType, label, value, unit, wastageValue) =>
                                onAddRecord(subType, label, value, unit, wastageValue, mortarCost)}
                            subType="打底砂漿"
                        />
                        <ResultDisplay
                            label={`砂用量 (共 ${mortarRowResults.filter(r => r.sand > 0).length} 項)`}
                            value={totalSand}
                            unit="kg"
                            wastageValue={totalSandWithWastage}
                            onAddRecord={(subType, label, value, unit, wastageValue) =>
                                onAddRecord(subType, label, value, unit, wastageValue, mortarCost)}
                            subType="打底砂漿"
                        />
                    </div>

                    <CostInput
                        label="水泥/砂"
                        quantity={totalCementWithWastage + totalSandWithWastage}
                        unit="kg"
                        vendors={vendors.filter(v => v.category === '建材供應' || v.tradeType?.includes('水泥'))}
                        onChange={setMortarCost}
                        placeholder={{ spec: '例：水泥+砂' }}
                    />

                    {mortarRowResults.filter(r => r.cement > 0).length > 1 && (
                        <div className="bg-gray-50 rounded-lg p-3 text-xs">
                            <div className="font-medium text-gray-700 mb-2">各項明細:</div>
                            <div className="space-y-1">
                                {mortarRowResults.filter(r => r.cement > 0).map((row, idx) => (
                                    <div key={row.id} className="flex justify-between text-gray-600">
                                        <span>{row.name || `區域 ${idx + 1}`} ({row.area}m² × {row.thickness}cm)</span>
                                        <span className="font-medium">水泥 {formatNumber(row.cement, 1)}kg, 砂 {formatNumber(row.sand, 1)}kg</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 紅磚用量 - 多列模式 */}
            {calcType === 'brick' && (
                <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Info size={16} />
                            12牆=64塊/m², 18牆=96塊/m², 24牆=128塊/m², 37牆=192塊/m²
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{brickRows.length} 列</span>
                            <button
                                onClick={() => brickRows.length > 1 && removeBrickRow(brickRows[brickRows.length - 1].id)}
                                disabled={brickRows.length <= 1}
                                className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <span className="text-lg font-bold leading-none">−</span>
                            </button>
                            <button
                                onClick={addBrickRow}
                                className="w-7 h-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                            {brickRows.length > 1 && (
                                <button onClick={clearBrickRows} className="text-xs text-gray-500 hover:text-gray-700 ml-1">清空</button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {brickRows.map((row, index) => (
                            <div key={row.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <div className="grid grid-cols-12 gap-2 items-end">
                                    <div className="col-span-12 sm:col-span-3">
                                        <label className="block text-xs text-gray-500 mb-1">名稱</label>
                                        <input
                                            type="text"
                                            value={row.name}
                                            onChange={(e) => updateBrickRow(row.id, 'name', e.target.value)}
                                            placeholder={`牆面 ${index + 1}`}
                                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="col-span-5 sm:col-span-3">
                                        <label className="block text-xs text-gray-500 mb-1">牆面面積</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={row.area}
                                                onChange={(e) => updateBrickRow(row.id, 'area', e.target.value)}
                                                placeholder="0"
                                                min="0"
                                                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-8"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">m²</span>
                                        </div>
                                    </div>
                                    <div className="col-span-5 sm:col-span-2">
                                        <label className="block text-xs text-gray-500 mb-1">牆厚</label>
                                        <select
                                            value={row.wallType}
                                            onChange={(e) => updateBrickRow(row.id, 'wallType', e.target.value)}
                                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500"
                                        >
                                            {Object.entries(BRICK_PER_SQM).map(([k, v]) => (
                                                <option key={k} value={k}>{v.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-10 sm:col-span-3 flex items-center">
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-500 mb-1">數量</label>
                                            <div className="text-sm font-bold text-orange-600">
                                                {brickRowResults[index].count > 0 ? `${formatNumber(brickRowResults[index].count, 0)} 塊` : '--'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 flex justify-end">
                                        <button
                                            onClick={() => removeBrickRow(row.id)}
                                            disabled={brickRows.length <= 1}
                                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={addBrickRow}
                        className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <Plus size={16} />
                        +增加新欄位
                    </button>

                    <WastageControl
                        wastage={brickWastage}
                        setWastage={setBrickWastage}
                        defaultValue={DEFAULT_WASTAGE.brick}
                        useCustom={brickCustomWastage}
                        setUseCustom={setBrickCustomWastage}
                    />

                    <ResultDisplay
                        label={`紅磚數量 (共 ${brickRowResults.filter(r => r.count > 0).length} 項)`}
                        value={totalBricks}
                        unit="塊"
                        wastageValue={totalBricksWithWastage}
                        onAddRecord={(subType, label, value, unit, wastageValue) =>
                            onAddRecord(subType, label, value, unit, wastageValue, brickCost)}
                        subType="紅磚"
                    />

                    <CostInput
                        label="紅磚"
                        quantity={totalBricksWithWastage}
                        unit="塊"
                        vendors={vendors.filter(v => v.category === '建材供應' || v.tradeType?.includes('磚'))}
                        onChange={setBrickCost}
                        placeholder={{ spec: '例：2寸紅磚' }}
                    />

                    {brickRowResults.filter(r => r.count > 0).length > 1 && (
                        <div className="bg-gray-50 rounded-lg p-3 text-xs">
                            <div className="font-medium text-gray-700 mb-2">各項明細:</div>
                            <div className="space-y-1">
                                {brickRowResults.filter(r => r.count > 0).map((row, idx) => (
                                    <div key={row.id} className="flex justify-between text-gray-600">
                                        <span>{row.name || `牆面 ${idx + 1}`} ({row.area}m² × {BRICK_PER_SQM[row.wallType]?.label})</span>
                                        <span className="font-medium">{formatNumber(row.count, 0)} 塊</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {calcType === 'quick' && (
                <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Info size={16} />
                        裝修口訣: 水泥=面積×0.4, 砂=面積×0.05
                    </div>
                    <InputField label="建築面積" value={quickArea} onChange={setQuickArea} unit="m²" placeholder="0" />
                    <div className="grid grid-cols-2 gap-3">
                        <ResultDisplay label="水泥概估" value={quickCement} unit="包" showWastage={false} onAddRecord={onAddRecord} subType="快速估算" />
                        <ResultDisplay label="砂概估" value={quickSand} unit="m³" showWastage={false} onAddRecord={onAddRecord} subType="快速估算" />
                    </div>
                </div>
            )}
        </div>
    );
};


// 3️⃣ 磁磚工程計算器 (支援多列輸入)
const TileCalculator = ({ onAddRecord, vendors = [] }) => {
    const [calcType, setCalcType] = useState('tiles');

    // 磁磚片數 - 多列支援
    const [tileRows, setTileRows] = useState([
        { id: 1, name: '', area: '', unit: 'ping', sizeIdx: 3, method: 'none' }
    ]);
    const [customTileL, setCustomTileL] = useState('60');
    const [customTileW, setCustomTileW] = useState('60');
    const [tileWastage, setTileWastage] = useState(DEFAULT_WASTAGE.tile);
    const [tileCustomWastage, setTileCustomWastage] = useState(false);
    const [tileCost, setTileCost] = useState(null);

    // 填縫劑 - 多列支援
    const [groutRows, setGroutRows] = useState([
        { id: 1, name: '', area: '' }
    ]);
    const [groutTileL, setGroutTileL] = useState('60');
    const [groutTileW, setGroutTileW] = useState('60');
    const [groutWidth, setGroutWidth] = useState('3');
    const [groutDepth, setGroutDepth] = useState('5');
    const [groutWastage, setGroutWastage] = useState(DEFAULT_WASTAGE.grout);
    const [groutCustomWastage, setGroutCustomWastage] = useState(false);
    const [groutCost, setGroutCost] = useState(null);

    // 黏著劑 - 多列支援
    const [adhesiveRows, setAdhesiveRows] = useState([
        { id: 1, name: '', area: '', trowel: '4' }
    ]);
    const [adhesiveWastage, setAdhesiveWastage] = useState(DEFAULT_WASTAGE.adhesive);
    const [adhesiveCustomWastage, setAdhesiveCustomWastage] = useState(false);
    const [adhesiveCost, setAdhesiveCost] = useState(null);

    // 計算每列磁磚結果
    const tileRowResults = tileRows.map(row => {
        const selectedTile = TILE_SIZES[row.sizeIdx] || TILE_SIZES[3];
        const tileL = selectedTile.l || parseFloat(customTileL) || 60;
        const tileW = selectedTile.w || parseFloat(customTileW) || 60;
        const areaSqm = row.unit === 'ping' ? (parseFloat(row.area) || 0) * 3.30579 : (parseFloat(row.area) || 0);
        const tilesPerSqm = 10000 / (tileL * tileW);
        const count = areaSqm * tilesPerSqm;
        return { ...row, count, tileL, tileW };
    });

    // 總計磁磚
    const totalTiles = tileRowResults.reduce((sum, row) => sum + row.count, 0);
    const currentTileWastage = tileCustomWastage ? tileWastage : DEFAULT_WASTAGE.tile;
    const totalTilesWithWastage = applyWastage(totalTiles, currentTileWastage);
    const selectedTileForDisplay = TILE_SIZES[tileRows[0]?.sizeIdx || 3];
    const displayTileL = selectedTileForDisplay.l || parseFloat(customTileL) || 60;
    const displayTileW = selectedTileForDisplay.w || parseFloat(customTileW) || 60;
    const tileCountPerPing = 32400 / (displayTileL * displayTileW);
    const [tileLaborCost, setTileLaborCost] = useState(null);

    // 計算總坪數 (用於工資計算)
    const totalAreaPing = tileRowResults.reduce((sum, row) => {
        const area = parseFloat(row.area) || 0;
        return sum + (row.unit === 'ping' ? area : area * 0.3025);
    }, 0);

    // 磁磚列操作
    const addTileRow = () => {
        const newId = Math.max(...tileRows.map(r => r.id), 0) + 1;
        setTileRows([...tileRows, { id: newId, name: '', area: '', unit: 'ping', sizeIdx: 3, method: 'none' }]);
    };
    const removeTileRow = (id) => {
        if (tileRows.length <= 1) return;
        setTileRows(tileRows.filter(row => row.id !== id));
    };
    const updateTileRow = (id, field, value) => {
        setTileRows(tileRows.map(row => row.id === id ? { ...row, [field]: value } : row));
    };
    const clearTileRows = () => {
        setTileRows([{ id: 1, name: '', area: '', unit: 'ping', sizeIdx: 3 }]);
    };

    // 計算填縫劑結果
    const L = parseFloat(groutTileL) * 10 || 600;
    const W = parseFloat(groutTileW) * 10 || 600;
    const D = parseFloat(groutWidth) || 3;
    const C = parseFloat(groutDepth) || 5;
    const groutPerSqm = ((L + W) / (L * W)) * D * C * 1.7;

    const groutRowResults = groutRows.map(row => {
        const area = parseFloat(row.area) || 0;
        const amount = area * groutPerSqm;
        return { ...row, amount };
    });

    const totalGrout = groutRowResults.reduce((sum, row) => sum + row.amount, 0);
    const currentGroutWastage = groutCustomWastage ? groutWastage : DEFAULT_WASTAGE.grout;
    const totalGroutWithWastage = applyWastage(totalGrout, currentGroutWastage);

    // 填縫劑列操作
    const addGroutRow = () => {
        const newId = Math.max(...groutRows.map(r => r.id), 0) + 1;
        setGroutRows([...groutRows, { id: newId, name: '', area: '' }]);
    };
    const removeGroutRow = (id) => {
        if (groutRows.length <= 1) return;
        setGroutRows(groutRows.filter(row => row.id !== id));
    };
    const updateGroutRow = (id, field, value) => {
        setGroutRows(groutRows.map(row => row.id === id ? { ...row, [field]: value } : row));
    };
    const clearGroutRows = () => {
        setGroutRows([{ id: 1, name: '', area: '' }]);
    };

    // 計算黏著劑結果
    const adhesiveRowResults = adhesiveRows.map(row => {
        const perSqm = parseFloat(row.trowel) === 4 ? 2.5 : parseFloat(row.trowel) === 6 ? 6.25 : 4;
        const area = parseFloat(row.area) || 0;
        const amount = area * perSqm;
        return { ...row, amount };
    });

    const totalAdhesive = adhesiveRowResults.reduce((sum, row) => sum + row.amount, 0);
    const currentAdhesiveWastage = adhesiveCustomWastage ? adhesiveWastage : DEFAULT_WASTAGE.adhesive;
    const totalAdhesiveWithWastage = applyWastage(totalAdhesive, currentAdhesiveWastage);

    // 黏著劑列操作
    const addAdhesiveRow = () => {
        const newId = Math.max(...adhesiveRows.map(r => r.id), 0) + 1;
        setAdhesiveRows([...adhesiveRows, { id: newId, name: '', area: '', trowel: '4' }]);
    };
    const removeAdhesiveRow = (id) => {
        if (adhesiveRows.length <= 1) return;
        setAdhesiveRows(adhesiveRows.filter(row => row.id !== id));
    };
    const updateAdhesiveRow = (id, field, value) => {
        setAdhesiveRows(adhesiveRows.map(row => row.id === id ? { ...row, [field]: value } : row));
    };
    const clearAdhesiveRows = () => {
        setAdhesiveRows([{ id: 1, name: '', area: '', trowel: '4' }]);
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
                {[
                    { id: 'tiles', label: '磁磚片數' },
                    { id: 'grout', label: '填縫劑' },
                    { id: 'adhesive', label: '黏著劑' },
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => setCalcType(item.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${calcType === item.id ? 'bg-orange-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* 磁磚片數 - 多列模式 */}
            {calcType === 'tiles' && (
                <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Info size={16} />
                            公式: 每坪片數 = 32400 ÷ (長cm × 寬cm)
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{tileRows.length} 列</span>
                            <button
                                onClick={() => tileRows.length > 1 && removeTileRow(tileRows[tileRows.length - 1].id)}
                                disabled={tileRows.length <= 1}
                                className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <span className="text-lg font-bold leading-none">−</span>
                            </button>
                            <button onClick={addTileRow} className="w-7 h-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors">
                                <Plus size={16} />
                            </button>
                            {tileRows.length > 1 && <button onClick={clearTileRows} className="text-xs text-gray-500 hover:text-gray-700 ml-1">清空</button>}
                        </div>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {tileRows.map((row, index) => (
                            <div key={row.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <div className="grid grid-cols-12 gap-2 items-end">
                                    <div className="col-span-6 sm:col-span-2">
                                        <label className="block text-xs text-gray-500 mb-1">名稱</label>
                                        <input type="text" value={row.name} onChange={(e) => updateTileRow(row.id, 'name', e.target.value)}
                                            placeholder={`區域 ${index + 1}`} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                                    </div>
                                    <div className="col-span-6 sm:col-span-2">
                                        <label className="block text-xs text-gray-500 mb-1">面積</label>
                                        <div className="relative">
                                            <input type="number" value={row.area} onChange={(e) => updateTileRow(row.id, 'area', e.target.value)}
                                                placeholder="0" min="0" className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-8" />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">{row.unit === 'ping' ? '坪' : 'm²'}</span>
                                        </div>
                                    </div>
                                    <div className="col-span-3 sm:col-span-1">
                                        <label className="block text-xs text-gray-500 mb-1">單位</label>
                                        <select value={row.unit} onChange={(e) => updateTileRow(row.id, 'unit', e.target.value)}
                                            className="w-full px-1.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-orange-500">
                                            <option value="ping">坪</option>
                                            <option value="sqm">m²</option>
                                        </select>
                                    </div>
                                    <div className="col-span-5 sm:col-span-2">
                                        <label className="block text-xs text-gray-500 mb-1">磁磚尺寸</label>
                                        <select value={row.sizeIdx} onChange={(e) => updateTileRow(row.id, 'sizeIdx', parseInt(e.target.value))}
                                            className="w-full px-1.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-orange-500">
                                            {TILE_SIZES.map((t, i) => <option key={i} value={i}>{t.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-4 sm:col-span-2">
                                        <label className="block text-xs text-gray-500 mb-1">施工方法</label>
                                        <select value={row.method} onChange={(e) => updateTileRow(row.id, 'method', e.target.value)}
                                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500">
                                            {TILE_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-9 sm:col-span-2 flex items-center">
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-500 mb-1">片數</label>
                                            <div className="text-sm font-bold text-orange-600">
                                                {tileRowResults[index].count > 0 ? `${formatNumber(tileRowResults[index].count, 0)} 片` : '--'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 flex justify-end">
                                        <button onClick={() => removeTileRow(row.id)} disabled={tileRows.length <= 1}
                                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button onClick={addTileRow} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors flex items-center justify-center gap-2 text-sm">
                        <Plus size={16} />+增加新欄位
                    </button>

                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        60×60cm 磁磚每坪約 <strong>{formatNumber(tileCountPerPing, 1)}</strong> 片
                    </div>

                    <WastageControl wastage={tileWastage} setWastage={setTileWastage} defaultValue={DEFAULT_WASTAGE.tile} useCustom={tileCustomWastage} setUseCustom={setTileCustomWastage} />

                    <ResultDisplay
                        label={`磁磚片數 (共 ${tileRowResults.filter(r => r.count > 0).length} 項)`}
                        value={totalTiles}
                        unit="片"
                        wastageValue={totalTilesWithWastage}
                        onAddRecord={(subType, label, value, unit, wastageValue) =>
                            onAddRecord(subType, label, value, unit, wastageValue, tileCost)}
                        subType="磁磚"
                    />

                    <CostInput
                        label="磁磚"
                        quantity={totalTilesWithWastage}
                        unit="片"
                        vendors={vendors.filter(v => v.category === '建材供應' || v.tradeType?.includes('磁磚'))}
                        onChange={setTileCost}
                        placeholder={{ spec: '例：60x60cm 拋光石英磚' }}
                    />

                    {/* 磁磚鋪貼工資 */}
                    <div className="bg-orange-50 rounded-lg p-3 space-y-3 border border-orange-100 mt-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-orange-800">
                            <span className="bg-orange-200 text-orange-700 p-1 rounded">
                                <Layers size={14} />
                            </span>
                            磁磚鋪貼工資
                        </div>

                        <ResultDisplay
                            label="鋪貼工資合計"
                            value={tileLaborCost?.subtotal || 0}
                            unit="元"
                            showWastage={false}
                            onAddRecord={(subType, label, value, unit) =>
                                onAddRecord(subType, label, value, unit, value, tileLaborCost)}
                            subType="鋪貼工資"
                        />

                        <CostInput
                            label="施工"
                            quantity={totalAreaPing}
                            unit="坪"
                            vendors={vendors.filter(v => v.category === '工程工班' && (v.tradeType?.includes('泥作') || v.tradeType?.includes('磁磚')))}
                            onChange={setTileLaborCost}
                            placeholder={{ spec: '例：60x60cm 貼工' }}
                        />
                    </div>

                    {tileRowResults.filter(r => r.count > 0).length > 1 && (
                        <div className="bg-gray-50 rounded-lg p-3 text-xs">
                            <div className="font-medium text-gray-700 mb-2">各項明細:</div>
                            <div className="space-y-1">
                                {tileRowResults.filter(r => r.count > 0).map((row, idx) => (
                                    <div key={row.id} className="flex justify-between text-gray-600">
                                        <span>{row.name || `區域 ${idx + 1}`} ({row.area}{row.unit === 'ping' ? '坪' : 'm²'})</span>
                                        <span className="font-medium">{formatNumber(row.count, 0)} 片</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 填縫劑 - 多列模式 */}
            {calcType === 'grout' && (
                <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Info size={16} />
                            公式: U = (L+W)/(L×W) × 縫寬 × 縫深 × 1.7
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{groutRows.length} 列</span>
                            <button onClick={() => groutRows.length > 1 && removeGroutRow(groutRows[groutRows.length - 1].id)} disabled={groutRows.length <= 1}
                                className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                <span className="text-lg font-bold leading-none">−</span>
                            </button>
                            <button onClick={addGroutRow} className="w-7 h-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors">
                                <Plus size={16} />
                            </button>
                            {groutRows.length > 1 && <button onClick={clearGroutRows} className="text-xs text-gray-500 hover:text-gray-700 ml-1">清空</button>}
                        </div>
                    </div>

                    {/* 共用設定 */}
                    <div className="grid grid-cols-4 gap-2 bg-blue-50 p-3 rounded-lg">
                        <InputField label="磚長" value={groutTileL} onChange={setGroutTileL} unit="cm" />
                        <InputField label="磚寬" value={groutTileW} onChange={setGroutTileW} unit="cm" />
                        <InputField label="縫寬" value={groutWidth} onChange={setGroutWidth} unit="mm" />
                        <InputField label="縫深" value={groutDepth} onChange={setGroutDepth} unit="mm" />
                    </div>

                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        此規格每平方公尺約 <strong>{formatNumber(groutPerSqm, 2)}</strong> kg
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {groutRows.map((row, index) => (
                            <div key={row.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <div className="grid grid-cols-12 gap-2 items-end">
                                    <div className="col-span-12 sm:col-span-4">
                                        <label className="block text-xs text-gray-500 mb-1">名稱</label>
                                        <input type="text" value={row.name} onChange={(e) => updateGroutRow(row.id, 'name', e.target.value)}
                                            placeholder={`區域 ${index + 1}`} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                                    </div>
                                    <div className="col-span-5 sm:col-span-3">
                                        <label className="block text-xs text-gray-500 mb-1">施作面積</label>
                                        <div className="relative">
                                            <input type="number" value={row.area} onChange={(e) => updateGroutRow(row.id, 'area', e.target.value)}
                                                placeholder="0" min="0" className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-8" />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">m²</span>
                                        </div>
                                    </div>
                                    <div className="col-span-5 sm:col-span-4 flex items-center">
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-500 mb-1">填縫劑用量</label>
                                            <div className="text-sm font-bold text-orange-600">
                                                {groutRowResults[index].amount > 0 ? `${formatNumber(groutRowResults[index].amount, 2)} kg` : '--'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 flex justify-end">
                                        <button onClick={() => removeGroutRow(row.id)} disabled={groutRows.length <= 1}
                                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button onClick={addGroutRow} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors flex items-center justify-center gap-2 text-sm">
                        <Plus size={16} />+增加新欄位
                    </button>

                    <WastageControl wastage={groutWastage} setWastage={setGroutWastage} defaultValue={DEFAULT_WASTAGE.grout} useCustom={groutCustomWastage} setUseCustom={setGroutCustomWastage} />

                    <ResultDisplay
                        label={`填縫劑用量 (共 ${groutRowResults.filter(r => r.amount > 0).length} 項)`}
                        value={totalGrout}
                        unit="kg"
                        wastageValue={totalGroutWithWastage}
                        onAddRecord={(subType, label, value, unit, wastageValue) =>
                            onAddRecord(subType, label, value, unit, wastageValue, groutCost)}
                        subType="填縫劑"
                    />

                    <CostInput
                        label="填縫劑"
                        quantity={totalGroutWithWastage}
                        unit="kg"
                        vendors={vendors.filter(v => v.category === '建材供應' || v.tradeType?.includes('磁磚'))}
                        onChange={setGroutCost}
                        placeholder={{ spec: '例：本色填縫劑' }}
                    />
                    {groutRowResults.filter(r => r.amount > 0).length > 1 && (
                        <div className="bg-gray-50 rounded-lg p-3 text-xs">
                            <div className="font-medium text-gray-700 mb-2">各項明細:</div>
                            <div className="space-y-1">
                                {groutRowResults.filter(r => r.amount > 0).map((row, idx) => (
                                    <div key={row.id} className="flex justify-between text-gray-600">
                                        <span>{row.name || `區域 ${idx + 1}`} ({row.area}m²)</span>
                                        <span className="font-medium">{formatNumber(row.amount, 2)} kg</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 黏著劑 - 多列模式 */}
            {calcType === 'adhesive' && (
                <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Info size={16} />
                            4mm鏝刀 ≈ 2.5kg/m², 6mm鏝刀 ≈ 6.25kg/m²
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{adhesiveRows.length} 列</span>
                            <button onClick={() => adhesiveRows.length > 1 && removeAdhesiveRow(adhesiveRows[adhesiveRows.length - 1].id)} disabled={adhesiveRows.length <= 1}
                                className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                <span className="text-lg font-bold leading-none">−</span>
                            </button>
                            <button onClick={addAdhesiveRow} className="w-7 h-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors">
                                <Plus size={16} />
                            </button>
                            {adhesiveRows.length > 1 && <button onClick={clearAdhesiveRows} className="text-xs text-gray-500 hover:text-gray-700 ml-1">清空</button>}
                        </div>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {adhesiveRows.map((row, index) => (
                            <div key={row.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <div className="grid grid-cols-12 gap-2 items-end">
                                    <div className="col-span-12 sm:col-span-3">
                                        <label className="block text-xs text-gray-500 mb-1">名稱</label>
                                        <input type="text" value={row.name} onChange={(e) => updateAdhesiveRow(row.id, 'name', e.target.value)}
                                            placeholder={`區域 ${index + 1}`} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                                    </div>
                                    <div className="col-span-5 sm:col-span-3">
                                        <label className="block text-xs text-gray-500 mb-1">施作面積</label>
                                        <div className="relative">
                                            <input type="number" value={row.area} onChange={(e) => updateAdhesiveRow(row.id, 'area', e.target.value)}
                                                placeholder="0" min="0" className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-8" />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">m²</span>
                                        </div>
                                    </div>
                                    <div className="col-span-5 sm:col-span-2">
                                        <label className="block text-xs text-gray-500 mb-1">鏝刀規格</label>
                                        <select value={row.trowel} onChange={(e) => updateAdhesiveRow(row.id, 'trowel', e.target.value)}
                                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500">
                                            <option value="4">4mm</option>
                                            <option value="6">6mm</option>
                                        </select>
                                    </div>
                                    <div className="col-span-10 sm:col-span-3 flex items-center">
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-500 mb-1">黏著劑用量</label>
                                            <div className="text-sm font-bold text-orange-600">
                                                {adhesiveRowResults[index].amount > 0 ? `${formatNumber(adhesiveRowResults[index].amount, 2)} kg` : '--'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 flex justify-end">
                                        <button onClick={() => removeAdhesiveRow(row.id)} disabled={adhesiveRows.length <= 1}
                                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button onClick={addAdhesiveRow} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors flex items-center justify-center gap-2 text-sm">
                        <Plus size={16} />+增加新欄位
                    </button>

                    <WastageControl wastage={adhesiveWastage} setWastage={setAdhesiveWastage} defaultValue={DEFAULT_WASTAGE.adhesive} useCustom={adhesiveCustomWastage} setUseCustom={setAdhesiveCustomWastage} />

                    <ResultDisplay
                        label={`黏著劑用量 (共 ${adhesiveRowResults.filter(r => r.amount > 0).length} 項)`}
                        value={totalAdhesive}
                        unit="kg"
                        wastageValue={totalAdhesiveWithWastage}
                        onAddRecord={(subType, label, value, unit, wastageValue) =>
                            onAddRecord(subType, label, value, unit, wastageValue, adhesiveCost)}
                        subType="黏著劑"
                    />

                    <CostInput
                        label="黏著劑"
                        quantity={totalAdhesiveWithWastage}
                        unit="kg"
                        vendors={vendors.filter(v => v.category === '建材供應' || v.tradeType?.includes('磁磚'))}
                        onChange={setAdhesiveCost}
                        placeholder={{ spec: '例：高分子益膠泥' }}
                    />

                    {adhesiveRowResults.filter(r => r.amount > 0).length > 1 && (
                        <div className="bg-gray-50 rounded-lg p-3 text-xs">
                            <div className="font-medium text-gray-700 mb-2">各項明細:</div>
                            <div className="space-y-1">
                                {adhesiveRowResults.filter(r => r.amount > 0).map((row, idx) => (
                                    <div key={row.id} className="flex justify-between text-gray-600">
                                        <span>{row.name || `區域 ${idx + 1}`} ({row.area}m² × {row.trowel}mm鏝刀)</span>
                                        <span className="font-medium">{formatNumber(row.amount, 2)} kg</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


// 4️⃣ 裝修工程計算器 (支援多列輸入)
const FinishCalculator = ({ onAddRecord, vendors = [] }) => {
    const [calcType, setCalcType] = useState('paint');

    // 油漆計算 - 多列支援
    const [paintRows, setPaintRows] = useState([
        { id: 1, name: '', area: '', unit: 'sqm' }
    ]);
    const [paintWastage, setPaintWastage] = useState(DEFAULT_WASTAGE.paint);
    const [paintCustomWastage, setPaintCustomWastage] = useState(false);
    const [paintCost, setPaintCost] = useState(null);

    // 批土計算 - 多列支援
    const [puttyRows, setPuttyRows] = useState([
        { id: 1, name: '', area: '' }
    ]);
    const [puttyWastage, setPuttyWastage] = useState(DEFAULT_WASTAGE.putty);
    const [puttyCustomWastage, setPuttyCustomWastage] = useState(false);
    const [puttyCost, setPuttyCost] = useState(null);

    // 塗刷面積估算
    const [buildingArea, setBuildingArea] = useState('');

    // 計算每列油漆結果
    const paintRowResults = paintRows.map(row => {
        const areaSqm = row.unit === 'ping' ? (parseFloat(row.area) || 0) * 3.30579 : (parseFloat(row.area) || 0);
        const gallons = areaSqm / 3.30579 * 0.5;
        return { ...row, gallons };
    });

    // 總計油漆
    const totalPaintGallons = paintRowResults.reduce((sum, row) => sum + row.gallons, 0);
    const currentPaintWastage = paintCustomWastage ? paintWastage : DEFAULT_WASTAGE.paint;
    const totalPaintWithWastage = applyWastage(totalPaintGallons, currentPaintWastage);

    // 油漆列操作
    const addPaintRow = () => {
        const newId = Math.max(...paintRows.map(r => r.id), 0) + 1;
        setPaintRows([...paintRows, { id: newId, name: '', area: '', unit: 'sqm' }]);
    };
    const removePaintRow = (id) => {
        if (paintRows.length <= 1) return;
        setPaintRows(paintRows.filter(row => row.id !== id));
    };
    const updatePaintRow = (id, field, value) => {
        setPaintRows(paintRows.map(row => row.id === id ? { ...row, [field]: value } : row));
    };
    const clearPaintRows = () => {
        setPaintRows([{ id: 1, name: '', area: '', unit: 'sqm' }]);
    };

    // 計算每列批土結果
    const puttyRowResults = puttyRows.map(row => {
        const area = parseFloat(row.area) || 0;
        const amount = area * 0.35;
        return { ...row, amount };
    });

    // 總計批土
    const totalPutty = puttyRowResults.reduce((sum, row) => sum + row.amount, 0);
    const currentPuttyWastage = puttyCustomWastage ? puttyWastage : DEFAULT_WASTAGE.putty;
    const totalPuttyWithWastage = applyWastage(totalPutty, currentPuttyWastage);

    // 批土列操作
    const addPuttyRow = () => {
        const newId = Math.max(...puttyRows.map(r => r.id), 0) + 1;
        setPuttyRows([...puttyRows, { id: newId, name: '', area: '' }]);
    };
    const removePuttyRow = (id) => {
        if (puttyRows.length <= 1) return;
        setPuttyRows(puttyRows.filter(row => row.id !== id));
    };
    const updatePuttyRow = (id, field, value) => {
        setPuttyRows(puttyRows.map(row => row.id === id ? { ...row, [field]: value } : row));
    };
    const clearPuttyRows = () => {
        setPuttyRows([{ id: 1, name: '', area: '' }]);
    };

    // 塗刷面積估算
    const estimatedPaintArea = (parseFloat(buildingArea) || 0) * 3;

    return (
        <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
                {[
                    { id: 'paint', label: '油漆用量' },
                    { id: 'putty', label: '批土用量' },
                    { id: 'estimate', label: '面積估算' },
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => setCalcType(item.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${calcType === item.id ? 'bg-orange-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* 油漆用量 - 多列模式 */}
            {calcType === 'paint' && (
                <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Info size={16} />
                            公式: 用量(加侖) ≈ 面積(坪) × 0.5
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{paintRows.length} 列</span>
                            <button onClick={() => paintRows.length > 1 && removePaintRow(paintRows[paintRows.length - 1].id)} disabled={paintRows.length <= 1}
                                className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                <span className="text-lg font-bold leading-none">−</span>
                            </button>
                            <button onClick={addPaintRow} className="w-7 h-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors">
                                <Plus size={16} />
                            </button>
                            {paintRows.length > 1 && <button onClick={clearPaintRows} className="text-xs text-gray-500 hover:text-gray-700 ml-1">清空</button>}
                        </div>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {paintRows.map((row, index) => (
                            <div key={row.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <div className="grid grid-cols-12 gap-2 items-end">
                                    <div className="col-span-12 sm:col-span-3">
                                        <label className="block text-xs text-gray-500 mb-1">名稱</label>
                                        <input type="text" value={row.name} onChange={(e) => updatePaintRow(row.id, 'name', e.target.value)}
                                            placeholder={`區域 ${index + 1}`} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                                    </div>
                                    <div className="col-span-5 sm:col-span-3">
                                        <label className="block text-xs text-gray-500 mb-1">塗刷面積</label>
                                        <div className="relative">
                                            <input type="number" value={row.area} onChange={(e) => updatePaintRow(row.id, 'area', e.target.value)}
                                                placeholder="0" min="0" className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-8" />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">{row.unit === 'ping' ? '坪' : 'm²'}</span>
                                        </div>
                                    </div>
                                    <div className="col-span-5 sm:col-span-2">
                                        <label className="block text-xs text-gray-500 mb-1">單位</label>
                                        <select value={row.unit} onChange={(e) => updatePaintRow(row.id, 'unit', e.target.value)}
                                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500">
                                            <option value="sqm">m²</option>
                                            <option value="ping">坪</option>
                                        </select>
                                    </div>
                                    <div className="col-span-10 sm:col-span-3 flex items-center">
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-500 mb-1">油漆用量</label>
                                            <div className="text-sm font-bold text-orange-600">
                                                {paintRowResults[index].gallons > 0 ? `${formatNumber(paintRowResults[index].gallons, 2)} 加侖` : '--'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 flex justify-end">
                                        <button onClick={() => removePaintRow(row.id)} disabled={paintRows.length <= 1}
                                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button onClick={addPaintRow} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors flex items-center justify-center gap-2 text-sm">
                        <Plus size={16} />+增加新欄位
                    </button>

                    <WastageControl wastage={paintWastage} setWastage={setPaintWastage} defaultValue={DEFAULT_WASTAGE.paint} useCustom={paintCustomWastage} setUseCustom={setPaintCustomWastage} />

                    <ResultDisplay
                        label={`油漆用量 (共 ${paintRowResults.filter(r => r.gallons > 0).length} 項)`}
                        value={totalPaintGallons}
                        unit="加侖"
                        wastageValue={totalPaintWithWastage}
                        onAddRecord={(subType, label, value, unit, wastageValue) =>
                            onAddRecord(subType, label, value, unit, wastageValue, paintCost)}
                        subType="油漆"
                    />

                    <CostInput
                        label="油漆"
                        quantity={totalPaintWithWastage}
                        unit="坪"
                        unitLabel="工帶料/坪"
                        vendors={vendors.filter(v => v.category === '建材供應' || v.tradeType?.includes('油漆'))}
                        onChange={setPaintCost}
                        placeholder={{ spec: '例：乳膠漆' }}
                    />

                    {paintRowResults.filter(r => r.gallons > 0).length > 1 && (
                        <div className="bg-gray-50 rounded-lg p-3 text-xs">
                            <div className="font-medium text-gray-700 mb-2">各項明細:</div>
                            <div className="space-y-1">
                                {paintRowResults.filter(r => r.gallons > 0).map((row, idx) => (
                                    <div key={row.id} className="flex justify-between text-gray-600">
                                        <span>{row.name || `區域 ${idx + 1}`} ({row.area}{row.unit === 'ping' ? '坪' : 'm²'})</span>
                                        <span className="font-medium">{formatNumber(row.gallons, 2)} 加侖</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 批土用量 - 多列模式 */}
            {calcType === 'putty' && (
                <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Info size={16} />
                            公式: 批土用量 = 建築面積 × 0.35
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{puttyRows.length} 列</span>
                            <button onClick={() => puttyRows.length > 1 && removePuttyRow(puttyRows[puttyRows.length - 1].id)} disabled={puttyRows.length <= 1}
                                className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                <span className="text-lg font-bold leading-none">−</span>
                            </button>
                            <button onClick={addPuttyRow} className="w-7 h-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors">
                                <Plus size={16} />
                            </button>
                            {puttyRows.length > 1 && <button onClick={clearPuttyRows} className="text-xs text-gray-500 hover:text-gray-700 ml-1">清空</button>}
                        </div>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {puttyRows.map((row, index) => (
                            <div key={row.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <div className="grid grid-cols-12 gap-2 items-end">
                                    <div className="col-span-12 sm:col-span-4">
                                        <label className="block text-xs text-gray-500 mb-1">名稱</label>
                                        <input type="text" value={row.name} onChange={(e) => updatePuttyRow(row.id, 'name', e.target.value)}
                                            placeholder={`區域 ${index + 1}`} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                                    </div>
                                    <div className="col-span-5 sm:col-span-3">
                                        <label className="block text-xs text-gray-500 mb-1">建築面積</label>
                                        <div className="relative">
                                            <input type="number" value={row.area} onChange={(e) => updatePuttyRow(row.id, 'area', e.target.value)}
                                                placeholder="0" min="0" className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-8" />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">m²</span>
                                        </div>
                                    </div>
                                    <div className="col-span-5 sm:col-span-4 flex items-center">
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-500 mb-1">批土用量</label>
                                            <div className="text-sm font-bold text-orange-600">
                                                {puttyRowResults[index].amount > 0 ? `${formatNumber(puttyRowResults[index].amount, 2)} kg` : '--'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 flex justify-end">
                                        <button onClick={() => removePuttyRow(row.id)} disabled={puttyRows.length <= 1}
                                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button onClick={addPuttyRow} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors flex items-center justify-center gap-2 text-sm">
                        <Plus size={16} />+增加新欄位
                    </button>

                    <WastageControl wastage={puttyWastage} setWastage={setPuttyWastage} defaultValue={DEFAULT_WASTAGE.putty} useCustom={puttyCustomWastage} setUseCustom={setPuttyCustomWastage} />

                    <ResultDisplay
                        label={`批土用量 (共 ${puttyRowResults.filter(r => r.amount > 0).length} 項)`}
                        value={totalPutty}
                        unit="kg"
                        wastageValue={totalPuttyWithWastage}
                        onAddRecord={(subType, label, value, unit, wastageValue) =>
                            onAddRecord(subType, label, value, unit, wastageValue, puttyCost)}
                        subType="批土"
                    />

                    <CostInput
                        label="批土"
                        quantity={totalPuttyWithWastage}
                        unit="kg"
                        vendors={vendors.filter(v => v.category === '建材供應' || v.tradeType?.includes('油漆'))}
                        onChange={setPuttyCost}
                        placeholder={{ spec: '例：AB批土' }}
                    />

                    {puttyRowResults.filter(r => r.amount > 0).length > 1 && (
                        <div className="bg-gray-50 rounded-lg p-3 text-xs">
                            <div className="font-medium text-gray-700 mb-2">各項明細:</div>
                            <div className="space-y-1">
                                {puttyRowResults.filter(r => r.amount > 0).map((row, idx) => (
                                    <div key={row.id} className="flex justify-between text-gray-600">
                                        <span>{row.name || `區域 ${idx + 1}`} ({row.area}m²)</span>
                                        <span className="font-medium">{formatNumber(row.amount, 2)} kg</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {calcType === 'estimate' && (
                <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Info size={16} />
                        室內抹灰/塗刷面積 ≈ 建築面積 × 3 ~ 3.8
                    </div>
                    <InputField label="建築面積" value={buildingArea} onChange={setBuildingArea} unit="m²" placeholder="0" />
                    <ResultDisplay label="預估塗刷面積" value={estimatedPaintArea} unit="m²" showWastage={false} onAddRecord={onAddRecord} subType="面積估算" />
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        地磚面積 ≈ 建築面積 × 0.7 = <strong>{formatNumber((parseFloat(buildingArea) || 0) * 0.7)}</strong> m²
                    </div>
                </div>
            )}
        </div>
    );
};


// 5️⃣ 建築概估計算器
const BuildingEstimator = ({ onAddRecord, buildingTypes = [] }) => {
    const [buildingType, setBuildingType] = useState(1);
    const [floorArea, setFloorArea] = useState('');
    const [wallThicknessFilter, setWallThicknessFilter] = useState('all');

    // 根據牆壁厚度篩選建築類型
    const filteredTypes = buildingTypes.map((t, i) => ({ ...t, originalIndex: i }))
        .filter(t => wallThicknessFilter === 'all' || t.wallThickness === parseInt(wallThicknessFilter));

    // 確保選中的類型在過濾後仍然有效
    const selectedIndex = filteredTypes.findIndex(t => t.originalIndex === buildingType);
    const validSelectedIndex = selectedIndex >= 0 ? buildingType : (filteredTypes[0]?.originalIndex ?? 0);
    const selected = buildingTypes[validSelectedIndex] || buildingTypes[0] || { rebar: 0, concrete: 0, formwork: 0, sand: 0 };

    const totalRebar = (parseFloat(floorArea) || 0) * selected.rebar;
    const totalConcrete = (parseFloat(floorArea) || 0) * selected.concrete;
    const totalFormwork = (parseFloat(floorArea) || 0) * selected.formwork;
    const totalSand = (parseFloat(floorArea) || 0) * selected.sand;

    // 當篩選改變時，自動選擇篩選後的第一個類型
    const handleWallThicknessChange = (value) => {
        setWallThicknessFilter(value);
        if (value !== 'all') {
            const newFiltered = buildingTypes.map((t, i) => ({ ...t, originalIndex: i }))
                .filter(t => t.wallThickness === parseInt(value));
            if (newFiltered.length > 0) {
                setBuildingType(newFiltered[0].originalIndex);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                    <Info size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-orange-800">
                        <p className="font-medium">建築概估說明</p>
                        <p className="text-orange-600 mt-1">依據建築類型與樓地板面積，快速估算整棟建築的主要結構材料用量。數據來源為抗震7度區規則結構設計經驗值。</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <SelectField
                        label="牆壁厚度篩選"
                        value={wallThicknessFilter}
                        onChange={handleWallThicknessChange}
                        options={WALL_THICKNESS_OPTIONS}
                    />
                    <SelectField
                        label="建築類型"
                        value={validSelectedIndex}
                        onChange={(v) => setBuildingType(parseInt(v))}
                        options={filteredTypes.map((t) => ({ value: t.originalIndex, label: `${t.label} (${t.structure})` }))}
                    />
                    <InputField label="總樓地板面積" value={floorArea} onChange={setFloorArea} unit="m²" placeholder="0" />
                </div>

                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-gray-600">
                        <span>結構: <strong className="text-gray-800">{selected.structure}</strong></span>
                        <span>牆厚: <strong className="text-gray-800">{selected.wallThickness} cm</strong></span>
                        <span>鋼筋: {selected.rebar} kg/m²</span>
                        <span>混凝土: {selected.concrete} m³/m²</span>
                        <span>模板: {selected.formwork} m²/m²</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <ResultDisplay label="鋼筋總量" value={totalRebar} unit="kg" showWastage={false} onAddRecord={onAddRecord} subType="建築概估" />
                    <ResultDisplay label="混凝土總量" value={totalConcrete} unit="m³" showWastage={false} onAddRecord={onAddRecord} subType="建築概估" />
                    <ResultDisplay label="模板總量" value={totalFormwork} unit="m²" showWastage={false} onAddRecord={onAddRecord} subType="建築概估" />
                    <ResultDisplay label="砂用量" value={totalSand} unit="m³" showWastage={false} onAddRecord={onAddRecord} subType="建築概估" />
                </div>

                <div className="text-xs text-gray-500">
                    鋼筋約 <strong>{formatNumber(totalRebar / 1000, 1)}</strong> 噸 |
                    混凝土約 <strong>{formatNumber(totalConcrete)}</strong> 立方公尺
                </div>
            </div>

            {/* 參考表格 */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-700">建築類型參考指標</h4>
                    {wallThicknessFilter !== 'all' && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                            篩選: 牆厚 {wallThicknessFilter} cm
                        </span>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm whitespace-nowrap">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="text-left py-2 px-2">建築類型</th>
                                <th className="text-center py-2 px-2">結構</th>
                                <th className="text-center py-2 px-2">牆厚(cm)</th>
                                <th className="text-right py-2 px-2">鋼筋(kg/m²)</th>
                                <th className="text-right py-2 px-2">混凝土(m³/m²)</th>
                                <th className="text-right py-2 px-2">模板(m²/m²)</th>
                                <th className="text-right py-2 px-2">砂(m³/m²)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTypes.map((t) => (
                                <tr key={t.originalIndex} className={`border-b hover:bg-gray-50 transition-colors ${t.originalIndex === validSelectedIndex ? 'bg-orange-50' : ''} ${t.structure === 'RB' ? 'text-amber-700' : ''}`}>
                                    <td className="py-2 px-2">
                                        {t.label}
                                        {t.structure === 'RB' && <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-1 rounded">磚造</span>}
                                    </td>
                                    <td className="text-center py-2 px-2">{t.structure}</td>
                                    <td className="text-center py-2 px-2">{t.wallThickness}</td>
                                    <td className="text-right py-2 px-2">{t.rebar}</td>
                                    <td className="text-right py-2 px-2">{t.concrete}</td>
                                    <td className="text-right py-2 px-2">{t.formwork}</td>
                                    <td className="text-right py-2 px-2">{t.sand}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-3 text-xs text-gray-500 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-amber-100 rounded"></span>
                        RB = 加強磚造
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-gray-100 rounded"></span>
                        RC = 鋼筋混凝土 | SRC = 鋼骨鋼筋混凝土 | SC = 鋼構
                    </span>
                </div>
            </div>
        </div>
    );
};


// ============================================
// 主組件
// ============================================

export const MaterialCalculator = ({
    addToast,
    vendors = [],
    // Embedded mode props
    embedded = false,
    calcRecords: externalCalcRecords,
    setCalcRecords: externalSetCalcRecords,
    activeCategory = null, // 外部控制的分類（來自 L2 tabs）
}) => {
    const [activeTab, setActiveTab] = useState('structure');

    // 當有外部 activeCategory 時使用它，否則使用內部狀態
    const effectiveTab = activeCategory || activeTab;

    // CMM API 數據 (含 fallback 到硬編碼常量)
    const { buildingTypes, rebarSpecs, loading: cmmLoading, apiAvailable } = useCmmData();

    // 計算記錄 - 支援外部狀態注入
    const [internalCalcRecords, internalSetCalcRecords] = useState([]);
    const calcRecords = externalCalcRecords ?? internalCalcRecords;
    const setCalcRecords = externalSetCalcRecords ?? internalSetCalcRecords;

    const [exportName, setExportName] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [exportedSheet, setExportedSheet] = useState(null);

    const tabs = [
        { id: 'structure', icon: Building2, label: '結構工程' },
        { id: 'masonry', icon: Layers, label: '泥作工程' },
        { id: 'tile', icon: Grid3X3, label: '磁磚工程' },
        { id: 'finish', icon: Paintbrush, label: '塗料工程' },
        { id: 'estimate', icon: BarChart3, label: '建築概估' },
    ];

    // 新增計算記錄
    const addRecord = (category, subType, label, value, unit, wastageValue, costData) => {
        const record = {
            id: Date.now(),
            category,
            subType,
            label,
            value: parseFloat(value) || 0,
            unit,
            wastageValue: parseFloat(wastageValue) || parseFloat(value) || 0,
            createdAt: new Date().toLocaleString('zh-TW'),
            // 成本資訊
            vendor: costData?.vendor || '',
            spec: costData?.spec || '',
            price: costData?.price || 0,
            subtotal: costData?.subtotal || 0,
            note: costData?.note || ''
        };
        setCalcRecords(prev => [...prev, record]);
        addToast?.(`已加入記錄: ${label}`, 'success');
    };

    // 刪除記錄
    const removeRecord = (id) => {
        setCalcRecords(prev => prev.filter(r => r.id !== id));
    };

    // 清空記錄
    const clearRecords = () => {
        setCalcRecords([]);
        addToast?.('已清空計算記錄', 'info');
    };

    // 匯出到 Google Sheet (存入物料算量資料夾)
    const exportToSheet = async () => {
        if (calcRecords.length === 0) {
            addToast?.('請先加入計算記錄', 'warning');
            return;
        }

        setIsExporting(true);
        try {
            // 使用新的匯出功能，會自動建立物料算量資料夾並以日期時間命名
            const result = await GoogleService.exportMaterialCalculationToFolder(
                calcRecords,
                exportName // 如果有自訂名稱則使用，否則會自動產生含日期時間的檔名
            );

            if (result.success) {
                setExportedSheet(result);
                addToast?.('已匯出到 Google Sheet！', 'success', {
                    action: {
                        label: '開啟 Sheet',
                        onClick: () => window.open(result.sheetUrl, '_blank')
                    }
                });
            } else {
                addToast?.(result.error || '匯出失敗', 'error');
            }
        } catch (error) {
            console.error('Export error:', error);
            addToast?.('匯出失敗：' + error.message, 'error');
        } finally {
            setIsExporting(false);
        }
    };

    const renderCalculator = () => {
        switch (effectiveTab) {
            case 'structure': return <StructureCalculator onAddRecord={(s, l, v, u, w, c) => addRecord('結構工程', s, l, v, u, w, c)} vendors={vendors} rebarSpecs={rebarSpecs} />;
            case 'masonry': return <MasonryCalculator onAddRecord={(s, l, v, u, w, c) => addRecord('泥作工程', s, l, v, u, w, c)} vendors={vendors} />;
            case 'tile': return <TileCalculator onAddRecord={(s, l, v, u, w, c) => addRecord('磁磚工程', s, l, v, u, w, c)} vendors={vendors} />;
            case 'finish': return <FinishCalculator onAddRecord={(s, l, v, u, w, c) => addRecord('塗料工程', s, l, v, u, w, c)} vendors={vendors} />;
            case 'estimate': return <BuildingEstimator onAddRecord={(s, l, v, u, w, c) => addRecord('建築概估', s, l, v, u, w, c)} buildingTypes={buildingTypes} />;
            default: return <StructureCalculator onAddRecord={(s, l, v, u, w, c) => addRecord('結構工程', s, l, v, u, w, c)} vendors={vendors} rebarSpecs={rebarSpecs} />;
        }
    };

    // Embedded mode: 簡化渲染
    if (embedded) {
        return (
            <div className="space-y-4">
                {/* 工項選擇頁籤 - 只有在沒有外部 activeCategory 時才顯示（避免與 L2 重複） */}
                {!activeCategory && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all text-sm ${effectiveTab === tab.id
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                >
                                    <Icon size={16} />
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* 計算器區域 */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    {renderCalculator()}
                </div>

                {/* 計算記錄列表 */}
                {calcRecords.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-gray-800 text-sm">計算記錄 ({calcRecords.length})</span>
                            <button
                                onClick={clearRecords}
                                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                            >
                                清空
                            </button>
                        </div>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {calcRecords.map(record => (
                                <div key={record.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 text-sm">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-800 truncate">{record.label}</div>
                                        <div className="text-xs text-gray-500">
                                            {record.category} - {record.subType}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900">
                                            {formatNumber(record.wastageValue)} {record.unit}
                                        </span>
                                        <button
                                            onClick={() => removeRecord(record.id)}
                                            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 匯出到 Google Sheet - Embedded 模式 */}
                {calcRecords.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <FileSpreadsheet size={16} className="text-blue-600" />
                            <span className="font-medium text-blue-800 text-sm">匯出到 Google Sheet</span>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={exportName}
                                onChange={(e) => setExportName(e.target.value)}
                                placeholder="報表名稱（選填）"
                                className="flex-1 px-3 py-2 rounded-lg border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                            <button
                                onClick={exportToSheet}
                                disabled={isExporting}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {isExporting ? (
                                    <>
                                        <RefreshCw size={14} className="animate-spin" />
                                        匯出中...
                                    </>
                                ) : (
                                    <>
                                        <FileSpreadsheet size={14} />
                                        匯出
                                    </>
                                )}
                            </button>
                        </div>
                        {exportedSheet && (
                            <div className="mt-3 pt-3 border-t border-blue-200">
                                <a
                                    href={exportedSheet.sheetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                    <ExternalLink size={14} />
                                    開啟已匯出的 Sheet
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Standalone mode: 完整頁面渲染
    return (
        <div className="space-y-6 animate-fade-in">
            <SectionTitle title="營建物料快速換算" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 左側：計算器 */}
                <div className="lg:col-span-2 space-y-4">
                    {/* 工項選擇 */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-3 rounded-xl whitespace-nowrap transition-all ${activeTab === tab.id
                                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        <Icon size={18} />
                                        <span className="font-medium">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 計算器區域 */}
                    <div className="bg-gray-50 rounded-2xl p-5">
                        {renderCalculator()}
                    </div>

                    {/* 公式說明 */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <Calculator size={18} />
                            常用換算公式
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="font-medium text-gray-700">🧱 鋼筋重量</div>
                                <div className="text-gray-500 mt-1">每米重 = 0.00617 × d²</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="font-medium text-gray-700">🧱 紅磚數量</div>
                                <div className="text-gray-500 mt-1">24牆 = 128塊/m²</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="font-medium text-gray-700">🔲 磁磚片數</div>
                                <div className="text-gray-500 mt-1">每坪 = 32400 ÷ (長×寬)</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 右側：計算記錄與匯出 */}
                <div className="space-y-4">
                    {/* 計算記錄 */}
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white">
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-bold flex items-center gap-2">
                                <Calculator size={18} />
                                計算記錄
                            </span>
                            {calcRecords.length > 0 && (
                                <button
                                    onClick={clearRecords}
                                    className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded"
                                >
                                    清空
                                </button>
                            )}
                        </div>

                        {calcRecords.length === 0 ? (
                            <div className="text-center py-8 text-orange-200">
                                <Calculator size={40} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">計算後點擊「加入記錄」</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {calcRecords.map(record => (
                                    <div key={record.id} className="flex items-center justify-between py-2 border-b border-white/20 last:border-0">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate">{record.label}</div>
                                            <div className="text-xs text-orange-200">
                                                {record.category} - {record.subType}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold">
                                                {formatNumber(record.wastageValue)} {record.unit}
                                            </span>
                                            <button
                                                onClick={() => removeRecord(record.id)}
                                                className="p-1 hover:bg-white/20 rounded text-red-200"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 匯出到 Google Sheet */}
                    {calcRecords.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <FileSpreadsheet size={18} className="text-blue-600" />
                                <span className="font-medium text-blue-800">匯出到 Google Sheet</span>
                            </div>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={exportName}
                                    onChange={(e) => setExportName(e.target.value)}
                                    placeholder="輸入報表名稱（選填）"
                                    className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                                <button
                                    onClick={exportToSheet}
                                    disabled={isExporting}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isExporting ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin" />
                                            匯出中...
                                        </>
                                    ) : (
                                        <>
                                            <FileSpreadsheet size={16} />
                                            匯出到 Google Sheet
                                        </>
                                    )}
                                </button>
                            </div>

                            {exportedSheet && (
                                <div className="mt-3 pt-3 border-t border-blue-200">
                                    <a
                                        href={exportedSheet.sheetUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    >
                                        <ExternalLink size={14} />
                                        開啟已匯出的 Sheet
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 使用提示 */}
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                        <div className="flex gap-2">
                            <Info size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
                            <div className="text-xs text-orange-700">
                                <p className="font-medium mb-1">使用說明</p>
                                <ol className="list-decimal list-inside space-y-0.5 text-orange-600">
                                    <li>選擇工程類別進行計算</li>
                                    <li>點「加入記錄」保存結果</li>
                                    <li>匯出到 Google Sheet</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaterialCalculator;

