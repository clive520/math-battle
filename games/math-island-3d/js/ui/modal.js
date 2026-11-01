/**
 * 3D 數學立體群島大冒險 - 答題試煉彈窗與動態圖解互動視窗
 */

import { renderScaffoldSVG } from "./svg-renderer.js";
import { sound } from "../audio.js";

export class QuizModal {
  constructor(container, onLevelCompleted) {
    this.container = container;
    this.onLevelCompleted = onLevelCompleted;
    this.currentQuestion = null;
    this.selectedOptionIndex = -1;
    this.attempts = 0;
    this.usedHint = false;

    this.renderContainer();
    this.bindEvents();
  }

  renderContainer() {
    this.container.innerHTML = `
      <div id="quizOverlay" class="quiz-overlay">
        <div class="quiz-modal-box toy-pop">
          <!-- 頂部標題列 -->
          <div class="quiz-header">
            <div class="quiz-badge-row">
              <span id="quizUnitBadge" class="quiz-pill pill-unit">單元</span>
              <span id="quizTypeBadge" class="quiz-pill pill-type">題型</span>
            </div>
            <button id="btnQuizClose" class="quiz-close-btn" title="關閉視窗 (Esc)">✕</button>
          </div>

          <!-- 主體內容區 (可滾動) -->
          <div class="quiz-body">
            <h2 id="quizTitle" class="quiz-title">關卡名稱</h2>

            <!-- RPG 劇情情境引導 -->
            <div id="quizStoryBox" class="quiz-story-box">
              <span class="story-icon">📜</span>
              <p id="quizStoryText" class="story-text"></p>
            </div>

            <!-- 核心數學題目 -->
            <div class="quiz-question-box">
              <span class="q-label">【試煉題目】</span>
              <p id="quizQuestionText" class="question-text"></p>
            </div>

            <!-- 四選一選項卡片 -->
            <div id="quizOptionsList" class="quiz-options-grid"></div>

            <!-- 動態向量 SVG 圖解鷹架開關 -->
            <div class="scaffold-control">
              <button id="btnToggleScaffold" class="btn-scaffold-toggle">
                💡 <span>展開動態向量思維圖解 (解答鷹架)</span>
              </button>
              <div id="quizScaffoldContainer" class="scaffold-container" style="display: none;"></div>
            </div>

            <!-- 作答結果反饋區 (答題後展開) -->
            <div id="quizFeedbackBox" class="quiz-feedback-box" style="display: none;"></div>
          </div>

          <!-- 底部操作列 -->
          <div class="quiz-footer">
            <button id="btnQuizSubmit" class="quiz-btn-primary" disabled>
              ⚡ 提交驗證解答
            </button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // 關閉視窗
    document.getElementById("btnQuizClose").addEventListener("click", () => {
      sound.playClick();
      this.close();
    });

    // 點擊背景遮罩關閉
    document.getElementById("quizOverlay").addEventListener("click", e => {
      if (e.target.id === "quizOverlay") {
        sound.playClick();
        this.close();
      }
    });

    // ESC 鍵關閉
    window.addEventListener("keydown", e => {
      if (e.key === "Escape" && this.isOpen()) {
        this.close();
      }
    });

    // 展開/收合動態 SVG 圖解
    const btnScaffold = document.getElementById("btnToggleScaffold");
    const scaffoldBox = document.getElementById("quizScaffoldContainer");
    btnScaffold.addEventListener("click", () => {
      sound.playClick();
      this.usedHint = true;
      const isHidden = scaffoldBox.style.display === "none";
      scaffoldBox.style.display = isHidden ? "block" : "none";
      btnScaffold.classList.toggle("active", isHidden);
      btnScaffold.innerHTML = isHidden
        ? "💡 <span>收合思維圖解</span>"
        : "💡 <span>展開動態向量思維圖解 (解答鷹架)</span>";
    });

    // 提交解答
    document.getElementById("btnQuizSubmit").addEventListener("click", () => {
      this.submitAnswer();
    });
  }

  open(question) {
    this.currentQuestion = question;
    this.selectedOptionIndex = -1;
    this.attempts = 0;
    this.usedHint = false;

    // 填入題目基本資訊
    document.getElementById("quizUnitBadge").innerText = `${question.unitId}-0${question.levelNum} | 第 0${question.unitId} 單元`;
    document.getElementById("quizTypeBadge").innerText = question.type;
    document.getElementById("quizTitle").innerText = question.title;
    document.getElementById("quizStoryText").innerText = question.story;
    document.getElementById("quizQuestionText").innerText = question.question;

    // 重置圖解狀態
    const scaffoldBox = document.getElementById("quizScaffoldContainer");
    const btnScaffold = document.getElementById("btnToggleScaffold");
    scaffoldBox.style.display = "none";
    btnScaffold.classList.remove("active");
    btnScaffold.innerHTML = "💡 <span>展開動態向量思維圖解 (解答鷹架)</span>";
    scaffoldBox.innerHTML = renderScaffoldSVG(question.svgType);

    // 重置反饋區與送出按鈕
    const feedbackBox = document.getElementById("quizFeedbackBox");
    feedbackBox.style.display = "none";
    feedbackBox.className = "quiz-feedback-box";
    const submitBtn = document.getElementById("btnQuizSubmit");
    submitBtn.disabled = true;
    submitBtn.innerText = "⚡ 提交驗證解答";

    // 渲染選項
    this.renderOptions();

    // 顯示視窗
    const overlay = document.getElementById("quizOverlay");
    overlay.classList.add("active");
    sound.playClick();
  }

  renderOptions() {
    const list = document.getElementById("quizOptionsList");
    const letters = ["A", "B", "C", "D"];

    list.innerHTML = this.currentQuestion.options.map((opt, idx) => `
      <div class="option-card" data-idx="${idx}">
        <span class="opt-letter">${letters[idx]}</span>
        <div class="opt-text">${opt.text}</div>
      </div>
    `).join("");

    // 綁定選項點擊事件
    list.querySelectorAll(".option-card").forEach(card => {
      card.addEventListener("click", () => {
        sound.playSelect();
        const idx = parseInt(card.getAttribute("data-idx"), 10);
        this.selectOption(idx);
      });
    });
  }

  selectOption(index) {
    this.selectedOptionIndex = index;
    const cards = document.querySelectorAll(".option-card");
    cards.forEach((card, idx) => {
      card.classList.toggle("selected", idx === index);
    });

    const submitBtn = document.getElementById("btnQuizSubmit");
    submitBtn.disabled = false;
  }

  submitAnswer() {
    if (this.selectedOptionIndex < 0 || !this.currentQuestion) return;

    this.attempts++;
    const chosen = this.currentQuestion.options[this.selectedOptionIndex];
    const feedbackBox = document.getElementById("quizFeedbackBox");
    const submitBtn = document.getElementById("btnQuizSubmit");

    if (chosen.isCorrect) {
      // 答對處理
      sound.playCorrect();

      // 計算星級 (首次無求助 3 星；第二次 2 星；其餘 1 星)
      let stars = 3;
      if (this.attempts > 1) stars = 2;
      if (this.usedHint) stars = Math.min(stars, 2);
      if (this.attempts >= 3) stars = 1;

      const starStr = "⭐".repeat(stars);

      feedbackBox.className = "quiz-feedback-box success toy-pop";
      feedbackBox.innerHTML = `
        <div class="feedback-header">
          <span class="feedback-icon">🎉</span>
          <div class="feedback-title">
            <h3>試煉通過！恭喜獲得 ${starStr}</h3>
            <span class="feedback-sub">${chosen.reason}</span>
          </div>
        </div>
        <div class="solution-text">
          <strong>【完整解題步驟剖析】</strong>
          <pre>${this.currentQuestion.solution}</pre>
        </div>
      `;
      feedbackBox.style.display = "block";

      submitBtn.innerText = "✓ 完成本關試煉";
      submitBtn.onclick = () => {
        this.close();
        if (this.onLevelCompleted) {
          this.onLevelCompleted(this.currentQuestion.id, stars);
        }
      };

      // 自動展開思維圖解輔助覆盤
      document.getElementById("quizScaffoldContainer").style.display = "block";
    } else {
      // 答錯處理
      sound.playWrong();

      feedbackBox.className = "quiz-feedback-box error toy-pop";
      feedbackBox.innerHTML = `
        <div class="feedback-header">
          <span class="feedback-icon">⚠️</span>
          <div class="feedback-title">
            <h3>答案尚未完全正確，再推導一次！</h3>
            <span class="feedback-sub">${chosen.reason}</span>
          </div>
        </div>
        <p class="error-tip">💡 建議點擊上方「展開動態向量思維圖解」查看幾何數線或算式鷹架，能幫助你更快發現陷阱！</p>
      `;
      feedbackBox.style.display = "block";
    }
  }

  close() {
    const overlay = document.getElementById("quizOverlay");
    if (overlay) overlay.classList.remove("active");
  }

  isOpen() {
    const overlay = document.getElementById("quizOverlay");
    return overlay && overlay.classList.contains("active");
  }
}
