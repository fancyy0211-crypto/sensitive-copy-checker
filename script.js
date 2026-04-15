const STORAGE_KEYS = {
  uploadedLexiconCsv: "sensitiveUploadedLexiconCsv",
  uploadedLexiconName: "sensitiveUploadedLexiconName",
  legacyLexiconCsv: "sensitiveLexiconCsv",
  legacyLexiconName: "sensitiveLexiconName",
  history: "sensitiveCheckHistory",
};

const REQUIRED_CSV_HEADERS = ["word", "category", "risk_level", "replace", "note"];

const DEFAULT_CSV_FALLBACK = `word,category,risk_level,replace,note
提分,效果承诺,高,学习进步/能力提升/素养提升,涉及成绩承诺
保证提分,效果承诺,高,助力成长/提供支持,绝对承诺违规
突飞猛进,效果承诺,中,稳步提升/持续进步,
高分,效果承诺,高,良好表现/学习成果,
秒懂,效果承诺,中,更好理解/逐步掌握,
秒解,效果承诺,中,逐步理解/掌握方法,
X天突破,效果承诺,高,阶段性提升/持续优化,
攻克难题,效果承诺,中,理解重点/掌握方法,
一次通过,承诺类,高,逐步达成/系统学习,
包过,承诺类,高,提供学习支持,
必过,承诺类,高,持续学习支持,
押题,应试导向,高,重点梳理/内容解析,
押中,应试导向,高,重点解析,
必考,应试导向,高,重点内容,
必学,应试导向,中,核心内容,
升学,学科导向,高,成长路径/学习规划,
小升初,学科导向,高,学习过渡/能力衔接,
幼小衔接,学科导向,高,学习过渡/成长衔接,
名校,学科导向,高,优质发展路径,
状元,学科导向,高,优秀学习者,
考点,学科导向,中,重点内容,
真题,学科导向,中,经典案例/示例内容,
应试,学科导向,中,学习应用,
不学就落后,焦虑营销,高,提前准备更从容,
逆袭,焦虑营销,中,成长进阶/自我提升,
输在起跑线,焦虑营销,高,把握成长节奏,
再不报名就晚了,焦虑营销,高,建议尽早了解,
满班预警,焦虑营销,中,名额有限,
快速,夸大宣传,中,更高效,
轻松,夸大宣传,中,更有方法,
秒杀难题,夸大宣传,高,有效应对问题,
全部搞定,夸大宣传,中,系统掌握,
全面提升,夸大宣传,中,多维提升,
最好,极限词,高,优质/出色,
最强,极限词,高,更具优势,
顶级,极限词,高,高品质,
极致,极限词,高,持续优化,
完美,极限词,中,更完善,
无与伦比,极限词,高,独特体验,
第一,排名词,高,广受认可/受欢迎,
NO.1,排名词,高,优选品牌,
唯一,极限词,高,特有优势,
国家推荐,权威背书,高,广受关注,
专家推荐,权威背书,高,专业支持,
权威认证,权威背书,中,规范体系,
官方指定,权威背书,高,标准参考,
限今日,促销用语,高,限时开放（需具体时间）, 
最低价,促销用语,高,优惠方案,
免费领,促销用语,高,体验机会,
0元,促销用语,中,限时体验,
抢疯了,促销用语,中,广受欢迎,
错过不再,促销用语,高,建议尽早了解,
绝版,稀缺类,高,限量提供,
稀缺,稀缺类,中,名额有限,
千金难求,稀缺类,高,受欢迎,
不可复制,稀缺类,中,独特设计,
提前学,提前教学,高,提前了解,
早培,提前教学,高,兴趣培养,
超前学习,提前教学,高,适度拓展,
抢跑,提前教学,中,提前准备,
行业第一,排名词,高,行业认可,
销量第一,排名词,高,广受欢迎,
全国第一,排名词,高,多地用户选择,
TOP1,排名词,高,优选品牌`;

const riskLevelMap = {
  高: {
    className: "risk-high",
    text: "高风险",
    message: "存在明显违规表达，建议优先调整后再使用。",
    accent: "var(--danger-text)",
  },
  中: {
    className: "risk-medium",
    text: "中风险",
    message: "存在部分风险表达，建议进一步优化语气和表述。",
    accent: "var(--warning-text)",
  },
  低: {
    className: "risk-low",
    text: "低风险",
    message: "当前未发现明显风险表达，整体状态相对平稳。",
    accent: "var(--success-text)",
  },
};

