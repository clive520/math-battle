/**
 * 動態 SVG 視覺鷹架圖解渲染器 (ClockworkDiagramRenderer)
 * 專為康軒六上第 01 單元《最大公因數與最小公倍數》打造
 * 恪守教學鷹架原則：以幾何向量圖解、思維路徑與防錯標記為主，嚴禁直接洩漏答案數值！
 */

class ClockworkDiagramRenderer {
  constructor() {}

  render(type, data, lang = 'zh') {
    const isEn = (lang === 'en');
    switch (type) {
      case 'primeSieve':
        return this.renderPrimeSieve(data, isEn);
      case 'primeTesting':
        return this.renderPrimeTesting(data, isEn);
      case 'factorTree':
        return this.renderFactorTree(data, isEn);
      case 'shortDivisionReverse':
        return this.renderShortDivisionReverse(data, isEn);
      case 'coPrimeVerification':
        return this.renderCoPrimeVerification(data, isEn);
      case 'shortDivisionGcd':
        return this.renderShortDivisionGcd(data, isEn);
      case 'tilingCutter':
        return this.renderTilingCutter(data, isEn);
      case 'shortDivisionLcm':
        return this.renderShortDivisionLcm(data, isEn);
      case 'timelineSync':
        return this.renderTimelineSync(data, isEn);
      case 'tilePacking':
        return this.renderTilePacking(data, isEn);
      default:
        return `<p style="color:#a1a1aa;">${isEn ? 'No diagram available.' : '暫無圖解'}</p>`;
    }
  }

  // 1. 質源之石篩選矩陣 (Chamber 1)
  renderPrimeSieve(data, isEn) {
    const candidates = data.candidates || [];
    return `
      <div class="diagram-wrapper">
        <svg viewBox="0 0 540 220" class="clockwork-svg" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="520" height="200" rx="10" fill="#131b26" stroke="#2563eb" stroke-width="2"/>
          <text x="30" y="38" fill="#60a5fa" font-size="14" font-weight="bold">
            ${isEn ? '✦ PRIME STONE SIEVE MATRIX' : '✦ 質源之石概念分類矩陣'}
          </text>
          
          <g transform="translate(30, 60)">
            ${candidates.map((num, i) => {
              const x = (i % 6) * 78;
              const y = Math.floor(i / 6) * 60;
              const isOne = (num === 1);
              return `
                <g transform="translate(${x}, ${y})">
                  <rect width="66" height="48" rx="8" fill="#1e293b" stroke="${isOne ? '#f59e0b' : '#3b82f6'}" stroke-width="1.5"/>
                  <text x="33" y="30" fill="#f8fafc" font-size="18" font-family="monospace" font-weight="bold" text-anchor="middle">${num}</text>
                  ${isOne ? `
                    <text x="33" y="44" fill="#fbbf24" font-size="9" text-anchor="middle">${isEn ? 'Neither' : '非質非合'}</text>
                  ` : ''}
                </g>
              `;
            }).join('')}
          </g>

          <g transform="translate(30, 185)">
            <text x="0" y="0" fill="#93c5fd" font-size="12">
              ${isEn ? '✦ Guide: Numbers > 1 with only 2 factors (1 and itself) are Primes. Sum them up!' : '✦ 引導：大於 1 且只有 1 和自己兩個因數的數為質數；請將所有質數相加！'}
            </text>
          </g>
        </svg>
      </div>
    `;
  }

