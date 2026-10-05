/**
 * 題庫與關卡隨機生成器 (AlchemistQuestionEngine)
 * 嚴格對應康軒六上數學第 04 單元《小數除法》(P.52–P.65)
 * 10 大密室關卡、防抄襲隨機種子 (PRNG)、雙語中英模型與六階輪盤小數密碼映射
 */
class AlchemistQuestionEngine {
  constructor(classSeatSeed = '601-01') {
    this.rng = new SeededRandom(classSeatSeed);
  }

  // 1. 生成 10 大密室原始題型
  generateRawChambers() {
    const chambers = [];

    // -------------------------------------------------------------
    // 第 1 題：聖水瓶的分裝之門 (4-1 整數 ÷ 一位小數，商為整數) P.54
    // -------------------------------------------------------------
    const pool1 = [
      { A: 7, B: 0.5, Q: 14, unit_zh: '瓶', unit_en: 'vials' },
      { A: 12, B: 0.8, Q: 15, unit_zh: '瓶', unit_en: 'vials' },
      { A: 10, B: 0.4, Q: 25, unit_zh: '瓶', unit_en: 'vials' },
      { A: 18, B: 1.2, Q: 15, unit_zh: '瓶', unit_en: 'vials' },
      { A: 24, B: 1.5, Q: 16, unit_zh: '瓶', unit_en: 'vials' },
      { A: 35, B: 2.5, Q: 14, unit_zh: '瓶', unit_en: 'vials' },
      { A: 14, B: 0.7, Q: 20, unit_zh: '瓶', unit_en: 'vials' }
    ];
    const item1 = this.rng.pickOne(pool1);
    chambers.push({
      id: 'ch_holy_water',
      baseName_zh: '聖水瓶的分裝之門',
      baseName_en: 'Vault of Sacred Water Filling',
      chapter_ref: '六上康軒數學 P.54【整數 ÷ 小數】',
      story_zh: `鍊金術士的地下藥庫深處，石壁刻有淨化符文。石台上有一桶 ${item1.A} 公升的生命聖水，必須分裝到容量僅為 ${item1.B} 公升的抗魔秘銀小瓶中。只有精確算出能分裝的總瓶數，才能啟動石門的滾輪鎖！`,
      story_en: `In the subterranean alchemy vault, runes of purification are carved into the walls. A basin holds ${item1.A} liters of sacred elixir, to be poured into mithril vials of ${item1.B} liters each. Calculate the total number of full vials to unlock the mechanism!`,
      question_zh: `有一桶 ${item1.A} 公升的聖水，每 ${item1.B} 公升裝成一瓶，一共可以裝成幾瓶？`,
      question_en: `There are ${item1.A} liters of elixir. Each vial holds ${item1.B} liters. How many vials can be filled in total?`,
      targetNumber: item1.Q,
      displayAnswer: `${item1.Q}`,
      unit_zh: '瓶',
      unit_en: 'vials',
      notebook_zh: `【染血筆記・分裝之謎】\n• 計算思維：${item1.A} ÷ ${item1.B}。\n• 直式小數點移位：除數 ${item1.B} 往右移 1 位變成整數，被除數 ${item1.A} 也要向右移 1 位並補 0（即看成 ${item1.A * 10} ÷ ${item1.B * 10}）。\n• 算出的整數商，請撥入個位與十位！`,
      notebook_en: `[Alchemist's Notes]\n• Formula: ${item1.A} ÷ ${item1.B}.\n• Decimal Shift: Shift the divisor's point 1 place right to make it an integer. Shift the dividend 1 place right and pad with 0 (calculate as ${item1.A * 10} ÷ ${item1.B * 10}).`,
      diagramType: 'division',
      diagramData: { dividend: item1.A, divisor: item1.B, quotient: item1.Q, remainder: null }
    });

    // -------------------------------------------------------------
    // 第 2 題：秘銀與碎晶之秤 (4-1 整數 ÷ 兩位小數，商為一位小數) P.55
    // -------------------------------------------------------------
    const pool2 = [
      { A: 5, B: 0.08, Q: 62.5 },
      { A: 3, B: 0.08, Q: 37.5 },
      { A: 6, B: 0.16, Q: 37.5 },
      { A: 7, B: 0.08, Q: 87.5 },
      { A: 9, B: 0.08, Q: 112.5 },
      { A: 4, B: 0.32, Q: 12.5 },
      { A: 6, B: 0.24, Q: 25.0 }
    ];
    const item2 = this.rng.pickOne(pool2);
    chambers.push({
      id: 'ch_mithril_shard',
      baseName_zh: '秘銀與碎晶之天秤',
      baseName_en: 'Scale of Mithril and Shards',
      chapter_ref: '六上康軒數學 P.55【除數為兩位小數】',
      story_zh: `賢者天秤兩端放置著不同的鍊金重物：左側是一塊重達 ${item2.A} 公斤的古代秘銀原石，右側是一堆微光碎晶，每顆微光碎晶僅重 ${item2.B} 公斤。機關要求輸入原石重量是微光碎晶的幾倍！`,
      story_en: `On the scale of equilibrium rests an ancient mithril stone weighing ${item2.A} kg. Next to it are glowing crystal shards weighing ${item2.B} kg each. Calculate how many times heavier the mithril stone is compared to a single shard!`,
      question_zh: `一顆秘銀原石重 ${item2.A} 公斤，一顆微光碎晶重 ${item2.B} 公斤，秘銀原石的重量是一顆碎晶的幾倍？`,
      question_en: `A mithril stone weighs ${item2.A} kg, and a shard weighs ${item2.B} kg. How many times heavier is the stone than the shard?`,
      targetNumber: item2.Q,
      displayAnswer: `${item2.Q}`,
      unit_zh: '倍',
      unit_en: 'times',
      notebook_zh: `【染血筆記・兩位小數之除】\n• 算式：${item2.A} ÷ ${item2.B}。\n• 除數 ${item2.B} 有兩位小數，向右移 2 位變成整數；被除數 ${item2.A} 必須同時向右移 2 位補兩個 0（例如 ${item2.A * 100} ÷ ${item2.B * 100}）！\n• 商的小數點要對齊被除數的新小數點，答案請撥出小數點與十分位！`,
      notebook_en: `[Alchemist's Notes]\n• Equation: ${item2.A} ÷ ${item2.B}.\n• Two decimal places: Move divisor's point 2 places right. Move dividend's point 2 places right by appending two zeros (${item2.A * 100} ÷ ${item2.B * 100}).`,
      diagramType: 'division',
      diagramData: { dividend: item2.A, divisor: item2.B, quotient: item2.Q, remainder: null }
    });

    // -------------------------------------------------------------
    // 第 3 題：龍骨魔杖的切割柱 (4-2 小數 ÷ 同位小數，商為整數) P.56
    // -------------------------------------------------------------
    const pool3 = [
      { A: 2.8, B: 0.4, Q: 7 },
      { A: 4.8, B: 0.6, Q: 8 },
      { A: 6.3, B: 0.7, Q: 9 },
      { A: 9.6, B: 0.8, Q: 12 },
      { A: 4.5, B: 0.3, Q: 15 },
      { A: 5.6, B: 0.4, Q: 14 }
    ];
    const item3 = this.rng.pickOne(pool3);
    chambers.push({
      id: 'ch_dragon_bone',
      baseName_zh: '龍骨魔杖的切割柱',
      baseName_en: 'Cutting Column of Dragon Bone',
      chapter_ref: '六上康軒數學 P.56【小數 ÷ 同位小數】',
      story_zh: `一道由雷電鎖鏈封住的通道前，橫陳著一根長達 ${item3.A} 公尺的古龍脊骨魔杖。中央法陣需要將其以每 ${item3.B} 公尺精準切割為一段作為傳導法杖，一共能切成幾段？`,
      story_en: `Before a corridor barred by lightning chains lies an ancient dragon bone staff measuring ${item3.A} meters. The ritual requires cutting it into segments of ${item3.B} meters each. How many segments can be cut?`,
      question_zh: `有一根長 ${item3.A} 公尺的龍骨魔杖，每 ${item3.B} 公尺切成一段，一共可以切成幾段？`,
      question_en: `A dragon bone staff is ${item3.A} meters long. Each segment is ${item3.B} meters. How many segments can it be cut into?`,
      targetNumber: item3.Q,
      displayAnswer: `${item3.Q}`,
      unit_zh: '段',
      unit_en: 'segments',
      notebook_zh: `【染血筆記・同位小數相除】\n• 算式：${item3.A} ÷ ${item3.B}。\n• 因為被除數與除數都只有一位小數，雙方小數點同時向右移動 1 位，直接轉化為整數相除（即 ${Math.round(item3.A * 10)} ÷ ${Math.round(item3.B * 10)}）！`,
      notebook_en: `[Alchemist's Notes]\n• Formula: ${item3.A} ÷ ${item3.B}.\n• Both have 1 decimal place: Move both decimal points 1 place right into integers (${Math.round(item3.A * 10)} ÷ ${Math.round(item3.B * 10)}).`,
      diagramType: 'division',
      diagramData: { dividend: item3.A, divisor: item3.B, quotient: item3.Q, remainder: null }
    });

    // -------------------------------------------------------------
    // 第 4 題：雙重包裝的秘藥箱 (4-2 小數 ÷ 異位小數，商為小數) P.57
    // -------------------------------------------------------------
    const pool4 = [
      { A: 4.25, B: 2.5, Q: 1.7 },
      { A: 4.75, B: 2.5, Q: 1.9 },
      { A: 2.88, B: 1.6, Q: 1.8 },
      { A: 6.0, B: 2.4, Q: 2.5 },
      { A: 38.1, B: 5.08, Q: 7.5 },
      { A: 3.64, B: 1.3, Q: 2.8 }
    ];
    const item4 = this.rng.pickOne(pool4);
    chambers.push({
      id: 'ch_lead_box',
      baseName_zh: '雙重包裝的秘藥箱',
      baseName_en: 'Dual Chests of Secret Elixir',
      chapter_ref: '六上康軒數學 P.57【小數 ÷ 異位小數】',
      story_zh: `密室中陳列著大、小兩種規格的抗腐蝕黑鉛密封箱。大密封箱裝滿暗影粉末重達 ${item4.A} 公斤，小密封箱重 ${item4.B} 公斤。大箱重量是小箱的幾倍？注意小數位數不同的移位法則！`,
      story_en: `Two lead chests stand before the iron gate. The large chest weighs ${item4.A} kg, and the small chest weighs ${item4.B} kg. How many times heavier is the large chest compared to the small one?`,
      question_zh: `大密封箱重 ${item4.A} 公斤，小密封箱重 ${item4.B} 公斤，大箱的重量是小箱的幾倍？`,
      question_en: `A large chest weighs ${item4.A} kg, and a small chest weighs ${item4.B} kg. How many times heavier is the large chest?`,
      targetNumber: item4.Q,
      displayAnswer: `${item4.Q}`,
      unit_zh: '倍',
      unit_en: 'times',
      notebook_zh: `【染血筆記・異位小數關鍵】\n• 算式：${item4.A} ÷ ${item4.B}。\n• ★ 核心法則：先將「除數」變成整數！除數向右移幾位，被除數就跟著向右移幾位。\n• ★ 商的小數點要和被除數的「新小數點」對齊！`,
      notebook_en: `[Alchemist's Notes]\n• Equation: ${item4.A} ÷ ${item4.B}.\n• Rule: First convert the DIVISOR into an integer by shifting its point. Shift the dividend by the same number of places.\n• Align the quotient's point with the NEW point!`,
      diagramType: 'division',
      diagramData: { dividend: item4.A, divisor: item4.B, quotient: item4.Q, remainder: null }
    });

    // -------------------------------------------------------------
    // 第 5 題：魔導銅管的線密度 (4-3 應用題，單位長度重量) P.59
    // -------------------------------------------------------------
    const pool5 = [
      { L: 0.6, W: 4.5, Q: 7.5 },
      { L: 0.8, W: 5.2, Q: 6.5 },
      { L: 0.4, W: 3.8, Q: 9.5 },
      { L: 0.5, W: 4.25, Q: 8.5 },
      { L: 1.2, W: 8.4, Q: 7.0 },
      { L: 0.75, W: 6.3, Q: 8.4 }
    ];
    const item5 = this.rng.pickOne(pool5);
    chambers.push({
      id: 'ch_copper_pipe',
      baseName_zh: '魔導銅管的線密度之門',
      baseName_en: 'Linear Density of Conduit Pipes',
      chapter_ref: '六上康軒數學 P.59【應用題：求 1 單位重量】',
      story_zh: `工坊上方管線錯綜複雜。維修閘門需要替換一根 1 公尺長的標準能量導管。檢測儀顯示一條長 ${item5.L} 公尺的導管總重量為 ${item5.W} 公斤。求同樣規格的導管長 1 公尺時重多少公斤？`,
      story_en: `The conduits above hum with pressure. To balance the main valve, you need the weight of a standard 1-meter conduit. A section measuring ${item5.L} meters weighs ${item5.W} kg. What is the weight of 1 meter of this pipe?`,
      question_zh: `有一條長 ${item5.L} 公尺的魔導銅管重 ${item5.W} 公斤，同樣的銅管長 1 公尺重多少公斤？`,
      question_en: `A conduit pipe measuring ${item5.L} meters weighs ${item5.W} kg. How much does 1 meter of the same pipe weigh in kg?`,
      targetNumber: item5.Q,
      displayAnswer: `${item5.Q}`,
      unit_zh: '公斤',
      unit_en: 'kg',
      notebook_zh: `【染血筆記・單位量求法】\n• 算式：總重量 ÷ 總長度 ＝ ${item5.W} ÷ ${item5.L}。\n• 注意：要求 1 公尺重量，被除數必須放「重量 (${item5.W}kg)」，除數放「長度 (${item5.L}m)」，千萬別放顛倒了！`,
      notebook_en: `[Alchemist's Notes]\n• Formula: Total Weight ÷ Total Length = ${item5.W} ÷ ${item5.L}.\n• Dividend is Weight, Divisor is Length. Do not invert!`,
      diagramType: 'division',
      diagramData: { dividend: item5.W, divisor: item5.L, quotient: item5.Q, remainder: null }
    });

    // -------------------------------------------------------------
    // 第 6 題：靈能溶液的純度刻度 (4-3 應用題，單位容量含量) P.59
    // -------------------------------------------------------------
    const pool6 = [
      { V: 0.65, S: 76.7, Q: 118 },
      { V: 0.45, S: 55.8, Q: 124 },
      { V: 0.85, S: 112.2, Q: 132 },
      { V: 0.75, S: 106.5, Q: 142 },
      { V: 0.35, S: 54.6, Q: 156 },
      { V: 0.55, S: 85.8, Q: 156 }
    ];
    const item6 = this.rng.pickOne(pool6);
    chambers.push({
      id: 'ch_aether_purity',
      baseName_zh: '靈能溶液的純度刻度',
      baseName_en: 'Purity Gauge of Aether Solution',
      chapter_ref: '六上康軒數學 P.59【應用題：求 1 公升含量】',
      story_zh: `鍊金釜旁的調配手冊記錄著純度刻度。一瓶容量為 ${item6.V} 公升的濃縮以太試劑中，蘊含了 ${item6.S} 公克的純淨以太晶體。若調配整整 1 公升的標準試劑，含有的以太晶體是多少公克？`,
      story_en: `The alchemist's ledger notes the reagent concentration. A bottle of ${item6.V} liters contains ${item6.S} grams of crystallized aether. How many grams of aether are in 1 full liter of this identical solution?`,
      question_zh: `一瓶 ${item6.V} 公升的溶液含有 ${item6.S} 公克晶體，那麼 1 公升相同的溶液含有多少公克晶體？`,
      question_en: `A bottle of ${item6.V} L contains ${item6.S} g of crystal. How many grams are contained in 1 L of the same solution?`,
      targetNumber: item6.Q,
      displayAnswer: `${item6.Q}`,
      unit_zh: '公克',
      unit_en: 'grams',
      notebook_zh: `【染血筆記・濃度比例法則】\n• 算式：總結晶公克數 ÷ 溶液公升數 ＝ ${item6.S} ÷ ${item6.V}。\n• 除數 ${item6.V} 有兩位小數，雙方小數點右移兩位變整數相除。答案為三位整數，請撥入百、十、個位！`,
      notebook_en: `[Alchemist's Notes]\n• Calculation: Total grams ÷ Total liters = ${item6.S} ÷ ${item6.V}.\n• Divisor has 2 decimal places: shift right twice. The result is a 3-digit integer.`,
      diagramType: 'division',
      diagramData: { dividend: item6.S, divisor: item6.V, quotient: item6.Q, remainder: null }
    });

    // -------------------------------------------------------------
    // 第 7 題：跨國商隊的金幣匯率 (4-3 四捨五入求商到個位) P.60
    // -------------------------------------------------------------
    const pool7 = [
      { P: 108, R: 22.5, Q: 5 },
      { P: 135, R: 21.6, Q: 6 },
      { P: 295, R: 24.8, Q: 12 },
      { P: 175, R: 23.5, Q: 7 },
      { P: 220, R: 25.4, Q: 9 },
      { P: 160, R: 18.5, Q: 9 }
    ];
    const item7 = this.rng.pickOne(pool7);
    chambers.push({
      id: 'ch_gold_exchange',
      baseName_zh: '黑市商隊的匯率天秤',
      baseName_en: 'Exchange Scale of Black Market',
      chapter_ref: '六上康軒數學 P.60【四捨五入法求商到個位】',
      story_zh: `工坊密道被一具商隊收費機關鎖死。機關標價為 ${item7.P} 枚銀幣，但只接受帝國金幣。目前黑市匯率為 1 枚金幣兌換約 ${item7.R} 枚銀幣。請用「四捨五入法」求商到個位，大約需要支付幾枚金幣？`,
      story_en: `A toll gate demands empire gold coins. The fee is ${item7.P} silver coins, and the current rate is 1 gold coin = ${item7.R} silver coins. Use rounding (half up) to the nearest whole integer. How many gold coins are needed?`,
      question_zh: `標價 ${item7.P} 元，匯率 1 枚金幣約 ${item7.R} 元，大約是多少枚金幣？（用四捨五入法求商到個位）`,
      question_en: `Price is ${item7.P} silver, exchange rate is ${item7.R}. Round to the nearest whole number (ones place). How many gold coins?`,
      targetNumber: item7.Q,
      displayAnswer: `${item7.Q}`,
      unit_zh: '枚',
      unit_en: 'coins',
      notebook_zh: `【染血筆記・四捨五入到個位】\n• 算式：${item7.P} ÷ ${item7.R}。\n• ★ 重要：題目要求「求商到個位」，直式除法必須算到【小數點後第一位（十分位）】！\n• 觀察十分位：0～4 捨去，5～9 則進位到個位！`,
      notebook_en: `[Alchemist's Notes]\n• Formula: ${item7.P} ÷ ${item7.R}.\n• Critical: When rounding to the ones place, calculate to the tenths place (1st decimal) and apply rounding rules (5+ round up).`,
      diagramType: 'division',
      diagramData: { dividend: item7.P, divisor: item7.R, quotient: item7.Q, remainder: null }
    });

    // -------------------------------------------------------------
    // 第 8 題：魔導飛艇的能源消耗率 (4-3 四捨五入到小數第一位) P.60
    // -------------------------------------------------------------
    const pool8 = [
      { D: 20.1, F: 1.85, Q: 10.9 },
      { D: 25.3, F: 1.85, Q: 13.7 },
      { D: 18.4, F: 1.65, Q: 11.2 },
      { D: 22.8, F: 1.95, Q: 11.7 },
      { D: 15.6, F: 1.45, Q: 10.8 },
      { D: 26.2, F: 2.15, Q: 12.2 }
    ];
    const item8 = this.rng.pickOne(pool8);
    chambers.push({
      id: 'ch_airship_fuel',
      baseName_zh: '魔導飛艇的能耗儀表',
      baseName_en: 'Airship Fuel Gauge of Escape',
      chapter_ref: '六上康軒數學 P.60【四捨五入法求商到小數第一位】',
      story_zh: `逃生飛艇控制台被輸入鎖限制。儀表紀錄上次試飛共航行了 ${item8.D} 里，消耗了 ${item8.F} 公升的火元素燃劑。平均每 1 公升燃劑大約可航行多少里？請用四捨五入法求商到「小數點後第一位」！`,
      story_en: `The airship cockpit demands the fuel efficiency code. The flight log shows it traveled ${item8.D} miles using ${item8.F} liters of fire propellant. Round to the first decimal place (tenths). What is the average distance per liter?`,
      question_zh: `航行 ${item8.D} 里，用掉 ${item8.F} 公升燃劑。平均 1 公升燃劑大約可航行多少里？（用四捨五入法求商到小數點後第一位）`,
      question_en: `Traveled ${item8.D} miles using ${item8.F} L of fuel. Calculate average miles per liter, rounded to the 1st decimal place.`,
      targetNumber: item8.Q,
      displayAnswer: `${item8.Q}`,
      unit_zh: '里',
      unit_en: 'miles',
      notebook_zh: `【染血筆記・四捨五入到小數第一位】\n• 算式：總里數 ÷ 總公升數 ＝ ${item8.D} ÷ ${item8.F}。\n• ★ 重要：題目要求「求商到小數第一位」，除法直式必須算到【小數點後第二位（百分位）】！\n• 百分位如果是 5、6、7、8、9 就要進位！`,
      notebook_en: `[Alchemist's Notes]\n• Calculation: Total miles ÷ Total liters = ${item8.D} ÷ ${item8.F}.\n• Critical: To round to the tenths place, you MUST divide until the hundredths place (2nd decimal) to decide whether to round up or down!`,
      diagramType: 'division',
      diagramData: { dividend: item8.D, divisor: item8.F, quotient: item8.Q, remainder: null }
    });

    // -------------------------------------------------------------
    // 第 9 題：雙子幾何傳送陣 (P.63 綜合題：平行四邊形面積等於長方形求寬)
    // -------------------------------------------------------------
    const pool9 = [
      { B: 5, H: 3.15, L: 6.3, W: 2.5 },
      { B: 4, H: 4.25, L: 6.8, W: 2.5 },
      { B: 6, H: 2.45, L: 4.2, W: 3.5 },
      { B: 8, H: 1.75, L: 5.6, W: 2.5 },
      { B: 5, H: 2.88, L: 4.5, W: 3.2 },
      { B: 7, H: 3.24, L: 5.4, W: 4.2 }
    ];
    const item9 = this.rng.pickOne(pool9);
    const area9 = Math.round(item9.B * item9.H * 100) / 100;
    chambers.push({
      id: 'ch_geometry_gate',
      baseName_zh: '雙子幾何共鳴傳送陣',
      baseName_en: 'Resonance Array of Dual Geometries',
      chapter_ref: '六上康軒數學 P.63【綜合題：小數面積應用】',
      story_zh: `地面雕刻著兩座共鳴魔法陣：一座為平行四邊形（底 ${item9.B} 公尺、高 ${item9.H} 公尺），另一座為長方形（長度為 ${item9.L} 公尺）。古代守護者宣告兩座法陣的面積完全相等！長方形法陣的寬度是多少公尺？`,
      story_en: `Two resonant arrays are carved into the floor: a parallelogram (base ${item9.B}m, height ${item9.H}m) and a rectangle (length ${item9.L}m). Both shapes possess identical area. What is the width of the rectangle in meters?`,
      question_zh: `平行四邊形（底 ${item9.B} 公尺，高 ${item9.H} 公尺）和長方形面積相同，長方形的長是 ${item9.L} 公尺，寬是多少公尺？`,
      question_en: `A parallelogram (base ${item9.B}m, height ${item9.H}m) has the same area as a rectangle of length ${item9.L}m. What is the width of the rectangle?`,
      targetNumber: item9.W,
      displayAnswer: `${item9.W}`,
      unit_zh: '公尺',
      unit_en: 'meters',
      notebook_zh: `【染血筆記・幾何面積等量】\n• 第一步：求出平行四邊形面積 ＝ 底 × 高 ＝ ${item9.B} × ${item9.H} ＝ ${area9} 平方公尺。\n• 第二步：長方形面積 ＝ 長 × 寬，因此 寬 ＝ 面積 ÷ 長 ＝ ${area9} ÷ ${item9.L}。\n• 撥動小數輪盤，撥出正確寬度！`,
      notebook_en: `[Alchemist's Notes]\n• Step 1: Parallelogram Area = Base × Height = ${item9.B} × ${item9.H} = ${area9} sq meters.\n• Step 2: Rectangle Width = Area ÷ Length = ${area9} ÷ ${item9.L}.`,
      diagramType: 'geometry',
      diagramData: { base: item9.B, height: item9.H, rectLength: item9.L, rectWidth: item9.W }
    });

    // -------------------------------------------------------------
    // 第 10 題：賢者之血的終極提煉 (P.64-65 魔王關：有餘數小數除法求剩餘量！)
    // -------------------------------------------------------------
    const pool10 = [
      { A: 44.9, B: 1.6, Q: 28, R: 0.1 },
      { A: 12.0, B: 1.8, Q: 6, R: 1.2 },
      { A: 14.1, B: 2.15, Q: 6, R: 1.2 },
      { A: 35.8, B: 2.4, Q: 14, R: 2.2 },
      { A: 25.5, B: 1.4, Q: 18, R: 0.3 },
      { A: 18.5, B: 1.2, Q: 15, R: 0.5 }
    ];
    const item10 = this.rng.pickOne(pool10);
    chambers.push({
      id: 'ch_boss_philosopher_blood',
      baseName_zh: '賢者之血的終極提煉 (魔王脫出)',
      baseName_en: 'Refinement of Philosopher Blood (Boss Escape)',
      chapter_ref: '六上康軒數學 P.64-65【數學想一想：有餘數的小數除法】',
      story_zh: `【終極脫出關卡】巨大的黑鐵鍋爐正沸騰著 ${item10.A} 公升的賢者之血靈液，要分裝到標準水晶瓶中，每瓶容積為 ${item10.B} 公升。鍋爐在裝滿 ${item10.Q} 瓶之後，底部還殘留了劇毒的魔性殘渣。機關巨鎖需要輸入【最後殘留的殘渣是多少公升】來中和毒氣！注意小數點對齊！`,
      story_en: `[Final Boss Escape] The massive iron crucible boils ${item10.A} liters of philosopher elixir, filled into crystals of ${item10.B} liters each. After filling ${item10.Q} complete vials, what is the exact volume of residue left in liters? Align the decimal point carefully!`,
      question_zh: `有 ${item10.A} 公升的靈液，每 ${item10.B} 公升裝成一瓶，最多可以裝滿 ${item10.Q} 瓶，還剩下幾公升的殘渣？請將剩下的公升數輸入密碼鎖！`,
      question_en: `There are ${item10.A} liters of elixir, filled into ${item10.B} L vials. After filling ${item10.Q} full vials, how many liters remain as residue? Enter the remainder into the lock!`,
      targetNumber: item10.R,
      displayAnswer: `${item10.R}`,
      unit_zh: '公升',
      unit_en: 'liters',
      notebook_zh: `【染血筆記・餘數小數點的致命陷阱】\n• 算式：${item10.A} ÷ ${item10.B} ＝ ${item10.Q} 瓶 ⋯⋯ 剩下 ？ 公升。\n• ★★★ 全單元最重要觀念：做除數是小數的除法時，【餘數的小數點要和被除數的「原小數點」對齊】！\n• 直式最下方雖然算出的數字是整數，但餘數是 ${item10.R} 公升，絕對不是 ${Math.round(item10.R * 10)} 公升！請在輪盤上將 ${item10.R} 撥入正確小數位！`,
      notebook_en: `[Alchemist's Notes]\n• Equation: ${item10.A} ÷ ${item10.B} = ${item10.Q} vials remainder ? L.\n• ★ CRITICAL TRAP: The decimal point of the REMAINDER must align with the ORIGINAL decimal point of the dividend!\n• The residue is ${item10.R} liters, NOT ${Math.round(item10.R * 10)} liters! Align with the anchor gem accurately!`,
      diagramType: 'beaker',
      diagramData: { totalVol: item10.A, bottleVol: item10.B, bottlesCount: item10.Q, remainderVol: item10.R }
    });

    return chambers;
  }

  // 2. 隨機洗牌並動態賦予第一密室～第十密室 (魔王脫出) 標題
  generateAllChambers(customOrder = null) {
    const rawList = this.generateRawChambers();
    let order = customOrder;

    if (!order || !Array.isArray(order) || order.length !== rawList.length) {
      order = this.rng.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    }

    const zhNumNames = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

    const formattedChambers = order.map((origIdx, stepIdx) => {
      const q = rawList[origIdx];
      const isBoss = (stepIdx === rawList.length - 1);

      const title_zh = isBoss 
        ? `第十密室 (魔王脫出)：${q.baseName_zh}`
        : `第${zhNumNames[stepIdx]}密室：${q.baseName_zh}`;

      const title_en = isBoss
        ? `Chamber 10 (Boss Escape): ${q.baseName_en}`
        : `Chamber ${stepIdx + 1}: ${q.baseName_en}`;

      return {
        ...q,
        stepIndex: stepIdx,
        title_zh,
        title_en,
        stageBadge_zh: `關卡 ${stepIdx + 1} / 10`,
        stageBadge_en: `Chamber ${stepIdx + 1} / 10`
      };
    });

    return {
      chambers: formattedChambers,
      order: order
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AlchemistQuestionEngine;
}
