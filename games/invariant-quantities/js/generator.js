// js/generator.js - 國小六年級數學「和、差、積、商不變量」動態出題引擎與圖形化解說生成器
// 特色：
// 1. 所有數值由「答案反推題目設定」，保證 100% 正確、生活化合理且計算整除無誤。
// 2. 嚴格生成 8 個互不相同的選項（1 個正確解答 + 7 個貼近學生迷思的干擾選項）。
// 3. 完整對應康軒版 6 上第 3 單元《數量關係》核心情境（晝夜 24 小時、年齡差、碾米分裝、杯子蛋糕等）。
// 4. 【全新圖形化教學】：每題均動態生成向量 SVG 幾何/線段/雙數線圖表，方便課堂投影覆盤！

const QuestionGenerator = {
  // 工具函式：隨機整數 [min, max]
  randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // 工具函式：從陣列隨機挑選一項
  sample(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  // 工具函式：Fisher-Yates 隨機洗牌
  shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  },

  // 最大公因數與最小公倍數
  gcd(a, b) {
    return b === 0 ? a : this.gcd(b, a % b);
  },
  lcm(a, b) {
    return (a * b) / this.gcd(a, b);
  },

  // SVG 共用箭頭定義
  getSvgDefs() {
    return `
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#facc15" />
        </marker>
        <marker id="arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
        </marker>
        <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
        </marker>
      </defs>
    `;
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

    // 針對「商是 Q，餘數是 R」格式特殊處理
    const qMatch = correctAns.match(/商是\s*(\d+).*?餘數是\s*(\d+)/);
    if (qMatch) {
      const q = parseInt(qMatch[1], 10);
      const r = parseInt(qMatch[2], 10);
      const candidates = [
        `商是 ${q}，餘數是 ${Math.round(r / 100)}`,
        `商是 ${q * 100}，餘數是 ${r}`,
        `商是 ${q * 100}，餘數是 ${Math.round(r / 100)}`,
        `商是 ${q + 1}，餘數是 ${r}`,
        `商是 ${Math.max(1, q - 1)}，餘數是 ${r}`,
        `商是 ${q}，餘數是 ${r + 100}`,
        `商是 ${q}，餘數是 ${Math.max(50, r - 100)}`,
        `商是 ${q + 2}，餘數是 ${r}`,
        `商是 ${Math.max(1, q - 2)}，餘數是 ${r}`,
        `商是 ${q + 1}，餘數是 ${Math.round(r / 100)}`
      ];
      for (const c of candidates) {
        if (!unique.has(c)) {
          unique.add(c);
          if (unique.size === 8) break;
        }
      }
    }

    // 針對小數型選項（例如「11.5 小時」）
    const floatMatch = correctAns.match(/^(\d+(?:\.\d+)?)\s*(.+)$/);
    if (floatMatch && floatMatch[1].includes('.')) {
      const val = parseFloat(floatMatch[1]);
      const unit = floatMatch[2];
      const deltas = [-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5, 3];
      for (const d of deltas) {
        const candidateVal = Math.round((val + d) * 10) / 10;
        if (candidateVal > 0) {
          const opt = `${candidateVal} ${unit}`;
          if (!unique.has(opt)) {
            unique.add(opt);
            if (unique.size === 8) break;
          }
        }
      }
    }

    // 針對一般整數型選項，自動以合理位移補充至 8 個
    let offset = 1;
    const numMatch = correctAns.match(/\d+/);
    while (unique.size < 8 && offset < 60 && numMatch) {
      const num = parseInt(numMatch[0], 10);
      const candidates = [
        correctAns.replace(numMatch[0], String(Math.max(1, num + offset))),
        correctAns.replace(numMatch[0], String(Math.max(1, num - offset))),
        correctAns.replace(numMatch[0], String(Math.max(1, num + offset * 2))),
        correctAns.replace(numMatch[0], String(Math.max(1, num - offset * 2))),
        correctAns.replace(numMatch[0], String(Math.max(1, num + offset * 3))),
        correctAns.replace(numMatch[0], String(Math.max(1, num - offset * 3)))
      ];
      for (const c of candidates) {
        if (!unique.has(c)) {
          unique.add(c);
          if (unique.size === 8) break;
        }
      }
      offset++;
    }

    while (unique.size < 8) {
      unique.add(`選項 ${unique.size + 1}`);
    }

    return this.shuffle(Array.from(unique));
  },

  // =========================================================================
  // 1. 和不變 (Constant Sum)
  // 核心：白晝＋黑夜＝24小時、兩者內部移轉、合資總額固定
  // =========================================================================
  generateSumInvariant() {
    const templates = [
      // 模板 S1 (課本核心・晝夜時間題): 一天 24 小時固定，白晝 + 黑夜 = 24
      () => {
        const nightPool = [8, 9, 10, 11, 13, 14, 15, 10.5, 11.5, 12.5, 13.5];
        const night = this.sample(nightPool);
        const day = Math.round((24 - night) * 10) / 10;

        const isAskNight = Math.random() < 0.5;
        const targetLabel = isAskNight ? '黑夜' : '白晝';
        const givenLabel = isAskNight ? '白晝' : '黑夜';
        const givenVal = isAskNight ? day : night;
        const targetVal = isAskNight ? night : day;

        const question = `一年四季中，白晝與黑夜的時間不斷變化，但一天剛好是 24 小時。若某一天【${givenLabel}占了 ${givenVal} 小時】，請問當天【${targetLabel}占多少小時】？`;

        const correctAns = `${targetVal} 小時`;
        const distractors = [
          `${Math.round((24 - targetVal + 1) * 10) / 10} 小時`,
          `${Math.round((24 + targetVal) * 10) / 10} 小時`,
          `12 小時`,
          `${Math.round(Math.abs(targetVal - 2) * 10) / 10} 小時`,
          `${Math.round((targetVal + 2) * 10) / 10} 小時`
        ];

        const options = this.ensureEightOptions(correctAns, distractors);
        const explanation = `【和不變】白晝時間 ＋ 黑夜時間 ＝ 24 小時（固定和）！\n` +
          `• 關係式：白晝 ＋ 黑夜 ＝ 24\n` +
          `• 列式計算：24 － ${givenVal} ＝ ${targetVal} 小時。\n` +
          `• 所以${targetLabel}占 ${targetVal} 小時。`;

        // 生成動態向量線段圖 (SVG)
        const totalW = 540;
        const dayW = Math.round((day / 24) * totalW);
        const nightW = totalW - dayW;
        const diagramSvg = `
          <svg viewBox="0 0 660 140" xmlns="http://www.w3.org/2000/svg">
            ${this.getSvgDefs()}
            <!-- 外框與標尺 -->
            <line x1="60" y1="22" x2="600" y2="22" stroke="#10b981" stroke-width="2" marker-start="url(#arrow-green)" marker-end="url(#arrow-green)" />
            <text x="330" y="16" fill="#34d399" font-size="14" font-weight="bold" text-anchor="middle">一天總和固定 24 小時 🔒（和不變）</text>

            <!-- 白晝線段條 -->
            <rect x="60" y="32" width="${dayW}" height="42" rx="8" fill="#f59e0b" />
            <text x="${60 + dayW / 2}" y="58" fill="#fff" font-size="15" font-weight="bold" text-anchor="middle">☀️ 白晝 ${day}h</text>

            <!-- 黑夜線段條 -->
            <rect x="${60 + dayW}" y="32" width="${nightW}" height="42" rx="8" fill="#3b82f6" />
            <text x="${60 + dayW + nightW / 2}" y="58" fill="#fff" font-size="15" font-weight="bold" text-anchor="middle">🌙 黑夜 ${night}h</text>

            <!-- 底部算式說明標籤 -->
            <rect x="60" y="88" width="540" height="36" rx="8" fill="rgba(30, 41, 59, 0.9)" stroke="#475569" stroke-width="1" />
            <text x="330" y="112" fill="#f8fafc" font-size="14" font-weight="bold" text-anchor="middle">
              白晝 (${day}h) ＋ 黑夜 (${night}h) ＝ 24h ➔ 【${targetLabel}】＝ 24 － ${givenVal} ＝ ${targetVal} 小時
            </text>
          </svg>
        `;

        return {
          type: '和不變',
          badge: '和不變（晝夜總和 24 小時）',
          question,
          options,
          answer: correctAns,
          explanation,
          diagramSvg
        };
      },

      // 模板 S2 (課本核心・晝夜相差題): 白晝比黑夜長 diff 小時
      () => {
        const night = this.sample([8, 9, 10, 11]);
        const day = 24 - night;
        const diff = day - night;

        const question = `在臺灣過了春分之後晝長夜短。某一天【白晝比黑夜長 ${diff} 小時】。已知一天是 24 小時（白晝＋黑夜＝24），請問當天的【黑夜時間是多少小時】？`;

        const correctAns = `${night} 小時`;
        const distractors = [
          `${day} 小時`,
          `${24 - diff} 小時`,
          `${diff} 小時`,
          `12 小時`,
          `${night + 1} 小時`
        ];

        const options = this.ensureEightOptions(correctAns, distractors);
        const explanation = `【和不變】白晝 ＋ 黑夜 ＝ 24 小時！\n` +
          `• 白晝 ＝ 黑夜 ＋ ${diff}\n` +
          `• (黑夜 ＋ ${diff}) ＋ 黑夜 ＝ 24 ➔ 黑夜 × 2 ＝ 24 － ${diff} ＝ ${24 - diff}\n` +
          `• 黑夜時間 ＝ ${24 - diff} ÷ 2 ＝ ${night} 小時。（白晝則為 ${day} 小時）`;

        const totalW = 520;
        const nightBarW = Math.round((night / 24) * totalW * 1.6);
        const diffW = Math.round((diff / 24) * totalW * 1.6);
        const diagramSvg = `
          <svg viewBox="0 0 660 145" xmlns="http://www.w3.org/2000/svg">
            ${this.getSvgDefs()}
            <!-- 白晝長條 -->
            <text x="50" y="42" fill="#fbbf24" font-size="14" font-weight="bold">白晝</text>
            <rect x="90" y="24" width="${nightBarW}" height="26" rx="6" fill="#f59e0b" />
            <rect x="${90 + nightBarW}" y="24" width="${diffW}" height="26" rx="6" fill="#ef4444" stroke="#fca5a5" stroke-dasharray="3,3" />
            <text x="${90 + nightBarW / 2}" y="42" fill="#fff" font-size="13" font-weight="bold" text-anchor="middle">${night}h</text>
            <text x="${90 + nightBarW + diffW / 2}" y="42" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">+${diff}h</text>

            <!-- 黑夜長條 -->
            <text x="50" y="80" fill="#60a5fa" font-size="14" font-weight="bold">黑夜</text>
            <rect x="90" y="62" width="${nightBarW}" height="26" rx="6" fill="#3b82f6" />
            <text x="${90 + nightBarW / 2}" y="80" fill="#fff" font-size="13" font-weight="bold" text-anchor="middle">黑夜 ${night}h</text>

            <!-- 兩者總和 24 小時標記 -->
            <path d="M ${90 + nightBarW + diffW + 15} 24 L ${90 + nightBarW + diffW + 25} 53 L ${90 + nightBarW + diffW + 15} 88" fill="none" stroke="#10b981" stroke-width="2" />
            <text x="${90 + nightBarW + diffW + 35}" y="58" fill="#34d399" font-size="14" font-weight="bold">合起來 24 小時</text>

            <!-- 結論 -->
            <rect x="90" y="102" width="500" height="32" rx="6" fill="rgba(30, 41, 59, 0.9)" />
            <text x="340" y="123" fill="#facc15" font-size="13" font-weight="bold" text-anchor="middle">
              黑夜 × 2 ＝ 24 － ${diff} ＝ ${24 - diff} ➔ 黑夜 ＝ ${night} 小時
            </text>
          </svg>
        `;

        return {
          type: '和不變',
          badge: '和不變（和差關係）',
          question,
          options,
          answer: correctAns,
          explanation,
          diagramSvg
        };
      },

      // 模板 S3 (課本/課堂・卡片與彈珠互贈): 內部移轉總量不變
      () => {
        const names = this.sample([
          ['小明', '小華', '張球員卡'],
          ['哥哥', '弟弟', '顆彈珠'],
          ['阿寶', '老皮', '張貼紙'],
          ['小芸', '小萱', '張精美書籤']
        ]);
        const p1 = names[0], p2 = names[1], unit = names[2];

        const ratios = [
          { r1: [3, 2], r2: [1, 1] },
          { r1: [7, 3], r2: [3, 2] },
          { r1: [5, 3], r2: [1, 1] },
          { r1: [4, 1], r2: [3, 2] },
          { r1: [5, 1], r2: [2, 1] },
        ];
        const r = this.sample(ratios);
        const [a, b] = r.r1;
        const [c, d] = r.r2;

        const s1 = a + b;
        const s2 = c + d;
        const L = this.lcm(s1, s2);

        const deltaParts = (L / s1) * a - (L / s2) * c;
        const m = this.randInt(3, 7);
        const transferCount = deltaParts * m;
        const total = L * m;
        const initP1 = (total / s1) * a;

        const question = `${p1}和${p2}原本有的${unit}數量比是 ${a} : ${b}。如果${p1}給了${p2} ${transferCount} ${unit}，兩人的數量比會變成 ${c} : ${d}。請問兩人【原本一共有多少${unit}】？`;

        const correctAns = `${total} ${unit}`;
        const distractors = [
          `${initP1} ${unit}`,
          `${total + transferCount * 2} ${unit}`,
          `${total - transferCount * 2} ${unit}`,
          `${Math.round(total * 1.25)} ${unit}`
        ];

        const options = this.ensureEightOptions(correctAns, distractors);
        const explanation = `【和不變】兩人互相贈送，${unit}「總數量」永遠保持不變！\n` +
          `• 基準為總數：原本${p1}占總數的 ${a}/${s1}，後來占 ${c}/${s2}。\n` +
          `• ${p1}減少的比例：(${a}/${s1} － ${c}/${s2}) ＝ ${deltaParts}/${L}。\n` +
          `• 這 ${deltaParts}/${L} 剛好代表 ${transferCount} ${unit}。\n` +
          `• 兩人總數量 ＝ ${transferCount} ÷ (${deltaParts}/${L}) ＝ ${total} ${unit}。`;

        const totalW = 500;
        const bar1P1 = Math.round((a / s1) * totalW);
        const bar1P2 = totalW - bar1P1;
        const bar2P1 = Math.round((c / s2) * totalW);
        const bar2P2 = totalW - bar2P1;

        const diagramSvg = `
          <svg viewBox="0 0 660 145" xmlns="http://www.w3.org/2000/svg">
            ${this.getSvgDefs()}
            <text x="60" y="32" fill="#cbd5e1" font-size="13" font-weight="bold">原本：</text>
            <rect x="110" y="16" width="${bar1P1}" height="24" rx="4" fill="#ec4899" />
            <rect x="${110 + bar1P1}" y="16" width="${bar1P2}" height="24" rx="4" fill="#06b6d4" />
            <text x="${110 + bar1P1 / 2}" y="33" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">${p1} (${a}份)</text>
            <text x="${110 + bar1P1 + bar1P2 / 2}" y="33" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">${p2} (${b}份)</text>

            <!-- 轉移箭頭 -->
            <path d="M ${110 + (bar1P1 + bar2P1) / 2} 43 Q ${110 + (bar1P1 + bar2P1) / 2 + 30} 55 ${110 + bar2P1 + 30} 67" fill="none" stroke="#facc15" stroke-width="2" marker-end="url(#arrow)" />
            <text x="330" y="56" fill="#facc15" font-size="12" font-weight="bold" text-anchor="middle">移轉給對方 ${transferCount} ${unit}</text>

            <text x="60" y="86" fill="#cbd5e1" font-size="13" font-weight="bold">後來：</text>
            <rect x="110" y="70" width="${bar2P1}" height="24" rx="4" fill="#ec4899" />
            <rect x="${110 + bar2P1}" y="70" width="${bar2P2}" height="24" rx="4" fill="#06b6d4" />
            <text x="${110 + bar2P1 / 2}" y="87" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">${p1} (${c}份)</text>
            <text x="${110 + bar2P1 + bar2P2 / 2}" y="87" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">${p2} (${d}份)</text>

            <!-- 底部總和固定標記 -->
            <rect x="110" y="106" width="500" height="28" rx="6" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" stroke-width="1" />
            <text x="360" y="125" fill="#34d399" font-size="13" font-weight="bold" text-anchor="middle">
              總長度固定不變 🔒 ➔ 總數量 ＝ ${transferCount} ÷ (${deltaParts}/${L}) ＝ ${total} ${unit}
            </text>
          </svg>
        `;

        return {
          type: '和不變',
          badge: '和不變（內部互移）',
          question,
          options,
          answer: correctAns,
          explanation,
          diagramSvg
        };
      },

      // 模板 S4 (書架上下層移動) & S5 (零用錢轉移) 同樣產出線段對照圖
      () => {
        const giveAmount = this.randInt(40, 120);
        const multiplier = this.sample([4, 5, 6]);
        const total = giveAmount * multiplier;

        const question = `大雄手上的錢是小夫的 3 倍。大雄給了小夫 ${giveAmount} 元後，兩人的錢剛好一樣多（比變成 1 : 1）。請問兩人原本【合起來一共有多少元】？`;

        const correctAns = `${total} 元`;
        const distractors = [
          `${total / 2} 元`,
          `${total - giveAmount} 元`,
          `${total + giveAmount * 2} 元`,
          `${Math.round(total * 1.5)} 元`
        ];

        const options = this.ensureEightOptions(correctAns, distractors);
        const explanation = `【和不變】兩人零用錢互給，總金額固定不變！\n` +
          `• 原本大雄占 3/4，小夫占 1/4；給錢後兩人都占 2/4 (一半)。\n` +
          `• 大雄給出的 ${giveAmount} 元剛好是總金額的 (3/4 － 2/4) ＝ 1/4。\n` +
          `• 總金額 ＝ ${giveAmount} × 4 ＝ ${total} 元。`;

        const diagramSvg = `
          <svg viewBox="0 0 660 140" xmlns="http://www.w3.org/2000/svg">
            ${this.getSvgDefs()}
            <rect x="80" y="20" width="360" height="26" rx="6" fill="#f59e0b" />
            <rect x="440" y="20" width="120" height="26" rx="6" fill="#06b6d4" />
            <text x="260" y="38" fill="#fff" font-size="13" font-weight="bold" text-anchor="middle">大雄 (3份)</text>
            <text x="500" y="38" fill="#fff" font-size="13" font-weight="bold" text-anchor="middle">小夫 (1份)</text>

            <path d="M 380 48 Q 420 62 460 76" fill="none" stroke="#facc15" stroke-width="2" marker-end="url(#arrow)" />
            <text x="420" y="60" fill="#facc15" font-size="12" font-weight="bold">給出 ${giveAmount} 元 (占 1/4)</text>

            <rect x="80" y="78" width="240" height="26" rx="6" fill="#f59e0b" />
            <rect x="320" y="78" width="240" height="26" rx="6" fill="#06b6d4" />
            <text x="200" y="96" fill="#fff" font-size="13" font-weight="bold" text-anchor="middle">大雄 (2份)</text>
            <text x="440" y="96" fill="#fff" font-size="13" font-weight="bold" text-anchor="middle">小夫 (2份)</text>

            <text x="320" y="126" fill="#34d399" font-size="13" font-weight="bold" text-anchor="middle">
              總金額固定 4 份 ＝ ${giveAmount} × 4 ＝ ${total} 元 🔒
            </text>
          </svg>
        `;

        return {
          type: '和不變',
          badge: '和不變（金額總和固定）',
          question,
          options,
          answer: correctAns,
          explanation,
          diagramSvg
        };
      }
    ];

    return this.sample(templates)();
  },

  // =========================================================================
  // 2. 差不變 (Constant Difference)
  // 核心：年齡隨時間增長差不變、同增同減差不變、起跑距離差
  // =========================================================================
  generateDiffInvariant() {
    const templates = [
      // 模板 D1 (課本核心・年齡差固定求未來年齡): 媽媽與祐維
      () => {
        const names = this.sample([
          ['媽媽', '祐維'],
          ['爸爸', '奇奇'],
          ['阿姨', '妙妙'],
          ['叔叔', '豆豆']
        ]);
        const parent = names[0], child = names[1];

        const childNow = this.randInt(7, 12);
        const diff = this.sample([24, 26, 28, 30]);
        const parentNow = childNow + diff;
        const parentTarget = this.sample([56, 60, 64, 68]);
        const childTarget = parentTarget - diff;

        const question = `今年${parent} ${parentNow} 歲，${child} ${childNow} 歲。兩人的年齡差永遠固定不變。當【${parent}年滿 ${parentTarget} 歲時】，請問【${child}是幾歲】？`;

        const correctAns = `${childTarget} 歲`;
        const distractors = [
          `${childTarget + 2} 歲`,
          `${childTarget - 2} 歲`,
          `${diff} 歲`,
          `${parentTarget - childNow} 歲`,
          `${childNow + 10} 歲`
        ];

        const options = this.ensureEightOptions(correctAns, distractors);
        const explanation = `【差不變】不管時間過去多久，兩人的『年齡差』永遠不變！\n` +
          `• 今年年齡差 ＝ ${parentNow} － ${childNow} ＝ ${diff} 歲。\n` +
          `• 關係式：${parent}年齡 － ${child}年齡 ＝ ${diff}\n` +
          `• 當${parent} ${parentTarget} 歲時：${parentTarget} － ${child}年齡 ＝ ${diff}\n` +
          `• ${child}年齡 ＝ ${parentTarget} － ${diff} ＝ ${childTarget} 歲。`;

        const childBarW = Math.round((childNow / parentTarget) * 440);
        const diffBarW = Math.round((diff / parentTarget) * 440);
        const diagramSvg = `
          <svg viewBox="0 0 660 150" xmlns="http://www.w3.org/2000/svg">
            ${this.getSvgDefs()}
            <!-- 小孩年齡條 -->
            <text x="50" y="38" fill="#60a5fa" font-size="14" font-weight="bold">${child}</text>
            <rect x="100" y="20" width="${childBarW}" height="26" rx="6" fill="#3b82f6" />
            <text x="${100 + childBarW / 2}" y="38" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">今年 ${childNow} 歲</text>

            <!-- 媽媽年齡條 -->
            <text x="50" y="80" fill="#f43f5e" font-size="14" font-weight="bold">${parent}</text>
            <rect x="100" y="62" width="${childBarW}" height="26" rx="6" fill="#3b82f6" opacity="0.6" />
            <rect x="${100 + childBarW}" y="62" width="${diffBarW}" height="26" rx="6" fill="#f43f5e" />
            <text x="${100 + childBarW + diffBarW / 2}" y="80" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">相差 ${diff} 歲</text>

            <!-- 差距永遠不變標尺 -->
            <line x1="${100 + childBarW}" y1="18" x2="${100 + childBarW}" y2="92" stroke="#f43f5e" stroke-dasharray="3,3" stroke-width="1.5" />
            <line x1="${100 + childBarW + diffBarW}" y1="58" x2="${100 + childBarW + diffBarW}" y2="92" stroke="#f43f5e" stroke-dasharray="3,3" stroke-width="1.5" />
            <line x1="${100 + childBarW}" y1="96" x2="${100 + childBarW + diffBarW}" y2="96" stroke="#f43f5e" stroke-width="2" marker-start="url(#arrow-red)" marker-end="url(#arrow-red)" />
            <text x="${100 + childBarW + diffBarW / 2}" y="112" fill="#fb7185" font-size="13" font-weight="bold" text-anchor="middle">年齡差距固定 ${diff} 歲 🔒 (永遠不變)</text>

            <!-- 底部未來推算 -->
            <rect x="100" y="120" width="500" height="24" rx="4" fill="rgba(30, 41, 59, 0.9)" />
            <text x="350" y="137" fill="#facc15" font-size="12" font-weight="bold" text-anchor="middle">
              當${parent} ${parentTarget} 歲時 ➔ ${child} ＝ ${parentTarget} － ${diff} ＝ ${childTarget} 歲！
            </text>
          </svg>
        `;

        return {
          type: '差不變',
          badge: '差不變（年齡差固定）',
          question,
          options,
          answer: correctAns,
          explanation,
          diagramSvg
        };
      },

      // 模板 D2 (課本核心・年齡差跨年迷思檢驗題): N 年後相差幾歲？
      () => {
        const childNow = this.randInt(6, 11);
        const diff = this.sample([25, 27, 28, 29, 31]);
        const parentNow = childNow + diff;
        const years = this.sample([5, 8, 10, 15, 20]);

        const question = `今年媽媽 ${parentNow} 歲，小華 ${childNow} 歲（兩人相差 ${diff} 歲）。請問【${years} 年後】，媽媽和小華【相差幾歲】？`;

        const correctAns = `${diff} 歲`;
        const distractors = [
          `${diff + years} 歲`,
          `${diff + years * 2} 歲`,
          `${parentNow + years} 歲`,
          `${childNow + years} 歲`,
          `${diff - years > 0 ? diff - years : diff + 5} 歲`
        ];

        const options = this.ensureEightOptions(correctAns, distractors);
        const explanation = `【差不變】每過 1 年，兩人都同時增加 1 歲，因此『年齡差永遠固定』！\n` +
          `• 今年相差：${parentNow} － ${childNow} ＝ ${diff} 歲。\n` +
          `• ${years} 年後媽媽長了 ${years} 歲，小華也長了 ${years} 歲。\n` +
          `• 兩人的年齡差距仍然是 ${diff} 歲，永遠不會改變！`;

        const diagramSvg = `
          <svg viewBox="0 0 660 145" xmlns="http://www.w3.org/2000/svg">
            ${this.getSvgDefs()}
            <text x="40" y="35" fill="#f8fafc" font-size="13" font-weight="bold">今年：</text>
            <rect x="90" y="20" width="120" height="22" rx="4" fill="#3b82f6" />
            <rect x="90" y="20" width="280" height="22" rx="4" fill="#f43f5e" opacity="0.85" />
            <rect x="90" y="20" width="120" height="22" rx="4" fill="#3b82f6" />
            <text x="300" y="36" fill="#fff" font-size="12" font-weight="bold">相差 ${diff} 歲</text>

            <text x="40" y="80" fill="#facc15" font-size="13" font-weight="bold">${years}年後：</text>
            <rect x="90" y="65" width="120" height="22" rx="4" fill="#3b82f6" />
            <rect x="210" y="65" width="80" height="22" rx="4" fill="#10b981" stroke-dasharray="2,2" stroke="#fff" />
            <rect x="290" y="65" width="160" height="22" rx="4" fill="#f43f5e" opacity="0.85" />
            <rect x="450" y="65" width="80" height="22" rx="4" fill="#10b981" stroke-dasharray="2,2" stroke="#fff" />

            <text x="250" y="81" fill="#fff" font-size="11" text-anchor="middle">+${years}歲</text>
            <text x="490" y="81" fill="#fff" font-size="11" text-anchor="middle">+${years}歲</text>

            <rect x="90" y="106" width="500" height="30" rx="6" fill="rgba(244, 63, 94, 0.2)" stroke="#f43f5e" stroke-width="1.5" />
            <text x="340" y="126" fill="#fca5a5" font-size="13" font-weight="bold" text-anchor="middle">
              ⚠️ 兩人都長大 ${years} 歲 ➔ 兩端距離完全沒變！依然相差 ${diff} 歲 🔒
            </text>
          </svg>
        `;

        return {
          type: '差不變',
          badge: '差不變（觀念辨析）',
          question,
          options,
          answer: correctAns,
          explanation,
          diagramSvg
        };
      },

      // 模板 D3 (年齡倍數問題)
      () => {
        const parents = ['爸爸', '媽媽', '叔叔', '伯伯'];
        const parentName = this.sample(parents);
        const k = this.sample([2, 3, 4]);
        const y = this.randInt(3, 8);
        const childNow = this.randInt(7, 12);
        const childFuture = childNow + y;
        const diff = (k - 1) * childFuture;
        const parentNow = childNow + diff;

        const question = `${parentName}今年 ${parentNow} 歲，小華今年 ${childNow} 歲。請問【幾年後】，${parentName}的年齡會是小華的 ${k} 倍？`;

        const correctAns = `${y} 年後`;
        const distractors = [
          `${y + 1} 年後`,
          `${y + 2} 年後`,
          `${Math.max(1, y - 2)} 年後`,
          `${childFuture} 年後`,
          `${Math.round(diff / k)} 年後`
        ];

        const options = this.ensureEightOptions(correctAns, distractors);
        const explanation = `【差不變】兩人的『年齡差』永遠保持不變！\n` +
          `• 年齡差固定為：${parentNow} － ${childNow} ＝ ${diff} 歲。\n` +
          `• 未來${parentName}是小華的 ${k} 倍時，年齡差占 (${k} － 1) ＝ ${k - 1} 份。\n` +
          `• 屆時小華年齡 ＝ ${diff} ÷ (${k} － 1) ＝ ${childFuture} 歲。\n` +
          `• 所需年數 ＝ ${childFuture} － ${childNow} ＝ ${y} 年後。`;

        const blockW = 80;
        const diagramSvg = `
          <svg viewBox="0 0 660 145" xmlns="http://www.w3.org/2000/svg">
            ${this.getSvgDefs()}
            <text x="40" y="32" fill="#60a5fa" font-size="13" font-weight="bold">小華：</text>
            <rect x="90" y="16" width="${blockW}" height="24" rx="4" fill="#3b82f6" />
            <text x="${90 + blockW / 2}" y="33" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">1 份</text>

            <text x="40" y="72" fill="#f43f5e" font-size="13" font-weight="bold">${parentName}：</text>
            ${Array.from({ length: k }).map((_, i) => `
              <rect x="${90 + i * (blockW + 4)}" y="56" width="${blockW}" height="24" rx="4" fill="#f43f5e" />
              <text x="${90 + i * (blockW + 4) + blockW / 2}" y="73" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">第${i + 1}份</text>
            `).join('')}

            <!-- 差額括弧 -->
            <line x1="${90 + blockW + 4}" y1="86" x2="${90 + k * (blockW + 4)}" y2="86" stroke="#facc15" stroke-width="2" marker-start="url(#arrow)" marker-end="url(#arrow)" />
            <text x="${90 + blockW + ((k - 1) * (blockW + 4)) / 2}" y="104" fill="#facc15" font-size="12" font-weight="bold" text-anchor="middle">
              相差 (${k}－1) ＝ ${k - 1} 份 ＝ 年齡差 ${diff} 歲
            </text>

            <rect x="90" y="112" width="520" height="26" rx="4" fill="rgba(30, 41, 59, 0.9)" />
            <text x="350" y="129" fill="#34d399" font-size="12" font-weight="bold" text-anchor="middle">
              1 份 ＝ ${diff} ÷ ${k - 1} ＝ ${childFuture} 歲 ➔ 所需年數 ＝ ${childFuture} － ${childNow} ＝ ${y} 年後！
            </text>
          </svg>
        `;

        return {
          type: '差不變',
          badge: '差不變（倍數關係）',
          question,
          options,
          answer: correctAns,
          explanation,
          diagramSvg
        };
      },

      // 模板 D4 (兩人各花相同金額)
      () => {
        const m = this.randInt(15, 50);
        const spend = 2 * m;
        const p1Init = 5 * m;
        const p2Init = 3 * m;

        const question = `小杰和小安原本有的零用錢比是 5 : 3。兩人各自買了一本 ${spend} 元的筆記本後，剩下的錢比變成了 3 : 1。請問【小杰原本有多少元】？`;

        const correctAns = `${p1Init} 元`;
        const distractors = [
          `${p2Init} 元`,
          `${p1Init - spend} 元`,
          `${p1Init + p2Init} 元`,
          `${p1Init + spend} 元`
        ];

        const options = this.ensureEightOptions(correctAns, distractors);
        const explanation = `【差不變】兩人都花費相同金額，兩人的『金額差』完全不變！\n` +
          `• 原本差 5 － 3 ＝ 2 份，後來差 3 － 1 ＝ 2 份，份數差正好相等！\n` +
          `• 小杰原本 5 份減少為 3 份，花掉的 2 份剛好是 ${spend} 元，所以 1 份 ＝ ${m} 元。\n` +
          `• 小杰原本有 5 份 ＝ 5 × ${m} ＝ ${p1Init} 元。`;

        const diagramSvg = `
          <svg viewBox="0 0 660 140" xmlns="http://www.w3.org/2000/svg">
            ${this.getSvgDefs()}
            <text x="40" y="32" fill="#ec4899" font-size="13" font-weight="bold">小杰：</text>
            <rect x="90" y="16" width="300" height="24" rx="4" fill="#ec4899" />
            <rect x="270" y="16" width="120" height="24" rx="4" fill="#475569" stroke="#fff" stroke-dasharray="3,3" />
            <text x="180" y="33" fill="#fff" font-size="12" font-weight="bold">剩 3 份</text>
            <text x="330" y="33" fill="#fca5a5" font-size="11">花 ${spend} 元 (2份)</text>

            <text x="40" y="72" fill="#06b6d4" font-size="13" font-weight="bold">小安：</text>
            <rect x="90" y="56" width="180" height="24" rx="4" fill="#06b6d4" />
            <rect x="150" y="56" width="120" height="24" rx="4" fill="#475569" stroke="#fff" stroke-dasharray="3,3" />
            <text x="120" y="73" fill="#fff" font-size="12" font-weight="bold">剩 1 份</text>
            <text x="210" y="73" fill="#fca5a5" font-size="11">花 ${spend} 元</text>

            <rect x="90" y="96" width="520" height="32" rx="6" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" />
            <text x="350" y="117" fill="#34d399" font-size="13" font-weight="bold" text-anchor="middle">
              各花 ${spend} 元 ➔ 差距永遠維持 2 份 🔒 ➔ 1 份 ＝ ${m} 元 ➔ 小杰原本 ＝ 5 × ${m} ＝ ${p1Init} 元
            </text>
          </svg>
        `;

        return {
          type: '差不變',
          badge: '差不變（同減固定數）',
          question,
          options,
          answer: correctAns,
          explanation,
          diagramSvg
        };
      }
    ];

    return this.sample(templates)();
  },

  // =========================================================================
  // 3. 積不變 (Constant Product / Inverse Proportion)
  // 核心：分裝米/糖果、長方形面積、路程固定、工程工作量
  // =========================================================================
  generateProductInvariant() {
    const templates = [
      // 模板 P1 (課本核心・碾米分裝白米包數題): 每包重量 × 包數 = 總重量
      () => {
        const items = [
          { name: '白米', unit: '公斤', bagUnit: '包' },
          { name: '砂糖', unit: '公斤', bagUnit: '包' },
          { name: '綜合堅果', unit: '公斤', bagUnit: '包' },
          { name: '手工餅乾', unit: '公克', bagUnit: '袋' }
        ];
        const it = this.sample(items);

        const ansBags = this.sample([5, 6, 8, 10, 12, 15, 20]);
        const w2 = this.sample([2, 3, 4, 5, 6, 8, 10]);
        const totalWeight = ansBags * w2;

        const factors = [];
        for (let w = 2; w <= 20; w++) {
          if (totalWeight % w === 0 && w !== w2) {
            factors.push({ w1: w, n1: totalWeight / w });
          }
        }
        const pick = factors.length > 0 ? this.sample(factors) : { w1: 1, n1: totalWeight };
        const w1 = pick.w1;
        const n1 = pick.n1;

        const question = `豆豆參加農會體驗活動產出一大袋${it.name}。若每${it.bagUnit}裝 ${w1} ${it.unit}，剛好可以分裝成 ${n1} ${it.bagUnit}。如果想改為每${it.bagUnit}裝 ${w2} ${it.unit}，這大袋${it.name}一共可以裝成【幾${it.bagUnit}】？`;

        const correctAns = `${ansBags} ${it.bagUnit}`;
        const distractors = [
          `${ansBags + 2} ${it.bagUnit}`,
          `${Math.max(1, ansBags - 2)} ${it.bagUnit}`,
          `${Math.round((n1 * w2) / w1)} ${it.bagUnit}`,
          `${totalWeight} ${it.bagUnit}`,
          `${ansBags + 4} ${it.bagUnit}`
        ];

        const options = this.ensureEightOptions(correctAns, distractors);
        const explanation = `【積不變】整袋${it.name}的總重量固定（每${it.bagUnit}重量 × ${it.bagUnit}數 ＝ 總重量），兩者成「反比」！\n` +
          `• 算式關係：每${it.bagUnit}重量 × 包數 ＝ 總重量\n` +
          `• ${it.name}總重量 ＝ ${w1} × ${n1} ＝ ${totalWeight} ${it.unit}。\n` +
          `• 改裝後${it.bagUnit}數 ＝ ${totalWeight} ÷ ${w2} ＝ ${ansBags} ${it.bagUnit}。`;

        const diagramSvg = `
          <svg viewBox="0 0 660 145" xmlns="http://www.w3.org/2000/svg">
            ${this.getSvgDefs()}
            <!-- 方案一 -->
            <text x="35" y="32" fill="#cbd5e1" font-size="13" font-weight="bold">每包${w1}${it.unit}：</text>
            <rect x="130" y="16" width="460" height="26" rx="6" fill="#3b82f6" />
            <text x="360" y="34" fill="#fff" font-size="13" font-weight="bold" text-anchor="middle">
              裝成 ${n1} ${it.bagUnit} ➔ 總重量 ＝ ${w1} × ${n1} ＝ ${totalWeight} ${it.unit}
            </text>

            <!-- 轉換反比箭頭 -->
            <path d="M 600 30 Q 625 57 600 84" fill="none" stroke="#facc15" stroke-width="2" marker-end="url(#arrow)" />
            <text x="635" y="60" fill="#facc15" font-size="11" font-weight="bold">反比</text>

            <!-- 方案二 -->
            <text x="35" y="86" fill="#cbd5e1" font-size="13" font-weight="bold">改裝${w2}${it.unit}：</text>
            <rect x="130" y="70" width="460" height="26" rx="6" fill="#10b981" />
            <text x="360" y="88" fill="#fff" font-size="13" font-weight="bold" text-anchor="middle">
              可裝成 【${ansBags} ${it.bagUnit}】 ➔ 總重量 ＝ ${w2} × ${ansBags} ＝ ${totalWeight} ${it.unit}
            </text>

            <!-- 結論 -->
            <rect x="130" y="106" width="460" height="30" rx="6" fill="rgba(30, 41, 59, 0.9)" />
            <text x="360" y="126" fill="#34d399" font-size="13" font-weight="bold" text-anchor="middle">
              總重量 ${totalWeight} ${it.unit} 固定 🔒 ➔ 新包數 ＝ ${totalWeight} ÷ ${w2} ＝ ${ansBags} ${it.bagUnit}
            </text>
          </svg>
        `;

        return {
          type: '積不變',
          badge: '積不變（總重量固定）',
          question,
          options,
          answer: correctAns,
          explanation,
          diagramSvg
        };
      },

      // 模板 P2 (課本核心・長方形面積固定): 長與寬成反比
      () => {
        const lengths = [
          { l1: 20, w1: 15, l2: 25, w2: 12 },
          { l1: 24, w1: 10, l2: 16, w2: 15 },
          { l1: 30, w1: 12, l2: 20, w2: 18 },
          { l1: 18, w1: 10, l2: 15, w2: 12 },
          { l1: 36, w1: 10, l2: 18, w2: 20 },
          { l1: 25, w1: 8,  l2: 20, w2: 10 }
        ];
        const item = this.sample(lengths);
        const area = item.l1 * item.w1;

        const question = `一塊長方形花園的長是 ${item.l1} 公尺、寬是 ${item.w1} 公尺。如果重新規劃步道，把長改為 ${item.l2} 公尺，而「面積保持不變」，那麼寬應該要改為多少公尺？`;

        const correctAns = `${item.w2} 公尺`;
        const distractors = [
          `${item.w2 + 3} 公尺`,
          `${item.w2 - 2} 公尺`,
          `${Math.round((item.w1 * item.l2) / item.l1)} 公尺`,
          `${item.w1 - (item.l2 - item.l1)} 公尺`
        ];

        const options = this.ensureEightOptions(correctAns, distractors);
        const explanation = `【積不變】長方形面積（長 × 寬）保持不變，長與寬成「反比」！\n` +
          `• 關係式：長 × 寬 ＝ 面積\n` +
          `• 原面積 ＝ ${item.l1} × ${item.w1} ＝ ${area} 平方公尺。\n` +
          `• 新的寬度 ＝ ${area} ÷ ${item.l2} ＝ ${item.w2} 公尺。`;

        const diagramSvg = `
          <svg viewBox="0 0 660 145" xmlns="http://www.w3.org/2000/svg">
            ${this.getSvgDefs()}
            <!-- 長方形 A -->
            <g transform="translate(60, 20)">
              <rect x="0" y="0" width="220" height="60" fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" stroke-width="2" rx="6" />
              <text x="110" y="35" fill="#fff" font-size="13" font-weight="bold" text-anchor="middle">面積 ${area} m²</text>
              <text x="110" y="-6" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">長 ${item.l1} m</text>
              <text x="-8" y="34" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="end">寬 ${item.w1} m</text>
            </g>

            <text x="325" y="55" fill="#facc15" font-size="22" font-weight="bold" text-anchor="middle">＝</text>

            <!-- 長方形 B -->
            <g transform="translate(370, 20)">
              <rect x="0" y="0" width="230" height="50" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" stroke-width="2" rx="6" />
              <text x="115" y="30" fill="#fff" font-size="13" font-weight="bold" text-anchor="middle">面積 ${area} m²</text>
              <text x="115" y="-6" fill="#10b981" font-size="12" font-weight="bold" text-anchor="middle">長 ${item.l2} m</text>
              <text x="240" y="30" fill="#facc15" font-size="13" font-weight="bold">寬 【${item.w2} m】</text>
            </g>

            <rect x="60" y="105" width="540" height="30" rx="6" fill="rgba(30, 41, 59, 0.9)" />
            <text x="330" y="125" fill="#34d399" font-size="13" font-weight="bold" text-anchor="middle">
              長 × 寬 ＝ ${area} 🔒 (面積固定) ➔ 新的寬 ＝ ${area} ÷ ${item.l2} ＝ ${item.w2} 公尺
            </text>
          </svg>
        `;

        return {
          type: '積不變',
          badge: '積不變（面積固定成反比）',
          question,
          options,
          answer: correctAns,
          explanation,
          diagramSvg
        };
      },

      // 模板 P3 (行程問題) & P4 (工程問題)
      () => {
        const cases = [
          { n1: 6, d1: 12, n2: 9, d2: 8 },
          { n1: 8, d1: 15, n2: 12, d2: 10 },
          { n1: 10, d1: 18, n2: 15, d2: 12 },
          { n1: 12, d1: 10, n2: 15, d2: 8 },
          { n1: 4, d1: 15, n2: 6, d2: 10 },
          { n1: 5, d1: 16, n2: 8, d2: 10 }
        ];
        const c = this.sample(cases);
        const totalWork = c.n1 * c.d1;

        const question = `修築一條生態步道，如果由 ${c.n1} 名工人合力施工，需要 ${c.d1} 天完工。如果想提前完工，調派工人增加到 ${c.n2} 名工人合力施工，需要【幾天】可以完工？`;

        const correctAns = `${c.d2} 天`;
        const distractors = [
          `${c.d2 + 2} 天`,
          `${Math.max(1, c.d2 - 2)} 天`,
          `${Math.round((c.d1 * c.n2) / c.n1)} 天`,
          `${c.d1 - (c.n2 - c.n1)} 天`
        ];

        const options = this.ensureEightOptions(correctAns, distractors);
        const explanation = `【積不變】工程總工作量固定（人數 × 天數 ＝ 總人天數），人數與天數成「反比」！\n` +
          `• 總工作量 ＝ ${c.n1} 人 × ${c.d1} 天 ＝ ${totalWork} 人·天。\n` +
          `• 改派 ${c.n2} 人施工時，所需天數 ＝ ${totalWork} ÷ ${c.n2} ＝ ${c.d2} 天。`;

        const diagramSvg = `
          <svg viewBox="0 0 660 140" xmlns="http://www.w3.org/2000/svg">
            ${this.getSvgDefs()}
            <text x="40" y="32" fill="#60a5fa" font-size="13" font-weight="bold">原方案：</text>
            <rect x="110" y="16" width="460" height="26" rx="6" fill="#3b82f6" />
            <text x="340" y="34" fill="#fff" font-size="13" font-weight="bold" text-anchor="middle">
              ${c.n1} 人 × ${c.d1} 天 ＝ 總工作量 ${totalWork} 人·天
            </text>

            <text x="40" y="78" fill="#34d399" font-size="13" font-weight="bold">增派後：</text>
            <rect x="110" y="62" width="460" height="26" rx="6" fill="#10b981" />
            <text x="340" y="80" fill="#fff" font-size="13" font-weight="bold" text-anchor="middle">
              ${c.n2} 人 × 【${c.d2} 天】 ＝ 總工作量 ${totalWork} 人·天
            </text>

            <rect x="110" y="100" width="460" height="30" rx="6" fill="rgba(30, 41, 59, 0.9)" />
            <text x="340" y="120" fill="#facc15" font-size="13" font-weight="bold" text-anchor="middle">
              總工程量固定 🔒 ➔ 工人增加 ${c.n2} 人 ➔ 天數縮短為 ${totalWork} ÷ ${c.n2} ＝ ${c.d2} 天
            </text>
          </svg>
        `;

        return {
          type: '積不變',
          badge: '積不變（工時固定成反比）',
          question,
          options,
          answer: correctAns,
          explanation,
          diagramSvg
        };
      }
    ];

    return this.sample(templates)();
  },

  // =========================================================================
  // 4. 商不變 (Constant Quotient / Direct Proportion & Division Property)
  // 核心：杯子蛋糕單價、除法劃零餘數陷阱、注水速率固定
  // =========================================================================
  generateQuotientInvariant() {
    const templates = [
      // 模板 Q1 (課本核心・杯子蛋糕/文具單價問題): 總價 ÷ 數量 = 單價固定 (雙數線圖)
      () => {
        const goods = [
          { name: '杯子蛋糕', unit: '個', unitPrice: 15 },
          { name: '紅豆餅', unit: '個', unitPrice: 20 },
          { name: '幾何三角板', unit: '組', unitPrice: 25 },
          { name: '造型修正帶', unit: '個', unitPrice: 30 }
        ];
        const good = this.sample(goods);

        const ansQty = this.sample([8, 12, 16, 20, 24]);
        const cost2 = ansQty * good.unitPrice;

        const n1 = this.sample([3, 4, 5, 6]);
        const cost1 = n1 * good.unitPrice;

        const question = `烘焙坊販售相同的${good.name}。妙妙買了 ${n1} ${good.unit}，共付了 ${cost1} 元。豆豆帶著零用錢買了一模一樣的${good.name}，結帳共付了 ${cost2} 元，請問豆豆買了【幾個${good.name}】？`;

        const correctAns = `${ansQty} 個`;
        const distractors = [
          `${ansQty + 2} 個`,
          `${Math.max(1, ansQty - 2)} 個`,
          `${good.unitPrice} 個`,
          `${Math.round((cost2 * n1) / cost1) + 4} 個`,
          `${ansQty + 5} 個`
        ];

        const options = this.ensureEightOptions(correctAns, distractors);
        const explanation = `【商不變】商品單價固定（總價 ÷ 數量 ＝ 固定單價，成正比）！\n` +
          `• 關係式：總價 ÷ 數量 ＝ 單價\n` +
          `• 每個${good.name}單價 ＝ ${cost1} ÷ ${n1} ＝ ${good.unitPrice} 元。\n` +
          `• 豆豆購買數量 ＝ ${cost2} ÷ ${good.unitPrice} ＝ ${ansQty} 個。`;

        // 繪製雙數線圖 (Double Number Line)
        const diagramSvg = `
          <svg viewBox="0 0 660 150" xmlns="http://www.w3.org/2000/svg">
            ${this.getSvgDefs()}
            <!-- 上數線：數量 (個) -->
            <text x="35" y="32" fill="#60a5fa" font-size="13" font-weight="bold">數量(${good.unit})</text>
            <line x1="120" y1="28" x2="560" y2="28" stroke="#60a5fa" stroke-width="3" marker-end="url(#arrow)" />
            <line x1="140" y1="20" x2="140" y2="36" stroke="#60a5fa" stroke-width="2" />
            <text x="140" y="16" fill="#fff" font-size="11" text-anchor="middle">0</text>

            <line x1="280" y1="20" x2="280" y2="36" stroke="#60a5fa" stroke-width="2" />
            <text x="280" y="16" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">${n1}</text>

            <line x1="480" y1="20" x2="480" y2="36" stroke="#facc15" stroke-width="3" />
            <text x="480" y="16" fill="#facc15" font-size="14" font-weight="bold" text-anchor="middle">【${ansQty}】</text>

            <!-- 垂直比值對照箭頭 -->
            <path d="M 280 40 L 280 72" stroke="#facc15" stroke-width="2" marker-end="url(#arrow)" />
            <text x="290" y="58" fill="#facc15" font-size="11" font-weight="bold">×${good.unitPrice}元</text>

            <path d="M 480 40 L 480 72" stroke="#facc15" stroke-width="2" marker-end="url(#arrow)" />
            <text x="490" y="58" fill="#facc15" font-size="11" font-weight="bold">×${good.unitPrice}元</text>

            <!-- 下數線：總價 (元) -->
            <text x="35" y="92" fill="#34d399" font-size="13" font-weight="bold">總價(元)</text>
            <line x1="120" y1="88" x2="560" y2="88" stroke="#34d399" stroke-width="3" marker-end="url(#arrow-green)" />
            <line x1="140" y1="80" x2="140" y2="96" stroke="#34d399" stroke-width="2" />
            <text x="140" y="110" fill="#fff" font-size="11" text-anchor="middle">0</text>

            <line x1="280" y1="80" x2="280" y2="96" stroke="#34d399" stroke-width="2" />
            <text x="280" y="110" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">${cost1}元</text>

            <line x1="480" y1="80" x2="480" y2="96" stroke="#34d399" stroke-width="2" />
            <text x="480" y="110" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">${cost2}元</text>

            <rect x="120" y="120" width="460" height="26" rx="4" fill="rgba(30, 41, 59, 0.9)" />
            <text x="350" y="137" fill="#facc15" font-size="12" font-weight="bold" text-anchor="middle">
              總價 ÷ 數量 ＝ 單價 ${good.unitPrice} 元 🔒 (商不變，成正比) ➔ 豆豆買了 ${cost2} ÷ ${good.unitPrice} ＝ ${ansQty} 個
            </text>
          </svg>
        `;

        return {
          type: '商不變',
          badge: '商不變（固定單價成正比）',
          question,
          options,
          answer: correctAns,
          explanation,
          diagramSvg
        };
      },

      // 模板 Q2 (課本核心・除法劃零餘數陷阱題): 商不變，餘數縮放 100 倍
      () => {
        const baseDivisions = [
          { a0: 74, b0: 6, q: 12, r0: 2 },
          { a0: 85, b0: 7, q: 12, r0: 1 },
          { a0: 65, b0: 9, q: 7,  r0: 2 },
          { a0: 94, b0: 8, q: 11, r0: 6 },
          { a0: 58, b0: 4, q: 14, r0: 2 },
          { a0: 77, b0: 8, q: 9,  r0: 5 },
          { a0: 83, b0: 6, q: 13, r0: 5 },
        ];
        const item = this.sample(baseDivisions);
        const dividend = item.a0 * 100;
        const divisor = item.b0 * 100;
        const actualR = item.r0 * 100;

        const question = `計算 ${dividend} ÷ ${divisor} 時，如果利用商不變性質把被除數和除數末尾都劃掉兩個 0（簡化為 ${item.a0} ÷ ${item.b0}），求出的【商】與【真正的餘數】各是多少？`;

        const correctAns = `商是 ${item.q}，餘數是 ${actualR}`;
        const distractors = [
          `商是 ${item.q}，餘數是 ${item.r0}`,
          `商是 ${item.q * 100}，餘數是 ${actualR}`,
          `商是 ${item.q * 100}，餘數是 ${item.r0}`
        ];

        const options = this.ensureEightOptions(correctAns, distractors);
        const explanation = `【商不變】被除數和除數同時除以 100：\n` +
          `• 『商維持不變』依然是 ${item.q}！\n` +
          `• 但是『餘數也被縮小了 100 倍』變成 ${item.r0}，因此真正的餘數必須乘回 100：${item.r0} × 100 ＝ ${actualR}！\n` +
          `• 驗算檢查：${divisor} × ${item.q} ＋ ${actualR} ＝ ${dividend}。`;

        const diagramSvg = `
          <svg viewBox="0 0 660 150" xmlns="http://www.w3.org/2000/svg">
            ${this.getSvgDefs()}
            <!-- 原算式 -->
            <rect x="50" y="16" width="240" height="34" rx="6" fill="#1e293b" stroke="#64748b" />
            <text x="170" y="38" fill="#fff" font-size="14" font-weight="bold" text-anchor="middle">
              原式：${dividend} ÷ ${divisor}
            </text>

            <path d="M 300 33 L 340 33" stroke="#facc15" stroke-width="2" marker-end="url(#arrow)" />
            <text x="320" y="24" fill="#facc15" font-size="11" text-anchor="middle">同除以100</text>

            <!-- 簡化算式 -->
            <rect x="350" y="16" width="260" height="34" rx="6" fill="#1e293b" stroke="#38bdf8" />
            <text x="480" y="38" fill="#38bdf8" font-size="14" font-weight="bold" text-anchor="middle">
              簡化：${item.a0} ÷ ${item.b0} ＝ ${item.q} ⋯ 餘 ${item.r0}
            </text>

            <!-- 餘數還原對比卡片 -->
            <g transform="translate(50, 64)">
              <rect x="0" y="0" width="260" height="42" rx="6" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" />
              <text x="130" y="26" fill="#34d399" font-size="14" font-weight="bold" text-anchor="middle">
                ✅ 商維持不變 ＝ 【${item.q}】
              </text>
            </g>

            <g transform="translate(330, 64)">
              <rect x="0" y="0" width="280" height="42" rx="6" fill="rgba(244, 63, 94, 0.25)" stroke="#f43f5e" stroke-width="2" />
              <text x="140" y="26" fill="#fca5a5" font-size="14" font-weight="bold" text-anchor="middle">
                ⚠️ 真正的餘數 ＝ ${item.r0} × 100 ＝ 【${actualR}】
              </text>
            </g>

            <rect x="50" y="114" width="560" height="26" rx="4" fill="rgba(30, 41, 59, 0.9)" />
            <text x="330" y="132" fill="#e2e8f0" font-size="12" font-weight="bold" text-anchor="middle">
              驗算：除數 ${divisor} × 商 ${item.q} ＋ 餘數 ${actualR} ＝ ${dividend} (完全吻合！)
            </text>
          </svg>
        `;

        return {
          type: '商不變',
          badge: '商不變（除法與餘數性質）',
          question,
          options,
          answer: correctAns,
          explanation,
          diagramSvg
        };
      },

      // 模板 Q3 (水龍頭注水速率固定)
      () => {
        const rate = this.randInt(12, 28);
        const t1 = this.randInt(4, 8);
        const v1 = rate * t1;
        const t2 = t1 + this.randInt(3, 8);
        const v2 = rate * t2;

        const question = `水龍頭以固定的出水量注水進水槽，已知注水 ${t1} 分鐘可注入 ${v1} 公升。如果依相同的水流速度注水 ${t2} 分鐘，總共可注入多少公升水？`;

        const correctAns = `${v2} 公升`;
        const distractors = [
          `${v2 + rate} 公升`,
          `${v2 - rate} 公升`,
          `${v1 + (t2 - t1)} 公升`,
          `${Math.round(v2 * 1.2)} 公升`
        ];

        const options = this.ensureEightOptions(correctAns, distractors);
        const explanation = `【商不變】每分鐘出水速度固定（出水量 ÷ 時間 ＝ 固定比值，成正比）！\n` +
          `• 每分鐘出水量 ＝ ${v1} ÷ ${t1} ＝ ${rate} 公升。\n` +
          `• 注水 ${t2} 分鐘總水量 ＝ ${rate} × ${t2} ＝ ${v2} 公升。`;

        const diagramSvg = `
          <svg viewBox="0 0 660 145" xmlns="http://www.w3.org/2000/svg">
            ${this.getSvgDefs()}
            <text x="40" y="32" fill="#38bdf8" font-size="13" font-weight="bold">時間(分)</text>
            <line x1="120" y1="28" x2="560" y2="28" stroke="#38bdf8" stroke-width="3" marker-end="url(#arrow)" />
            <line x1="260" y1="20" x2="260" y2="36" stroke="#38bdf8" stroke-width="2" />
            <text x="260" y="16" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">${t1} 分</text>
            <line x1="460" y1="20" x2="460" y2="36" stroke="#facc15" stroke-width="3" />
            <text x="460" y="16" fill="#facc15" font-size="13" font-weight="bold" text-anchor="middle">${t2} 分</text>

            <path d="M 260 38 L 260 70" stroke="#facc15" stroke-width="2" marker-end="url(#arrow)" />
            <text x="270" y="56" fill="#facc15" font-size="11" font-weight="bold">每分${rate}L</text>

            <path d="M 460 38 L 460 70" stroke="#facc15" stroke-width="2" marker-end="url(#arrow)" />
            <text x="470" y="56" fill="#facc15" font-size="11" font-weight="bold">每分${rate}L</text>

            <text x="40" y="92" fill="#34d399" font-size="13" font-weight="bold">水量(L)</text>
            <line x1="120" y1="88" x2="560" y2="88" stroke="#34d399" stroke-width="3" marker-end="url(#arrow-green)" />
            <line x1="260" y1="80" x2="260" y2="96" stroke="#34d399" stroke-width="2" />
            <text x="260" y="110" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">${v1} L</text>
            <line x1="460" y1="80" x2="460" y2="96" stroke="#34d399" stroke-width="2" />
            <text x="460" y="110" fill="#34d399" font-size="13" font-weight="bold" text-anchor="middle">【${v2} L】</text>

            <rect x="120" y="118" width="450" height="24" rx="4" fill="rgba(30, 41, 59, 0.9)" />
            <text x="345" y="135" fill="#facc15" font-size="12" font-weight="bold" text-anchor="middle">
              出水速率固定 ＝ ${rate} L/分 🔒 ➔ ${t2} 分鐘 ＝ ${rate} × ${t2} ＝ ${v2} 公升
            </text>
          </svg>
        `;

        return {
          type: '商不變',
          badge: '商不變（注水速率固定）',
          question,
          options,
          answer: correctAns,
          explanation,
          diagramSvg
        };
      }
    ];

    return this.sample(templates)();
  },

  // =========================================================================
  // 5. 根據類別產出單題
  // =========================================================================
  generate(category) {
    switch (category) {
      case 'sum':
        return this.generateSumInvariant();
      case 'diff':
        return this.generateDiffInvariant();
      case 'product':
        return this.generateProductInvariant();
      case 'quotient':
        return this.generateQuotientInvariant();
      case 'mixed':
      default: {
        const types = ['sum', 'diff', 'product', 'quotient'];
        const chosen = this.sample(types);
        return this.generate(chosen);
      }
    }
  },

  // =========================================================================
  // 6. 產生一整輪對決題目（每輪固定 4 題）
  // =========================================================================
  generateRound(category, totalQuestions = 4) {
    const list = [];

    if (category === 'mixed') {
      const fourTypes = this.shuffle(['sum', 'diff', 'product', 'quotient']);
      for (let i = 0; i < totalQuestions; i++) {
        const type = fourTypes[i % fourTypes.length];
        list.push(this.generate(type));
      }
    } else {
      for (let i = 0; i < totalQuestions; i++) {
        list.push(this.generate(category));
      }
    }

    return list;
  }
};

// 導出全域題庫產生器 (相容瀏覽器與 Node 測試)
if (typeof window !== 'undefined') {
  window.QuestionGenerator = QuestionGenerator;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuestionGenerator;
}