  // 2. 3 的倍數數位和判別法 (Chamber 2)
  renderPrimeTesting(data, isEn) {
    const numbers = data.numbers || [];
    return `
      <div class="diagram-wrapper">
        <svg viewBox="0 0 540 220" class="clockwork-svg" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="520" height="200" rx="10" fill="#131b26" stroke="#38bdf8" stroke-width="2"/>
          <text x="30" y="38" fill="#38bdf8" font-size="14" font-weight="bold">
            ${isEn ? '✦ SUM OF DIGITS RULE FOR 3' : '✦ 3 的倍數特徵判別鷹架'}
          </text>

          <g transform="translate(30, 60)">
            ${numbers.map((n, idx) => {
              const digits = String(n).split('');
              const sum = digits.map(Number).reduce((a, b) => a + b, 0);
              const isDivBy3 = (sum % 3 === 0);
              const x = idx * 120;
              return `
                <g transform="translate(${x}, 0)">
                  <rect width="105" height="90" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
                  <text x="52" y="30" fill="#facc15" font-size="20" font-weight="bold" text-anchor="middle">${n}</text>
                  <text x="52" y="52" fill="#94a3b8" font-size="11" text-anchor="middle">${digits.join(' + ')} = ${sum}</text>
                  <text x="52" y="74" fill="${isDivBy3 ? '#f87171' : '#34d399'}" font-size="11" font-weight="bold" text-anchor="middle">
                    ${isDivBy3 ? (isEn ? 'Divisible by 3' : '3的倍數 (合數)') : (isEn ? 'Not div by 3' : '非3倍數')}
                  </text>
                </g>
              `;
            }).join('')}
          </g>

          <text x="30" y="185" fill="#a5f3fc" font-size="12">
            ${isEn ? '⚠️ Eliminate composite numbers divisible by 3 or 7. Find the true prime!' : '⚠️ 提示：若數位之和是 3 的倍數，該數必為合數！另請注意 7 的倍數（如 91=7×13）。'}
          </text>
        </svg>
      </div>
    `;
  }

  // 3. 質因數樹狀分解圖 (Chamber 3)
  renderFactorTree(data, isEn) {
    const num = data.num || 60;
    return `
      <div class="diagram-wrapper">
        <svg viewBox="0 0 540 240" class="clockwork-svg" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="520" height="220" rx="10" fill="#131b26" stroke="#10b981" stroke-width="2"/>
          <text x="30" y="38" fill="#34d399" font-size="14" font-weight="bold">
            ${isEn ? '✦ FACTOR TREE SCAFFOLD' : '✦ 質因數分解樹狀圖鷹架'}
          </text>

          <!-- 樹狀結構 -->
          <g transform="translate(270, 70)">
            <!-- 根節點 -->
            <circle cx="0" cy="0" r="22" fill="#065f46" stroke="#34d399" stroke-width="2"/>
            <text x="0" y="6" fill="#ffffff" font-size="18" font-weight="bold" text-anchor="middle">${num}</text>

            <!-- 分枝線 1 -->
            <line x1="-12" y1="18" x2="-60" y2="55" stroke="#6ee7b7" stroke-width="2"/>
            <line x1="12" y1="18" x2="60" y2="55" stroke="#6ee7b7" stroke-width="2"/>

            <!-- 第一層節點 (示意) -->
            <circle cx="-60" cy="65" r="18" fill="#047857" stroke="#10b981" stroke-width="1.5"/>
            <text x="-60" y="70" fill="#f8fafc" font-size="13" font-weight="bold" text-anchor="middle">2</text>

            <circle cx="60" cy="65" r="18" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
            <text x="60" y="70" fill="#f8fafc" font-size="13" font-weight="bold" text-anchor="middle">${num / 2}</text>

            <!-- 下一層分枝線 -->
            <line x1="50" y1="80" x2="20" y2="115" stroke="#fcd34d" stroke-width="1.5"/>
            <line x1="70" y1="80" x2="100" y2="115" stroke="#fcd34d" stroke-width="1.5"/>

            <circle cx="20" cy="125" r="16" fill="#047857" stroke="#10b981" stroke-width="1.5"/>
            <text x="20" y="130" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">？</text>

            <circle cx="100" cy="125" r="16" fill="#047857" stroke="#10b981" stroke-width="1.5"/>
            <text x="100" y="130" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">？</text>
          </g>

          <text x="30" y="210" fill="#a7f3d0" font-size="12">
            ${isEn ? '✦ Continue splitting composite branches until all leaves are prime numbers!' : '✦ 說明：將合數持續往下分枝拆解，直到樹枝末端全部都是質數，再計算質因數總和！'}
          </text>
        </svg>
      </div>
    `;
  }