const elements = {
  contentInput: document.getElementById("contentInput"),
  detectButton: document.getElementById("detectButton"),
  clearButton: document.getElementById("clearButton"),
  replaceButton: document.getElementById("replaceButton"),
  csvUpload: document.getElementById("csvUpload"),
  previewOutput: document.getElementById("previewOutput"),
  previewHint: document.getElementById("previewHint"),
  riskBadge: document.getElementById("riskBadge"),
  riskText: document.getElementById("riskText"),
  riskAccent: document.getElementById("riskAccent"),
  hitCount: document.getElementById("hitCount"),
  highCount: document.getElementById("highCount"),
  mediumCount: document.getElementById("mediumCount"),
  lowCount: document.getElementById("lowCount"),
  categorySummary: document.getElementById("categorySummary"),
  resultList: document.getElementById("resultList"),
  historyList: document.getElementById("historyList"),
  clearHistoryButton: document.getElementById("clearHistoryButton"),
  lexiconName: document.getElementById("lexiconName"),
  lexiconMeta: document.getElementById("lexiconMeta"),
};

let currentLexicon = [];
let currentLexiconSource = "默认词库";
let currentLexiconMeta = "";
let lastMatches = [];
let baseLexicon = [];
let baseLexiconSource = "默认词库";
let baseLexiconMeta = "";
let uploadedLexicon = [];
let uploadedLexiconName = "";

async function initialize() {
  bindEvents();
  renderPreview("", []);
  renderEmptyResults();
  renderHistory();
  await loadLexicon();
}

function bindEvents() {
  elements.detectButton.addEventListener("click", handleDetect);
  elements.clearButton.addEventListener("click", handleClear);
  elements.replaceButton.addEventListener("click", handleReplaceRecommended);
  elements.csvUpload.addEventListener("change", handleCsvUpload);
  elements.clearHistoryButton.addEventListener("click", clearHistory);
}

async function loadLexicon() {
  try {
    const response = await fetch("./敏感词词库.csv");
    if (!response.ok) {
      throw new Error("默认 CSV 读取失败");
    }
    const csvText = await response.text();
    baseLexicon = parseCsv(csvText);
    baseLexiconSource = "默认词库";
    baseLexiconMeta = `共 ${baseLexicon.length} 条词库，来自项目内 CSV 文件`;
  } catch (error) {
    baseLexicon = parseCsv(DEFAULT_CSV_FALLBACK);
    baseLexiconSource = "默认词库（内置兜底）";
    baseLexiconMeta = "当前浏览器限制了本地 CSV 读取，已自动切换为内置词库";
  }

  hydrateUploadedLexicon();
  rebuildCurrentLexicon();
}

function updateLexiconStatus() {
  elements.lexiconName.textContent = currentLexiconSource;
  elements.lexiconMeta.textContent = currentLexiconMeta;
}

function hydrateUploadedLexicon() {
  const savedCsv =
    localStorage.getItem(STORAGE_KEYS.uploadedLexiconCsv) ||
    localStorage.getItem(STORAGE_KEYS.legacyLexiconCsv);
  const savedName =
    localStorage.getItem(STORAGE_KEYS.uploadedLexiconName) ||
    localStorage.getItem(STORAGE_KEYS.legacyLexiconName);

  if (!savedCsv) {
    uploadedLexicon = [];
    uploadedLexiconName = "";
    return;
  }

  try {
    uploadedLexicon = parseCsv(savedCsv);
    uploadedLexiconName = savedName || "本地补充词库";
    migrateLegacyLexiconStorage(savedCsv, uploadedLexiconName);
  } catch (error) {
    uploadedLexicon = [];
    uploadedLexiconName = "";
    clearUploadedLexiconStorage();
  }
}

function rebuildCurrentLexicon() {
  currentLexicon = mergeLexiconEntries(baseLexicon, uploadedLexicon);

  if (uploadedLexicon.length) {
    currentLexiconSource = "默认词库 + 补充词库";
    currentLexiconMeta =
      `默认词库 ${baseLexicon.length} 条，补充词条 ${uploadedLexicon.length} 条` +
      `（最近上传：${uploadedLexiconName}），当前生效 ${currentLexicon.length} 条`;
  } else {
    currentLexiconSource = baseLexiconSource;
    currentLexiconMeta = `${baseLexiconMeta}，你也可以继续上传 CSV 词库补充使用`;
  }

  updateLexiconStatus();
}

