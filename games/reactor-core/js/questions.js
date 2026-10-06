/**
 * questions.js - 康軒六上數學 第02單元《分數除法》十道魔導反應爐關卡引擎
 * 完全遵循教學課綱，透過 PRNG 產生防作弊隨機參數，支援中英雙語，學習鷹架嚴禁直接洩漏答案。
 */

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

// 輔助函式：化為最簡分數 { whole, num, den }
function simplifyFraction(w, n, d) {
  // 將帶分數展開為假分數
  let totalNum = w * d + n;
  if (totalNum === 0) {
    return { whole: 0, num: 0, den: 1 };
  }
  const g = gcd(totalNum, d);
  totalNum /= g;
  d /= g;

  const whole = Math.floor(totalNum / d);
  const num = totalNum % d;
  return { whole, num, den: num === 0 ? 1 : d };
}

class QuestionEngine {
  constructor(classNum = '601', seatNum = '01') {
    this.classNum = classNum;
    this.seatNum = seatNum;
    const seed = `${classNum}_${seatNum}_fraction_reactor_2026`;
    this.rng = new SeededRandom(seed);
    this.chambers = this._generateAllChambers();
  }

  _generateAllChambers() {
    const list = [
      this._genChamber1(), // 2-1 最簡分數 (約分與互質)
      this._genChamber2(), // 2-2 同分母除法 (整數商)
      this._genChamber3(), // 2-2 同分母除法 (分數商與帶分數)
      this._genChamber4(), // 2-3 異分母除法 (通分法相除)
      this._genChamber5(), // 2-3 異分母除法 (顛倒相乘與交叉約分)
      this._genChamber6(), // 2-4 應用題 (速率與注水時間)
      this._genChamber7(), // 2-4 應用題 (單位量求法：長度與重量)
      this._genChamber8(), // 2-4 應用題 (基準量求法：部分求全部)
      this._genChamber9(), // 2-5 被除數、除數和商的關係 (不用計算比大小)
      this._genChamber10() // 綜合挑戰題 (終極核心穩定)
    ];

    return list;
  }

  // B1: 2-1 最簡分數約分
  _genChamber1() {
    // 例：將 2 30/45 約成最簡分數，或 12/18、24/36、18/24
    const templates = [
      { whole: 0, num: 12, den: 18, g: 6, tNum: 2, tDen: 3 },
      { whole: 2, num: 30, den: 45, g: 15, tNum: 2, tDen: 3 },
      { whole: 1, num: 24, den: 36, g: 12, tNum: 2, tDen: 3 },
      { whole: 0, num: 15, den: 60, g: 15, tNum: 1, tDen: 4 },
      { whole: 2, num: 33, den: 55, g: 11, tNum: 3, tDen: 5 },
      { whole: 3, num: 51, den: 54, g: 3, tNum: 17, tDen: 18 }
    ];
    const pick = this.rng.choice(templates);
    const whole = pick.whole;
    const num = pick.num;
    const den = pick.den;
    const ans = simplifyFraction(whole, num, den);

    const fractionStr = whole > 0 ? `${whole}又${num}/${den}` : `${num}/${den}`;
    const fractionStrEn = whole > 0 ? `${whole} and ${num}/${den}` : `${num}/${den}`;

    return {
      id: 'chamber_1',
      unitSection: '2-1 最簡分數',
      type: 'fraction',
      title_zh: 'B1 核心濾網堵塞',
      title_en: 'B1 Core Filter Clogging',
      story_zh: `反應爐初級濾網偵測到能量雜質波形！儀表板顯示當前共振數值為【${fractionStr}】。請找出分子與分母的最大公因數進行約分，將濾網微調至「最簡分數」以清除雜質結晶！`,
      story_en: `Impure aether frequencies detected in the primary reactor mesh! The monitor displays a raw resonance of [${fractionStrEn}]. Find the greatest common divisor (GCD) to reduce it to its simplest fractional form and purge the impurities!`,
      question_zh: `請將共振數值約分成最簡分數`,
      question_en: `Reduce the resonance value into its simplest fractional form`,
      target: ans,
      diagramType: 'reduction',
      diagramData: { whole, num, den, gcdVal: pick.g },
      hint_zh: [
        '💡 觀念導引：最簡分數的分子和分母互質，也就是公因數只有 1。',
        '💡 步驟引導：找出分子的數值與分母的數值，求出兩者的「最大公因數」。',
        '💡 算式鷹架：新分子 ＝ 分子 ÷ 最大公因數，新分母 ＝ 分母 ÷ 最大公因數。（請動手計算）',
        '⚠️ 注意陷阱：若有整數部分，整數保持不變，只需約簡分數部分！'
      ],
      hint_en: [
        '💡 Concept: A fraction is in simplest form when numerator and denominator are coprime (GCD = 1).',
        '💡 Steps: Identify the numerator and denominator, then find their Greatest Common Divisor (GCD).',
        '💡 Scaffolding: New Numerator = Numerator ÷ GCD, New Denominator = Denominator ÷ GCD. (Calculate on paper)',
        '⚠️ Trap: If there is a whole number part, keep it untouched and only reduce the fraction!'
      ]
    };
  }

