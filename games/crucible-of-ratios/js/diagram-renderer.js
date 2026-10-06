/**
 * diagram-renderer.js - 第五單元「比與比值」專屬 SVG 動態幾何與概念鷹架渲染器
 * 依據關卡題型即時渲染向量圖，專注於概念圖解與架構指引，嚴禁直接洩漏答案數值。
 */
class DiagramRenderer {
  static render(type, data, lang = 'zh') {
    switch (type) {
      case 'symbolic_ratio':
        return this.renderSymbolicRatio(data, lang);
      case 'ratio_value':
        return this.renderRatioValue(data, lang);
      case 'unit_rate':
        return this.renderUnitRate(data, lang);
      case 'equivalent_conduits':
        return this.renderEquivalentConduits(data, lang);
      case 'simplest_integer_ratio':
        return this.renderSimplestIntegerRatio(data, lang);
      case 'fraction_decimal_ratio':
        return this.renderFractionDecimalRatio(data, lang);
      case 'missing_proportion':
        return this.renderMissingProportion(data, lang);
      case 'mixture_recipe':
        return this.renderMixtureRecipe(data, lang);
      case 'proportional_division':
        return this.renderProportionalDivision(data, lang);
      case 'shadow_projection':
        return this.renderShadowProjection(data, lang);
      default:
        return '';
    }
  }

  // 1. 符號之印與前後項辨別
  static renderSymbolicRatio(data, lang) {
    const { numA, numB, itemA, itemB } = data;
    const isZh = lang === 'zh';
    return `
      <svg viewBox="0 0 420 160" class="scaffold-svg">
        <rect width="420" height="160" rx="10" fill="#141c24" stroke="#2e4255" stroke-width="2"/>
        
        <!-- 前項槽 -->
        <g transform="translate(60, 40)">
          <rect width="110" height="75" rx="8" fill="#1b2836" stroke="#ffd60a" stroke-width="2"/>
          <text x="55" y="24" font-size="12" fill="#ffd60a" text-anchor="middle" font-weight="bold">${isZh ? '前項 (Antecedent)' : 'Antecedent'}</text>
          <text x="55" y="52" font-size="22" fill="#ffd60a" text-anchor="middle" font-weight="bold">${numA}</text>
          <text x="55" y="68" font-size="11" fill="#8e8e93" text-anchor="middle">${itemA}</text>
        </g>

        <!-- 冒號符號 -->
        <text x="210" y="86" font-size="34" fill="#ffffff" text-anchor="middle" font-weight="bold">：</text>

        <!-- 後項槽 -->
        <g transform="translate(250, 40)">
          <rect width="110" height="75" rx="8" fill="#1b2836" stroke="#4fc3f7" stroke-width="2"/>
          <text x="55" y="24" font-size="12" fill="#4fc3f7" text-anchor="middle" font-weight="bold">${isZh ? '後項 (Consequent)' : 'Consequent'}</text>
          <text x="55" y="52" font-size="22" fill="#4fc3f7" text-anchor="middle" font-weight="bold">${numB}</text>
          <text x="55" y="68" font-size="11" fill="#8e8e93" text-anchor="middle">${itemB}</text>
        </g>

        <!-- 底部提示 -->
        <text x="210" y="142" font-size="13" fill="#ff9f0a" text-anchor="middle">
          ${isZh ? '⚠️ 前項與後項位置固定，順序顛倒意義完全相反！' : '⚠️ Order is strict: Reversing terms changes the mathematical ratio!'}
        </text>
      </svg>
    `;
  }

