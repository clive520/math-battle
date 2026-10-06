/**
 * diagram-renderer.js - 分數除法專屬 SVG 動態幾何與概念鷹架渲染器
 * 依據關卡題型即時渲染向量圖，嚴禁直接洩漏最終計算商數，專注於概念圖解與架構指引。
 * 全面採用標準數學橫式分數符號（水平分數線、整數在左、分子居上、分母居下）。
 */
class DiagramRenderer {
  static render(type, data, lang = 'zh') {
    switch (type) {
      case 'reduction':
        return this.renderReduction(data, lang);
      case 'tape_measure':
        return this.renderTapeMeasure(data, lang);
      case 'common_denominator':
        return this.renderCommonDenominator(data, lang);
      case 'reciprocal_inversion':
        return this.renderReciprocalInversion(data, lang);
      case 'bucket_rate':
        return this.renderBucketRate(data, lang);
      case 'wire_density':
        return this.renderWireDensity(data, lang);
      case 'base_amount':
        return this.renderBaseAmount(data, lang);
      case 'bypass_gauge':
        return this.renderBypassGauge(data, lang);
      case 'rect_area':
        return this.renderRectArea(data, lang);
      default:
        return '';
    }
  }

  // 1. 最簡分數約分圖解 (Reduction Ladder)
  static renderReduction(data, lang) {
    const { whole, num, den, gcdVal } = data;
    const isZh = lang === 'zh';
    return `
      <svg viewBox="0 0 420 160" class="scaffold-svg">
        <rect width="420" height="160" rx="10" fill="#1b242e" stroke="#3a4f66" stroke-width="2"/>
        
        <!-- 原始分數 (標準數學橫式分數) -->
        ${MathFormatter.svgFraction(whole, num, den, 70, 75, { size: 28, align: 'center' })}

        <!-- 約分箭頭與最大公因數標記 -->
        <g transform="translate(145, 75)">
          <path d="M 0 0 L 80 0 M 65 -10 L 80 0 L 65 10" stroke="#ff9f0a" stroke-width="3" fill="none"/>
          <text x="40" y="-14" font-size="14" fill="#ff9f0a" text-anchor="middle">÷ GCD (${gcdVal})</text>
          <text x="40" y="24" font-size="13" fill="#8e8e93" text-anchor="middle">${isZh ? '分子分母同除以公因數' : 'Divide by common factor'}</text>
        </g>

        <!-- 最簡分數鷹架 -->
        ${MathFormatter.svgFraction(whole, '？', '？', 290, 75, { size: 28, color: '#30d158', align: 'center' })}
        <text x="348" y="80" font-size="13" fill="#30d158">${isZh ? '(最簡分數)' : '(Simplest)'}</text>
      </svg>
    `;
  }

  // 2. 數線/等分緞帶圖解 (Tape Measure)
  static renderTapeMeasure(data, lang) {
    const { totalNum, unitStep, den } = data;
    const isZh = lang === 'zh';
    return `
      <svg viewBox="0 0 420 160" class="scaffold-svg">
        <rect width="420" height="160" rx="10" fill="#1b242e" stroke="#3a4f66" stroke-width="2"/>
        
        <!-- 頂部總長度大括號標記 -->
        <path d="M 40 45 L 40 35 L 200 35 L 200 25 L 200 35 L 360 35 L 360 45" fill="none" stroke="#64d2ff" stroke-width="2"/>
        <g transform="translate(160, 20)">
          <text x="0" y="4" font-size="14" fill="#64d2ff" font-weight="bold">${isZh ? '總量：' : 'Total: '}</text>
          ${MathFormatter.svgFraction(0, totalNum, den, 55, 0, { size: 15, color: '#64d2ff', align: 'center' })}
        </g>

        <!-- 緞帶本體 -->
        <rect x="40" y="55" width="320" height="34" rx="4" fill="#2c3e50" stroke="#4fc3f7" stroke-width="2"/>
        
        <!-- 單位分割弧線示意 -->
        <rect x="40" y="55" width="70" height="34" fill="#0288d1" opacity="0.6"/>
        <rect x="110" y="55" width="70" height="34" fill="#03a9f4" opacity="0.4"/>
        ${MathFormatter.svgFraction(0, unitStep, den, 75, 72, { size: 14, color: '#ffffff', align: 'center' })}
        ${MathFormatter.svgFraction(0, unitStep, den, 145, 72, { size: 14, color: '#ffffff', align: 'center' })}
        <text x="250" y="77" font-size="16" fill="#8e8e93" text-anchor="middle">⋯ ⋯</text>

        <!-- 底部計算引導 -->
        <text x="210" y="128" font-size="14" fill="#ffd60a" text-anchor="middle" font-weight="bold">
          ${isZh ? `「${totalNum} 個單位量」分成「每份 ${unitStep} 個單位量」 ➡️ ${totalNum} ÷ ${unitStep} ＝ ？` : `Divide numerators directly: ${totalNum} ÷ ${unitStep} = ?`}
        </text>
      </svg>
    `;
  }

