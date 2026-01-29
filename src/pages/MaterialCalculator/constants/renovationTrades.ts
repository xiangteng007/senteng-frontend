/**
 * 室內裝修連工帶料計價資料
 * Interior Renovation Labor+Material Pricing Data
 */

// 工種分類
export const RENOVATION_TRADES = [
    { id: 'paint', label: '油漆工程', icon: 'Paintbrush' },
    { id: 'woodwork', label: '木作工程', icon: 'Hammer' },
    { id: 'partition', label: '輕隔間工程', icon: 'Layers' },
    { id: 'ceiling', label: '天花板工程', icon: 'Grid3X3' },
    { id: 'cabinet', label: '系統櫃工程', icon: 'Package' },
    { id: 'flooring', label: '地板工程', icon: 'Layers' },
    { id: 'electrical', label: '水電工程', icon: 'Zap' },
    { id: 'glass', label: '玻璃工程', icon: 'GlassWater' },
    { id: 'curtain', label: '窗簾窗飾', icon: 'Grid3X3' },
    { id: 'cleaning', label: '清潔保護', icon: 'Sparkles' },
] as const;

export type TradeId = typeof RENOVATION_TRADES[number]['id'];

// 連工帶料項目類型
export interface RenovationItem {
    id: string;
    name: string;
    specs: { id: string; label: string; priceModifier?: number }[];
    unit: string;
    priceMin: number;
    priceMax: number;
    note?: string;
}