  // 2. 同類量比值圖解 (柱狀高對比與除法商)
  static renderRatioValue(data, lang) {
    const { a, b, itemA, itemB } = data;
    const isZh = lang === 'zh';
    return `
      <svg viewBox="0 0 420 160" class="scaffold-svg">
        <rect width="420" height="160" rx="10" fill="#141c24" stroke="#2e4255" stroke-width="2"/>
        
        <!-- 兩數量對比條 -->
        <g transform="translate(50, 35)">
          <text x="0" y="20" font-size="13" fill="#ffd60a">${itemA}：</text>
          <rect x="90" y="6" width="${Math.min(180, a * 18)}" height="18" rx="4" fill="#ffd60a"/>
          <text x="${100 + Math.min(180, a * 18)}" y="20" font-size="13" fill="#ffd60a" font-weight="bold">${a}</text>

          <text x="0" y="50" font-size="13" fill="#4fc3f7">${itemB}：</text>
          <rect x="90" y="36" width="${Math.min(180, b * 18)}" height="18" rx="4" fill="#4fc3f7"/>
          <text x="${100 + Math.min(180, b * 18)}" y="50" font-size="13" fill="#4fc3f7" font-weight="bold">${b}</text>
        </g>

        <!-- 右側比值公式結構 -->
        <g transform="translate(300, 30)">
          <rect width="90" height="70" rx="8" fill="#1b2836" stroke="#30d158" stroke-width="2"/>
          <text x="45" y="20" font-size="12" fill="#30d158" text-anchor="middle" font-weight="bold">${isZh ? '比值 (Value)' : 'Value'}</text>
          <text x="45" y="40" font-size="15" fill="#ffd60a" text-anchor="middle">前項</text>
          <line x1="15" y1="46" x2="75" y2="46" stroke="#30d158" stroke-width="2"/>
          <text x="45" y="60" font-size="15" fill="#4fc3f7" text-anchor="middle">後項</text>
        </g>

        <text x="210" y="138" font-size="13" fill="#ffd60a" text-anchor="middle" font-weight="bold">
          ${isZh ? `比值 ＝ 前項 ÷ 後項 ＝ ${a} ÷ ${b} ＝ ？（請約成最簡分數）` : `Ratio Value = Antecedent ÷ Consequent = ${a} ÷ ${b} = ?`}
        </text>
      </svg>
    `;
  }

  // 3. 異類量單位變率圖解 (性價比)
  static renderUnitRate(data, lang) {
    const { vol1, price1, vol2, price2, itemA, itemB } = data;
    const isZh = lang === 'zh';
    return `
      <svg viewBox="0 0 420 160" class="scaffold-svg">
        <rect width="420" height="160" rx="10" fill="#141c24" stroke="#2e4255" stroke-width="2"/>
        
        <!-- 甲瓶 -->
        <g transform="translate(40, 30)">
          <rect width="150" height="75" rx="8" fill="#1b2836" stroke="#4fc3f7" stroke-width="1.5"/>
          <text x="15" y="22" font-size="13" fill="#4fc3f7" font-weight="bold">${itemA}</text>
          <text x="15" y="44" font-size="12" fill="#cfd8dc">容量：${vol1} mL</text>
          <text x="15" y="62" font-size="12" fill="#cfd8dc">售價：${price1} 靈石</text>
        </g>

        <!-- 乙瓶 -->
        <g transform="translate(230, 30)">
          <rect width="150" height="75" rx="8" fill="#1b2836" stroke="#ff9f0a" stroke-width="1.5"/>
          <text x="15" y="22" font-size="13" fill="#ff9f0a" font-weight="bold">${itemB}</text>
          <text x="15" y="44" font-size="12" fill="#cfd8dc">容量：${vol2} mL</text>
          <text x="15" y="62" font-size="12" fill="#cfd8dc">售價：${price2} 靈石</text>
        </g>

        <!-- 底部算式引導 -->
        <text x="210" y="135" font-size="13" fill="#30d158" text-anchor="middle" font-weight="bold">
          ${isZh ? '每 1 靈石購得容量 ＝ 總容量 ÷ 總價。比值越大代表每元買越多，越划算！' : 'Rate (mL / MP) = Total Volume ÷ Total MP. Higher rate is more cost-effective!'}
        </text>
      </svg>
    `;
  }