  // B2: 2-2 同分母分數除法 (整數商)
  _genChamber2() {
    // 例：7/8 ÷ 1/8 = 7, 15/16 ÷ 3/16 = 5, 18/7 ÷ 2/7 = 9
    const denList = [7, 8, 9, 12, 16];
    const den = this.rng.choice(denList);
    const unitStep = this.rng.choice([1, 2, 3]);
    const multiplier = this.rng.choice([4, 5, 6, 7, 8]);
    const totalNum = unitStep * multiplier;

    const ans = { whole: multiplier, num: 0, den: 1 };

    return {
      id: 'chamber_2',
      unitSection: '2-2 同分母分數除法 (整數商)',
      type: 'fraction',
      title_zh: 'B2 同頻共振能量槽',
      title_en: 'B2 Harmonic Resonance Tank',
      story_zh: `反應爐二號加壓槽總共儲備了【${totalNum}/${den} 兆焦耳】的靈力液。每次點火需要注入【${unitStep}/${den} 兆焦耳】的標準能量膠囊。請問這批靈力液最多可以進行幾次完整的加壓點火？`,
      story_en: `Auxiliary Tank #2 holds [${totalNum}/${den} MJ] of aether coolant. Each pulse cycle consumes a standard [${unitStep}/${den} MJ] energy capsule. Exactly how many pulse ignition cycles can be performed?`,
      question_zh: `請問這批靈力液最多可以進行幾次完整的加壓點火？`,
      question_en: `How many full pulse ignition cycles can be performed?`,
      target: ans,
      diagramType: 'tape_measure',
      diagramData: { totalNum, unitStep, den },
      hint_zh: [
        `💡 觀念導引：${totalNum}/${den} 是「${totalNum} 個 1/${den}」，${unitStep}/${den} 是「${unitStep} 個 1/${den}」。`,
        '💡 步驟引導：當分母相同時，分子直接相除即可！（看成幾個單位相除）',
        `💡 算式鷹架：${totalNum} ÷ ${unitStep} ＝ ？ 次（請動手計算）`,
        '⚠️ 提示：本題計算結果為整數，在控制台整數盤輸入該數值即可！'
      ],
      hint_en: [
        `💡 Concept: ${totalNum}/${den} represents "${totalNum} units of 1/${den}", and ${unitStep}/${den} is "${unitStep} units of 1/${den}".`,
        '💡 Steps: When denominators match, simply divide the numerators directly!',
        `💡 Scaffolding: ${totalNum} ÷ ${unitStep} = ? (Calculate on scratch paper)`,
        '⚠️ Tip: The answer is an integer. Set the whole number dial on the console!'
      ]
    };
  }

