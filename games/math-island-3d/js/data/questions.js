/**
 * 3D 數學立體群島大冒險 - 中英雙語題庫與同構相似題規格引擎
 * 改編自：115學年度六年級數學第一次定期評量 (五芒星數域試煉塔)
 * 完整支援繁體中文 (zh) 與英文 (en) 雙語即時切換
 */

export const ISLANDS_METADATA = [
  {
    id: 1,
    key: "unit1",
    name: "質源與公倍神廟",
    name_en: "Temple of Primes & Multiples",
    subtitle: "第 01 單元：最大公因數與最小公倍數",
    subtitle_en: "Unit 01: Greatest Common Divisor & Least Common Multiple",
    color: "#f59e0b",
    badgeColor: "#d97706",
    islandPos: [-36, 0, 24],
    description: "漂浮於金色雲海上的遠古神廟。古老的齒輪與石碑記載著質數的秘密與公因公倍的共鳴法則。",
    description_en: "An ancient temple floating on golden clouds. Historic gears and obelisks hold the secrets of primes and resonant multiples.",
    levelsCount: 5
  },
  {
    id: 2,
    key: "unit2",
    name: "分數微積分水島",
    name_en: "Fraction Hydro Isle",
    subtitle: "第 02 單元：分數除法",
    subtitle_en: "Unit 02: Fraction Division",
    color: "#0284c7",
    badgeColor: "#0369a1",
    islandPos: [-18, 0, -20],
    description: "由清澈泉水與水晶導管貫穿的水上都市。精確調控分數閥門與帶分數容量，才能讓魔導水輪持續運轉。",
    description_en: "A floating water metropolis threaded with crystal conduits. Regulate fractional valves to keep the watermill turning.",
    levelsCount: 5
  },
  {
    id: 3,
    key: "unit3",
    name: "時光規律與間隔迴廊",
    name_en: "Temporal Pattern Corridor",
    subtitle: "第 03 單元：數量關係",
    subtitle_en: "Unit 03: Quantitative Relations & Invariants",
    color: "#16a34a",
    badgeColor: "#15803d",
    islandPos: [14, 0, -28],
    description: "聳立著正八邊形能量光柱與古老日晷的翡翠森林。掌握和差積商的不變規律與路燈植樹的間隔奧義。",
    description_en: "An emerald forest with octagonal crystal pillars and sun-dials. Master invariant rules and interval tree-planting logic.",
    levelsCount: 5
  },
  {
    id: 4,
    key: "unit4",
    name: "小數精準天秤城",
    name_en: "Decimal Scale Citadel",
    subtitle: "第 04 單元：小數除法",
    subtitle_en: "Unit 04: Decimal Division",
    color: "#9333ea",
    badgeColor: "#7e22ce",
    islandPos: [34, 0, 8],
    description: "由千分位精準齒輪與黃金導線熔爐構成的蒸氣天空城。理解小數點位移本質，掌控能量輸出的微觀平衡。",
    description_en: "A steampunk sky-city of brass scales and smelting furnaces. Understand decimal place value shifts to master energy balances.",
    levelsCount: 5
  },
  {
    id: 5,
    key: "unit5",
    name: "黃金比例空島",
    name_en: "Golden Ratio Sky Isle",
    subtitle: "第 05 單元：比與比值",
    subtitle_en: "Unit 05: Ratio and Value of Ratio",
    color: "#e11d48",
    badgeColor: "#be123c",
    islandPos: [0, 4, 38],
    description: "傳說中的聖域神殿，由純金比例石門守護。調和前項與後項元素、按比分配，贏取最終的數域宗師徽章！",
    description_en: "A legendary sanctuary guarded by a golden ratio triumphal arch. Harmonize antecedent and consequent to claim the Grandmaster Medal!",
    levelsCount: 5
  }
];