  // 4. 相等的比之管路判定
  static renderEquivalentConduits(data, lang) {
    const { baseA, baseB, pipes } = data;
    const isZh = lang === 'zh';
    return `
      <svg viewBox="0 0 420 160" class="scaffold-svg">
        <rect width="420" height="160" rx="10" fill="#141c24" stroke="#2e4255" stroke-width="2"/>
        
        <!-- 基準核心 -->
        <g transform="translate(25, 45)">
          <rect width="100" height="70" rx="8" fill="#243447" stroke="#ffd60a" stroke-width="2"/>
          <text x="50" y="25" font-size="12" fill="#ffd60a" text-anchor="middle" font-weight="bold">基準管路</text>
          ${MathFormatter.svgRatio(baseA, baseB, 50, 48, { size: 18 })}
        </g>

        <!-- 對接箭頭 -->
        <path d="M 135 80 L 165 80 M 155 72 L 165 80 L 155 88" stroke="#ffffff" stroke-width="2" fill="none"/>

        <!-- 四組候選管路 -->
        <g transform="translate(180, 20)">
          ${pipes.map((p, idx) => `
            <g transform="translate(${(idx % 2) * 110}, ${Math.floor(idx / 2) * 60})">
              <rect width="100" height="48" rx="6" fill="#1b2836" stroke="#4fc3f7" stroke-width="1.2"/>
              <text x="15" y="28" font-size="13" fill="#ffd60a" font-weight="bold">${p.label}</text>
              ${MathFormatter.svgRatio(p.a, p.b, 62, 28, { size: 14 })}
            </g>
          `).join('')}
        </g>

        <text x="210" y="148" font-size="12" fill="#cfd8dc" text-anchor="middle">
          ${isZh ? '比值相等的比，稱為相等的比！檢驗哪一管路的比值與基準完全相同' : 'Ratios with equivalent values match! Find the conduit matching the base ratio.'}
        </text>
      </svg>
    `;
  }

  // 5. 最簡整數比圖解 (最大公因數約分)
  static renderSimplestIntegerRatio(data, lang) {
    const { rawA, rawB, g, ansA, ansB } = data;
    const isZh = lang === 'zh';
    return `
      <svg viewBox="0 0 420 160" class="scaffold-svg">
        <rect width="420" height="160" rx="10" fill="#141c24" stroke="#2e4255" stroke-width="2"/>
        
        <!-- 原始比 -->
        <g transform="translate(60, 50)">
          <rect width="90" height="55" rx="8" fill="#1b2836" stroke="#4fc3f7" stroke-width="2"/>
          <text x="45" y="20" font-size="12" fill="#8e8e93" text-anchor="middle">原始比例</text>
          ${MathFormatter.svgRatio(rawA, rawB, 45, 40, { size: 18 })}
        </g>

        <!-- 中間約分大箭頭 -->
        <g transform="translate(165, 75)">
          <path d="M 0 0 L 80 0 M 65 -10 L 80 0 L 65 10" stroke="#ff9f0a" stroke-width="3" fill="none"/>
          <text x="40" y="-12" font-size="14" fill="#ff9f0a" text-anchor="middle" font-weight="bold">÷ GCD (${g})</text>
          <text x="40" y="22" font-size="12" fill="#8e8e93" text-anchor="middle">${isZh ? '前項後項同除' : 'Divide both'}</text>
        </g>

        <!-- 最簡整數比 -->
        <g transform="translate(265, 50)">
          <rect width="100" height="55" rx="8" fill="#1b2836" stroke="#30d158" stroke-width="2"/>
          <text x="50" y="20" font-size="12" fill="#30d158" text-anchor="middle" font-weight="bold">最簡整數比</text>
          <text x="25" y="42" font-size="20" fill="#ffd60a" font-weight="bold" text-anchor="middle">？</text>
          <text x="50" y="42" font-size="20" fill="#ffffff" font-weight="bold" text-anchor="middle">：</text>
          <text x="75" y="42" font-size="20" fill="#4fc3f7" font-weight="bold" text-anchor="middle">？</text>
        </g>

        <text x="210" y="142" font-size="13" fill="#ffd60a" text-anchor="middle">
          ${isZh ? '前項和後項互質（最大公因數為 1）時，即為最簡整數比！' : 'A ratio is in simplest integer form when antecedent and consequent are coprime!'}
        </text>
      </svg>
    `;
  }

