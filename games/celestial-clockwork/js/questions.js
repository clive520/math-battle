/**
 * 題庫與動態參數產生器 (Question & Parameter Engine)
 * 100% 依據康軒六上第 01 單元《最大公因數與最小公倍數》(P.4 ~ P.21) 精密設計
 * 支援繁體中文 (zh) 與英文 (en) 獨立雙語，保證鄰座防抄襲與整除數值
 */

class ClockworkChamber {
  constructor(data) {
    Object.assign(this, data);
  }

  getTitle(lang = 'zh') { return lang === 'en' ? this.title_en : this.title_zh; }
  getSubtitle(lang = 'zh') { return lang === 'en' ? this.subtitle_en : this.subtitle_zh; }
  getConcept(lang = 'zh') { return lang === 'en' ? this.concept_en : this.concept_zh; }
  getLore(lang = 'zh') { return lang === 'en' ? this.lore_en : this.lore_zh; }
  getTargetQuestion(lang = 'zh') { return lang === 'en' ? this.targetQuestion_en : this.targetQuestion_zh; }
  getHints(lang = 'zh') { return lang === 'en' ? this.hints_en : this.hints_zh; }
}

class ClockworkQuestionEngine {
  constructor(seed = '601-01') {
    this.seed = seed;
    this.rng = new SeededRandom(seed);
  }

  static gcd(a, b) {
    while (b !== 0) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  }

  static lcm(a, b) {
    return (a * b) / ClockworkQuestionEngine.gcd(a, b);
  }

  static isPrime(n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
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
      const map = new Map(rawList.map(c => [c.id, c]));
      chamberList = customOrder.map(id => map.get(id) || rawList[0]);
    } else {
      // 保持前 9 題洗牌，第 10 關固定為終極魔王脫出關
      const first9 = this.rng.shuffle(rawList.slice(0, 9));
      chamberList = [...first9, rawList[9]];
    }