export const QUESTIONS_DATA = [
  // ==========================================
  // 【單元一：最大公因數與最小公倍數】
  // ==========================================
  {
    id: "u1_l1",
    unitId: 1,
    levelNum: 1,
    title: "星辰石板選拔（質數與合數概念）",
    title_en: "Celestial Slate Selection (Primes & Composites)",
    type: "觀念選擇題",
    type_en: "Concept Selection",
    story: "神廟第一道石門上鑲嵌著編號 1 到 25 的能量石板。守護像傳音：「只有選中『質數』石板，神門才會開啟。」四位探險家提出各自的主張，請問誰的說法完全正確？",
    story_en: "The first temple gate is embedded with energy slates numbered 1 to 25. The guardian statue proclaims: 'Only by selecting a PRIME slate will the gate open.' Four adventurers present their claims. Whose statement is completely correct?",
    question: "下列關於 1 到 25 之間「質數」與「合數」的判斷，哪一位探險家的說法是正確的？",
    question_en: "Which adventurer's statement regarding 'Prime' and 'Composite' numbers between 1 and 25 is correct?",
    options: [
      {
        text: "雷恩：「編號 2 是唯一的偶數質數，而且在 1 到 25 當中，總共有 9 塊質數石板！」",
        text_en: "Ray: 'Number 2 is the ONLY even prime, and there are exactly 9 prime slates between 1 and 25!'",
        isCorrect: true,
        reason: "完全正確！質數定義為大於1且因數只有1與本身的數。1~25的質數有：2, 3, 5, 7, 11, 13, 17, 19, 23 共 9 個，且 2 是唯一的偶數質數。",
        reason_en: "Correct! Primes have exactly two factors (1 and itself). The primes from 1 to 25 are 2, 3, 5, 7, 11, 13, 17, 19, 23 (9 total), and 2 is the only even prime."
      },
      {
        text: "亞瑟：「編號 1 的因數只有 1，所以 1 是最小的質數，一定要選！」",
        text_en: "Arthur: 'Number 1 has only one factor, so 1 is the smallest prime!'",
        isCorrect: false,
        reason: "迷思錯誤！1 只有一個因數，不是質數也不是合數。最小的質數是 2。",
        reason_en: "Misconception! 1 has only one factor, so it is neither prime nor composite. The smallest prime is 2."
      },
      {
        text: "莉莉：「所有的奇數都是質數，所以 9、15、21、25 都是質數石板！」",
        text_en: "Lily: 'All odd numbers are prime, so 9, 15, 21, and 25 must be primes!'",
        isCorrect: false,
        reason: "迷思錯誤！9 (3x3)、15 (3x5)、21 (3x7)、25 (5x5) 都是奇數合數，並非所有奇數都是質數。",
        reason_en: "Misconception! 9, 15, 21, and 25 are odd composite numbers, not primes."
      },
      {
        text: "朵拉：「所有的偶數都是 2 的倍數，所以偶數號石板全部都是合數！」",
        text_en: "Dora: 'All even numbers are multiples of 2, so all even slates are composite!'",
        isCorrect: false,
        reason: "迷思錯誤！數字 2 本身是偶數，但它的因數只有 1 和 2，所以 2 是質數不是合數。",
        reason_en: "Misconception! 2 is an even number, but it is a prime number, not composite."
      }
    ],
    hint: "質數的因數恰好有 2 個（1 和自己）。注意 1 既非質數也非合數；2 是唯一的偶數質數。",
    hint_en: "A prime number has exactly 2 factors (1 and itself). 1 is neither prime nor composite; 2 is the only even prime.",
    svgType: "prime_grid",
    solution: "【解題核心】\n1. 1 不是質數也不是合數（因數只有 1 個）。\n2. 2 是唯一的偶數質數（因數有 1, 2）。\n3. 1~25 的質數有：2, 3, 5, 7, 11, 13, 17, 19, 23，總共剛好 9 個。\n4. 9、15、21、25 都有超過兩個因數，屬於奇數合數。",
    solution_en: "[Solution Breakdown]\n1. 1 is neither prime nor composite.\n2. 2 is the only even prime.\n3. Primes from 1 to 25 are 2, 3, 5, 7, 11, 13, 17, 19, 23 (9 in total).\n4. 9, 15, 21, 25 have more than two factors and are odd composites."
  },
  {
    id: "u1_l2",
    unitId: 1,
    levelNum: 2,
    title: "蒸氣核心動力鎖（質因數分解與互質）",
    title_en: "Steam Core Power Lock (Prime Factorization & Coprime)",
    type: "情境推理題",
    type_en: "Contextual Reasoning",
    story: "神殿主機關需要兩步驟驗證：第一齒輪刻著數字 180，必須寫出其質因數分解；第二主動輪有 15 個齒，必須從備用箱中挑出一個與其「互質」的從動輪咬合，才不會產生能量排斥。",
    story_en: "The main temple lock requires two validations: gear 1 is inscribed with 180, requiring its prime factorization; gear 2 has 15 teeth, requiring a matching gear from the chest that is 'coprime' to 15 to avoid magic repulsion.",
    question: "將 180 做質因數分解，並從 A(18齒)、B(28齒)、C(35齒) 中選出與 15 齒「互質」的齒輪：",
    question_en: "Find the prime factorization of 180, and select the gear coprime to 15 teeth from A (18 teeth), B (28 teeth), C (35 teeth):",
    options: [
      {
        text: "180 = 2 × 2 × 3 × 3 × 5，且挑選 B(28齒) 齒輪",
        text_en: "180 = 2 × 2 × 3 × 3 × 5, and choose Gear B (28 teeth)",
        isCorrect: true,
        reason: "正確！180分解為 2×2×3×3×5。15的因數有1,3,5,15；28的因數有1,2,4,7,14,28，兩數最大公因數為1，故15與28互質。",
        reason_en: "Correct! 180 = 2 × 2 × 3 × 3 × 5. Factors of 15 are 1, 3, 5, 15; factors of 28 are 1, 2, 4, 7, 14, 28. Their GCD is 1, so 15 and 28 are coprime."
      },
      {
        text: "180 = 4 × 9 × 5，且挑選 B(28齒) 齒輪",
        text_en: "180 = 4 × 9 × 5, and choose Gear B (28 teeth)",
        isCorrect: false,
        reason: "錯誤！4 與 9 不是質數，質因數分解必須全部由質數相乘。",
        reason_en: "Incorrect! 4 and 9 are composite numbers, not primes."
      },
      {
        text: "180 = 2 × 2 × 3 × 3 × 5，且挑選 A(18齒) 齒輪",
        text_en: "180 = 2 × 2 × 3 × 3 × 5, and choose Gear A (18 teeth)",
        isCorrect: false,
        reason: "錯誤！15 與 18 有公因數 3，兩者沒有互質。",
        reason_en: "Incorrect! 15 and 18 share a common factor of 3 (not coprime)."
      },
      {
        text: "180 = 2 × 2 × 3 × 3 × 5，且挑選 C(35齒) 齒輪",
        text_en: "180 = 2 × 2 × 3 × 3 × 5, and choose Gear C (35 teeth)",
        isCorrect: false,
        reason: "錯誤！15 與 35 有公因數 5，兩者沒有互質。",
        reason_en: "Incorrect! 15 and 35 share a common factor of 5 (not coprime)."
      }
    ],
    hint: "質因數分解只能由「質數」連乘。兩數的公因數只有 1 時，才稱為「互質」。",
    hint_en: "Prime factorization must only consist of prime factors. Two numbers are coprime when their only common factor is 1.",
    svgType: "prime_tree",
    solution: "【解題核心】\n1. 180 短除法：180÷2=90, 90÷2=45, 45÷3=15, 15÷3=5，故 180 = 2 × 2 × 3 × 3 × 5。\n2. 檢查互質：\n   • 15 與 18：最大公因數是 3（不互質）\n   • 15 與 35：最大公因數是 5（不互質）\n   • 15 與 28：15=3×5, 28=2×2×7，最大公因數是 1（互質，正確！）",
    solution_en: "[Solution Breakdown]\n1. 180 ÷ 2 = 90, 90 ÷ 2 = 45, 45 ÷ 3 = 15, 15 ÷ 3 = 5 => 180 = 2 × 2 × 3 × 3 × 5.\n2. Checking coprime:\n   • GCD(15, 18) = 3\n   • GCD(15, 35) = 5\n   • GCD(15, 28) = 1 (Coprime, correct!)"
  },
  {
    id: "u1_l3",
    unitId: 1,
    levelNum: 3,
    title: "雙子魔晶頻率共鳴（質因數逆推與最小公倍數）",
    title_en: "Twin Crystal Resonance (GCD/LCM Inverse Problem)",
    type: "進階計算題",
    type_en: "Advanced Calculation",
    story: "神殿祭壇同時供奉兩顆魔力石：甲 = 2 × 3 × a，乙 = 2 × 7 × a（a 代表一個未知質數）。祭壇石碑記載：「兩顆魔力石能量的最大公因數為 22」。",
    story_en: "The altar enshrines two magic stones: X = 2 × 3 × a, Y = 2 × 7 × a (where a is an unknown prime). The stele records: 'The Greatest Common Divisor of both stones is 22.'",
    question: "請問未知的質數 a 是多少？且甲、乙兩數的「最小公倍數」是多少？",
    question_en: "What is the unknown prime 'a', and what is the Least Common Multiple (LCM) of X and Y?",
    options: [
      {
        text: "未知質數 a = 11，兩數最小公倍數為 462",
        text_en: "Unknown prime a = 11, and LCM = 462",
        isCorrect: true,
        reason: "正確！甲與乙的共同質因數為 2 與 a，故最大公因數 = 2 × a = 22 => a = 11。最小公倍數 = 2 × 3 × 7 × a = 2 × 3 × 7 × 11 = 462。",
        reason_en: "Correct! The shared prime factors are 2 and a, so GCD = 2 × a = 22 => a = 11. LCM = 2 × 3 × 7 × 11 = 462."
      },
      {
        text: "未知質數 a = 11，兩數最小公倍數為 924",
        text_en: "Unknown prime a = 11, and LCM = 924",
        isCorrect: false,
        reason: "錯誤！重複乘了兩次公因數 (2×11)，最小公倍數不需要將共同因數重複計算兩次。",
        reason_en: "Incorrect! Multiplied the shared factors twice."
      },
      {
        text: "未知質數 a = 22，兩數最小公倍數為 462",
        text_en: "Unknown prime a = 22, and LCM = 462",
        isCorrect: false,
        reason: "錯誤！22 不是質數，且最大公因數為 2 × a = 22，故 a 應為 11。",
        reason_en: "Incorrect! 22 is not prime; a = 22 ÷ 2 = 11."
      },
      {
        text: "未知質數 a = 11，兩數最小公倍數為 14",
        text_en: "Unknown prime a = 11, and LCM = 14",
        isCorrect: false,
        reason: "錯誤！14 是 2 × 7，完全算錯了公倍數。",
        reason_en: "Incorrect! 14 is just 2 × 7."
      }
    ],
    hint: "最大公因數是所有共同質因數的乘積；最小公倍數是所有質因數取最高次方相乘。",
    hint_en: "GCD is the product of all common prime factors; LCM is the product of all prime factors at their highest powers.",
    svgType: "gcd_lcm_venn",
    solution: "【解題核心】\n1. 甲 = 2 × 3 × a，乙 = 2 × 7 × a。\n2. 兩數共同質因數為 2 和 a，因此最大公因數 (GCD) = 2 × a = 22 => a = 11。\n3. 最小公倍數 (LCM) 包含所有質因數連乘：2 × 3 × 7 × a = 42 × 11 = 462。",
    solution_en: "[Solution Breakdown]\n1. X = 2 × 3 × a, Y = 2 × 7 × a.\n2. Common factors are 2 and a => GCD = 2 × a = 22 => a = 11.\n3. LCM = 2 × 3 × 7 × a = 42 × 11 = 462."
  },
  {
    id: "u1_l4",
    unitId: 1,
    levelNum: 4,
    title: "藏寶庫金磚鋪設（長方形裁切最大正方形）",
    title_en: "Treasury Tile Paving (Rectangle to Largest Squares)",
    type: "幾何應用題",
    type_en: "Geometric Application",
    story: "神廟地下藏寶庫是一間長 360 公分、寬 240 公分的長方形地面。守護者要求用大小相同且邊長為整數公分的「最大正方形金磚」把地面鋪滿（金磚不可切割裁損）。",
    story_en: "The temple vault floor is a rectangle 360 cm long and 240 cm wide. Pave the entire floor with the largest identical square gold tiles without cutting.",
    question: "請問最大正方形金磚的邊長是多少公分？鋪滿整個地面總共需要幾塊金磚？",
    question_en: "What is the side length of the largest square tile, and how many tiles are needed in total?",
    options: [
      {
        text: "正方形邊長為 120 公分，共需 6 塊金磚",
        text_en: "Side length is 120 cm, requiring 6 tiles in total",
        isCorrect: true,
        reason: "正確！正方形邊長為 GCD(360, 240) = 120 公分。長邊可鋪 360÷120 = 3 塊，寬邊可鋪 240÷120 = 2 塊，總塊數 = 3 × 2 = 6 塊。",
        reason_en: "Correct! GCD(360, 240) = 120 cm. Length fits 360 ÷ 120 = 3 tiles; width fits 240 ÷ 120 = 2 tiles. Total tiles = 3 × 2 = 6 tiles."
      },
      {
        text: "正方形邊長為 60 公分，共需 24 塊金磚",
        text_en: "Side length is 60 cm, requiring 24 tiles in total",
        isCorrect: false,
        reason: "迷思錯誤！60 雖是公因數但不是「最大」公因數，題目要求的是「最大」正方形金磚。",
        reason_en: "Misconception! 60 is a common divisor, but not the GREATEST common divisor."
      },
      {
        text: "正方形邊長為 120 公分，共需 5 塊金磚",
        text_en: "Side length is 120 cm, requiring 5 tiles in total",
        isCorrect: false,
        reason: "迷思錯誤！誤把長寬塊數相加 (3 + 2 = 5)，整面鋪滿必須將長寬塊數相乘 (3 × 2 = 6)！",
        reason_en: "Misconception! Added length and width tiles (3 + 2) instead of multiplying (3 × 2)."
      },
      {
        text: "正方形邊長為 120 公分，共需 12 塊金磚",
        text_en: "Side length is 120 cm, requiring 12 tiles in total",
        isCorrect: false,
        reason: "計算錯誤，塊數算成兩倍。",
        reason_en: "Calculation error: doubled the tile count."
      }
    ],
    hint: "要鋪滿且不切割，邊長必須是長與寬的「公因數」；要求最大邊長，就是求「最大公因數」。總塊數 = 長邊塊數 × 寬邊塊數。",
    hint_en: "To tile without cutting, the side length must be a common divisor. For the largest tile, find GCD(360, 240). Total tiles = (360/GCD) × (240/GCD).",
    svgType: "tile_grid",
    solution: "【解題核心】\n1. 求最大邊長：求 360 與 240 的最大公因數。\n   360 = 120 × 3, 240 = 120 × 2 => GCD(360, 240) = 120 公分。\n2. 求總塊數：\n   長可以排：360 ÷ 120 = 3 塊\n   寬可以排：240 ÷ 120 = 2 塊\n   總共需要：3 × 2 = 6 塊金磚。",
    solution_en: "[Solution Breakdown]\n1. Side length = GCD(360, 240) = 120 cm.\n2. Total tiles = (360 ÷ 120) × (240 ÷ 120) = 3 × 2 = 6 tiles."
  },
  {
    id: "u1_l5",
    unitId: 1,
    levelNum: 5,
    title: "皇家飛空艇艦隊（公倍數區間應用魔王題）",
    title_en: "Royal Airship Fleet (Common Multiples Range Challenge)",
    type: "魔王應用題",
    type_en: "Boss Challenge",
    story: "神廟停機坪外集結了一隊守護飛空艇。斥候探查發現：艦隊總數介於 200 到 260 艘之間。當指揮官命令每 15 艘編為一小隊時剛好排完；改為每 20 艘編為一小隊時也剛好排完！",
    story_en: "A fleet of airships gathers at the temple dock. Scouts report the total number is between 200 and 260. Groups of 15 or groups of 20 can both form complete rows without remainder!",
    question: "請問這隊守護飛空艇總共有多少艘？",
    question_en: "How many airships are in this fleet?",
    options: [
      {
        text: "總共有 240 艘飛空艇",
        text_en: "There are 240 airships in total",
        isCorrect: true,
        reason: "完全正確！總艘數必須是 15 和 20 的公倍數。[15, 20] = 60。60的倍數有 60, 120, 180, 240, 300... 其中介於 200 到 260 之間的只有 240！",
        reason_en: "Correct! Total must be a multiple of LCM(15, 20) = 60. Multiples of 60 are 60, 120, 180, 240, 300. The only one between 200 and 260 is 240."
      },
      {
        text: "總共有 300 艘飛空艇",
        text_en: "There are 300 airships in total",
        isCorrect: false,
        reason: "迷思錯誤！誤用 15 × 20 = 300，且 300 已經超過題目限定的 200~260 範圍。",
        reason_en: "Misconception! 300 exceeds the 200~260 range."
      },
      {
        text: "總共有 225 艘飛空艇",
        text_en: "There are 225 airships in total",
        isCorrect: false,
        reason: "錯誤！225 雖然是 15 的倍數，但不是 20 的倍數（225 不是偶數）。",
        reason_en: "Incorrect! 225 is divisible by 15, but not by 20."
      },
      {
        text: "總共有 210 艘飛空艇",
        text_en: "There are 210 airships in total",
        isCorrect: false,
        reason: "錯誤！210 不能被 20 整除 (210 ÷ 20 = 10 餘 10)。",
        reason_en: "Incorrect! 210 is not divisible by 20."
      }
    ],
    hint: "能被 15 和 20 都整除的數，是兩數的「公倍數」。先求最小公倍數 [15, 20]，再找出落在 200~260 之間的倍數。",
    hint_en: "Find LCM(15, 20) = 60, then list multiples of 60 to find the one between 200 and 260.",
    svgType: "number_line_lcm",
    solution: "【解題核心】\n1. 每 15 艘或每 20 艘都能剛好排完，表示總數為 15 與 20 的公倍數。\n2. 求最小公倍數：\n   15 = 3 × 5, 20 = 2 × 2 × 5 => [15, 20] = 60。\n3. 尋找公倍數列：60, 120, 180, 240, 300...\n4. 符合「介於 200 到 260 之間」的數值為 240 艘。",
    solution_en: "[Solution Breakdown]\n1. Total airships must be a common multiple of 15 and 20.\n2. LCM(15, 20) = 60.\n3. Multiples of 60: 60, 120, 180, 240, 300...\n4. Between 200 and 260: exactly 240 airships."
  },

  // ==========================================
  // 【單元二：分數除法】
  // ==========================================
  {
    id: "u2_l1",
    unitId: 2,
    levelNum: 1,
    title: "以太魔藥分裝器（商與被除數的大小關係）",
    title_en: "Aether Potion Bottling (Quotient vs Dividend Size)",
    type: "觀念選擇題",
    type_en: "Concept Selection",
    story: "微積分水島的水晶工坊有一桶共 18 公升的以太魔藥，煉金師準備將它分裝到隨身試劑瓶中。請問使用下列哪一種容量的分裝瓶時，裝出來的「總瓶數」會比原本的 18 瓶「還要少」？",
    story_en: "A barrel holds 18 liters of aether potion. An alchemist pours it into small vials. Which vial capacity will result in a total bottle count LESS than 18?",
    question: "下列哪一個分數除法算式算出來的「商」會比 18 還要小？",
    question_en: "Which fraction division expression yields a quotient SMALLER than 18?",
    options: [
      {
        text: "每瓶裝 1 1/5 公升（列式：18 ÷ 1 1/5）",
        text_en: "1 1/5 L per vial (18 ÷ 1 1/5)",
        isCorrect: true,
        reason: "正確！當除數大於 1（如 1 1/5 = 6/5 > 1）時，商會比被除數小（18 ÷ 6/5 = 15 瓶 < 18 瓶）。",
        reason_en: "Correct! Dividing by a number greater than 1 (1 1/5 > 1) results in a quotient smaller than the dividend (18 ÷ 6/5 = 15 < 18)."
      },
      {
        text: "每瓶裝 7/9 公升（列式：18 ÷ 7/9）",
        text_en: "7/9 L per vial (18 ÷ 7/9)",
        isCorrect: false,
        reason: "錯誤！7/9 是真分數（< 1），除以小於 1 的數，商會比被除數大（> 18 瓶）。",
        reason_en: "Incorrect! 7/9 < 1, so dividing by it yields a quotient greater than 18."
      },
      {
        text: "每瓶裝 6/6 公升（列式：18 ÷ 6/6）",
        text_en: "6/6 L per vial (18 ÷ 6/6)",
        isCorrect: false,
        reason: "錯誤！6/6 等於 1，除以 1 的商等於被除數（剛好 18 瓶），不會比 18 瓶少。",
        reason_en: "Incorrect! 6/6 = 1, so the quotient equals 18."
      },
      {
        text: "每瓶裝 3/4 公升（列式：18 ÷ 3/4）",
        text_en: "3/4 L per vial (18 ÷ 3/4)",
        isCorrect: false,
        reason: "錯誤！3/4 < 1，18 ÷ 3/4 = 24 瓶，裝出來的瓶數比 18 瓶多。",
        reason_en: "Incorrect! 18 ÷ 3/4 = 24 bottles, which is greater than 18."
      }
    ],
    hint: "除數 > 1 時，商 < 被除數；除數 = 1 時，商 = 被除數；除數 < 1 時，商 > 被除數。",
    hint_en: "Divisor > 1 => Quotient < Dividend; Divisor < 1 => Quotient > Dividend.",
    svgType: "fraction_divide_concept",
    solution: "【解題核心】\n分數除法大小規律：\n• 當除數大於 1（假分數或帶分數）時，商 < 被除數。\n• 1 1/5 > 1，因此 18 ÷ 1 1/5 = 15 瓶 < 18 瓶。",
    solution_en: "[Solution Breakdown]\n• When divisor > 1, quotient < dividend.\n• Since 1 1/5 > 1, 18 ÷ 1 1/5 = 15 < 18."
  },
  {
    id: "u2_l2",
    unitId: 2,
    levelNum: 2,
    title: "水力導管壓力閥（最簡分數約分與帶分數除法）",
    title_en: "Hydro Pressure Valve (Simplifying & Mixed Fraction Division)",
    type: "基礎計算題",
    type_en: "Basic Calculation",
    story: "左側導管的壓力儀表顯示純度為 48/84，需化為最簡分數；右側儲水槽有 2 2/3 公升能量液，每固定公升裝成一管水晶管，剛好裝滿 1 1/3 管。請問 1 管水晶管的容量是多少公升？",
    story_en: "The pressure gauge shows 48/84, requiring simplification. A tank has 2 2/3 L of liquid, which fills exactly 1 1/3 tubes. What is the capacity of 1 crystal tube?",
    question: "將 48/84 約分成最簡分數，並計算 2 2/3 ÷ 1 1/3 的答案：",
    question_en: "Simplify 48/84 to lowest terms, and compute 2 2/3 ÷ 1 1/3:",
    options: [
      {
        text: "約分後為 4/7，且 1 管水晶管容量為 2 公升",
        text_en: "Simplified to 4/7, and 1 tube holds 2 liters",
        isCorrect: true,
        reason: "正確！48/84 同除以最大公因數 12 得 4/7。2 2/3 ÷ 1 1/3 = (8/3) ÷ (4/3) = (8/3) × (3/4) = 2 公升。",
        reason_en: "Correct! 48/84 ÷ 12/12 = 4/7. 2 2/3 ÷ 1 1/3 = (8/3) × (3/4) = 2 liters."
      },
      {
        text: "約分後為 12/21，且 1 管水晶管容量為 2 公升",
        text_en: "Simplified to 12/21, and 1 tube holds 2 liters",
        isCorrect: false,
        reason: "錯誤！12/21 還能繼續同除以 3 約分成 4/7，尚未化為最簡分數。",
        reason_en: "Incorrect! 12/21 can still be simplified by 3 to 4/7."
      },
      {
        text: "約分後為 4/7，且 1 管水晶管容量為 1 1/2 公升",
        text_en: "Simplified to 4/7, and 1 tube holds 1 1/2 liters",
        isCorrect: false,
        reason: "計算錯誤！帶分數除法乘倒數計算失誤。",
        reason_en: "Calculation error in multiplying reciprocals."
      },
      {
        text: "約分後為 4/7，且 1 管水晶管容量為 3 5/9 公升",
        text_en: "Simplified to 4/7, and 1 tube holds 3 5/9 liters",
        isCorrect: false,
        reason: "迷思錯誤！算成乘法 (8/3 × 4/3 = 32/9) 而非除法。",
        reason_en: "Misconception: multiplied instead of divided."
      }
    ],
    hint: "最簡分數是分子與分母互質。帶分數除法要先化為「假分數」，再將除數分子分母顛倒相乘（乘倒數）。",
    hint_en: "Convert mixed fractions to improper fractions, then multiply by the reciprocal of the divisor.",
    svgType: "fraction_cancel",
    solution: "【解題核心】\n1. 48/84 分子分母最大公因數是 12：48÷12 = 4, 84÷12 = 7，得最簡分數 4/7。\n2. 帶分數除法：\n   2 2/3 = 8/3, 1 1/3 = 4/3\n   8/3 ÷ 4/3 = 8/3 × 3/4 = 2 公升。",
    solution_en: "[Solution Breakdown]\n1. 48/84 ÷ 12/12 = 4/7.\n2. 2 2/3 ÷ 1 1/3 = 8/3 ÷ 4/3 = 8/3 × 3/4 = 2 liters."
  },
  {
    id: "u2_l3",
    unitId: 2,
    levelNum: 3,
    title: "符文防潮木筏鋪設（長方形面積除以長求寬）",
    title_en: "Runic Raft Paving (Rectangle Area Divided by Length)",
    type: "幾何計算題",
    type_en: "Geometric Calculation",
    story: "為了跨越微積分水島的急流，工匠需要建造一塊長方形的防潮浮空木筏。已知這塊長方形木筏的總面積是 7 1/2 平方公尺，測量出它的長度是 2 1/4 公尺。請問這塊木筏的「寬」是多少公尺？",
    story_en: "Craftsmen build a rectangular raft with an area of 7 1/2 square meters and a length of 2 1/4 meters. What is the width of this raft?",
    question: "計算長方形木筏的寬（答案以最簡分數或帶分數表示）：",
    question_en: "Calculate the width of the raft (in simplest fraction or mixed number):",
    options: [
      {
        text: "寬是 3 1/3 公尺（或 10/3 公尺）",
        text_en: "Width is 3 1/3 meters (or 10/3 m)",
        isCorrect: true,
        reason: "正確！長方形寬 = 面積 ÷ 長 = 7 1/2 ÷ 2 1/4 = (15/2) ÷ (9/4) = (15/2) × (4/9) = 10/3 = 3 1/3 公尺。",
        reason_en: "Correct! Width = Area ÷ Length = 7 1/2 ÷ 2 1/4 = (15/2) × (4/9) = 10/3 = 3 1/3 meters."
      },
      {
        text: "寬是 3 1/2 公尺",
        text_en: "Width is 3 1/2 meters",
        isCorrect: false,
        reason: "計算失誤！約分時 15/2 × 4/9 分子分母消去出錯。",
        reason_en: "Simplification error in fraction multiplication."
      },
      {
        text: "寬是 5/18 公尺",
        text_en: "Width is 5/18 meters",
        isCorrect: false,
        reason: "迷思錯誤！顛倒成了 (長 ÷ 面積)，算出 9/4 ÷ 15/2 = 3/10。",
        reason_en: "Misconception: divided length by area."
      },
      {
        text: "寬是 16 7/8 公尺",
        text_en: "Width is 16 7/8 meters",
        isCorrect: false,
        reason: "迷思錯誤！算成了長寬相乘（面積 × 長）。",
        reason_en: "Misconception: multiplied area by length."
      }
    ],
    hint: "長方形面積 ＝ 長 × 寬，所以 寬 ＝ 面積 ÷ 長。記得化為假分數並乘以倒數。",
    hint_en: "Area = Length × Width => Width = Area ÷ Length. Convert to improper fractions and multiply by reciprocal.",
    svgType: "rectangle_fraction",
    solution: "【解題核心】\n1. 寬 ＝ 面積 ÷ 長 ＝ 7 1/2 ÷ 2 1/4\n2. 化為假分數：15/2 ÷ 9/4\n3. 乘倒數並約分：(15/2) × (4/9) ＝ 10/3 ＝ 3 1/3 公尺。",
    solution_en: "[Solution Breakdown]\n1. Width = Area ÷ Length = 7 1/2 ÷ 2 1/4.\n2. (15/2) ÷ (9/4) = (15/2) × (4/9) = 10/3 = 3 1/3 meters."
  },
  {
    id: "u2_l4",
    unitId: 2,
    levelNum: 4,
    title: "生命聖泉分裝（帶分數除以分數之餘數陷阱）",
    title_en: "Sacred Spring Bottling (Mixed Fraction Remainder Trap)",
    type: "素養應用題",
    type_en: "Applied Problem",
    story: "水島中央聖泉湧出 7 1/2 公升的極品聖水，冒險者拿出隨身攜帶的水晶瓶進行分裝，每瓶的固定容量為 4/5 公升。請問最多可以裝滿幾瓶水晶瓶？裝滿後還剩下多少公升的聖水？",
    story_en: "The spring yields 7 1/2 liters of holy water. Vials hold 4/5 liter each. How many FULL vials can be bottled, and how many LITERS remain?",
    question: "求最多可裝滿的「瓶數」與剩下的「聖水公升數」：",
    question_en: "Find the maximum number of full vials and the remaining volume in liters:",
    options: [
      {
        text: "最多裝滿 9 瓶，還剩下 3/10 公升",
        text_en: "9 full vials, with 3/10 liter remaining",
        isCorrect: true,
        reason: "正確！7 1/2 ÷ 4/5 = 15/2 × 5/4 = 75/8 = 9 又 3/8。整數 9 代表裝滿 9 瓶；餘數 3/8 代表『3/8 瓶』，換算為公升：3/8 × 4/5 = 3/10 公升！",
        reason_en: "Correct! 7 1/2 ÷ 4/5 = 75/8 = 9 3/8 bottles. Whole number 9 means 9 full bottles; remainder 3/8 represents 3/8 of a BOTTLE => 3/8 × 4/5 L = 3/10 Liter!"
      },
      {
        text: "最多裝滿 9 瓶，還剩下 3/8 公升",
        text_en: "9 full vials, with 3/8 liter remaining",
        isCorrect: false,
        reason: "超經典陷阱！3/8 是指『3/8 瓶』而不是 3/8 公升！必須再乘回每瓶容量 (3/8 × 4/5 = 3/10 公升)。",
        reason_en: "Classic trap! 3/8 is 3/8 of a vial, not 3/8 liter! You must multiply: 3/8 × 4/5 = 3/10 L."
      },
      {
        text: "最多裝滿 9 瓶，還剩下 1/2 公升",
        text_en: "9 full vials, with 1/2 liter remaining",
        isCorrect: false,
        reason: "計算錯誤！餘數部分扣減錯誤。",
        reason_en: "Calculation error in remainder."
      },
      {
        text: "最多裝滿 10 瓶，不剩下聖水",
        text_en: "10 full vials, with 0 liters remaining",
        isCorrect: false,
        reason: "錯誤！75/8 未達 10 瓶（需 80/8），不能無條件進位。",
        reason_en: "Incorrect! 75/8 is less than 10 full bottles."
      }
    ],
    hint: "商的帶分數部分：整數是「裝滿瓶數」，真分數是「幾分之幾瓶」。求剩下幾公升，要把真分數乘以「每瓶容量」！",
    hint_en: "The fraction 3/8 represents 'fraction of a bottle'. To find remaining liters, multiply: (3/8) × (bottle capacity).",
    svgType: "fraction_remainder_bottles",
    solution: "【解題核心】\n1. 列式：7 1/2 ÷ 4/5 ＝ (15/2) × (5/4) ＝ 75/8 ＝ 9 3/8 (瓶)\n2. 意義解析：\n   • 整數部分『9』代表最多裝滿 9 瓶。\n   • 分數部分『3/8』代表剩下 3/8 瓶。\n3. 換算實際剩下容量：3/8 × 4/5 ＝ 12/40 ＝ 3/10 (公升)。",
    solution_en: "[Solution Breakdown]\n1. 7 1/2 ÷ 4/5 = 75/8 = 9 3/8 bottles.\n2. Integer 9 = 9 full bottles.\n3. Fractional remainder = 3/8 bottle => 3/8 × 4/5 = 3/10 liter."
  },
  {
    id: "u2_l5",
    unitId: 2,
    levelNum: 5,
    title: "魔法燃料槽逆推（基準量分數除法魔王題）",
    title_en: "Magic Fuel Tank Inverse (Base Quantity Division Boss Challenge)",
    type: "魔王應用題",
    type_en: "Boss Challenge",
    story: "一艘裝滿高能魔力液的飛空艇在穿過水島暴風圈時，防護罩消耗了整槽燃料的 4/9，此時燃料槽內還剩下整槽的 5/9。工程師秤得目前槽內「剩下的魔力液」剛好重 15 公斤（不含金屬槽重）。請問原本滿滿一整槽魔力液重多少公斤？",
    story_en: "An airship shield consumed 4/9 of its fuel, leaving 5/9 of the tank. The remaining fuel weighs 15 kg. What was the weight of a full tank?",
    question: "求原本滿滿一整槽魔力液的總重量：",
    question_en: "Find the original total weight of a full tank of magic fuel:",
    options: [
      {
        text: "原本總重為 27 公斤",
        text_en: "Full tank weighs 27 kg",
        isCorrect: true,
        reason: "完全正確！剩下的 15 公斤對應的是全槽的 5/9。全槽總重 ＝ 15 ÷ (5/9) ＝ 15 × (9/5) ＝ 27 公斤。",
        reason_en: "Correct! 15 kg corresponds to 5/9 of the tank. Total weight = 15 ÷ (5/9) = 15 × (9/5) = 27 kg."
      },
      {
        text: "原本總重為 33 3/4 公斤",
        text_en: "Full tank weighs 33 3/4 kg",
        isCorrect: false,
        reason: "迷思錯誤！誤用用掉的比例計算 (15 ÷ 4/9 = 15 × 9/4 = 135/4 = 33.75)。",
        reason_en: "Misconception: divided by the consumed fraction (4/9) instead of remaining (5/9)."
      },
      {
        text: "原本總重為 25 公斤",
        text_en: "Full tank weighs 25 kg",
        isCorrect: false,
        reason: "計算錯誤！",
        reason_en: "Calculation error."
      },
      {
        text: "原本總重為 8 1/3 公斤",
        text_en: "Full tank weighs 8 1/3 kg",
        isCorrect: false,
        reason: "迷思錯誤！算成乘法 (15 × 5/9 = 25/3 = 8.33)，總重應該比剩下的重量更多！",
        reason_en: "Misconception: multiplied instead of dividing."
      }
    ],
    hint: "比較量 ÷ 分率 ＝ 基準量（全部重量）。剩下的 15 公斤對應的分率是 5/9。",
    hint_en: "Base quantity = Quantity ÷ Fraction. The 15 kg represents 5/9 of the whole.",
    svgType: "fraction_bar_scale",
    solution: "【解題核心】\n1. 題目指出剩下的燃料佔全槽的 5/9 (即 1 - 4/9 = 5/9)。\n2. 這 5/9 的重量是 15 公斤。\n3. 求全槽重量 (基準量 1)：15 ÷ (5/9) ＝ 15 × (9/5) ＝ 27 公斤。",
    solution_en: "[Solution Breakdown]\n1. Remaining fuel is 1 - 4/9 = 5/9 of the tank.\n2. 5/9 corresponds to 15 kg.\n3. Total weight = 15 ÷ (5/9) = 15 × 9/5 = 27 kg."
  },

  // ==========================================
  // 【單元三：數量關係】
  // ==========================================
  {
    id: "u3_l1",
    unitId: 3,
    levelNum: 1,
    title: "古老天平與時光日晷（四大不變量概念）",
    title_en: "Ancient Scales & Sundial (The Four Invariant Relations)",
    type: "觀念選擇題",
    type_en: "Concept Selection",
    story: "走進森林迴廊，石壁上鐫刻著古代智者歸納的宇宙四象法則。請問下列哪一種生活與物理情境的兩個數量之間，符合「差不變」的數量關係？",
    story_en: "In the forest corridor, ancient carvings depict cosmic laws. Which of the following scenarios represents a 'Constant Difference' (Difference Invariant) relationship?",
    question: "下列哪一種情境符合「差不變」的數量關係？",
    question_en: "Which scenario represents a 'Difference Invariant' relationship?",
    options: [
      {
        text: "【守護者年齡】：今年 14 歲的見習勇者與今年 42 歲的聖殿長老，隨著每年歲月流逝兩人的年齡",
        text_en: "[Guardian Age]: A 14-year-old apprentice and a 42-year-old elder as years pass by",
        isCorrect: true,
        reason: "正確！兩人的年齡差永遠是 42 - 14 = 28 歲，無論過幾年，年齡差永恆不變（差不變）。",
        reason_en: "Correct! The age difference is always 42 - 14 = 28 years, remaining constant forever (Difference Invariant)."
      },
      {
        text: "【時光沙漏】：倒轉計時過程中，「上半部剩餘的沙重」與「下半部累積的沙重」",
        text_en: "[Hourglass]: Upper sand remaining vs lower sand accumulated",
        isCorrect: false,
        reason: "錯誤！沙子總量固定，上層重量 + 下層重量 = 總重，屬於「和不變」！",
        reason_en: "Incorrect! Total sand is constant, so Upper + Lower = Total (Sum Invariant)."
      },
      {
        text: "【魔法結界面積】：固定面積為 48 平方公尺的長方形防護罩，「長」與「寬」的變化",
        text_en: "[Shield Area]: Length and width of a rectangle with fixed area of 48 m²",
        isCorrect: false,
        reason: "錯誤！長 × 寬 = 面積 (固定 48)，兩者相乘固定，屬於「積不變（反比）」！",
        reason_en: "Incorrect! Length × Width = 48 (Product Invariant / Inverse Proportion)."
      },
      {
        text: "【魔晶等價兌換】：在補給所中，「付出的金幣總數」與「換到的魔法水滴數」",
        text_en: "[Exchange]: Total coins paid vs magic drops received at fixed price",
        isCorrect: false,
        reason: "錯誤！總價 ÷ 數量 = 單價 (固定)，兩者相除固定，屬於「商不變（正比）」！",
        reason_en: "Incorrect! Total Cost ÷ Quantity = Unit Price (Quotient Invariant / Direct Proportion)."
      }
    ],
    hint: "相加固定是和不變，相減固定是差不變，相乘固定是積不變，相除固定是商不變。",
    hint_en: "Constant addition = Sum Invariant; Constant subtraction = Difference Invariant; Constant multiplication = Product Invariant; Constant division = Quotient Invariant.",
    svgType: "invariant_scales",
    solution: "【解題核心】\n四大不變量辨析：\n1. 和不變：兩數相加為定值（例如沙漏上下層、日夜 24 小時）。\n2. 差不變：兩數相減為定值（例如兩人年齡差、同增同減）。\n3. 積不變：兩數相乘為定值（例如長寬固定面積、流量乘時間）。\n4. 商不變：兩數相除為定值（例如固定單價、等比縮放）。",
    solution_en: "[Solution Breakdown]\n1. Sum Invariant: A + B = Constant (Hourglass sand).\n2. Difference Invariant: A - B = Constant (Ages).\n3. Product Invariant: A × B = Constant (Area).\n4. Quotient Invariant: A ÷ B = Constant (Unit price)."
  },
  {
    id: "u3_l2",
    unitId: 3,
    levelNum: 2,
    title: "正八邊形結界排列（相連圖形光柱生長規律）",
    title_en: "Connected Octagons Pattern (Linear Growth Rule)",
    type: "規律探索題",
    type_en: "Pattern Exploration",
    story: "神廟地板需要用「能量光柱」排列出一列相連的正八邊形防禦陣（相鄰的兩個八邊形共用 1 根光柱）。排 1 個八邊形需要 8 根光柱，排 2 個需要 15 根，排 3 個需要 22 根...",
    story_en: "Energy beams form a line of connected regular octagons (adjacent octagons share 1 beam). 1 octagon needs 8 beams, 2 need 15 beams, 3 need 22 beams...",
    question: "若排成 n 個相連的正八邊形，總共需要幾根光柱？排 80 個相連八邊形共需幾根？",
    question_en: "How many beams are needed for n connected octagons? And how many for 80 octagons?",
    options: [
      {
        text: "算式為 7n + 1，排 80 個需要 561 根光柱",
        text_en: "Formula is 7n + 1, and 80 octagons need 561 beams",
        isCorrect: true,
        reason: "正確！排第 1 個需要 8 根，之後每多排 1 個只需增加 7 根 (共用 1 根)。算式 = 8 + 7(n - 1) = 7n + 1。n = 80 時：7 × 80 + 1 = 561 根。",
        reason_en: "Correct! The first octagon uses 8 beams, each additional octagon adds 7 beams (1 shared). Formula = 8 + 7(n - 1) = 7n + 1. For n = 80: 7(80) + 1 = 561."
      },
      {
        text: "算式為 8n，排 80 個需要 640 根光柱",
        text_en: "Formula is 8n, and 80 octagons need 640 beams",
        isCorrect: false,
        reason: "迷思錯誤！直接用 8 × n，完全忽略了相鄰兩個八邊形共用 1 根光柱的接合邊！",
        reason_en: "Misconception! Ignored the shared side between adjacent octagons."
      },
      {
        text: "算式為 7n，排 80 個需要 560 根光柱",
        text_en: "Formula is 7n, and 80 octagons need 560 beams",
        isCorrect: false,
        reason: "錯誤！忘記第 1 個八邊形原本擁有的起始首端邊 (+1)。",
        reason_en: "Incorrect! Forgot the starting end beam (+1)."
      },
      {
        text: "算式為 8 + 8(n - 1)，排 80 個需要 640 根光柱",
        text_en: "Formula is 8 + 8(n - 1), needing 640 beams",
        isCorrect: false,
        reason: "錯誤！每次增加的公差是 7 根而不是 8 根。",
        reason_en: "Incorrect! The common difference is 7, not 8."
      }
    ],
    hint: "觀察每次增加幾根光柱（公差）。第 1 個是 8 根，之後每多 1 個多 7 根。",
    hint_en: "Observe common difference: 1 octagon = 8; each subsequent octagon adds 7 beams => 7n + 1.",
    svgType: "octagon_pattern",
    solution: "【解題核心】\n1. 規律分析：\n   • 1 個八邊形：8 根 ＝ 1 ＋ 7×1\n   • 2 個八邊形：8 ＋ 7 ＝ 15 根 ＝ 1 ＋ 7×2\n   • 3 個八邊形：15 ＋ 7 ＝ 22 根 ＝ 1 ＋ 7×3\n2. 歸納公式：排 n 個相連八邊形，需要 7n ＋ 1 根。\n3. 代入 n ＝ 80：7 × 80 ＋ 1 ＝ 561 根。",
    solution_en: "[Solution Breakdown]\n1. 1 octagon: 8 = 7(1) + 1.\n2. 2 octagons: 15 = 7(2) + 1.\n3. n octagons: 7n + 1.\n4. For n = 80: 7 × 80 + 1 = 561 beams."
  },
  {
    id: "u3_l3",
    unitId: 3,
    levelNum: 3,
    title: "地下冷卻水槽注水（反比積不變表格推理）",
    title_en: "Cooling Tank Filling (Inverse Proportion Table)",
    type: "圖表推理題",
    type_en: "Table Reasoning",
    story: "煉金術士測試注滿一座空的固定容量水槽。測試記錄五種「每分鐘注水流量(公升)」與「注滿所需時間(分鐘)」：(流量 10L，需 24分)、(流量 15L，需 16分)、(流量 20L，需 甲分)、(流量 乙L，需 8分)。",
    story_en: "Filling a tank with fixed capacity: (10 L/min takes 24 min), (15 L/min takes 16 min), (20 L/min takes X min), (Y L/min takes 8 min).",
    question: "求出缺漏的數值甲與乙，並寫出兩者間的數量關係式：",
    question_en: "Find the missing values X and Y, and state their quantitative relationship:",
    options: [
      {
        text: "甲 = 12 分鐘，乙 = 30 公升，關係式：每分鐘流量 × 所需時間 ＝ 240 (積不變)",
        text_en: "X = 12 min, Y = 30 L; Rule: Flow Rate × Time = 240 (Product Invariant)",
        isCorrect: true,
        reason: "正確！10×24 = 240，15×16 = 240，水槽總容量固定為 240 公升。甲 = 240÷20 = 12；乙 = 240÷8 = 30。流量與時間成反比，相乘固定為 240。",
        reason_en: "Correct! 10 × 24 = 240, 15 × 16 = 240 => Capacity is 240 L. X = 240 ÷ 20 = 12; Y = 240 ÷ 8 = 30."
      },
      {
        text: "甲 = 10 分鐘，乙 = 25 公升，關係式：每分鐘流量 ＋ 所需時間 ＝ 34",
        text_en: "X = 10 min, Y = 25 L; Rule: Flow Rate + Time = 34",
        isCorrect: false,
        reason: "錯誤！誤以為是和不變，但 10+24=34, 15+16=31，和根本不固定。",
        reason_en: "Incorrect! Sum is not constant (10+24=34, 15+16=31)."
      },
      {
        text: "甲 = 15 分鐘，乙 = 20 公升，關係式：流量 ÷ 時間 ＝ 固定值",
        text_en: "X = 15 min, Y = 20 L; Rule: Flow Rate ÷ Time = Constant",
        isCorrect: false,
        reason: "錯誤！注水流量越大時間越短，是反比（積不變）而非正比（商不變）。",
        reason_en: "Incorrect! Flow and time are inversely proportional (multiplication), not directly proportional."
      },
      {
        text: "甲 = 12 分鐘，乙 = 32 公升，關係式：每分鐘流量 × 所需時間 ＝ 240",
        text_en: "X = 12 min, Y = 32 L; Rule: Flow Rate × Time = 240",
        isCorrect: false,
        reason: "計算錯誤！240 ÷ 8 = 30，乙算成了 32。",
        reason_en: "Calculation error: 240 ÷ 8 = 30, not 32."
      }
    ],
    hint: "觀察表格中的「流量 × 時間」是否都等於同一個乘積（水槽總容量）。",
    hint_en: "Check if Flow Rate × Time equals a constant product (total capacity).",
    svgType: "flow_rate_chart",
    solution: "【解題核心】\n1. 檢驗規律：10 × 24 ＝ 240，15 × 16 ＝ 240，故流量 × 時間 ＝ 240。\n2. 求缺漏值：\n   • 20 × 甲 ＝ 240 => 甲 ＝ 12 分鐘。\n   • 乙 × 8 ＝ 240 => 乙 ＝ 30 公升。",
    solution_en: "[Solution Breakdown]\n1. Product = 10 × 24 = 15 × 16 = 240.\n2. X = 240 ÷ 20 = 12 min; Y = 240 ÷ 8 = 30 L."
  },
  {
    id: "u3_l4",
    unitId: 3,
    levelNum: 4,
    title: "凌空棧道的守護風鈴（兩端都立植樹間隔題）",
    title_en: "Walkway Wind Chimes (Tree-Planting Both Ends Included)",
    type: "植樹應用題",
    type_en: "Interval Application",
    story: "通往神廟的凌空木棧道全長 480 公尺，單側從起點到終點（兩端都掛）等距離掛設守護風鈴，依序編為 1 號、2 號、3 號...。探險家從第 4 號風鈴走到第 16 號風鈴，總共走了 180 公尺。",
    story_en: "A 480 m wooden skyway has wind chimes hung at equal intervals on one side (both ends included), numbered 1, 2, 3... Walking from chime #4 to chime #16 covers 180 meters.",
    question: "相鄰兩風鈴間隔是多少公尺？整條棧道單側從起點到終點共掛了幾個風鈴？",
    question_en: "What is the interval between adjacent chimes, and how many chimes are hung in total on that side?",
    options: [
      {
        text: "相鄰間距為 15 公尺，單側全長共掛了 33 個風鈴",
        text_en: "Interval is 15 meters, with 33 chimes hung in total",
        isCorrect: true,
        reason: "正確！第 4 號到第 16 號間隔數 = 16 - 4 = 12 個。間距 = 180 ÷ 12 = 15 公尺。全長 480 公尺間隔數 = 480 ÷ 15 = 32 個。兩端都掛風鈴數 = 間隔數 + 1 = 32 + 1 = 33 個！",
        reason_en: "Correct! Intervals from #4 to #16 = 16 - 4 = 12. Interval distance = 180 ÷ 12 = 15 m. Total intervals = 480 ÷ 15 = 32. Both ends included => 32 + 1 = 33 chimes!"
      },
      {
        text: "相鄰間距為 15 公尺，單側全長共掛了 32 個風鈴",
        text_en: "Interval is 15 meters, with 32 chimes hung in total",
        isCorrect: false,
        reason: "超常見迷思！忘記『兩端都立』時，物體個數 ＝ 間隔數 ＋ 1，直接拿 480 ÷ 15 = 32 當答案。",
        reason_en: "Misconception! Forgot to add 1 for both ends included (Count = Intervals + 1)."
      },
      {
        text: "相鄰間距為 13.8 公尺，單側全長共掛了 35 個風鈴",
        text_en: "Interval is 13.8 meters, with 35 chimes hung in total",
        isCorrect: false,
        reason: "迷思錯誤！算間隔數時誤用 16 - 4 + 1 = 13 個間隔，導致除不盡算錯。",
        reason_en: "Misconception: calculated intervals as 16 - 4 + 1 = 13."
      },
      {
        text: "相鄰間距為 12 公尺，單側全長共掛了 41 個風鈴",
        text_en: "Interval is 12 meters, with 41 chimes hung in total",
        isCorrect: false,
        reason: "計算錯誤！",
        reason_en: "Calculation error."
      }
    ],
    hint: "第 A 號到第 B 號之間，間隔數 ＝ B － A。兩端都立時，總棵數 ＝ 全長 ÷ 間距 ＋ 1。",
    hint_en: "Intervals between #A and #B = B - A. When both ends are included: Total Count = (Total Length ÷ Interval) + 1.",
    svgType: "tree_interval_line",
    solution: "【解題核心】\n1. 求相鄰間距：第 4 號到第 16 號間隔 16 － 4 ＝ 12 個，間距 ＝ 180 ÷ 12 ＝ 15 公尺。\n2. 求總風鈴數：480 ÷ 15 ＝ 32 個間隔。兩端都掛：32 ＋ 1 ＝ 33 個。",
    solution_en: "[Solution Breakdown]\n1. Intervals = 16 - 4 = 12 => Distance per interval = 180 ÷ 12 = 15 m.\n2. Total intervals = 480 ÷ 15 = 32 => Total chimes = 32 + 1 = 33."
  },
  {
    id: "u3_l5",
    unitId: 3,
    levelNum: 5,
    title: "圓形祭壇旌旗加密（封閉圖形植樹魔王題）",
    title_en: "Circular Altar Torches (Closed Loop Tree-Planting Boss Challenge)",
    type: "魔王應用題",
    type_en: "Boss Challenge",
    story: "神廟中央的圓形封印祭壇周圍，原本每隔 8 公尺插一支魔法旌旗，剛好插滿了 30 支旌旗。為了抵禦暗影侵襲，守護者決定將旌旗間距縮短為每隔 5 公尺插一支。請問圓形祭壇周長是多少公尺？總共還需要「多補上」幾支旌旗？",
    story_en: "Around a circular altar, torches were planted every 8 meters, using exactly 30 torches. To increase defense, the interval is shortened to 5 meters. What is the circumference, and how many MORE torches must be added?",
    question: "求圓形祭壇的「周長」與需要「多補上」的旌旗數：",
    question_en: "Find the circumference and how many MORE torches are needed:",
    options: [
      {
        text: "周長共 240 公尺，總共需要多補上 18 支旌旗",
        text_en: "Circumference is 240 m, needing 18 MORE torches",
        isCorrect: true,
        reason: "完全正確！圓形封閉迴路：棵數 ＝ 間隔數。原本周長 ＝ 8 × 30 ＝ 240 公尺。新間距 5 公尺需旌旗數 ＝ 240 ÷ 5 ＝ 48 支。需要多補上 ＝ 48 － 30 ＝ 18 支！",
        reason_en: "Correct! Closed loop: Count = Intervals. Circumference = 8 × 30 = 240 m. New torches needed = 240 ÷ 5 = 48. Additional needed = 48 - 30 = 18!"
      },
      {
        text: "周長共 240 公尺，總共需要多補上 48 支旌旗",
        text_en: "Circumference is 240 m, needing 48 MORE torches",
        isCorrect: false,
        reason: "迷思錯誤！48 支是『總共需要的旌旗數』，題目問的是『多補上幾支』，忘記扣除原本已有的 30 支 (48 - 30 = 18)！",
        reason_en: "Misconception! 48 is the total count, not the additional amount (48 - 30 = 18)."
      },
      {
        text: "周長共 248 公尺，總共需要多補上 19 支旌旗",
        text_en: "Circumference is 248 m, needing 19 MORE torches",
        isCorrect: false,
        reason: "迷思錯誤！把封閉圓形誤當成直線（誤多加 1 個間距 8 × 31）。封閉圖形棵數等於間隔數！",
        reason_en: "Misconception: treated a closed circle like an open line."
      },
      {
        text: "周長共 240 公尺，總共需要多補上 20 支旌旗",
        text_en: "Circumference is 240 m, needing 20 MORE torches",
        isCorrect: false,
        reason: "計算錯誤！",
        reason_en: "Calculation error."
      }
    ],
    hint: "封閉圖形（圓形、正方形花園）：間隔數 ＝ 棵數（不用加 1 也不能減 1）。注意題目是問「多補上」幾支！",
    hint_en: "Closed loop: Count = Intervals. Pay attention to how many 'MORE' are needed (New Total - Old Total).",
    svgType: "circle_tree_pattern",
    solution: "【解題核心】\n1. 圓形封閉圖形特點：棵數 ＝ 間隔數。\n2. 求圓形周長：8 × 30 ＝ 240 公尺。\n3. 改為每 5 公尺插一支：新總數 ＝ 240 ÷ 5 ＝ 48 支。\n4. 需多補上：48 － 30 ＝ 18 支。",
    solution_en: "[Solution Breakdown]\n1. Closed loop: Trees = Intervals.\n2. Circumference = 8 × 30 = 240 m.\n3. New count = 240 ÷ 5 = 48 torches.\n4. Additional needed = 48 - 30 = 18 torches."
  },

  // ==========================================
  // 【單元四：小數除法】
  // ==========================================
  {
    id: "u4_l1",
    unitId: 4,
    levelNum: 1,
    title: "浮石能量提煉原理（小數點移位之計數單位概念）",
    title_en: "Levitation Stone Refining (Place Value Unit in Decimal Division)",
    type: "觀念選擇題",
    type_en: "Concept Selection",
    story: "天秤城工匠要把重 6.48 公斤的浮空魔石，每 0.18 公斤提煉成一塊能量晶核。羊皮紙直式中，工匠將被除數與除數的小數點同時向右移動兩位，算出商為 36。請問關於這個直式運算的數學原理，哪一個說明是正確的？",
    story_en: "Refining 6.48 kg of ore into 0.18 kg cores. In long division, the decimal points of dividend and divisor both shift 2 places right, giving quotient 36. Which explanation of this math principle is correct?",
    question: "下列關於小數除法直式中「小數點同時向右移動兩位」的原理說明，何者正確？",
    question_en: "Which explanation regarding shifting decimal points two places to the right is correct?",
    options: [
      {
        text: "小數點向右移兩位，是因為把 6.48 與 0.18 都換成以「0.01」為計數單位，相當於「648 個 0.01」除以「18 個 0.01」",
        text_en: "Shifting two places converts both numbers to units of '0.01', dividing 648 units of 0.01 by 18 units of 0.01",
        isCorrect: true,
        reason: "完全正確！除法本質是計數單位的包含除。將兩數同時化為 0.01 的倍數，商的值完全不變。",
        reason_en: "Correct! Division represents measurement in a common unit: 6.48 = 648 units of 0.01, 0.18 = 18 units of 0.01 => 648 ÷ 18 = 36."
      },
      {
        text: "小數點同時向右移兩位，相當於被除數與除數兩數同時「加上 100」，所以商不變",
        text_en: "Shifting two places means adding 100 to both numbers, so quotient stays unchanged",
        isCorrect: false,
        reason: "嚴重觀念錯誤！小數點右移兩位是「乘以 100」而非「加上 100」。除法只有兩數同乘相同倍數商才不變。",
        reason_en: "Misconception! Shifting right 2 places multiplies by 100, not adding 100."
      },
      {
        text: "算出來的商是 36，但因為原題目是兩位小數，最後答案必須把小數點向左移兩位變成 0.36",
        text_en: "The calculated quotient is 36, but since original had 2 decimal places, answer must be shifted back to 0.36",
        isCorrect: false,
        reason: "迷思錯誤！商不變性質下，商就是 36 塊晶核，不能再亂點小數點移回 0.36。",
        reason_en: "Misconception! By the invariant quotient property, the quotient is 36, not 0.36."
      },
      {
        text: "小數點只能在除數移動，被除數的小數點移動是為了好看，對計算結果沒有影響",
        text_en: "Decimal point only needs to shift in the divisor; shifting in the dividend has no mathematical effect",
        isCorrect: false,
        reason: "觀念錯誤！被除數與除數必須同時擴大相同倍數，商才維持不變。",
        reason_en: "Error! Both dividend and divisor must multiply by the same factor."
      }
    ],
    hint: "小數點同時右移，是利用「商不變性質」（被除數與除數同乘 100），或將兩數都看成幾個 0.01 相除。",
    hint_en: "Moving decimal points uses the invariant quotient property (multiplying both by 100) or converting both to count of 0.01.",
    svgType: "decimal_shift_unit",
    solution: "【解題核心】\n1. 6.48 ＝ 648 個 0.01；0.18 ＝ 18 個 0.01。\n2. 6.48 ÷ 0.18 ＝ (648 個 0.01) ÷ (18 個 0.01) ＝ 36。\n3. 依「商不變性質」，商就是 36，不可再移位回 0.36！",
    solution_en: "[Solution Breakdown]\n1. 6.48 = 648 units of 0.01; 0.18 = 18 units of 0.01.\n2. 6.48 ÷ 0.18 = 648 ÷ 18 = 36.\n3. The quotient is 36."
  },
  {
    id: "u4_l2",
    unitId: 4,
    levelNum: 2,
    title: "雷射電池與基準算式放大（整數除小數與商的變化）",
    title_en: "Laser Core & Scaling Rule (Decimal Quotient Shift)",
    type: "運算推理題",
    type_en: "Arithmetic Reasoning",
    story: "天秤城核心電池儲備有 21 度電，每發射一次護盾光束需消耗 0.35 度電。面板同時顯示基準算式：「57.6 ÷ 2.4 = 24」。若探險家將被除數調為 5.76，同時將除數調為 0.024，新算式「5.76 ÷ 0.024」的商會是多少？",
    story_en: "A battery holds 21 kWh, consuming 0.35 kWh per beam. Panel displays baseline: '57.6 ÷ 2.4 = 24'. If modified to '5.76 ÷ 0.024', what is the new quotient?",
    question: "滿電電池最多可發射幾次護盾光束？且新算式「5.76 ÷ 0.024」算出來的商是多少？",
    question_en: "How many beams can the battery fire, and what is the quotient of 5.76 ÷ 0.024?",
    options: [
      {
        text: "電池最多發射 60 次，新算式的商是 240",
        text_en: "Battery fires 60 times, and the new quotient is 240",
        isCorrect: true,
        reason: "正確！21 ÷ 0.35 = 2100 ÷ 35 = 60 次。基準式 57.6 ÷ 2.4 = 24；被除數縮小 10 倍商縮小 10 倍，除數縮小 100 倍商擴大 100 倍，綜合結果商擴大 10 倍 => 24 × 10 = 240！",
        reason_en: "Correct! 21 ÷ 0.35 = 2100 ÷ 35 = 60. In 5.76 ÷ 0.024: dividend ÷10 (quotient ÷10), divisor ÷100 (quotient ×100) => net effect is ×10 => 24 × 10 = 240."
      },
      {
        text: "電池最多發射 6 次，新算式的商是 240",
        text_en: "Battery fires 6 times, and the new quotient is 240",
        isCorrect: false,
        reason: "小數移位補零錯誤！21 ÷ 0.35 = 2100 ÷ 35 = 60，而非 6。",
        reason_en: "Padding zero error: 21 ÷ 0.35 = 60, not 6."
      },
      {
        text: "電池最多發射 60 次，新算式的商是 2.4",
        text_en: "Battery fires 60 times, and the new quotient is 2.4",
        isCorrect: false,
        reason: "迷思錯誤！誤以為兩數都縮小，商也跟著縮小成 2.4。",
        reason_en: "Misconception on quotient scaling direction."
      },
      {
        text: "電池最多發射 60 次，新算式的商是 24",
        text_en: "Battery fires 60 times, and the new quotient is 24",
        isCorrect: false,
        reason: "錯誤！被除數縮小 10 倍與除數縮小 100 倍幅度不同，商不會維持 24。",
        reason_en: "Incorrect! Dividend and divisor shrank by different factors."
      }
    ],
    hint: "整數除以小數，被除數要補足相應數量的 0。被除數縮小商縮小，除數縮小商反而放大！",
    hint_en: "Dividing by decimal: add zeros to dividend. Decreasing dividend shrinks quotient; decreasing divisor enlarges quotient!",
    svgType: "decimal_quotient_rules",
    solution: "【解題核心】\n1. 21 ÷ 0.35 ＝ 2100 ÷ 35 ＝ 60 次。\n2. 原商 24，被除數 ÷10，除數 ÷100 => 新商 ＝ 24 ÷ 10 × 100 ＝ 240。",
    solution_en: "[Solution Breakdown]\n1. 21 ÷ 0.35 = 2100 ÷ 35 = 60 times.\n2. Baseline: 57.6 ÷ 2.4 = 24. New: (57.6 ÷ 10) ÷ (2.4 ÷ 100) = 24 × 10 = 240."
  },
  {
    id: "u4_l3",
    unitId: 4,
    levelNum: 3,
    title: "黃金魔導線熔鑄（小數直式除法）",
    title_en: "Gold Wire Smelting (Decimal Long Division)",
    type: "直式計算題",
    type_en: "Long Division Calculation",
    story: "天秤城熔爐提煉出總重 18.36 公克的黃金導線熔液。若每鍛造 1 公尺的精密導線固定需要消耗 0.45 公克的熔液，請問這些黃金熔液一共可以鍛造出多少公尺的精密導線？",
    story_en: "A crucible yields 18.36 g of molten gold. Forging 1 meter of wire consumes 0.45 g of gold. How many meters of wire can be forged in total?",
    question: "計算黃金導線可鍛造的總長度（請注意直式小數點劃掉移位過程）：",
    question_en: "Calculate the total length of wire that can be forged (18.36 ÷ 0.45):",
    options: [
      {
        text: "一共可以鑄造 40.8 公尺",
        text_en: "Can forge 40.8 meters in total",
        isCorrect: true,
        reason: "正確！18.36 ÷ 0.45 = 1836 ÷ 45 = 40.8 公尺。直式中 45 × 4 = 180，餘 36，補 0 點小數點，45 × 8 = 360 整除。",
        reason_en: "Correct! 18.36 ÷ 0.45 = 1836 ÷ 45 = 40.8 meters. 183 ÷ 45 = 4 R 3 => 36 is not enough, place 0 in quotient, then 360 ÷ 45 = 8."
      },
      {
        text: "一共可以鑄造 4.08 公尺",
        text_en: "Can forge 4.08 meters in total",
        isCorrect: false,
        reason: "迷思錯誤！商的小數點位置點錯，1836 ÷ 45 百位是 4，十位需補 0，忘記補 0 算成 4.8 或 4.08。",
        reason_en: "Misconception! Incorrect decimal point alignment."
      },
      {
        text: "一共可以鑄造 48 公尺",
        text_en: "Can forge 48 meters in total",
        isCorrect: false,
        reason: "計算錯誤！",
        reason_en: "Calculation error."
      },
      {
        text: "一共可以鑄造 408 公尺",
        text_en: "Can forge 408 meters in total",
        isCorrect: false,
        reason: "小數點移位後忘記商要點小數點。",
        reason_en: "Omitted the decimal point in the quotient."
      }
    ],
    hint: "將除數 0.45 小數點右移兩位變 45，被除數 18.36 也右移兩位變 1836。注意除法商的中間有 0 時要補 0！",
    hint_en: "Shift 0.45 to 45, and 18.36 to 1836. When 36 cannot be divided by 45, place a 0 in the quotient before decimal point!",
    svgType: "decimal_long_division",
    solution: "【解題核心】\n1. 18.36 ÷ 0.45 ＝ 1836 ÷ 45\n2. 183 ÷ 45 ＝ 4 餘 3；落下 6 變 36，36 不夠除商補 0！\n3. 補 0 點小數點，360 ÷ 45 ＝ 8 整除 => 40.8 公尺。",
    solution_en: "[Solution Breakdown]\n1. 18.36 ÷ 0.45 = 1836 ÷ 45.\n2. 183 ÷ 45 = 4 (remainder 3); bring down 6 => 36 < 45 => put 0 in quotient.\n3. Add decimal point: 360 ÷ 45 = 8 => 40.8 meters."
  },
  {
    id: "u4_l4",
    unitId: 4,
    levelNum: 4,
    title: "極地雪橇犬飛馳（速率小數除法應用）",
    title_en: "Arctic Sled Speed (Rate & Decimal Division)",
    type: "生活應用題",
    type_en: "Applied Problem",
    story: "天秤城極地巡邏隊駕駛機械雪橇在凍原上高速奔馳，雪橇持續行駛了 3.5 小時，總共行駛了 86.8 公里。請問這架機械雪橇平均每小時行駛多少公里？",
    story_en: "A patrol sled traveled 86.8 kilometers in 3.5 hours across the tundra. What was its average speed in kilometers per hour?",
    question: "計算機械雪橇的平均時速（公里/小時）：",
    question_en: "Calculate the average speed of the sled (km/h):",
    options: [
      {
        text: "平均每小時行駛 24.8 公里",
        text_en: "Average speed is 24.8 km/h",
        isCorrect: true,
        reason: "正確！時速 = 距離 ÷ 時間 = 86.8 ÷ 3.5 = 868 ÷ 35 = 24.8 公里/小時。",
        reason_en: "Correct! Speed = Distance ÷ Time = 86.8 ÷ 3.5 = 868 ÷ 35 = 24.8 km/h."
      },
      {
        text: "平均每小時行駛 2.48 公里",
        text_en: "Average speed is 2.48 km/h",
        isCorrect: false,
        reason: "小數點位置標記失誤。",
        reason_en: "Decimal point misplacement."
      },
      {
        text: "平均每小時行駛 248 公里",
        text_en: "Average speed is 248 km/h",
        isCorrect: false,
        reason: "未注意除法最後退位點小數點。",
        reason_en: "Forgot to place the decimal point."
      },
      {
        text: "平均每小時行駛 30.38 公里",
        text_en: "Average speed is 30.38 km/h",
        isCorrect: false,
        reason: "計算錯誤！86.8 ÷ 3.5 除法運算錯誤。",
        reason_en: "Division calculation error."
      }
    ],
    hint: "平均時速 ＝ 總距離 ÷ 總時間。將 86.8 與 3.5 同時向右移一位成 868 ÷ 35。",
    hint_en: "Speed = Distance ÷ Time. Shift decimal points: 86.8 ÷ 3.5 = 868 ÷ 35.",
    svgType: "speed_distance_time",
    solution: "【解題核心】\n1. 時速 ＝ 總距離 ÷ 總時間 ＝ 86.8 ÷ 3.5 ＝ 868 ÷ 35。\n2. 計算得 24.8 公里/小時。",
    solution_en: "[Solution Breakdown]\nSpeed = 86.8 ÷ 3.5 = 868 ÷ 35 = 24.8 km/h."
  },
  {
    id: "u4_l5",
    unitId: 4,
    levelNum: 5,
    title: "糧草補給袋比價（除法取概數與划算決策魔王題）",
    title_en: "Supply Bag Cost Comparison (Rounding Decimals Boss Challenge)",
    type: "魔王應用題",
    type_en: "Boss Challenge",
    story: "天秤城補給站販售兩種恢復體力的能量糧草：「甲袋」每袋重 1.4 公斤，售價 25 枚金幣；「乙袋」每袋重 2.2 公斤，售價 38 枚金幣。請分別求出甲、乙兩袋糧草平均每公斤的售價（四捨五入到小數第一位），並判斷買哪一袋比較划算？",
    story_en: "Two supply bags are sold: Bag A weighs 1.4 kg for 25 coins; Bag B weighs 2.2 kg for 38 coins. Calculate average price per kg for each (round to tenths), and decide which is more cost-effective.",
    question: "求兩袋每公斤單價概數（取至小數第一位），並決定哪一袋更划算：",
    question_en: "Find price per kg (round to tenths) and determine which bag is a better deal:",
    options: [
      {
        text: "甲袋每公斤約 17.9 金幣，乙袋每公斤約 17.3 金幣；買乙袋較划算",
        text_en: "Bag A ≈ 17.9 coins/kg, Bag B ≈ 17.3 coins/kg; Bag B is a better deal",
        isCorrect: true,
        reason: "完全正確！甲：25 ÷ 1.4 ≈ 17.857... => 17.9 金幣。乙：38 ÷ 2.2 ≈ 17.272... => 17.3 金幣。乙袋每公斤單價較便宜，所以買乙袋更划算！",
        reason_en: "Correct! Bag A: 25 ÷ 1.4 ≈ 17.857 => 17.9 coins/kg. Bag B: 38 ÷ 2.2 ≈ 17.272 => 17.3 coins/kg. 17.3 < 17.9, so Bag B is more cost-effective!"
      },
      {
        text: "甲袋每公斤約 17.8 金幣，乙袋每公斤約 17.2 金幣；買乙袋較划算",
        text_en: "Bag A ≈ 17.8 coins/kg, Bag B ≈ 17.2 coins/kg; Bag B is a better deal",
        isCorrect: false,
        reason: "四捨五入錯誤！第二位小數是 5 與 7，都需要進位（17.85 -> 17.9，17.27 -> 17.3），不可直接捨去。",
        reason_en: "Rounding error! Hundredths places (5 and 7) must round UP, not truncate."
      },
      {
        text: "甲袋每公斤約 17.9 金幣，乙袋每公斤約 17.3 金幣；買甲袋較划算",
        text_en: "Bag A ≈ 17.9 coins/kg, Bag B ≈ 17.3 coins/kg; Bag A is a better deal",
        isCorrect: false,
        reason: "邏輯判斷錯誤！採購比划算時，每公斤單價越低才越划算，乙袋 17.3 < 甲袋 17.9，買乙袋才划算！",
        reason_en: "Logic error: a LOWER unit price is more cost-effective."
      },
      {
        text: "甲袋每公斤約 18 金幣，乙袋每公斤約 17 金幣；買乙袋較划算",
        text_en: "Bag A ≈ 18 coins/kg, Bag B ≈ 17 coins/kg; Bag B is a better deal",
        isCorrect: false,
        reason: "未照題目要求取至小數第一位（取成了整數位）。",
        reason_en: "Rounded to nearest whole number instead of tenths."
      }
    ],
    hint: "每公斤售價 ＝ 總金額 ÷ 總重量。四捨五入到小數第一位要看「小數第二位」是否滿 5 進位。單價「低」的才划算！",
    hint_en: "Unit price = Total Cost ÷ Total Weight. Round to tenths by looking at hundredths. Lower unit price is better!",
    svgType: "unit_price_compare",
    solution: "【解題核心】\n1. 甲袋：25 ÷ 1.4 ≈ 17.857... 取至小數第一位 ＝ 17.9 金幣/kg。\n2. 乙袋：38 ÷ 2.2 ≈ 17.272... 取至小數第一位 ＝ 17.3 金幣/kg。\n3. 17.3 < 17.9 => 買乙袋划算！",
    solution_en: "[Solution Breakdown]\n1. Bag A: 25 ÷ 1.4 ≈ 17.857 => 17.9 coins/kg.\n2. Bag B: 38 ÷ 2.2 ≈ 17.272 => 17.3 coins/kg.\n3. 17.3 < 17.9 => Bag B is more cost-effective."
  },

  // ==========================================
  // 【單元五：比與比值】
  // ==========================================
  {
    id: "u5_l1",
    unitId: 5,
    levelNum: 1,
    title: "風暴魔藥調配（前項後項、比值與倍數概念）",
    title_en: "Storm Potion Brewing (Antecedent, Consequent & Ratio Value)",
    type: "觀念選擇題",
    type_en: "Concept Selection",
    story: "黃金比例空島的聖殿刻著古老調和配方：「調製風暴防護魔藥，風靈草結晶與暴雨甘露的容量比是 3 : 8」。四位鍊金學徒對這份配方的解讀如下，請問哪一位學徒的說法是正確的？",
    story_en: "The recipe states: 'The volume ratio of wind grass crystal to storm nectar is 3 : 8.' Four apprentices share their interpretations. Whose statement is correct?",
    question: "下列關於比「3 : 8」的解讀，哪一位學徒的說法是正確的？",
    question_en: "Which interpretation of the ratio '3 : 8' is correct?",
    options: [
      {
        text: "雷恩：「風靈草容量是暴雨甘露容量的 3/8 倍，所以比值是 3/8」",
        text_en: "Ray: 'Wind grass is 3/8 times storm nectar, so the value of the ratio is 3/8'",
        isCorrect: true,
        reason: "完全正確！在 a : b 中，比值 = 前項 ÷ 後項 = a/b。因此風靈草對暴雨甘露的比值為 3 ÷ 8 = 3/8，代表前項是後項的 3/8 倍。",
        reason_en: "Correct! In ratio a : b, value of ratio = antecedent ÷ consequent = a/b = 3/8."
      },
      {
        text: "亞瑟：「在 3 : 8 當中，前項是 8，後項是 3」",
        text_en: "Arthur: 'In 3 : 8, the antecedent is 8 and the consequent is 3'",
        isCorrect: false,
        reason: "基本觀念錯誤！比號前面的是前項（3），比號後面的是後項（8），順序不可顛倒。",
        reason_en: "Error! Antecedent is 3; consequent is 8."
      },
      {
        text: "莉莉：「風靈草容量對暴雨甘露容量的比值是 8/3」",
        text_en: "Lily: 'The value of the ratio is 8/3'",
        isCorrect: false,
        reason: "迷思錯誤！比值是前項除以後項 (3÷8=3/8)，不可倒反成後項除以前項 (8/3)。",
        reason_en: "Misconception! Ratio value is antecedent ÷ consequent (3/8), not 8/3."
      },
      {
        text: "朵拉：「如果要調配一大壺魔藥，風靈草只要比暴雨甘露少加 5 毫升就一定符合配方」",
        text_en: "Dora: 'As long as wind grass is 5 mL less than storm nectar, it matches the recipe'",
        isCorrect: false,
        reason: "迷思錯誤！比代表的是兩數的「倍數關係（乘除）」，而不是相差固定毫升（差不變）。",
        reason_en: "Misconception! Ratio represents multiplicative relationship, not constant difference."
      }
    ],
    hint: "前項在左，後項在右。比值 ＝ 前項 ÷ 後項。比是倍數關係，不是相差幾毫升！",
    hint_en: "Antecedent on left, consequent on right. Ratio Value = Antecedent ÷ Consequent.",
    svgType: "ratio_bar_concept",
    solution: "【解題核心】\n1. 3 是前項，8 是後項。\n2. 比值 ＝ 前項 ÷ 後項 ＝ 3 ÷ 8 ＝ 3/8。\n3. 代表前項是後項的 3/8 倍。",
    solution_en: "[Solution Breakdown]\n1. Antecedent = 3, Consequent = 8.\n2. Ratio Value = 3 ÷ 8 = 3/8.\n3. Antecedent is 3/8 times the consequent."
  },
  {
    id: "u5_l2",
    unitId: 5,
    levelNum: 2,
    title: "紋章石板與連鎖相等比（方格面積比與未知數）",
    title_en: "Crest Slate & Equal Ratios (Grid Ratio & Unknowns)",
    type: "基礎推理題",
    type_en: "Basic Reasoning",
    story: "神廟大門鑲嵌著由 20 個大小相同正方形方格組成的「光暗紋章石板」（其中 8 格為金色光輝、12 格為銀白暗影）。石板下方有一組連鎖比例密碼鎖，必須保持與紋章相同的比才能解鎖：已知 4 : 6 = 10 : A = B : 21。",
    story_en: "A 20-square grid has 8 gold and 12 silver squares. Equal ratio lock: 4 : 6 = 10 : A = B : 21.",
    question: "石板上金色面積對銀白面積的比值為多少？且密碼鎖中的未知數之和 (A + B) 是多少？",
    question_en: "What is the ratio value of gold to silver area, and what is A + B?",
    options: [
      {
        text: "比值為 2/3，且 A + B 的總和是 29",
        text_en: "Ratio value is 2/3, and A + B = 29",
        isCorrect: true,
        reason: "正確！金色對銀白 = 8:12，比值 = 8/12 = 2/3。連鎖比 4:6 化簡為 2:3。2:3 = 10:A => A = 15；2:3 = B:21 => B = 14。A + B = 15 + 14 = 29！",
        reason_en: "Correct! Gold to silver = 8:12 => 2/3. In 2:3 = 10:A => A = 15. In 2:3 = B:21 => B = 14. A + B = 15 + 14 = 29!"
      },
      {
        text: "比值為 2/3，且 A + B 的總和是 30",
        text_en: "Ratio value is 2/3, and A + B = 30",
        isCorrect: false,
        reason: "計算錯誤！A 或 B 求值失誤。",
        reason_en: "Calculation error in A or B."
      },
      {
        text: "比值為 3/2，且 A + B 的總和是 29",
        text_en: "Ratio value is 3/2, and A + B = 29",
        isCorrect: false,
        reason: "比值顛倒！金色對銀白是 8:12 = 2/3，算成銀白對金色 12:8 = 3/2。",
        reason_en: "Inverted ratio value (silver to gold instead of gold to silver)."
      },
      {
        text: "比值為 2/3，且 A + B 的總和是 25",
        text_en: "Ratio value is 2/3, and A + B = 25",
        isCorrect: false,
        reason: "計算錯誤！",
        reason_en: "Calculation error."
      }
    ],
    hint: "比值必須以最簡分數表示。相等比可以利用「前項擴大幾倍，後項也擴大幾倍」或交叉相乘推算。",
    hint_en: "Simplify 8/12 to 2/3. Use 2:3 to find A (10 × 3/2 = 15) and B (21 × 2/3 = 14).",
    svgType: "grid_ratio_puzzle",
    solution: "【解題核心】\n1. 比值 ＝ 8 ÷ 12 ＝ 2/3。\n2. 2 : 3 ＝ 10 : A => A ＝ 15。\n3. 2 : 3 ＝ B : 21 => B ＝ 14。\n4. A ＋ B ＝ 15 ＋ 14 ＝ 29。",
    solution_en: "[Solution Breakdown]\n1. Ratio value = 8/12 = 2/3.\n2. 2:3 = 10:A => A = 15.\n3. 2:3 = B:21 => B = 14.\n4. A + B = 15 + 14 = 29."
  },
  {
    id: "u5_l3",
    unitId: 5,
    levelNum: 3,
    title: "合金配方最簡整數比（小數與分數比之化簡）",
    title_en: "Alloy Recipes Simplest Integer Ratio",
    type: "化簡計算題",
    type_en: "Simplification",
    story: "啟動神殿中央的熔合祭壇前，必須將羊皮卷上記錄為小數與分數的兩組元素配方化為「最簡整數比」：【星銀配方】星銀 3.2 克 ： 寒鐵 0.48 克；【聖泉配方】精靈露 1.2 公升 ： 聖泉水 1 3/5 公升。",
    story_en: "Simplify both recipes to simplest integer ratios: [Star Silver] 3.2 g : 0.48 g; [Spring Water] 1.2 L : 1 3/5 L.",
    question: "將兩組配方化為最簡整數比，請問化簡後的答案分別是多少？",
    question_en: "Simplify both recipes to simplest integer ratios:",
    options: [
      {
        text: "【星銀配方】20 : 3，【聖泉配方】3 : 4",
        text_en: "[Star Silver] 20 : 3, [Spring Water] 3 : 4",
        isCorrect: true,
        reason: "完全正確！星銀：3.2:0.48 = 320:48，同除以 16 得 20:3。聖泉：1.2:1 3/5 = 1.2:1.6 = 12:16，同除以 4 得 3:4！",
        reason_en: "Correct! 3.2 : 0.48 = 320 : 48 = 20 : 3. 1.2 : 1 3/5 = 1.2 : 1.6 = 12 : 16 = 3 : 4."
      },
      {
        text: "【星銀配方】20 : 3，【聖泉配方】12 : 16",
        text_en: "[Star Silver] 20 : 3, [Spring Water] 12 : 16",
        isCorrect: false,
        reason: "未化至最簡！12:16 還能繼續同除以 4 化簡成 3:4。",
        reason_en: "Not in lowest terms! 12:16 can simplify to 3:4."
      },
      {
        text: "【星銀配方】10 : 1.5，【聖泉配方】3 : 4",
        text_en: "[Star Silver] 10 : 1.5, [Spring Water] 3 : 4",
        isCorrect: false,
        reason: "不是整數比！1.5 是小數，最簡整數比各項必須是互質的整數。",
        reason_en: "Not integers! 1.5 is a decimal."
      },
      {
        text: "【星銀配方】40 : 6，【聖泉配方】6 : 8",
        text_en: "[Star Silver] 40 : 6, [Spring Water] 6 : 8",
        isCorrect: false,
        reason: "未約分至互質最簡整數。",
        reason_en: "Not simplified to coprime integers."
      }
    ],
    hint: "小數比：先同乘 10 或 100 變整數，再除以最大公因數。分數小數混合：把帶分數化為小數（1 3/5 = 1.6）或同化為分數通分！",
    hint_en: "Multiply by 100 to remove decimals, then divide by GCD. Convert 1 3/5 to 1.6.",
    svgType: "ratio_simplification",
    solution: "【解題核心】\n1. 3.2 : 0.48 ＝ 320 : 48 ＝ 20 : 3。\n2. 1.2 : 1 3/5 ＝ 1.2 : 1.6 ＝ 12 : 16 ＝ 3 : 4。",
    solution_en: "[Solution Breakdown]\n1. 3.2 : 0.48 = 320 : 48 = 20 : 3.\n2. 1.2 : 1 3/5 = 1.2 : 1.6 = 12 : 16 = 3 : 4."
  },
  {
    id: "u5_l4",
    unitId: 5,
    levelNum: 4,
    title: "傳奇巨盾鍛造（比例差額按比分配應用）",
    title_en: "Legendary Shield Forging (Proportional Difference Allocation)",
    type: "素養應用題",
    type_en: "Applied Problem",
    story: "為了抵禦魔王終極衝擊，聖殿鐵匠要將「精金」與「烏金」熔煉鍛造出一面傳奇巨盾。鍛造配方規定：精金與烏金的重量比必須是 5 : 8。鍛造時，烏金比精金多用了 120 公斤。請問鍛造這面巨盾所使用的精金與烏金「總共」重多少公斤？",
    story_en: "A shield requires gold and dark iron in a weight ratio of 5 : 8. Dark iron used was 120 kg MORE than gold. What was the TOTAL weight of both metals used?",
    question: "求打造傳奇巨盾使用的精金與烏金「總重量」：",
    question_en: "Find the TOTAL weight of gold and dark iron used:",
    options: [
      {
        text: "總共重 520 公斤",
        text_en: "Total weight is 520 kg",
        isCorrect: true,
        reason: "完全正確！比例差 = 8 - 5 = 3 份。每份 = 120 ÷ 3 = 40 公斤。總份數 = 5 + 8 = 13 份。總重量 = 40 × 13 = 520 公斤！",
        reason_en: "Correct! Difference in parts = 8 - 5 = 3 parts = 120 kg => 1 part = 40 kg. Total parts = 5 + 8 = 13 parts => 40 × 13 = 520 kg!"
      },
      {
        text: "總共重 200 公斤",
        text_en: "Total weight is 200 kg",
        isCorrect: false,
        reason: "迷思錯誤！200 公斤 (40 × 5) 只是精金的重量，題目問的是『總共』重多少公斤。",
        reason_en: "Misconception! 200 kg is only the gold weight, not the total."
      },
      {
        text: "總共重 320 公斤",
        text_en: "Total weight is 320 kg",
        isCorrect: false,
        reason: "迷思錯誤！320 公斤 (40 × 8) 只是烏金的重量，題目問的是『總共』重多少公斤。",
        reason_en: "Misconception! 320 kg is only the dark iron weight, not the total."
      },
      {
        text: "總共重 390 公斤",
        text_en: "Total weight is 390 kg",
        isCorrect: false,
        reason: "計算錯誤！每份算錯為 30 公斤。",
        reason_en: "Calculation error: miscalculated 1 part as 30 kg."
      }
    ],
    hint: "兩數的份數差是 8 － 5 ＝ 3 份，這 3 份對應 120 公斤，先算出 1 份是幾公斤。總共是 5 ＋ 8 ＝ 13 份！",
    hint_en: "Difference = 8 - 5 = 3 parts = 120 kg => 1 part = 40 kg. Total = 5 + 8 = 13 parts.",
    svgType: "ratio_tape_diagram",
    solution: "【解題核心】\n1. 差額 8 － 5 ＝ 3 份。\n2. 每份重量：120 ÷ 3 ＝ 40 公斤。\n3. 總重量 (5 ＋ 8 ＝ 13 份)：40 × 13 ＝ 520 公斤。",
    solution_en: "[Solution Breakdown]\n1. Difference: 8 - 5 = 3 parts = 120 kg.\n2. Weight per part = 120 ÷ 3 = 40 kg.\n3. Total weight = (5 + 8) × 40 = 520 kg."
  },
  {
    id: "u5_l5",
    unitId: 5,
    levelNum: 5,
    title: "黃金封印結界（周長與長寬比求面積魔王題）",
    title_en: "Golden Barrier (Perimeter & Ratio to Area Boss Challenge)",
    type: "魔王應用題",
    type_en: "Boss Challenge",
    story: "探險家高舉封印神器，用一條全長 100 公尺的「黃金封印鎖鏈」在聖殿核心恰好圍成一個長方形的封印結界。已知這個長方形結界的「長對寬的比是 3 : 2」，請問這個長方形封印結界的「面積」是多少平方公尺？",
    story_en: "A 100 m golden chain encloses a rectangular magical barrier with a length-to-width ratio of 3 : 2. What is the AREA of this barrier in square meters?",
    question: "求長方形封印結界的面積（平方公尺）：",
    question_en: "Find the area of the rectangular barrier (square meters):",
    options: [
      {
        text: "面積是 600 平方公尺",
        text_en: "Area is 600 square meters",
        isCorrect: true,
        reason: "完全正確！長方形周長 = 100，長 + 寬 = 100 ÷ 2 = 50 公尺 (半周長！)。總份數 = 3 + 2 = 5 份。每份 = 50 ÷ 5 = 10 公尺。長 = 10 × 3 = 30 公尺，寬 = 10 × 2 = 20 公尺。面積 = 30 × 20 = 600 平方公尺！",
        reason_en: "Correct! Perimeter = 100 m => Semi-perimeter (Length + Width) = 100 ÷ 2 = 50 m. Total parts = 3 + 2 = 5 parts => 1 part = 10 m. Length = 30 m, Width = 20 m. Area = 30 × 20 = 600 m²!"
      },
      {
        text: "面積是 2400 平方公尺",
        text_en: "Area is 2400 square meters",
        isCorrect: false,
        reason: "最經典超大陷阱！直接拿周長 100 除以 5 份 (得長 60, 寬 40)，忘記周長包含了『兩個長與兩個寬』！必須先除以 2 算半周長！",
        reason_en: "Classic trap! Divided total perimeter by 5 directly, forgetting that perimeter includes TWO lengths and TWO widths (must divide by 2 for semi-perimeter first)!"
      },
      {
        text: "面積是 500 平方公尺",
        text_en: "Area is 500 square meters",
        isCorrect: false,
        reason: "計算錯誤！",
        reason_en: "Calculation error."
      },
      {
        text: "面積是 1200 平方公尺",
        text_en: "Area is 1200 square meters",
        isCorrect: false,
        reason: "計算錯誤！長寬相乘後多除以了 2。",
        reason_en: "Calculation error: divided area by 2."
      }
    ],
    hint: "注意！周長 ＝ (長 ＋ 寬) × 2。所以「長 ＋ 寬」＝ 周長 ÷ 2 (半周長)！先算出長與寬各是幾公尺，再求面積（長 × 寬）。",
    hint_en: "Perimeter = 2 × (Length + Width). Semi-perimeter = 100 ÷ 2 = 50 m. Length = 3 parts (30m), Width = 2 parts (20m). Area = 30 × 20.",
    svgType: "perimeter_ratio_rect",
    solution: "【解題核心】\n1. 長方形半周長 (長 ＋ 寬) ＝ 100 ÷ 2 ＝ 50 公尺。\n2. 每份長度 ＝ 50 ÷ (3 ＋ 2) ＝ 10 公尺。\n3. 長 ＝ 30 公尺，寬 ＝ 20 公尺。\n4. 面積 ＝ 30 × 20 ＝ 600 平方公尺。",
    solution_en: "[Solution Breakdown]\n1. Semi-perimeter = 100 ÷ 2 = 50 m.\n2. Length + Width = 5 parts => 1 part = 10 m.\n3. Length = 30 m, Width = 20 m.\n4. Area = 30 × 20 = 600 m²."
  }
];
