
export const MOCK_DB = {
    clients: [
        {
            id: "c-1",
            name: "林先生",
            status: "已簽約",
            source: "網路廣告",
            phone: "0912-345-678",
            email: "lin@example.com",
            address: "台北市信義區...",
            driveFolder: "https://drive.google.com/drive/folders/mock-lin",
            customFields: [
                { label: "房屋類型", value: "電梯大樓" },
                { label: "風格偏好", value: "現代簡約" },
                { label: "家庭成員", value: "夫妻+1子" },
                { label: "預算範圍", value: "300-500萬" },
                { label: "備註", value: "喜歡大理石，主臥需有更衣室。" }
            ],
            lastContact: "2025-12-06"
        },
        {
            id: "c-2",
            name: "陳小姐",
            status: "提案/報價",
            source: "朋友介紹",
            phone: "0922-333-444",
            email: "chen@example.com",
            address: "台北市大安區...",
            driveFolder: "https://drive.google.com/drive/folders/mock-chen",
            customFields: [
                { label: "房屋類型", value: "電梯大樓" },
                { label: "風格偏好", value: "北歐風" },
                { label: "特殊需求", value: "有養兩隻貓，需貓跳台。" }
            ],
            lastContact: "2025-12-07"
        }
    ],
    projects: [
        {
            id: "p-1", code: "P-23001", name: "信義區林公館", type: "翻修", status: "施工中", progress: 65, dueDate: "2025-03-15", clientName: "林先生", budget: 350,
            milestones: [{ date: "2025-12-15", name: "木工退場" }, { date: "2025-12-20", name: "油漆進場" }],
            records: [
                { id: "r-1", date: "2025-12-01", type: "工程", content: "水電配管完成，試壓正常。", photos: ["配管.jpg"], author: "Alex" },
                { id: "r-2", date: "2025-12-05", type: "會議", content: "業主確認磁磚樣式，選定馬可貝里 R60。", photos: [], author: "Alex" }
            ],
            files: [
                { id: "f-1", name: "平面配置圖_v3.pdf", type: "pdf", url: "#", size: "2.4MB", date: "2025-11-20" },
                { id: "f-2", name: "工程合約書.pdf", type: "pdf", url: "#", size: "1.1MB", date: "2025-11-15" }
            ]
        },
        { id: "p-2", code: "P-24002", name: "大安森林公園景觀", type: "新建", status: "設計中", progress: 30, dueDate: "2025-06-20", clientName: "大安區公所", budget: 980, milestones: [{ date: "2025-12-18", name: "第二次提案會議" }], records: [], files: [] },
        { id: "p-3", code: "P-24003", name: "南港軟體園區辦公室", type: "商空", status: "完工驗收", progress: 95, dueDate: "2025-02-28", clientName: "科技股份公司", budget: 1280, milestones: [], records: [], files: [] },
        { id: "p-4", code: "P-24004", name: "內湖張公館", type: "翻修", status: "設計中", progress: 15, dueDate: "2025-08-10", clientName: "張先生", budget: 420, milestones: [{ date: "2025-12-12", name: "現場丈量" }], records: [], files: [] }
    ],
    finance: {
        accounts: [
            { id: "a-1", name: "玉山營運", bank: "玉山銀行", number: "808-1234-5678-9012", balance: 2360, note: "主要收支帳戶" },
            { id: "a-2", name: "公司零用金", bank: "現金箱", number: "-", balance: -2, note: "日常雜支" },
            { id: "a-3", name: "台新薪轉", bank: "台新銀行", number: "987-654-321", balance: 0, note: "薪轉專用" }
        ],
        transactions: [
            { id: "t-1", date: "2025-12-05", type: "收入", amount: 800, accountId: "a-1", projectId: "p-1", desc: "信義林公館 - 第2期工程款", synced: true },
            { id: "t-2", date: "2025-12-08", type: "支出", amount: 30, accountId: "a-1", projectId: "p-1", desc: "水電建材料件", synced: false },
            { id: "t-3", date: "2025-12-10", type: "支出", amount: 2, accountId: "a-2", projectId: "p-2", desc: "辦公室文具", synced: false },
            { id: "t-4", date: "2025-12-11", type: "支出", amount: 15, accountId: "a-1", projectId: "p-3", desc: "油漆補料", synced: true },
            { id: "t-5", date: "2025-12-25", type: "收入", amount: 300, accountId: "a-3", projectId: "p-2", desc: "設計費首款 (預計)", synced: false }
        ]
    },
    vendors: [
        { id: "v-1", name: "大師兄精緻木工坊", category: "工程工班", tradeType: "木工", contactPerson: "王大哥", phone: "0912-345-678", address: "新北市板橋區文化路一段...", status: "長期合作", rating: 4.9, lastProject: "信義區林公館", tags: ["配合度高", "手工細緻"] },
        { id: "v-2", name: "永亮專業水電", category: "工程工班", tradeType: "水電", contactPerson: "張師傅", phone: "0922-333-444", address: "新店區...", status: "合作中", rating: 4.5, lastProject: "南港軟體園區", tags: ["配線整齊"] },
        { id: "v-3", name: "佳佳油漆", category: "工程工班", tradeType: "油漆", contactPerson: "李老闆", phone: "0911-222-333", address: "台北市松山區...", status: "觀察中", rating: 3.8, lastProject: "內湖張公館", tags: ["價格便宜"] },
        { id: "v-4", name: "美居家飾", category: "建材供應", tradeType: "軟裝", contactPerson: "Amy", phone: "02-2345-6789", address: "台北市內湖區...", status: "長期合作", rating: 4.8, lastProject: "大安森林公園", tags: ["品項多"] }
    ],
    inventory: [
        { id: "i-1", name: "Panasonic 開關", spec: "PN-001", quantity: 50, unit: "組", safeStock: 10, location: "A-01", restockDate: "2025-12-20", status: "充足" },
        { id: "i-2", name: "得利乳膠漆 (白)", spec: "PT-W01", quantity: 5, unit: "桶", safeStock: 10, location: "B-02", restockDate: "2025-12-15", status: "庫存偏低" },
        { id: "i-3", name: "T5 層板燈", spec: "LGT-T5", quantity: 100, unit: "支", safeStock: 20, location: "A-03", restockDate: "", status: "充足" }
    ],
    calendar: [
        { id: "evt-1", title: "信義林公館-木工進場", date: "2025-12-07", time: "10:00 AM", type: "construction", color: "orange" },
        { id: "evt-2", title: "陳小姐-平面圖提案會議", date: "2025-12-07", time: "02:00 PM", type: "meeting", color: "blue" },
        { id: "evt-3", title: "內湖張公館-丈量", date: "2025-12-12", time: "04:30 PM", type: "meeting", color: "blue" }
    ]
};