  // 6. 分數與小數化簡圖解
  static renderFractionDecimalRatio(data, lang) {
    const { type, text_zh } = data;
    const isZh = lang === 'zh';
    return `
      <svg viewBox="0 0 420 160" class="scaffold-svg">
        <rect width="420" height="160" rx="10" fill="#141c24" stroke="#2e4255" stroke-width="2"/>
        
        <text x="210" y="30" font-size="15" fill="#ffd60a" text-anchor="middle" font-weight="bold">
          ${isZh ? `化為最簡整數比：[ ${text_zh} ]` : `Reduce to Simplest Integer Ratio`}
        </text>

        <!-- 流程步驟方塊 -->
        <g transform="translate(40, 50)">
          <rect width="150" height="55" rx="6" fill="#1b2836" stroke="#4fc3f7" stroke-width="1.5"/>
          <text x="75" y="24" font-size="12" fill="#4fc3f7" text-anchor="middle" font-weight="bold">
            ${type === 'fraction' ? (isZh ? '步驟 1：通分去分母' : 'Step 1: Multiply LCM') : (isZh ? '步驟 1：同乘 10 或 100' : 'Step 1: Multiply by 10/100')}
          </text>
          <text x="75" y="44" font-size="12" fill="#cfd8dc" text-anchor="middle">
            ${type === 'fraction' ? (isZh ? '同乘分母公倍數' : 'Clear denominators') : (isZh ? '小數化為整數' : 'Convert to integers')}
          </text>
        </g>

        <!-- 轉換箭頭 -->
        <path d="M 205 78 L 235 78 M 225 70 L 235 78 L 225 86" stroke="#ffffff" stroke-width="2" fill="none"/>

        <g transform="translate(245, 50)">
          <rect width="140" height="55" rx="6" fill="#1b2836" stroke="#30d158" stroke-width="1.5"/>
          <text x="70" y="24" font-size="12" fill="#30d158" text-anchor="middle" font-weight="bold">
            ${isZh ? '步驟 2：約分至互質' : 'Step 2: Reduce by GCD'}
          </text>
          <text x="70" y="44" font-size="12" fill="#cfd8dc" text-anchor="middle">
            ${isZh ? '同除以最大公因數' : 'Divide by common factors'}
          </text>
        </g>

        <text x="210" y="138" font-size="13" fill="#30d158" text-anchor="middle">
          ${isZh ? '最簡整數比的前項與後項都必須是整數！' : 'Both terms in simplest integer ratio MUST be integers!'}
        </text>
      </svg>
    `;
  }

  // 7. 比例式未知項圖解 (雙向倍數對照箭頭)
  static renderMissingProportion(data, lang) {
    const { a, b, c, d, unknown, knownPos, expr_zh } = data;
    const isZh = lang === 'zh';
    return `
      <svg viewBox="0 0 420 160" class="scaffold-svg">
        <rect width="420" height="160" rx="10" fill="#141c24" stroke="#2e4255" stroke-width="2"/>
        
        <text x="210" y="30" font-size="15" fill="#ffd60a" text-anchor="middle" font-weight="bold">
          ${isZh ? `比例式：${expr_zh}` : `Proportion Equation`}
        </text>

        <!-- 兩比例對位 -->
        <g transform="translate(90, 75)">
          <!-- 左比 -->
          <text x="30" y="10" font-size="24" fill="#ffd60a" font-weight="bold" text-anchor="middle">${a}</text>
          <text x="65" y="10" font-size="24" fill="#ffffff" font-weight="bold" text-anchor="middle">：</text>
          <text x="100" y="10" font-size="24" fill="#4fc3f7" font-weight="bold" text-anchor="middle">${b}</text>

          <text x="145" y="10" font-size="24" fill="#ffffff" font-weight="bold" text-anchor="middle">＝</text>

          <!-- 右比 -->
          <text x="190" y="10" font-size="24" fill="${unknown === 'c' ? '#30d158' : '#ffd60a'}" font-weight="bold" text-anchor="middle">${unknown === 'c' ? '□' : c}</text>
          <text x="225" y="10" font-size="24" fill="#ffffff" font-weight="bold" text-anchor="middle">：</text>
          <text x="260" y="10" font-size="24" fill="${unknown === 'd' ? '#30d158' : '#4fc3f7'}" font-weight="bold" text-anchor="middle">${unknown === 'd' ? '□' : d}</text>
        </g>

        <!-- 倍數對應弧線 -->
        <g transform="translate(90, 75)">
          <!-- 前項倍數弧線 -->
          <path d="M 30 -15 C 70 -40, 150 -40, 190 -15" fill="none" stroke="#ffd60a" stroke-width="2" stroke-dasharray="4,3"/>
          <text x="110" y="-35" font-size="12" fill="#ffd60a" text-anchor="middle">同倍率擴大或縮小</text>

          <!-- 後項倍數弧線 -->
          <path d="M 100 25 C 140 50, 220 50, 260 25" fill="none" stroke="#4fc3f7" stroke-width="2" stroke-dasharray="4,3"/>
          <text x="180" y="52" font-size="12" fill="#4fc3f7" text-anchor="middle">同倍率擴大或縮小</text>
        </g>

        <text x="210" y="148" font-size="12" fill="#cfd8dc" text-anchor="middle">
          ${isZh ? '觀察已知項變為幾倍，未知項跟著變為相同的倍數！' : 'Find the scale factor on the known pair and apply it to the unknown term!'}
        </text>
      </svg>
    `;
  }