  // B3: 2-2 同分母分數除法 (分數商 / 帶分數)
  _genChamber3() {
    // 例：7/5 ÷ 4/5 = 7/4 = 1 3/4, 9/7 ÷ 5/7 = 9/5 = 1 4/5, 11/8 ÷ 3/8 = 11/3 = 3 2/3
    const den = this.rng.choice([5, 7, 8, 9]);
    const numB = this.rng.choice([3, 4, 5]);
    const numA = numB + this.rng.choice([2, 3, 5]); // 確保不能整除且大於 1
    const ans = simplifyFraction(0, numA, numB);

    return {
      id: 'chamber_3',
      unitSection: '2-2 同分母分數除法 (帶分數商)',
      type: 'fraction',
      title_zh: 'B3 結晶配給解離室',
      title_en: 'B3 Crystal Distribution Chamber',
      story_zh: `主蒸氣管藍色導線長【${numA}/${den} 公尺】，綠色導線長【${numB}/${den} 公尺】。主控電腦需要設定分流比例：藍色導線長度是綠色導線長度的「幾倍」？`,
      story_en: `Main conduit Blue Cable measures [${numA}/${den} m], and Green Cable measures [${numB}/${den} m]. The governor requires the length ratio: How many times longer is the Blue Cable compared to the Green Cable?`,
      question_zh: `請問藍色導線長度是綠色導線長度的幾倍？（請以最簡帶分數回答）`,
      question_en: `How many times longer is the Blue Cable compared to the Green Cable? (Simplest mixed fraction)`,
      target: ans,
      diagramType: 'tape_measure',
      diagramData: { totalNum: numA, unitStep: numB, den },
      hint_zh: [
        '💡 觀念導引：同分母分數相除，直接將「分子相除」：被除數分子 ÷ 除數分子。',
        `💡 步驟引導：${numA} ÷ ${numB} ＝ ${numA}/${numB}。`,
        '💡 算式鷹架：將假分數化成帶分數：商為整數部分，餘數為分子，除數為分母。（請動手計算）',
        '⚠️ 注意：輸入時請分別設定【整數】與【分子/分母】！'
      ],
      hint_en: [
        '💡 Concept: When denominators are identical, divide the numerators: Dividend Numerator ÷ Divisor Numerator.',
        `💡 Steps: ${numA} ÷ ${numB} = ${numA}/${numB}.`,
        '💡 Scaffolding: Convert improper fraction to mixed number: Quotient is whole, remainder is numerator. (Calculate)',
        '⚠️ Notice: Enter both the [Whole] and [Fraction] valves on the console!'
      ]
    };
  }

  // B4: 2-3 異分母分數除法 (通分法先備)
  _genChamber4() {
    // 課本第28頁模型：1/4 ÷ 1/3 = 3/12 ÷ 4/12 = 3/4
    // 或 1/6 ÷ 1/4 = 2/12 ÷ 3/12 = 2/3, 1/5 ÷ 1/2 = 2/10 ÷ 5/10 = 2/5
    const pairs = [
      { n1: 1, d1: 4, n2: 1, d2: 3, lcd: 12 },
      { n1: 1, d1: 6, n2: 1, d2: 4, lcd: 12 },
      { n1: 1, d1: 5, n2: 1, d2: 2, lcd: 10 },
      { n1: 2, d1: 9, n2: 1, d2: 3, lcd: 9 },
      { n1: 3, d1: 8, n2: 1, d2: 2, lcd: 8 }
    ];
    const pick = this.rng.choice(pairs);
    const ans = simplifyFraction(0, pick.n1 * pick.d2, pick.d1 * pick.n2);

    return {
      id: 'chamber_4',
      unitSection: '2-3 異分母除法 (通分法)',
      type: 'fraction',
      title_zh: 'B4 異質導管通分槽',
      title_en: 'B4 Heterogeneous Conduit Junction',
      story_zh: `反應爐冷卻進水閥甲每秒注水【${pick.n1}/${pick.d1} 公升】，進水閥乙每秒注水【${pick.n2}/${pick.d2} 公升】。兩種導管孔徑不同無法直接相除，工程師必須先將分母通分為【${pick.lcd}】，再計算閥甲注水量是閥乙的幾倍？`,
      story_en: `Coolant Valve Alpha flows [${pick.n1}/${pick.d1} L/s], while Valve Beta flows [${pick.n2}/${pick.d2} L/s]. Differing apertures prevent direct division! Align their denominators to [${pick.lcd}], then determine the ratio of Alpha to Beta.`,
      question_zh: `請問進水閥甲每秒注水量是進水閥乙的幾倍？`,
      question_en: `What is the flow ratio of Valve Alpha compared to Valve Beta?`,
      target: ans,
      diagramType: 'common_denominator',
      diagramData: { n1: pick.n1, d1: pick.d1, n2: pick.n2, d2: pick.d2, lcd: pick.lcd },
      hint_zh: [
        `💡 觀念導引：分母不同時，先找出兩分母的公倍數進行「通分」。`,
        `💡 步驟引導：將兩分數通分為分母為 ${pick.lcd} 的同分母分數。`,
        '💡 算式鷹架：通分後分母相同，直接以「新分子 ÷ 新分子」＝ ？（請動手計算）',
        '⚠️ 注意：檢查最終答案是否已經是最簡分數！'
      ],
      hint_en: [
        '💡 Concept: When denominators differ, find their common multiple and perform common denominator conversion.',
        `💡 Steps: Convert both fractions into denominators of ${pick.lcd}.`,
        '💡 Scaffolding: With equal denominators, divide the new numerators: (New N1 ÷ New N2) = ? (Calculate)',
        '⚠️ Check: Verify that the fraction is reduced to simplest terms!'
      ]
    };
  }

