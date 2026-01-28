/**
 * 結構工程計算器
 * 從 MaterialCalculator.jsx 提取
 */
import React, { useState } from 'react';
import {
    Info, Plus, Trash2, ChevronDown, ChevronUp,
    Calculator, Building2, Layers, Settings2, ExternalLink
} from 'lucide-react';

import {
    DEFAULT_WASTAGE,
    REBAR_SPECS,
    REBAR_SIZES,
    REBAR_SPACING_OPTIONS,
    REBAR_LAYER_OPTIONS,
    REBAR_USAGE_BY_COMPONENT,
    REBAR_RATIO_BY_COMPONENT,
    CONCRETE_GRADES,
    PARAPET_THICKNESS_OPTIONS,
    GROUND_BEAM_PRESETS,
    COLUMN_PRESETS,
    WALL_THICKNESS_PRESETS,
    FLOOR_THICKNESS_PRESETS,
    COLUMN_MAIN_BAR_COUNT,
    FORMWORK_TYPES,
    CONSTRUCTION_CONDITIONS,
    REGULATION_REFS,
    GROUNDBEAM_PRESETS_REBAR,
    COLUMN_PRESETS_REBAR,
    BEAM_PRESETS_REBAR,
    SLAB_PRESETS_REBAR,
} from '../constants';

import {
    InputField,
    SelectField,
    WastageControl,
    RegulationReference,
    ResultDisplay,
} from './SharedComponents';

// 工具函數
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

export default StructureCalculator;
