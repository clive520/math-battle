/**
 * 3D 數學立體群島大冒險 - 中英雙語國際化管理器 (i18n Engine)
 * 支援中英雙語隨時無縫一鍵切換，狀態持久化存於 localStorage
 */

export class I18nManager {
  constructor() {
    this.storageKey = "math_3d_island_lang_v1";
    this.lang = localStorage.getItem(this.storageKey) || "zh";
  }

  getLang() {
    return this.lang;
  }

  setLang(lang) {
    this.lang = lang === "en" ? "en" : "zh";
    localStorage.setItem(this.storageKey, this.lang);
  }

  toggle() {
    this.setLang(this.lang === "zh" ? "en" : "zh");
    return this.lang;
  }

  t(key, params = {}) {
    let str = (I18N_STRINGS[this.lang] && I18N_STRINGS[this.lang][key]) ||
              (I18N_STRINGS.zh && I18N_STRINGS.zh[key]) || key;

    // 替換參數如 {id}, {name}, {s}, {c}
    Object.keys(params).forEach(k => {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), params[k]);
    });
    return str;
  }
}

export const I18N_STRINGS = {
  zh: {
    langBtn: "🌐 English",
    home: "大廳",
    title: "🏝️ 3D 數學立體群島大冒險",
    subtitle: "國小六年級第一次定期評量・五芒星數域試煉",
    starsUnit: "星",
    levelsUnit: "關",
    resetCam: "重返群島全景視角 (快捷鍵 R)",
    timeMode: "切換白天/夕陽/星空氛圍",
    soundOn: "開啟/關閉音效 (快捷鍵 M)",
    fullscreen: "切換全螢幕模式 (快捷鍵 F)",
    welcomeTip: "🎮 點擊任一島嶼即可平滑放大！無作答順序限制，任選關卡自由挑戰！",
    fastTravel: "快速傳送：",
    islandPrefix: "島嶼",
    submitBtn: "⚡ 提交驗證解答",
    submitNext: "✓ 完成本關試煉（返回群島）",
    submitRetry: "🔄 換個選項再試一次",
    correctTitle: "太棒了！答對了！獲得 ",
    wrongTitle: "答案錯誤！請再想想看",
    wrongTip: "💡 仔細閱讀上方迷思陷阱說明，重新推導計算，換個選項再試一次！",
    solutionTitle: "【完整解題步驟與觀念覆盤】",
    tagCorrect: "✓ 答對了！",
    tagWrong: "✕ 答案錯誤",
    statusCleared: "⭐ 已獲 {s} 星",
    statusNew: "🎯 尚未挑戰",
    qLabel: "【試煉題目】",
    focusToast: "🔍 已平滑聚焦到：島嶼 0{id}【{name}】",
    clearToast: "✨ 恭喜通過！獲得 {s} 顆星！累計已完成 {c} / 25 關！",

    // 結業證書專用詞彙
    certTitle: "數域宗師・結業證書",
    certEngTitle: "CERTIFICATE OF MATHEMATICS MASTERY",
    certPrefix: "茲證明",
    certClassLbl: "班級",
    certClassDefault: "六年一班",
    certSeatLbl: "座號",
    certSeatDefault: "01",
    certNameLbl: "姓名",
    certNameDefault: "數學小勇者",
    certSuffix: "同學",
    certBody: "於本學期<strong>「五芒星數域試煉塔」3D 群島立體闖關</strong>評量中，憑藉卓越的邏輯思維與不懈毅力，成功解開<strong>最大公因數與最小公倍數、分數除法、數量關係、小數除法與比和比值</strong>五大單元全部 25 道數學封印，思維敏銳，融會貫通，成績優異，特頒此證，以茲嘉勉！",
    certProgressLbl: "完成進度",
    certFullLevels: "25 / 25 全關卡",
    certStarsLbl: "榮譽星級",
    certRankLbl: "數域稱號",
    certRankVal: "鑽石級數域宗師",
    certTeacherLbl: "命題評量導師",
    certTeacherVal: "高志賢 老師 ✍️",
    certDateLbl: "頒發日期",
    certSealLine1: "鹿陽國小",
    certSealLine2: "數域試煉",
    certSealLine3: "考核合格",
    certPrintBtn: "🖨️ 列印 / 另存 PDF 證書",
    certReplayBtn: "🔄 重新挑戰全島",
    certHomeBtn: "🏠 返回遊戲大廳",
    certResetConfirm: "確定要重置目前的所有闖關進度，重新體驗 3D 數學立體群島大冒險嗎？"
  },
  en: {
    langBtn: "🌐 繁體中文",
    home: "Lobby",
    title: "🏝️ 3D Math Island Quest",
    subtitle: "Grade 6 Math Midterm Assessment: Five-Star Realm Trial",
    starsUnit: "Stars",
    levelsUnit: "Levels",
    resetCam: "Reset to Overview View (Hotkey R)",
    timeMode: "Toggle Day / Sunset / Night",
    soundOn: "Toggle Sound Effects (Hotkey M)",
    fullscreen: "Toggle Fullscreen (Hotkey F)",
    welcomeTip: "🎮 Click any island to zoom in smoothly! Free to explore all levels in any order!",
    fastTravel: "Fast Travel:",
    islandPrefix: "Island",
    submitBtn: "⚡ Submit Answer",
    submitNext: "✓ Level Complete (Return to Map)",
    submitRetry: "🔄 Try Another Option",
    correctTitle: "Awesome! That's Correct! Earned ",
    wrongTitle: "Incorrect! Please think again",
    wrongTip: "💡 Read the misconception analysis above, recalculate carefully, and try another option!",
    solutionTitle: "[Step-by-Step Solution & Concept Review]",
    tagCorrect: "✓ Correct!",
    tagWrong: "✕ Incorrect",
    statusCleared: "⭐ Passed ({s} Stars)",
    statusNew: "🎯 Not Attempted",
    qLabel: "[Challenge Problem]",
    focusToast: "🔍 Focused on: Island 0{id} [{name}]",
    clearToast: "✨ Level passed! Earned {s} stars! Completed {c} / 25 levels!",

    // Certificate
    certTitle: "Certificate of Mathematics Mastery",
    certEngTitle: "DISTINGUISHED MATHEMATICAL SCHOLAR",
    certPrefix: "This certifies that",
    certClassLbl: "Class",
    certClassDefault: "Grade 6-1",
    certSeatLbl: "Seat",
    certSeatDefault: "01",
    certNameLbl: "Name",
    certNameDefault: "Math Adventurer",
    certSuffix: "",
    certBody: "Has demonstrated exceptional mathematical reasoning, perseverance, and problem-solving skills in the <strong>Five-Star Realm 3D Island Quest</strong>, successfully mastering all 25 challenges across <strong>GCD & LCM, Fraction Division, Number Relations, Decimal Division, and Ratios</strong>. Awarded with high honors!",
    certProgressLbl: "Completion",
    certFullLevels: "25 / 25 All Levels",
    certStarsLbl: "Honor Stars",
    certRankLbl: "Realm Title",
    certRankVal: "Diamond Math Grandmaster",
    certTeacherLbl: "Evaluation Instructor",
    certTeacherVal: "Teacher Kao Chih-Hsien ✍️",
    certDateLbl: "Issue Date",
    certSealLine1: "LU-YANG",
    certSealLine2: "MATH QUEST",
    certSealLine3: "CERTIFIED",
    certPrintBtn: "🖨️ Print / Save as PDF",
    certReplayBtn: "🔄 Reset & Replay Quest",
    certHomeBtn: "🏠 Return to Lobby",
    certResetConfirm: "Are you sure you want to reset all quest progress and restart the 3D Math Island adventure?"
  }
};

export const i18n = new I18nManager();