  // 8. 秘藥調配等比縮放圖解
  static renderMixtureRecipe(data, lang) {
    const { ante, cons, itemA_zh, itemB_zh, isGivenA } = data;
    const isZh = lang === 'zh';
    return `
      <svg viewBox="0 0 420 160" class="scaffold-svg">
        <rect width="420" height="160" rx="10" fill="#141c24" stroke="#2e4255" stroke-width="2"/>
        
        <text x="210" y="28" font-size="14" fill="#ffd60a" text-anchor="middle" font-weight="bold">
          ${itemA_zh} ： ${itemB_zh} ＝ ${ante} ： ${cons}
        </text>

        <!-- 調配燒杯示意 -->
        <g transform="translate(80, 50)">
          <rect width="80" height="60" rx="4" fill="#1b2836" stroke="#ffd60a" stroke-width="2"/>
          <text x="40" y="24" font-size="12" fill="#ffd60a" text-anchor="middle">${itemA_zh}</text>
          <text x="40" y="45" font-size="16" fill="#ffd60a" font-weight="bold">${isGivenA ? data.givenA : '？'}</text>
        </g>

        <text x="210" y="85" font-size="28" fill="#ffffff" text-anchor="middle" font-weight="bold">：</text>

        <g transform="translate(260, 50)">
          <rect width="80" height="60" rx="4" fill="#1b2836" stroke="#4fc3f7" stroke-width="2"/>
          <text x="40" y="24" font-size="12" fill="#4fc3f7" text-anchor="middle">${itemB_zh}</text>
          <text x="40" y="45" font-size="16" fill="#4fc3f7" font-weight="bold">${!isGivenA ? data.givenB : '？'}</text>
        </g>

        <text x="210" y="138" font-size="13" fill="#30d158" text-anchor="middle" font-weight="bold">
          ${isZh ? '列出等比式：原比 ＝ 目標量：□，找出倍數關係推算！' : 'Set up: Base Ratio = Known : □. Apply the common scale factor!'}
        </text>
      </svg>
    `;
  }

  // 9. 按比例分配總量圖解 (線段分割與總份數)
  static renderProportionalDivision(data, lang) {
    const { ante, cons, total, nameA_zh, nameB_zh, unit_zh } = data;
    const isZh = lang === 'zh';
    const totalParts = ante + cons;
    const barWidth = 300;
    const partAWidth = (barWidth * ante) / totalParts;
    const partBWidth = barWidth - partAWidth;

    return `
      <svg viewBox="0 0 420 160" class="scaffold-svg">
        <rect width="420" height="160" rx="10" fill="#141c24" stroke="#2e4255" stroke-width="2"/>
        
        <!-- 頂部總量大括號 -->
        <path d="M 60 40 L 60 30 L 210 30 L 210 20 L 210 30 L 360 30 L 360 40" fill="none" stroke="#64d2ff" stroke-width="2"/>
        <text x="210" y="16" font-size="14" fill="#64d2ff" text-anchor="middle" font-weight="bold">
          ${isZh ? `總量：${total} ${unit_zh}` : `Total: ${total} ${unit_zh}`}
        </text>

        <!-- 比例線段分割本體 -->
        <g transform="translate(60, 50)">
          <!-- A 部分 -->
          <rect x="0" y="0" width="${partAWidth}" height="32" rx="4" fill="#ffd60a" opacity="0.85"/>
          <text x="${partAWidth / 2}" y="20" font-size="12" fill="#000000" text-anchor="middle" font-weight="bold">
            ${nameA_zh} (${ante}份)
          </text>

          <!-- B 部分 -->
          <rect x="${partAWidth}" y="0" width="${partBWidth}" height="32" rx="4" fill="#4fc3f7" opacity="0.85"/>
          <text x="${partAWidth + partBWidth / 2}" y="20" font-size="12" fill="#000000" text-anchor="middle" font-weight="bold">
            ${nameB_zh} (${cons}份)
          </text>
        </g>

        <!-- 底部算式結構 -->
        <g transform="translate(210, 120)">
          <text x="0" y="0" font-size="13" fill="#ffd60a" text-anchor="middle" font-weight="bold">
            ${isZh ? `總共分成 ${ante} ＋ ${cons} ＝ ${totalParts} 份` : `Total Parts = ${ante} + ${cons} = ${totalParts}`}
          </text>
          <text x="0" y="22" font-size="13" fill="#30d158" text-anchor="middle" font-weight="bold">
            ${isZh ? `${nameA_zh} 佔全體的 ${ante}/${totalParts} ➡️ ${total} × (${ante}/${totalParts}) ＝ ？` : `${nameA_zh} fraction: ${ante}/${totalParts}`}
          </text>
        </g>
      </svg>
    `;
  }