function mergeLexiconEntries(baseEntries, extraEntries) {
  const mergedMap = new Map();

  baseEntries.forEach((entry) => {
    mergedMap.set(createLexiconKey(entry.word), entry);
  });

  extraEntries.forEach((entry) => {
    mergedMap.set(createLexiconKey(entry.word), entry);
  });

  return Array.from(mergedMap.values());
}

function createLexiconKey(word) {
  return String(word || "").trim();
}

function migrateLegacyLexiconStorage(csvText, name) {
  localStorage.setItem(STORAGE_KEYS.uploadedLexiconCsv, csvText);
  localStorage.setItem(STORAGE_KEYS.uploadedLexiconName, name);
  localStorage.removeItem(STORAGE_KEYS.legacyLexiconCsv);
  localStorage.removeItem(STORAGE_KEYS.legacyLexiconName);
}

function clearUploadedLexiconStorage() {
  localStorage.removeItem(STORAGE_KEYS.uploadedLexiconCsv);
  localStorage.removeItem(STORAGE_KEYS.uploadedLexiconName);
  localStorage.removeItem(STORAGE_KEYS.legacyLexiconCsv);
  localStorage.removeItem(STORAGE_KEYS.legacyLexiconName);
}

function serializeLexicon(entries) {
  const header = REQUIRED_CSV_HEADERS.join(",");
  const rows = entries.map((entry) =>
    [
      entry.word || "",
      entry.category || "",
      entry.riskLevel || "",
      entry.replace || "",
      entry.note || "",
    ].join(",")
  );

  return [header, ...rows].join("\n");
}

function parseCsv(csvText) {
  const normalizedText = csvText.replace(/^\uFEFF/, "").trim();
  if (!normalizedText) {
    throw new Error("CSV 文件是空的，请先填写内容后再上传。");
  }

  const rows = normalizedText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length <= 1) {
    throw new Error("CSV 只有表头，没有可用的数据行，请至少填写一行词库内容。");
  }

  const headers = rows[0].split(",").map((item) => item.trim());
  validateCsvHeaders(headers);

  return rows
    .slice(1)
    .map((row) => {
      const columns = row.split(",");
      const item = {};
      headers.forEach((header, index) => {
        item[header] = (columns[index] || "").trim();
      });
      return {
        word: item.word || "",
        category: item.category || "未分类",
        riskLevel: normalizeRiskLevel(item.risk_level || "低"),
        replace: item.replace || "暂无建议",
        note: item.note || "无",
      };
    })
    .filter((item) => item.word);
}

function validateCsvHeaders(headers) {
  const missingHeaders = REQUIRED_CSV_HEADERS.filter((header) => !headers.includes(header));
  if (missingHeaders.length) {
    throw new Error(
      `CSV 缺少必要字段：${missingHeaders.join("、")}。请使用模板中的表头顺序。`
    );
  }

  const headerMismatch = REQUIRED_CSV_HEADERS.some(
    (header, index) => headers[index] !== header
  );

  if (headerMismatch) {
    throw new Error(
      "CSV 表头顺序不正确，请按模板顺序填写：word,category,risk_level,replace,note。"
    );
  }
}

function normalizeRiskLevel(level) {
  const value = String(level || "").trim();
  if (value.startsWith("高")) return "高";
  if (value.startsWith("中")) return "中";
  return "低";
}

function handleDetect() {
  const content = elements.contentInput.value.trim();

  if (!content) {
    alert("请先粘贴需要检测的文案内容。");
    elements.contentInput.focus();
    return;
  }

  if (!currentLexicon.length) {
    alert("当前没有可用词库，请先上传 CSV 词库后再检测。");
    return;
  }

  const matches = detectSensitiveWords(content, currentLexicon);
  applyDetectionResult(content, matches);
  saveHistory({
    content,
    summary: createSummary(content),
    matchCount: matches.length,
    riskLevel: calculateOverallRisk(matches),
    checkedAt: formatDateTime(new Date()),
  });
  renderHistory();
}

function applyDetectionResult(content, matches) {
  lastMatches = matches;
  const overallRisk = calculateOverallRisk(matches);

  renderPreview(content, matches);
  renderSummary(matches, overallRisk);
  renderResults(matches);
  updateReplaceButtonState(matches.length > 0);
}

function handleClear() {
  elements.contentInput.value = "";
  lastMatches = [];
  renderPreview("", []);
  renderEmptyResults();
  updateReplaceButtonState(false);
}