  // 3. 異分母通分圖解 (Common Denominator)
  static renderCommonDenominator(data, lang) {
    const { n1, d1, n2, d2, lcd } = data;
    const isZh = lang === 'zh';
    return `
      <svg viewBox="0 0 420 170" class="scaffold-svg">
        <rect width="420" height="170" rx="10" fill="#1b242e" stroke="#3a4f66" stroke-width="2"/>
        
        <text x="210" y="30" font-size="15" fill="#ffd60a" text-anchor="middle" font-weight="bold">
          ${isZh ? `先通分為公分母 [ ${lcd} ]` : `Align to LCD [ ${lcd} ]`}
        </text>

        <!-- 分數1 通分 -->
        <g transform="translate(60, 65)">
          ${MathFormatter.svgFraction(0, n1, d1, 35, 0, { size: 20, color: '#64d2ff', align: 'center' })}
          <path d="M 68 0 L 105 0 M 96 -7 L 105 0 L 96 7" fill="none" stroke="#64d2ff" stroke-width="2"/>
          ${MathFormatter.svgFraction(0, '？', lcd, 140, 0, { size: 20, color: '#30d158', align: 'center' })}
        </g>

        <!-- 分數2 通分 -->
        <g transform="translate(60, 115)">
          ${MathFormatter.svgFraction(0, n2, d2, 35, 0, { size: 20, color: '#ff9f0a', align: 'center' })}
          <path d="M 68 0 L 105 0 M 96 -7 L 105 0 L 96 7" fill="none" stroke="#ff9f0a" stroke-width="2"/>
          ${MathFormatter.svgFraction(0, '？', lcd, 140, 0, { size: 20, color: '#30d158', align: 'center' })}
        </g>

        <!-- 結論提示 -->
        <text x="210" y="152" font-size="13" fill="#e0e0e0" text-anchor="middle">
          ${isZh ? '通分成分母相同後，分子直接相除！' : 'Once denominators match, divide the new numerators!'}
        </text>
      </svg>
    `;
  }