  // 4. 短除法乘積逆推圖 (Chamber 4)
  renderShortDivisionReverse(data, isEn) {
    const prod = data.prod || 1365;
    return `
      <div class="diagram-wrapper">
        <svg viewBox="0 0 540 220" class="clockwork-svg" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="520" height="200" rx="10" fill="#131b26" stroke="#8b5cf6" stroke-width="2"/>
          <text x="30" y="38" fill="#c084fc" font-size="14" font-weight="bold">
            ${isEn ? '✦ SHORT DIVISION REVERSE FACTORING' : '✦ 短除法乘積逆向分解引導'}
          </text>

          <g transform="translate(70, 70)">
            <!-- 短除符號框架 -->
            <path d="M 60 10 L 60 100 L 220 100" fill="none" stroke="#e2e8f0" stroke-width="2.5"/>
            <path d="M 60 40 L 220 40" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
            <path d="M 60 70 L 220 70" fill="none" stroke="#94a3b8" stroke-width="1.5"/>

            <text x="30" y="32" fill="#a855f7" font-size="16" font-family="monospace" font-weight="bold">p₁</text>
            <text x="80" y="32" fill="#f8fafc" font-size="18" font-family="monospace" font-weight="bold">${prod}</text>

            <text x="30" y="62" fill="#a855f7" font-size="16" font-family="monospace" font-weight="bold">p₂</text>
            <text x="80" y="62" fill="#38bdf8" font-size="16" font-family="monospace">商數一</text>

            <text x="30" y="92" fill="#a855f7" font-size="16" font-family="monospace" font-weight="bold">p₃</text>
            <text x="80" y="92" fill="#38bdf8" font-size="16" font-family="monospace">商數二</text>

            <text x="80" y="122" fill="#34d399" font-size="16" font-family="monospace" font-weight="bold">最底層質數</text>

            <g transform="translate(240, 20)">
              <text x="0" y="20" fill="#e9d5ff" font-size="13">
                ${isEn ? '1. Is product odd? Eliminate even primes.' : '1. 若總積為奇數，除數必不能為 2（排除偶數）。'}
              </text>
              <text x="0" y="45" fill="#e9d5ff" font-size="13">
                ${isEn ? '2. Test divisors 3, 5, 7, 11, 13 in order.' : '2. 從最小質數 3, 5, 7, 13 依序嘗試整除。'}
              </text>
              <text x="0" y="70" fill="#e9d5ff" font-size="13">
                ${isEn ? '3. Combine (Max Prime) and (Min Prime).' : '3. 分解完畢後，取出最大與最小質因數組合密碼！'}
              </text>
            </g>
          </g>
        </svg>
      </div>
    `;
  }

  // 5. 雙星互質檢驗 (Chamber 5)
  renderCoPrimeVerification(data, isEn) {
    const left = data.left || 14;
    return `
      <div class="diagram-wrapper">
        <svg viewBox="0 0 540 200" class="clockwork-svg" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="520" height="180" rx="10" fill="#131b26" stroke="#ec4899" stroke-width="2"/>
          <text x="30" y="38" fill="#f472b6" font-size="14" font-weight="bold">
            ${isEn ? '✦ CO-PRIME DIVISOR CHECK' : '✦ 雙星互質判定法則'}
          </text>

          <g transform="translate(40, 65)">
            <rect width="180" height="70" rx="8" fill="#1e293b" stroke="#ec4899" stroke-width="1.5"/>
            <text x="90" y="32" fill="#f472b6" font-size="14" text-anchor="middle">${isEn ? 'Left Star Core' : '左雕像能量值'}</text>
            <text x="90" y="58" fill="#ffffff" font-size="22" font-weight="bold" text-anchor="middle">${left}</text>

            <text x="230" y="45" fill="#facc15" font-size="28" text-anchor="middle">⚡</text>

            <rect x="280" y="0" width="180" height="70" rx="8" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
            <text x="370" y="32" fill="#60a5fa" font-size="14" text-anchor="middle">${isEn ? 'Candidate Number' : '候選互質數'}</text>
            <text x="370" y="58" fill="#38bdf8" font-size="22" font-weight="bold" text-anchor="middle">？</text>
          </g>

          <text x="30" y="165" fill="#fbcfe8" font-size="12">
            ${isEn ? '✦ Definition: GCD(A, B) = 1. They share NO common prime factors other than 1.' : '✦ 互質定義：兩數的最大公因數剛好是 1（除了 1 之外沒有共同公因數），兩數相加得出密碼！'}
          </text>
        </svg>
      </div>
    `;
  }