  // 10. 太陽平行光日晷投影圖解 (物高與影長比)
  static renderShadowProjection(data, lang) {
    const { rodHeight, rodShadow, poleShadow, item_zh } = data;
    const isZh = lang === 'zh';
    return `
      <svg viewBox="0 0 420 160" class="scaffold-svg">
        <rect width="420" height="160" rx="10" fill="#141c24" stroke="#2e4255" stroke-width="2"/>
        
        <!-- 太陽圖示 -->
        <g transform="translate(45, 25)">
          <circle cx="0" cy="0" r="12" fill="#ffd60a"/>
          <line x1="-18" y1="0" x2="18" y2="0" stroke="#ffd60a" stroke-width="2"/>
          <line x1="0" y1="-18" x2="0" y2="18" stroke="#ffd60a" stroke-width="2"/>
          <line x1="-12" y1="-12" x2="12" y2="12" stroke="#ffd60a" stroke-width="2"/>
          <line x1="-12" y1="12" x2="12" y2="-12" stroke="#ffd60a" stroke-width="2"/>
        </g>

        <!-- 標竿小三角形投影 -->
        <g transform="translate(100, 110)">
          <!-- 地面 -->
          <line x1="-10" y1="0" x2="60" y2="0" stroke="#8e8e93" stroke-width="2"/>
          <!-- 竿子 -->
          <line x1="0" y1="0" x2="0" y2="-45" stroke="#ffd60a" stroke-width="3"/>
          <text x="-8" y="-22" font-size="11" fill="#ffd60a" text-anchor="end">${rodHeight}cm</text>
          <!-- 影子 -->
          <line x1="0" y1="0" x2="35" y2="0" stroke="#4fc3f7" stroke-width="4"/>
          <text x="18" y="16" font-size="11" fill="#4fc3f7" text-anchor="middle">${rodShadow}cm</text>
          <!-- 太陽光線斜邊 -->
          <line x1="0" y1="-45" x2="35" y2="0" stroke="#ffd60a" stroke-width="1.5" stroke-dasharray="3,2"/>
          <text x="10" y="-52" font-size="10" fill="#cfd8dc">標竿</text>
        </g>

        <!-- 巨大神像投影 -->
        <g transform="translate(260, 110)">
          <!-- 地面 -->
          <line x1="-10" y1="0" x2="120" y2="0" stroke="#8e8e93" stroke-width="2"/>
          <!-- 神殿柱 -->
          <rect x="-8" y="-80" width="16" height="80" fill="#2c3e50" stroke="#30d158" stroke-width="2"/>
          <text x="-16" y="-40" font-size="12" fill="#30d158" text-anchor="end" font-weight="bold">高：？</text>
          <!-- 影子 -->
          <line x1="0" y1="0" x2="85" y2="0" stroke="#4fc3f7" stroke-width="5"/>
          <text x="42" y="18" font-size="12" fill="#4fc3f7" text-anchor="middle" font-weight="bold">${poleShadow}cm</text>
          <!-- 太陽光線斜邊 -->
          <line x1="0" y1="-80" x2="85" y2="0" stroke="#ffd60a" stroke-width="1.5" stroke-dasharray="4,2"/>
          <text x="0" y="-88" font-size="11" fill="#30d158" font-weight="bold" text-anchor="middle">${item_zh}</text>
        </g>

        <!-- 底部比例等式指引 -->
        <text x="210" y="148" font-size="12" fill="#ffd60a" text-anchor="middle" font-weight="bold">
          ${isZh ? '同一時刻光線平行：標竿高：標竿影 ＝ 實體高：神像影' : 'Height : Shadow Length is constant across all objects!'}
        </text>
      </svg>
    `;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DiagramRenderer;
}
