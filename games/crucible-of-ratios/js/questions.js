/**
 * questions.js - 康軒六上第五單元「比與比值」10 大關卡題庫引擎
 * 採用 PRNG 種子隨機技術，同座號題目穩定、不同座號題目互異防抄襲。
 * 嚴禁直接在題幹或鷹架中洩漏計算式與答案，促使學生自主列式思考。
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

function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

function simplifyRatio(a, b) {
  const g = gcd(a, b);
  return { ante: a / g, cons: b / g, gcdVal: g };
}

function simplifyFraction(num, den) {
  const g = gcd(num, den);
  const sNum = num / g;
  const sDen = den / g;
  const whole = Math.floor(sNum / sDen);
  const remNum = sNum % sDen;
  return { whole, num: remNum, den: sDen, rawNum: sNum, rawDen: sDen, gcdVal: g };
}

class QuestionEngine {
  constructor(classNum = '601', seatNum = '01') {
    this.classNum = classNum;
    this.seatNum = seatNum;
    const seed = `${classNum}_${seatNum}_ratio_crucible_2026`;
    this.rng = new PRNG(seed);
    this.chambers = this._generateAllChambers();
  }

  _generateAllChambers() {
    return [
      this._genChamber1(), // 5-1 比的意義與前後項
      this._genChamber2(), // 5-1 同類量比值
      this._genChamber3(), // 5-1 異類量比值與單位變率
      this._genChamber4(), // 5-2 相等的比之判定
      this._genChamber5(), // 5-2 最簡整數比 (整數型)
      this._genChamber6(), // 5-2 最簡整數比 (分數/小數型)
      this._genChamber7(), // 5-2 比例式未知項求解
      this._genChamber8(), // 5-3 應用題 (配方與溶液調配)
      this._genChamber9(), // 5-3 應用題 (按比例分配總量)
      this._genChamber10() // 5-3 終極魔王關 (影子與物高比例)
    ];
  }

  // B1: 5-1 比的意義與前項後項辨識
  _genChamber1() {
    const templates = [
      { a: 7, b: 2, itemA_zh: '紅炎晶石', itemB_zh: '藍水滴石', itemA_en: 'Ruby Core', itemB_en: 'Sapphire Dew' },
      { a: 5, b: 3, itemA_zh: '金輝齒輪', itemB_zh: '銀翼符文', itemA_en: 'Golden Gear', itemB_en: 'Silver Rune' },
      { a: 8, b: 5, itemA_zh: '綠翠精華', itemB_zh: '紫曜粉塵', itemA_en: 'Emerald Essence', itemB_en: 'Amethyst Dust' },
      { a: 9, b: 4, itemA_zh: '烈陽徽章', itemB_zh: '暗影月印', itemA_en: 'Solar Crest', itemB_en: 'Shadow Sigil' }
    ];
    const pick = this.rng.choice(templates);
    const multiplier = this.rng.choice([1, 2]);
    const numA = pick.a * multiplier;
    const numB = pick.b * multiplier;

    return {
      id: 'chamber_1',
      unitSection: '5-1 比的意義與符號',
      consoleMode: 'ratio',
      title_zh: 'B1 符號神印室',
      title_en: 'B1 Seal of Antecedent and Consequent',
      story_zh: `神殿入口的石門封印刻著兩道古老印記。石板記載：【${numA} 顆${pick.itemA_zh}】與【${numB} 顆${pick.itemB_zh}】具有神秘平衡。請在控制台建立「${pick.itemA_zh}個數」和「${pick.itemB_zh}個數」的比（注意：前項與後項順序不可顛倒）！`,
      story_en: `The gateway seal displays two ancient glyphs: [${numA} ${pick.itemA_en}] and [${numB} ${pick.itemB_en}]. Input the exact ratio of [${pick.itemA_en} quantity] to [${pick.itemB_en} quantity] on the console! (Warning: Do not reverse antecedent and consequent!)`,
      target: { ante: numA, cons: numB },
      diagramType: 'symbolic_ratio',
      diagramData: { numA, numB, itemA: pick.itemA_zh, itemB: pick.itemB_zh },
      hint_zh: [
        '💡 核心觀念：在數學中，用「：」來表示兩個數量的對應關係。',
        '💡 順序原則：題目問「A個數」和「B個數」的比，A 寫在前面（前項），B 寫在後面（後項）。',
        '⚠️ 嚴重陷阱：如果把前項和後項的位置對調，代表的意思完全不同，會觸發警報！'
      ],
      hint_en: [
        '💡 Concept: The colon symbol [ : ] expresses the relationship between two quantities.',
        '💡 Order Principle: For ratio of A to B, A is the Antecedent (front), and B is the Consequent (rear).',
        '⚠️ Trap: Reversing antecedent and consequent inverts the mathematical meaning!'
      ]
    };
  }

  // B2: 5-1 同類量比值計算
  _genChamber2() {
    const datasets = [
      { a: 7, b: 5, itemA_zh: '原味靈液', itemB_zh: '草莓靈液', itemA_en: 'Pure Aether', itemB_en: 'Berry Elixir' },
      { a: 8, b: 6, itemA_zh: '赤焰結晶', itemB_zh: '玄冰結晶', itemA_en: 'Flame Crystal', itemB_en: 'Frost Crystal' },
      { a: 9, b: 4, itemA_zh: '白光石', itemB_zh: '紫曜石', itemA_en: 'Lumen Stone', itemB_en: 'Void Stone' },
      { a: 6, b: 4, itemA_zh: '重力浮標', itemB_zh: '磁力浮標', itemA_en: 'Graviton Float', itemB_en: 'Magnetic Float' }
    ];
    const pick = this.rng.choice(datasets);
    const ansFraction = simplifyFraction(pick.a, pick.b);

    return {
      id: 'chamber_2',
      unitSection: '5-1 同類量比值計算',
      consoleMode: 'fraction',
      title_zh: 'B2 能量光譜室',
      title_en: 'B2 Resonance Ratio Gauge',
      story_zh: `調和室儲能櫃中整齊陳列著【${pick.a} 瓶${pick.itemA_zh}】與【${pick.b} 瓶${pick.itemB_zh}】。神殿光譜儀需要校準「${pick.itemA_zh}瓶數」是「${pick.itemB_zh}瓶數」的幾倍？請計算出「${pick.a}：${pick.b}」的比值，並以最簡分數或帶分數輸入！`,
      story_en: `The container racks store [${pick.a} flasks of ${pick.itemA_en}] and [${pick.b} flasks of ${pick.itemB_en}]. The gauge requires the multiple: How many times is ${pick.itemA_en} compared to ${pick.itemB_en}? Calculate the ratio value of [${pick.a} : ${pick.b}] in simplest fractional form!`,
      target: ansFraction,
      diagramType: 'ratio_value',
      diagramData: { a: pick.a, b: pick.b, itemA: pick.itemA_zh, itemB: pick.itemB_zh },
      hint_zh: [
        '💡 核心觀念：將比的「前項」除以「後項」所得到的結果（商），就是這個比的「比值」。',
        '💡 步驟引導：比值 ＝ 前項 ÷ 後項 ＝ 分子/分母。',
        '💡 約分檢查：若分子分母有公因數，請務必約分成「最簡分數」或化為「帶分數」！'
      ],
      hint_en: [
        '💡 Concept: The value of a ratio is the quotient of Antecedent ÷ Consequent.',
        '💡 Steps: Value = Antecedent ÷ Consequent.',
        '💡 Check: If numerator and denominator share factors, reduce to simplest mixed/proper fraction!'
      ]
    };
  }

  // B3: 5-1 異類量比值 (單位變率與性價比)
  _genChamber3() {
    const options = [
      {
        vol1: 400, price1: 40, vol2: 450, price2: 50,
        rate1: 10, rate2: 9, best: 'A',
        itemA: '聖光之泉甲', itemB: '聖光之泉乙'
      },
      {
        vol1: 350, price1: 20, vol2: 500, price2: 25,
        rate1: 17.5, rate2: 20, best: 'B',
        itemA: '秘境甘露甲', itemB: '秘境甘露乙'
      },
      {
        vol1: 1000, price1: 40, vol2: 700, price2: 30,
        rate1: 25, rate2: 23.33, best: 'A',
        itemA: '龍涎靈液甲', itemB: '龍涎靈液乙'
      }
    ];
    const pick = this.rng.choice(options);
    const ansFraction = simplifyFraction(pick.vol1, pick.price1);

    return {
      id: 'chamber_3',
      unitSection: '5-1 異類量比值與單位變率',
      consoleMode: 'rate_comparison',
      title_zh: 'B3 靈液性價室',
      title_en: 'B3 Rate Efficiency Chamber',
      story_zh: `補給台提供兩種容量規格：【甲瓶容量 ${pick.vol1} 毫升，需注入 ${pick.price1} 點魔力】；【乙瓶容量 ${pick.vol2} 毫升，需注入 ${pick.price2} 點魔力】。請計算出「甲瓶容量對魔力花費」的比值（表示每 1 點魔力可換得多少毫升靈液），並選擇哪一瓶較為划算！`,
      story_en: `Supply pedestal presents two potions: [Potion Alpha: ${pick.vol1} mL for ${pick.price1} MP] and [Potion Beta: ${pick.vol2} mL for ${pick.price2} MP]. Calculate the value of ratio [Alpha Volume to MP Cost] (mL per 1 MP), then select which bottle is more cost-effective!`,
      target: { fraction: ansFraction, best: pick.best },
      diagramType: 'unit_rate',
      diagramData: pick,
      hint_zh: [
        '💡 核心觀念：異類量相比會產生新單位變率，此處為「毫升/點魔力」。',
        '💡 比值意義：容量 ÷ 消耗點數 ＝ 每 1 點魔力可獲得的毫升數。',
        '💡 划算判斷：比值越大，代表花費 1 點魔力能買到的藥水越多，因此越划算！'
      ],
      hint_en: [
        '💡 Concept: Ratios of differing units yield a rate (e.g. mL per MP).',
        '💡 Calculation: Volume ÷ MP Cost = mL acquired per 1 MP.',
        '💡 Economy Decision: The higher the ratio value, the more volume per MP, meaning better efficiency!'
      ]
    };
  }

  // B4: 5-2 相等的比之判定
  _genChamber4() {
    const templates = [
      {
        baseA: 3, baseB: 5,
        pipes: [
          { label: 'A', a: 6, b: 10, match: true },
          { label: 'B', a: 9, b: 14, match: false },
          { label: 'C', a: 12, b: 22, match: false },
          { label: 'D', a: 15, b: 20, match: false }
        ]
      },
      {
        baseA: 2, baseB: 7,
        pipes: [
          { label: 'A', a: 4, b: 12, match: false },
          { label: 'B', a: 6, b: 21, match: true },
          { label: 'C', a: 8, b: 25, match: false },
          { label: 'D', a: 10, b: 30, match: false }
        ]
      },
      {
        baseA: 4, baseB: 9,
        pipes: [
          { label: 'A', a: 8, b: 16, match: false },
          { label: 'B', a: 12, b: 25, match: false },
          { label: 'C', a: 16, b: 36, match: true },
          { label: 'D', a: 20, b: 40, match: false }
        ]
      }
    ];
    const pick = this.rng.choice(templates);
    const shuffledPipes = this.rng.shuffle(pick.pipes);
    const correctPipe = shuffledPipes.find(p => p.match);

    return {
      id: 'chamber_4',
      unitSection: '5-2 相等的比之判定',
      consoleMode: 'select_pipe',
      title_zh: 'B4 共振頻率室',
      title_en: 'B4 Harmonic Conduit Alignment',
      story_zh: `中央共振池的古代基準波長比為【${pick.baseA}：${pick.baseB}】。前方有 4 條能量管路，其能量比分別為：管路A【${shuffledPipes[0].a}：${shuffledPipes[0].b}】、管路B【${shuffledPipes[1].a}：${shuffledPipes[1].b}】、管路C【${shuffledPipes[2].a}：${shuffledPipes[2].b}】、管路D【${shuffledPipes[3].a}：${shuffledPipes[3].b}】。請切換閘門導通與基準比「相等」的管路！`,
      story_en: `Harmonic core aligns with the base ratio [${pick.baseA} : ${pick.baseB}]. 4 conduits are available: Pipe A [${shuffledPipes[0].a}:${shuffledPipes[0].b}], Pipe B [${shuffledPipes[1].a}:${shuffledPipes[1].b}], Pipe C [${shuffledPipes[2].a}:${shuffledPipes[2].b}], Pipe D [${shuffledPipes[3].a}:${shuffledPipes[3].b}]. Toggle the valve to the conduit holding an equivalent ratio!`,
      target: correctPipe.label,
      diagramType: 'equivalent_conduits',
      diagramData: { baseA: pick.baseA, baseB: pick.baseB, pipes: shuffledPipes },
      hint_zh: [
        '💡 核心觀念：兩個比的比值相等時，我們稱它們為「相等的比」。',
        '💡 快速方法：比的前項和後項同時乘以（或同除以）同一個不等於 0 的數，比相等。',
        '💡 驗證步驟：計算各管路比值或觀察擴分倍數，只有一條管路的比值與基準完全相同！'
      ],
      hint_en: [
        '💡 Concept: Ratios with identical ratio values are equivalent ratios.',
        '💡 Property: Multiplying or dividing antecedent and consequent by the same non-zero integer preserves equality.',
        '💡 Steps: Test the common scale factor or compare simplest fractions!'
      ]
    };
  }

  // B5: 5-2 最簡整數比 (整數型)
  _genChamber5() {
    const templates = [
      { rawA: 24, rawB: 30, g: 6, ansA: 4, ansB: 5 },
      { rawA: 15, rawB: 18, g: 3, ansA: 5, ansB: 6 },
      { rawA: 28, rawB: 42, g: 14, ansA: 2, ansB: 3 },
      { rawA: 25, rawB: 10, g: 5, ansA: 5, ansB: 2 },
      { rawA: 36, rawB: 48, g: 12, ansA: 3, ansB: 4 },
      { rawA: 45, rawB: 27, g: 9, ansA: 5, ansB: 3 }
    ];
    const pick = this.rng.choice(templates);

    return {
      id: 'chamber_5',
      unitSection: '5-2 最簡整數比 (整數)',
      consoleMode: 'ratio',
      title_zh: 'B5 晶核提純室',
      title_en: 'B5 Integer Ratio Purifier',
      story_zh: `晶化爐能量計顯示原始雜質比為【${pick.rawA}：${pick.rawB}】。粗糙數值含有多重公因數阻抗，必須將前項與後項同除以最大公因數，化為「最簡整數比」以凝聚固態晶石！`,
      story_en: `The purifier monitor reads a raw ratio of [${pick.rawA} : ${pick.rawB}]. Shared factors cause crystalline impedance! Divide both antecedent and consequent by their Greatest Common Divisor (GCD) to reduce into the simplest integer ratio!`,
      target: { ante: pick.ansA, cons: pick.ansB },
      diagramType: 'simplest_integer_ratio',
      diagramData: pick,
      hint_zh: [
        '💡 核心觀念：比的前項和後項都是整數，且除了 1 以外沒有其他公因數（互質），稱為「最簡整數比」。',
        '💡 步驟引導：找出前項與後項兩數的「最大公因數 (GCD)」。',
        '💡 算式鷹架：新前項 ＝ 前項 ÷ 最大公因數，新後項 ＝ 後項 ÷ 最大公因數。'
      ],
      hint_en: [
        '💡 Concept: A ratio whose antecedent and consequent are integers with GCD = 1 is in simplest integer form.',
        '💡 Steps: Find the Greatest Common Divisor of both terms.',
        '💡 Scaffolding: New Antecedent = Antecedent ÷ GCD; New Consequent = Consequent ÷ GCD.'
      ]
    };
  }

  // B6: 5-2 最簡整數比 (分數與小數)
  _genChamber6() {
    const templates = [
      {
        type: 'fraction',
        text_zh: '3/5：1/3', text_en: '3/5 : 1/3',
        n1: 3, d1: 5, n2: 1, d2: 3, lcmVal: 15,
        ansA: 9, ansB: 5
      },
      {
        type: 'fraction',
        text_zh: '1/2：2/3', text_en: '1/2 : 2/3',
        n1: 1, d1: 2, n2: 2, d2: 3, lcmVal: 6,
        ansA: 3, ansB: 4
      },
      {
        type: 'decimal',
        text_zh: '2.5：7.5', text_en: '2.5 : 7.5',
        scale: 10,
        ansA: 1, ansB: 3
      },
      {
        type: 'decimal',
        text_zh: '0.6：2.7', text_en: '0.6 : 2.7',
        scale: 10,
        ansA: 2, ansB: 9
      },
      {
        type: 'mixed',
        text_zh: '1又1/2：1', text_en: '1 1/2 : 1',
        ansA: 3, ansB: 2
      }
    ];
    const pick = this.rng.choice(templates);

    return {
      id: 'chamber_6',
      unitSection: '5-2 分數與小數化為最簡整數比',
      consoleMode: 'ratio',
      title_zh: 'B6 混沌相轉室',
      title_en: 'B6 Phase Shift Conversion',
      story_zh: `異質能量迴路中流動著非整數流體，儀表讀數為【${pick.text_zh}】。晶化栓要求輸入前項與後項皆為整數、且兩數互質的「最簡整數比」，方可鎖定迴路！`,
      story_en: `The anomalous circuit conducts non-integer mana: Meter displays [${pick.text_en}]. The crystalline lock mandates conversion into simplest integer ratio (coprime integers)!`,
      target: { ante: pick.ansA, cons: pick.ansB },
      diagramType: 'fraction_decimal_ratio',
      diagramData: pick,
      hint_zh: [
        '💡 分數比解法：先將兩分數通分，或同乘以兩分母的「最小公倍數」，去掉分母後再化簡！',
        '💡 小數比解法：同乘以 10 或 100 化成整數比，再同除以最大公因數。',
        '💡 帶分數解法：先化成假分數（例如 1又1/2 ＝ 3/2），再同乘以分母！'
      ],
      hint_en: [
        '💡 Fractions: Multiply both terms by the Least Common Multiple (LCM) of denominators, then reduce.',
        '💡 Decimals: Multiply by 10 or 100 to obtain integers, then divide by their GCD.',
        '💡 Mixed Numbers: Convert into improper fractions first!'
      ]
    };
  }

  // B7: 5-2 比例式未知項求解
  _genChamber7() {
    const templates = [
      { a: 3, b: 4, c: 18, d: 24, unknown: 'c', knownPos: 'd', expr_zh: '3：4 ＝ □：24', expr_en: '3 : 4 = □ : 24', ans: 18 },
      { a: 20, b: 55, c: 4, d: 11, unknown: 'd', knownPos: 'c', expr_zh: '20：55 ＝ 4：□', expr_en: '20 : 55 = 4 : □', ans: 11 },
      { a: 5, b: 14, c: 2.5, d: 7, unknown: 'c', knownPos: 'd', expr_zh: '5：14 ＝ □：7', expr_en: '5 : 14 = □ : 7', ans: 2.5 },
      { a: 2, b: 7, c: 6, d: 21, unknown: 'd', knownPos: 'c', expr_zh: '2：7 ＝ 6：□', expr_en: '2 : 7 = 6 : □', ans: 21 }
    ];
    // 選取整數答案的樣式
    const validTemplates = templates.filter(t => Number.isInteger(t.ans));
    const pick = this.rng.choice(validTemplates);

    return {
      id: 'chamber_7',
      unitSection: '5-2 比例式未知項求解',
      consoleMode: 'single_val',
      title_zh: 'B7 失落銘文室',
      title_en: 'B7 Lost Glyphs of Proportion',
      story_zh: `石壁神壇上浮現古代等比式，但其中一個數值被風化掩蓋：【${pick.expr_zh}】。請觀察前項與後項的倍數關聯，推算出方框【□】中所隱藏的精準數值！`,
      story_en: `An ancient equation is inscribed with an eroded blank: [${pick.expr_en}]. Observe the scaling factor between antecedent and consequent, and deduce the value hidden inside [□]!`,
      target: pick.ans,
      diagramType: 'missing_proportion',
      diagramData: pick,
      hint_zh: [
        '💡 核心法則：相等的比中，前項擴大幾倍，後項也必須擴大相同的倍數；反之縮小亦然。',
        '💡 推理步驟：先比對已知的前項（或後項）放大了幾倍或縮小了幾倍。',
        '💡 算式鷹架：將對應項乘以或除以該相同倍數，即可求出 □ 之值！'
      ],
      hint_en: [
        '💡 Rule: In equivalent ratios, antecedent and consequent share the exact same scaling factor.',
        '💡 Steps: Identify the multiplier or divisor between corresponding known terms.',
        '💡 Scaffolding: Apply the same multiplier/divisor to find the unknown term □!'
      ]
    };
  }

  // B8: 5-3 應用題 (配方與溶液調配)
  _genChamber8() {
    const templates = [
      {
        ante: 2, cons: 5, scale: 3,
        itemA_zh: '白色塗料', itemB_zh: '藍色塗料',
        itemA_en: 'White Resin', itemB_en: 'Blue Resin',
        givenA: 6, ansB: 15
      },
      {
        ante: 3, cons: 17, scale: 20,
        itemA_zh: '高純度鹽晶', itemB_zh: '純水',
        itemA_en: 'Salt Crystal', itemB_en: 'Purified Water',
        givenB: 340, ansA: 60
      },
      {
        ante: 4, cons: 1, scale: 3,
        itemA_zh: '高濃度酒精', itemB_zh: '蒸餾水',
        itemA_en: 'Concentrated Ethanol', itemB_en: 'Distilled Water',
        givenB: 6, ansA: 24
      }
    ];
    const pick = this.rng.choice(templates);

    // 依題目生成題幹
    const isGivenA = pick.givenA !== undefined;
    const story_zh = isGivenA ?
      `調和聖殿指定守護屏障塗料比例：【${pick.itemA_zh}桶數：${pick.itemB_zh}桶數 ＝ ${pick.ante}：${pick.cons}】。技師目前注入了【${pick.givenA} 桶${pick.itemA_zh}】，需要注入多少桶【${pick.itemB_zh}】才能調製出相同防護屏障？` :
      `調和聖殿指定配方比例：【${pick.itemA_zh}克數：${pick.itemB_zh}克數 ＝ ${pick.ante}：${pick.cons}】。技師目前注入了【${pick.givenB} 克${pick.itemB_zh}】，需要搭配多少克【${pick.itemA_zh}】？`;

    const story_en = isGivenA ?
      `Barrier formula ratio: [${pick.itemA_en} : ${pick.itemB_en} = ${pick.ante} : ${pick.cons}]. Having poured [${pick.givenA} units of ${pick.itemA_en}], how many units of [${pick.itemB_en}] must be combined?` :
      `Formula ratio: [${pick.itemA_en} : ${pick.itemB_en} = ${pick.ante} : ${pick.cons}]. Given [${pick.givenB} grams of ${pick.itemB_en}], how many grams of [${pick.itemA_en}] are required?`;

    const ans = isGivenA ? pick.ansB : pick.ansA;

    return {
      id: 'chamber_8',
      unitSection: '5-3 應用題 (調配比例)',
      consoleMode: 'single_val',
      title_zh: 'B8 秘藥調配室',
      title_en: 'B8 Alchemical Crucible of Blends',
      story_zh,
      story_en,
      target: ans,
      diagramType: 'mixture_recipe',
      diagramData: { ...pick, isGivenA, targetVal: ans },
      hint_zh: [
        '💡 核心觀念：調出相同顏色或濃度，兩者的「比」必須維持相等！',
        '💡 列式引導：設未知量為 □，列出等比式：原比 ＝ 目標量：□。',
        '💡 倍數推理：觀察已知量是原始份數的幾倍，未知量也是相應份數的相同倍數！'
      ],
      hint_en: [
        '💡 Concept: To preserve identical properties, the ratio must remain equivalent.',
        '💡 Equation: Set up the proportion: Base Ratio = Target Known : □.',
        '💡 Ratio Scaling: Find the scale factor of the known term and apply it to the unknown!'
      ]
    };
  }

  // B9: 5-3 應用題 (按比例分配總量)
  _genChamber9() {
    const datasets = [
      {
        ante: 4, cons: 3, total: 700,
        nameA_zh: '光之賢者', nameB_zh: '影之賢者',
        nameA_en: 'Light Sage', nameB_en: 'Shadow Sage',
        unit_zh: '兆焦耳', unit_en: 'MJ',
        partA: 400, partB: 300
      },
      {
        ante: 2, cons: 3, total: 50,
        nameA_zh: '青江草藥圃', nameB_zh: '青花草藥圃',
        nameA_en: 'Azure Herb Garden', nameB_en: 'Viridian Herb Garden',
        unit_zh: '平方公尺', unit_en: 'sq m',
        partA: 20, partB: 30
      },
      {
        ante: 5, cons: 6, total: 77,
        nameA_zh: '守護騎士團', nameB_zh: '遊俠射手團',
        nameA_en: 'Knight Order', nameB_en: 'Ranger Corps',
        unit_zh: '人', unit_en: 'warriors',
        partA: 35, partB: 42
      }
    ];
    const pick = this.rng.choice(datasets);

    return {
      id: 'chamber_9',
      unitSection: '5-3 應用題 (按比例分配)',
      consoleMode: 'single_val',
      title_zh: 'B9 靈石天秤室',
      title_en: 'B9 Scales of Proportional Division',
      story_zh: `傳送門修復需共充能【${pick.total} ${pick.unit_zh}】的總量。依神聖契約，${pick.nameA_zh}與${pick.nameB_zh}的分攤比例為【${pick.ante}：${pick.cons}】。請問【${pick.nameA_zh}】必須注入的精準魔力量是多少${pick.unit_zh}？`,
      story_en: `Portal activation requires a total charge of [${pick.total} ${pick.unit_en}]. According to the pact, ${pick.nameA_en} and ${pick.nameB_en} share energy in ratio [${pick.ante} : ${pick.cons}]. Exactly how much energy must [${pick.nameA_en}] contribute?`,
      target: pick.partA,
      diagramType: 'proportional_division',
      diagramData: pick,
      hint_zh: [
        `💡 核心步驟 1（求總份數）：先將比的前項與後項相加，求出總共分成幾份：${pick.ante} ＋ ${pick.cons} ＝ 總份數。`,
        `💡 核心步驟 2（求佔比率）：${pick.nameA_zh}所佔的比率是「總份數分之${pick.ante}」。`,
        '💡 算式鷹架：總量 × 佔比率 ＝ 第一位應分得之數量！（請動手計算）'
      ],
      hint_en: [
        `💡 Step 1 (Total Parts): Sum the ratio terms to find total parts: ${pick.ante} + ${pick.cons} = Total Parts.`,
        `💡 Step 2 (Ratio Fraction): ${pick.nameA_en} accounts for ${pick.ante} / Total Parts.`,
        '💡 Scaffolding: Total Amount × (Antecedent / Total Parts) = Required Amount. (Calculate on scratch paper)'
      ]
    };
  }

  // B10: 5-3 終極魔王關 (影子與高度比例)
  _genChamber10() {
    const datasets = [
      {
        rodHeight: 120, rodShadow: 48,
        poleShadow: 360, poleHeight: 900,
        item_zh: '神殿方尖碑', item_en: 'Temple Obelisk'
      },
      {
        rodHeight: 145, rodShadow: 58,
        poleShadow: 400, poleHeight: 1000,
        item_zh: '古代巨神像', item_en: 'Titan Colossus'
      },
      {
        rodHeight: 150, rodShadow: 60,
        poleShadow: 320, poleHeight: 800,
        item_zh: '太陽神柱', item_en: 'Solar Pillar'
      }
    ];
    const pick = this.rng.choice(datasets);

    return {
      id: 'chamber_10',
      unitSection: '5-3 終極魔王關 (影長與實高比例)',
      consoleMode: 'single_val',
      title_zh: 'B10 太陽日晷神殿',
      title_en: 'B10 Solar Heliometer Zenith',
      story_zh: `熔毀倒數開始！脫離神殿的滑翔翼栓在【${pick.item_zh}】的頂端。正午陽光下，調和師測得標竿高【${pick.rodHeight} 公分】，其影長為【${pick.rodShadow} 公分】；同一時刻測得巨大【${pick.item_zh}】的影長為【${pick.poleShadow} 公分】。請利用同一時刻物體高度與影長比值相同的原理，推算【${pick.item_zh}】的真實高度（公分）以校準纜線！`,
      story_en: `Meltdown countdown initiated! The escape glider is anchored to the summit of the [${pick.item_en}]. Under sunlight, a reference rod measures [${pick.rodHeight} cm tall] with a shadow of [${pick.rodShadow} cm]. Simultaneously, the colossal [${pick.item_en}] casts a shadow of [${pick.poleShadow} cm]. Calculate the true height (cm) of the [${pick.item_en}] to calibrate the glider cable!`,
      target: pick.poleHeight,
      diagramType: 'shadow_projection',
      diagramData: pick,
      hint_zh: [
        '💡 幾何定律：在同一時刻、同一太陽光照射下，所有物體的「物高：影長」之比相等（比值相同）。',
        '💡 列式引導：標竿高：標竿影長 ＝ 神像高：神像影長。',
        '💡 倍數推理：觀察神殿影長是標竿影長的幾倍，神殿真實高度就是標竿高度的相同倍數！（請動手計算）'
      ],
      hint_en: [
        '💡 Geometric Law: Under identical sunlight, Height : Shadow Length remains constant across all objects.',
        '💡 Proportion: Rod Height : Rod Shadow = Target Height : Target Shadow.',
        '💡 Calculation: Find how many times longer the target shadow is, and scale the rod height accordingly!'
      ]
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QuestionEngine, gcd, lcm, simplifyRatio, simplifyFraction };
}