  // 4. 顛倒相乘倒數翻轉 (Reciprocal Inversion)
  static renderReciprocalInversion(data, lang) {
    const { a, b, c, d } = data;
    const isZh = lang === 'zh';
    return `
      <svg viewBox="0 0 420 160" class="scaffold-svg">
        <rect width="420" height="160" rx="10" fill="#1b242e" stroke="#3a4f66" stroke-width="2"/>
        
        <!-- 左側：原始除法算式 -->
        <g transform="translate(45, 65)">
          ${MathFormatter.svgFraction(0, a, b, 25, 0, { size: 22, color: '#64d2ff', align: 'center' })}
          <text x="65" y="8" font-size="22" fill="#ffd60a">÷</text>
          <rect x="85" y="-22" width="55" height="44" rx="6" fill="#ff453a" fill-opacity="0.2" stroke="#ff453a" stroke-dasharray="3,3"/>
          ${MathFormatter.svgFraction(0, c, d, 112, 0, { size: 22, color: '#ff453a', align: 'center' })}
        </g>

        <!-- 中間轉換大箭頭 -->
        <g transform="translate(195, 65)">
          <path d="M 0 5 L 45 5 M 35 -3 L 45 5 L 35 13" fill="none" stroke="#ffd60a" stroke-width="3"/>
          <path d="M 15 -18 C 30 -28, 45 -28, 55 -16" fill="none" stroke="#ff3b30" stroke-width="2" stroke-dasharray="4,2"/>
          <text x="35" y="-30" font-size="12" fill="#ff453a" text-anchor="middle">${isZh ? '顛倒上下' : 'Invert'}</text>
        </g>

        <!-- 右側：乘法與倒數 -->
        <g transform="translate(255, 65)">
          ${MathFormatter.svgFraction(0, a, b, 25, 0, { size: 22, color: '#64d2ff', align: 'center' })}
          <text x="60" y="8" font-size="22" fill="#30d158">×</text>
          <rect x="80" y="-22" width="55" height="44" rx="6" fill="#30d158" fill-opacity="0.2" stroke="#30d158"/>
          ${MathFormatter.svgFraction(0, d, c, 107, 0, { size: 22, color: '#30d158', align: 'center' })}
        </g>

        <text x="210" y="138" font-size="13" fill="#ffd60a" text-anchor="middle">
          ${isZh ? '除號變乘號，除數分子與分母顛倒！相乘前可先交叉約分' : 'Change ÷ to × and invert the divisor fraction! Cross-cancel first.'}
        </text>
      </svg>
    `;
  }

  // 5. 注水水龍頭與水槽 (Bucket Rate)
  static renderBucketRate(data, lang) {
    const { rateW, rateN, rateD, capW, capN, capD } = data;
    const isZh = lang === 'zh';
    return `
      <svg viewBox="0 0 420 160" class="scaffold-svg">
        <rect width="420" height="160" rx="10" fill="#1b242e" stroke="#3a4f66" stroke-width="2"/>
        
        <!-- 水槽外框 -->
        <rect x="50" y="45" width="150" height="80" rx="8" fill="#1e3a5f" stroke="#64d2ff" stroke-width="2"/>
        <rect x="55" y="65" width="140" height="55" rx="4" fill="#007aff" opacity="0.6"/>
        <g transform="translate(110, 95)">
          ${MathFormatter.svgFraction(capW, capN, capD, 0, 0, { size: 18, color: '#ffffff', wholeColor: '#ffffff', align: 'center' })}
          <text x="32" y="6" font-size="16" fill="#ffffff" font-weight="bold">L</text>
        </g>

        <!-- 水龍頭符號 -->
        <path d="M 115 20 L 135 20 L 135 38" fill="none" stroke="#b0bec5" stroke-width="6"/>
        <circle cx="135" cy="46" r="3" fill="#64d2ff"/>

        <!-- 右側運算引導 -->
        <g transform="translate(225, 45)">
          <text x="0" y="16" font-size="14" fill="#ffd60a">💧 ${isZh ? '每分鐘注水：' : 'Rate / min:'}</text>
          <g transform="translate(10, 42)">
            ${MathFormatter.svgFraction(rateW, rateN, rateD, 20, 0, { size: 16, color: '#64d2ff', wholeColor: '#64d2ff', align: 'left' })}
            <text x="75" y="5" font-size="14" fill="#64d2ff" font-weight="bold">L/min</text>
          </g>
          <text x="0" y="78" font-size="14" fill="#30d158">⏱️ ${isZh ? '注滿時間 ＝ 總量 ÷ 速率' : 'Time = Total ÷ Rate'}</text>
        </g>
      </svg>
    `;
  }