    const zhNums = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    return chamberList.map((data, idx) => {
      const stageNo = idx + 1;
      const isFinal = (stageNo === chamberList.length);
      const chamber = new ClockworkChamber(data);
      chamber.stageIndex = stageNo;

      const baseTitleZh = (data.title_zh || '').replace(/^第[一二三四五六七八九十0-9]+密室(\s*\(終極脫出\))?：/, '');
      const baseTitleEn = (data.title_en || '').replace(/^Chamber\s*[0-9]+(\s*\(Final Escape\))?:\s*/, '');

      chamber.title_zh = isFinal 
        ? `第${zhNums[idx]}密室 (終極脫出)：${baseTitleZh}`
        : `第${zhNums[idx]}密室：${baseTitleZh}`;

      chamber.title_en = isFinal
        ? `Chamber ${stageNo} (Final Escape): ${baseTitleEn}`
        : `Chamber ${stageNo}: ${baseTitleEn}`;

      return chamber;
    });
  }

  // -------------------------------------------------------------
  // 第 1 室：【1-1】質源之石的辨識 (P.6 ~ P.7 質數與合數概念)
  // -------------------------------------------------------------
  _genChamber1() {
    // 挑選 1~30 之間的混合數字
    const primePool = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
    const compPool = [4, 6, 8, 9, 12, 14, 15, 16, 18, 20, 21, 25, 27];

    const chosenPrimes = this.rng.shuffle(primePool).slice(0, 3 + (this.rng.int(0, 1)));
    const chosenComps = this.rng.shuffle(compPool).slice(0, 3);
    const candidateList = this.rng.shuffle([1, ...chosenPrimes, ...chosenComps]);

    const primeSum = chosenPrimes.reduce((a, b) => a + b, 0);
    const answerCode = ClockworkQuestionEngine.formatCode(primeSum);

    return {
      id: 1,
      title_zh: '第一密室：質源之石的辨識',
      title_en: 'Chamber 1: Identification of Prime Stones',
      subtitle_zh: '單元 1-1 質數與合數基礎概念',
      subtitle_en: 'Unit 1-1 Prime and Composite Numbers',
      concept_zh: '大於 1 的整數，除了 1 和它自己以外沒有別的因數稱為質數；1 既不是質數也不是合數。',
      concept_en: 'An integer greater than 1 with no positive divisors other than 1 and itself is prime; 1 is neither prime nor composite.',
      lore_zh: `祭壇石台上刻著遠古誓約：「凡受質源之光眷顧者，不可被世俗之力整除分割。」石台上散落著 ${candidateList.length} 塊符石，標記著數字：【${candidateList.join('、 ')}】。`,
      lore_en: `The altar reads: "Those blessed with primordial light cannot be divided by worldly forces." Scattered across the shrine are ${candidateList.length} rune stones: [${candidateList.join(', ')}].`,
      targetQuestion_zh: `請找出所有「質源之石（質數）」，將這些質數的數值全部相加，得出開門之密碼！`,
      targetQuestion_en: `Identify all the Prime Stones, sum their values together, and enter the sum as the 4-digit unlock code!`,
      answerCode: answerCode,
      hints_zh: [
        '💡 記住：數字「1」只有 1 個因數，所以「1 既不是質數，也不是合數」！',
        '💡 「2」是最小的質數，也是唯一的偶數質數。',
        `💡 仔細檢驗候選石中的各數字，找出因數只有 1 和自己的數，將它們加總起來。`
      ],
      hints_en: [
        '💡 Remember: The number 1 has only one divisor, so 1 is NEITHER prime NOR composite!',
        '💡 2 is the smallest prime number, and the only even prime.',
        '💡 Carefully test each candidate stone, find numbers with only two factors (1 and itself), and sum them up.'
      ],
      diagramType: 'primeSieve',
      diagramData: {
        candidates: candidateList,
        primes: chosenPrimes,
        primeSum: primeSum
      }
    };
  }

  // -------------------------------------------------------------
  // 第 2 室：【1-1】禁忌數陣的倍數破譯 (P.7 質數判定與 3 的倍數特徵)
  // -------------------------------------------------------------
  _genChamber2() {
    // 預設一組難以一眼看穿的大數質數與合數（利用數字和為3的倍數）
    const testSets = [
      { comps: [141, 87, 91], prime: 97, reason: '141(1+4+1=6為3倍數), 87(8+7=15為3倍數), 91(7×13合數)' },
      { comps: [111, 123, 129], prime: 103, reason: '111(1+1+1=3為3倍數), 123(1+2+3=6為3倍數), 129(1+2+9=12為3倍數)' },
      { comps: [51, 57, 183], prime: 89, reason: '51(5+1=6為3倍數), 57(5+7=12為3倍數), 183(1+8+3=12為3倍數)' },
      { comps: [69, 93, 147], prime: 109, reason: '69(6+9=15為3倍數), 93(9+3=12為3倍數), 147(1+4+7=12為3倍數)' },
      { comps: [171, 77, 117], prime: 83, reason: '171(1+7+1=9為3倍數), 77(7×11), 117(1+1+7=9為3倍數)' }
    ];

    const chosenSet = this.rng.pick(testSets);
    const allNumbers = this.rng.shuffle([...chosenSet.comps, chosenSet.prime]);
    const answerCode = ClockworkQuestionEngine.formatCode(chosenSet.prime);

    return {
      id: 2,
      title_zh: '第二密室：禁忌數陣的倍數破譯',
      title_en: 'Chamber 2: Decryption of the Multiples Barrier',
      subtitle_zh: '單元 1-1 大數質數判定與合數特徵',
      subtitle_en: 'Unit 1-1 Prime Testing and Divisibility Rules',
      concept_zh: '把一個多位數的各個數字相加，所得的數若是 3 的倍數，該數就是 3 的倍數，亦即為合數。',
      concept_en: 'If the sum of digits of a number is a multiple of 3, the number is divisible by 3 and is a composite number.',
      lore_zh: `石壁上浮現四個被星光籠罩的神祕數值：【${allNumbers.join('、 ')}】。其中三道是由邪能偽裝的合數結界，只有一個是真正的「質源核心」！`,
      lore_en: `Four luminous figures shine upon the ancient vault: [${allNumbers.join(', ')}]. Three are counterfeit composite traps, while only one is the genuine Prime Core!`,
      targetQuestion_zh: `運用倍數特徵判別法剔除所有合數，找出石壁中唯一真正的「質數」，以其數值作為 4 位密碼！`,
      targetQuestion_en: `Use divisibility rules to eliminate all composite traps, find the single true Prime Number, and input it as the 4-digit code!`,
      answerCode: answerCode,
      hints_zh: [
        '💡 檢驗是否為 3 的倍數秘技：把各個位數加起來（例如 141 ➡️ 1＋4＋1＝6 是 3 的倍數，故 141 是合數）！',
        '💡 檢查尾數是否為 5 或偶數，並注意 7 的倍數（如 91 ＝ 7 × 13）。',
        '💡 找出無法被 2、3、5、7 等整除的真質數。'
      ],
      hints_en: [
        '💡 Divisibility rule for 3: Sum all digits! If the sum is divisible by 3, the number is composite (e.g. 141 -> 1+4+1=6).',
        '💡 Check for multiples of 7 (e.g., 91 = 7 × 13).',
        '💡 Identify the sole genuine prime number.'
      ],
      diagramType: 'primeTesting',
      diagramData: {
        numbers: allNumbers,
        truePrime: chosenSet.prime
      }
    };
  }

  // -------------------------------------------------------------
  // 第 3 室：【1-2】生命之樹的質因數萃取 (P.8 ~ P.9 質因數與樹狀分解)
  // -------------------------------------------------------------
  _genChamber3() {
    const candidates = [
      { num: 60, factors: [2, 2, 3, 5], unique: [2, 3, 5] },
      { num: 72, factors: [2, 2, 2, 3, 3], unique: [2, 3] },
      { num: 84, factors: [2, 2, 3, 7], unique: [2, 3, 7] },
      { num: 90, factors: [2, 3, 3, 5], unique: [2, 3, 5] },
      { num: 54, factors: [2, 3, 3, 3], unique: [2, 3] },
      { num: 120, factors: [2, 2, 2, 3, 5], unique: [2, 3, 5] }
    ];

    const chosen = this.rng.pick(candidates);
    const sumAllFactors = chosen.factors.reduce((a, b) => a + b, 0);
    const answerCode = ClockworkQuestionEngine.formatCode(sumAllFactors);

    return {
      id: 3,
      title_zh: '第三密室：生命之樹的質因數萃取',
      title_en: 'Chamber 3: Prime Factor Extraction of the Life Tree',
      subtitle_zh: '單元 1-2 質因數與樹狀圖分解',
      subtitle_en: 'Unit 1-2 Prime Factors and Factor Tree',
      concept_zh: '一個整數的因數又是質數時，稱為質因數。將一個數用質因數相乘的形式表示，叫做質因數分解。',
      concept_en: 'A factor of an integer that is also prime is a prime factor. Expressing a number as a product of prime factors is prime factorization.',
      lore_zh: `神廟中央生長著一株發光的「質因數神木」，它的樹心能量讀數為【${chosen.num}】。神木枝枒分岔，必須將其能量逐層分解為不可再分的質因數果實！`,
      lore_en: `In the heart of the sanctuary stands the Tree of Primes, bearing an energy reading of [${chosen.num}]. Its branches must be decomposed into indivisible prime fruits!`,
      targetQuestion_zh: `請用樹狀圖將【${chosen.num}】做完整的質因數分解，並計算其「所有質因數的總和」（如 60＝2×2×3×5，總和為 2＋2＋3＋5＝12）作為開鎖密碼！`,
      targetQuestion_en: `Perform complete prime factorization on [${chosen.num}], calculate the sum of ALL prime factors, and enter it as the 4-digit code!`,
      answerCode: answerCode,
      hints_zh: [
        `💡 樹狀圖分解法：先將 ${chosen.num} 拆成兩個較小的乘數，再將不是質數的數繼續往下拆成質數！`,
        `💡 拆解到最末端全部都是質數為止，例如 2、3、5、7 等。`,
        `💡 將最後分解出的所有質因數由小到大相加（重複的也要加進去喔）。`
      ],
      hints_en: [
        `💡 Factor tree method: Split ${chosen.num} into two factors, then continue splitting composite branches into primes!`,
        `💡 Continue branching until all leaf nodes are prime numbers.`,
        `💡 Sum all the resulting prime factors (including duplicates) to obtain the code.`
      ],
      diagramType: 'factorTree',
      diagramData: {
        num: chosen.num,
        factors: chosen.factors,
        sum: sumAllFactors
      }
    };
  }

  // -------------------------------------------------------------
  // 第 4 室：【1-2】短除符文的能量還原 (P.10 短除法與乘積逆推)
  // -------------------------------------------------------------
  _genChamber4() {
    // 課本青蛙跳石題變形
    const problems = [
      { prod: 1365, primes: [3, 5, 7, 13], fake: [2, 4, 6, 9, 12, 17, 20] },
      { prod: 1155, primes: [3, 5, 7, 11], fake: [2, 4, 8, 13, 14, 18, 22] },
      { prod: 510, primes: [2, 3, 5, 17], fake: [4, 7, 9, 11, 13, 15, 21] },
      { prod: 462, primes: [2, 3, 7, 11], fake: [4, 5, 6, 9, 13, 14, 15] },
      { prod: 910, primes: [2, 5, 7, 13], fake: [3, 4, 6, 8, 11, 14, 17] }
    ];

    const chosen = this.rng.pick(problems);
    const candidateStones = this.rng.shuffle([...chosen.primes, ...chosen.fake]);
    const maxPrime = Math.max(...chosen.primes);
    const minPrime = Math.min(...chosen.primes);
    const magicCode = maxPrime * 100 + minPrime;
    const answerCode = ClockworkQuestionEngine.formatCode(magicCode);

    return {
      id: 4,
      title_zh: '第四密室：短除符文的能量還原',
      title_en: 'Chamber 4: Energy Restoration of the Short Division Rune',
      subtitle_zh: '單元 1-2 短除法質因數分解與乘積推導',
      subtitle_en: 'Unit 1-2 Short Division and Prime Factor Product',
      concept_zh: '利用短除法做質因數分解時，左側除數必須皆為質數；一個數可唯一分解為質數的乘積。',
      concept_en: 'When factoring via short division, divisors must all be primes. A composite integer can be uniquely factored into prime products.',
      lore_zh: `短除符文階梯上刻著古碑：守護獸踏上了若干塊神秘石板，所有石板上的數字相乘後的總能量積恰為【${chosen.prod}】。台階周圍散落著石板：【${candidateStones.join('、 ')}】。`,
      lore_en: `An ancient inscription states: The sacred guardian stepped across rune stones whose product equals exactly [${chosen.prod}]. Scattered stones nearby: [${candidateStones.join(', ')}].`,
      targetQuestion_zh: `用短除法將【${chosen.prod}】分解為質因數，找出踩踏的質數石板，並將「最大質數」與「最小質數」組合成 4 位密碼（如最大 13、最小 3 ➡️ 輸入 1303）！`,
      targetQuestion_en: `Factor [${chosen.prod}] via short division, find the stepped prime stones, and combine (Max Prime) & (Min Prime) as the 4-digit code (e.g. Max 13, Min 3 -> 1303)!`,
      answerCode: answerCode,
      hints_zh: [
        `💡 ${chosen.prod} 是奇數還是偶數？若為奇數，可先刪除所有偶數候選石（如 2、4、6 等）！`,
        `💡 用短除法依序從最小質因數 3 或 5 往下除除看。`,
        `💡 分解完成後，檢視所有質因數，找出最大者與最小者並依題意填入。`
      ],
      hints_en: [
        `💡 Is ${chosen.prod} even or odd? If odd, eliminate all even candidate numbers immediately!`,
        `💡 Use short division starting with smallest primes like 3 or 5.`,
        `💡 Once factored, identify the maximum and minimum prime factors to build the code.`
      ],
      diagramType: 'shortDivisionReverse',
      diagramData: {
        prod: chosen.prod,
        primes: chosen.primes,
        maxPrime: maxPrime,
        minPrime: minPrime
      }
    };
  }

  // -------------------------------------------------------------
  // 第 5 室：【1-3】雙星結界：互質之門 (P.11 互質概念)
  // -------------------------------------------------------------
  _genChamber5() {
    const pairs = [
      { left: 14, rightCorrect: 25, rightFakes: [21, 28, 49], reason: '14與25的最大公因數是1，故互質' },
      { left: 24, rightCorrect: 35, rightFakes: [18, 30, 42], reason: '24與35的最大公因數是1，故互質' },
      { left: 18, rightCorrect: 35, rightFakes: [24, 27, 45], reason: '18與35的最大公因數是1，故互質' },
      { left: 11, rightCorrect: 24, rightFakes: [22, 55, 77], reason: '11與24的最大公因數是1，故互質' },
      { left: 8, rightCorrect: 25, rightFakes: [12, 16, 20], reason: '8與25的最大公因數是1，故互質' }
    ];

    const chosen = this.rng.pick(pairs);
    const candidates = this.rng.shuffle([chosen.rightCorrect, ...chosen.rightFakes]);
    const sumVal = chosen.left + chosen.rightCorrect;
    const answerCode = ClockworkQuestionEngine.formatCode(sumVal);

    return {
      id: 5,
      title_zh: '第五密室：雙星結界：互質之門',
      title_en: 'Chamber 5: Twin Stars Barrier: Portal of Co-Primes',
      subtitle_zh: '單元 1-3 互質的定義與公因數',
      subtitle_en: 'Unit 1-3 Definition of Relatively Prime (Co-prime)',
      concept_zh: '當兩數的最大公因數是 1 時，我們稱這兩數互質。互質的兩數不一定本身都要是質數。',
      concept_en: 'Two integers are co-prime if their greatest common divisor is 1. Co-prime numbers do not both have to be prime numbers themselves.',
      lore_zh: `兩尊雙星巨石雕像守護著密道。左雕像散發著【${chosen.left}】單位的波動，右雕像的基座刻有四個共振頻率：【${candidates.join('、 ')}】。只有與左雕像「互質」的頻率才能解除屏障！`,
      lore_en: `Twin guardian colossi block the corridor. The left emits a frequency of [${chosen.left}], while four resonance values are engraved on the right: [${candidates.join(', ')}]. Only a co-prime frequency will dispel the ward!`,
      targetQuestion_zh: `找出與【${chosen.left}】互質的正確數值，並將「左雕像數值 ＋ 右雕像正確互質數值」之總和作為 4 位密碼！`,
      targetQuestion_en: `Find the number co-prime with [${chosen.left}], add the two numbers together, and enter the sum as the 4-digit code!`,
      answerCode: answerCode,
      hints_zh: [
        '💡 互質的定義：兩數的最大公因數剛好是 1（除了 1 之外沒有其他公因數）！',
        `💡 將左邊的 ${chosen.left} 做質因數分解，看看它包含哪些質因數。`,
        '💡 檢查右邊候選數，只要含有相同的質因數就不是互質，完全沒有共同質因數的才是正解！'
      ],
      hints_en: [
        '💡 Definition of co-prime: The greatest common divisor of both numbers is exactly 1!',
        `💡 Factor ${chosen.left} into prime factors to see what primes it contains.`,
        '💡 Check candidate numbers: any number sharing a common prime factor is NOT co-prime.'
      ],
      diagramType: 'coPrimeVerification',
      diagramData: {
        left: chosen.left,
        rightCorrect: chosen.rightCorrect,
        candidates: candidates
      }
    };
  }

  // -------------------------------------------------------------
  // 第 6 室：【1-3】共鳴晶核：最大公因短除陣 (P.12 ~ P.13 短除法求 GCD)
  // -------------------------------------------------------------
  _genChamber6() {
    const pairs = [
      { a: 42, b: 70 },
      { a: 36, b: 90 },
      { a: 54, b: 72 },
      { a: 48, b: 80 },
      { a: 60, b: 84 },
      { a: 70, b: 84 },
      { a: 66, b: 88 },
      { a: 45, b: 75 }
    ];

    const chosen = this.rng.pick(pairs);
    const gcdVal = ClockworkQuestionEngine.gcd(chosen.a, chosen.b);
    const answerCode = ClockworkQuestionEngine.formatCode(gcdVal);

    return {
      id: 6,
      title_zh: '第六密室：共鳴晶核：最大公因短除陣',
      title_en: 'Chamber 6: Resonance Core: GCD Short Division Array',
      subtitle_zh: '單元 1-3 短除法求兩數最大公因數',
      subtitle_en: 'Unit 1-3 Greatest Common Divisor via Short Division',
      concept_zh: '將兩數寫在同一個短除法中，左邊寫兩數共同的質因數，算到剩下的兩數互質為止；左邊所有質因數的乘積就是最大公因數。',
      concept_en: 'Write both numbers in one short division bracket, divide by shared prime factors until remaining quotients are co-prime. The product of left divisors is the GCD.',
      lore_zh: `古代發電機的兩枚聚能晶體正在劇烈共振，讀數分別為【${chosen.a}】與【${chosen.b}】。探險家必須在短除符文陣中提取其「最大公因共鳴頻率」，否則能量將全面失控！`,
      lore_en: `Two ancient energy crystals fluctuate wildly with readings [${chosen.a}] and [${chosen.b}]. Extract their Greatest Common Divisor frequency through short division to stabilize the core!`,
      targetQuestion_zh: `用短除法求出【${chosen.a}】和【${chosen.b}】的最大公因數（GCD），並輸入為 4 位解鎖密碼！`,
      targetQuestion_en: `Calculate the Greatest Common Divisor (GCD) of [${chosen.a}] and [${chosen.b}] via short division, and enter it as the 4-digit code!`,
      answerCode: answerCode,
      hints_zh: [
        '💡 短除法步驟：在左邊填入能同時整除兩數的質因數（例如 2, 3, 5, 7）。',
        '💡 繼續往下除，直到最下方的兩個商「互質」（公因數只有 1）為止！',
        '💡 求「最大公因數」時，只需把【左側】所有的共同質因數相乘即可！'
      ],
      hints_en: [
        '💡 Short division: Put a prime factor that divides both numbers on the left.',
        '💡 Continue dividing until the bottom quotients are co-prime.',
        '💡 For GCD, multiply ONLY the divisors along the left vertical line!'
      ],
      diagramType: 'shortDivisionGcd',
      diagramData: {
        a: chosen.a,
        b: chosen.b,
        gcd: gcdVal
      }
    };
  }

  // -------------------------------------------------------------
  // 第 7 室：【1-3】方石祭壇的等份切割 (P.14 最大公因數生活應用)
  // -------------------------------------------------------------
  _genChamber7() {
    const rects = [
      { length: 96, width: 72 },
      { length: 84, width: 60 },
      { length: 90, width: 60 },
      { length: 120, width: 80 },
      { length: 64, width: 48 },
      { length: 70, width: 42 }
    ];

    const chosen = this.rng.pick(rects);
    const gcdVal = ClockworkQuestionEngine.gcd(chosen.length, chosen.width);
    const answerCode = ClockworkQuestionEngine.formatCode(gcdVal);

    return {
      id: 7,
      title_zh: '第七密室：方石祭壇的等份切割',
      title_en: 'Chamber 7: Equal Tiling of the Altar Slab',
      subtitle_zh: '單元 1-3 最大公因數生活應用問題',
      subtitle_en: 'Unit 1-3 Real-world Application of GCD',
      concept_zh: '把長方形全部剪成一樣大小的正方形且邊長為整數，正方形邊長必須是長和寬的公因數；邊長要最長，就是要算長和寬的最大公因數。',
      concept_en: 'To cut a rectangle into equal squares without waste, the side length must be a common divisor. For the maximum side length, calculate the GCD.',
      lore_zh: `祭壇地面鑲嵌著一塊巨大合金石板，長度為【${chosen.length} 公分】、寬度為【${chosen.width} 公分】。機關指示必須將其完整切割成大小相同、邊長最長的正方形石磚，且邊長為整數公分、完全無殘料。`,
      lore_en: `A colossal alloy slab lies upon the floor, measuring [${chosen.length} cm] long and [${chosen.width} cm] wide. The mechanism requires dividing it into equal squares of maximum side length without any leftover.`,
      targetQuestion_zh: `請問裁切出來的正方形石磚，「邊長最長」是幾公分？請將該邊長數值輸入為 4 位密碼！`,
      targetQuestion_en: `What is the maximum side length (in cm) of these square tiles? Enter this side length as the 4-digit unlock code!`,
      answerCode: answerCode,
      hints_zh: [
        '💡 正方形邊長要能剛好平分長度，也要能剛好平分寬度，因此邊長是長與寬的「公因數」。',
        `💡 題目要求「邊長最長」，也就是求 ${chosen.length} 和 ${chosen.width} 的「最大公因數」！`,
        '💡 使用短除法求出兩數的最大公因數即為正方形邊長。'
      ],
      hints_en: [
        '💡 The square side length must divide both length and width evenly, so it is a common divisor.',
        `💡 "Maximum side length" directly corresponds to the Greatest Common Divisor of ${chosen.length} and ${chosen.width}!`,
        '💡 Use short division to find the GCD.'
      ],
      diagramType: 'tilingCutter',
      diagramData: {
        length: chosen.length,
        width: chosen.width,
        gcd: gcdVal
      }
    };
  }

  // -------------------------------------------------------------
  // 第 8 室：【1-4】雙星軌道：公倍共振 (P.16 ~ P.17 短除法求 LCM)
  // -------------------------------------------------------------
  _genChamber8() {
    const pairs = [
      { a: 18, b: 42 }, // LCM = 126
      { a: 25, b: 35 }, // LCM = 175
      { a: 40, b: 56 }, // LCM = 280
      { a: 24, b: 18 }, // LCM = 72
      { a: 28, b: 42 }, // LCM = 84
      { a: 36, b: 48 }, // LCM = 144
      { a: 20, b: 30 }  // LCM = 60
    ];

    const chosen = this.rng.pick(pairs);
    const lcmVal = ClockworkQuestionEngine.lcm(chosen.a, chosen.b);
    const answerCode = ClockworkQuestionEngine.formatCode(lcmVal);

    return {
      id: 8,
      title_zh: '第八密室：雙星軌道：公倍共振',
      title_en: 'Chamber 8: Orbit Synchronization: LCM Resonance',
      subtitle_zh: '單元 1-4 短除法求兩數最小公倍數',
      subtitle_en: 'Unit 1-4 Least Common Multiple via Short Division',
      concept_zh: '用短除法求最小公倍數時，算到兩數互質後，將左邊的共同質因數與最下方兩個互質的數全部相乘（L 型連乘），其積就是最小公倍數。',
      concept_en: 'For LCM via short division, divide until quotients are co-prime, then multiply all left divisors and bottom quotients together (in an L shape).',
      lore_zh: `天頂上兩座同心圓軌道正在按發條旋轉，內軌刻度週期為【${chosen.a} 齒】、外軌刻度週期為【${chosen.b} 齒】。雙軌必須旋轉至首次齒輪卡榫完全重合之相位，星門才會解除鎖定！`,
      lore_en: `Two concentric orbital tracks rotate on celestial clockwork. The inner track has a cycle of [${chosen.a} teeth] and the outer has [${chosen.b} teeth]. Align both gears at their first synchronized tooth position!`,
      targetQuestion_zh: `用短除法求出【${chosen.a}】和【${chosen.b}】的最小公倍數（LCM），並輸入為 4 位解鎖密碼！`,
      targetQuestion_en: `Calculate the Least Common Multiple (LCM) of [${chosen.a}] and [${chosen.b}] via short division, and enter it as the 4-digit code!`,
      answerCode: answerCode,
      hints_zh: [
        '💡 短除法求最小公倍數的「L 型連乘秘訣」：',
        '💡 先以共同質因數除到最下方兩數互質。',
        '💡 最小公倍數 ＝ 左邊所有的質因數 × 最底下兩個互質的商（把整個 L 型外圍全部乘起來）！'
      ],
      hints_en: [
        '💡 Remember the "L-shaped product rule" for LCM:',
        '💡 Divide by shared prime factors until bottom quotients are co-prime.',
        '💡 LCM = (All left divisors) × (Bottom quotients) multiplied together!'
      ],
      diagramType: 'shortDivisionLcm',
      diagramData: {
        a: chosen.a,
        b: chosen.b,
        lcm: lcmVal
      }
    };
  }

  // -------------------------------------------------------------
  // 第 9 室：【1-4】星光之鐘：雙重週期共振時刻 (P.18 週期與時刻應用)
  // -------------------------------------------------------------
  _genChamber9() {
    const schedules = [
      { a: 8, b: 28, startH: 9, startM: 0, lcmMin: 56 },   // 9:56 -> 0956
      { a: 15, b: 20, startH: 8, startM: 15, lcmMin: 60 }, // 9:15 -> 0915
      { a: 12, b: 18, startH: 10, startM: 10, lcmMin: 36 }, // 10:46 -> 1046
      { a: 20, b: 25, startH: 9, startM: 30, lcmMin: 100 }, // 11:10 -> 1110
      { a: 6, b: 10, startH: 7, startM: 20, lcmMin: 30 },  // 7:50 -> 0750
      { a: 16, b: 24, startH: 8, startM: 30, lcmMin: 48 }  // 9:18 -> 0918
    ];

    const chosen = this.rng.pick(schedules);
    const totalStartMin = chosen.startH * 60 + chosen.startM;
    const totalNextMin = totalStartMin + chosen.lcmMin;
    const nextH = Math.floor(totalNextMin / 60);
    const nextM = totalNextMin % 60;

    const timeCode = String(nextH).padStart(2, '0') + String(nextM).padStart(2, '0');
    const answerCode = timeCode;

    const startHStr = String(chosen.startH);
    const startMStr = String(chosen.startM).padStart(2, '0');
    const nextHStr = String(nextH);
    const nextMStr = String(nextM).padStart(2, '0');

    return {
      id: 9,
      title_zh: '第九密室：星光之鐘：雙重週期共振時刻',
      title_en: 'Chamber 9: Starlight Chime: Dual Periodic Clock',
      subtitle_zh: '單元 1-4 最小公倍數時刻與時間量應用',
      subtitle_en: 'Unit 1-4 LCM Applied to Clocks and Time Intervals',
      concept_zh: '兩事件同時發生的時間間隔，是各自週期的最小公倍數。將起始時刻加上最小公倍數的時間量，即為下一次同時發生的時刻。',
      concept_en: 'The interval between simultaneous occurrences is the LCM of their cycle periods. Add this interval to the start time to find the next synchronized time.',
      lore_zh: `鐘樓上有兩座水晶訊號塔。小水晶每【${chosen.a} 分鐘】閃爍一次，大水晶每【${chosen.b} 分鐘】閃爍一次。今天上午【${startHStr} 時 ${startMStr} 分】兩座水晶剛好同時閃爍！`,
      lore_en: `Two crystal beacons tower above the gears. The small beacon flashes every [${chosen.a} minutes], while the large beacon flashes every [${chosen.b} minutes]. Both flashed simultaneously at [${startHStr}:${startMStr} AM]!`,
      targetQuestion_zh: `請問下一次兩座水晶「同時閃爍」會是上午「幾時幾分」？請將時與分組合成 4 位密碼（如 9時56分請輸入 0956）！`,
      targetQuestion_en: `At what time in the morning will both crystals flash together again? Combine hour and minute into a 4-digit code (e.g. 9:56 AM -> 0956)!`,
      answerCode: answerCode,
      hints_zh: [
        `💡 兩座水晶下一次同時閃爍的時間間隔，就是 ${chosen.a} 和 ${chosen.b} 的「最小公倍數」！`,
        `💡 先算出兩數的最小公倍數是幾分鐘。若超過 60 分鐘，請換算為幾小時幾分鐘。`,
        `💡 最後將上午 ${startHStr} 時 ${startMStr} 分加上算出的時間量，得出下一次的時刻！`
      ],
      hints_en: [
        `💡 The interval until both flash together again is the LCM of ${chosen.a} and ${chosen.b}!`,
        `💡 Calculate the LCM in minutes. If greater than 60, convert into hours and minutes.`,
        `💡 Add that interval to ${startHStr}:${startMStr} AM to obtain the next exact time.`
      ],
      diagramType: 'timelineSync',
      diagramData: {
        a: chosen.a,
        b: chosen.b,
        lcmMin: chosen.lcmMin,
        startHStr,
        startMStr,
        nextHStr,
        nextMStr
      }
    };
  }

  // -------------------------------------------------------------
  // 第 10 室：【1-4 & 綜合】神殿地磚的幾何嵌合與終極封印 (P.18 拼正方形)
  // -------------------------------------------------------------
  _genChamber10() {
    const tiles = [
      { tileL: 20, tileW: 12 }, // LCM = 60, L需3塊, W需5塊, 總共 15 塊
      { tileL: 24, tileW: 16 }, // LCM = 48, L需2塊, W需3塊, 總共 6 塊
      { tileL: 28, tileW: 20 }, // LCM = 140, L需5塊, W需7塊, 總共 35 塊
      { tileL: 30, tileW: 18 }, // LCM = 90, L需3塊, W需5塊, 總共 15 塊
      { tileL: 15, tileW: 10 }, // LCM = 30, L需2塊, W需3塊, 總共 6 塊
      { tileL: 35, tileW: 21 }  // LCM = 105, L需3塊, W需5塊, 總共 15 塊
    ];

    const chosen = this.rng.pick(tiles);
    const lcmSide = ClockworkQuestionEngine.lcm(chosen.tileL, chosen.tileW);
    const countL = lcmSide / chosen.tileL;
    const countW = lcmSide / chosen.tileW;
    const totalTiles = countL * countW;
    const answerCode = ClockworkQuestionEngine.formatCode(totalTiles);

    return {
      id: 10,
      title_zh: '第十密室 (終極脫出)：神殿地磚的幾何嵌合與終極封印',
      title_en: 'Chamber 10 (Final Escape): Geometric Tiling of the Sanctuary',
      subtitle_zh: '單元 1-4 最小公倍數幾何拼貼魔王挑戰',
      subtitle_en: 'Unit 1-4 LCM Applied to Square Tiling Boss Challenge',
      concept_zh: '用長方形排成正方形，排成的正方形邊長是長與寬的公倍數；邊長要最短就是求最小公倍數。所需的長方形個數為（長邊塊數 × 寬邊塊數）。',
      concept_en: 'To tile a square with identical rectangles, the square side length must be a multiple of length and width. For the minimal square, use LCM.',
      lore_zh: `星門前的終極神印大廳即將關閉！探險家必須使用長【${chosen.tileL} 公分】、寬【${chosen.tileW} 公分】的相同發光符石，依照相同方向拼排成一塊「邊長最短的正方形封印結界」！`,
      lore_en: `The Sanctuary Gate is collapsing! You must assemble identical glowing stones of length [${chosen.tileL} cm] and width [${chosen.tileW} cm] into a minimal square seal!`,
      targetQuestion_zh: `請問排成這個最小的正方形結界，一共需要使用「幾個長方形符石」？將所需符石總數量填入為終極脫出密碼！`,
      targetQuestion_en: `How many rectangular stones in total are required to assemble this minimal square seal? Enter the total stone count as the final escape code!`,
      answerCode: answerCode,
      hints_zh: [
        `💡 第一步：排成的正方形邊長最短是幾公分？要找 ${chosen.tileL} 和 ${chosen.tileW} 的「最小公倍數」！`,
        `💡 第二步：算出最小公倍數邊長後，看正方形的長邊需要幾塊符石（邊長 ÷ ${chosen.tileL}）、寬邊需要幾塊符石（邊長 ÷ ${chosen.tileW}）。`,
        `💡 第三步：將長邊塊數乘以寬邊塊數，就是拼成這個正方形一共需要的符石總數量！`
      ],
      hints_en: [
        `💡 Step 1: Find the shortest square side length by calculating the LCM of ${chosen.tileL} and ${chosen.tileW}!`,
        `💡 Step 2: Divide the square side length by ${chosen.tileL} and ${chosen.tileW} to find how many tiles fit along each side.`,
        `💡 Step 3: Multiply the horizontal count by the vertical count to get the total number of tiles needed!`
      ],
      diagramType: 'tilePacking',
      diagramData: {
        tileL: chosen.tileL,
        tileW: chosen.tileW,
        lcmSide: lcmSide,
        countL: countL,
        countW: countW,
        totalTiles: totalTiles
      }
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ClockworkChamber, ClockworkQuestionEngine };
}
