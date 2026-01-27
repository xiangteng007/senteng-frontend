
import React, { useState, useEffect } from 'react';
import { Calculator, FolderPlus, RefreshCw, Plus, Trash2, Save, DollarSign, Package, Paintbrush, Hammer, Wrench, Layers, GlassWater, Info, Edit2, X, Check, FileSpreadsheet, ExternalLink, FileText } from 'lucide-react';
import { SectionTitle } from '../components/common/Indicators';
import { GoogleService } from '../services/GoogleService';

// 預設物料資料（基於台灣 2024-2025 營造工程行情）
const DEFAULT_MATERIALS = {
    // ===== 營建工程 - 結構工程 =====
    '混凝土': [
        { id: 101, name: '預拌混凝土', spec: '2000psi (140kgf/cm²)', unit: 'm³', suggestedPrice: 2800, price: 2800, note: '地坪/車道/人行道', regulation: '非結構用途，適用於人行道、車道、輕載地坪' },
        { id: 102, name: '預拌混凝土', spec: '3000psi (210kgf/cm²)', unit: 'm³', suggestedPrice: 3200, price: 3200, note: '標準結構/樓板/梁柱', regulation: '建構規則§352：一般結構用途，樓板/梁/柱基本強度' },
        { id: 103, name: '預拌混凝土', spec: '4000psi (280kgf/cm²)', unit: 'm³', suggestedPrice: 3800, price: 3800, note: '高層主結構/地下室', regulation: '建構規則§352：高層建築主結構、地下室、重載構件' },
        { id: 104, name: '預拌混凝土', spec: '5000psi (350kgf/cm²)', unit: 'm³', suggestedPrice: 4500, price: 4500, note: '橋梁/預力構件', regulation: '預力混凝土構件、橋梁、特殊結構用途' },
        { id: 105, name: '預拌混凝土', spec: 'SCC自充填', unit: 'm³', suggestedPrice: 4800, price: 4800, note: '密配筋/複雜造型', regulation: '密配筋區域或複雜造型，免振動搗實' },
        { id: 106, name: '素混凝土墊層', spec: 'PC (無配筋)', unit: 'm³', suggestedPrice: 2200, price: 2200, note: '打底/保護層', regulation: '基礎打底層、管線保護層，無結構需求' },
        { id: 107, name: '泵浦車壓送', spec: '依公尺計', unit: 'm', suggestedPrice: 250, price: 250, note: '另收出車費$8,000~$12,000', regulation: '' },
        { id: 108, name: '混凝土澆置', spec: '純工資', unit: 'm³', suggestedPrice: 450, price: 450, note: '震動搗實+整平', regulation: '澆置後需充分振動搗實，避免蜂窩' },
    ],
    '鋼筋': [
        { id: 111, name: '竹節鋼筋 #3', spec: 'D10 (9.53mm/0.56kg/m)', unit: 'kg', suggestedPrice: 17, price: 17, note: '箍筋/繫筋', regulation: '建構規則§427：箍筋間距≤d/4且≤10cm（塑鉸區）' },
        { id: 112, name: '竹節鋼筋 #4', spec: 'D13 (12.7mm/0.99kg/m)', unit: 'kg', suggestedPrice: 17, price: 17, note: '繫筋/副筋', regulation: '繫筋應錨定於箍筋圍束範圍內' },
        { id: 113, name: '竹節鋼筋 #5', spec: 'D16 (15.9mm/1.56kg/m)', unit: 'kg', suggestedPrice: 16.5, price: 16.5, note: '一般主筋', regulation: '建構規則§422：梁最小受拉筋比≥0.40%' },
        { id: 114, name: '竹節鋼筋 #6', spec: 'D19 (19.1mm/2.25kg/m)', unit: 'kg', suggestedPrice: 16.5, price: 16.5, note: '主筋', regulation: '建構規則§426：柱最小配筋率≥0.80%' },
        { id: 115, name: '竹節鋼筋 #7', spec: 'D22 (22.2mm/3.04kg/m)', unit: 'kg', suggestedPrice: 16, price: 16, note: '大樑主筋', regulation: '大樑主筋需考慮抗剪設計' },
        { id: 116, name: '竹節鋼筋 #8', spec: 'D25 (25.4mm/3.98kg/m)', unit: 'kg', suggestedPrice: 16, price: 16, note: '柱主筋', regulation: '柱主筋不少於4根，淨間距≥4cm' },
        { id: 117, name: '竹節鋼筋 #9', spec: 'D29 (28.7mm/5.08kg/m)', unit: 'kg', suggestedPrice: 16, price: 16, note: '特大柱/基礎', regulation: '基礎筋保護層≥7.5cm（土壤接觸）' },
        { id: 118, name: '竹節鋼筋 #10', spec: 'D32 (32.2mm/6.39kg/m)', unit: 'kg', suggestedPrice: 16, price: 16, note: '重型結構', regulation: '重型結構需考慮續接器或搭接' },
        { id: 119, name: '鋼筋綁紮', spec: '純工資 (依噸計)', unit: 'ton', suggestedPrice: 8500, price: 8500, note: '含鐵絲', regulation: '' },
        { id: 120, name: '鋼筋加工', spec: '彎折/裁切', unit: 'ton', suggestedPrice: 2000, price: 2000, note: '機械加工', regulation: '彎折半徑依鋼筋號數規定' },
        { id: 121, name: '鋼筋續接器', spec: '機械接頭', unit: '組', suggestedPrice: 150, price: 150, note: 'SA級', regulation: 'CNS 560 SA級續接器規範' },
    ],
    '模板': [
        { id: 131, name: '普通木模板', spec: '樓板/牆體', unit: 'm²', suggestedPrice: 800, price: 800, note: '夾板模+支撐+工資', regulation: '撓度承載後≤跨距1/240' },
        { id: 132, name: '清水模板', spec: '外觀面要求', unit: 'm²', suggestedPrice: 1100, price: 1100, note: '特殊處理面', regulation: '外觀面需使用高品質面板' },
        { id: 133, name: '柱模板', spec: '方柱/矩形柱', unit: 'm²', suggestedPrice: 900, price: 900, note: '含組立+拆模', regulation: '柱牆拆模：約1-3天（需達設計強度）' },
        { id: 134, name: '樑模板', spec: '大樑/小樑', unit: 'm²', suggestedPrice: 850, price: 850, note: '含底模+側模', regulation: '樑樓板拆模：約14-28天（需達70%設計強度）' },
        { id: 135, name: '樓梯模板', spec: '階梯面', unit: 'm²', suggestedPrice: 1000, price: 1000, note: '複雜造型', regulation: '樓梯踏面需精確量測' },
        { id: 136, name: '系統模板', spec: '鋁模/鋼模租用', unit: 'm²', suggestedPrice: 450, price: 450, note: '重複使用30次以上', regulation: '重複使用可降低成本' },
        { id: 137, name: '模板支撐架', spec: '鋼管鷹架', unit: '組', suggestedPrice: 120, price: 120, note: '含組立拆除', regulation: '高支模≥7m/330m²需技師簽章設計' },
        { id: 138, name: '曲面模板', spec: '特殊造型', unit: 'm²', suggestedPrice: 1500, price: 1500, note: '客製化加工', regulation: '客製化造型需專案設計' },
    ],
    // ===== 營建工程 - 泥作工程 =====
    '泥作材料': [
        { id: 141, name: '水泥', spec: '50kg/包', unit: '包', suggestedPrice: 185, price: 185, note: '台泥/亞泥', regulation: 'CNS 61：卜特蘭水泥規範' },
        { id: 142, name: '河砂 (細砂)', spec: '粉光用', unit: '立方', suggestedPrice: 1400, price: 1400, note: '過篩', regulation: 'CNS 1240：混凝土用細粒料' },
        { id: 143, name: '河砂 (粗砂)', spec: '打底用', unit: '立方', suggestedPrice: 1200, price: 1200, note: '未過篩', regulation: 'CNS 1240：混凝土用粒料' },
        { id: 144, name: '紅磚', spec: '230x110x60mm', unit: '塊', suggestedPrice: 7.5, price: 7.5, note: '128塊/m² (1B牆)', regulation: 'CNS 382：普通磚規範' },
        { id: 145, name: '輕質磚', spec: '60x20x10cm (ALC)', unit: '塊', suggestedPrice: 35, price: 35, note: '隔間牆用', regulation: '輕質混凝土磚，需考慮承重限制' },
        { id: 146, name: '空心磚', spec: '40x20x10cm', unit: '塊', suggestedPrice: 18, price: 18, note: '輕隔間', regulation: 'CNS 1002：空心混凝土砌塊' },
        { id: 147, name: '水泥砂漿 1:3', spec: '打底用', unit: 'm³', suggestedPrice: 3800, price: 3800, note: '含攪拌', regulation: '打底層厚度約15-20mm' },
        { id: 148, name: '水泥砂漿 1:2', spec: '粉光面', unit: 'm³', suggestedPrice: 4200, price: 4200, note: '細緻面層', regulation: '粉光層厚度約5-8mm' },
        { id: 149, name: '牆壁打底', spec: '1:3水泥整平', unit: '坪', suggestedPrice: 3500, price: 3500, note: '連工帶料', regulation: '施工前需潤濕基面' },
        { id: 150, name: '牆壁粉光', spec: '1:2水泥粉光', unit: '坪', suggestedPrice: 2000, price: 2000, note: '純工資', regulation: '粉光前打底需養護3天以上' },
        { id: 151, name: '地面粉光', spec: '1:2水泥粉光', unit: '坪', suggestedPrice: 2500, price: 2500, note: '純工資', regulation: '地坪粉光需考慮洩水坡度' },
        { id: 152, name: '砌磚工資', spec: '紅磚', unit: 'm²', suggestedPrice: 650, price: 650, note: '不含材料', regulation: '砌磚灰縫寬度8-12mm' },
        { id: 153, name: '砌磚工資', spec: '輕質磚', unit: 'm²', suggestedPrice: 450, price: 450, note: '不含材料', regulation: '輕質磚需使用專用黏著劑' },
    ],
    // ===== 營建工程 - 磁磚工程 =====
    '磁磚材料': [
        { id: 161, name: '磁磚 30x30cm', spec: '地磚', unit: 'm²', suggestedPrice: 350, price: 350, note: '經濟款', regulation: 'CNS 9737：陶瓷面磚規範' },
        { id: 162, name: '磁磚 30x60cm', spec: '壁磚', unit: 'm²', suggestedPrice: 450, price: 450, note: '浴室/廚房', regulation: 'CNS 9737：壁磚吸水率≤10%' },
        { id: 163, name: '磁磚 60x60cm', spec: '拋光石英磚', unit: 'm²', suggestedPrice: 650, price: 650, note: '客廳/商空', regulation: '石英磚吸水率≤0.5%' },
        { id: 164, name: '磁磚 80x80cm', spec: '拋光石英磚', unit: 'm²', suggestedPrice: 850, price: 850, note: '大空間', regulation: '大尺寸需使用乾式/半乾式工法' },
        { id: 165, name: '磁磚 60x120cm', spec: '大板磚', unit: 'm²', suggestedPrice: 1200, price: 1200, note: '豪宅/飯店', regulation: '大板磚需專用背膠，乾式施工' },
        { id: 166, name: '磁磚 120x240cm', spec: '岩板', unit: 'm²', suggestedPrice: 2500, price: 2500, note: '電視牆/檯面', regulation: '岩板需專業施工團隊' },
        { id: 167, name: '馬賽克磚', spec: '2.3x2.3cm', unit: 'm²', suggestedPrice: 550, price: 550, note: '外牆/泳池', regulation: '外牆用需抗凍融性' },
        { id: 168, name: '六角磚', spec: '造型磚', unit: 'm²', suggestedPrice: 800, price: 800, note: '特殊拼貼', regulation: '造型磚施工損耗約10-15%' },
        { id: 169, name: '木紋磚', spec: '20x120cm', unit: 'm²', suggestedPrice: 650, price: 650, note: '仿木地板', regulation: '木紋磚可交丁/平舖' },
        { id: 170, name: '益膠泥', spec: '25kg/包 (貼4-5m²)', unit: '包', suggestedPrice: 480, price: 480, note: '高黏著力', regulation: 'CNS 14646：陶瓷面磚用黏著劑' },
        { id: 171, name: '填縫劑', spec: '抗污防霉 (0.3kg/m²)', unit: 'kg', suggestedPrice: 150, price: 150, note: 'AB膠/環氧', regulation: '浴室建議使用抗霉填縫劑' },
        { id: 172, name: '磁磚施工', spec: '濕式工法 (軟底)', unit: 'm²', suggestedPrice: 850, price: 850, note: '純工資', regulation: '軟底適用≤60cm磁磚' },
        { id: 173, name: '磁磚施工', spec: '乾式工法 (硬底)', unit: 'm²', suggestedPrice: 1100, price: 1100, note: '純工資/大板用', regulation: '硬底適用60cm以上大板磚' },
        { id: 174, name: '磁磚施工', spec: '半濕式 (騷底)', unit: 'm²', suggestedPrice: 950, price: 950, note: '純工資', regulation: '騷底介於軟硬底之間' },
        { id: 175, name: '壁磚施工', spec: '連工帶料', unit: '坪', suggestedPrice: 3800, price: 3800, note: '含磁磚', regulation: '壁磚需由下往上鋪貼' },
        { id: 176, name: '地磚施工', spec: '連工帶料', unit: '坪', suggestedPrice: 5500, price: 5500, note: '含磁磚', regulation: '地磚應預留伸縮縫' },
    ],
    // ===== 營建工程 - 塗料工程 =====
    '塗料材料': [
        { id: 181, name: '外牆彈性漆', spec: '5加侖 (塗刷20坪)', unit: '桶', suggestedPrice: 4500, price: 4500, note: '抗UV/防水', regulation: '外牆塗料應符合CNS 4940' },
        { id: 182, name: '外牆平光漆', spec: '5加侖 (塗刷22坪)', unit: '桶', suggestedPrice: 3200, price: 3200, note: '一般外牆', regulation: '平光漆適合遮蓋牆面瑕疵' },
        { id: 183, name: '內牆乳膠漆', spec: '5加侖 (塗刷25坪)', unit: '桶', suggestedPrice: 2200, price: 2200, note: '室內用', regulation: '室內塗料VOC≤50g/L（綠建材）' },
        { id: 184, name: '水泥漆', spec: '5加侖 (塗刷30坪)', unit: '桶', suggestedPrice: 1500, price: 1500, note: '經濟款', regulation: '水泥漆透氣性較差' },
        { id: 185, name: '防水漆', spec: '5加侖', unit: '桶', suggestedPrice: 3800, price: 3800, note: '屋頂/浴室', regulation: '防水漆需塗刷2-3道' },
        { id: 186, name: '底漆', spec: '5加侖', unit: '桶', suggestedPrice: 1800, price: 1800, note: '增加附著力', regulation: '新牆必須先上底漆' },
        { id: 187, name: '批土', spec: '25kg/包 (批15坪)', unit: '包', suggestedPrice: 380, price: 380, note: '牆面整平', regulation: '批土後需打磨平整' },
        { id: 188, name: '砂紙/研磨', spec: '依坪計', unit: '坪', suggestedPrice: 80, price: 80, note: '牆面處理', regulation: '批土後需用180-240號砂紙' },
        { id: 189, name: '外牆塗裝', spec: '純工資', unit: '坪', suggestedPrice: 650, price: 650, note: '含底漆+面漆2度', regulation: '外牆施工需注意天候' },
        { id: 190, name: '內牆塗裝(水泥漆)', spec: '新作全批土', unit: '坪', suggestedPrice: 1200, price: 1200, note: '連工帶料', regulation: '全批土工序：批土→打磨→底漆→面漆' },
        { id: 191, name: '內牆塗裝(乳膠漆)', spec: '新作全批土', unit: '坪', suggestedPrice: 1900, price: 1900, note: '連工帶料', regulation: '乳膠漆較環保，VOC低' },
        { id: 192, name: '舊牆翻新(乳膠漆)', spec: '局部批土', unit: '坪', suggestedPrice: 1500, price: 1500, note: '連工帶料', regulation: '舊牆需先刮除鬆動漆膜' },
        { id: 193, name: '鷹架租用', spec: '外牆施工', unit: '坪', suggestedPrice: 250, price: 250, note: '按牆面積計', regulation: '高度≥2m需搭設施工架' },
    ],
    // ===== 營建工程 - 防水工程 =====
    '防水材料': [
        { id: 201, name: '防水漆', spec: '壓克力樹脂', unit: '坪', suggestedPrice: 800, price: 800, note: '施工方便/耐用度低', regulation: '施工前需清除油污、乾燥' },
        { id: 202, name: 'PU防水', spec: '聚氨酯', unit: '坪', suggestedPrice: 2200, price: 2200, note: '頂樓用/注意含水率', regulation: 'CNS 6986：建築防水用聚胺酯' },
        { id: 203, name: '改質瀝青防水毯', spec: '10-15年壽命', unit: '坪', suggestedPrice: 3200, price: 3200, note: '耐候性高', regulation: 'CNS 14497：改質瀝青防水氈' },
        { id: 204, name: '防水毯', spec: '聚酯纖維+瀝青', unit: '坪', suggestedPrice: 12000, price: 12000, note: '效果最佳', regulation: 'CNS 10410：油毛氈紙規範' },
        { id: 205, name: '彈性水泥', spec: '浴室用', unit: '坪', suggestedPrice: 2500, price: 2500, note: '塗刷2-3層', regulation: '浴室應具防水設計，高度至用水器具以上' },
        { id: 206, name: '結晶型防水', spec: '20年壽命', unit: '坪', suggestedPrice: 3500, price: 3500, note: '地下室用', regulation: '地下室應採外防水為原則' },
        { id: 207, name: '水泥系滲透劑', spec: '結構補強', unit: '坪', suggestedPrice: 2000, price: 2000, note: '舊樓修繕', regulation: '舊樓修繕用' },
        { id: 208, name: '高壓灌注', spec: '裂縫處理', unit: '針', suggestedPrice: 600, price: 600, note: '打針填補', regulation: '裂縫灌注修補' },
        { id: 209, name: '壁癌處理', spec: '含刮除/補強', unit: '坪', suggestedPrice: 3000, price: 3000, note: '依嚴重度', regulation: '壁癌應先找出滲水源頭' },
        { id: 210, name: '試水測試', spec: '48hr', unit: '次', suggestedPrice: 3000, price: 3000, note: '含蓄水/排水', regulation: '完工需48小時試水測試' },
    ],
    // ===== 營建工程 - 門窗工程 =====
    '門窗材料': [
        { id: 221, name: '一般鋁窗', spec: '傳統型', unit: '才', suggestedPrice: 280, price: 280, note: '不含玻璃/安裝', regulation: 'CNS 3092：鋁製門窗規範' },
        { id: 222, name: '氣密窗', spec: 'CNS認證', unit: '才', suggestedPrice: 450, price: 450, note: '不含玻璃/安裝', regulation: 'CNS 11527：氣密性2等級以上' },
        { id: 223, name: '隔音窗', spec: 'STC-37db以上', unit: '才', suggestedPrice: 850, price: 850, note: '不含玻璃/安裝', regulation: 'STC 37db以上具明顯隔音效果' },
        { id: 224, name: '5mm清玻璃', spec: '單層', unit: '才', suggestedPrice: 35, price: 35, note: '一般隔間', regulation: 'CNS 679：平板玻璃' },
        { id: 225, name: '10mm強化玻璃', spec: '單層', unit: '才', suggestedPrice: 85, price: 85, note: '淋浴間', regulation: 'CNS 2213：強化玻璃需標示' },
        { id: 226, name: '5+5mm膠合玻璃', spec: '安全玻璃', unit: '才', suggestedPrice: 120, price: 120, note: '防盜/隔音', regulation: 'CNS 14815：膠合安全玻璃' },
        { id: 227, name: '複層中空玻璃', spec: '5+6A+5mm', unit: '才', suggestedPrice: 180, price: 180, note: '隔熱/隔音', regulation: '中空層氬氣填充效果更佳' },
        { id: 228, name: 'Low-E玻璃', spec: '節能', unit: '才', suggestedPrice: 250, price: 250, note: '低輻射/節能', regulation: '遮蔽係數SC≤0.5為佳' },
        { id: 229, name: '氣密窗安裝', spec: '連工帶料', unit: '才', suggestedPrice: 750, price: 750, note: '大和賞等級', regulation: '安裝需確保氣密水密性' },
        { id: 230, name: '隔音窗安裝', spec: '連工帶料', unit: '才', suggestedPrice: 950, price: 950, note: '膠合玻璃', regulation: '隔音窗框需獨立安裝' },
        { id: 231, name: '紗窗', spec: '白色/黑色', unit: '才', suggestedPrice: 60, price: 60, note: '不含框', regulation: '防蚊紗網建議20目以上' },
        { id: 232, name: '鐵捲門(黑鐵)', spec: '傳統手動', unit: '才', suggestedPrice: 350, price: 350, note: '含安裝', regulation: '需定期防鏽處理' },
        { id: 233, name: '鐵捲門(白鐵)', spec: '不鏽鋼電動', unit: '才', suggestedPrice: 550, price: 550, note: '含馬達', regulation: '電動門需安全裝置' },
        { id: 234, name: '快速捲門', spec: '電動', unit: '才', suggestedPrice: 750, price: 750, note: '含安全裝置', regulation: '快速門需紅外線感應器' },
    ],
    // ===== 營建工程 - 拆除清運 =====
    '拆除清運': [
        { id: 241, name: '裝潢廢棄物清運', spec: '垃圾車 (5噸)', unit: '車', suggestedPrice: 16000, price: 16000, note: '2025年起需申報', regulation: '營建廢棄物需合法清運，GPS追蹤' },
        { id: 242, name: '磁磚拆除', spec: '壁磚/地磚', unit: '坪', suggestedPrice: 1200, price: 1200, note: '純工資', regulation: '拆除前需評估結構影響' },
        { id: 243, name: '木作拆除', spec: '天花/櫃體', unit: '坪', suggestedPrice: 800, price: 800, note: '純工資', regulation: '木作可回收再利用' },
        { id: 244, name: '輕隔間拆除', spec: '矽酸鈣板', unit: '坪', suggestedPrice: 600, price: 600, note: '純工資', regulation: '矽酸鈣板需分類處理' },
        { id: 245, name: '磚牆拆除', spec: '1B磚牆', unit: '坪', suggestedPrice: 1800, price: 1800, note: '純工資', regulation: '結構牆不可任意拆除' },
        { id: 246, name: 'RC牆面打除', spec: '混凝土', unit: '坪', suggestedPrice: 3500, price: 3500, note: '含運棄', regulation: '剪力牆/承重牆禁止打除' },
        { id: 247, name: '廢土清運', spec: '2025年新制', unit: 'm³', suggestedPrice: 3000, price: 3000, note: 'GPS追蹤', regulation: '營建剩餘土石方需申報流向' },
        { id: 248, name: '搬運費', spec: '人工搬運', unit: '趟', suggestedPrice: 500, price: 500, note: '無電梯加價', regulation: '' },
        { id: 249, name: '樓層搬運', spec: '無電梯', unit: '層', suggestedPrice: 300, price: 300, note: '加價', regulation: '' },
    ],
    // ===== 營建工程 - 建築概估 =====
    '建築概估': [
        { id: 261, name: 'RC透天住宅', spec: '2-3F', unit: '坪', suggestedPrice: 75000, price: 75000, note: '連工帶料, 中等裝修', regulation: '建築技術規則：3層以下免電梯' },
        { id: 262, name: 'RC透天住宅', spec: '4-5F', unit: '坪', suggestedPrice: 85000, price: 85000, note: '連工帶料, 中等裝修', regulation: '4層以上需設電梯或昇降設施' },
        { id: 263, name: 'RC公寓大樓', spec: '6-12F', unit: '坪', suggestedPrice: 95000, price: 95000, note: '連工帶料, 標準裝修', regulation: '6層以上屬高層建築需特別審查' },
        { id: 264, name: 'RC高層大樓', spec: '13F以上', unit: '坪', suggestedPrice: 115000, price: 115000, note: '連工帶料, 含電梯', regulation: '高層建築需特別結構審查' },
        { id: 265, name: '加強磚造', spec: '3F以下', unit: '坪', suggestedPrice: 55000, price: 55000, note: '農舍/倉庫', regulation: '加強磚造限3層以下' },
        { id: 266, name: '鋼構廠房', spec: '單層', unit: '坪', suggestedPrice: 38000, price: 38000, note: '鋼骨+鋼板屋頂', regulation: '鋼構需依CNS鋼材規範' },
        { id: 267, name: '地下室開挖', spec: '1層', unit: '坪', suggestedPrice: 15000, price: 15000, note: '含擋土+排水', regulation: '開挖深度≥1.5m需擋土設施' },
        { id: 268, name: '地下室開挖', spec: '2層', unit: '坪', suggestedPrice: 22000, price: 22000, note: '含擋土+排水', regulation: '深開挖需監測鄰房沉陷' },
        { id: 269, name: '基礎工程', spec: '筏式基礎', unit: '坪', suggestedPrice: 12000, price: 12000, note: '含開挖回填', regulation: '筏基適用軟弱地盤' },
        { id: 270, name: '基礎工程', spec: '獨立基腳', unit: '坪', suggestedPrice: 8000, price: 8000, note: '一般透天', regulation: '獨立基腳需考慮土壤承載力' },
    ],
    // ===== 室內裝潢 - 油漆工程 =====
    '油漆': [
        { id: 301, name: '乳膠漆', spec: '5加侖桶', unit: '加侖', suggestedPrice: 1200, price: 1200, note: '每坪用量約0.5加侖', regulation: '室內塗料VOC≤50g/L（綠建材標章）' },
        { id: 302, name: '防水漆', spec: '5加侖桶', unit: '加侖', suggestedPrice: 1800, price: 1800, note: '浴室/屋頂用', regulation: '浴室防水塗層需至少2道' },
        { id: 303, name: '油性漆', spec: '加侖', unit: '加侖', suggestedPrice: 600, price: 600, note: '金屬/木作', regulation: '油性漆VOC較高，需通風施工' },
        { id: 304, name: '調和漆', spec: '加侖', unit: '加侖', suggestedPrice: 450, price: 450, note: '鐵件底漆', regulation: '鐵件需先除鏽再上底漆' },
        { id: 305, name: '護木油', spec: '公升', unit: 'L', suggestedPrice: 350, price: 350, note: '戶外木作', regulation: '戶外木作需定期維護' },
        { id: 306, name: '乳膠漆施工', spec: '新作全批土', unit: '坪', suggestedPrice: 1900, price: 1900, note: '連工帶料', regulation: '批土→打磨→底漆→面漆' },
        { id: 307, name: '乳膠漆施工', spec: '舊面修補', unit: '坪', suggestedPrice: 1450, price: 1450, note: '連工帶料', regulation: '舊面需刮除鬆動漆膜' },
        { id: 308, name: '水泥漆施工', spec: '新作全批土', unit: '坪', suggestedPrice: 1400, price: 1400, note: '連工帶料', regulation: '水泥漆經濟實惠但透氣性差' },
        { id: 309, name: '水泥漆施工', spec: '舊面修補', unit: '坪', suggestedPrice: 1050, price: 1050, note: '連工帶料', regulation: '' },
        { id: 310, name: '天花板粉刷', spec: '平頂', unit: '坪', suggestedPrice: 350, price: 350, note: '純工資', regulation: '天花板施工需注意照明遮蔽' },
    ],
    // ===== 室內裝潢 - 木作工程 =====
    '木作': [
        { id: 321, name: '木芯板', spec: '4x8呎/18mm', unit: '片', suggestedPrice: 800, price: 800, note: '36才/片', regulation: 'CNS 1349：木芯板規範' },
        { id: 322, name: '夾板', spec: '4x8呎/18mm', unit: '片', suggestedPrice: 450, price: 450, note: '36才/片', regulation: 'CNS 1349：結構用夾板' },
        { id: 323, name: '角材', spec: '1.2x1.2寸/12尺', unit: '支', suggestedPrice: 35, price: 35, note: '柳安', regulation: '角材間距≤30cm為佳' },
        { id: 324, name: '線板', spec: '椴木/塑膠', unit: '尺', suggestedPrice: 80, price: 80, note: '收邊用', regulation: '線板用於收邊修飾' },
        { id: 325, name: '平釘天花板', spec: '矽酸鈣板+角料', unit: '坪', suggestedPrice: 4500, price: 4500, note: '連工帶料', regulation: '矽酸鈣板需為耐燃一級' },
        { id: 326, name: '造型天花板', spec: '含間接照明', unit: '坪', suggestedPrice: 6500, price: 6500, note: '連工帶料', regulation: '間接照明需預留維修孔' },
        { id: 327, name: '木作門框', spec: '實木貼皮', unit: '樘', suggestedPrice: 8000, price: 8000, note: '含安裝', regulation: '門框需考慮防火等級' },
        { id: 328, name: '木作門片', spec: '推門', unit: '樘', suggestedPrice: 12000, price: 12000, note: '含五金', regulation: '室內門高度建議≥210cm' },
        { id: 329, name: '木作開門', spec: '門框+門片', unit: '樘', suggestedPrice: 18000, price: 18000, note: '連工帶料', regulation: '開門淨寬≥80cm（無障礙）' },
        { id: 330, name: '木作櫃體', spec: '衣櫃/書櫃', unit: '尺', suggestedPrice: 7500, price: 7500, note: '連工帶料', regulation: '固定式櫃體需錨固牆面' },
        { id: 331, name: '木作電視櫃', spec: '含背板處理', unit: '尺', suggestedPrice: 6500, price: 6500, note: '連工帶料', regulation: '電視櫃需預留走線孔' },
        { id: 332, name: '木地板鋪設', spec: '純工資', unit: '坪', suggestedPrice: 1200, price: 1200, note: '卡扣式', regulation: '木地板需預留伸縮縫' },
    ],
    // ===== 室內裝潢 - 系統櫃 =====
    '系統櫃': [
        { id: 341, name: '塑合板櫃體', spec: 'E1級', unit: '尺', suggestedPrice: 2800, price: 2800, note: '基本款', regulation: 'E1級甲醛釋出量≤0.1ppm' },
        { id: 342, name: '木心板櫃體', spec: '防潮', unit: '尺', suggestedPrice: 3500, price: 3500, note: '中階款', regulation: '木心板承重較佳' },
        { id: 343, name: '發泡板櫃體', spec: '防水', unit: '尺', suggestedPrice: 4200, price: 4200, note: '浴室廚房', regulation: '發泡板100%防水' },
        { id: 344, name: '平板門片', spec: '塑合板', unit: '才', suggestedPrice: 180, price: 180, note: '基本款', regulation: '' },
        { id: 345, name: '造型門片', spec: '吸塑/烤漆', unit: '才', suggestedPrice: 350, price: 350, note: '中高階', regulation: '烤漆門片較耐刮' },
        { id: 346, name: '玻璃門片', spec: '鋁框+玻璃', unit: '才', suggestedPrice: 280, price: 280, note: '透視展示', regulation: '玻璃需為強化或膠合' },
        { id: 347, name: '緩衝鉸鏈', spec: '西德/Blum', unit: '組', suggestedPrice: 200, price: 200, note: '進口五金', regulation: '緩衝鉸鏈延長櫃體壽命' },
        { id: 348, name: '三節滑軌', spec: '緩衝', unit: '組', suggestedPrice: 350, price: 350, note: '抽屜用', regulation: '滑軌承重需注意' },
        { id: 349, name: '衣櫃拉籃', spec: '不鏽鋼', unit: '組', suggestedPrice: 1200, price: 1200, note: '含滑軌', regulation: '' },
        { id: 350, name: '系統衣櫃', spec: '240cm高', unit: '尺', suggestedPrice: 4500, price: 4500, note: '連工帶料', regulation: '衣櫃需固定於牆面防傾倒' },
        { id: 351, name: '系統書櫃', spec: '含門片', unit: '尺', suggestedPrice: 3800, price: 3800, note: '連工帶料', regulation: '書櫃層板間距考慮書本高度' },
        { id: 352, name: '系統鞋櫃', spec: '含通風', unit: '尺', suggestedPrice: 3200, price: 3200, note: '連工帶料', regulation: '鞋櫃需通風設計' },
    ],
    // ===== 室內裝潢 - 水電工程 =====
    '水電': [
        { id: 361, name: '電線 2.0mm', spec: '單芯線', unit: '尺', suggestedPrice: 8, price: 8, note: '插座/照明', regulation: '一般照明迴路用2.0mm' },
        { id: 362, name: '電線 5.5mm', spec: '單芯線', unit: '尺', suggestedPrice: 20, price: 20, note: '專用迴路', regulation: '冷氣/電熱器專用迴路需5.5mm' },
        { id: 363, name: 'PVC管 3/4吋', spec: '4米長', unit: '支', suggestedPrice: 45, price: 45, note: '電線管', regulation: '電線需配管保護' },
        { id: 364, name: '開關', spec: '國際牌/含安裝', unit: '組', suggestedPrice: 180, price: 180, note: '單切/三路', regulation: '開關高度建議離地120cm' },
        { id: 365, name: '插座', spec: '國際牌/含安裝', unit: '組', suggestedPrice: 180, price: 180, note: '接地型', regulation: '浴室/廚房需接地型插座' },
        { id: 366, name: '專用迴路', spec: '冷氣/廚房', unit: '迴', suggestedPrice: 3000, price: 3000, note: '含無熔絲開關', regulation: '大功率電器需專用迴路' },
        { id: 367, name: '配電盤', spec: '12迴路', unit: '組', suggestedPrice: 8000, price: 8000, note: '含安裝', regulation: '配電盤需接地，迴路數足夠' },
        { id: 368, name: '燈具安裝', spec: '一般', unit: '盞', suggestedPrice: 500, price: 500, note: '純工資', regulation: '' },
        { id: 369, name: '燈具安裝', spec: '崁燈', unit: '盞', suggestedPrice: 350, price: 350, note: '純工資', regulation: '崁燈需注意天花板耐燃' },
        { id: 370, name: 'LED燈條', spec: '每米', unit: 'm', suggestedPrice: 250, price: 250, note: '含變壓器', regulation: 'LED變壓器需UL認證' },
        { id: 371, name: '冷水管重拉', spec: '不鏽鋼管', unit: '處', suggestedPrice: 2500, price: 2500, note: '含打牆/復原', regulation: '不鏽鋼管耐久性佳' },
        { id: 372, name: '熱水管重拉', spec: '被覆銅管', unit: '處', suggestedPrice: 5000, price: 5000, note: '含打牆/復原', regulation: '熱水管需保溫處理' },
        { id: 373, name: '排水管', spec: '2吋PVC', unit: '處', suggestedPrice: 1800, price: 1800, note: '含接頭', regulation: '排水管需坡度≥1/50' },
        { id: 374, name: '馬桶', spec: '二段式沖水', unit: '組', suggestedPrice: 8000, price: 8000, note: '含安裝', regulation: '二段式沖水省水標章' },
        { id: 375, name: '臉盆', spec: '標準型', unit: '組', suggestedPrice: 4000, price: 4000, note: '含龍頭', regulation: '龍頭建議省水標章' },
        { id: 376, name: '淋浴設備', spec: '花灑組', unit: '組', suggestedPrice: 6000, price: 6000, note: '含安裝', regulation: '淋浴區需獨立排水' },
    ],
    // ===== 室內裝潢 - 地板工程 =====
    '地板': [
        { id: 381, name: 'SPC石塑地板', spec: '卡扣式', unit: '坪', suggestedPrice: 2500, price: 2500, note: '防水/耐磨', regulation: 'SPC地板100%防水，適合浴室' },
        { id: 382, name: '超耐磨地板', spec: '卡扣式', unit: '坪', suggestedPrice: 4500, price: 4500, note: '木紋/石紋', regulation: '超耐磨係數AC4以上' },
        { id: 383, name: '海島型木地板', spec: '複合實木', unit: '坪', suggestedPrice: 8000, price: 8000, note: '含安裝', regulation: '海島型適合台灣氣候' },
        { id: 384, name: '實木地板', spec: '柚木/橡木', unit: '坪', suggestedPrice: 12000, price: 12000, note: '含安裝', regulation: '實木需定期保養上蠟' },
        { id: 385, name: '拋光石英磚', spec: '60x60cm', unit: '坪', suggestedPrice: 5500, price: 5500, note: '連工帶料', regulation: '石英磚吸水率≤0.5%' },
        { id: 386, name: '拋光石英磚', spec: '80x80cm', unit: '坪', suggestedPrice: 7500, price: 7500, note: '連工帶料', regulation: '大尺寸需乾式施工' },
        { id: 387, name: '大理石地板', spec: '國產', unit: '坪', suggestedPrice: 15000, price: 15000, note: '連工帶料', regulation: '大理石需定期拋光保養' },
        { id: 388, name: '大理石地板', spec: '進口', unit: '坪', suggestedPrice: 35000, price: 35000, note: '連工帶料', regulation: '進口石材需確認紋路' },
        { id: 389, name: '地板起翹修復', spec: '局部', unit: '坪', suggestedPrice: 2000, price: 2000, note: '純工資', regulation: '起翹原因需先排除' },
        { id: 390, name: '地板打蠟', spec: '保養', unit: '坪', suggestedPrice: 150, price: 150, note: '純工資', regulation: '實木地板每年打蠟1-2次' },
    ],
    // ===== 室內裝潢 - 玻璃工程 =====
    '玻璃': [
        { id: 401, name: '清玻璃 5mm', spec: '一般', unit: '才', suggestedPrice: 35, price: 35, note: '隔間', regulation: 'CNS 679：平板玻璃' },
        { id: 402, name: '強化玻璃 8mm', spec: '淋浴', unit: '才', suggestedPrice: 70, price: 70, note: '安全', regulation: 'CNS 2213：強化玻璃規範' },
        { id: 403, name: '強化玻璃 10mm', spec: '淋浴門', unit: '才', suggestedPrice: 90, price: 90, note: '厚實', regulation: '淋浴門建議10mm以上' },
        { id: 404, name: '膠合玻璃 5+5mm', spec: '安全', unit: '才', suggestedPrice: 120, price: 120, note: '防盜', regulation: 'CNS 14815：膠合安全玻璃' },
        { id: 405, name: '烤漆玻璃 5mm', spec: '廚房背牆', unit: '才', suggestedPrice: 150, price: 150, note: '易清潔', regulation: '烤漆玻璃耐熱易清潔' },
        { id: 406, name: '茶玻/灰玻 5mm', spec: '隔間', unit: '才', suggestedPrice: 55, price: 55, note: '半透明', regulation: '有色玻璃透光率依顏色' },
        { id: 407, name: '鏡子 5mm', spec: '銀鏡', unit: '才', suggestedPrice: 80, price: 80, note: '浴室/穿衣', regulation: '浴室鏡需防潮處理' },
        { id: 408, name: '玻璃隔間', spec: '含鋁框', unit: '才', suggestedPrice: 250, price: 250, note: '連工帶料', regulation: '玻璃隔間需考慮隔音' },
        { id: 409, name: '玻璃拉門', spec: '軌道式', unit: '才', suggestedPrice: 320, price: 320, note: '含五金', regulation: '拉門軌道需承重足夠' },
        { id: 410, name: '淋浴拉門', spec: '含五金', unit: '組', suggestedPrice: 18000, price: 18000, note: '90cm寬', regulation: '淋浴門需強化/膠合玻璃' },
    ],
};