  // 6. 導線每公尺密度 (Wire Density)
  static renderWireDensity(data, lang) {
    const { lenW, lenN, lenD, wtN, wtD } = data;
    const isZh = lang === 'zh';
    return `
      <svg viewBox="0 0 420 150" class="scaffold-svg">
        <rect width="420" height="150" rx="10" fill="#1b242e" stroke="#3a4f66" stroke-width="2"/>
        
        <!-- 電纜金屬棒 -->
        <rect x="50" y="55" width="310" height="20" rx="10" fill="#c07d32" stroke="#e6a15c" stroke-width="2"/>
        
        <!-- 頂部總重標註 -->
        <path d="M 50 45 L 50 35 L 205 35 L 205 25 L 205 35 L 360 35 L 360 45" fill="none" stroke="#ff9f0a" stroke-width="2"/>
        <g transform="translate(70, 20)">
          <text x="0" y="4" font-size="13" fill="#ff9f0a">${isZh ? '全段長 ' : 'Length: '}</text>
          ${MathFormatter.svgFraction(lenW, lenN, lenD, 55, 0, { size: 15, color: '#ff9f0a', wholeColor: '#ff9f0a', align: 'left' })}
          <text x="110" y="4" font-size="13" fill="#ff9f0a">m ➡️ 重 </text>
          ${MathFormatter.svgFraction(0, wtN, wtD, 185, 0, { size: 15, color: '#ff9f0a', align: 'left' })}
          <text x="225" y="4" font-size="13" fill="#ff9f0a">kg</text>
        </g>

        <!-- 底部 1 公尺標註 -->
        <path d="M 50 85 L 50 95 L 140 95 L 140 105 L 140 95 L 230 95 L 230 85" fill="none" stroke="#30d158" stroke-width="2"/>
        <text x="140" y="125" font-size="14" fill="#30d158" text-anchor="middle" font-weight="bold">
          ${isZh ? '1 公尺重 ＝ 總重量 ÷ 總長度 ＝ ？ kg' : '1 Meter Weight = Weight ÷ Length = ? kg'}
        </text>
      </svg>
    `;
  }

  // 7. 基準量求全部 (Base Amount)
  static renderBaseAmount(data, lang) {
    const { part, num, den } = data;
    const isZh = lang === 'zh';
    return `
      <svg viewBox="0 0 420 150" class="scaffold-svg">
        <rect width="420" height="150" rx="10" fill="#1b242e" stroke="#3a4f66" stroke-width="2"/>
        
        <!-- 長條底框 (全部 100%) -->
        <rect x="50" y="55" width="320" height="30" rx="6" fill="#2c3e50" stroke="#3a4f66" stroke-width="2"/>
        
        <!-- 部分著色 -->
        <rect x="50" y="55" width="${(320 * num) / den}" height="30" rx="6" fill="#007aff" opacity="0.8"/>
        
        <g transform="translate(${50 + (160 * num) / den}, 70)">
          <text x="-24" y="4" font-size="13" fill="#ffffff" font-weight="bold">${part} (</text>
          ${MathFormatter.svgFraction(0, num, den, 2, 0, { size: 13, color: '#ffffff', align: 'left' })}
          <text x="24" y="4" font-size="13" fill="#ffffff" font-weight="bold">)</text>
        </g>

        <g transform="translate(135, 30)">
          <text x="0" y="4" font-size="14" fill="#64d2ff">${isZh ? `部分是 ${part}，佔全部的 ` : `Portion: ${part}, ratio: `}</text>
          ${MathFormatter.svgFraction(0, num, den, isZh ? 140 : 150, 0, { size: 15, color: '#64d2ff', align: 'left' })}
        </g>

        <g transform="translate(60, 126)">
          <text x="0" y="4" font-size="14" fill="#ffd60a" font-weight="bold">
            ${isZh ? `全部基準量 ＝ 部分 ÷ 比率 ＝ ${part} ÷ ` : `Total = Portion ÷ Ratio = ${part} ÷ `}
          </text>
          ${MathFormatter.svgFraction(0, num, den, isZh ? 245 : 230, 0, { size: 15, color: '#ffd60a', align: 'left' })}
          <text x="${isZh ? 280 : 265}" y="4" font-size="14" fill="#ffd60a" font-weight="bold"> ＝ ？</text>
        </g>
      </svg>
    `;
  }

