/**
 * 題庫與動態參數產生器 (Question & Parameter Generator)
 * 100% 依據康軒六上第 03 單元《數量關係》(P.38 ~ P.51) 設計
 * 完整支援繁體中文 (zh) 與英文 (en) 雙語獨立切換，絕不採中英混雜排版
 */

class DungeonChamber {
  constructor(data) {
    Object.assign(this, data);
  }

  getTitle(lang = 'zh') { return lang === 'en' ? this.title_en : this.title_zh; }
  getSubtitle(lang = 'zh') { return lang === 'en' ? this.subtitle_en : this.subtitle_zh; }
  getConcept(lang = 'zh') { return lang === 'en' ? this.concept_en : this.concept_zh; }
  getLore(lang = 'zh') { return lang === 'en' ? this.lore_en : this.lore_zh; }
  getStory(lang = 'zh') { return lang === 'en' ? this.story_en : this.story_zh; }
  getTargetQuestion(lang = 'zh') { return lang === 'en' ? this.targetQuestion_en : this.targetQuestion_zh; }
  getHints(lang = 'zh') { return lang === 'en' ? this.hints_en : this.hints_zh; }
}

class DungeonQuestionEngine {
  constructor(seed = '601-01') {
    this.rng = new SeededRandom(seed);
    this.seed = seed;
  }

  static gcd(a, b) {
    while (b !== 0) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  }

  static formatCode(num) {
    const n = Math.round(Number(num));
    return String(n).padStart(4, '0');
  }

  generateAllChambers(customOrder = null) {
    this.rng.reset();
    const rawList = [
      this._genChamber1(),
      this._genChamber2(),
      this._genChamber3(),
      this._genChamber4(),
      this._genChamber5(),
      this._genChamber6(),
      this._genChamber7(),
      this._genChamber8(),
      this._genChamber9(),
      this._genChamber10()
    ];

    let chamberList = [];

    if (Array.isArray(customOrder) && customOrder.length === rawList.length) {
      // 依據儲存的順序排列 (延續先前進度)
      const map = new Map(rawList.map(c => [c.id, c]));
      chamberList = customOrder.map(id => map.get(id) || rawList[0]);
    } else {
      // 每次進入密室隨機打亂答題順序 (Fisher-Yates 隨機洗牌)
      chamberList = [...rawList];
      for (let i = chamberList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chamberList[i], chamberList[j]] = [chamberList[j], chamberList[i]];
      }
    }