  // 6. 短除法求最大公因數 (Chamber 6)
  renderShortDivisionGcd(data, isEn) {
    const a = data.a || 42;
    const b = data.b || 70;
    return `
      <div class="diagram-wrapper">
        <svg viewBox="0 0 540 220" class="clockwork-svg" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="520" height="200" rx="10" fill="#131b26" stroke="#0ea5e9" stroke-width="2"/>
          <text x="30" y="38" fill="#38bdf8" font-size="14" font-weight="bold">
            ${isEn ? '✦ GCD SHORT DIVISION BRACKET' : '✦ 最大公因數短除法陣列'}
          </text>

          <g transform="translate(60, 60)">
            <path d="M 60 10 L 60 85 L 240 85" fill="none" stroke="#f8fafc" stroke-width="2.5"/>
            <path d="M 60 48 L 240 48" fill="none" stroke="#64748b" stroke-width="1.5"/>

            <text x="30" y="36" fill="#38bdf8" font-size="18" font-weight="bold">p₁</text>
            <text x="90" y="36" fill="#facc15" font-size="20" font-weight="bold">${a}</text>
            <text x="160" y="36" fill="#facc15" font-size="20" font-weight="bold">${b}</text>

            <text x="30" y="74" fill="#38bdf8" font-size="18" font-weight="bold">p₂</text>
            <text x="90" y="74" fill="#94a3b8" font-size="18">商 A</text>
            <text x="160" y="74" fill="#94a3b8" font-size="18">商 B</text>

            <text x="90" y="112" fill="#34d399" font-size="16">互質數 a</text>
            <text x="160" y="112" fill="#34d399" font-size="16">互質數 b</text>

            <!-- 高亮左側 -->
            <rect x="15" y="12" width="38" height="75" rx="4" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,4"/>
            <text x="260" y="45" fill="#38bdf8" font-size="14" font-weight="bold">
              ${isEn ? '← GCD = Multiply LEFT divisors only!' : '← 最大公因數 ＝ 僅將【左側】質因數相乘！'}
            </text>
            <text x="260" y="75" fill="#94a3b8" font-size="12">
              ${isEn ? 'Divide until bottom quotients are co-prime.' : '持續整除直到最下方兩數互質為止。'}
            </text>
          </g>

          <text x="30" y="195" fill="#bae6fd" font-size="12">
            ${isEn ? '✦ Calculate: p₁ × p₂ × ... = Greatest Common Divisor.' : '✦ 計算：左側所有共同質因數之乘積即為最大公因數。'}
          </text>
        </svg>
      </div>
    `;
  }

  // 7. 長方形石板裁切最大正方形 (Chamber 7)
  renderTilingCutter(data, isEn) {
    const l = data.length || 96;
    const w = data.width || 72;
    return `
      <div class="diagram-wrapper">
        <svg viewBox="0 0 540 220" class="clockwork-svg" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="520" height="200" rx="10" fill="#131b26" stroke="#f59e0b" stroke-width="2"/>
          <text x="30" y="38" fill="#fbbf24" font-size="14" font-weight="bold">
            ${isEn ? '✦ EQUAL SQUARE TILING DECOMPOSITION' : '✦ 長方形方格石板裁切示意'}
          </text>

          <g transform="translate(60, 60)">
            <!-- 大長方形石板 -->
            <rect x="0" y="0" width="220" height="110" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
            
            <!-- 裁切網格虛線 -->
            <line x1="55" y1="0" x2="55" y2="110" stroke="#fcd34d" stroke-width="1.5" stroke-dasharray="4,4"/>
            <line x1="110" y1="0" x2="110" y2="110" stroke="#fcd34d" stroke-width="1.5" stroke-dasharray="4,4"/>
            <line x1="165" y1="0" x2="165" y2="110" stroke="#fcd34d" stroke-width="1.5" stroke-dasharray="4,4"/>
            <line x1="0" y1="55" x2="220" y2="55" stroke="#fcd34d" stroke-width="1.5" stroke-dasharray="4,4"/>

            <text x="110" y="-10" fill="#facc15" font-size="14" font-weight="bold" text-anchor="middle">長 ${l} cm</text>
            <text x="-12" y="60" fill="#facc15" font-size="14" font-weight="bold" text-anchor="end">寬 ${w} cm</text>

            <g transform="translate(250, 20)">
              <text x="0" y="20" fill="#fef08a" font-size="14" font-weight="bold">
                ${isEn ? 'Max Square Side = GCD(Length, Width)' : '正方形最大邊長 ＝ 長與寬之最大公因數'}
              </text>
              <text x="0" y="50" fill="#e2e8f0" font-size="12">
                ${isEn ? 'Side length must divide both length and width evenly.' : '正方形邊長必須能同時整除長與寬（公因數）。'}
              </text>
              <text x="0" y="75" fill="#38bdf8" font-size="12">
                ${isEn ? 'Calculate GCD using short division!' : '請使用短除法求出兩數的最大公因數！'}
              </text>
            </g>
          </g>
        </svg>
      </div>
    `;
  }