async function handleCsvUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) {
    return;
  }

  try {
    const csvText = await file.text();
    if (!csvText.trim()) {
      throw new Error("CSV 文件是空的，请先填写内容后再上传。");
    }

    const parsed = parseCsv(csvText);

    if (!parsed.length) {
      throw new Error("CSV 中没有识别到有效词条，请检查每一行是否都填写了敏感词。");
    }

    uploadedLexicon = mergeLexiconEntries(uploadedLexicon, parsed);
    uploadedLexiconName = file.name;
    localStorage.setItem(STORAGE_KEYS.uploadedLexiconCsv, serializeLexicon(uploadedLexicon));
    localStorage.setItem(STORAGE_KEYS.uploadedLexiconName, file.name);
    localStorage.removeItem(STORAGE_KEYS.legacyLexiconCsv);
    localStorage.removeItem(STORAGE_KEYS.legacyLexiconName);
    rebuildCurrentLexicon();
    alert("词库上传成功，已在现有词库基础上继续补充；如果有同名词条，会优先使用你刚上传的版本。");
  } catch (error) {
    alert(`词库上传失败：${error.message}`);
  } finally {
    event.target.value = "";
  }
}

function handleReplaceRecommended() {
  const content = elements.contentInput.value;
  if (!content.trim()) {
    alert("请先输入文案并完成检测。");
    return;
  }

  const matches = lastMatches.length ? lastMatches : detectSensitiveWords(content, currentLexicon);
  if (!matches.length) {
    alert("当前没有可替换的敏感词。");
    updateReplaceButtonState(false);
    return;
  }

  const replacedContent = replaceMatchesWithSuggestion(content, matches);
  elements.contentInput.value = replacedContent;
  rerunDetection(replacedContent);
}

function replaceMatchesWithSuggestion(content, matches) {
  let cursor = 0;
  const parts = [];

  matches.forEach((match) => {
    parts.push(content.slice(cursor, match.start));
    parts.push(getFirstSuggestion(match.replace));
    cursor = match.end;
  });

  parts.push(content.slice(cursor));
  return parts.join("");
}

function rerunDetection(content) {
  const refreshedMatches = detectSensitiveWords(content, currentLexicon);
  applyDetectionResult(content, refreshedMatches);
}

function getFirstSuggestion(replaceText) {
  const normalized = String(replaceText || "").trim();
  if (!normalized) {
    return "";
  }

  const suggestion = normalized.split(/[\/、，,]/)[0].trim();
  return suggestion || normalized;
}

function detectSensitiveWords(content, lexicon) {
  const sortedLexicon = [...lexicon].sort((a, b) => b.word.length - a.word.length);
  const reservedRanges = [];
  const matches = [];

  sortedLexicon.forEach((entry) => {
    let searchStart = 0;

    while (searchStart < content.length) {
      const index = content.indexOf(entry.word, searchStart);
      if (index === -1) {
        break;
      }

      const end = index + entry.word.length;
      const overlapped = reservedRanges.some(
        (range) => index < range.end && end > range.start
      );

      if (!overlapped) {
        matches.push({
          ...entry,
          start: index,
          end,
          text: entry.word,
        });
        reservedRanges.push({ start: index, end });
      }

      searchStart = index + 1;
    }
  });

  return matches.sort((a, b) => a.start - b.start || b.word.length - a.word.length);
}

function calculateOverallRisk(matches) {
  const riskCounts = countByRisk(matches);
  if (riskCounts.high > 0) {
    return "高";
  }
  if (riskCounts.high === 0 && riskCounts.medium >= 3) {
    return "中";
  }
  return "低";
}

function countByRisk(matches) {
  return matches.reduce(
    (accumulator, item) => {
      if (item.riskLevel === "高") accumulator.high += 1;
      else if (item.riskLevel === "中") accumulator.medium += 1;
      else accumulator.low += 1;
      return accumulator;
    },
    { high: 0, medium: 0, low: 0 }
  );
}

function renderPreview(content, matches) {
  if (!content) {
    elements.previewOutput.classList.add("preview-empty");
    elements.previewOutput.textContent = "检测后会在这里按风险等级高亮显示原文内容。";
    elements.previewHint.textContent = "暂无检测结果";
    return;
  }

  elements.previewOutput.classList.remove("preview-empty");
  elements.previewHint.textContent = matches.length
    ? `共标记 ${matches.length} 处风险表达`
    : "这段文案暂未发现敏感词";

  let cursor = 0;
  const fragments = [];
  matches.forEach((match) => {
    fragments.push(escapeHtml(content.slice(cursor, match.start)));
    fragments.push(
      `<span class="highlight ${getHighlightClass(match.riskLevel)}">${escapeHtml(
        content.slice(match.start, match.end)
      )}</span>`
    );
    cursor = match.end;
  });
  fragments.push(escapeHtml(content.slice(cursor)));

  elements.previewOutput.innerHTML = fragments.join("");
}