    // 依據洗牌後的實際答題順序，動態更新各密室之標題序號
    const zhNums = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    return chamberList.map((data, idx) => {
      const stageNo = idx + 1;
      const isFinal = (stageNo === chamberList.length);
      const chamber = new DungeonChamber(data);
      chamber.stageIndex = stageNo;

      // 提取核心主題名稱並重新賦予序號
      const baseTitleZh = (data.title_zh || '').replace(/^第[一二三四五六七八九十0-9]+密室(\s*\(魔王脫出\))?：/, '');
      const baseTitleEn = (data.title_en || '').replace(/^Chamber\s*[0-9]+(\s*\(Boss Escape\))?:\s*/, '');

      chamber.title_zh = isFinal 
        ? `第${zhNums[idx]}密室 (魔王脫出)：${baseTitleZh}`
        : `第${zhNums[idx]}密室：${baseTitleZh}`;

      chamber.title_en = isFinal
        ? `Chamber ${stageNo} (Boss Escape): ${baseTitleEn}`
        : `Chamber ${stageNo}: ${baseTitleEn}`;

      return chamber;
    });
  }

  // -------------------------------------------------------------
  // 第 1 室：【3-1】血色圖騰的週期 (P.40 週期問題)
  // -------------------------------------------------------------
  _genChamber1() {
    const runes = [
      { name: '血滴印', enName: 'Blood Rune', symbol: '🩸' },
      { name: '暗影骷髏', enName: 'Shadow Skull', symbol: '💀' },
      { name: '毒蠍符', enName: 'Venom Scorpion', symbol: '🦂' },
      { name: '幽魂魔眼', enName: 'Phantom Eye', symbol: '👁️' }
    ];
    const targetIdx = this.rng.int(0, 3);
    const targetRune = runes[targetIdx];

    const baseGroups = this.rng.int(10, 18);
    const remainder = this.rng.int(1, 3);
    const totalCount = baseGroups * 4 + remainder;

    let targetOccurrences = baseGroups;
    if (remainder > targetIdx) {
      targetOccurrences += 1;
    }
    const answerCode = DungeonQuestionEngine.formatCode(targetOccurrences);

    return {
      id: 1,
      title_zh: '第一密室：血色圖騰的週期循環',
      title_en: 'Chamber 1: The Cyclic Blood Totems',
      subtitle_zh: '3-1 圖形和數形的規律・週期問題',
      subtitle_en: '3-1 Patterns of Shapes and Numbers: Periodic Cycles',
      concept_zh: '總數 ÷ 週期 ＝ 完整組數 ⋯ 餘數',
      concept_en: 'Total count ÷ Period = Completed cycles ... Remainder',
      lore_zh: '你來到幽暗的圖騰迴廊，石壁上刻滿了周而復始的咒印。唯有破解符號累積的次數，石鎖才能開啟！',
      lore_en: 'You enter a dim corridor inscribed with repeating ancient runes. Only by determining how many times a specific rune appears can the stone lock be unsealed!',
      story_zh: `石壁上的咒印按照【🩸血滴印、💀暗影骷髏、🦂毒蠍符、👁️幽魂魔眼】以 4 個為一組重複排列。
守門惡靈在羊皮紙上寫著：『整道長廊共刻下了 <strong>${totalCount}</strong> 個咒印。若你想解開石門，請精確算出其中<strong>【${targetRune.symbol} ${targetRune.name}】</strong>一共出現了幾次？』`,
      story_en: `The wall runes repeat in groups of 4: [🩸 Blood Rune, 💀 Shadow Skull, 🦂 Venom Scorpion, 👁️ Phantom Eye].
The dungeon spirit writes on parchment: "A total of <strong>${totalCount}</strong> runes are carved along the hall. To unlock the seal, calculate how many times the <strong>[${targetRune.symbol} ${targetRune.enName}]</strong> appears in total."`,
      targetQuestion_zh: `共刻下 ${totalCount} 個咒印，【${targetRune.symbol} ${targetRune.name}】共出現幾次？`,
      targetQuestion_en: `Out of ${totalCount} runes, how many times does [${targetRune.symbol} ${targetRune.enName}] appear?`,
      lockType: 'dial4',
      correctAnswer: targetOccurrences,
      correctCode: answerCode,
      hints_zh: [
        `咒印每 4 個為一組重複循環。`,
        `先算完整組數與餘數：${totalCount} ÷ 4 ＝ ？ 組 ⋯ 餘 ？ 個。`,
        `每組中都有 1 個【${targetRune.name}】，前 ${baseGroups} 組有 ${baseGroups} 次，再加上剩下的餘數中是否還有它！`
      ],
      hints_en: [
        `The runes repeat in a cycle of 4.`,
        `First find completed groups and remainder: ${totalCount} ÷ 4 = ? groups remainder ? runes.`,
        `Each full group has 1 [${targetRune.enName}]. Calculate total in full groups, then see if the remainder contains another one!`
      ],
      diagramType: 'runes',
      diagramData: {
        pattern: ['🩸', '💀', '🦂', '👁️'],
        targetSymbol: targetRune.symbol,
        total: totalCount,
        groups: baseGroups,
        rem: remainder,
        occurrences: targetOccurrences
      }
    };
  }

  // -------------------------------------------------------------
  // 第 2 室：【3-1】骸骨牢籠的幾何生長 (P.41/50 骨杖生長公差)
  // -------------------------------------------------------------
  _genChamber2() {
    const isTriangle = this.rng.int(0, 1) === 0;
    const n = this.rng.int(12, 26);
    let totalSticks = 0;
    let shapeName = '';
    let shapeNameEn = '';
    let shapeNameEnPlural = '';
    let formula = '';

    if (isTriangle) {
      shapeName = '三角形骨牢';
      shapeNameEn = 'triangle cage';
      shapeNameEnPlural = 'triangle cages';
      totalSticks = 1 + 2 * n;
      formula = `1 ＋ 2 × ${n} ＝ ${totalSticks}`;
    } else {
      shapeName = '正方形鐵囚';
      shapeNameEn = 'square cage';
      shapeNameEnPlural = 'square cages';
      totalSticks = 1 + 3 * n;
      formula = `1 ＋ 3 × ${n} ＝ ${totalSticks}`;
    }
    const answerCode = DungeonQuestionEngine.formatCode(totalSticks);

    return {
      id: 2,
      title_zh: '第二密室：骸骨牢籠的幾何生長',
      title_en: 'Chamber 2: Geometric Growth of Skeletal Cages',
      subtitle_zh: '3-1 圖形和數形的規律・幾何邊長累加',
      subtitle_en: '3-1 Patterns of Shapes and Numbers: Geometric Stick Growth',
      concept_zh: '每多排 1 個圖形，共用公共邊，找出生長公差規律',
      concept_en: 'Each extra cage shares an edge; find the common difference pattern',
      lore_zh: '眼前是散落一地的受詛咒獸骨。邪惡法師利用骨棒拼接成連續的牢籠，你必須找出第 N 個牢籠所需的骨棒總數！',
      lore_en: 'Cursed beast bones lie scattered across the room. The sorcerer joins rods into continuous cages; you must determine the total rods needed!',
      story_zh: `法師用骨杖排成一整排相連的<strong>【${shapeName}】</strong>：
排 1 個用 ${isTriangle ? '3' : '4'} 根骨杖，排 2 個用 ${isTriangle ? '5' : '7'} 根骨杖，排 3 個用 ${isTriangle ? '7' : '10'} 根⋯⋯
若要排出包含 <strong>${n} 個</strong>相連${shapeName}的終極大囚籠，總共需要消耗幾根骨杖？`,
      story_en: `The sorcerer arranges bone rods into a continuous row of <strong>[${shapeNameEnPlural}]</strong>:
1 cage requires ${isTriangle ? '3' : '4'} rods, 2 cages require ${isTriangle ? '5' : '7'} rods, 3 cages require ${isTriangle ? '7' : '10'} rods...
To build a continuous structure containing <strong>${n}</strong> ${shapeNameEnPlural}, how many rods are required in total?`,
      targetQuestion_zh: `排出連續 ${n} 個${shapeName}，共需幾根骨杖？`,
      targetQuestion_en: `To build ${n} connected ${shapeNameEnPlural}, how many rods are needed?`,
      lockType: 'dial4',
      correctAnswer: totalSticks,
      correctCode: answerCode,
      hints_zh: [
        `觀察規律：相連的籠子會共用骨杖！`,
        isTriangle 
          ? `每多排 1 個三角形多 2 根骨杖。公式引導：1 ＋ 2 × ${n} ＝ ？（請動手計算）`
          : `每多排 1 個正方形多 3 根骨杖。公式引導：1 ＋ 3 × ${n} ＝ ？（請動手計算）`,
        `千萬不要直接用 ${n} × ${isTriangle ? 3 : 4}，因為相鄰的邊是共用的！`
      ],
      hints_en: [
        `Notice the pattern: connected cages share common rods!`,
        isTriangle 
          ? `Each extra triangle adds 2 rods. Formula: 1 + 2 × ${n} = ? (Calculate the total)`
          : `Each extra square adds 3 rods. Formula: 1 + 3 × ${n} = ? (Calculate the total)`,
        `Do not simply multiply by ${isTriangle ? 3 : 4}, because adjacent edges are shared!`
      ],
      diagramType: 'matchsticks',
      diagramData: { isTriangle, count: n, result: totalSticks, formula }
    };
  }

  // -------------------------------------------------------------
  // 第 3 室：【3-2】雙子血月的平衡 (P.42 和不變：晝夜24hr)
  // -------------------------------------------------------------
  _genChamber3() {
    const dayOptions = [7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12.5, 13, 13.5];
    const daylight = this.rng.choice(dayOptions);
    const night = Number((24 - daylight).toFixed(1));

    const rawVal = night % 1 === 0 ? night : Math.round(night * 10);
    const answerCode = DungeonQuestionEngine.formatCode(rawVal);

    return {
      id: 3,
      title_zh: '第三密室：雙子血月的平衡之秤',
      title_en: 'Chamber 3: Scales of the Blood Moon Twins',
      subtitle_zh: '3-2 和差積商不變・和不變關係',
      subtitle_en: '3-2 Invariant Quantities: Sum Invariant',
      concept_zh: '白晝 ＋ 黑夜 ＝ 24 小時（和固定為 24）',
      concept_en: 'Daylight + Darkness = 24 hours (Sum is invariant at 24)',
      lore_zh: '這座石殿內聳立著太陽與暗夜雙子石雕。黑魔法結界限定：一天之內，日光與暗夜的能量總和恆為 24 單位。',
      lore_en: 'Two statues of twin deities overlook the altar. The magical covenant states: within a day, daylight and darkness energy always sum to 24 units.',
      story_zh: `封印天秤的古老銘文記載：『一日之運轉，白晝與黑夜相加恆為 24 時。』
地牢守衛觀測到今日外界的白晝時數為 <strong>${daylight} 小時</strong>。
黑夜石雕必須注入對應的黑夜時數魔力方能解鎖！請問黑夜占了多少小時？（若為小數如 13.5，密碼請輸入 0135；若為整數如 13，請輸入 0013）`,
      story_en: `Ancient inscriptions on the scales record: "In the cycle of a day, daylight and darkness sum to 24 hours."
The guard observed that today's daylight is <strong>${daylight} hours</strong>.
To balance the scales, how many hours of darkness must be imbued? (If decimal like 13.5, enter 0135; if integer like 13, enter 0013).`,
      targetQuestion_zh: `白晝 ${daylight} 小時，黑夜占幾小時？（例: 13.5輸0135，13輸0013）`,
      targetQuestion_en: `Daylight is ${daylight} hrs. How many hours of darkness? (e.g. 13.5 enter 0135, 13 enter 0013)`,
      lockType: 'dial4',
      correctAnswer: night,
      correctCode: answerCode,
      hints_zh: [
        `一天永遠是 24 小時，白晝 ＋ 黑夜 ＝ 24。`,
        `算式方向：24 － ${daylight} ＝ ？（請動手計算黑夜是幾小時）`,
        `小心小數點借位計算！`
      ],
      hints_en: [
        `A full day is 24 hours: Daylight + Darkness = 24.`,
        `Calculation: 24 - ${daylight} = ? (Calculate the hours of darkness).`,
        `Be careful with decimal borrowing!`
      ],
      diagramType: 'sumInvariant',
      diagramData: { total: 24, partA: daylight, partB: night }
    };
  }

  // -------------------------------------------------------------
  // 第 4 室：【3-2】詛咒幽靈的永恆歲月 (P.43 差不變：年齡差)
  // -------------------------------------------------------------
  _genChamber4() {
    const diff = this.rng.choice([24, 26, 28, 30, 32]);
    const elderCurrent = this.rng.int(45, 60);
    const youngerCurrent = elderCurrent - diff;
    const futureYears = this.rng.int(10, 25);
    const elderFuture = elderCurrent + futureYears;
    const youngerFuture = elderFuture - diff;

    const answerCode = DungeonQuestionEngine.formatCode(youngerFuture);

    return {
      id: 4,
      title_zh: '第四密室：詛咒幽靈的永恆歲月',
      title_en: 'Chamber 4: Eternal Years of Cursed Phantoms',
      subtitle_zh: '3-2 和差積商不變・差不變關係',
      subtitle_en: '3-2 Invariant Quantities: Difference Invariant',
      concept_zh: '不論經過幾年，兩人的年齡差距永遠不變',
      concept_en: 'Age difference between two persons remains invariant over time',
      lore_zh: '兩具被封印在此的幽靈學者正在無休止地爭辯著歲月。時光的詛咒雖然在流動，但他們的年齡差永遠定格！',
      lore_en: 'Two sealed phantoms argue ceaselessly over their ages. While time moves forward, their age difference is locked forever!',
      story_zh: `幽靈法師嘆息：『今年我 <strong>${elderCurrent} 歲</strong>，我的侍從 <strong>${youngerCurrent} 歲</strong>。』
地牢上的骷髏門鎖浮現謎題：『當未來歲月流逝，幽靈法師達到 <strong>${elderFuture} 歲</strong> 時，侍從將是多少歲？』`,
      story_en: `The phantom sorcerer sighs: "Currently, I am <strong>${elderCurrent} years old</strong>, and my apprentice is <strong>${youngerCurrent} years old</strong>."
The skull lock presents a riddle: "When the sorcerer reaches <strong>${elderFuture} years old</strong>, how old will the apprentice be?"`,
      targetQuestion_zh: `法師 ${elderCurrent} 歲、侍從 ${youngerCurrent} 歲。當法師 ${elderFuture} 歲時，侍從幾歲？`,
      targetQuestion_en: `Sorcerer is ${elderCurrent}, apprentice is ${youngerCurrent}. When sorcerer is ${elderFuture}, how old is apprentice?`,
      lockType: 'dial4',
      correctAnswer: youngerFuture,
      correctCode: answerCode,
      hints_zh: [
        `年齡問題的核心：兩人的「年齡差」永遠不會改變！`,
        `今年兩人相差：${elderCurrent} － ${youngerCurrent} ＝ ${diff} 歲。`,
        `當法師 ${elderFuture} 歲時，侍從依然比他小 ${diff} 歲：${elderFuture} － ${diff} ＝ ？（請算出侍從歲數）`
      ],
      hints_en: [
        `Core principle: age difference between two people never changes!`,
        `Current age difference: ${elderCurrent} - ${youngerCurrent} = ${diff} years.`,
        `When the sorcerer is ${elderFuture}, the apprentice is still ${diff} years younger: ${elderFuture} - ${diff} = ?`
      ],
      diagramType: 'diffInvariant',
      diagramData: { diff, elder1: elderCurrent, young1: youngerCurrent, elder2: elderFuture, young2: youngerFuture }
    };
  }

  // -------------------------------------------------------------
  // 第 5 室：【3-2】毒液水牢的逆流閥門 (P.44 積不變：反比)
  // -------------------------------------------------------------
  _genChamber5() {
    const capacity = this.rng.choice([240, 360, 480]);
    const possibleTimes = [6, 8, 10, 12, 15, 20].filter(t => capacity % t === 0);
    const targetTime = this.rng.choice(possibleTimes);
    const requiredRate = capacity / targetTime;

    const answerCode = DungeonQuestionEngine.formatCode(requiredRate);

    return {
      id: 5,
      title_zh: '第五密室：毒液水牢的逆流閥門',
      title_en: 'Chamber 5: Drain Valves of the Venom Dungeon',
      subtitle_zh: '3-2 和差積商不變・積不變關係 (反比)',
      subtitle_en: '3-2 Invariant Quantities: Product Invariant (Inverse Proportion)',
      concept_zh: '每分鐘注(排)水量 × 所需時間 ＝ 水槽總容量 (積不變)',
      concept_en: 'Drain rate per minute × Time = Total capacity (Product is invariant)',
      lore_zh: '腥臭的綠色毒水正在地底水牢急速上升！你必須調校手動排水閥門的每分鐘排毒水量，趕在限時前排空！',
      lore_en: 'Foul green venom is rising rapidly in the reservoir! You must adjust the manual drainage valve to empty it in time!',
      story_zh: `石碑紀錄了水牢排毒測試：
『若每分鐘排出 ${capacity / 24} 公升，需耗時 24 分鐘排空。此水牢之總容積恆定為 <strong>${capacity} 公升</strong>。』
警報響起！你必須在 <strong>${targetTime} 分鐘</strong> 之內徹底排空毒水拯救小隊！請問閥門每分鐘的排水量必須調校為多少公升？`,
      story_en: `A tablet notes: "At ${capacity / 24} L/min, drainage takes 24 minutes. Total capacity is constant at <strong>${capacity} liters</strong>."
An alarm sounds! You must completely drain the venom in <strong>${targetTime} minutes</strong>! What must the drainage rate per minute be set to?`,
      targetQuestion_zh: `總容積 ${capacity} 公升，若要在 ${targetTime} 分鐘排空，每分鐘需排多少公升？`,
      targetQuestion_en: `Total capacity is ${capacity} L. To drain in ${targetTime} mins, how many liters per min are needed?`,
      lockType: 'dial4',
      correctAnswer: requiredRate,
      correctCode: answerCode,
      hints_zh: [
        `此為「積不變」原理：每分鐘水量 × 時間 ＝ 總容量（${capacity} 公升）。`,
        `算式方向：總容積 ÷ 時間 ＝ ${capacity} ÷ ${targetTime} ＝ ？（請動手計算）`,
        `時間越短，每分鐘需要的排水量就必須越大！`
      ],
      hints_en: [
        `Product invariant: Rate × Time = Total capacity (${capacity} L).`,
        `Formula: Total capacity ÷ Time = ${capacity} ÷ ${targetTime} = ? liters/min.`,
        `Shorter time requires a higher drainage rate!`
      ],
      diagramType: 'prodInvariant',
      diagramData: { capacity, targetTime, requiredRate }
    };
  }

  // -------------------------------------------------------------
  // 第 6 室：【3-2】貪婪石像的魂幣代價 (P.45 商不變：正比)
  // -------------------------------------------------------------
  _genChamber6() {
    const unitPrice = this.rng.choice([12, 15, 18, 20, 25]);
    const sampleQty = this.rng.choice([4, 6, 8]);
    const sampleTotal = unitPrice * sampleQty;

    const targetQty = this.rng.choice([12, 16, 20, 24]);
    const targetTotal = unitPrice * targetQty;

    const answerCode = DungeonQuestionEngine.formatCode(targetQty);

    return {
      id: 6,
      title_zh: '第六密室：貪婪石像的魂幣代價',
      title_en: 'Chamber 6: Soul Coin Cost of the Greedy Gargoyle',
      subtitle_zh: '3-2 和差積商不變・商不變關係 (正比)',
      subtitle_en: '3-2 Invariant Quantities: Quotient Invariant (Direct Proportion)',
      concept_zh: '總金額 ÷ 數量 ＝ 每一件的單價 (商不變)',
      concept_en: 'Total cost ÷ Quantity = Unit price (Quotient is invariant)',
      lore_zh: '擋在前方的三頭地獄石像攤開雙手，索求通行魂晶。它的交易天秤恪守著絕對等價的法則。',
      lore_en: 'The three-headed gargoyle demands soul crystals. Its balance scale abides strictly by equal unit proportions.',
      story_zh: `石碑上記錄著前人交易紀錄：『購買 <strong>${sampleQty} 顆</strong>魂晶需支付 <strong>${sampleTotal} 枚</strong>暗黑幣。』
你翻開背包，身上剛好搜集到了 <strong>${targetTotal} 枚</strong>暗黑幣，若全數用來購買相同價錢的魂晶，一共可以換得幾顆魂晶？`,
      story_en: `A tablet notes: "Buying <strong>${sampleQty} soul crystals</strong> costs <strong>${sampleTotal} dark coins</strong>."
You currently possess <strong>${targetTotal} dark coins</strong>. At the same unit price, how many crystals can you acquire?`,
      targetQuestion_zh: `${sampleQty} 顆需 ${sampleTotal} 幣，手上有 ${targetTotal} 幣可換幾顆魂晶？`,
      targetQuestion_en: `${sampleQty} crystals cost ${sampleTotal} coins. How many crystals can you buy with ${targetTotal} coins?`,
      lockType: 'dial4',
      correctAnswer: targetQty,
      correctCode: answerCode,
      hints_zh: [
        `先求出「1 顆魂晶多少幣」：${sampleTotal} ÷ ${sampleQty} ＝ ${unitPrice} 幣/顆。`,
        `商不變：每一顆魂晶的價錢維持不變。`,
        `手上的幣所能購買的數量：${targetTotal} ÷ ${unitPrice} ＝ ？ 顆（請動手計算）`
      ],
      hints_en: [
        `First find the unit price: ${sampleTotal} ÷ ${sampleQty} = ${unitPrice} coins/crystal.`,
        `Quotient invariant: the unit price stays constant.`,
        `Total crystals: ${targetTotal} ÷ ${unitPrice} = ? crystals (Compute this).`
      ],
      diagramType: 'quotInvariant',
      diagramData: { unitPrice, sampleQty, sampleTotal, targetQty, targetTotal }
    };
  }

  // -------------------------------------------------------------
  // 第 7 室：【3-3】幽靈長廊的冥燈指引 (P.46 兩點間隔與距離)
  // -------------------------------------------------------------
  _genChamber7() {
    const intervalDist = this.rng.choice([15, 20, 25, 28]);
    const startNum = this.rng.int(15, 38);
    const countIntervals = this.rng.int(25, 55);
    const endNum = startNum + countIntervals;
    const totalDist = countIntervals * intervalDist;

    const answerCode = DungeonQuestionEngine.formatCode(totalDist);

    return {
      id: 7,
      title_zh: '第七密室：幽靈長廊的冥燈指引',
      title_en: 'Chamber 7: Guidance of the Phantom Lanterns',
      subtitle_zh: '3-3 間隔問題・兩編號間的間隔數與總長',
      subtitle_en: '3-3 Interval Problems: Distance Between Numbered Posts',
      concept_zh: '第 A 號到第 B 號的間隔數 ＝ B － A；總距離 ＝ 間隔數 × 每個間隔長',
      concept_en: 'Intervals between #A and #B = B - A; Distance = Intervals × Spacing',
      lore_zh: '這是一條無限延伸的黑暗地道，兩旁懸掛著依序編號的青色引魂燈。地刺陷阱正在啟動，唯有報出兩燈之間的精確距離方可安然通過！',
      lore_en: 'Numbered lanterns line a dark underground passage. Traps are arming—you must compute the exact distance between two lanterns to proceed safely!',
      story_zh: `地道中相鄰兩盞引魂燈都相距 <strong>${intervalDist} 公尺</strong>，從第 1 盞開始依序編號。
石門機關詢問：從<strong>【第 ${startNum} 號】</strong>到<strong>【第 ${endNum} 號】</strong>的引魂燈，相距多少公尺？`,
      story_en: `Adjacent spirit lanterns are spaced <strong>${intervalDist} meters</strong> apart, numbered sequentially starting from #1.
The door puzzle asks: What is the distance between <strong>[Lantern #${startNum}]</strong> and <strong>[Lantern #${endNum}]</strong>?`,
      targetQuestion_zh: `每隔 ${intervalDist}m 設一燈，第 ${startNum} 號到第 ${endNum} 號相距幾公尺？`,
      targetQuestion_en: `Every ${intervalDist}m has a lamp. Distance from #${startNum} to #${endNum}?`,
      lockType: 'dial4',
      correctAnswer: totalDist,
      correctCode: answerCode,
      hints_zh: [
        `小心！求的是「第 ${startNum} 號到第 ${endNum} 號」之間的間隔數，不是相加！`,
        `間隔數 ＝ 後號碼 － 前號碼：${endNum} － ${startNum} ＝ ${countIntervals} 個間隔。`,
        `總距離 ＝ 間隔數 × 每個間距：${countIntervals} × ${intervalDist} ＝ ？ 公尺（請動手計算）`
      ],
      hints_en: [
        `Take care: calculate intervals between #${startNum} and #${endNum}, not by addition!`,
        `Intervals = End - Start: ${endNum} - ${startNum} = ${countIntervals} intervals.`,
        `Total distance = Intervals × Spacing: ${countIntervals} × ${intervalDist} = ? meters.`
      ],
      diagramType: 'numberLine',
      diagramData: { startNum, endNum, intervalDist, intervals: countIntervals, totalDist }
    };
  }

  // -------------------------------------------------------------
  // 第 8 室：【3-3】斷魂橋的三重封印 (P.47/48/51 直線兩端＋兩側)
  // -------------------------------------------------------------
  _genChamber8() {
    const intervalDist = this.rng.choice([15, 20, 25]);
    const intervalsOneSide = this.rng.int(16, 28);
    const totalLength = intervalsOneSide * intervalDist;

    const countOneSide = intervalsOneSide + 1;
    const totalItems = countOneSide * 2;

    const answerCode = DungeonQuestionEngine.formatCode(totalItems);

    return {
      id: 8,
      title_zh: '第八密室：斷魂長廊的雙重結界',
      title_en: 'Chamber 8: Dual Wards of the Hallway of Doom',
      subtitle_zh: '3-3 間隔問題・直線植樹 (兩端都設 ＋ 道路兩側)',
      subtitle_en: '3-3 Interval Problems: Linear Intervals (Both Ends + Both Sides)',
      concept_zh: '兩端都放：數量 ＝ 間隔數 ＋ 1；走廊兩側需再乘以 2',
      concept_en: 'Both ends included: items = intervals + 1; for both sides, multiply by 2',
      lore_zh: '你來到了深不見底的斷魂大理石長廊。為了壓制深淵中的巨獸，長廊兩側皆必須安放避邪晶石。',
      lore_en: 'You stand before a marble bridge spanning an abyss. Warding crystals must be placed on both sides to suppress beasts below.',
      story_zh: `長廊全長 <strong>${totalLength} 公尺</strong>，法師要在長廊的<strong>【兩側】</strong>，每隔 <strong>${intervalDist} 公尺</strong>安放一顆避邪晶石。
已知長廊的<strong>【頭尾兩端都要放】</strong>，一共需要準備幾顆避邪晶石？`,
      story_en: `The corridor is <strong>${totalLength} meters</strong> long. Crystals must be placed along <strong>[both sides]</strong> every <strong>${intervalDist} meters</strong>.
Given that <strong>[both ends are included]</strong>, how many warding crystals are needed in total?`,
      targetQuestion_zh: `長 ${totalLength}m 走廊【兩側】，每隔 ${intervalDist}m 放一顆，頭尾兩端都放，共需幾顆？`,
      targetQuestion_en: `Hallway is ${totalLength}m. Crystals every ${intervalDist}m on BOTH SIDES, both ends included. Total crystals?`,
      lockType: 'dial4',
      correctAnswer: totalItems,
      correctCode: answerCode,
      hints_zh: [
        `第一步：算單側有幾個間隔：${totalLength} ÷ ${intervalDist} ＝ ${intervalsOneSide} 個間隔。`,
        `第二步：因為「頭尾兩端都要放」，單側的晶石數 ＝ 間隔數 ＋ 1：${intervalsOneSide} ＋ 1 ＝ ${countOneSide} 顆。`,
        `第三步：關鍵陷阱！題目是「長廊兩側」，所以單側算完後要再乘以 2 ＝ ？ 顆（請動手計算）`
      ],
      hints_en: [
        `Step 1: Intervals on one side: ${totalLength} ÷ ${intervalDist} = ${intervalsOneSide} intervals.`,
        `Step 2: Both ends included, so one side has intervals + 1 = ${countOneSide} crystals.`,
        `Step 3: Key trap! It is on "BOTH SIDES", so multiply by 2: ${countOneSide} × 2 = ? crystals.`
      ],
      diagramType: 'treeBothEnds',
      diagramData: { totalLength, intervalDist, intervals: intervalsOneSide, oneSide: countOneSide, total: totalItems }
    };
  }

  // -------------------------------------------------------------
  // 第 9 室：【3-3】銜尾巨蛇的環形石陣 (P.49 封閉圖形)
  // -------------------------------------------------------------
  _genChamber9() {
    const intervalDist = this.rng.choice([15, 20, 25, 30]);
    const trees = this.rng.int(16, 28);
    const perimeter = trees * intervalDist;

    const answerCode = DungeonQuestionEngine.formatCode(trees);

    return {
      id: 9,
      title_zh: '第九密室：銜尾巨蛇的環形石陣',
      title_en: 'Chamber 9: Circular Monoliths of the Ouroboros',
      subtitle_zh: '3-3 間隔問題・封閉圖形植樹 (圓形/封閉迴路)',
      subtitle_en: '3-3 Interval Problems: Closed Loop (Circular Perimeter)',
      concept_zh: '封閉迴路走一圈，頭尾重合，間隔數 ＝ 柱子數 (不加也不減)',
      concept_en: 'In a closed loop, ends coincide: Pillars = Intervals (do not add/subtract 1)',
      lore_zh: '進入這間密室，一條巨大的銜尾石蛇環繞著中央血池。古代石匠在圓形水池四周設立了鎮魂石柱。',
      lore_en: 'A stone serpent surrounds a circular pool. Ancient masons set soul-binding pillars around its perimeter.',
      story_zh: `圓形血池的周長為 <strong>${perimeter} 公尺</strong>。
若沿著血池四周，每隔 <strong>${intervalDist} 公尺</strong>立一根鎮魂柱，繞行水池一圈一共需要設立幾根鎮魂柱？`,
      story_en: `The perimeter of the circular pool is <strong>${perimeter} meters</strong>.
If pillars are erected every <strong>${intervalDist} meters</strong> around the pool, how many pillars are needed to complete the full loop?`,
      targetQuestion_zh: `圓形血池周長 ${perimeter}m，每隔 ${intervalDist}m 立一柱，共需幾根柱子？`,
      targetQuestion_en: `Circular perimeter is ${perimeter}m, pillar every ${intervalDist}m. Total pillars?`,
      lockType: 'dial4',
      correctAnswer: trees,
      correctCode: answerCode,
      hints_zh: [
        `請注意！這是「封閉圖形」（繞一圈回到原點）。`,
        `封閉圖形的柱子數「剛好等於」間隔數，不必加 1 也不能減 1！`,
        `算式方向：周長 ÷ 間距 ＝ ${perimeter} ÷ ${intervalDist} ＝ ？ 根（請動手計算）`
      ],
      hints_en: [
        `Notice: this is a "closed loop" (it returns to the origin).`,
        `In closed loops, pillar count equals interval count: do not add or subtract 1!`,
        `Formula: Perimeter ÷ Spacing = ${perimeter} ÷ ${intervalDist} = ? pillars.`
      ],
      diagramType: 'closedCircle',
      diagramData: { perimeter, intervalDist, trees }
    };
  }

  // -------------------------------------------------------------
  // 第 10 室：【綜合題】禁忌之門的四象陣眼 (P.51 最大公因數)
  // -------------------------------------------------------------
  _genChamber10() {
    const pairs = [
      { length: 120, width: 100, ans: 20 },
      { length: 140, width: 105, ans: 35 },
      { length: 150, width: 90, ans: 30 },
      { length: 96, width: 72, ans: 24 },
      { length: 180, width: 120, ans: 60 },
      { length: 160, width: 100, ans: 20 },
      { length: 210, width: 140, ans: 70 }
    ];
    const picked = this.rng.choice(pairs);
    const length = picked.length;
    const width = picked.width;
    const maxDist = picked.ans;

    const answerCode = DungeonQuestionEngine.formatCode(maxDist);

    return {
      id: 10,
      title_zh: '第十密室 (魔王脫出)：禁忌之門的四象陣眼',
      title_en: 'Chamber 10 (Boss Escape): Four Pillars of the Forbidden Gate',
      subtitle_zh: '單元綜合大試煉・長方形四角設置之最大公因數間距',
      subtitle_en: 'Unit Comprehensive Challenge: Corner Spacing with Greatest Common Divisor',
      concept_zh: '能整除長又能整除寬的公因數；求最大間距就是求「最大公因數」',
      concept_en: 'Divides length and width evenly; maximum spacing is the Greatest Common Divisor (GCD)',
      lore_zh: '你終於抵達通往人間的終極青銅巨門！門前是長方形的封印祭壇，地牢之主留下最後的禁錮謎題，解開者方得生還！',
      lore_en: 'You reach the giant bronze exit gate! Before it lies a rectangular altar with the final riddle of escape!',
      story_zh: `終極脫出祭壇長 <strong>${length} 公尺</strong>、寬 <strong>${width} 公尺</strong>。
要在祭壇外圍每隔相同的距離插上一根驅魔破界燭，且<strong>【四個角落都一定要插】</strong>。
若要讓相鄰兩根破界燭之間的<strong>【距離最大】</strong>，相鄰兩燭之間的距離應是幾公尺？`,
      story_en: `The final altar is <strong>${length} meters</strong> long and <strong>${width} meters</strong> wide.
Candles must be placed at equal distances around the perimeter, and <strong>[all 4 corners must have a candle]</strong>.
To make the distance between adjacent candles <strong>[as large as possible]</strong>, what is the maximum distance in meters?`,
      targetQuestion_zh: `長 ${length}m、寬 ${width}m，四角都插，相鄰兩燭之間【最大距離】是幾公尺？`,
      targetQuestion_en: `Altar is ${length}m by ${width}m with 4 corners included. What is the [maximum distance] between candles?`,
      lockType: 'dial4',
      correctAnswer: maxDist,
      correctCode: answerCode,
      hints_zh: [
        `相鄰兩燭的距離必須同時能整除長（${length}m）與寬（${width}m），才不會在角落卡住。`,
        `因此這個距離必須是 ${length} 和 ${width} 的「公因數」。`,
        `題目要求「最大距離」，請計算出兩數的【最大公因數】gcd(${length}, ${width}) ＝ ？ 公尺（請動手計算）`
      ],
      hints_en: [
        `The distance must evenly divide both length (${length}m) and width (${width}m) to hit the corners.`,
        `Thus, the spacing must be a common factor of ${length} and ${width}.`,
        `To maximize distance, calculate the Greatest Common Divisor: gcd(${length}, ${width}) = ? meters.`
      ],
      diagramType: 'rectangleGcd',
      diagramData: { length, width, maxDist }
    };
  }
}

window.DungeonQuestionEngine = DungeonQuestionEngine;