  // B5: 2-3 異分母除法 (顛倒相乘與交叉約分)
  _genChamber5() {
    // 課本第29頁模型：2/5 ÷ 7/8 = 2/5 × 8/7 = 16/35
    // 或 6/7 ÷ 20/21 = 6/7 × 21/20 = 9/10, 5/9 ÷ 7/11 = 55/63
    const pairs = [
      { a: 2, b: 5, c: 7, d: 8 },
      { a: 6, b: 7, c: 20, d: 21 },
      { a: 5, b: 9, c: 7, d: 11 },
      { a: 3, b: 8, c: 9, d: 16 },
      { a: 4, b: 7, c: 8, d: 21 }
    ];
    const pick = this.rng.choice(pairs);
    const ans = simplifyFraction(0, pick.a * pick.d, pick.b * pick.c);

    return {
      id: 'chamber_5',
      unitSection: '2-3 異分母除法 (顛倒相乘法)',
      type: 'fraction',
      title_zh: 'B5 時空逆流翻轉閥',
      title_en: 'B5 Chrono Reciprocal Valve',
      story_zh: `警報！反應爐核心偵測到逆向迴路阻抗：輸入流為【${pick.a}/${pick.b}】，除數負載為【${pick.c}/${pick.d}】。拉下「逆流翻轉閥」將除法變為乘法，將除數分子分母顛倒，計算出最終輸出共振比！`,
      story_en: `Alarm! Reverse impedance detected in the circuit: Input power is [${pick.a}/${pick.b}], and divisor resistance is [${pick.c}/${pick.d}]. Activate the Reciprocal Valve to invert the divisor into multiplication and solve for resonance output!`,
      question_zh: `請問迴路輸出共振比是多少？`,
      question_en: `What is the circuit resonance output ratio?`,
      target: ans,
      diagramType: 'reciprocal_inversion',
      diagramData: { a: pick.a, b: pick.b, c: pick.c, d: pick.d },
      hint_zh: [
        '💡 核心法則：分數除以分數時，將「除數的分子、分母顛倒」後，改為與被除數相乘！',
        `💡 步驟引導：${pick.a}/${pick.b} ÷ ${pick.c}/${pick.d} ＝ ${pick.a}/${pick.b} × ${pick.d}/${pick.c}。`,
        '💡 算式鷹架：相乘前先進行「交叉約分」，可以大幅簡化計算！（請動手計算）',
        '⚠️ 陷阱提醒：只能顛倒「除數」（後面的分數），「被除數」（前面的分數）不能翻轉！'
      ],
      hint_en: [
        '💡 Core Rule: Dividing by a fraction equals multiplying by its reciprocal (invert numerator and denominator)!',
        `💡 Steps: ${pick.a}/${pick.b} ÷ ${pick.c}/${pick.d} = ${pick.a}/${pick.b} × ${pick.d}/${pick.c}.`,
        '💡 Scaffolding: Perform cross-cancellation before multiplying across! (Calculate on paper)',
        '⚠️ Warning: Only invert the divisor (the second fraction), never the dividend!'
      ]
    };
  }