// 類別圖示映射
const CATEGORY_ICONS = {
    '油漆': Paintbrush,
    '木作': Hammer,
    '泥作': Layers,
    '水電': Wrench,
    '玻璃': GlassWater,
    '地板': Package,
};

// 格式化金額
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'TWD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

// 類別映射：從 L2 ID 轉換為顯示名稱 (必須與 DEFAULT_MATERIALS 的 key 一致)
const CATEGORY_ID_TO_LABEL = {
    // 營建工程 L2 → 對應 DEFAULT_MATERIALS 的分類
    'concrete': '混凝土',        // 混凝土
    'rebar': '鋼筋',             // 鋼筋
    'formwork': '模板',          // 模板
    'masonry': '泥作材料',       // 泥作工程 → 泥作材料
    'tile': '磁磚材料',          // 磁磚工程 → 磁磚材料
    'coating': '塗料材料',       // 塗料工程 → 塗料材料
    'waterproof': '防水材料',    // 防水工程 → 防水材料
    'window': '門窗材料',        // 門窗工程 → 門窗材料
    'demolition': '拆除清運',    // 拆除清運
    'overview': '建築概估',      // 建築概估
    // 室內裝潢 L2 → 對應 DEFAULT_MATERIALS 的分類
    'paint': '油漆',
    'woodwork': '木作',
    'cabinet': '系統櫃',         // 系統櫃
    'electrical': '水電',
    'flooring': '地板',
    'glass': '玻璃',
};
export const CostEstimator = ({
    addToast,
    // Embedded mode props
    embedded = false,
    estimateItems: externalEstimateItems,
    setEstimateItems: externalSetEstimateItems,
    activeCategory: externalActiveCategory,
    categoryL1: _categoryL1,
}) => {
    // 狀態
    const [materials, setMaterials] = useState(DEFAULT_MATERIALS);
    const [selectedCategory, setSelectedCategory] = useState('油漆');

    // 當外部 activeCategory 變更時，同步內部狀態
    useEffect(() => {
        if (externalActiveCategory) {
            // 嘗試從映射表找到對應的類別名稱
            const mappedCategory = CATEGORY_ID_TO_LABEL[externalActiveCategory];
            if (mappedCategory && materials[mappedCategory]) {
                setSelectedCategory(mappedCategory);
            } else if (materials[externalActiveCategory]) {
                // 直接使用 activeCategory 作為類別名稱
                setSelectedCategory(externalActiveCategory);
            }
        }
    }, [externalActiveCategory, materials]);

    // 估算項目 - 支援外部狀態注入
    const [internalEstimateItems, internalSetEstimateItems] = useState([]);
    const estimateItems = externalEstimateItems ?? internalEstimateItems;
    const setEstimateItems = externalSetEstimateItems ?? internalSetEstimateItems;

    const [isLoading, setIsLoading] = useState(false);
    const [driveFolder, setDriveFolder] = useState(null);
    const [isInitializing, setIsInitializing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportedSheet, setExportedSheet] = useState(null);
    const [estimateName, setEstimateName] = useState('');

    // 編輯物料狀態
    const [editingMaterial, setEditingMaterial] = useState(null);
    // 當前 hover 的材料（用於顯示法規說明區）
    const [hoveredMaterial, setHoveredMaterial] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', spec: '', unit: '', price: 0, note: '' });

    // 計算總價
    const totalCost = estimateItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 新增估算項目
    const addEstimateItem = (material) => {
        const existing = estimateItems.find(item => item.id === material.id);
        if (existing) {
            setEstimateItems(items =>
                items.map(item =>
                    item.id === material.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );
        } else {
            setEstimateItems([...estimateItems, { ...material, quantity: 1 }]);
        }
        addToast?.(`已加入 ${material.name}`, 'success');
    };

    // 更新數量
    const updateQuantity = (id, quantity) => {
        if (quantity <= 0) {
            setEstimateItems(items => items.filter(item => item.id !== id));
        } else {
            setEstimateItems(items =>
                items.map(item =>
                    item.id === id ? { ...item, quantity } : item
                )
            );
        }
    };

    // 移除項目
    const removeItem = (id) => {
        setEstimateItems(items => items.filter(item => item.id !== id));
    };

    // 清空估算
    const clearEstimate = () => {
        setEstimateItems([]);
        addToast?.('已清空估算清單', 'info');
    };

    // 初始化 Drive 資料夾
    const initializeDriveFolder = async () => {
        setIsInitializing(true);
        try {
            const result = await GoogleService.createCostEstimatorFolder();
            if (result.success) {
                setDriveFolder(result);
                addToast?.('已建立 Drive 資料夾及資料庫', 'success');
            } else {
                addToast?.(result.error || '建立失敗', 'error');
            }
        } catch (error) {
            console.error('Initialize folder error:', error);
            addToast?.('初始化失敗：' + error.message, 'error');
        } finally {
            setIsInitializing(false);
        }
    };

    // 從 Drive 載入物料資料
    const loadMaterialsFromDrive = async () => {
        setIsLoading(true);
        try {
            const result = await GoogleService.getMaterialPrices();
            if (result.success && result.data?.materials) {
                setMaterials(result.data.materials);
                addToast?.('已從 Drive 載入物料資料', 'success');
            } else {
                // 使用預設資料
                addToast?.('使用本機預設資料', 'info');
            }
        } catch (error) {
            console.error('Load materials error:', error);
            addToast?.('載入失敗，使用本機資料', 'warning');
        } finally {
            setIsLoading(false);
        }
    };

    // 開始編輯物料
    const startEditMaterial = (material) => {
        setEditingMaterial(material.id);
        setEditForm({ ...material });
    };

    // 儲存編輯
    const saveEditMaterial = async () => {
        setMaterials(prev => ({
            ...prev,
            [selectedCategory]: prev[selectedCategory].map(m =>
                m.id === editingMaterial ? { ...m, ...editForm, price: parseFloat(editForm.price) } : m
            )
        }));
        setEditingMaterial(null);
        addToast?.('已更新物料價格', 'success');

        // 同步到 Drive（背景執行）
        GoogleService.updateMaterialPrice(selectedCategory, editForm).catch(console.error);
    };

    // 取消編輯
    const cancelEdit = () => {
        setEditingMaterial(null);
        setEditForm({ name: '', spec: '', unit: '', price: 0, note: '' });
    };

    // 匯出估算清單到 Google Sheet
    const exportToSheet = async () => {
        if (estimateItems.length === 0) {
            addToast?.('請先加入估算項目', 'warning');
            return;
        }

        const name = estimateName.trim() || `估算清單_${new Date().toLocaleDateString('zh-TW').replace(/\//g, '-')}`;

        setIsExporting(true);
        try {
            // 為每個項目添加類別資訊
            const itemsWithCategory = estimateItems.map(item => {
                // 找出這個物料屬於哪個類別
                let itemCategory = '未分類';
                for (const [cat, mats] of Object.entries(materials)) {
                    if (mats.some(m => m.id === item.id)) {
                        itemCategory = cat;
                        break;
                    }
                }
                return { ...item, category: itemCategory };
            });

            const result = await GoogleService.exportEstimateToSheet(name, itemsWithCategory, totalCost);

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

    const categories = Object.keys(materials);
    const currentMaterials = materials[selectedCategory] || [];

    // Embedded mode: 簡化渲染（只顯示成本項目庫 + 法規說明區，估價單由父組件處理）
    if (embedded) {
        return (
            <div className="space-y-4">
                {/* 成本項目庫 (加大) */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Package size={16} className="text-gray-600" />
                        <span className="font-medium text-gray-800 text-sm">成本項目庫</span>
                        <span className="text-xs text-gray-400">{selectedCategory} / {currentMaterials.length}項</span>
                    </div>
                    <div className="space-y-2 max-h-[350px] overflow-y-auto">
                        {currentMaterials.map(material => (
                            <div
                                key={material.id}
                                className={`flex items-center justify-between py-2 px-2 border-b border-gray-100 last:border-0 rounded-lg transition-colors cursor-pointer ${hoveredMaterial?.id === material.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-white'}`}
                                onMouseEnter={() => setHoveredMaterial(material)}
                                onMouseLeave={() => setHoveredMaterial(null)}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-800 text-sm">{material.name}</span>
                                        {material.regulation && (
                                            <Info size={14} className="text-blue-400" />
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500">{material.spec}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-400">建議價: ${material.suggestedPrice || material.price}</span>
                                        <span className="text-gray-300">|</span>
                                        <span className="text-xs text-gray-600">單價:</span>
                                        <input
                                            type="number"
                                            defaultValue={material.price}
                                            onChange={(e) => {
                                                const newPrice = parseFloat(e.target.value) || material.suggestedPrice || material.price;
                                                material.price = newPrice;
                                            }}
                                            className="w-20 px-1.5 py-0.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                                            min="0"
                                            step="any"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <span className="text-xs text-gray-500">/{material.unit}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); addEstimateItem(material); }}
                                    className="p-2 bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors ml-2"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 法規/施工說明區 (新增) */}
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 min-h-[140px]">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText size={16} className="text-amber-600" />
                        <span className="font-medium text-amber-800 text-sm">法規/施工說明</span>
                    </div>
                    {hoveredMaterial ? (
                        <div className="text-sm">
                            <div className="font-medium text-gray-800 mb-1">
                                {hoveredMaterial.name} <span className="text-xs text-gray-500">({hoveredMaterial.spec})</span>
                            </div>
                            {hoveredMaterial.regulation ? (
                                <div className="text-gray-700 leading-relaxed">
                                    <div className="flex items-start gap-2">
                                        <span className="text-amber-500">📋</span>
                                        <span>{hoveredMaterial.regulation}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-500 text-xs italic">此項目尚無法規說明資料</div>
                            )}
                            <div className="mt-2 text-xs text-amber-600 border-t border-amber-200 pt-2">
                                ⚠️ 施工建議需多方映證及核對，建議參考建築技術規則及室內裝修管理辦法
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-500 text-sm">
                            <p>移動滑鼠至材料項目上，即可顯示：</p>
                            <ul className="text-xs mt-1 space-y-0.5 text-gray-400">
                                <li>• 建築技術規則相關條文</li>
                                <li>• 室內裝修管理辦法規範</li>
                                <li>• 施工建議與注意事項</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Standalone mode: 完整頁面渲染
    return (
        <div className="space-y-6 animate-fade-in">
            <SectionTitle title="營建物料成本快速估算" />

            {/* 說明區 */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex gap-3">
                <Info size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-orange-800">
                    <p className="font-medium mb-1">快速估算材料成本</p>
                    <p className="text-orange-600">選擇物料類別，點擊加入估算清單，系統將自動計算總價。可連結 Google Drive 同步物料資料庫。</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 左側：類別選擇與物料列表 */}
                <div className="lg:col-span-2 space-y-4">
                    {/* 類別選擇 */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-sm font-medium text-gray-700">物料類別</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={loadMaterialsFromDrive}
                                    disabled={isLoading}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                                    同步
                                </button>
                                <button
                                    onClick={initializeDriveFolder}
                                    disabled={isInitializing}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <FolderPlus size={14} />
                                    {isInitializing ? '建立中...' : '初始化資料庫'}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                            {categories.map(category => {
                                const Icon = CATEGORY_ICONS[category] || Package;
                                return (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${selectedCategory === category
                                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <Icon size={20} />
                                        <span className="font-medium text-xs">{category}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 物料列表 */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            {React.createElement(CATEGORY_ICONS[selectedCategory] || Package, { size: 20 })}
                            {selectedCategory}物料價格表
                        </h4>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 px-2 font-medium text-gray-600">名稱</th>
                                        <th className="text-left py-2 px-2 font-medium text-gray-600">規格</th>
                                        <th className="text-right py-2 px-2 font-medium text-gray-600">單位</th>
                                        <th className="text-right py-2 px-2 font-medium text-gray-600">單價</th>
                                        <th className="text-center py-2 px-2 font-medium text-gray-600">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentMaterials.map(material => (
                                        <tr key={material.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            {editingMaterial === material.id ? (
                                                <>
                                                    <td className="py-2 px-2">
                                                        <input
                                                            type="text"
                                                            value={editForm.name}
                                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                            className="w-full px-2 py-1 border rounded text-sm"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-2">
                                                        <input
                                                            type="text"
                                                            value={editForm.spec}
                                                            onChange={(e) => setEditForm({ ...editForm, spec: e.target.value })}
                                                            className="w-full px-2 py-1 border rounded text-sm"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-2 text-right">
                                                        <input
                                                            type="text"
                                                            value={editForm.unit}
                                                            onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                                                            className="w-16 px-2 py-1 border rounded text-sm text-right"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-2 text-right">
                                                        <input
                                                            type="number"
                                                            value={editForm.price}
                                                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                                            className="w-20 px-2 py-1 border rounded text-sm text-right"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-2 text-center">
                                                        <div className="flex justify-center gap-1">
                                                            <button onClick={saveEditMaterial} className="p-1 text-green-600 hover:bg-green-100 rounded">
                                                                <Check size={16} />
                                                            </button>
                                                            <button onClick={cancelEdit} className="p-1 text-red-600 hover:bg-red-100 rounded">
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="py-2 px-2 font-medium">{material.name}</td>
                                                    <td className="py-2 px-2 text-gray-500">{material.spec}</td>
                                                    <td className="py-2 px-2 text-right text-gray-500">{material.unit}</td>
                                                    <td className="py-2 px-2 text-right font-bold text-orange-600">
                                                        {formatCurrency(material.price)}
                                                    </td>
                                                    <td className="py-2 px-2 text-center">
                                                        <div className="flex justify-center gap-1">
                                                            <button
                                                                onClick={() => addEstimateItem(material)}
                                                                className="p-1.5 bg-orange-100 text-orange-600 hover:bg-orange-200 rounded-lg transition-colors"
                                                                title="加入估算"
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => startEditMaterial(material)}
                                                                className="p-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                                                title="編輯價格"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {currentMaterials.length > 0 && currentMaterials[0].note && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
                                <strong>備註：</strong>
                                {currentMaterials.map((m, i) => (
                                    <span key={m.id}>
                                        {m.name}: {m.note}{i < currentMaterials.length - 1 ? ' | ' : ''}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 右側：估算清單與總計 */}
                <div className="space-y-4">
                    {/* 估算清單 */}
                    <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-2xl p-5 text-white">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-bold flex items-center gap-2">
                                <Calculator size={20} />
                                估算清單
                            </span>
                            {estimateItems.length > 0 && (
                                <button
                                    onClick={clearEstimate}
                                    className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
                                >
                                    清空
                                </button>
                            )}
                        </div>

                        {estimateItems.length === 0 ? (
                            <div className="text-center py-8 text-orange-200">
                                <Package size={40} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">點擊物料 + 加入估算</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {estimateItems.map(item => (
                                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-white/20 last:border-0">
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{item.name}</div>
                                            <div className="text-xs text-orange-200">
                                                {formatCurrency(item.price)} / {item.unit}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-6 h-6 bg-white/20 hover:bg-white/30 rounded text-sm"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(item.id, parseFloat(e.target.value) || 0)}
                                                className="w-14 text-center bg-white/20 rounded py-1 text-sm"
                                            />
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-6 h-6 bg-white/20 hover:bg-white/30 rounded text-sm"
                                            >
                                                +
                                            </button>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="p-1 hover:bg-white/20 rounded text-red-300"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 小計 */}
                        {estimateItems.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/30">
                                {estimateItems.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm text-orange-100 mb-1">
                                        <span>{item.name} × {item.quantity}</span>
                                        <span>{formatCurrency(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 總計 */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">材料總計</span>
                            <span className="text-3xl font-bold text-orange-600">
                                {formatCurrency(totalCost)}
                            </span>
                        </div>
                        <div className="text-xs text-gray-400 text-right">
                            共 {estimateItems.length} 項材料
                        </div>

                        {/* 快速估算 */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="text-sm font-medium text-gray-700 mb-2">快速估算（含工資）</div>
                            <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>+工資（約30%）</span>
                                    <span>{formatCurrency(totalCost * 0.3)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>+管理費（約10%）</span>
                                    <span>{formatCurrency(totalCost * 0.1)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-gray-800 pt-2 border-t">
                                    <span>預估總價</span>
                                    <span className="text-orange-600">{formatCurrency(totalCost * 1.4)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Drive 資料夾連結 */}
                    {driveFolder && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="text-sm font-medium text-green-800 mb-1">資料庫已同步</div>
                            <a
                                href={driveFolder.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-green-600 hover:underline"
                            >
                                開啟 Google Drive 資料夾 →
                            </a>
                        </div>
                    )}

                    {/* 匯出到 Google Sheet */}
                    {estimateItems.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <FileSpreadsheet size={18} className="text-blue-600" />
                                <span className="font-medium text-blue-800">匯出估算清單到 Google Sheet</span>
                            </div>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={estimateName}
                                    onChange={(e) => setEstimateName(e.target.value)}
                                    placeholder="輸入估算清單名稱（選填）"
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

                            {/* 已匯出的 Sheet 連結 */}
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
            </div>

            {/* 估算公式說明 */}
            <div className="bg-gray-50 rounded-2xl p-5">
                <h4 className="font-bold text-gray-800 mb-3">常用估算公式</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white p-3 rounded-xl">
                        <div className="font-medium text-gray-700 mb-1">🎨 油漆用量</div>
                        <div className="text-gray-500">面積(坪) × 0.5 = 用量(加侖)</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl">
                        <div className="font-medium text-gray-700 mb-1">🪵 木作板材</div>
                        <div className="text-gray-500">面積(才) ÷ 36 = 需要片數</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl">
                        <div className="font-medium text-gray-700 mb-1">🧱 磁磚損耗</div>
                        <div className="text-gray-500">面積(坪) × 1.1 = 含損耗量</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CostEstimator;
