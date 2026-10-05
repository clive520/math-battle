/**
 * 題庫與動態參數產生器 (Question & Parameter Generator)
 * 100% 依據康軒六上第 03 單元《數量關係》(P.38 ~ P.51) 設計
 * 透過 SeededRandom 確保同一座號學生題目確定、不同座號學生題目數字與密碼皆不同
 */

class DungeonQuestionEngine {
  constructor(seed = '601-01') {
    this.rng = new SeededRandom(seed);
    this.seed = seed;
  }

  // 最大公因數計算
  static gcd(a, b) {
    while (b !== 0) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  }

  // 格式化 4 位數密碼（如 25 -> "0025"）
  static formatCode(num) {
    const n = Math.round(Number(num));
    return String(n).padStart(4, '0');
  }

  // 生成全套 10 間密室題目
  generateAllChambers() {
    this.rng.reset();
    return [
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
  }

  // -------------------------------------------------------------
  // 第 1 室：【3-1】血色圖騰的週期 (P.40 顏色排列與圖卡週期)
  // -------------------------------------------------------------
  _genChamber1() {
    // 週期圖案組合：4 個一組循環
    const runes = [
      { name: '血滴印', symbol: '🩸' },
      { name: '暗影骷髏', symbol: '💀' },
      { name: '毒蠍符', symbol: '🦂' },
      { name: '幽魂魔眼', symbol: '👁️' }
    ];
    // 挑選一個目標符號進行計數
    const targetIdx = this.rng.int(0, 3);
    const targetRune = runes[targetIdx];

    // 隨機選一個總排數 M (例如 40 ~ 76 間)
    const baseGroups = this.rng.int(10, 18);
    const remainder = this.rng.int(1, 3);
    const totalCount = baseGroups * 4 + remainder; // 例如 41, 45, 49...

    // 目標符號在這些排數中出現的總次數：
    // 每 4 個一組必有 1 次 targetIdx，餘數若包含 targetIdx 則 +1
    let targetOccurrences = baseGroups;
    if (remainder > targetIdx) {
      targetOccurrences += 1;
    }

    const answerCode = DungeonQuestionEngine.formatCode(targetOccurrences);

    return {
      id: 1,
      title: '第一密室：血色圖騰的週期循環',
      subtitle: '3-1 圖形和數形的規律・週期問題',
      concept: '總數 ÷ 週期 ＝ 完整組數 ⋯ 餘數',
      lore: '你來到幽暗的圖騰迴廊，石壁上刻滿了周而復始的咒印。唯有破解符號累積的次數，石鎖才能開啟！',
      story: `石壁上的咒印按照【🩸血滴印、💀暗影骷髏、🦂毒蠍符、👁️幽魂魔眼】以 4 個為一組重複排列。
守門惡靈在羊皮紙上寫著：『整道長廊共刻下了 <strong>${totalCount}</strong> 個咒印。若你想解開石門，請精確算出其中<strong>【${targetRune.symbol} ${targetRune.name}】</strong>一共出現了幾次？』`,
      targetQuestion: `共刻下 ${totalCount} 個咒印，【${targetRune.symbol} ${targetRune.name}】共出現幾次？`,
      lockType: 'dial4',
      correctAnswer: targetOccurrences,
      correctCode: answerCode,
      hints: [
        `咒印每 4 個為一組重複循環。`,
        `先算完整組數與餘數：${totalCount} ÷ 4 ＝ ？ 組 ⋯ 餘 ？ 個。`,
        `每組中都有 1 個【${targetRune.name}】，前 ${baseGroups} 組有 ${baseGroups} 次，再加上剩下的餘數中是否還有它！`
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
  // 第 2 室：【3-1】骸骨牢籠的幾何生長 (P.41/50 排三角形/正方形規律)
  // -------------------------------------------------------------
  _genChamber2() {
    // 隨機選擇排三角形 (1 + 2n) 或是正方形 (1 + 3n)
    const isTriangle = this.rng.int(0, 1) === 0;
    const n = this.rng.int(12, 26); // 例如排 12 ~ 26 個幾何籠
    let totalSticks = 0;
    let shapeName = '';
    let shapeSymbol = '';
    let formula = '';

    if (isTriangle) {
      shapeName = '三角形骨牢';
      shapeSymbol = '△';
      totalSticks = 1 + 2 * n; // 3 + 2*(n-1)
      formula = `1 ＋ 2 × ${n} ＝ ${totalSticks}`;
    } else {
      shapeName = '正方形鐵囚';
      shapeSymbol = '□';
      totalSticks = 1 + 3 * n; // 4 + 3*(n-1)
      formula = `1 ＋ 3 × ${n} ＝ ${totalSticks}`;
    }

    const answerCode = DungeonQuestionEngine.formatCode(totalSticks);

    return {
      id: 2,
      title: '第二密室：骸骨牢籠的幾何生長',
      subtitle: '3-1 圖形和數形的規律・幾何邊長累加',
      concept: '每多排 1 個圖形，共用公共邊，找出生長公差規律',
      lore: '眼前是散落一地的受詛咒獸骨。邪惡法師利用骨棒拼接成連續的牢籠，你必須找出第 N 個牢籠所需的骨棒總數！',
      story: `法師用骨杖排成一整排相連的<strong>【${shapeName}】</strong>：
排 1 個用 ${isTriangle ? '3' : '4'} 根骨杖，排 2 個用 ${isTriangle ? '5' : '7'} 根骨杖，排 3 個用 ${isTriangle ? '7' : '10'} 根⋯⋯
若要排出包含 <strong>${n} 個</strong>相連${shapeName}的終極大囚籠，總共需要消耗幾根骨杖？`,
      targetQuestion: `排出連續 ${n} 個${shapeName}，共需幾根骨杖？`,
      lockType: 'dial4',
      correctAnswer: totalSticks,
      correctCode: answerCode,
      hints: [
        `觀察規律：相連的籠子會共用骨杖！`,
        isTriangle 
          ? `每多排 1 個三角形多 2 根骨杖。公式引導：1 ＋ 2 × ${n} ＝ ？（請動手計算）`
          : `每多排 1 個正方形多 3 根骨杖。公式引導：1 ＋ 3 × ${n} ＝ ？（請動手計算）`,
        `千萬不要直接用 ${n} × ${isTriangle ? 3 : 4}，因為相鄰的邊是共用的！`
      ],
      diagramType: 'matchsticks',
      diagramData: { isTriangle, count: n, result: totalSticks, formula }
    };
  }

  // -------------------------------------------------------------
  // 第 3 室：【3-2】雙子血月的平衡 (P.42 和不變：晝夜24hr)
  // -------------------------------------------------------------
  _genChamber3() {
    // 晝夜總和 = 24 小時。白晝時間可為帶 .5 或整數
    const dayOptions = [7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12.5, 13, 13.5];
    const daylight = this.rng.choice(dayOptions);
    const night = Number((24 - daylight).toFixed(1));

    // 密碼轉換：若有小數點（如 13.5），轉為 135，以 0135 呈現；若整數 13，以 0013 呈現
    const rawVal = night % 1 === 0 ? night : Math.round(night * 10);
    const answerCode = DungeonQuestionEngine.formatCode(rawVal);

    return {
      id: 3,
      title: '第三密室：雙子血月的平衡之秤',
      subtitle: '3-2 和差積商不變・和不變關係',
      concept: '白晝 ＋ 黑夜 ＝ 24 小時（和固定為 24）',
      lore: '這座石殿內聳立著太陽與暗夜雙子石雕。黑魔法結界限定：一天之內，日光與暗夜的能量總和恆為 24 單位。',
      story: `封印天秤的古老銘文記載：『一日之運轉，白晝與黑夜相加恆為 24 時。』
地牢守衛觀測到今日外界的白晝時數為 <strong>${daylight} 小時</strong>。
黑夜石雕必須注入對應的黑夜時數魔力方能解鎖！請問黑夜占了多少小時？（若為小數如 13.5，密碼請輸入 0135；若為整數如 13，請輸入 0013）`,
      targetQuestion: `白晝 ${daylight} 小時，黑夜占幾小時？（例: 13.5輸0135，13輸0013）`,
      lockType: 'dial4',
      correctAnswer: night,
      correctCode: answerCode,
      hints: [
        `一天永遠是 24 小時，白晝 ＋ 黑夜 ＝ 24。`,
        `算式方向：24 － ${daylight} ＝ ？（請動手計算黑夜是幾小時）`,
        `小心小數點借位計算！`
      ],
      diagramType: 'sumInvariant',
      diagramData: { total: 24, partA: daylight, partB: night }
    };
  }

  // -------------------------------------------------------------
  // 第 4 室：【3-2】詛咒幽靈的永恆歲月 (P.43 差不變：年齡差)
  // -------------------------------------------------------------
  _genChamber4() {
    // 幽靈導師與學徒年齡差固定
    const diff = this.rng.choice([24, 26, 28, 30, 32]);
    const elderCurrent = this.rng.int(45, 60);
    const youngerCurrent = elderCurrent - diff;
    const futureYears = this.rng.int(10, 25);
    const elderFuture = elderCurrent + futureYears;
    const youngerFuture = elderFuture - diff;

    const answerCode = DungeonQuestionEngine.formatCode(youngerFuture);

    return {
      id: 4,
      title: '第四密室：詛咒幽靈的永恆歲月',
      subtitle: '3-2 和差積商不變・差不變關係',
      concept: '不論經過幾年，兩人的年齡差距永遠不變',
      lore: '兩具被封印在此的幽靈學者正在無休止地爭辯著歲月。時光的詛咒雖然在流動，但他們的年齡差永遠定格！',
      story: `幽靈法師嘆息：『今年我 <strong>${elderCurrent} 歲</strong>，我的侍從 <strong>${youngerCurrent} 歲</strong>。』
地牢上的骷髏門鎖浮現謎題：『當未來歲月流逝，幽靈法師達到 <strong>${elderFuture} 歲</strong> 時，侍從將是多少歲？』`,
      targetQuestion: `法師 ${elderCurrent} 歲、侍從 ${youngerCurrent} 歲。當法師 ${elderFuture} 歲時，侍從幾歲？`,
      lockType: 'dial4',
      correctAnswer: youngerFuture,
      correctCode: answerCode,
      hints: [
        `年齡問題的核心：兩人的「年齡差」永遠不會改變！`,
        `今年兩人相差：${elderCurrent} － ${youngerCurrent} ＝ ${diff} 歲。`,
        `當法師 ${elderFuture} 歲時，侍從依然比他小 ${diff} 歲：${elderFuture} － ${diff} ＝ ？（請算出侍從歲數）`
      ],
      diagramType: 'diffInvariant',
      diagramData: { diff, elder1: elderCurrent, young1: youngerCurrent, elder2: elderFuture, young2: youngerFuture }
    };
  }

  // -------------------------------------------------------------
  // 第 5 室：【3-2】毒液水牢的逆流閥門 (P.44 積不變：容量=流速×時間)
  // -------------------------------------------------------------
  _genChamber5() {
    // 總容量為公倍數 (如 240, 360, 480)
    const capacity = this.rng.choice([240, 360, 480]);
    // 尋找可整除的流速與時間組合
    const possibleTimes = [6, 8, 10, 12, 15, 20].filter(t => capacity % t === 0);
    const targetTime = this.rng.choice(possibleTimes);
    const requiredRate = capacity / targetTime;

    const answerCode = DungeonQuestionEngine.formatCode(requiredRate);

    return {
      id: 5,
      title: '第五密室：毒液水牢的逆流閥門',
      subtitle: '3-2 和差積商不變・積不變關係 (反比)',
      concept: '每分鐘注(排)水量 × 所需時間 ＝ 水槽總容量 (積不變)',
      lore: '腥臭的綠色毒水正在地底水牢急速上升！你必須調校手動排水閥門的每分鐘排毒水量，趕在限時前排空！',
      story: `石碑紀錄了水牢排毒測試：
『若每分鐘排出 ${capacity / 24} 公升，需耗時 24 分鐘排空。此水牢之總容積恆定為 <strong>${capacity} 公升</strong>。』
警報響起！你必須在 <strong>${targetTime} 分鐘</strong> 之內徹底排空毒水拯救小隊！請問閥門每分鐘的排水量必須調校為多少公升？`,
      targetQuestion: `總容積 ${capacity} 公升，若要在 ${targetTime} 分鐘排空，每分鐘需排多少公升？`,
      lockType: 'dial4',
      correctAnswer: requiredRate,
      correctCode: answerCode,
      hints: [
        `此為「積不變」原理：每分鐘水量 × 時間 ＝ 總容量（${capacity} 公升）。`,
        `算式方向：總容積 ÷ 時間 ＝ ${capacity} ÷ ${targetTime} ＝ ？（請動手計算）`,
        `時間越短，每分鐘需要的排水量就必須越大！`
      ],
      diagramType: 'prodInvariant',
      diagramData: { capacity, targetTime, requiredRate }
    };
  }

  // -------------------------------------------------------------
  // 第 6 室：【3-2】貪婪石像的魂幣代價 (P.45 商不變：總額÷數量=單價)
  // -------------------------------------------------------------
  _genChamber6() {
    // 單價固定為整數
    const unitPrice = this.rng.choice([12, 15, 18, 20, 25]);
    const sampleQty = this.rng.choice([4, 6, 8]);
    const sampleTotal = unitPrice * sampleQty;

    const targetQty = this.rng.choice([12, 16, 20, 24]);
    const targetTotal = unitPrice * targetQty;

    const answerCode = DungeonQuestionEngine.formatCode(targetQty);

    return {
      id: 6,
      title: '第六密室：貪婪石像的魂幣代價',
      subtitle: '3-2 和差積商不變・商不變關係 (正比)',
      concept: '總金額 ÷ 數量 ＝ 每一件的單價 (商不變)',
      lore: '擋在前方的三頭地獄石像攤開雙手，索求通行魂晶。它的交易天秤恪守著絕對等價的法則。',
      story: `石碑上記錄著前人交易紀錄：『購買 <strong>${sampleQty} 顆</strong>魂晶需支付 <strong>${sampleTotal} 枚</strong>暗黑幣。』
你翻開背包，身上剛好搜集到了 <strong>${targetTotal} 枚</strong>暗黑幣，若全數用來購買相同價錢的魂晶，一共可以換得幾顆魂晶？`,
      targetQuestion: `${sampleQty} 顆需 ${sampleTotal} 幣，手上有 ${targetTotal} 幣可換幾顆魂晶？`,
      lockType: 'dial4',
      correctAnswer: targetQty,
      correctCode: answerCode,
      hints: [
        `先求出「1 顆魂晶多少幣」：${sampleTotal} ÷ ${sampleQty} ＝ ${unitPrice} 幣/顆。`,
        `商不變：每一顆魂晶的價錢維持不變。`,
        `手上的幣所能購買的數量：${targetTotal} ÷ ${unitPrice} ＝ ？ 顆（請動手計算）`
      ],
      diagramType: 'quotInvariant',
      diagramData: { unitPrice, sampleQty, sampleTotal, targetQty, targetTotal }
    };
  }

  // -------------------------------------------------------------
  // 第 7 室：【3-3】幽靈長廊的冥燈指引 (P.46 兩點間隔與距離)
  // -------------------------------------------------------------
  _genChamber7() {
    // 間距 d、起點 A、終點 B
    const intervalDist = this.rng.choice([15, 20, 25, 28]);
    const startNum = this.rng.int(15, 38);
    const countIntervals = this.rng.int(25, 55);
    const endNum = startNum + countIntervals;
    const totalDist = countIntervals * intervalDist;

    const answerCode = DungeonQuestionEngine.formatCode(totalDist);

    return {
      id: 7,
      title: '第七密室：幽靈長廊的冥燈指引',
      subtitle: '3-3 間隔問題・兩編號間的間隔數與總長',
      concept: '第 A 號到第 B 號的間隔數 ＝ B － A；總距離 ＝ 間隔數 × 每個間隔長',
      lore: '這是一條無限延伸的黑暗地道，兩旁懸掛著依序編號的青色引魂燈。地刺陷阱正在啟動，唯有報出兩燈之間的精確距離方可安然通過！',
      story: `地道中相鄰兩盞引魂燈都相距 <strong>${intervalDist} 公尺</strong>，從第 1 盞開始依序編號。
石門機關詢問：從<strong>【第 ${startNum} 號】</strong>到<strong>【第 ${endNum} 號】</strong>的引魂燈，相距多少公尺？`,
      targetQuestion: `每隔 ${intervalDist}m 設一燈，第 ${startNum} 號到第 ${endNum} 號相距幾公尺？`,
      lockType: 'dial4',
      correctAnswer: totalDist,
      correctCode: answerCode,
      hints: [
        `小心！求的是「第 ${startNum} 號到第 ${endNum} 號」之間的間隔數，不是相加！`,
        `間隔數 ＝ 後號碼 － 前號碼：${endNum} － ${startNum} ＝ ${countIntervals} 個間隔。`,
        `總距離 ＝ 間隔數 × 每個間距：${countIntervals} × ${intervalDist} ＝ ？ 公尺（請動手計算）`
      ],
      diagramType: 'numberLine',
      diagramData: { startNum, endNum, intervalDist, intervals: countIntervals, totalDist }
    };
  }

  // -------------------------------------------------------------
  // 第 8 室：【3-3】斷魂橋的三重封印 (P.47/48/51 直線植樹：兩端/兩側)
  // -------------------------------------------------------------
  _genChamber8() {
    // 長度 L、間距 d 保證能整除
    const intervalDist = this.rng.choice([15, 20, 25]);
    const intervalsOneSide = this.rng.int(16, 28);
    const totalLength = intervalsOneSide * intervalDist;

    // 題目情境：走廊「兩側」，每隔 d 公尺放一個魔法陣，頭尾「兩端都要放」
    const countOneSide = intervalsOneSide + 1;
    const totalItems = countOneSide * 2; // 兩側要乘 2

    const answerCode = DungeonQuestionEngine.formatCode(totalItems);

    return {
      id: 8,
      title: '第八密室：斷魂長廊的雙重結界',
      subtitle: '3-3 間隔問題・直線植樹 (兩端都設 ＋ 道路兩側)',
      concept: '兩端都放：數量 ＝ 間隔數 ＋ 1；走廊兩側需再乘以 2',
      lore: '你來到了深不見底的斷魂大理石長廊。為了壓制深淵中的巨獸，長廊兩側皆必須安放避邪晶石。',
      story: `長廊全長 <strong>${totalLength} 公尺</strong>，法師要在長廊的<strong>【兩側】</strong>，每隔 <strong>${intervalDist} 公尺</strong>安放一顆避邪晶石。
已知長廊的<strong>【頭尾兩端都要放】</strong>，一共需要準備幾顆避邪晶石？`,
      targetQuestion: `長 ${totalLength}m 走廊【兩側】，每隔 ${intervalDist}m 放一顆，頭尾兩端都放，共需幾顆？`,
      lockType: 'dial4',
      correctAnswer: totalItems,
      correctCode: answerCode,
      hints: [
        `第一步：算單側有幾個間隔：${totalLength} ÷ ${intervalDist} ＝ ${intervalsOneSide} 個間隔。`,
        `第二步：因為「頭尾兩端都要放」，單側的晶石數 ＝ 間隔數 ＋ 1 ＝ ${countOneSide} 顆。`,
        `第三步：關鍵陷阱！題目是「長廊兩側」，所以單側算完後要再乘以 2 ＝ ？ 顆（請動手計算）`
      ],
      diagramType: 'treeBothEnds',
      diagramData: { totalLength, intervalDist, intervals: intervalsOneSide, oneSide: countOneSide, total: totalItems }
    };
  }

  // -------------------------------------------------------------
  // 第 9 室：【3-3】銜尾巨蛇的環形石陣 (P.49 封閉圖形：棵數=間隔數)
  // -------------------------------------------------------------
  _genChamber9() {
    // 圓形周長 C、間距 d
    const intervalDist = this.rng.choice([15, 20, 25, 30]);
    const trees = this.rng.int(16, 28);
    const perimeter = trees * intervalDist;

    const answerCode = DungeonQuestionEngine.formatCode(trees);

    return {
      id: 9,
      title: '第九密室：銜尾巨蛇的環形石陣',
      subtitle: '3-3 間隔問題・封閉圖形植樹 (圓形/封閉迴路)',
      concept: '封閉迴路走一圈，頭尾重合，間隔數 ＝ 柱子數 (不加也不減)',
      lore: '進入這間密室，一條巨大的銜尾石蛇環繞著中央血池。古代石匠在圓形水池四周設立了鎮魂石柱。',
      story: `圓形血池的周長為 <strong>${perimeter} 公尺</strong>。
若沿著血池四周，每隔 <strong>${intervalDist} 公尺</strong>立一根鎮魂柱，繞行水池一圈一共需要設立幾根鎮魂柱？`,
      targetQuestion: `圓形血池周長 ${perimeter}m，每隔 ${intervalDist}m 立一柱，共需幾根柱子？`,
      lockType: 'dial4',
      correctAnswer: trees,
      correctCode: answerCode,
      hints: [
        `請注意！這是「封閉圖形」（繞一圈回到原點）。`,
        `封閉圖形的柱子數「剛好等於」間隔數，不必加 1 也不能減 1！`,
        `算式方向：周長 ÷ 間距 ＝ ${perimeter} ÷ ${intervalDist} ＝ ？ 根（請動手計算）`
      ],
      diagramType: 'closedCircle',
      diagramData: { perimeter, intervalDist, trees }
    };
  }

  // -------------------------------------------------------------
  // 第 10 室：【綜合題】禁忌之門的四象陣眼 (P.51 綜合題：最大公因數求最大間距)
  // -------------------------------------------------------------
  _genChamber10() {
    // 長度 X、寬度 Y，四角都要種樹，求相鄰兩樹之間的最大距離 (gcd)
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
      title: '第十密室 (魔王脫出)：禁忌之門的四象陣眼',
      subtitle: '單元綜合大試煉・長方形四角設置之最大公因數間距',
      concept: '能整除長又能整除寬的公因數；求最大間距就是求「最大公因數」',
      lore: '你終於抵達通往人間的終極青銅巨門！門前是長方形的封印祭壇，地牢之主留下最後的禁錮謎題，解開者方得生還！',
      story: `終極脫出祭壇長 <strong>${length} 公尺</strong>、寬 <strong>${width} 公尺</strong>。
要在祭壇外圍每隔相同的距離插上一根驅魔破界燭，且<strong>【四個角落都一定要插】</strong>。
若要讓相鄰兩根破界燭之間的<strong>【距離最大】</strong>，相鄰兩燭之間的距離應是幾公尺？`,
      targetQuestion: `長 ${length}m、寬 ${width}m，四角都插，相鄰兩燭之間【最大距離】是幾公尺？`,
      lockType: 'dial4',
      correctAnswer: maxDist,
      correctCode: answerCode,
      hints: [
        `相鄰兩燭的距離必須同時能整除長（${length}m）與寬（${width}m），才不會在角落卡住。`,
        `因此這個距離必須是 ${length} 和 ${width} 的「公因數」。`,
        `題目要求「最大距離」，請計算出兩數的【最大公因數】gcd(${length}, ${width}) ＝ ？ 公尺（請動手計算）`
      ],
      diagramType: 'rectangleGcd',
      diagramData: { length, width, maxDist }
    };
  }
}

window.DungeonQuestionEngine = DungeonQuestionEngine;