  // 8. 短除法求最小公倍數 (Chamber 8)
  renderShortDivisionLcm(data, isEn) {
    const a = data.a || 18;
    const b = data.b || 42;
    return `
      <div class="diagram-wrapper">
        <svg viewBox="0 0 540 220" class="clockwork-svg" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="520" height="200" rx="10" fill="#131b26" stroke="#eab308" stroke-width="2"/>
          <text x="30" y="38" fill="#facc15" font-size="14" font-weight="bold">
            ${isEn ? '✦ LCM L-SHAPED MULTIPLICATION RULE' : '✦ 最小公倍數 L 型連乘法則'}
          </text>

          <g transform="translate(60, 60)">
            <path d="M 60 10 L 60 85 L 240 85" fill="none" stroke="#f8fafc" stroke-width="2.5"/>
            <path d="M 60 48 L 240 48" fill="none" stroke="#64748b" stroke-width="1.5"/>

            <text x="30" y="36" fill="#facc15" font-size="18" font-weight="bold">p₁</text>
            <text x="90" y="36" fill="#e2e8f0" font-size="20" font-weight="bold">${a}</text>
            <text x="160" y="36" fill="#e2e8f0" font-size="20" font-weight="bold">${b}</text>

            <text x="30" y="74" fill="#facc15" font-size="18" font-weight="bold">p₂</text>
            <text x="90" y="74" fill="#94a3b8" font-size="18">商 A</text>
            <text x="160" y="74" fill="#94a3b8" font-size="18">商 B</text>

            <text x="90" y="112" fill="#facc15" font-size="16" font-weight="bold">u</text>
            <text x="160" y="112" fill="#facc15" font-size="16" font-weight="bold">v</text>

            <!-- L 型標示框 -->
            <path d="M 20 15 L 20 120 L 190 120" fill="none" stroke="#facc15" stroke-width="3" stroke-dasharray="6,4"/>
            <text x="260" y="45" fill="#facc15" font-size="14" font-weight="bold">
              ${isEn ? '✦ LCM = Multiply the ENTIRE "L" shape!' : '✦ 最小公倍數 ＝ L 型外圍全部連乘！'}
            </text>
            <text x="260" y="75" fill="#e2e8f0" font-size="12">
              ${isEn ? 'LCM = (Left Divisors) × (Bottom Quotients)' : '最小公倍數 ＝ 左邊質因數 × 底下互質商數'}
            </text>
            <text x="260" y="100" fill="#38bdf8" font-size="12">
              ${isEn ? 'Formula: p₁ × p₂ × u × v' : '計算式：p₁ × p₂ × u × v ＝ LCM'}
            </text>
          </g>
        </svg>
      </div>
    `;
  }

