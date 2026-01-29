/**
 * 室內裝修連工帶料計價資料 v3.1
 * Interior Renovation Labor+Material Pricing Data
 * 17 工種 / 230+ 項目 / 含品牌與認證
 * v3.1: +智慧家居(Aqara/HomeKit) / 擴展木作子分類
 */

// ============ 類型定義 ============

export type TradeId =
    | 'paint' | 'woodwork' | 'partition' | 'ceiling'
    | 'cabinet' | 'kitchen' | 'bathroom' | 'flooring'
    | 'electrical' | 'door_window' | 'glass' | 'curtain'
    | 'demolition' | 'metalwork' | 'hvac' | 'waterproof'
    | 'smart_home';  // v3.1 新增

export interface BrandOption {
    id: string;
    name: string;
    origin: string;
    tier: 'premium' | 'standard' | 'economy';
    priceModifier: number;
}

export interface RenovationItem {
    id: string;
    subcategory: string;
    name: string;
    specs: { id: string; label: string; priceModifier?: number }[];
    unit: string;
    priceMin: number;
    priceMax: number;
    brands?: string[];
    certifications?: string[];
    note?: string;
}

// ============ 工種分類 ============

export const RENOVATION_TRADES = [
    { id: 'paint', label: '油漆工程', icon: 'Paintbrush' },
    { id: 'woodwork', label: '木作工程', icon: 'Hammer' },
    { id: 'partition', label: '輕隔間工程', icon: 'Layers' },
    { id: 'ceiling', label: '天花板工程', icon: 'Grid3X3' },
    { id: 'cabinet', label: '系統櫃工程', icon: 'Package' },
    { id: 'kitchen', label: '廚具工程', icon: 'ChefHat' },
    { id: 'bathroom', label: '衛浴設備', icon: 'Bath' },
    { id: 'flooring', label: '地板工程', icon: 'Layers' },
    { id: 'electrical', label: '水電工程', icon: 'Zap' },
    { id: 'door_window', label: '門窗工程', icon: 'DoorOpen' },
    { id: 'glass', label: '玻璃工程', icon: 'GlassWater' },
    { id: 'curtain', label: '窗簾窗飾', icon: 'Grid3X3' },
    { id: 'demolition', label: '拆除清運', icon: 'Trash2' },
    { id: 'metalwork', label: '鐵件工程', icon: 'Wrench' },
    { id: 'hvac', label: '冷氣空調', icon: 'Snowflake' },
    { id: 'waterproof', label: '防水工程', icon: 'Droplets' },
    { id: 'smart_home', label: '智慧家居', icon: 'Cpu' },  // v3.1 新增
] as const;

// ============ 品牌資料 ============

export const BRANDS: Record<string, BrandOption[]> = {
    paint: [
        { id: 'dulux', name: '得利 Dulux', origin: '荷蘭', tier: 'premium', priceModifier: 1.3 },
        { id: 'nippon', name: '立邦 Nippon', origin: '日本', tier: 'premium', priceModifier: 1.2 },
        { id: 'rainbow', name: '虹牌', origin: '台灣', tier: 'standard', priceModifier: 1.0 },
        { id: 'qingye', name: '青葉', origin: '台灣', tier: 'economy', priceModifier: 0.85 },
    ],
    cabinet: [
        { id: 'egger', name: 'EGGER 愛格', origin: '奧地利', tier: 'premium', priceModifier: 1.4 },
        { id: 'kaindl', name: 'KAINDL', origin: '奧地利', tier: 'premium', priceModifier: 1.35 },
        { id: 'skin', name: 'Skin', origin: '義大利', tier: 'premium', priceModifier: 1.25 },
        { id: 'longland', name: '龍疆', origin: '台灣', tier: 'standard', priceModifier: 1.1 },
        { id: 'jangmei', name: '彰美', origin: '台灣', tier: 'standard', priceModifier: 1.0 },
    ],
    hvac: [
        { id: 'daikin', name: '大金 Daikin', origin: '日本', tier: 'premium', priceModifier: 1.4 },
        { id: 'hitachi', name: '日立 Hitachi', origin: '日本', tier: 'premium', priceModifier: 1.3 },
        { id: 'mitsubishi', name: '三菱', origin: '日本', tier: 'premium', priceModifier: 1.25 },
        { id: 'panasonic', name: 'Panasonic', origin: '日本', tier: 'standard', priceModifier: 1.15 },
        { id: 'lg', name: 'LG', origin: '韓國', tier: 'standard', priceModifier: 1.0 },
        { id: 'heran', name: '禾聯 HERAN', origin: '台灣', tier: 'economy', priceModifier: 0.8 },
    ],
    bathroom: [
        { id: 'toto', name: 'TOTO', origin: '日本', tier: 'premium', priceModifier: 1.5 },
        { id: 'hcg', name: 'HCG 和成', origin: '台灣', tier: 'standard', priceModifier: 1.0 },
        { id: 'caesar', name: '凱撒 CAESAR', origin: '台灣', tier: 'standard', priceModifier: 1.05 },
    ],
    // v3.1 新增
    smart_home: [
        { id: 'aqara', name: 'Aqara', origin: '中國', tier: 'premium', priceModifier: 1.0 },
        { id: 'homekit', name: 'HomeKit 配件', origin: '多國', tier: 'premium', priceModifier: 1.2 },
        { id: 'mijia', name: '米家', origin: '中國', tier: 'economy', priceModifier: 0.8 },
    ],
};