// 各工種連工帶料項目資料
export const RENOVATION_ITEMS: Record<TradeId, RenovationItem[]> = {
    // 1. 油漆工程
    paint: [
        {
            id: 'paint-latex',
            name: '乳膠漆',
            specs: [
                { id: 'matte', label: '平光' },
                { id: 'satin', label: '半光', priceModifier: 1.1 },
                { id: 'gloss', label: '亮光', priceModifier: 1.2 },
            ],
            unit: '坪',
            priceMin: 350,
            priceMax: 550,
            note: '含批土打底+底漆+面漆2道',
        },
        {
            id: 'paint-enamel',
            name: '調和漆',
            specs: [
                { id: 'white', label: '白色' },
                { id: 'color', label: '調色', priceModifier: 1.15 },
            ],
            unit: '坪',
            priceMin: 400,
            priceMax: 600,
        },
        {
            id: 'paint-cement',
            name: '水泥漆',
            specs: [
                { id: 'indoor', label: '室內' },
                { id: 'outdoor', label: '室外', priceModifier: 1.3 },
            ],
            unit: '坪',
            priceMin: 250,
            priceMax: 400,
        },
        {
            id: 'paint-wood-oil',
            name: '護木油/護木漆',
            specs: [
                { id: 'clear', label: '透明' },
                { id: 'tinted', label: '有色', priceModifier: 1.1 },
            ],
            unit: '坪',
            priceMin: 600,
            priceMax: 900,
        },
        {
            id: 'paint-baking',
            name: '烤漆',
            specs: [
                { id: 'auto', label: '汽車烤漆' },
                { id: 'industrial', label: '工業烤漆', priceModifier: 1.2 },
            ],
            unit: '坪',
            priceMin: 800,
            priceMax: 1500,
        },
        {
            id: 'paint-putty',
            name: '批土處理',
            specs: [
                { id: 'fine', label: '細批' },
                { id: 'medium', label: '中批', priceModifier: 1.2 },
                { id: 'rough', label: '粗批', priceModifier: 1.4 },
            ],
            unit: '坪',
            priceMin: 200,
            priceMax: 400,
        },
        {
            id: 'paint-primer',
            name: '底漆處理',
            specs: [
                { id: 'waterproof', label: '防水' },
                { id: 'alkali', label: '抗鹼', priceModifier: 1.1 },
            ],
            unit: '坪',
            priceMin: 150,
            priceMax: 250,
        },
    ],

    // 2. 木作工程
    woodwork: [
        {
            id: 'wood-ceiling-flat',
            name: '天花板平頂',
            specs: [
                { id: 'calcium', label: '矽酸鈣板' },
                { id: 'gypsum', label: '石膏板', priceModifier: 0.9 },
            ],
            unit: '坪',
            priceMin: 1600,
            priceMax: 2200,
        },
        {
            id: 'wood-ceiling-cove',
            name: '天花板間接照明',
            specs: [
                { id: 'single', label: '單層燈槽' },
                { id: 'double', label: '雙層燈槽', priceModifier: 1.3 },
            ],
            unit: '尺',
            priceMin: 800,
            priceMax: 1200,
        },
        {
            id: 'wood-ceiling-shape',
            name: '造型天花',
            specs: [
                { id: 'arc', label: '弧形' },
                { id: 'wave', label: '波浪', priceModifier: 1.2 },
                { id: 'step', label: '跌級', priceModifier: 0.8 },
            ],
            unit: '坪',
            priceMin: 3500,
            priceMax: 6500,
        },
        {
            id: 'wood-partition',
            name: '木作隔間',
            specs: [
                { id: 'standard', label: '雙面封板+隔音棉' },
                { id: 'soundproof', label: '加強隔音', priceModifier: 1.3 },
            ],
            unit: '坪',
            priceMin: 2800,
            priceMax: 4000,
        },
        {
            id: 'wood-door-frame',
            name: '木門框',
            specs: [
                { id: 'solid', label: '實木' },
                { id: 'glulam', label: '集成材', priceModifier: 0.85 },
            ],
            unit: '樘',
            priceMin: 4500,
            priceMax: 8000,
        },
        {
            id: 'wood-door-panel',
            name: '木門片',
            specs: [
                { id: 'hollow', label: '空心門' },
                { id: 'solid', label: '實心門', priceModifier: 1.5 },
                { id: 'fire', label: '防火門', priceModifier: 2.0 },
            ],
            unit: '片',
            priceMin: 3500,
            priceMax: 12000,
        },
        {
            id: 'wood-window-trim',
            name: '窗框包框',
            specs: [
                { id: 'standard', label: '含窗台板' },
            ],
            unit: '尺',
            priceMin: 450,
            priceMax: 700,
        },
        {
            id: 'wood-baseboard',
            name: '踢腳板',
            specs: [
                { id: '8cm', label: '8cm高' },
                { id: '10cm', label: '10cm高', priceModifier: 1.1 },
                { id: '12cm', label: '12cm高', priceModifier: 1.2 },
            ],
            unit: '尺',
            priceMin: 120,
            priceMax: 200,
        },
        {
            id: 'wood-cabinet',
            name: '木作櫃體',
            specs: [
                { id: 'open', label: '開放式' },
                { id: 'door', label: '門片式', priceModifier: 1.2 },
                { id: 'drawer', label: '抽屜式', priceModifier: 1.4 },
            ],
            unit: '尺',
            priceMin: 4500,
            priceMax: 8000,
        },
        {
            id: 'wood-floor-trim',
            name: '木地板收邊',
            specs: [
                { id: 'press', label: '壓條' },
                { id: 'edge', label: '收邊條', priceModifier: 1.1 },
            ],
            unit: '尺',
            priceMin: 80,
            priceMax: 150,
        },
    ],

    // 3. 輕隔間工程
    partition: [
        {
            id: 'partition-c65-eco',
            name: 'C65 經濟型',
            specs: [
                { id: 'gypsum', label: '石膏板' },
                { id: 'calcium', label: '矽酸鈣板', priceModifier: 1.15 },
            ],
            unit: 'm²',
            priceMin: 1400,
            priceMax: 1800,
            note: '完成厚8.5cm',
        },
        {
            id: 'partition-c65-std',
            name: 'C65 標準型',
            specs: [
                { id: '24k', label: '+24K隔音棉' },
                { id: '48k', label: '+48K高密度棉', priceModifier: 1.2 },
            ],
            unit: 'm²',
            priceMin: 1800,
            priceMax: 2200,
            note: '完成厚8.5cm/STC~46',
        },
        {
            id: 'partition-c75-std',
            name: 'C75 標準型',
            specs: [
                { id: 'calcium', label: '矽酸鈣板+隔音棉' },
            ],
            unit: 'm²',
            priceMin: 2000,
            priceMax: 2400,
            note: '完成厚9.5cm/STC~48',
        },
        {
            id: 'partition-c75-hi',
            name: 'C75 高隔音',
            specs: [
                { id: '48k', label: '+48K高密度棉' },
            ],
            unit: 'm²',
            priceMin: 2400,
            priceMax: 2800,
            note: '完成厚9.5cm/STC~50',
        },
        {
            id: 'partition-c92',
            name: 'C92 高規格',
            specs: [
                { id: 'rockwool', label: '岩棉' },
                { id: 'double', label: '雙層板', priceModifier: 1.4 },
            ],
            unit: 'm²',
            priceMin: 2400,
            priceMax: 4200,
            note: '完成厚11cm/STC~52-56',
        },
        {
            id: 'partition-c100',
            name: 'C100 超高型',
            specs: [
                { id: 'standard', label: '高度>4M專用' },
            ],
            unit: 'm²',
            priceMin: 2800,
            priceMax: 3600,
            note: '完成厚12cm',
        },
        {
            id: 'partition-door-frame',
            name: '門框補強',
            specs: [
                { id: 'standard', label: '含立柱+橫樑' },
            ],
            unit: '組',
            priceMin: 800,
            priceMax: 1200,
        },
        {
            id: 'partition-sound-blanket',
            name: '隔音毯加強',
            specs: [
                { id: '2mm', label: '2mm厚' },
            ],
            unit: 'm²',
            priceMin: 180,
            priceMax: 250,
            note: 'STC+3~5',
        },
    ],

    // 4. 天花板工程
    ceiling: [
        {
            id: 'ceiling-exposed',
            name: '明架天花板',
            specs: [
                { id: 'gypsum', label: '石膏板' },
                { id: 'mineral', label: '礦纖板', priceModifier: 1.15 },
            ],
            unit: '坪',
            priceMin: 1200,
            priceMax: 1400,
        },
        {
            id: 'ceiling-concealed',
            name: '暗架天花板',
            specs: [
                { id: 'gypsum', label: '石膏板' },
                { id: 'calcium', label: '矽酸鈣板', priceModifier: 1.12 },
            ],
            unit: '坪',
            priceMin: 1600,
            priceMax: 1800,
        },
        {
            id: 'ceiling-pvc',
            name: 'PVC天花板',
            specs: [
                { id: 'white', label: '白色' },
                { id: 'wood', label: '木紋', priceModifier: 1.2 },
            ],
            unit: '坪',
            priceMin: 1200,
            priceMax: 1600,
        },
        {
            id: 'ceiling-access',
            name: '維修孔',
            specs: [
                { id: '60x60', label: '60×60cm' },
            ],
            unit: '組',
            priceMin: 450,
            priceMax: 600,
        },
        {
            id: 'ceiling-downlight',
            name: '崁燈開孔',
            specs: [
                { id: 'standard', label: '含補強' },
            ],
            unit: '孔',
            priceMin: 100,
            priceMax: 150,
        },
        {
            id: 'ceiling-fan-mount',
            name: '吊扇座補強',
            specs: [
                { id: 'steel', label: '鋼構補強' },
            ],
            unit: '組',
            priceMin: 500,
            priceMax: 800,
        },
    ],

    // 5. 系統櫃工程
    cabinet: [
        {
            id: 'cabinet-wardrobe',
            name: '衣櫃',
            specs: [
                { id: 'sliding', label: '推門' },
                { id: 'pull', label: '拉門', priceModifier: 1.1 },
                { id: 'swing', label: '開門', priceModifier: 0.95 },
            ],
            unit: '尺',
            priceMin: 3800,
            priceMax: 6500,
        },
        {
            id: 'cabinet-tv',
            name: '電視櫃',
            specs: [
                { id: 'floating', label: '懸吊' },
                { id: 'floor', label: '落地', priceModifier: 0.9 },
            ],
            unit: '尺',
            priceMin: 3500,
            priceMax: 5500,
        },
        {
            id: 'cabinet-book',
            name: '書櫃',
            specs: [
                { id: 'open', label: '開放式' },
                { id: 'glass', label: '玻璃門', priceModifier: 1.2 },
            ],
            unit: '尺',
            priceMin: 3000,
            priceMax: 5000,
        },
        {
            id: 'cabinet-shoe',
            name: '鞋櫃',
            specs: [
                { id: 'vent', label: '通風式' },
                { id: 'closed', label: '封閉式', priceModifier: 1.05 },
            ],
            unit: '尺',
            priceMin: 3200,
            priceMax: 5000,
        },
        {
            id: 'cabinet-kitchen-top',
            name: '廚房上櫃',
            specs: [
                { id: 'standard', label: '標準60cm深' },
            ],
            unit: '尺',
            priceMin: 3500,
            priceMax: 5500,
        },
        {
            id: 'cabinet-kitchen-bottom',
            name: '廚房下櫃',
            specs: [
                { id: 'with-counter', label: '含檯面' },
            ],
            unit: '尺',
            priceMin: 4500,
            priceMax: 7000,
        },
        {
            id: 'cabinet-island',
            name: '中島櫃',
            specs: [
                { id: 'sink', label: '含水槽' },
                { id: 'appliance', label: '含電器', priceModifier: 1.3 },
            ],
            unit: '尺',
            priceMin: 6000,
            priceMax: 10000,
        },
        {
            id: 'cabinet-bathroom',
            name: '浴室吊櫃',
            specs: [
                { id: 'moisture', label: '防潮板材' },
            ],
            unit: '尺',
            priceMin: 3800,
            priceMax: 6000,
        },
        {
            id: 'cabinet-entry',
            name: '玄關櫃',
            specs: [
                { id: 'bench', label: '含穿鞋椅' },
            ],
            unit: '尺',
            priceMin: 4000,
            priceMax: 6500,
        },
        {
            id: 'cabinet-hardware',
            name: '配件五金',
            specs: [
                { id: 'hinge', label: '緩衝鉸鏈' },
                { id: 'slide', label: '抽屜滑軌', priceModifier: 1.5 },
            ],
            unit: '組',
            priceMin: 200,
            priceMax: 800,
        },
    ],

    // 6. 地板工程
    flooring: [
        {
            id: 'floor-laminate',
            name: '超耐磨地板',
            specs: [
                { id: '8mm', label: '8mm' },
                { id: '12mm', label: '12mm', priceModifier: 1.3 },
            ],
            unit: '坪',
            priceMin: 2500,
            priceMax: 4500,
        },
        {
            id: 'floor-spc',
            name: 'SPC石塑地板',
            specs: [
                { id: '4mm', label: '4mm' },
                { id: '5mm', label: '5mm', priceModifier: 1.15 },
            ],
            unit: '坪',
            priceMin: 2200,
            priceMax: 3800,
        },
        {
            id: 'floor-engineered',
            name: '海島型木地板',
            specs: [
                { id: 'veneer', label: '實木皮' },
                { id: 'composite', label: '複合', priceModifier: 0.85 },
            ],
            unit: '坪',
            priceMin: 4500,
            priceMax: 8000,
        },
        {
            id: 'floor-solid',
            name: '實木地板',
            specs: [
                { id: 'teak', label: '柚木' },
                { id: 'oak', label: '橡木', priceModifier: 1.1 },
                { id: 'walnut', label: '胡桃', priceModifier: 1.3 },
            ],
            unit: '坪',
            priceMin: 8000,
            priceMax: 15000,
        },
        {
            id: 'floor-tile',
            name: '磁磚地板',
            specs: [
                { id: '60x60', label: '60×60cm' },
            ],
            unit: '坪',
            priceMin: 2500,
            priceMax: 4500,
        },
        {
            id: 'floor-vinyl',
            name: '塑膠地磚',
            specs: [
                { id: 'square', label: '方塊' },
                { id: 'plank', label: '長條', priceModifier: 1.1 },
            ],
            unit: '坪',
            priceMin: 1200,
            priceMax: 2000,
        },
        {
            id: 'floor-raised',
            name: '架高木地板',
            specs: [
                { id: 'with-frame', label: '含骨架' },
            ],
            unit: '坪',
            priceMin: 4500,
            priceMax: 7000,
        },
        {
            id: 'floor-trim',
            name: '收邊條',
            specs: [
                { id: 'press', label: '壓條' },
                { id: 't-bar', label: 'T字條', priceModifier: 1.1 },
            ],
            unit: '尺',
            priceMin: 80,
            priceMax: 150,
        },
        {
            id: 'floor-baseboard',
            name: '踢腳板',
            specs: [
                { id: 'plastic', label: '塑膠' },
                { id: 'wood', label: '實木', priceModifier: 1.5 },
                { id: 'pvc', label: 'PVC', priceModifier: 0.9 },
            ],
            unit: '尺',
            priceMin: 100,
            priceMax: 250,
        },
    ],

    // 7. 水電工程
    electrical: [
        {
            id: 'elec-circuit',
            name: '電源迴路',
            specs: [
                { id: 'dedicated', label: '新增專用迴路' },
            ],
            unit: '迴',
            priceMin: 3500,
            priceMax: 5000,
        },
        {
            id: 'elec-outlet-move',
            name: '插座移位',
            specs: [
                { id: 'with-conduit', label: '含配管線' },
            ],
            unit: '處',
            priceMin: 1200,
            priceMax: 2000,
        },
        {
            id: 'elec-switch-move',
            name: '開關移位',
            specs: [
                { id: 'with-conduit', label: '含配管線' },
            ],
            unit: '處',
            priceMin: 1000,
            priceMax: 1800,
        },
        {
            id: 'elec-light-install',
            name: '燈具安裝',
            specs: [
                { id: 'ceiling', label: '吸頂燈' },
                { id: 'pendant', label: '吊燈', priceModifier: 1.3 },
                { id: 'track', label: '軌道燈', priceModifier: 1.5 },
            ],
            unit: '盞',
            priceMin: 500,
            priceMax: 1500,
        },
        {
            id: 'elec-downlight',
            name: '崁燈安裝',
            specs: [
                { id: 'led', label: 'LED崁燈' },
            ],
            unit: '盞',
            priceMin: 600,
            priceMax: 1000,
        },
        {
            id: 'elec-ac-circuit',
            name: '冷氣迴路',
            specs: [
                { id: '220v', label: '220V專用迴路' },
            ],
            unit: '迴',
            priceMin: 4500,
            priceMax: 6500,
        },
        {
            id: 'elec-lowvolt',
            name: '弱電配線',
            specs: [
                { id: 'network', label: '網路' },
                { id: 'phone', label: '電話', priceModifier: 0.8 },
                { id: 'tv', label: '電視', priceModifier: 0.9 },
            ],
            unit: '點',
            priceMin: 800,
            priceMax: 1500,
        },
        {
            id: 'plumb-supply',
            name: '給水管線',
            specs: [
                { id: 'ppr', label: 'PPR熱熔管' },
            ],
            unit: '處',
            priceMin: 2500,
            priceMax: 4000,
        },
        {
            id: 'plumb-drain',
            name: '排水管線',
            specs: [
                { id: 'pvc', label: 'PVC管' },
                { id: 'abs', label: 'ABS管', priceModifier: 1.1 },
            ],
            unit: '處',
            priceMin: 2000,
            priceMax: 3500,
        },
        {
            id: 'plumb-toilet',
            name: '馬桶安裝',
            specs: [
                { id: 'standard', label: '含法蘭/矽利康' },
            ],
            unit: '組',
            priceMin: 1500,
            priceMax: 2500,
        },
        {
            id: 'plumb-sink',
            name: '洗手台安裝',
            specs: [
                { id: 'with-parts', label: '含配件/止水閥' },
            ],
            unit: '組',
            priceMin: 1800,
            priceMax: 3000,
        },
    ],

    // 8. 玻璃工程
    glass: [
        {
            id: 'glass-clear',
            name: '清玻/茶玻',
            specs: [
                { id: '5mm', label: '5mm' },
                { id: '8mm', label: '8mm', priceModifier: 1.3 },
                { id: '10mm', label: '10mm', priceModifier: 1.6 },
            ],
            unit: '才',
            priceMin: 120,
            priceMax: 200,
        },
        {
            id: 'glass-tempered',
            name: '強化玻璃',
            specs: [
                { id: '8mm', label: '8mm' },
                { id: '10mm', label: '10mm', priceModifier: 1.2 },
                { id: '12mm', label: '12mm', priceModifier: 1.5 },
            ],
            unit: '才',
            priceMin: 180,
            priceMax: 300,
        },
        {
            id: 'glass-laminated',
            name: '膠合玻璃',
            specs: [
                { id: '5+5', label: '5+5mm' },
                { id: '6+6', label: '6+6mm', priceModifier: 1.3 },
            ],
            unit: '才',
            priceMin: 280,
            priceMax: 450,
        },
        {
            id: 'glass-painted',
            name: '烤漆玻璃',
            specs: [
                { id: 'white', label: '白色' },
                { id: 'black', label: '黑色', priceModifier: 1.05 },
                { id: 'color', label: '彩色', priceModifier: 1.15 },
            ],
            unit: '才',
            priceMin: 200,
            priceMax: 350,
        },
        {
            id: 'glass-frosted',
            name: '噴砂玻璃',
            specs: [
                { id: 'full', label: '全噴' },
                { id: 'pattern', label: '圖案', priceModifier: 1.3 },
            ],
            unit: '才',
            priceMin: 220,
            priceMax: 400,
        },
        {
            id: 'glass-mirror',
            name: '鏡面',
            specs: [
                { id: 'silver', label: '銀鏡' },
                { id: 'tea', label: '茶鏡', priceModifier: 1.2 },
                { id: 'grey', label: '灰鏡', priceModifier: 1.25 },
            ],
            unit: '才',
            priceMin: 150,
            priceMax: 300,
        },
        {
            id: 'glass-door',
            name: '玻璃門片',
            specs: [
                { id: 'with-hardware', label: '含五金配件' },
            ],
            unit: '樘',
            priceMin: 8000,
            priceMax: 15000,
        },
        {
            id: 'glass-shower',
            name: '淋浴拉門',
            specs: [
                { id: 'inline', label: '一字型' },
                { id: 'l-shape', label: 'L型', priceModifier: 1.4 },
            ],
            unit: '組',
            priceMin: 12000,
            priceMax: 25000,
        },
        {
            id: 'glass-partition',
            name: '玻璃隔間',
            specs: [
                { id: 'framed', label: '框架式' },
                { id: 'frameless', label: '無框式', priceModifier: 1.4 },
            ],
            unit: 'm²',
            priceMin: 3500,
            priceMax: 6500,
        },
    ],

    // 9. 窗簾窗飾
    curtain: [
        {
            id: 'curtain-drape',
            name: '布簾',
            specs: [
                { id: 'blackout', label: '遮光' },
                { id: 'semi', label: '半遮光', priceModifier: 0.8 },
                { id: 'sheer', label: '紗簾', priceModifier: 0.6 },
            ],
            unit: '尺(寬)',
            priceMin: 200,
            priceMax: 600,
        },
        {
            id: 'curtain-roller',
            name: '捲簾',
            specs: [
                { id: 'pull', label: '手拉' },
                { id: 'electric', label: '電動', priceModifier: 2.0 },
            ],
            unit: '才',
            priceMin: 60,
            priceMax: 150,
        },
        {
            id: 'curtain-blinds',
            name: '百葉窗',
            specs: [
                { id: 'aluminum', label: '鋁製' },
                { id: 'wood', label: '木製', priceModifier: 1.8 },
                { id: 'pvc', label: 'PVC', priceModifier: 0.8 },
            ],
            unit: '才',
            priceMin: 80,
            priceMax: 200,
        },
        {
            id: 'curtain-zebra',
            name: '調光簾',
            specs: [
                { id: 'zebra', label: '斑馬簾' },
                { id: 'honeycomb', label: '蜂巢簾', priceModifier: 1.3 },
            ],
            unit: '才',
            priceMin: 100,
            priceMax: 250,
        },
        {
            id: 'curtain-roman',
            name: '羅馬簾',
            specs: [
                { id: 'fabric', label: '布' },
                { id: 'bamboo', label: '竹', priceModifier: 1.2 },
            ],
            unit: '才',
            priceMin: 120,
            priceMax: 280,
        },
        {
            id: 'curtain-track',
            name: '軌道/窗簾盒',
            specs: [
                { id: 'single', label: '單軌' },
                { id: 'double', label: '雙軌', priceModifier: 1.5 },
            ],
            unit: '尺',
            priceMin: 150,
            priceMax: 350,
        },
    ],

    // 10. 清潔保護
    cleaning: [
        {
            id: 'clean-rough',
            name: '開荒清潔',
            specs: [
                { id: 'new', label: '新屋' },
                { id: 'reno', label: '翻新後', priceModifier: 1.2 },
            ],
            unit: '坪',
            priceMin: 350,
            priceMax: 600,
        },
        {
            id: 'clean-glue',
            name: '除膠清潔',
            specs: [
                { id: 'window', label: '窗框' },
                { id: 'floor', label: '地板', priceModifier: 1.2 },
            ],
            unit: '坪',
            priceMin: 200,
            priceMax: 400,
        },
        {
            id: 'clean-wax',
            name: '地板打蠟',
            specs: [
                { id: 'polish', label: '拋光' },
                { id: 'coat', label: '護膜', priceModifier: 1.3 },
            ],
            unit: '坪',
            priceMin: 200,
            priceMax: 400,
        },
        {
            id: 'clean-ac',
            name: '冷氣清洗',
            specs: [
                { id: 'split', label: '分離式' },
                { id: 'window', label: '窗型', priceModifier: 0.7 },
            ],
            unit: '台',
            priceMin: 1500,
            priceMax: 3500,
        },
        {
            id: 'clean-protect',
            name: '施工保護',
            specs: [
                { id: 'floor', label: '地板' },
                { id: 'elevator', label: '電梯', priceModifier: 1.5 },
            ],
            unit: '坪',
            priceMin: 80,
            priceMax: 150,
        },
    ],
};

// 取得工種的項目列表
export function getTradeItems(tradeId: TradeId): RenovationItem[] {
    return RENOVATION_ITEMS[tradeId] || [];
}

// 計算項目價格
export function calculateItemPrice(
    item: RenovationItem,
    specId: string,
    quantity: number
): { min: number; max: number; avg: number } {
    const spec = item.specs.find(s => s.id === specId);
    const modifier = spec?.priceModifier ?? 1;

    const min = item.priceMin * modifier * quantity;
    const max = item.priceMax * modifier * quantity;
    const avg = (min + max) / 2;

    return { min, max, avg };
}