function renderSummary(matches, overallRisk) {
  const riskConfig = riskLevelMap[overallRisk];
  const counts = countByRisk(matches);
  const categoryMap = matches.reduce((accumulator, item) => {
    accumulator[item.category] = (accumulator[item.category] || 0) + 1;
    return accumulator;
  }, {});

  elements.riskBadge.className = `risk-pill ${riskConfig.className}`;
  elements.riskBadge.textContent = riskConfig.text;
  elements.riskText.textContent = matches.length
    ? `${riskConfig.message} 本次共命中 ${matches.length} 处内容。`
    : "还没有检测结果，先输入文案试试看。";
  elements.riskAccent.style.background = riskConfig.accent;

  elements.hitCount.textContent = String(matches.length);
  elements.highCount.textContent = String(counts.high);
  elements.mediumCount.textContent = String(counts.medium);
  elements.lowCount.textContent = String(counts.low);

  const categoryEntries = Object.entries(categoryMap);
  elements.categorySummary.textContent = categoryEntries.length
    ? `分类分布：${categoryEntries
        .map(([category, count]) => `${category} ${count} 次`)
        .join("，")}`
    : "分类分布：暂无数据";
}

function renderResults(matches) {
  if (!matches.length) {
    elements.resultList.innerHTML =
      '<div class="empty-state">本次未发现敏感词，可以继续检查表述是否足够客观、清晰。</div>';
    return;
  }

  elements.resultList.innerHTML = matches
    .map(
      (item, index) => `
        <article class="result-item">
          <div class="result-head">
            <div class="result-word">${index + 1}. ${escapeHtml(item.word)}</div>
            <span class="risk-pill ${riskLevelMap[item.riskLevel].className}">${riskLevelMap[item.riskLevel].text}</span>
          </div>
          <div class="result-category">${escapeHtml(item.category)} · 位置：第 ${item.start + 1} 个字</div>
          <div class="result-replace"><strong>推荐表达：</strong>${escapeHtml(getFirstSuggestion(item.replace))}</div>
          <div class="tag-row">
            <span class="tag">完整建议：${escapeHtml(item.replace)}</span>
          </div>
          <div class="result-note">备注：${escapeHtml(item.note || "无")}</div>
        </article>
      `
    )
    .join("");
}

function renderEmptyResults() {
  renderSummary([], "低");
  elements.resultList.innerHTML =
    '<div class="empty-state">完成检测后，这里会显示敏感词、分类、风险等级、替换建议和备注。</div>';
}

function updateReplaceButtonState(enabled) {
  elements.replaceButton.disabled = !enabled;
}

function saveHistory(record) {
  const history = getHistory();
  history.unshift(record);
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history.slice(0, 10)));
}

function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.history);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function renderHistory() {
  const history = getHistory();
  if (!history.length) {
    elements.historyList.innerHTML = '<div class="empty-state">暂无历史记录</div>';
    return;
  }

  elements.historyList.innerHTML = history
    .map(
      (item, index) => `
        <article class="history-item">
          <div class="history-head">
            <div class="history-title">${index + 1}. ${escapeHtml(item.summary)}</div>
            <span class="risk-pill ${riskLevelMap[item.riskLevel].className}">${riskLevelMap[item.riskLevel].text}</span>
          </div>
          <div class="history-meta">
            检测时间：${escapeHtml(item.checkedAt)}<br />
            命中数量：<strong>${item.matchCount}</strong>
          </div>
          <div class="history-actions">
            <button class="history-button" data-history-index="${index}">重新填入文案</button>
          </div>
        </article>
      `
    )
    .join("");

  Array.from(elements.historyList.querySelectorAll(".history-button")).forEach((button) => {
    button.addEventListener("click", () => {
      const historyItem = history[Number(button.dataset.historyIndex)];
      if (!historyItem) {
        return;
      }
      elements.contentInput.value = historyItem.content;
    });
  });
}

function clearHistory() {
  localStorage.removeItem(STORAGE_KEYS.history);
  renderHistory();
}

function createSummary(content) {
  const compact = content.replace(/\s+/g, " ").trim();
  return compact.length > 28 ? `${compact.slice(0, 28)}...` : compact;
}

function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function getHighlightClass(riskLevel) {
  if (riskLevel === "高") return "highlight-high";
  if (riskLevel === "中") return "highlight-medium";
  return "highlight-low";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

initialize();