// ============ 認證規範 ============

export const CERTIFICATIONS = {
    'CNS 4940': '水性水泥漆國家標準',
    'CNS F1': '甲醛釋出≤0.3mg/L',
    'CNS F2': '甲醛釋出≤0.5mg/L',
    'CNS F3': '甲醛釋出≤1.5mg/L',
    'E0': '歐盟甲醛標準 (≤0.5mg/L)',
    'E1': '歐盟甲醛標準 (≤1.5mg/L)',
    'FSC': '森林管理認證',
    'Green Guard': '低揮發物認證',
    'CNS 8905': '防水塗膜規範',
    'JIS A 6021': '日本防水標準',
    '綠建材': '內政部低VOC認證',
};

// ============ 項目資料 ============

export const RENOVATION_ITEMS: Record<TradeId, RenovationItem[]> = {
    // 1. 油漆工程
    paint: [
        { id: 'p01', subcategory: '水泥漆', name: '新作面水泥漆', specs: [{ id: 'full', label: '全批土+一底二面' }], unit: '坪', priceMin: 1250, priceMax: 1600, certifications: ['CNS 4940'] },
        { id: 'p02', subcategory: '水泥漆', name: '舊作面水泥漆', specs: [{ id: 'partial', label: '局部批土修補' }], unit: '坪', priceMin: 950, priceMax: 1200, certifications: ['CNS 4940'] },
        { id: 'p03', subcategory: '水泥漆', name: '重新粉刷', specs: [{ id: 'flat', label: '牆面已平整' }], unit: '坪', priceMin: 250, priceMax: 400 },
        { id: 'p04', subcategory: '乳膠漆', name: '新作面乳膠漆', specs: [{ id: 'full', label: '全批土+一底二面' }], unit: '坪', priceMin: 1900, priceMax: 2450, certifications: ['CNS 4940', '綠建材'] },
        { id: 'p05', subcategory: '乳膠漆', name: '舊作面乳膠漆', specs: [{ id: 'partial', label: '局部批土' }], unit: '坪', priceMin: 1450, priceMax: 1800 },
        { id: 'p06', subcategory: '乳膠漆', name: '竹炭乳膠漆', specs: [{ id: 'charcoal', label: '除醛功能' }], unit: '坪', priceMin: 2200, priceMax: 2800, brands: ['dulux'], certifications: ['綠建材'] },
        { id: 'p07', subcategory: '批土處理', name: '批土+研磨一道', specs: [{ id: 'one', label: '一般修補' }], unit: '坪', priceMin: 300, priceMax: 350 },
        { id: 'p08', subcategory: '批土處理', name: '批土+研磨兩道', specs: [{ id: 'two', label: '全面整平' }], unit: '坪', priceMin: 450, priceMax: 500 },
        { id: 'p09', subcategory: '特殊漆', name: '珪藻土', specs: [{ id: 'std', label: '含底漆' }], unit: '坪', priceMin: 2500, priceMax: 4000 },
        { id: 'p10', subcategory: '特殊漆', name: '藝術漆', specs: [{ id: 'concrete', label: '仿清水模' }], unit: '坪', priceMin: 3000, priceMax: 5000 },
    ],
    // 2. 木作工程
    woodwork: [
        { id: 'w01', subcategory: '天花板', name: '平頂天花板', specs: [{ id: 'calcium', label: '矽酸鈣板' }, { id: 'gypsum', label: '石膏板', priceModifier: 0.9 }], unit: '坪', priceMin: 3200, priceMax: 4500 },
        { id: 'w02', subcategory: '天花板', name: '間接照明', specs: [{ id: 'single', label: '單層燈槽' }, { id: 'double', label: '雙層燈槽', priceModifier: 1.3 }], unit: '尺', priceMin: 800, priceMax: 1200 },
        { id: 'w03', subcategory: '天花板', name: '造型天花板', specs: [{ id: 'arc', label: '弧形' }, { id: 'wave', label: '波浪' }], unit: '坪', priceMin: 5000, priceMax: 6500 },
        { id: 'w04', subcategory: '隔間牆', name: '木作隔間牆', specs: [{ id: 'std', label: '雙面封板+隔音棉' }], unit: '坪', priceMin: 3500, priceMax: 5000 },
        { id: 'w05', subcategory: '門框門片', name: '木門框', specs: [{ id: 'solid', label: '實木' }, { id: 'glulam', label: '集成材', priceModifier: 0.85 }], unit: '尺', priceMin: 3000, priceMax: 4000 },
        { id: 'w06', subcategory: '門框門片', name: '木門片', specs: [{ id: 'hollow', label: '空心門' }, { id: 'solid', label: '實心門', priceModifier: 1.4 }, { id: 'fire', label: '防火門', priceModifier: 1.8 }], unit: '片', priceMin: 6000, priceMax: 10000 },
        { id: 'w07', subcategory: '其他', name: '踢腳板', specs: [{ id: '8cm', label: '8cm高' }, { id: '10cm', label: '10cm高' }, { id: '12cm', label: '12cm高' }], unit: '尺', priceMin: 120, priceMax: 200 },
        { id: 'w08', subcategory: '其他', name: '窗簾盒', specs: [{ id: 'std', label: '標準' }], unit: '尺', priceMin: 400, priceMax: 600 },
    ],
    // 3. 輕隔間工程
    partition: [
        { id: 'pt01', subcategory: 'C65經濟型', name: 'C65石膏板', specs: [{ id: 'double', label: '雙面封板' }], unit: 'm²', priceMin: 1600, priceMax: 1800, note: '完成厚8.5cm' },
        { id: 'pt02', subcategory: 'C65經濟型', name: 'C65矽酸鈣板', specs: [{ id: '24k', label: '+24K隔音棉' }], unit: 'm²', priceMin: 1800, priceMax: 2200, note: 'STC~46' },
        { id: 'pt03', subcategory: 'C75標準型', name: 'C75矽酸鈣板', specs: [{ id: '24k', label: '+24K棉' }, { id: '48k', label: '+48K棉', priceModifier: 1.15 }], unit: 'm²', priceMin: 2000, priceMax: 2800, note: 'STC~48-50' },
        { id: 'pt04', subcategory: 'C92高規格', name: 'C92岩棉', specs: [{ id: 'rockwool', label: '岩棉' }], unit: 'm²', priceMin: 3200, priceMax: 3800, note: 'STC~52' },
        { id: 'pt05', subcategory: 'C92高規格', name: 'C92雙層板', specs: [{ id: 'double', label: '雙層矽酸鈣' }], unit: 'm²', priceMin: 4200, priceMax: 5000, note: 'STC~56' },
        { id: 'pt06', subcategory: '配件', name: '門框補強', specs: [{ id: 'std', label: '含立柱+橫樑' }], unit: '組', priceMin: 800, priceMax: 1200 },
    ],
    // 4. 天花板工程
    ceiling: [
        { id: 'c01', subcategory: '明架', name: '明架天花板', specs: [{ id: 'gypsum', label: '石膏板' }, { id: 'mineral', label: '礦纖板', priceModifier: 1.15 }], unit: '坪', priceMin: 1200, priceMax: 1600 },
        { id: 'c02', subcategory: '暗架', name: '暗架天花板', specs: [{ id: 'calcium', label: '矽酸鈣板' }], unit: '坪', priceMin: 1600, priceMax: 1800 },
        { id: 'c03', subcategory: '配件', name: '維修孔', specs: [{ id: '60x60', label: '60×60cm' }], unit: '組', priceMin: 450, priceMax: 600 },
        { id: 'c04', subcategory: '配件', name: '崁燈開孔', specs: [{ id: 'std', label: '含補強' }], unit: '孔', priceMin: 100, priceMax: 150 },
    ],
    // 5. 系統櫃工程
    cabinet: [
        { id: 'cb01', subcategory: '衣櫃', name: '基本款衣櫃', specs: [{ id: 'f2', label: '國產F2板' }], unit: '尺', priceMin: 8000, priceMax: 10000, certifications: ['CNS F2'] },
        { id: 'cb02', subcategory: '衣櫃', name: '中階款衣櫃', specs: [{ id: 'f1', label: '國產F1+進口五金' }], unit: '尺', priceMin: 10000, priceMax: 12000, certifications: ['CNS F1'] },
        { id: 'cb03', subcategory: '衣櫃', name: '高階款衣櫃', specs: [{ id: 'e0', label: '進口E0板' }], unit: '尺', priceMin: 12000, priceMax: 15000, brands: ['egger', 'kaindl'], certifications: ['E0', 'FSC'] },
        { id: 'cb04', subcategory: '收納櫃', name: '書櫃', specs: [{ id: 'open', label: '開放式' }, { id: 'glass', label: '玻璃門', priceModifier: 1.2 }], unit: '尺', priceMin: 6000, priceMax: 10000 },
        { id: 'cb05', subcategory: '收納櫃', name: '電視櫃', specs: [{ id: 'floating', label: '懸吊' }, { id: 'floor', label: '落地' }], unit: '尺', priceMin: 7000, priceMax: 11000 },
        { id: 'cb06', subcategory: '五金', name: '緩衝鉸鏈', specs: [{ id: 'local', label: '國產' }, { id: 'blum', label: 'Blum', priceModifier: 2 }], unit: '組', priceMin: 150, priceMax: 500 },
    ],
    // 6. 廚具工程
    kitchen: [
        { id: 'k01', subcategory: '系統廚具', name: '一字型廚具', specs: [{ id: '200', label: '200~300cm' }], unit: '組', priceMin: 50000, priceMax: 80000 },
        { id: 'k02', subcategory: '系統廚具', name: 'L型廚具', specs: [{ id: 'std', label: '標準' }], unit: '組', priceMin: 80000, priceMax: 120000 },
        { id: 'k03', subcategory: '中島', name: '基本中島', specs: [{ id: 'storage', label: '收納用' }], unit: '尺', priceMin: 4000, priceMax: 6000 },
        { id: 'k04', subcategory: '檯面', name: '人造石檯面', specs: [{ id: 'std', label: '標準厚度' }], unit: '公分', priceMin: 80, priceMax: 120 },
        { id: 'k05', subcategory: '廚房三機', name: '經濟套裝', specs: [{ id: 'local', label: '國產品牌' }], unit: '組', priceMin: 15000, priceMax: 25000 },
        { id: 'k06', subcategory: '廚房三機', name: '高階套裝', specs: [{ id: 'import', label: '進口品牌' }], unit: '組', priceMin: 80000, priceMax: 120000 },
    ],
    // 7. 衛浴設備
    bathroom: [
        { id: 'b01', subcategory: '馬桶', name: '馬桶安裝', specs: [{ id: 'single', label: '單體馬桶' }, { id: 'sep', label: '分離式', priceModifier: 1.2 }], unit: '組', priceMin: 1500, priceMax: 3000, note: '純工資' },
        { id: 'b02', subcategory: '馬桶', name: '糞管移位', specs: [{ id: 'std', label: '標準' }], unit: '處', priceMin: 6000, priceMax: 10000 },
        { id: 'b03', subcategory: '洗手台', name: '洗手台安裝', specs: [{ id: 'wall', label: '壁掛式' }, { id: 'counter', label: '檯面式', priceModifier: 1.5 }], unit: '組', priceMin: 1000, priceMax: 3000, note: '純工資' },
        { id: 'b04', subcategory: '淋浴設備', name: '淋浴拉門', specs: [{ id: 'inline', label: '一字型' }, { id: 'l', label: 'L型', priceModifier: 1.4 }], unit: '組', priceMin: 12000, priceMax: 25000 },
        { id: 'b05', subcategory: '套組', name: '標準三件套', specs: [{ id: 'std', label: '馬桶+洗手台+龍頭' }], unit: '組', priceMin: 30000, priceMax: 45000 },
    ],
    // 8. 地板工程
    flooring: [
        { id: 'f01', subcategory: '木地板', name: '超耐磨地板', specs: [{ id: '8mm', label: '8mm' }, { id: '12mm', label: '12mm', priceModifier: 1.3 }], unit: '坪', priceMin: 2500, priceMax: 4500 },
        { id: 'f02', subcategory: '木地板', name: 'SPC石塑地板', specs: [{ id: '4mm', label: '4mm' }, { id: '5mm', label: '5mm', priceModifier: 1.15 }], unit: '坪', priceMin: 2200, priceMax: 3800 },
        { id: 'f03', subcategory: '木地板', name: '海島型木地板', specs: [{ id: 'veneer', label: '實木皮' }], unit: '坪', priceMin: 4500, priceMax: 8000 },
        { id: 'f04', subcategory: '木地板', name: '實木地板', specs: [{ id: 'teak', label: '柚木' }, { id: 'oak', label: '橡木' }, { id: 'walnut', label: '胡桃', priceModifier: 1.3 }], unit: '坪', priceMin: 8000, priceMax: 15000 },
        { id: 'f05', subcategory: '收邊', name: '踢腳板', specs: [{ id: 'plastic', label: '塑膠' }, { id: 'wood', label: '實木', priceModifier: 1.5 }], unit: '尺', priceMin: 100, priceMax: 250 },
    ],
    // 9. 水電工程
    electrical: [
        { id: 'e01', subcategory: '電路', name: '110V迴路', specs: [{ id: 'std', label: '標準' }], unit: '迴', priceMin: 2500, priceMax: 3500 },
        { id: 'e02', subcategory: '電路', name: '220V迴路', specs: [{ id: 'ac', label: '冷氣用' }], unit: '迴', priceMin: 3500, priceMax: 5500 },
        { id: 'e03', subcategory: '插座開關', name: '新增插座', specs: [{ id: 'old', label: '舊迴路' }, { id: 'new', label: '新迴路', priceModifier: 1.3 }], unit: '個', priceMin: 2000, priceMax: 4500 },
        { id: 'e04', subcategory: '給排水', name: '熱水管重拉', specs: [{ id: 'ppr', label: 'PPR管' }], unit: '處', priceMin: 4000, priceMax: 6500 },
        { id: 'e05', subcategory: '給排水', name: '排水管重拉', specs: [{ id: 'pvc', label: 'PVC管' }], unit: '處', priceMin: 1500, priceMax: 3000 },
        { id: 'e06', subcategory: '配電', name: '配電箱安裝', specs: [{ id: 'std', label: '標準' }], unit: '組', priceMin: 12000, priceMax: 16000 },
    ],
    // 10. 門窗工程
    door_window: [
        { id: 'd01', subcategory: '鋁窗', name: '傳統鋁窗', specs: [{ id: 'std', label: '標準' }], unit: '才', priceMin: 300, priceMax: 450 },
        { id: 'd02', subcategory: '鋁窗', name: '氣密窗', specs: [{ id: 'std', label: '標準' }], unit: '才', priceMin: 500, priceMax: 1000 },
        { id: 'd03', subcategory: '鋁窗', name: '隔音窗', specs: [{ id: 'std', label: '標準' }], unit: '才', priceMin: 600, priceMax: 1200 },
        { id: 'd04', subcategory: '門片', name: '浴室鋁門', specs: [{ id: 'glass', label: '白膜玻璃' }], unit: '組', priceMin: 14000, priceMax: 17500 },
        { id: 'd05', subcategory: '門片', name: '玄關單片門', specs: [{ id: 'std', label: '標準' }], unit: '樘', priceMin: 37000, priceMax: 47000 },
        { id: 'd06', subcategory: '門片', name: '玄關子母門', specs: [{ id: 'std', label: '標準' }, { id: 'ss', label: '不鏽鋼', priceModifier: 1.3 }], unit: '樘', priceMin: 50000, priceMax: 85000 },
    ],
    // 11. 玻璃工程
    glass: [
        { id: 'g01', subcategory: '平板玻璃', name: '清玻/茶玻', specs: [{ id: '5mm', label: '5mm' }, { id: '8mm', label: '8mm', priceModifier: 1.3 }, { id: '10mm', label: '10mm', priceModifier: 1.6 }], unit: '才', priceMin: 120, priceMax: 200 },
        { id: 'g02', subcategory: '平板玻璃', name: '強化玻璃', specs: [{ id: '8mm', label: '8mm' }, { id: '10mm', label: '10mm', priceModifier: 1.2 }], unit: '才', priceMin: 180, priceMax: 300 },
        { id: 'g03', subcategory: '鏡面', name: '銀鏡', specs: [{ id: 'std', label: '標準' }], unit: '才', priceMin: 150, priceMax: 200 },
        { id: 'g04', subcategory: '玻璃工程', name: '玻璃隔間', specs: [{ id: 'framed', label: '框架式' }, { id: 'frameless', label: '無框式', priceModifier: 1.3 }], unit: 'm²', priceMin: 3500, priceMax: 6500 },
    ],
    // 12. 窗簾窗飾
    curtain: [
        { id: 'ct01', subcategory: '窗簾', name: '布簾', specs: [{ id: 'blackout', label: '遮光' }, { id: 'sheer', label: '紗簾', priceModifier: 0.6 }], unit: '尺(寬)', priceMin: 200, priceMax: 600 },
        { id: 'ct02', subcategory: '窗簾', name: '捲簾', specs: [{ id: 'pull', label: '手拉' }, { id: 'electric', label: '電動', priceModifier: 2 }], unit: '才', priceMin: 60, priceMax: 200 },
        { id: 'ct03', subcategory: '窗簾', name: '百葉窗', specs: [{ id: 'al', label: '鋁製' }, { id: 'wood', label: '木製', priceModifier: 1.8 }], unit: '才', priceMin: 80, priceMax: 200 },
        { id: 'ct04', subcategory: '軌道', name: '窗簾盒', specs: [{ id: 'single', label: '單軌' }, { id: 'double', label: '雙軌', priceModifier: 1.5 }], unit: '尺', priceMin: 150, priceMax: 350 },
    ],
    // 13. 拆除清運
    demolition: [
        { id: 'dm01', subcategory: '牆面拆除', name: '磚牆拆除', specs: [{ id: 'half', label: '半B牆' }, { id: 'full', label: '1B牆', priceModifier: 1.5 }], unit: '坪', priceMin: 500, priceMax: 1200 },
        { id: 'dm02', subcategory: '牆面拆除', name: '輕隔間拆除', specs: [{ id: 'std', label: '標準' }], unit: '坪', priceMin: 300, priceMax: 500 },
        { id: 'dm03', subcategory: '地面拆除', name: '磁磚拆除', specs: [{ id: 'tile', label: '不含打底' }, { id: 'base', label: '含打底', priceModifier: 1.8 }], unit: '坪', priceMin: 400, priceMax: 1200 },
        { id: 'dm04', subcategory: '整體拆除', name: '廚房全拆', specs: [{ id: 'std', label: '含清運' }], unit: '間', priceMin: 30000, priceMax: 50000 },
        { id: 'dm05', subcategory: '整體拆除', name: '衛浴全拆', specs: [{ id: 'std', label: '含清運' }], unit: '間', priceMin: 12000, priceMax: 20000 },
        { id: 'dm06', subcategory: '清運', name: '廢棄物清運', specs: [{ id: '3.5t', label: '3.5噸車' }], unit: '車', priceMin: 10000, priceMax: 15000 },
    ],
    // 14. 鐵件工程
    metalwork: [
        { id: 'm01', subcategory: '扶手', name: '不鏽鋼扶手', specs: [{ id: '304', label: '304' }, { id: '316', label: '316', priceModifier: 1.3 }], unit: '公尺', priceMin: 2500, priceMax: 5000 },
        { id: 'm02', subcategory: '欄杆', name: '不鏽鋼欄杆', specs: [{ id: '304', label: '304' }], unit: '公尺', priceMin: 3000, priceMax: 5000 },
        { id: 'm03', subcategory: '欄杆', name: '玻璃欄杆', specs: [{ id: 'tempered', label: '強化玻璃' }], unit: '公尺', priceMin: 6000, priceMax: 10000 },
        { id: 'm04', subcategory: '雨遮', name: '不鏽鋼雨遮', specs: [{ id: 'pc', label: 'PC板' }, { id: 'glass', label: '玻璃', priceModifier: 1.3 }], unit: '才', priceMin: 500, priceMax: 1200 },
    ],
    // 15. 冷氣空調
    hvac: [
        { id: 'h01', subcategory: '窗型', name: '窗型冷氣安裝', specs: [{ id: 'labor', label: '純工資' }], unit: '台', priceMin: 1200, priceMax: 2500 },
        { id: 'h02', subcategory: '分離式', name: '一對一安裝', specs: [{ id: 'labor', label: '純工資' }], unit: '台', priceMin: 3500, priceMax: 6000 },
        { id: 'h03', subcategory: '分離式', name: '一對一連工帶料', specs: [{ id: 'full', label: '含機器' }], unit: '台', priceMin: 25000, priceMax: 45000 },
        { id: 'h04', subcategory: '配管', name: '冷媒管延長', specs: [{ id: 'std', label: '標準' }], unit: '公尺', priceMin: 300, priceMax: 600 },
        { id: 'h05', subcategory: '配管', name: '室外機架', specs: [{ id: 'ss', label: '不鏽鋼' }], unit: '組', priceMin: 1200, priceMax: 3000 },
        { id: 'h06', subcategory: '迴路', name: '220V專用迴路', specs: [{ id: 'open', label: '明管' }, { id: 'hidden', label: '暗管', priceModifier: 1.3 }], unit: '迴', priceMin: 3500, priceMax: 6500 },
    ],
    // 16. 防水工程
    waterproof: [
        { id: 'wp01', subcategory: '浴室', name: '防水漆', specs: [{ id: 'two', label: '兩道' }], unit: '坪', priceMin: 600, priceMax: 1200 },
        { id: 'wp02', subcategory: '浴室', name: '彈性水泥', specs: [{ id: 'std', label: '含底漆' }], unit: '坪', priceMin: 1500, priceMax: 2500, certifications: ['CNS 8905'] },
        { id: 'wp03', subcategory: '浴室', name: 'PU防水', specs: [{ id: 'std', label: '標準厚度' }], unit: '坪', priceMin: 2000, priceMax: 3000, certifications: ['JIS A 6021'] },
        { id: 'wp04', subcategory: '屋頂', name: '聚脲防水', specs: [{ id: 'high', label: '高強度' }], unit: '坪', priceMin: 3000, priceMax: 5000 },
        { id: 'wp05', subcategory: '屋頂', name: '防水毯', specs: [{ id: 'premium', label: '最高規' }], unit: '坪', priceMin: 10000, priceMax: 15000 },
        { id: 'wp06', subcategory: '外牆', name: '外牆防水', specs: [{ id: 'paint', label: '防水漆' }, { id: 'cement', label: '彈性水泥', priceModifier: 2 }], unit: '坪', priceMin: 600, priceMax: 4000 },
    ],
    // 17. 智慧家居 (v3.1 新增 - 爬蟲同步資料)
    smart_home: [
        { id: 'sh01', subcategory: '中樞網關', name: 'Aqara M2 網關', specs: [{ id: 'homekit', label: 'HomeKit/Matter' }], unit: '組', priceMin: 2500, priceMax: 3000, brands: ['aqara'] },
        { id: 'sh02', subcategory: '中樞網關', name: 'G2H Pro 攝影機網關', specs: [{ id: 'camera', label: '含攝影功能' }], unit: '組', priceMin: 3500, priceMax: 4000, brands: ['aqara'] },
        { id: 'sh03', subcategory: '感測器', name: '門窗感測器', specs: [{ id: 'intl', label: '國際版' }], unit: '個', priceMin: 315, priceMax: 629, brands: ['aqara'] },
        { id: 'sh04', subcategory: '感測器', name: '溫濕度感測器', specs: [{ id: 'intl', label: '國際版' }], unit: '個', priceMin: 365, priceMax: 669, brands: ['aqara'] },
        { id: 'sh05', subcategory: '感測器', name: '人體移動感測器', specs: [{ id: 'p1', label: 'P1' }, { id: 'p2', label: 'P2', priceModifier: 1.2 }], unit: '個', priceMin: 375, priceMax: 1575, brands: ['aqara'] },
        { id: 'sh06', subcategory: '感測器', name: 'FP2 人體存在感測器', specs: [{ id: 'mmwave', label: '毫米波' }], unit: '個', priceMin: 2720, priceMax: 2990, brands: ['aqara'], note: '直連HomeKit' },
        { id: 'sh07', subcategory: '感測器', name: '煙霧偵測器', specs: [{ id: 'homekit', label: 'HomeKit' }], unit: '個', priceMin: 1520, priceMax: 1600, brands: ['aqara'] },
        { id: 'sh08', subcategory: '感測器', name: '水浸感測器', specs: [{ id: 'std', label: '標準' }], unit: '個', priceMin: 399, priceMax: 500, brands: ['aqara'] },
        { id: 'sh09', subcategory: '智慧開關', name: '智能開關 H2 雙鍵', specs: [{ id: 'tw', label: '台灣規格/HomeKit' }], unit: '個', priceMin: 1800, priceMax: 1900, brands: ['aqara'] },
        { id: 'sh10', subcategory: '智慧開關', name: '智能開關 H2 四鍵', specs: [{ id: 'tw', label: '台灣規格/HomeKit' }], unit: '個', priceMin: 2090, priceMax: 2200, brands: ['aqara'] },
        { id: 'sh11', subcategory: '智慧開關', name: '智慧插座', specs: [{ id: 'tw', label: '台灣版/HomeKit' }], unit: '個', priceMin: 855, priceMax: 950, brands: ['aqara'] },
        { id: 'sh12', subcategory: '智慧門鎖', name: 'A100 智能門鎖', specs: [{ id: 'homekit', label: '9種解鎖/HomeKit' }], unit: '組', priceMin: 13599, priceMax: 22000, brands: ['aqara'], note: '含基本安裝' },
        { id: 'sh13', subcategory: '智慧門鎖', name: 'D100 智能門鎖', specs: [{ id: 'finger', label: '指紋/密碼/NFC' }], unit: '組', priceMin: 14999, priceMax: 20999, brands: ['aqara'] },
        { id: 'sh14', subcategory: '智慧門鎖', name: 'D200i 人臉門鎖', specs: [{ id: 'face', label: '人臉辨識/HomeKit' }], unit: '組', priceMin: 23999, priceMax: 25000, brands: ['aqara'] },
        { id: 'sh15', subcategory: '窗簾電機', name: 'E1 窗簾驅動器', specs: [{ id: 'track', label: '軌道版' }, { id: 'rod', label: '羅馬框版', priceModifier: 1.1 }], unit: '組', priceMin: 2999, priceMax: 3399, brands: ['aqara'] },
        { id: 'sh16', subcategory: '窗簾電機', name: 'E1 捲簾機', specs: [{ id: 'std', label: '標準' }], unit: '組', priceMin: 2300, priceMax: 2500, brands: ['aqara'] },
        { id: 'sh17', subcategory: '窗簾電機', name: '智能窗簾電機 C3', specs: [{ id: 'zigbee', label: 'Zigbee' }], unit: '組', priceMin: 4400, priceMax: 4600, brands: ['aqara'] },
        { id: 'sh18', subcategory: '窗簾電機', name: '窗簾軌道', specs: [{ id: 'custom', label: '訂製長度' }], unit: '公尺', priceMin: 800, priceMax: 1500 },
        { id: 'sh19', subcategory: '情境套組', name: '入門套組', specs: [{ id: 'basic', label: '網關+3感測器+2開關' }], unit: '組', priceMin: 8000, priceMax: 12000 },
        { id: 'sh20', subcategory: '情境套組', name: '標準套組', specs: [{ id: 'std', label: '+門鎖+窗簾電機' }], unit: '組', priceMin: 35000, priceMax: 50000 },
        { id: 'sh21', subcategory: '情境套組', name: '全屋整合', specs: [{ id: 'full', label: '全室情境控制' }], unit: '式', priceMin: 100000, priceMax: 300000 },
    ],
};

// ============ 工具函數 ============

export function getTradeItems(tradeId: TradeId): RenovationItem[] {
    return RENOVATION_ITEMS[tradeId] || [];
}

export function getSubcategories(tradeId: TradeId): string[] {
    const items = RENOVATION_ITEMS[tradeId] || [];
    return [...new Set(items.map(item => item.subcategory))];
}

export function calculatePrice(
    item: RenovationItem,
    specId: string,
    quantity: number,
    brandModifier = 1
): { min: number; max: number; avg: number } {
    const spec = item.specs.find(s => s.id === specId);
    const modifier = (spec?.priceModifier ?? 1) * brandModifier;
    const min = item.priceMin * modifier * quantity;
    const max = item.priceMax * modifier * quantity;
    return { min, max, avg: (min + max) / 2 };
}