  // B6: 2-4 應用題 (注水速率與所需時間)
  _genChamber6() {
    // 課本第31頁第2題模型：水龍頭每分鐘注水 1 1/6 公升，注滿 10 1/2 公升的水桶需要幾分鐘？
    // 10 1/2 ÷ 1 1/6 = 21/2 ÷ 7/6 = 21/2 × 6/7 = 9 分鐘
    const datasets = [
      { rateW: 1, rateN: 1, rateD: 6, capW: 10, capN: 1, capD: 2, minutes: 9 },
      { rateW: 1, rateN: 1, rateD: 4, capW: 7, capN: 1, capD: 2, minutes: 6 },
      { rateW: 1, rateN: 2, rateD: 3, capW: 13, capN: 1, capD: 3, minutes: 8 },
      { rateW: 2, rateN: 1, rateD: 2, capW: 17, capN: 1, capD: 2, minutes: 7 }
    ];
    const pick = this.rng.choice(datasets);
    const ans = { whole: pick.minutes, num: 0, den: 1 };

    return {
      id: 'chamber_6',
      unitSection: '2-4 應用題 (速率與時間)',
      type: 'fraction',
      title_zh: 'B6 冷卻水注水時控室',
      title_en: 'B6 Coolant Injection Timer',
      story_zh: `反應爐急冷水閥一分鐘可以注入【${pick.rateW}又${pick.rateN}/${pick.rateD} 公升】高純度冷卻水。若要注滿容量為【${pick.capW}又${pick.capN}/${pick.capD} 公升】的防爆冷卻水槽，總共需要多少分鐘？`,
      story_en: `Emergency coolant valve injects [${pick.rateW} ${pick.rateN}/${pick.rateD} L] per minute. How many minutes will it take to fill the [${pick.capW} ${pick.capN}/${pick.capD} L] containment chamber?`,
      question_zh: `請問注滿防爆水槽總共需要多少分鐘？`,
      question_en: `How many minutes will it take to fill the containment chamber?`,
      target: ans,
      diagramType: 'bucket_rate',
      diagramData: pick,
      hint_zh: [
        '💡 觀念導引：總容量 ÷ 每分鐘注水量 ＝ 所需總分鐘數。',
        '💡 步驟引導：將兩邊的「帶分數」先換算為「假分數」。',
        '💡 算式鷹架：化成假分數後，運用「顛倒相乘」與交叉約分求得整數答案。（請動手計算）',
        '⚠️ 檢查：本題為整數分鐘，請將整數填入控制台整數盤！'
      ],
      hint_en: [
        '💡 Concept: Total Capacity ÷ Rate per Minute = Total Minutes needed.',
        '💡 Steps: Convert both mixed numbers into improper fractions first.',
        '💡 Scaffolding: Invert the divisor to multiply, cross-cancel, and solve for the integer. (Calculate)',
        '⚠️ Check: The result is an exact whole integer of minutes!'
      ]
    };
  }