  // 9. 雙重週期時間軸 (Chamber 9)
  renderTimelineSync(data, isEn) {
    const a = data.a || 8;
    const b = data.b || 28;
    return `
      <div class="diagram-wrapper">
        <svg viewBox="0 0 540 220" class="clockwork-svg" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="520" height="200" rx="10" fill="#131b26" stroke="#06b6d4" stroke-width="2"/>
          <text x="30" y="38" fill="#22d3ee" font-size="14" font-weight="bold">
            ${isEn ? '✦ PERIODIC TIME RESONANCE TIMELINE' : '✦ 雙重週期同頻共振時間軸'}
          </text>

          <g transform="translate(40, 70)">
            <!-- 軸線 1 (週期 a) -->
            <line x1="0" y1="20" x2="440" y2="20" stroke="#67e8f9" stroke-width="2"/>
            <text x="0" y="5" fill="#67e8f9" font-size="12" font-weight="bold">${isEn ? `Clock A (${a} min)` : `小水晶 (${a}分鐘)`}</text>
            ${[0, 1, 2, 3, 4, 5, 6].map(k => `
              <circle cx="${k * 65}" cy="20" r="5" fill="#22d3ee"/>
            `).join('')}

            <!-- 軸線 2 (週期 b) -->
            <line x1="0" y1="70" x2="440" y2="70" stroke="#f472b6" stroke-width="2"/>
            <text x="0" y="55" fill="#f472b6" font-size="12" font-weight="bold">${isEn ? `Clock B (${b} min)` : `大水晶 (${b}分鐘)`}</text>
            ${[0, 1, 2].map(k => `
              <circle cx="${k * 195}" cy="70" r="6" fill="#ec4899"/>
            `).join('')}

            <!-- 同時重合點 -->
            <line x1="390" y1="10" x2="390" y2="85" stroke="#facc15" stroke-width="2.5" stroke-dasharray="4,4"/>
            <text x="390" y="105" fill="#facc15" font-size="13" font-weight="bold" text-anchor="middle">
              ${isEn ? 'Synchronized!' : '同時閃爍重合！'}
            </text>
          </g>

          <text x="30" y="195" fill="#cffafe" font-size="12">
            ${isEn ? '✦ Simultaneous Interval = LCM(A, B). Add interval to Start Time!' : '✦ 再次同時發生之間隔 ＝ 兩週期之最小公倍數；將開始時刻加上間隔分鐘即為答案！'}
          </text>
        </svg>
      </div>
    `;
  }

  // 10. 磁磚拼排最小正方形 (Chamber 10)
  renderTilePacking(data, isEn) {
    const l = data.tileL || 20;
    const w = data.tileW || 12;
    return `
      <div class="diagram-wrapper">
        <svg viewBox="0 0 540 230" class="clockwork-svg" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="520" height="210" rx="10" fill="#131b26" stroke="#ef4444" stroke-width="2"/>
          <text x="30" y="38" fill="#f87171" font-size="14" font-weight="bold">
            ${isEn ? '✦ SQUARE TILE PACKING BOSS MATRIX' : '✦ 長方形拼貼正方形幾何矩陣'}
          </text>

          <g transform="translate(60, 60)">
            <!-- 外圍正方形結界 -->
            <rect x="0" y="0" width="130" height="130" fill="#1e293b" stroke="#f87171" stroke-width="2.5"/>

            <!-- 內部拼磚示意格網 -->
            <rect x="0" y="0" width="43" height="26" fill="#334155" stroke="#ef4444" stroke-width="1"/>
            <rect x="43" y="0" width="43" height="26" fill="#334155" stroke="#ef4444" stroke-width="1"/>
            <rect x="86" y="0" width="44" height="26" fill="#334155" stroke="#ef4444" stroke-width="1"/>
            <rect x="0" y="26" width="43" height="26" fill="#334155" stroke="#ef4444" stroke-width="1"/>

            <text x="65" y="-8" fill="#f87171" font-size="12" font-weight="bold" text-anchor="middle">正方形邊長 ＝ LCM</text>
            <text x="21" y="17" fill="#facc15" font-size="10" text-anchor="middle">${l}×${w}</text>

            <g transform="translate(170, 15)">
              <text x="0" y="20" fill="#fca5a5" font-size="13" font-weight="bold">
                ${isEn ? 'Step 1: Square Side = LCM(Length, Width)' : '步驟一：正方形邊長 ＝ 長與寬之最小公倍數'}
              </text>
              <text x="0" y="45" fill="#f1f5f9" font-size="12">
                ${isEn ? 'Step 2: Horizontal Count = Side ÷ Length' : '步驟二：長邊需要幾塊 ＝ 正方形邊長 ÷ 長'}
              </text>
              <text x="0" y="70" fill="#f1f5f9" font-size="12">
                ${isEn ? 'Step 3: Vertical Count = Side ÷ Width' : '步驟三：寬邊需要幾塊 ＝ 正方形邊長 ÷ 寬'}
              </text>
              <text x="0" y="95" fill="#fbbf24" font-size="13" font-weight="bold">
                ${isEn ? 'Step 4: Total Tiles = (H Count) × (V Count)' : '步驟四：符石總塊數 ＝ 長邊塊數 × 寬邊塊數'}
              </text>
            </g>
          </g>
        </svg>
      </div>
    `;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClockworkDiagramRenderer;
}
