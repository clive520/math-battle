/**
 * 鍊金小數動態 SVG 幾何與鷹架圖解渲染器 (AlchemistDiagramRenderer)
 * 專為康軒六上第 04 單元《小數除法》量身打造：
 * 1. 直式除法小數點位移與對齊軌跡圖 (強調商對齊新位、餘數對齊原位)
 * 2. 賢者天秤傾斜擺動平衡圖 (展示除數 < 1 放大效應)
 * 3. 試管分裝與殘渣刻度圖 (破解餘數看成整數的致命盲點)
 * 4. 雙子幾何面積等量共鳴圖 (平行四邊形 vs 長方形)
 */
class AlchemistDiagramRenderer {
  constructor() {}

  // 1. 直式除法小數點位移與對齊鷹架圖 (SVG)
  renderLongDivision(dividend, divisor, quotient, remainder = null, isRemainderTrap = false, lang = 'zh') {
    const isEn = (lang === 'en');
    const divStr = String(dividend);
    const dvrStr = String(divisor);
    const quoStr = String(quotient);

    // 判斷除數小數位數
    const dvrDecCount = (dvrStr.split('.')[1] || '').length;

    return `
      <div class="diagram-wrapper">
        <svg viewBox="0 0 540 220" class="alchemist-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="goldBeam" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.8"/>
              <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.2"/>
            </linearGradient>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
            </marker>
          </defs>

          <!-- 背景金屬銘板 -->
          <rect x="10" y="10" width="520" height="200" rx="10" fill="#18181b" stroke="#3f3f46" stroke-width="2"/>
          <text x="30" y="38" fill="#fbbf24" font-size="14" font-weight="bold">
            ${isEn ? '✦ DECIMAL SHIFT ALIGNMENT' : '✦ 小數點位移與對齊法則'}
          </text>

          <!-- 除法核心結構 -->
          <g transform="translate(60, 60)">
            <!-- 商 -->
            <text x="180" y="24" fill="#34d399" font-size="22" font-family="monospace" font-weight="bold">${quoStr}</text>
            <text x="320" y="24" fill="#a1a1aa" font-size="12">
              ${isEn ? '← Quotient point aligns with NEW point' : '← 商的小數點對齊「新小數點」'}
            </text>

            <!-- 直式除號橫線與弧線 -->
            <path d="M 120 32 L 300 32" stroke="#e4e4e7" stroke-width="2.5"/>
            <path d="M 120 32 Q 100 50 120 75" fill="none" stroke="#e4e4e7" stroke-width="2.5"/>

            <!-- 除數 -->
            <text x="30" y="62" fill="#38bdf8" font-size="22" font-family="monospace" font-weight="bold">${dvrStr}</text>

            <!-- 被除數 -->
            <text x="140" y="62" fill="#facc15" font-size="22" font-family="monospace" font-weight="bold">${divStr}</text>

            <!-- 小數點右移軌跡弧線 -->
            ${dvrDecCount > 0 ? `
              <path d="M 75 70 Q 90 85 105 70" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3,3" marker-end="url(#arrow)"/>
              <text x="40" y="105" fill="#38bdf8" font-size="12">
                ${isEn ? `Shift right by ${dvrDecCount} places` : `除數右移 ${dvrDecCount} 位變成整數`}
              </text>

              <path d="M 180 70 Q 195 85 210 70" fill="none" stroke="#facc15" stroke-width="2" stroke-dasharray="3,3" marker-end="url(#arrow)"/>
              <text x="170" y="105" fill="#facc15" font-size="12">
                ${isEn ? `Dividend shifts right by ${dvrDecCount} places` : `被除數同步向右移 ${dvrDecCount} 位`}
              </text>
            ` : ''}

            <!-- 餘數標註 (若為有餘數題目) -->
            ${remainder !== null ? `
              <line x1="140" y1="120" x2="260" y2="120" stroke="#71717a" stroke-width="1.5"/>
              <text x="180" y="145" fill="#f87171" font-size="22" font-family="monospace" font-weight="bold">${remainder}</text>
              <text x="240" y="145" fill="#f87171" font-size="12" font-weight="bold">
                ${isEn ? '⚠️ Remainder point aligns with ORIGINAL point!' : '⚠️ 餘數小數點必須對齊「原小數點」！'}
              </text>
            ` : ''}
          </g>
        </svg>
      </div>
    `;
  }

  // 2. 賢者天秤傾斜平衡圖 (SVG)
  renderBalanceScale(dividend, divisor, isEn = false) {
    const isMagnified = divisor < 1;
    const tiltAngle = isMagnified ? -14 : 14;

    return `
      <div class="diagram-wrapper">
        <svg viewBox="0 0 540 200" class="alchemist-svg" xmlns="http://www.w3.org/2000/svg">
          <!-- 支架立柱 -->
          <rect x="264" y="50" width="12" height="110" rx="3" fill="#71717a"/>
          <path d="M 230 160 L 310 160 L 290 180 L 250 180 Z" fill="#3f3f46"/>
          <!-- 頂部轉軸 -->
          <circle cx="270" cy="50" r="10" fill="#fbbf24"/>

          <!-- 橫樑（依數值傾斜） -->
          <g transform="rotate(${tiltAngle}, 270, 50)">
            <rect x="70" y="47" width="400" height="6" rx="3" fill="#d4d4d8"/>
            
            <!-- 左吊盤 (被除數) -->
            <line x1="100" y1="50" x2="70" y2="105" stroke="#a1a1aa" stroke-width="1.5"/>
            <line x1="100" y1="50" x2="130" y2="105" stroke="#a1a1aa" stroke-width="1.5"/>
            <path d="M 60 105 Q 100 120 140 105 Z" fill="#27272a" stroke="#d4d4d8" stroke-width="2"/>
            <text x="100" y="98" fill="#e4e4e7" font-size="13" text-anchor="middle">被除數 ${dividend}</text>

            <!-- 右吊盤 (商的放大/縮小狀態) -->
            <line x1="440" y1="50" x2="410" y2="105" stroke="#a1a1aa" stroke-width="1.5"/>
            <line x1="440" y1="50" x2="470" y2="105" stroke="#a1a1aa" stroke-width="1.5"/>
            <path d="M 400 105 Q 440 120 480 105 Z" fill="#27272a" stroke="${isMagnified ? '#34d399' : '#f87171'}" stroke-width="2"/>
            <text x="440" y="98" fill="${isMagnified ? '#34d399' : '#f87171'}" font-size="13" text-anchor="middle">
              ${isMagnified ? '商 (質量放大！)' : '商 (質量縮小)'}
            </text>
          </g>

          <!-- 底部法則提示 -->
          <text x="270" y="195" fill="#facc15" font-size="13" text-anchor="middle">
            ${divisor < 1 
              ? (isEn ? `Divisor (${divisor} < 1) → Quotient > Dividend (EXPANDS)` : `除數 (${divisor} < 1) → 商 > 被除數（神奇放大！）`)
              : (isEn ? `Divisor (${divisor} > 1) → Quotient < Dividend (SHRINKS)` : `除數 (${divisor} > 1) → 商 < 被除數（質量縮小）`)}
          </text>
        </svg>
      </div>
    `;
  }

  // 3. 試管分裝與殘渣刻度圖 (SVG，魔王關餘數專用)
  renderBeakerRemainder(totalVol, bottleVol, bottlesCount, remainderVol, lang = 'zh') {
    const isEn = (lang === 'en');
    return `
      <div class="diagram-wrapper">
        <svg viewBox="0 0 540 190" class="alchemist-svg" xmlns="http://www.w3.org/2000/svg">
          <!-- 鍋爐主體 -->
          <rect x="30" y="30" width="130" height="120" rx="15" fill="#1e1e24" stroke="#71717a" stroke-width="2"/>
          <text x="95" y="22" fill="#a1a1aa" font-size="12" text-anchor="middle">${isEn ? 'Alchemy Boiler' : '靈泉鍋爐'}</text>
          <text x="95" y="70" fill="#38bdf8" font-size="16" font-weight="bold" text-anchor="middle">${totalVol} L</text>
          
          <!-- 殘渣液面 (底部高亮) -->
          <rect x="32" y="125" width="126" height="23" rx="4" fill="rgba(239, 68, 68, 0.45)" stroke="#ef4444" stroke-width="1.5"/>
          <text x="95" y="141" fill="#fca5a5" font-size="12" font-weight="bold" text-anchor="middle">
            ${isEn ? `Residue: ${remainderVol} L` : `底層殘渣：${remainderVol} 公升`}
          </text>

          <!-- 箭頭 -->
          <path d="M 180 90 L 220 90" stroke="#fbbf24" stroke-width="3" marker-end="url(#arrow)"/>

          <!-- 成功裝瓶 -->
          <g transform="translate(240, 40)">
            <rect x="0" y="0" width="70" height="100" rx="8" fill="#18181b" stroke="#34d399" stroke-width="2"/>
            <rect x="5" y="25" width="60" height="70" rx="4" fill="rgba(52, 211, 153, 0.3)"/>
            <text x="35" y="60" fill="#34d399" font-size="16" font-weight="bold" text-anchor="middle">${bottleVol}L</text>
            <text x="35" y="125" fill="#e4e4e7" font-size="13" text-anchor="middle">
              ${isEn ? `× ${bottlesCount} Vials` : `× 完整 ${bottlesCount} 瓶`}
            </text>
          </g>

          <!-- 重點提醒標語 -->
          <rect x="340" y="45" width="180" height="85" rx="6" fill="#27272a" stroke="#f59e0b" stroke-width="1.5"/>
          <text x="430" y="70" fill="#fbbf24" font-size="13" font-weight="bold" text-anchor="middle">
            ${isEn ? '⚠️ CRITICAL CLUE' : '⚠️ 致命破咒線索'}
          </text>
          <text x="430" y="93" fill="#e4e4e7" font-size="12" text-anchor="middle">
            ${isEn ? `Residue is ${remainderVol} Liters` : `剩餘殘渣是 ${remainderVol} 公升`}
          </text>
          <text x="430" y="113" fill="#f87171" font-size="12" font-weight="bold" text-anchor="middle">
            ${isEn ? `NOT ${remainderVol * 10} Liters!` : `絕不是 ${remainderVol * 10} 公升！`}
          </text>
        </svg>
      </div>
    `;
  }

  // 4. 雙子幾何面積等量共鳴圖 (SVG)
  renderGeometryArea(base, height, rectLength, rectWidth, lang = 'zh') {
    const isEn = (lang === 'en');
    return `
      <div class="diagram-wrapper">
        <svg viewBox="0 0 540 180" class="alchemist-svg" xmlns="http://www.w3.org/2000/svg">
          <!-- 平行四邊形 -->
          <g transform="translate(40, 30)">
            <polygon points="30,10 170,10 140,90 0,90" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" stroke-width="2"/>
            <line x1="30" y1="10" x2="30" y2="90" stroke="#facc15" stroke-width="1.5" stroke-dasharray="3,3"/>
            <text x="70" y="110" fill="#38bdf8" font-size="12" text-anchor="middle">${isEn ? `Base: ${base}m` : `底：${base}m`}</text>
            <text x="45" y="55" fill="#facc15" font-size="12">${isEn ? `Height: ${height}m` : `高：${height}m`}</text>
            <text x="85" y="55" fill="#e4e4e7" font-size="13" font-weight="bold">${isEn ? 'Area = Base × Height' : '面積＝底×高'}</text>
          </g>

          <!-- 等號共鳴 -->
          <text x="240" y="85" fill="#fbbf24" font-size="28" font-weight="bold">=</text>

          <!-- 長方形 -->
          <g transform="translate(280, 30)">
            <rect x="0" y="10" width="180" height="80" fill="rgba(52, 211, 153, 0.2)" stroke="#34d399" stroke-width="2"/>
            <text x="90" y="110" fill="#34d399" font-size="12" text-anchor="middle">${isEn ? `Length: ${rectLength}m` : `長：${rectLength}m`}</text>
            <text x="195" y="55" fill="#fbbf24" font-size="12">${isEn ? `Width: ? m` : `寬：? m`}</text>
            <text x="90" y="55" fill="#e4e4e7" font-size="13" font-weight="bold">${isEn ? 'Width = Area ÷ Length' : '寬＝面積 ÷ 長'}</text>
          </g>
        </svg>
      </div>
    `;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AlchemistDiagramRenderer;
}