  // B7: 2-4 應用題 (單位量求法：長度與重量)
  _genChamber7() {
    // 課本第32頁第5題模型：長 1 1/7 公尺的鐵條重 16/9 公斤，1公尺重多少公斤？
    // 16/9 ÷ 1 1/7 = 16/9 ÷ 8/7 = 16/9 × 7/8 = 14/9 = 1 5/9 公斤
    const datasets = [
      { lenW: 1, lenN: 1, lenD: 7, wtN: 16, wtD: 9, ansW: 1, ansN: 5, ansD: 9 },
      { lenW: 1, lenN: 1, lenD: 5, wtN: 18, wtD: 5, ansW: 3, ansN: 0, ansD: 1 },
      { lenW: 2, lenN: 1, lenD: 4, wtN: 9, wtD: 2, ansW: 2, ansN: 0, ansD: 1 },
      { lenW: 1, lenN: 3, lenD: 5, wtN: 12, wtD: 7, ansW: 1, ansN: 1, ansD: 14 }
    ];
    const pick = this.rng.choice(datasets);
    const ans = { whole: pick.ansW, num: pick.ansN, den: pick.ansD };

    const lenStr = `${pick.lenW}又${pick.lenN}/${pick.lenD}`;
    const lenStrEn = `${pick.lenW} ${pick.lenN}/${pick.lenD}`;

    return {
      id: 'chamber_7',
      unitSection: '2-4 應用題 (單位量求法)',
      type: 'fraction',
      title_zh: 'B7 導能合金電纜密度',
      title_en: 'B7 Conduit Alloy Density',
      story_zh: `技師截取了一段長【${lenStr} 公尺】的魔導超導電纜，測得總重量為【${pick.wtN}/${pick.wtD} 公斤】。反應爐承重系統要求輸入「長 1 公尺」電纜的單位重量（公斤），數值是多少？`,
      story_en: `Technicians cut a section of superconducting alloy wire measuring [${lenStrEn} m], weighing [${pick.wtN}/${pick.wtD} kg] in total. The reactor stabilizer requires the weight of "1 meter" of wire. What is it?`,
      question_zh: `請問長 1 公尺電纜的單位重量是多少公斤？（請以最簡分數回答）`,
      question_en: `What is the unit weight per 1 meter of wire in kilograms? (Simplest form)`,
      target: ans,
      diagramType: 'wire_density',
      diagramData: pick,
      hint_zh: [
        '💡 觀念導引：求 1 公尺的重量 ＝ 總重量 ÷ 總長度。',
        `💡 步驟引導：${pick.wtN}/${pick.wtD} ÷ ${lenStr}。記得將長度的帶分數化為假分數！`,
        '💡 算式鷹架：分數除以假分數 ➡️ 乘以它的倒數 ➡️ 約分 ➡️ 化成最簡帶分數。（請動手計算）',
        '⚠️ 陷阱：不要將「長度 ÷ 重量」顛倒了！要算「1公尺多重」，長度是除數！'
      ],
      hint_en: [
        '💡 Concept: Unit weight (per meter) = Total Weight ÷ Total Length.',
        `💡 Steps: ${pick.wtN}/${pick.wtD} ÷ ${lenStrEn}. Convert length into an improper fraction first!`,
        '💡 Scaffolding: Multiply by the reciprocal, cancel factors, and simplify. (Calculate on scratch paper)',
        '⚠️ Trap: Do NOT invert the terms! Length is the divisor when seeking weight per meter.'
      ]
    };
  }

  // B8: 2-4 應用題 (基準量求法：部分求全部)
  _genChamber8() {
    // 課本第32頁第4/6題模型：4/5公斤芭樂48元，1公斤賣多少元？
    // 48 ÷ 4/5 = 48 × 5/4 = 60 元
    // 或 72人佔全校 8/15，全校共 72 ÷ 8/15 = 135人
    const datasets = [
      { part: 48, num: 4, den: 5, total: 60, item_zh: '高純度晶石', item_en: 'crystal' },
      { part: 72, num: 8, den: 15, total: 135, item_zh: '副反應爐功率', item_en: 'sub-reactor' },
      { part: 45, num: 5, den: 6, total: 54, item_zh: '穩定磁場催化劑', item_en: 'catalyst' },
      { part: 64, num: 4, den: 7, total: 112, item_zh: '蒸氣加壓儲存罐', item_en: 'steam tank' }
    ];
    const pick = this.rng.choice(datasets);
    const ans = { whole: pick.total, num: 0, den: 1 };

    return {
      id: 'chamber_8',
      unitSection: '2-4 應用題 (基準量求法)',
      type: 'fraction',
      title_zh: 'B8 全域能量基準反推',
      title_en: 'B8 Global Base Power Calculation',
      story_zh: `艦隊主機傳來通訊：目前輔助發電機提供了【${pick.part} 兆瓦】的電力，剛好佔全艦總動力基準量的【${pick.num}/${pick.den}】。請反推算出全艦 100% 的「總動力」是多少兆瓦？`,
      story_en: `Auxiliary generator reports an output of [${pick.part} MW], which corresponds exactly to [${pick.num}/${pick.den}] of the ship's total base power. Deduce the 100% total base power of the entire dreadnought!`,
      question_zh: `請問全艦 100% 的總動力是多少兆瓦？`,
      question_en: `What is the 100% total base power of the dreadnought?`,
      target: ans,
      diagramType: 'base_amount',
      diagramData: pick,
      hint_zh: [
        `💡 觀念導引：全部 × ${pick.num}/${pick.den} ＝ 部分（${pick.part}），所以 全部 ＝ 部分 ÷ 比率。`,
        `💡 步驟引導：${pick.part} ÷ ${pick.num}/${pick.den} ＝ ${pick.part} × ${pick.den}/${pick.num}。`,
        `💡 算式鷹架：整數 ${pick.part} 先與分母相除或約分，再乘以上方數值。（請動手計算）`,
        '⚠️ 意義理解：因為除數小於 1，算出來的全部總量一定會比部分（數值）還要大！'
      ],
      hint_en: [
        `💡 Concept: Total × ${pick.num}/${pick.den} = Portion (${pick.part}), thus Total = Portion ÷ Ratio.`,
        `💡 Steps: ${pick.part} ÷ ${pick.num}/${pick.den} = ${pick.part} × ${pick.den}/${pick.num}.`,
        `💡 Scaffolding: Cross-cancel the whole number ${pick.part} with the divisor, then multiply. (Calculate)`,
        '⚠️ Sanity Check: Since the fraction is < 1, the total base amount MUST be greater than the part!'
      ]
    };
  }