  // 8. 旁路閥門比較圖解 (Bypass Gauge)
  static renderBypassGauge(data, lang) {
    const { k, divStr } = data;
    const isZh = lang === 'zh';
    const hasSlash = String(divStr).includes('/');
    let divNum = divStr, divDen = 1;
    if (hasSlash) {
      const parts = divStr.split('/');
      divNum = parts[0];
      divDen = parts[1];
    }
    return `
      <svg viewBox="0 0 420 160" class="scaffold-svg">
        <rect width="420" height="160" rx="10" fill="#1b242e" stroke="#3a4f66" stroke-width="2"/>
        
        <g transform="translate(45, 45)">
          <text x="20" y="24" font-size="22" fill="#64d2ff" font-weight="bold">${k} ÷</text>
          ${hasSlash ? 
            MathFormatter.svgFraction(0, divNum, divDen, 80, 18, { size: 22, color: '#64d2ff', align: 'left' }) :
            `<text x="75" y="24" font-size="22" fill="#64d2ff" font-weight="bold">${divStr}</text>`
          }
          <circle cx="170" cy="18" r="22" fill="#2c3e50" stroke="#ffd60a" stroke-width="2"/>
          <text x="170" y="26" font-size="24" fill="#ffd60a" text-anchor="middle" font-weight="bold">？</text>
          <text x="235" y="24" font-size="22" fill="#64d2ff" font-weight="bold">${k}</text>
        </g>

        <!-- 比較法則指針 -->
        <g transform="translate(40, 105)">
          <text x="20" y="20" font-size="13" fill="#30d158">除數 &lt; 1 ➡️ 🔺 商 &gt; 被除數</text>
          <text x="180" y="20" font-size="13" fill="#ffd60a">除數 ＝ 1 ➡️ ⚖️ 商 ＝ 被除數</text>
          <text x="320" y="20" font-size="13" fill="#ff453a">除數 &gt; 1 ➡️ 🔻 商 &lt; 被除數</text>
        </g>
      </svg>
    `;
  }

  // 9. 長方形面積求寬 (Rect Area)
  static renderRectArea(data, lang) {
    const { areaW, areaN, areaD, lenW, lenN, lenD } = data;
    const isZh = lang === 'zh';
    return `
      <svg viewBox="0 0 420 150" class="scaffold-svg">
        <rect width="420" height="150" rx="10" fill="#1b242e" stroke="#3a4f66" stroke-width="2"/>
        
        <!-- 長方形本體 -->
        <rect x="70" y="35" width="230" height="85" fill="#1c3a4f" stroke="#00e5ff" stroke-width="2"/>
        
        <g transform="translate(130, 80)">
          <text x="0" y="4" font-size="14" fill="#ffd60a" font-weight="bold">${isZh ? '面積：' : 'Area: '}</text>
          ${MathFormatter.svgFraction(areaW, areaN, areaD, 50, 0, { size: 16, color: '#ffd60a', wholeColor: '#ffd60a', align: 'left' })}
          <text x="100" y="4" font-size="14" fill="#ffd60a" font-weight="bold">m²</text>
        </g>

        <!-- 長與寬標註 -->
        <g transform="translate(130, 22)">
          <text x="0" y="4" font-size="13" fill="#64d2ff">${isZh ? '長：' : 'Length: '}</text>
          ${MathFormatter.svgFraction(lenW, lenN, lenD, 35, 0, { size: 15, color: '#64d2ff', wholeColor: '#64d2ff', align: 'left' })}
          <text x="80" y="4" font-size="13" fill="#64d2ff">m</text>
        </g>
        <text x="45" y="82" font-size="14" fill="#30d158" text-anchor="middle" font-weight="bold">
          寬: ？
        </text>

        <!-- 右側公式引導 -->
        <text x="360" y="82" font-size="13" fill="#e0e0e0" text-anchor="middle">
          ${isZh ? '寬 ＝ 面積 ÷ 長' : 'Width = Area ÷ Length'}
        </text>
      </svg>
    `;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DiagramRenderer;
}
