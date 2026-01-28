/**
 * MaterialCalculator 常數定義
 * 將所有常數集中管理，便於維護與重用
 */

// ============================================
// 預設損耗率
// ============================================
export const DEFAULT_WASTAGE = {
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

// ============================================
// 泥作工程常數
// ============================================

// 紅磚用量對照表 (塊/m²)
export const BRICK_PER_SQM = {
  12: { label: '12牆 (12cm)', count: 64 },
  18: { label: '18牆 (18cm)', count: 96 },
  24: { label: '24牆 (24cm)', count: 128 },
  37: { label: '37牆 (37cm)', count: 192 },
};

// 粉光配比對照表
export const PLASTER_RATIOS = {
  '1:2': { label: '1:2 粉光 (細)', cementPerM3: 650, sandPerM3: 800, desc: '細緻粉光面' },
  '1:3': { label: '1:3 打底 (粗)', cementPerM3: 450, sandPerM3: 950, desc: '一般打底用' },
};

// ============================================
// 磁磚工程常數
// ============================================

export const TILE_SIZES = [
  { label: '30×30 cm', l: 30, w: 30 },
  { label: '30×60 cm', l: 30, w: 60 },
  { label: '45×45 cm', l: 45, w: 45 },
  { label: '60×60 cm', l: 60, w: 60 },
  { label: '60×120 cm', l: 60, w: 120 },
  { label: '80×80 cm', l: 80, w: 80 },
  { label: '自訂', l: 0, w: 0 },
];

export const TILE_METHODS = [
  { value: 'none', label: '未選擇' },
  { value: 'wet', label: '濕式工法(軟底)' },
  { value: 'dry', label: '乾式工法(硬底)' },
  { value: 'semi', label: '半乾濕式(騷底)' },
  { value: 'hang', label: '乾掛式工法' },
];

// ============================================
// 建築類型概估指標
// ============================================

export const BUILDING_TYPES = [
  // RC 鋼筋混凝土結構
  {
    label: 'RC透天 (2-3F)',
    rebar: 100,
    concrete: 0.73,
    formwork: 3.0,
    sand: 0.18,
    structure: 'RC',
    wallThickness: 15,
  },
  {
    label: 'RC透天 (4-5F)',
    rebar: 112,
    concrete: 0.79,
    formwork: 3.2,
    sand: 0.2,
    structure: 'RC',
    wallThickness: 18,
  },
  {
    label: '別墅 (RC)',
    rebar: 106,
    concrete: 0.76,
    formwork: 3.0,
    sand: 0.18,
    structure: 'RC',
    wallThickness: 18,
  },
  {
    label: '公寓 (5-6F)',
    rebar: 109,
    concrete: 0.79,
    formwork: 3.3,
    sand: 0.2,
    structure: 'RC',
    wallThickness: 18,
  },
  {
    label: '大樓 (7-12F)',
    rebar: 112,
    concrete: 0.82,
    formwork: 3.4,
    sand: 0.22,
    structure: 'RC',
    wallThickness: 20,
  },
  {
    label: '高層 (13-20F)',
    rebar: 115,
    concrete: 0.85,
    formwork: 3.5,
    sand: 0.24,
    structure: 'RC',
    wallThickness: 25,
  },
  {
    label: '高層 (21-30F)',
    rebar: 121,
    concrete: 0.91,
    formwork: 3.6,
    sand: 0.26,
    structure: 'RC',
    wallThickness: 30,
  },
  {
    label: '超高層 (30F+)',
    rebar: 130,
    concrete: 0.95,
    formwork: 3.8,
    sand: 0.28,
    structure: 'SRC',
    wallThickness: 35,
  },
  {
    label: '辦公大樓',
    rebar: 115,
    concrete: 0.85,
    formwork: 3.5,
    sand: 0.24,
    structure: 'RC/SRC',
    wallThickness: 25,
  },
  {
    label: '工業廠房 (SC)',
    rebar: 45,
    concrete: 0.35,
    formwork: 2.0,
    sand: 0.12,
    structure: 'SC',
    wallThickness: 15,
  },
  {
    label: '地下室 (每層)',
    rebar: 145,
    concrete: 1.1,
    formwork: 4.0,
    sand: 0.3,
    structure: 'RC',
    wallThickness: 30,
  },
  // RB 加強磚造結構
  {
    label: '透天厝 (RB 3F)',
    rebar: 55,
    concrete: 0.45,
    formwork: 2.2,
    sand: 0.25,
    structure: 'RB',
    wallThickness: 24,
  },
  {
    label: '農舍/倉庫 (RB)',
    rebar: 45,
    concrete: 0.38,
    formwork: 1.8,
    sand: 0.22,
    structure: 'RB',
    wallThickness: 24,
  },
];

// 牆壁厚度選項
export const WALL_THICKNESS_OPTIONS = [
  { value: 'all', label: '全部厚度' },
  { value: 15, label: '15 cm' },
  { value: 18, label: '18 cm' },
  { value: 20, label: '20 cm' },
  { value: 24, label: '24 cm (1B磚)' },
  { value: 25, label: '25 cm' },
  { value: 30, label: '30 cm' },
];

// ============================================
// 鋼筋規格表
// ============================================

export const REBAR_SPECS = [
  { label: '#3 D10 (9.53mm)', d: 9.53, weight: 0.56 },
  { label: '#4 D13 (12.7mm)', d: 12.7, weight: 0.99 },
  { label: '#5 D16 (15.9mm)', d: 15.9, weight: 1.56 },
  { label: '#6 D19 (19.1mm)', d: 19.1, weight: 2.25 },
  { label: '#7 D22 (22.2mm)', d: 22.2, weight: 3.04 },
  { label: '#8 D25 (25.4mm)', d: 25.4, weight: 3.98 },
  { label: '#9 D29 (28.7mm)', d: 28.7, weight: 5.08 },
  { label: '#10 D32 (32.2mm)', d: 32.2, weight: 6.39 },
];

// CNS 560 鋼筋號數與單位重量
export const REBAR_SIZES = [
  { value: '#3', label: '#3 (D10)', diameter: 10, unitWeight: 0.56 },
  { value: '#4', label: '#4 (D13)', diameter: 13, unitWeight: 0.995 },
  { value: '#5', label: '#5 (D16)', diameter: 16, unitWeight: 1.56 },
  { value: '#6', label: '#6 (D19)', diameter: 19, unitWeight: 2.25 },
  { value: '#7', label: '#7 (D22)', diameter: 22, unitWeight: 3.04 },
  { value: '#8', label: '#8 (D25)', diameter: 25, unitWeight: 3.98 },
];

// 鋼筋間距選項 (mm)
export const REBAR_SPACING_OPTIONS = [
  { value: 100, label: '@100mm (密)' },
  { value: 150, label: '@150mm' },
  { value: 200, label: '@200mm (標準)' },
  { value: 250, label: '@250mm' },
  { value: 300, label: '@300mm (疏)' },
];

// 配筋層數選項
export const REBAR_LAYER_OPTIONS = [
  { value: 'single', label: '單層配筋', multiplier: 1 },
  { value: 'double', label: '雙層配筋', multiplier: 2 },
];

// 鋼筋參考單價 (NT$/kg)
export const REBAR_PRICES = {
  '#3': 28,
  '#4': 26,
  '#5': 25,
  '#6': 24,
  '#7': 23,
  '#8': 22,
  '#9': 22,
  '#10': 22,
};

// 各部位鋼筋用量概算指標 (kg/m²)
export const REBAR_USAGE_BY_COMPONENT = {
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

// 構件配筋率 (kg/m³ 混凝土)
export const REBAR_RATIO_BY_COMPONENT = {
  column: { light: 100, standard: 120, heavy: 150, label: '柱' },
  beam: { light: 80, standard: 100, heavy: 130, label: '梁' },
  floor: { light: 60, standard: 75, heavy: 90, label: '樓板' },
  wall: { light: 60, standard: 70, heavy: 85, label: '牆' },
  parapet: { light: 50, standard: 60, heavy: 75, label: '女兒牆' },
  groundbeam: { light: 90, standard: 110, heavy: 140, label: '地梁' },
  foundation: { light: 80, standard: 100, heavy: 130, label: '基礎' },
};

// ============================================
// 混凝土規格
// ============================================

export const CONCRETE_GRADES = [
  { value: 140, label: "fc'140", desc: '墊層/填充', price: 2200 },
  { value: 175, label: "fc'175", desc: '輕載結構', price: 2400 },
  { value: 210, label: "fc'210", desc: '一般結構 (預設)', price: 2600 },
  { value: 245, label: "fc'245", desc: '中跨度梁柱', price: 2800 },
  { value: 280, label: "fc'280", desc: '高層建築', price: 3000 },
  { value: 315, label: "fc'315", desc: '預力構件', price: 3200 },
  { value: 350, label: "fc'350", desc: '特殊結構', price: 3500 },
];

// ============================================
// 結構模板計算常數
// ============================================

// 女兒牆厚度選項 (cm)
export const PARAPET_THICKNESS_OPTIONS = [
  { value: 12, label: '12 cm' },
  { value: 15, label: '15 cm (常用)' },
  { value: 18, label: '18 cm' },
  { value: 20, label: '20 cm' },
  { value: 'custom', label: '自訂' },
];

// 地樑預設尺寸
export const GROUND_BEAM_PRESETS = [
  { value: 'GB1', label: 'GB1 小地樑', width: 30, height: 50, desc: '輕型結構' },
  { value: 'GB2', label: 'GB2 一般地樑', width: 35, height: 60, desc: '透天住宅' },
  { value: 'GB3', label: 'GB3 標準地樑', width: 40, height: 70, desc: '公寓/商辦' },
  { value: 'GB4', label: 'GB4 大地樑', width: 50, height: 80, desc: '高層建築' },
  { value: 'GB5', label: 'GB5 特大地樑', width: 60, height: 100, desc: '重載結構' },
  { value: 'custom', label: '自訂尺寸', width: 0, height: 0, desc: '' },
];

// 柱子預設尺寸
export const COLUMN_PRESETS = [
  { value: 'C1', label: 'C1 小柱 30×30', width: 30, depth: 30, type: 'square', desc: '輕型結構' },
  { value: 'C2', label: 'C2 一般柱 40×40', width: 40, depth: 40, type: 'square', desc: '透天住宅' },
  {
    value: 'C3',
    label: 'C3 標準柱 50×50',
    width: 50,
    depth: 50,
    type: 'square',
    desc: '公寓/商辦',
  },
  { value: 'C4', label: 'C4 大柱 60×60', width: 60, depth: 60, type: 'square', desc: '高層建築' },
  { value: 'C5', label: 'C5 矩形柱 40×60', width: 40, depth: 60, type: 'square', desc: '特殊配置' },
  { value: 'C6', label: 'C6 矩形柱 50×80', width: 50, depth: 80, type: 'square', desc: '大跨距' },
  { value: 'R1', label: 'R1 圓柱 Ø40', diameter: 40, type: 'round', desc: '室內裝飾' },
  { value: 'R2', label: 'R2 圓柱 Ø50', diameter: 50, type: 'round', desc: '標準圓柱' },
  { value: 'R3', label: 'R3 圓柱 Ø60', diameter: 60, type: 'round', desc: '大型圓柱' },
  { value: 'custom', label: '自訂尺寸', width: 0, depth: 0, type: 'square', desc: '' },
];

// 牆壁厚度選項 (cm)
export const WALL_THICKNESS_PRESETS = [
  { value: 'W1', label: 'W1 薄牆 12cm', thickness: 12, desc: '隔間牆' },
  { value: 'W2', label: 'W2 標準牆 15cm', thickness: 15, desc: '一般RC牆' },
  { value: 'W3', label: 'W3 承重牆 18cm', thickness: 18, desc: '承重牆' },
  { value: 'W4', label: 'W4 厚牆 20cm', thickness: 20, desc: '外牆/剪力牆' },
  { value: 'W5', label: 'W5 加厚牆 25cm', thickness: 25, desc: '地下室牆' },
  { value: 'W6', label: 'W6 特厚牆 30cm', thickness: 30, desc: '擋土牆' },
  { value: 'custom', label: '自訂厚度', thickness: 0, desc: '' },
];

// 樓板厚度選項 (cm)
export const FLOOR_THICKNESS_PRESETS = [
  { value: 'F1', label: 'F1 薄板 10cm', thickness: 10, desc: '輕載樓板' },
  { value: 'F2', label: 'F2 標準板 12cm', thickness: 12, desc: '一般住宅' },
  { value: 'F3', label: 'F3 加厚板 15cm', thickness: 15, desc: '商辦/公寓' },
  { value: 'F4', label: 'F4 厚板 18cm', thickness: 18, desc: '重載樓板' },
  { value: 'F5', label: 'F5 特厚板 20cm', thickness: 20, desc: '停車場/屋頂' },
  { value: 'F6', label: 'F6 筏基板 25cm', thickness: 25, desc: '筏式基礎' },
  { value: 'custom', label: '自訂厚度', thickness: 0, desc: '' },
];

// 柱子主筋根數選項
export const COLUMN_MAIN_BAR_COUNT = [
  { value: 4, label: '4根' },
  { value: 6, label: '6根' },
  { value: 8, label: '8根' },
  { value: 10, label: '10根' },
  { value: 12, label: '12根' },
  { value: 16, label: '16根' },
];

// 模板類型選項
export const FORMWORK_TYPES = [
  { value: 'standard', label: '普通模板', coefficient: 1.0, desc: '一般施工' },
  { value: 'fairface', label: '清水模板', coefficient: 1.4, desc: '光滑面、高品質' },
  { value: 'system', label: '系統模板', coefficient: 1.2, desc: '可重複使用、效率高' },
  { value: 'steel', label: '組合鋼模', coefficient: 1.5, desc: '柱子專用、高精度' },
];

// 施工條件係數
export const CONSTRUCTION_CONDITIONS = [
  { value: 'normal', label: '標準施工', coefficient: 1.0 },
  { value: 'elevated', label: '高空作業', coefficient: 1.15 },
  { value: 'confined', label: '狹窄空間', coefficient: 1.15 },
  { value: 'complex', label: '複雜造型', coefficient: 1.25 },
];

// ============================================
// 法規參照
// ============================================

export const REGULATION_REFS = {
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
    rules: ['牆厚不得小於 15cm', '雙向配筋，水平及垂直筋比 ≥ 0.0025', '鋼筋間距不得大於 45cm'],
  },
  column: {
    code: '建技規§407',
    title: '柱設計',
    rules: ['主筋比 1% ~ 8%', '主筋不得少於 4 根', '箍筋間距 ≤ 柱最小尺寸或 d/2'],
  },
  beam: {
    code: '建技規§406',
    title: '梁設計',
    rules: ['梁深 h ≥ 淨跨/16', '拉筋比 ≥ 0.004', '箍筋間距 ≤ d/2 或 60cm'],
  },
  groundbeam: {
    code: '建技規§406',
    title: '地梁設計',
    rules: ['地梁深度 ≥ 淨跨/12', '主筋搭接長度 ≥ 40db', '箍筋需延伸至基礎內'],
  },
  foundation: {
    code: '建技規§415',
    title: '基礎設計',
    rules: ['最小配筋率 ≥ 0.0018', '保護層厚度 ≥ 7.5cm (接地)', '素混凝土墊層厚度 ≥ 5cm'],
  },
  parapet: {
    code: '建技規§410',
    title: '女兒牆設計',
    rules: ['高度超過 1.2m 需設計配筋', '配筋同牆體規定', '頂部需設壓頂梁或壓樑'],
  },
};

// ============================================
// 預設配置 (含配筋)
// ============================================

export const GROUNDBEAM_PRESETS_REBAR = {
  GB1: {
    topBar: '#5',
    topCount: 2,
    bottomBar: '#5',
    bottomCount: 3,
    stirrup: '#3',
    stirrupSpacing: 200,
    desc: '透天1-2F',
  },
  GB2: {
    topBar: '#5',
    topCount: 3,
    bottomBar: '#5',
    bottomCount: 4,
    stirrup: '#3',
    stirrupSpacing: 150,
    desc: '透天3-4F',
  },
  GB3: {
    topBar: '#6',
    topCount: 3,
    bottomBar: '#6',
    bottomCount: 4,
    stirrup: '#4',
    stirrupSpacing: 150,
    desc: '公寓5F',
  },
  GB4: {
    topBar: '#6',
    topCount: 4,
    bottomBar: '#6',
    bottomCount: 5,
    stirrup: '#4',
    stirrupSpacing: 125,
    desc: '高層建築',
  },
  GB5: {
    topBar: '#7',
    topCount: 4,
    bottomBar: '#7',
    bottomCount: 6,
    stirrup: '#4',
    stirrupSpacing: 100,
    desc: '重載結構',
  },
  custom: null,
};

export const COLUMN_PRESETS_REBAR = {
  C1: { mainBar: '#5', mainCount: 4, stirrup: '#3', stirrupSpacing: 200, desc: '透天RC' },
  C2: { mainBar: '#5', mainCount: 8, stirrup: '#3', stirrupSpacing: 150, desc: '住宅公寓' },
  C3: { mainBar: '#6', mainCount: 8, stirrup: '#4', stirrupSpacing: 150, desc: '商辦大樓' },
  C4: { mainBar: '#6', mainCount: 12, stirrup: '#4', stirrupSpacing: 125, desc: '高層/地下室' },
  C5: { mainBar: '#6', mainCount: 10, stirrup: '#4', stirrupSpacing: 150, desc: '特殊配置' },
  C6: { mainBar: '#7', mainCount: 12, stirrup: '#4', stirrupSpacing: 125, desc: '大跨距' },
  R1: { mainBar: '#5', mainCount: 6, stirrup: '#3', stirrupSpacing: 150, desc: '室內裝飾' },
  R2: { mainBar: '#5', mainCount: 8, stirrup: '#3', stirrupSpacing: 150, desc: '標準圓柱' },
  R3: { mainBar: '#6', mainCount: 10, stirrup: '#4', stirrupSpacing: 150, desc: '大型圓柱' },
  custom: null,
};

export const BEAM_PRESETS_REBAR = {
  B1: {
    topBar: '#5',
    topCount: 2,
    bottomBar: '#5',
    bottomCount: 2,
    stirrup: '#3',
    stirrupSpacing: 200,
    desc: '次要梁',
  },
  B2: {
    topBar: '#6',
    topCount: 2,
    bottomBar: '#6',
    bottomCount: 3,
    stirrup: '#3',
    stirrupSpacing: 150,
    desc: '主梁',
  },
  B3: {
    topBar: '#6',
    topCount: 3,
    bottomBar: '#6',
    bottomCount: 4,
    stirrup: '#4',
    stirrupSpacing: 150,
    desc: '大跨距',
  },
  B4: {
    topBar: '#7',
    topCount: 3,
    bottomBar: '#7',
    bottomCount: 5,
    stirrup: '#4',
    stirrupSpacing: 125,
    desc: '重載/長跨',
  },
  custom: null,
};

export const SLAB_PRESETS_REBAR = {
  F1: { rebarSize: '#3', spacing: 200, layer: 'single', desc: '陽台/雨遮' },
  F2: { rebarSize: '#4', spacing: 200, layer: 'double', desc: '一般樓板' },
  F3: { rebarSize: '#4', spacing: 150, layer: 'double', desc: '大跨距/重載' },
  F4: { rebarSize: '#5', spacing: 150, layer: 'double', desc: '廠房/倉庫' },
  F5: { rebarSize: '#4', spacing: 200, layer: 'double', desc: '地下室頂板' },
  F6: { rebarSize: '#5', spacing: 150, layer: 'double', desc: '筏式基礎' },
  custom: null,
};