  // B9: 2-5 被除數、除數和商的關係 (不用計算比大小)
  _genChamber9() {
    // 課本第33頁模型：不用計算，在方格填入 >、< 或 =
    // 當除數 < 1 時，商 > 被除數 (增壓 BOOST)
    // 當除數 = 1 時，商 = 被除數 (衡平 BALANCE)
    // 當除數 > 1 時，商 < 被除數 (洩壓 DAMPEN)
    const options = [
      {
        k: 6, divStr: '1/3', divVal: 1 / 3, relation: '>',
        mode_zh: '增壓 ( > )', mode_en: 'BOOST ( > )',
        rule_zh: '除數小於 1，商大於被除數'
      },
      {
        k: 4, divStr: '3/2', divVal: 3 / 2, relation: '<',
        mode_zh: '洩壓 ( < )', mode_en: 'DAMPEN ( < )',
        rule_zh: '除數大於 1，商小於被除數'
      },
      {
        k: 8, divStr: '1', divVal: 1, relation: '=',
        mode_zh: '衡平 ( = )', mode_en: 'BALANCE ( = )',
        rule_zh: '除數等於 1，商等於被除數'
      },
      {
        k: 5, divStr: '2/5', divVal: 2 / 5, relation: '>',
        mode_zh: '增壓 ( > )', mode_en: 'BOOST ( > )',
        rule_zh: '除數小於 1，商大於被除數'
      },
      {
        k: 7, divStr: '4/3', divVal: 4 / 3, relation: '<',
        mode_zh: '洩壓 ( < )', mode_en: 'DAMPEN ( < )',
        rule_zh: '除數大於 1，商小於被除數'
      }
    ];
    const pick = this.rng.choice(options);

    return {
      id: 'chamber_9',
      unitSection: '2-5 被除數、除數和商的關係',
      type: 'bypass', // 特殊三向閘門開關
      title_zh: 'B9 超頻旁路三向閥',
      title_en: 'B9 Overclock 3-Way Bypass',
      story_zh: `旁路監控閥門正在分析能量迴路！式子為【${pick.k} ÷ ${pick.divStr}】與原始被除數【${pick.k}】的對比。請完全「不用計算」，透過除數與 1 的大小關係，切換三向旁路閥門為【增壓 ( > )】、【衡平 ( = )】或【洩壓 ( < )】！`,
      story_en: `Bypass monitor evaluates the circuit: Compare [${pick.k} ÷ ${pick.divStr}] with the original base [${pick.k}]. Without calculation, inspect the divisor vs 1, then toggle the 3-Way Valve to [BOOST ( > )], [BALANCE ( = )], or [DAMPEN ( < )]!`,
      question_zh: `不用計算，比較商與被除數大小關係，切換三向旁路閥門`,
      question_en: `Compare without calculating: Toggle 3-Way Valve based on divisor vs 1`,
      target: pick.relation, // '>' or '=' or '<'
      diagramType: 'bypass_gauge',
      diagramData: pick,
      hint_zh: [
        '💡 課本定律 1：當除數 ＜ 1 時，商 ＞ 被除數。（切換為 🔺 增壓）',
        '💡 課本定律 2：當除數 ＝ 1 時，商 ＝ 被除數。（切換為 ⚖️ 衡平）',
        '💡 課本定律 3：當除數 ＞ 1 時，商 ＜ 被除數。（切換為 🔻 洩壓）',
        `⚠️ 判斷指引：請觀察本題的除數【${pick.divStr}】和 1 比較，比 1 大還是比 1 小？`
      ],
      hint_en: [
        '💡 Law 1: When Divisor < 1, Quotient > Dividend. (Select 🔺 BOOST)',
        '💡 Law 2: When Divisor = 1, Quotient = Dividend. (Select ⚖️ BALANCE)',
        '💡 Law 3: When Divisor > 1, Quotient < Dividend. (Select 🔻 DAMPEN)',
        `⚠️ Guide: Inspect divisor [${pick.divStr}] against 1. Is it greater than, equal to, or less than 1?`
      ]
    };
  }

