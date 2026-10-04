// js/generator.js - 國小六年級數學「植樹問題（間隔問題）」動態出題引擎與 SVG 圖解生成器
// 特色：
// 1. 嚴格落實「動態改數字」機制：同類型題目提供至少 15~30 組不同生活化數值組合，並具備近期記憶防重複機制。
// 2. 數值全部逆向推導，保證整除無小數誤差、計算合情合理。
// 3. 嚴格產出 8 個互不相同的選項（1 個正解 + 7 個精準鎖定學生迷思的干擾選項）。
// 4. 動態生成教學級 SVG 向量圖解（直線數線、端點標記、弧線間距、封閉圓形/矩形路徑圖），覆盤效果極佳！

const IntervalQuestionGenerator = {
  // 記錄最近使用過的數字特徵，確保不重複出現相同數字
  usedSignatures: new Set(),
  maxHistory: 30,

  randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  sample(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  },

  recordSignature(sig) {
    this.usedSignatures.add(sig);
    if (this.usedSignatures.size > this.maxHistory) {
      const first = this.usedSignatures.values().next().value;
      this.usedSignatures.delete(first);
    }
  },

  // 確保精確產出 8 個互不相同的選項
  ensureEightOptions(correctAns, rawDistractors) {
    const unique = new Set([correctAns]);

    for (const d of rawDistractors) {
      if (d && d !== correctAns && !unique.has(d)) {
        unique.add(d);
        if (unique.size === 8) break;
      }
    }

    // 若不足 8 個，依數字型補充合理干擾項
    const numMatch = correctAns.match(/\d+/);
    let offset = 1;
    while (unique.size < 8 && offset < 50 && numMatch) {
      const num = parseInt(numMatch[0], 10);
      const candidates = [
        correctAns.replace(numMatch[0], String(Math.max(1, num + offset))),
        correctAns.replace(numMatch[0], String(Math.max(1, num - offset))),
        correctAns.replace(numMatch[0], String(Math.max(1, num + offset * 2))),
        correctAns.replace(numMatch[0], String(Math.max(1, num - offset * 2)))
      ];
      for (const c of candidates) {
        if (!unique.has(c)) {
          unique.add(c);
          if (unique.size === 8) break;
        }
      }
      offset++;
    }

    const result = Array.from(unique).slice(0, 8);
    return this.shuffle(result);
  },

  // =========================================================================
  // 1. 題型類別：路燈與物體編號問題 (課本 P.46, P.51)
  // 核心觀念：間隔數 = 後號 - 前號 (不用 +1 也不能 -1)
  // =========================================================================
  generateNumberingQuestion() {
    // 至少提供 20+ 組不同參數池，並進行防重複檢查
    const configs = [
      { road: '中興路', item: '路燈', unit: '公尺', dist: 25, start: 36, end: 51 },
      { road: '中山路', item: '路燈', unit: '公尺', dist: 20, start: 15, end: 32 },
      { road: '三民路', item: '路燈', unit: '公尺', dist: 28, start: 34, end: 79 },
      { road: '校園圍牆', item: '彩旗', unit: '公尺', dist: 15, start: 7, end: 16 },
      { road: '信義路', item: '路燈', unit: '公尺', dist: 30, start: 12, end: 28 },
      { road: '忠孝東路', item: '行道樹', unit: '公尺', dist: 18, start: 5, end: 25 },
      { road: '光復路', item: '路燈', unit: '公尺', dist: 24, start: 21, end: 46 },
      { road: '文化路', item: '路燈', unit: '公尺', dist: 35, start: 8, end: 22 },
      { road: '公園步道', item: '景觀燈', unit: '公尺', dist: 12, start: 14, end: 39 },
      { road: '體育場外圍', item: '旗桿', unit: '公尺', dist: 16, start: 9, end: 34 },
      { road: '和平路', item: '路燈', unit: '公尺', dist: 40, start: 17, end: 37 },
      { road: '仁愛路', item: '樟樹', unit: '公尺', dist: 22, start: 6, end: 31 },
      { road: '自強街', item: '路燈', unit: '公尺', dist: 14, start: 11, end: 41 },
      { road: '復興路', item: '路燈', unit: '公尺', dist: 32, start: 23, end: 48 },
      { road: '大業路', item: '路燈', unit: '公尺', dist: 26, start: 18, end: 53 },
      { road: '林森路', item: '路燈', unit: '公尺', dist: 25, start: 42, end: 70 },
      { road: '民生路', item: '路燈', unit: '公尺', dist: 15, start: 27, end: 62 },
      { road: '成功路', item: '路燈', unit: '公尺', dist: 30, start: 35, end: 65 },
      { road: '博愛街', item: '盆栽', unit: '公尺', dist: 10, start: 19, end: 54 },
      { road: '新生南路', item: '欒樹', unit: '公尺', dist: 20, start: 8, end: 43 }
    ];

    let chosen = null;
    for (const c of this.shuffle(configs)) {
      const sig = `num_${c.start}_${c.end}_${c.dist}`;
      if (!this.usedSignatures.has(sig)) {
        chosen = c;
        this.recordSignature(sig);
        break;
      }
    }
    if (!chosen) chosen = this.sample(configs);

    // 隨機微調擴充數字池，確保絕對有 10 個以上不同變形
    const deltaShift = this.randInt(-2, 3);
    const startNum = Math.max(1, chosen.start + deltaShift);
    const intervalCount = (chosen.end - chosen.start);
    const endNum = startNum + intervalCount;
    const dist = chosen.dist;
    const totalDist = intervalCount * dist;

    const questionText = `${chosen.road}上相鄰兩${chosen.item === '彩旗' || chosen.item === '旗桿' ? '根' : chosen.item === '樟樹' || chosen.item === '行道樹' || chosen.item === '欒樹' ? '棵' : chosen.item === '盆栽' ? '個' : '盞'}${chosen.item}都相距 ${dist} ${chosen.unit}，從第 1 號開始依序編號。請問第 ${startNum} 號到第 ${endNum} 號的${chosen.item}相距多少${chosen.unit}？`;

    const correctAns = `${totalDist} ${chosen.unit}`;

    // 迷思干擾項：
    // 迷思 1: 誤以為間隔數要 +1 (算成 (end - start + 1) * dist)
    // 迷思 2: 誤以為間隔數要 -1 (算成 (end - start - 1) * dist)
    // 迷思 3: 誤用編號相乘 (end * dist)
    // 迷思 4: 間隔數看錯
    const rawDistractors = [
      `${(intervalCount + 1) * dist} ${chosen.unit}`,
      `${(intervalCount - 1) * dist} ${chosen.unit}`,
      `${endNum * dist} ${chosen.unit}`,
      `${startNum * dist} ${chosen.unit}`,
      `${intervalCount} ${chosen.unit}`,
      `${(intervalCount + 2) * dist} ${chosen.unit}`,
      `${totalDist + dist} ${chosen.unit}`,
      `${Math.max(dist, totalDist - dist * 2)} ${chosen.unit}`
    ];

    const options = this.ensureEightOptions(correctAns, rawDistractors);

    // 產生 SVG 動態解說圖
    const svgDiagram = `
      <svg viewBox="0 0 760 170" width="100%" height="170" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arr-gold" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
          </marker>
        </defs>
        <!-- 道路基線 -->
        <line x1="50" y1="110" x2="710" y2="110" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        
        <!-- 起點燈號 -->
        <circle cx="120" cy="110" r="8" fill="#38bdf8"/>
        <line x1="120" y1="110" x2="120" y2="60" stroke="#38bdf8" stroke-width="4"/>
        <circle cx="120" cy="55" r="10" fill="#facc15"/>
        <text x="120" y="140" fill="#e2e8f0" font-size="16" font-weight="bold" text-anchor="middle">第 ${startNum} 號</text>

        <!-- 中間省略線 -->
        <text x="415" y="85" fill="#94a3b8" font-size="28" letter-spacing="8" text-anchor="middle">・・・・・・</text>
        <text x="415" y="138" fill="#38bdf8" font-size="15" font-weight="bold" text-anchor="middle">共有 ${intervalCount} 個間隔 (每格 ${dist}m)</text>

        <!-- 終點燈號 -->
        <circle cx="640" cy="110" r="8" fill="#38bdf8"/>
        <line x1="640" y1="110" x2="640" y2="60" stroke="#38bdf8" stroke-width="4"/>
        <circle cx="640" cy="55" r="10" fill="#facc15"/>
        <text x="640" y="140" fill="#e2e8f0" font-size="16" font-weight="bold" text-anchor="middle">第 ${endNum} 號</text>

        <!-- 頂部總長度弧線箭頭 -->
        <path d="M 125 35 Q 380 5 635 35" fill="none" stroke="#f59e0b" stroke-width="3" marker-start="url(#arr-gold)" marker-end="url(#arr-gold)"/>
        <text x="380" y="24" fill="#fbbf24" font-size="17" font-weight="bold" text-anchor="middle">總距離 = ${intervalCount} × ${dist} = ${totalDist} ${chosen.unit}</text>
      </svg>
    `;

    const explanation = `
      <div class="exp-step">
        <span class="step-num">步驟 1</span>
        <strong>找出「間隔數」：</strong><br>
        編號相差即為間隔數，切勿多加 1！<br>
        算式：<code>${endNum} - ${startNum} = ${intervalCount}</code>（個間隔）
      </div>
      <div class="exp-step">
        <span class="step-num">步驟 2</span>
        <strong>計算「總距離」：</strong><br>
        每個間隔長度為 ${dist} ${chosen.unit}：<br>
        算式：<code>${dist} × ${intervalCount} = ${totalDist}</code> ${chosen.unit}
      </div>
      <div class="exp-key-rule">
        💡 <strong>觀念精要：</strong>路燈/旗子有明確編號時，「間隔數 ＝ 後號 － 前號」！
      </div>
    `;

    return {
      type: 'numbering',
      title: '路燈編號與間隔問題',
      question: questionText,
      options,
      answer: correctAns,
      svgDiagram,
      explanation
    };
  },

  // =========================================================================
  // 2. 題型類別：直線型植樹－求數量（課本 P.47, P.51）
  // 包含：兩端都設 (+1)、一端設一端不設 (=N)、兩端都不設 (-1)、以及單側 vs 兩側 (×2)
  // =========================================================================
  generateLinearCountQuestion() {
    // 豐富的數值參數庫 (15+ 組)
    const baseParams = [
      { total: 600, dist: 25, item: '路燈', unit: '公尺', countUnit: '盞' },
      { total: 1200, dist: 40, item: '行道樹', unit: '公尺', countUnit: '棵' },
      { total: 450, dist: 15, item: '路燈', unit: '公尺', countUnit: '盞' },
      { total: 800, dist: 20, item: '樟樹', unit: '公尺', countUnit: '棵' },
      { total: 360, dist: 12, item: '彩旗', unit: '公尺', countUnit: '面' },
      { total: 500, dist: 25, item: '花盆', unit: '公尺', countUnit: '個' },
      { total: 720, dist: 30, item: '路燈', unit: '公尺', countUnit: '盞' },
      { total: 350, dist: 14, item: '小樹苗', unit: '公尺', countUnit: '棵' },
      { total: 960, dist: 32, item: '景觀燈', unit: '公尺', countUnit: '盞' },
      { total: 480, dist: 16, item: '國旗', unit: '公尺', countUnit: '面' },
      { total: 1500, dist: 50, item: '路燈', unit: '公尺', countUnit: '盞' },
      { total: 420, dist: 20, item: '風鈴木', unit: '公尺', countUnit: '棵' },
      { total: 280, dist: 35, item: '花盆', unit: '公尺', countUnit: '個' },
      { total: 630, dist: 21, item: '木樁', unit: '公尺', countUnit: '根' },
      { total: 380, dist: 19, item: '花盆', unit: '公尺', countUnit: '個' },
      { total: 540, dist: 18, item: '路燈', unit: '公尺', countUnit: '盞' },
      { total: 1000, dist: 25, item: '行道樹', unit: '公尺', countUnit: '棵' },
      { total: 320, dist: 16, item: '彩旗', unit: '公尺', countUnit: '面' }
    ];

    // 四種情況子類型
    // 0: 兩端都設 (單側) -> +1
    // 1: 一端設一端不設 (單側) -> =N
    // 2: 兩端都不設 (單側) -> -1
    // 3: 兩端都設 (兩側) -> (+1)*2 (課本做做看經典題型)
    const subTypes = [0, 1, 2, 3];
    const subType = this.sample(subTypes);

    let chosen = null;
    for (const p of this.shuffle(baseParams)) {
      const sig = `lincnt_${p.total}_${p.dist}_${subType}`;
      if (!this.usedSignatures.has(sig)) {
        chosen = p;
        this.recordSignature(sig);
        break;
      }
    }
    if (!chosen) chosen = this.sample(baseParams);

    // 隨機乘數擴增題庫 (整除保證)
    const multiplier = this.sample([1, 1, 1, 2, 1.5].filter(m => Number.isInteger((chosen.total * m) / chosen.dist)));
    const total = Math.round(chosen.total * multiplier);
    const dist = chosen.dist;
    const intervals = total / dist;

    let questionText = '';
    let correctCount = 0;
    let endRuleText = '';
    let endFormula = '';
    let diagramEndLeft = true;
    let diagramEndRight = true;

    if (subType === 0) {
      // 兩端都設 (單側)
      correctCount = intervals + 1;
      questionText = `有一條筆直的道路全長 ${total} ${chosen.unit}，在道路的「一側」每隔 ${dist} ${chosen.unit}設置一${chosen.countUnit}${chosen.item}。如果這條道路的「頭尾兩端都有設置」，這條道路一共有幾${chosen.countUnit}${chosen.item}？`;
      endRuleText = '兩端都設置 ➔ 數量 ＝ 間隔數 ＋ 1';
      endFormula = `${intervals} + 1 = ${correctCount}`;
      diagramEndLeft = true;
      diagramEndRight = true;
    } else if (subType === 1) {
      // 一端有一端沒有 (單側)
      correctCount = intervals;
      questionText = `有一條筆直的道路全長 ${total} ${chosen.unit}，在道路的「一側」每隔 ${dist} ${chosen.unit}設置一${chosen.countUnit}${chosen.item}。如果這條道路「其中一端有設置，另一端沒有設置」，這條道路一共有幾${chosen.countUnit}${chosen.item}？`;
      endRuleText = '一端有一端沒有 ➔ 數量 ＝ 間隔數';
      endFormula = `${intervals} ＝ ${correctCount}`;
      diagramEndLeft = true;
      diagramEndRight = false;
    } else if (subType === 2) {
      // 兩端都沒有 (單側)
      correctCount = intervals - 1;
      questionText = `有一條筆直的長廊全長 ${total} ${chosen.unit}，在長廊的「一側」每隔 ${dist} ${chosen.unit}設置一${chosen.countUnit}${chosen.item}。如果「頭尾兩端都沒有設置」，這條長廊一共有幾${chosen.countUnit}${chosen.item}？`;
      endRuleText = '兩端都沒有設置 ➔ 數量 ＝ 間隔數 － 1';
      endFormula = `${intervals} - 1 = ${correctCount}`;
      diagramEndLeft = false;
      diagramEndRight = false;
    } else {
      // 兩側都設 (課本 P.47 做做看 1200m每隔40m兩側都要種)
      const oneSide = intervals + 1;
      correctCount = oneSide * 2;
      questionText = `有一條筆直的道路全長 ${total} ${chosen.unit}，在道路的「兩側」每隔 ${dist} ${chosen.unit}種植一${chosen.countUnit}${chosen.item}。如果道路的「頭尾兩端都要種植」，請問共種植了幾${chosen.countUnit}${chosen.item}？`;
      endRuleText = '兩端都設且為「兩側」 ➔ 單側 (間隔數＋1)，再乘以 2！';
      endFormula = `(${intervals} + 1) × 2 = ${correctCount}`;
      diagramEndLeft = true;
      diagramEndRight = true;
    }

    const correctAns = `${correctCount} ${chosen.countUnit}`;

    // 迷思干擾項配置：忘記加1、多加1、忘了減1、忘記乘2、或者多乘2
    const rawDistractors = [
      `${intervals} ${chosen.countUnit}`,
      `${intervals + 1} ${chosen.countUnit}`,
      `${Math.max(1, intervals - 1)} ${chosen.countUnit}`,
      `${(intervals + 1) * 2} ${chosen.countUnit}`,
      `${intervals * 2} ${chosen.countUnit}`,
      `${Math.max(1, (intervals - 1) * 2)} ${chosen.countUnit}`,
      `${correctCount + 2} ${chosen.countUnit}`,
      `${Math.max(1, correctCount - 2)} ${chosen.countUnit}`,
      `${intervals + 2} ${chosen.countUnit}`
    ];

    const options = this.ensureEightOptions(correctAns, rawDistractors);

    // SVG 圖解
    const leftSymbol = diagramEndLeft 
      ? '<circle cx="110" cy="85" r="9" fill="#10b981"/><text x="110" y="115" fill="#34d399" font-size="13" text-anchor="middle">頭端(有)</text>'
      : '<circle cx="110" cy="85" r="7" fill="none" stroke="#f43f5e" stroke-width="3"/><text x="110" y="115" fill="#f87171" font-size="13" text-anchor="middle">頭端(無)</text>';
    
    const rightSymbol = diagramEndRight
      ? '<circle cx="650" cy="85" r="9" fill="#10b981"/><text x="650" y="115" fill="#34d399" font-size="13" text-anchor="middle">尾端(有)</text>'
      : '<circle cx="650" cy="85" r="7" fill="none" stroke="#f43f5e" stroke-width="3"/><text x="650" y="115" fill="#f87171" font-size="13" text-anchor="middle">尾端(無)</text>';

    const svgDiagram = `
      <svg viewBox="0 0 760 170" width="100%" height="170" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arr-line" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
          </marker>
        </defs>
        <!-- 全長尺寸線 -->
        <path d="M 115 35 L 645 35" stroke="#38bdf8" stroke-width="3" marker-start="url(#arr-line)" marker-end="url(#arr-line)"/>
        <text x="380" y="26" fill="#38bdf8" font-size="16" font-weight="bold" text-anchor="middle">全長 ${total} ${chosen.unit}</text>

        <!-- 道路主體 -->
        <rect x="80" y="75" width="600" height="20" rx="10" fill="#334155"/>
        
        ${leftSymbol}
        <!-- 中間示意間隔 -->
        <circle cx="218" cy="85" r="8" fill="#10b981"/>
        <circle cx="326" cy="85" r="8" fill="#10b981"/>
        <text x="435" y="88" fill="#94a3b8" font-size="24" letter-spacing="6" text-anchor="middle">・・・・</text>
        <circle cx="542" cy="85" r="8" fill="#10b981"/>
        ${rightSymbol}

        <text x="380" y="148" fill="#fbbf24" font-size="15" font-weight="bold" text-anchor="middle">
          間隔數 = ${total} ÷ ${dist} = ${intervals} (個間隔)${subType === 3 ? ' ｜ ★注意：題目為「兩側」！' : ''}
        </text>
      </svg>
    `;

    const explanation = `
      <div class="exp-step">
        <span class="step-num">步驟 1</span>
        <strong>求出間隔數：</strong><br>
        全長 ÷ 間距 ＝ 間隔數<br>
        算式：<code>${total} ÷ ${dist} = ${intervals}</code>（個間隔）
      </div>
      <div class="exp-step">
        <span class="step-num">步驟 2</span>
        <strong>依端點情況求數量：</strong><br>
        ${endRuleText}<br>
        算式：<code>${endFormula}</code> ${chosen.countUnit}
      </div>
      <div class="exp-key-rule">
        💡 <strong>解題口訣：</strong>兩端都設要 <strong>+1</strong>；一有一無<strong>剛剛好</strong>；兩端都不設要 <strong>-1</strong>！${subType === 3 ? '【注意：兩側記得 ×2】' : ''}
      </div>
    `;

    return {
      type: 'linear_count',
      title: '直線型植樹（求數量）',
      question: questionText,
      options,
      answer: correctAns,
      svgDiagram,
      explanation
    };
  },

  // =========================================================================
  // 3. 題型類別：直線型植樹－求間距與全長（課本 P.48）
  // 核心觀念：已知全長求間距 (全長 ÷ 間隔數)，或已知棵數求全長 (間隔數 × 間距)
  // =========================================================================
  generateLinearDistQuestion() {
    // 豐富的整除參數庫 (15+ 組)
    const baseParams = [
      { total: 420, count: 21, item: '氣球', unit: '公分', countUnit: '個', context: '繩子' },
      { total: 280, count: 7, item: '旗子', unit: '公尺', countUnit: '枝', context: '道路' },
      { total: 234, count: 13, item: '國旗', unit: '公尺', countUnit: '面', context: '橋樑' },
      { total: 360, count: 19, item: '彩帶花', unit: '公分', countUnit: '朵', context: '綵帶' },
      { total: 540, count: 28, item: '燈泡', unit: '公分', countUnit: '個', context: '燈串' },
      { total: 300, count: 11, item: '路燈', unit: '公尺', countUnit: '盞', context: '街道' },
      { total: 480, count: 17, item: '樹木', unit: '公尺', countUnit: '棵', context: '大道' },
      { total: 200, count: 9, item: '盆栽', unit: '公尺', countUnit: '盆', context: '走廊' },
      { total: 600, count: 25, item: '旗桿', unit: '公尺', countUnit: '根', context: '運動場' },
      { total: 450, count: 16, item: '標示牌', unit: '公尺', countUnit: '面', context: '步道' },
      { total: 350, count: 15, item: '立柱', unit: '公尺', countUnit: '根', context: '圍籬' },
      { total: 630, count: 10, item: '彩旗', unit: '公尺', countUnit: '面', context: '長橋' },
      { total: 400, count: 21, item: '三角錐', unit: '公尺', countUnit: '個', context: '施工段' },
      { total: 560, count: 15, item: '景觀燈', unit: '公尺', countUnit: '盞', context: '公園路' },
      { total: 270, count: 10, item: '氣球', unit: '公分', countUnit: '個', context: '繩索' }
    ];

    // 三種子情境：
    // 0: 兩端都要綁 (求間距: 間隔數 = count - 1, dist = total / (count - 1)) - 課本 P.48 420cm 綁 21 個
    // 1: 一端綁一端不綁 (求間距: 間隔數 = count, dist = total / count) - 課本 P.51 中正橋 234m 插 13 面國旗
    // 2: 兩端都不綁 (求間距: 間隔數 = count + 1, dist = total / (count + 1)) - 課本 P.48 280m 插 7 枝旗子
    // 3: 已知棵數與間距，求全長 (全長 = 間隔數 * 間距)
    const mode = this.sample([0, 1, 2, 3]);

    let chosen = null;
    for (const p of this.shuffle(baseParams)) {
      const sig = `lindist_${p.total}_${p.count}_${mode}`;
      if (!this.usedSignatures.has(sig)) {
        chosen = p;
        this.recordSignature(sig);
        break;
      }
    }
    if (!chosen) chosen = this.sample(baseParams);

    let questionText = '';
    let correctAns = '';
    let intervals = 0;
    let distVal = 0;
    let step1Text = '';
    let step2Text = '';
    let ruleText = '';

    if (mode === 0) {
      // 兩端都要設置 (求間距)
      // intervals = count - 1
      intervals = chosen.count - 1;
      distVal = Math.round(chosen.total / intervals);
      const exactTotal = intervals * distVal; // 確保整除

      questionText = `有一條長 ${exactTotal} ${chosen.unit}的${chosen.context}，要在上面綁 ${chosen.count} ${chosen.countUnit}${chosen.item}，相鄰兩${chosen.countUnit}的距離都相同。如果「兩端都要綁」，相鄰兩${chosen.countUnit}${chosen.item}的距離是多少${chosen.unit}？`;
      correctAns = `${distVal} ${chosen.unit}`;
      ruleText = '兩端都要綁 ➔ 間隔數 ＝ 數量 － 1';
      step1Text = `間隔數：<code>${chosen.count} - 1 = ${intervals}</code>（個間隔）`;
      step2Text = `間距：<code>${exactTotal} ÷ ${intervals} = ${distVal}</code> ${chosen.unit}`;
    } else if (mode === 1) {
      // 一端有一端沒有 (求間距)
      // intervals = count
      intervals = chosen.count;
      distVal = Math.round(chosen.total / intervals);
      const exactTotal = intervals * distVal;

      questionText = `${chosen.context}全長 ${exactTotal} ${chosen.unit}，要在${chosen.context}的一側插 ${chosen.count} ${chosen.countUnit}${chosen.item}，相鄰兩${chosen.countUnit}的距離都相同。如果「一端要插，另一端不插」，相鄰兩${chosen.countUnit}${chosen.item}的距離是多少${chosen.unit}？`;
      correctAns = `${distVal} ${chosen.unit}`;
      ruleText = '一端有一端沒有 ➔ 間隔數 ＝ 數量';
      step1Text = `間隔數：<code>${chosen.count}</code>（個間隔）`;
      step2Text = `間距：<code>${exactTotal} ÷ ${intervals} = ${distVal}</code> ${chosen.unit}`;
    } else if (mode === 2) {
      // 兩端都不設 (求間距)
      // intervals = count + 1
      intervals = chosen.count + 1;
      distVal = Math.round(chosen.total / intervals);
      const exactTotal = intervals * distVal;

      questionText = `在一條長 ${exactTotal} ${chosen.unit}的${chosen.context}一側，要放置 ${chosen.count} ${chosen.countUnit}${chosen.item}，且相鄰兩${chosen.countUnit}的距離都相同。如果「頭尾兩端都不放置」，請問相鄰兩${chosen.countUnit}${chosen.item}的距離是多少${chosen.unit}？`;
      correctAns = `${distVal} ${chosen.unit}`;
      ruleText = '兩端都不放置 ➔ 間隔數 ＝ 數量 ＋ 1';
      step1Text = `間隔數：<code>${chosen.count} + 1 = ${intervals}</code>（個間隔）`;
      step2Text = `間距：<code>${exactTotal} ÷ ${intervals} = ${distVal}</code> ${chosen.unit}`;
    } else {
      // 求全長
      // 已知兩端都設，共有 count 棵，間距 distVal
      distVal = this.sample([15, 18, 20, 25, 30, 35, 40]);
      intervals = chosen.count - 1;
      const totalLen = intervals * distVal;

      questionText = `在公路一側每隔 ${distVal} ${chosen.unit}種植一${chosen.countUnit}${chosen.item}，如果「頭尾兩端都各種植一${chosen.countUnit}」，一共種了 ${chosen.count} ${chosen.countUnit}。請問這段公路全長是多少${chosen.unit}？`;
      correctAns = `${totalLen} ${chosen.unit}`;
      ruleText = '兩端都種植 ➔ 間隔數 ＝ 棵數 － 1，全長 ＝ 間隔數 × 間距';
      step1Text = `間隔數：<code>${chosen.count} - 1 = ${intervals}</code>（個間隔）`;
      step2Text = `全長：<code>${intervals} × ${distVal} = ${totalLen}</code> ${chosen.unit}`;
    }

    // 迷思干擾項配置：間隔數加減顛倒、直接除以數量、數量乘錯
    const baseVal = mode === 3 ? parseInt(correctAns, 10) : distVal;
    const unitStr = chosen.unit;
    const rawDistractors = [
      `${baseVal + 1} ${unitStr}`,
      `${Math.max(1, baseVal - 1)} ${unitStr}`,
      `${baseVal + 2} ${unitStr}`,
      `${Math.max(1, baseVal - 2)} ${unitStr}`,
      `${Math.round(baseVal * 1.5)} ${unitStr}`,
      `${Math.max(5, Math.round(baseVal * 0.8))} ${unitStr}`,
      `${baseVal + 5} ${unitStr}`,
      `${Math.max(2, baseVal - 5)} ${unitStr}`
    ];

    const options = this.ensureEightOptions(correctAns, rawDistractors);

    // SVG 圖解
    const svgDiagram = `
      <svg viewBox="0 0 760 160" width="100%" height="160" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arr-dist" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24" />
          </marker>
        </defs>
        <line x1="80" y1="80" x2="680" y2="80" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
        
        <!-- 間隔示意弧線 -->
        <path d="M 100 70 Q 155 35 210 70" fill="none" stroke="#fbbf24" stroke-width="2.5" marker-end="url(#arr-dist)"/>
        <text x="155" y="42" fill="#fbbf24" font-size="13" font-weight="bold" text-anchor="middle">間距 ${mode === 3 ? distVal : '?'}</text>

        <path d="M 210 70 Q 265 35 320 70" fill="none" stroke="#fbbf24" stroke-width="2.5" marker-end="url(#arr-dist)"/>
        
        <circle cx="100" cy="80" r="8" fill="#ec4899"/>
        <circle cx="210" cy="80" r="8" fill="#ec4899"/>
        <circle cx="320" cy="80" r="8" fill="#ec4899"/>
        
        <text x="430" y="85" fill="#94a3b8" font-size="24" letter-spacing="6" text-anchor="middle">・・・・</text>
        
        <circle cx="570" cy="80" r="8" fill="#ec4899"/>
        <circle cx="660" cy="80" r="8" fill="#ec4899"/>

        <text x="380" y="135" fill="#38bdf8" font-size="15" font-weight="bold" text-anchor="middle">
          共 ${chosen.count} ${chosen.countUnit}${chosen.item} ➔ 產生 ${intervals} 個間隔
        </text>
      </svg>
    `;

    const explanation = `
      <div class="exp-step">
        <span class="step-num">步驟 1</span>
        <strong>確認間隔數：</strong><br>
        ${ruleText}<br>
        ${step1Text}
      </div>
      <div class="exp-step">
        <span class="step-num">步驟 2</span>
        <strong>計算解答：</strong><br>
        ${step2Text}
      </div>
      <div class="exp-key-rule">
        💡 <strong>觀念精要：</strong>求間距時「總長度 ÷ 間隔數」；求全長時「間距 × 間隔數」。
      </div>
    `;

    return {
      type: 'linear_dist',
      title: '直線型植樹（求間距與全長）',
      question: questionText,
      options,
      answer: correctAns,
      svgDiagram,
      explanation
    };
  },

  // =========================================================================
  // 4. 題型類別：封閉圖形植樹問題（課本 P.49, P.51）
  // 核心觀念：繞一圈起點與終點重合，棵數 ＝ 間隔數 ＝ 周長 ÷ 間距！
  // =========================================================================
  generateClosedLoopQuestion() {
    // 豐富的封閉圖形參數庫 (15+ 組)
    const baseParams = [
      { perimeter: 330, dist: 15, count: 22, item: '水柳樹', shape: '圓形水池', unit: '公尺', countUnit: '棵' },
      { perimeter: 900, dist: 75, count: 12, item: '路燈', shape: '正方形花園', unit: '公尺', countUnit: '盞' },
      { perimeter: 240, dist: 12, count: 20, item: '彩旗', shape: '圓形花圃', unit: '公尺', countUnit: '面' },
      { perimeter: 400, dist: 25, count: 16, item: '立柱', shape: '正方形操場', unit: '公尺', countUnit: '根' },
      { perimeter: 360, dist: 18, count: 20, item: '櫻花樹', shape: '圓形水池', unit: '公尺', countUnit: '棵' },
      { perimeter: 600, dist: 25, count: 24, item: '景觀燈', shape: '長方形生態池', unit: '公尺', countUnit: '盞' },
      { perimeter: 480, dist: 24, count: 20, item: '小風車', shape: '正方形草坪', unit: '公尺', countUnit: '座' },
      { perimeter: 720, dist: 30, count: 24, item: '樟樹', shape: '圓形公園', unit: '公尺', countUnit: '棵' },
      { perimeter: 500, dist: 20, count: 25, item: '太陽能路燈', shape: '正方形廣場', unit: '公尺', countUnit: '盞' },
      { perimeter: 420, dist: 14, count: 30, item: '垂柳', shape: '圓形水池', unit: '公尺', countUnit: '棵' },
      { perimeter: 840, dist: 28, count: 30, item: '杜鵑花盆', shape: '封閉步道', unit: '公尺', countUnit: '盆' },
      { perimeter: 300, dist: 20, count: 15, item: '旗桿', shape: '圓形溜冰場', unit: '公尺', countUnit: '根' },
      { perimeter: 640, dist: 20, count: 32, item: '路燈', shape: '正方形運動場', unit: '公尺', countUnit: '盞' },
      { perimeter: 450, dist: 25, count: 18, item: '盆栽', shape: '圓形中庭', unit: '公尺', countUnit: '個' },
      { perimeter: 560, dist: 35, count: 16, item: '落羽松', shape: '圓形水池', unit: '公尺', countUnit: '棵' }
    ];

    // 三種子類型：
    // 0: 求棵數 (已知周長與間距，棵數 = 周長 / 間距) - 課本 P.49 圓形水池周長 330m，每隔 15m
    // 1: 求間距 (已知周長與棵數，間距 = 周長 / 棵數) - 課本 P.49 正方形花園周長 900m，外圍設 12 盞
    // 2: 長方形草坪 (長寬已知，周長 = (長+寬)*2，求棵數) - 課本 P.51 長方形花園長 120m、寬 100m
    const subType = this.sample([0, 1, 2]);

    let chosen = null;
    for (const p of this.shuffle(baseParams)) {
      const sig = `closed_${p.perimeter}_${subType}`;
      if (!this.usedSignatures.has(sig)) {
        chosen = p;
        this.recordSignature(sig);
        break;
      }
    }
    if (!chosen) chosen = this.sample(baseParams);

    let questionText = '';
    let correctAns = '';
    let step1 = '';
    let step2 = '';

    if (subType === 0) {
      // 求棵數
      const treeCount = chosen.count || Math.round(chosen.perimeter / chosen.dist);
      const distVal = chosen.dist || Math.round(chosen.perimeter / treeCount);
      questionText = `有一個${chosen.shape}，周長是 ${chosen.perimeter} ${chosen.unit}。如果沿著周圍每隔 ${distVal} ${chosen.unit}種植一${chosen.countUnit}${chosen.item}，一共要種植幾${chosen.countUnit}${chosen.item}？`;
      correctAns = `${treeCount} ${chosen.countUnit}`;
      step1 = `<strong>封閉路線特點：</strong>首尾相連，繞一圈等同一端有一端沒有！<br>因此「間隔數 ＝ 棵數」。`;
      step2 = `棵數 ＝ 周長 ÷ 間距<br>算式：<code>${chosen.perimeter} ÷ ${distVal} = ${treeCount}</code> ${chosen.countUnit}`;
    } else if (subType === 1) {
      // 求間距
      const count = chosen.count || Math.round(chosen.perimeter / chosen.dist);
      const spacing = chosen.dist || Math.round(chosen.perimeter / count);
      questionText = `有一個周長 ${chosen.perimeter} ${chosen.unit}的${chosen.shape}，沿著外圍設置 ${count} ${chosen.countUnit}${chosen.item}，四個角落都有設置，且相鄰兩${chosen.countUnit}的距離都相同。請問每隔多少${chosen.unit}要設置一${chosen.countUnit}？`;
      correctAns = `${spacing} ${chosen.unit}`;
      step1 = `<strong>封閉圖形特點：</strong>外圍相連，間隔數與路燈數量完全相同！<br>間隔數 ＝ <code>${count}</code> 個間隔。`;
      step2 = `間距 ＝ 周長 ÷ 間隔數<br>算式：<code>${chosen.perimeter} ÷ ${count} = ${spacing}</code> ${chosen.unit}`;
    } else {
      // 長方形花圃 (長 + 寬) * 2
      const lengths = [
        { w: 120, h: 100, dist: 20 },
        { w: 80, h: 60, dist: 14 },
        { w: 150, h: 90, dist: 24 },
        { w: 100, h: 80, dist: 20 },
        { w: 140, h: 70, dist: 21 },
        { w: 160, h: 100, dist: 26 },
        { w: 90, h: 60, dist: 15 },
        { w: 110, h: 90, dist: 20 },
        { w: 130, h: 70, dist: 20 },
        { w: 180, h: 120, dist: 30 }
      ];
      const rec = this.sample(lengths);
      const peri = (rec.w + rec.h) * 2;
      const cnt = Math.round(peri / rec.dist);

      questionText = `長方形花園長 ${rec.w} 公尺、寬 ${rec.h} 公尺，沿著周圍每隔 ${rec.dist} 公尺設置一盞景觀燈，且四個角落都要設置。請問一共需要設置幾盞景觀燈？`;
      correctAns = `${cnt} 盞`;
      step1 = `<strong>計算長方形周長：</strong><br>算式：<code>(${rec.w} + ${rec.h}) × 2 = ${peri}</code> 公尺。`;
      step2 = `<strong>封閉圖形求數量：</strong><br>棵數 ＝ 間隔數 ＝ 周長 ÷ 間距<br>算式：<code>${peri} ÷ ${rec.dist} = ${cnt}</code> 盞。`;
    }

    const val = parseInt(correctAns, 10);
    const unitPart = correctAns.replace(/^\d+\s*/, '');
    // 迷思干擾項：學生最容易受直線型影響多加1或減1
    const rawDistractors = [
      `${val + 1} ${unitPart}`,
      `${Math.max(1, val - 1)} ${unitPart}`,
      `${val + 2} ${unitPart}`,
      `${Math.max(1, val - 2)} ${unitPart}`,
      `${val + 4} ${unitPart}`,
      `${Math.max(2, val - 4)} ${unitPart}`,
      `${Math.round(val * 2)} ${unitPart}`,
      `${Math.max(1, Math.round(val / 2))} ${unitPart}`
    ];

    const options = this.ensureEightOptions(correctAns, rawDistractors);

    // SVG 圖解（圓形環狀圖）
    const svgDiagram = `
      <svg viewBox="0 0 760 170" width="100%" height="170" xmlns="http://www.w3.org/2000/svg">
        <!-- 圓形水池本體 -->
        <circle cx="380" cy="85" r="55" fill="#0284c7" fill-opacity="0.2" stroke="#0284c7" stroke-width="4"/>
        <text x="380" y="88" fill="#38bdf8" font-size="14" font-weight="bold" text-anchor="middle">封閉路線</text>
        <text x="380" y="105" fill="#94a3b8" font-size="12" text-anchor="middle">首尾相連</text>

        <!-- 環繞樹木/路燈點 -->
        <circle cx="380" cy="22" r="7" fill="#10b981"/>
        <circle cx="435" cy="45" r="7" fill="#10b981"/>
        <circle cx="445" cy="105" r="7" fill="#10b981"/>
        <circle cx="410" cy="142" r="7" fill="#10b981"/>
        <circle cx="350" cy="142" r="7" fill="#10b981"/>
        <circle cx="315" cy="105" r="7" fill="#10b981"/>
        <circle cx="325" cy="45" r="7" fill="#10b981"/>

        <!-- 說明文字 -->
        <text x="140" y="65" fill="#facc15" font-size="16" font-weight="bold" text-anchor="middle">💡 封閉圖形核心</text>
        <text x="140" y="95" fill="#e2e8f0" font-size="14" text-anchor="middle">繞一圈回到起點</text>
        <text x="140" y="120" fill="#38bdf8" font-size="14" font-weight="bold" text-anchor="middle">棵數 ＝ 間隔數</text>

        <text x="620" y="65" fill="#34d399" font-size="15" font-weight="bold" text-anchor="middle">絕不 +1 也絕不 -1</text>
        <text x="620" y="95" fill="#e2e8f0" font-size="14" text-anchor="middle">每 1 個間隔</text>
        <text x="620" y="120" fill="#e2e8f0" font-size="14" text-anchor="middle">剛好對應 1 棵樹</text>
      </svg>
    `;

    const explanation = `
      <div class="exp-step">
        <span class="step-num">步驟 1</span>
        ${step1}
      </div>
      <div class="exp-step">
        <span class="step-num">步驟 2</span>
        ${step2}
      </div>
      <div class="exp-key-rule">
        💡 <strong>黃金定律：</strong>封閉圖形（圓形、正方形、長方形外圍）的「棵數 ＝ 間隔數」！切勿習慣性 +1 或 -1！
      </div>
    `;

    return {
      type: 'closed_loop',
      title: '封閉圖形植樹問題',
      question: questionText,
      options,
      answer: correctAns,
      svgDiagram,
      explanation
    };
  },

  // =========================================================================
  // 5. 總調度器：根據指定類別出題
  // =========================================================================
  generate(category) {
    if (category === 'numbering') {
      return this.generateNumberingQuestion();
    } else if (category === 'linear_count') {
      return this.generateLinearCountQuestion();
    } else if (category === 'linear_dist') {
      return this.generateLinearDistQuestion();
    } else if (category === 'closed_loop') {
      return this.generateClosedLoopQuestion();
    } else if (category === 'mixed') {
      // 綜合大亂鬥：隨機選取
      const pool = ['numbering', 'linear_count', 'linear_dist', 'closed_loop'];
      return this.generate(this.sample(pool));
    }
    return this.generateNumberingQuestion();
  },

  // 為一局比賽生成 4 道題目（綜合模式則 4 種類型各抽 1 題）
  generateRoundQuestions(category) {
    const list = [];
    if (category === 'mixed') {
      const types = this.shuffle(['numbering', 'linear_count', 'linear_dist', 'closed_loop']);
      for (const t of types) {
        list.push(this.generate(t));
      }
    } else {
      for (let i = 0; i < 4; i++) {
        list.push(this.generate(category));
      }
    }
    return list;
  }
};