  // B10: 終極核心穩定 (綜合難題 / 有餘數的分數除法概念)
  _genChamber10() {
    // 課本第36頁綜合題模型：
    // 長方形面積 8 3/4 平方公尺，長 3 1/8 公尺，寬是多少？
    // 8 3/4 ÷ 3 1/8 = 35/4 ÷ 25/8 = 35/4 × 8/25 = (7×2)/5 = 14/5 = 2 4/5 公尺
    // 或 12 1/2 ÷ 2 1/2 = 5
    const datasets = [
      { areaW: 8, areaN: 3, areaD: 4, lenW: 3, lenN: 1, lenD: 8, wW: 2, wN: 4, wD: 5 },
      { areaW: 10, areaN: 1, areaD: 2, lenW: 3, lenN: 1, lenD: 2, wW: 3, wN: 0, wD: 1 },
      { areaW: 7, areaN: 1, areaD: 2, lenW: 2, lenN: 1, lenD: 2, wW: 3, wN: 0, wD: 1 },
      { areaW: 6, areaN: 2, areaD: 3, lenW: 2, lenN: 2, lenD: 9, wW: 3, wN: 0, wD: 1 }
    ];
    const pick = this.rng.choice(datasets);
    const ans = { whole: pick.wW, num: pick.wN, den: pick.wD };

    const areaStr = `${pick.areaW}又${pick.areaN}/${pick.areaD}`;
    const lenStr = `${pick.lenW}又${pick.lenN}/${pick.lenD}`;
    const areaStrEn = `${pick.areaW} ${pick.areaN}/${pick.areaD}`;
    const lenStrEn = `${pick.lenW} ${pick.lenN}/${pick.lenD}`;

    return {
      id: 'chamber_10',
      unitSection: '綜合高階應用 (面積與幾何長度)',
      type: 'fraction',
      title_zh: 'B10 終極核心熔毀臨界',
      title_en: 'B10 Ultimate Meltdown Criticality',
      story_zh: `熔毀警報進入最後倒數！魔導反應爐底座矩形防護罩總面積為【${areaStr} 平方公尺】，測得長度為【${lenStr} 公尺】。防爆閘門液壓栓必須輸入其精確的「寬度（公尺）」，才能完全鎖死冷卻槽並逃離熔毀地心！`,
      story_en: `Meltdown imminent! The rectangular blast-shield footprint covers [${areaStrEn} sq m], with a measured length of [${lenStrEn} m]. Hydraulic blast locks require the exact "Width (meters)" to clamp shut and avert full core destruction!`,
      question_zh: `請問防護罩底座的精確寬度是多少公尺？（請以最簡分數回答）`,
      question_en: `What is the exact width of the blast-shield base in meters? (Simplest form)`,
      target: ans,
      diagramType: 'rect_area',
      diagramData: pick,
      hint_zh: [
        '💡 幾何公式導引：長方形面積 ＝ 長 × 寬，所以 寬 ＝ 面積 ÷ 長。',
        `💡 步驟引導：將面積與長度兩個帶分數，全部化為假分數！`,
        '💡 算式鷹架：顛倒相乘 ➡️ 大力進行交叉約分 ➡️ 化成最簡帶分數。（請動手計算）',
        '⚠️ 勝利在望：仔細檢查計算過程，成功鎖死反應爐即可通關生還！'
      ],
      hint_en: [
        '💡 Geometry Rule: Rectangle Area = Length × Width, hence Width = Area ÷ Length.',
        '💡 Steps: Convert both mixed numbers into improper fractions.',
        '💡 Scaffolding: Invert the divisor, perform cross-cancellation, and convert to simplest mixed fraction. (Calculate)',
        '⚠️ Final Frontier: Double check your math to lock the core and secure survival!'
      ]
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QuestionEngine, gcd, simplifyFraction };
}
