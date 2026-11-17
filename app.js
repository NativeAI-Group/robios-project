/* Add local MP4/WebM paths as footage becomes available. */
const videoSources = {
  hero: "", "scene-1": "", "scene-2": "", "scene-3": "", "scene-4": "",
  "sim-robodojo": "", "sim-robocasa": "", "sim-behavior": "",
  "robot-galaxea": "", "robot-stardust": "", "robot-unitree": "", migration: "",
};

function preferredLanguage() {
  const requested = new URL(window.location.href).searchParams.get("lang");
  if (requested === "en" || requested === "zh") return requested;
  try { return localStorage.getItem("robios-language") === "en" ? "en" : "zh"; }
  catch { return "zh"; }
}
let language = preferredLanguage();
const t = (zh, en) => language === "en" ? en : zh;
let activePlugin = "lifecycle";
let activeEnvironment = "robodojo";
let activeScene = "1";
const environmentNames = { robodojo: "RoboDojo", robocasa: "RoboCasa", behavior: "BEHAVIOR-1K" };

// Capture the Chinese source once; language changes never accumulate replacements.
const translations = [...document.querySelectorAll("[data-en]")].map(element => ({ element, zh: element.innerHTML, en: element.dataset.en }));
const translatedAttributes = ["aria-label", "alt", "title"].flatMap(attribute =>
  [...document.querySelectorAll(`[data-en-${attribute}]`)].map(element => ({ element, attribute, zh: element.getAttribute(attribute), en: element.getAttribute(`data-en-${attribute}`) }))
);

function pluginGroups() {
  return {
    lifecycle: {
      title: t("覆盖完整行动生命周期", "Cover the full action lifecycle"),
      cards: [
        ["PROPOSE", t("提议插件", "Propose"), t("生成与更新行动提议。", "Generate and update action proposals.")],
        ["ADMISSION", t("准入插件", "Admission"), t("在执行前检查行动是否可准入。", "Check whether an action may begin.")],
        ["EXECUTE", t("执行插件", "Execute"), t("承载具体的行动执行能力。", "Provide action execution capabilities.")],
        ["MONITOR", t("监测插件", "Monitor"), t("持续监测本体与环境状态。", "Track robot and environment state.")],
        ["CLEARANCE", t("准出插件", "Clearance"), t("校验行动结果与结束条件。", "Verify results and completion conditions.")],
      ],
    },
    capabilities: {
      title: t("为行动提供上下文与交互", "Context and interaction for action"),
      cards: [
        ["MEMORY", t("记忆插件", "Memory"), t("组织用户画像、世界状态与机器人自传体记忆。", "Organize user profiles, world state, and robot autobiographical memory.")],
        ["HRI", t("人机交互插件", "Human–robot interaction"), t("连接指令、示教与人工干预。", "Connect commands, teaching, and human intervention.")],
      ],
    },
    adapters: {
      title: t("连接真实本体与仿真环境", "Connect robots and simulation"),
      cards: [
        ["REAL HAL", t("本体插件", "Robot adapter"), t("对接硬件驱动与本体能力。", "Interface with hardware drivers and robot capabilities.")],
        ["SIM BRIDGE", t("仿真插件", "Simulation adapter"), t("连接仿真环境，管理步进与重置。", "Connect simulators and manage stepping and resets.")],
      ],
    },
  };
}

function renderPlugins(group) {
  activePlugin = group;
  const { title, cards } = pluginGroups()[group];
  const panel = document.querySelector("#plugin-panel");
  panel.setAttribute("aria-labelledby", `plugin-tab-${group}`);
  panel.innerHTML = `<div class="panel-heading"><h3>${title}</h3></div>
    <div class="plugin-card-grid ${cards.length === 2 ? "two-cards" : ""}">${cards.map(([code, name, description]) => `
      <article class="plugin-card"><div class="plugin-card-head"><h4>${name}</h4><span class="plugin-card-code">${code}</span></div><p>${description}</p></article>`).join("")}</div>`;
}

function mediaPlaceholder(id, title, label) {
  const available = Boolean(videoSources[id]);
  const opening = available
    ? `<button class="media-placeholder" data-video="${id}" data-title="${title}" aria-label="${t("播放", "Play: ")}${title}">`
    : `<div class="media-placeholder" role="img" aria-label="${title} — ${t("演示视频待补充", "demo video pending")}">`;
  return `${opening}<span class="media-corner">${label}</span>
    ${available ? '<span class="play-circle" aria-hidden="true">▶</span>' : '<span class="media-pending-icon" aria-hidden="true">···</span>'}
    <span class="media-label">${t(available ? "播放演示" : "演示视频待补充", available ? "Play demo" : "Demo video pending")}</span>
    <span class="media-bottom"><span>RoBIOS / EXPERIMENT</span>${available ? '<span aria-hidden="true">↗</span>' : ""}</span>${available ? "</button>" : "</div>"}`;
}

function evaluationHeading(title, description) {
  return `<div class="eval-content-heading"><div><h3>${title}</h3><p>${description}</p></div><span class="pending-badge">${t("待补充", "Pending")}</span></div>`;
}
const sceneName = scene => t(`场景 0${scene}`, `Scene 0${scene}`);
const sceneTitle = () => `RoboDojo · ${sceneName(activeScene)}`;
const simulationTitle = () => `${environmentNames[activeEnvironment]} · ${t("仿真演示", "Simulation demo")}`;

function loopPanel() {
  return `${evaluationHeading(t("5.1 闭环执行能力", "5.1 Closed-loop execution"), t("在 RoboDojo 的 4 个代表场景中对比执行表现。", "Compare execution across four representative RoboDojo scenes."))}
    <div class="eval-split"><div><div id="scene-media">${mediaPlaceholder(`scene-${activeScene}`, sceneTitle(), `ROBODOJO / SCENE 0${activeScene}`)}</div>
      <div class="scene-selector" role="group" aria-label="${t("选择 RoboDojo 场景", "Select a RoboDojo scene")}">${[1, 2, 3, 4].map(scene => `<button data-scene="${scene}" aria-pressed="${String(scene) === activeScene}">${sceneName(scene)}</button>`).join("")}</div></div>
      <div class="results-block"><div class="table-caption"><span>${t("任务成功率对比", "Task success rate")}</span><small>SUCCESS RATE ↑</small></div>
        <table class="result-table"><thead><tr><th scope="col">${t("场景", "Scene")}</th><th scope="col">${t("对比基线", "Baseline")}</th><th scope="col" class="highlight-column">RoBIOS</th><th scope="col">${t("差值", "Delta")}</th></tr></thead><tbody>
          ${[1, 2, 3, 4].map(scene => `<tr><td>${sceneName(scene)}</td><td>—</td><td class="highlight-column">—</td><td>—</td></tr>`).join("")}
        </tbody></table><p class="results-note">${t("任务、基线、响应时延与异常恢复结果待补充。", "Tasks, baselines, response latency, and recovery results are pending.")}</p>
      </div></div>`;
}

function simulationPanel() {
  return `${evaluationHeading(t("5.3 多仿真环境验证", "5.3 Simulation environments"), t("分别报告各环境的任务表现与运行配置。", "Report task performance and runtime configuration for each environment."))}
    <div class="environment-tabs" role="group" aria-label="${t("选择仿真环境", "Select a simulation environment")}">${Object.entries(environmentNames).map(([id, name]) => `<button data-environment="${id}" aria-pressed="${id === activeEnvironment}">${name}</button>`).join("")}</div>
    <div class="eval-split"><div id="environment-media">${mediaPlaceholder(`sim-${activeEnvironment}`, simulationTitle(), `${environmentNames[activeEnvironment].toUpperCase()} / SIMULATION`)}</div>
      <div class="results-block"><div class="table-caption"><span>${t("各环境评测结果", "Results by environment")}</span><small>PER ENVIRONMENT</small></div>
        <table class="result-table"><thead><tr><th scope="col">${t("环境", "Environment")}</th><th scope="col">${t("成功率 ↑", "Success ↑")}</th><th scope="col">${t("耗时 ↓", "Time ↓")}</th><th scope="col">${t("次数", "Trials")}</th></tr></thead><tbody>
          ${Object.values(environmentNames).map(name => `<tr><td>${name}</td><td>—</td><td>—</td><td>—</td></tr>`).join("")}
        </tbody></table><p class="results-note">${t("任务集、环境版本与配置待补充；各环境指标分别报告。", "Task sets, versions, and configurations are pending. Metrics are reported separately for each environment.")}</p>
      </div></div>`;
}

function embodimentPanel() {
  const robots = [
    ["galaxea", t("银河 G1", "Galaxea G1"), "GALAXEA / G1"],
    ["stardust", t("星尘 T1", "Stardust T1"), "STARDUST / T1"],
    ["unitree", t("宇树 G1", "Unitree G1"), "UNITREE / G1"],
  ];
  return `${evaluationHeading(t("5.4 多本体支持", "5.4 Multi-embodiment support"), t("在同一任务规范下，验证不同机器人的执行与适配。", "Evaluate execution and adaptation across robots under the same task specification."))}
    <div class="robot-cards">${robots.map(([id, name, code]) => `<article class="robot-card">${mediaPlaceholder(`robot-${id}`, `${name} · ${t("同场景执行演示", "Task execution demo")}`, code)}<div class="robot-card-body"><h4>${name}</h4><p>${t("任务与适配范围待补充", "Tasks and adaptation scope pending")}</p><div class="robot-card-metric"><span>${t("任务成功率", "Success rate")}</span><span>—</span></div><div class="robot-card-metric"><span>${t("完成耗时", "Completion time")}</span><span>—</span></div></div></article>`).join("")}</div>`;
}

function migrationPanel() {
  return `${evaluationHeading(t("5.5 插件迁移与能力复用", "5.5 Plugin migration & reuse"), t("将 Hexashell 迁移至 RoBIOS，在 RoboCasa 中对比迁移前后的表现。", "Migrate Hexashell to RoBIOS and compare performance in RoboCasa."))}
    <div class="eval-split"><div>${mediaPlaceholder("migration", t("Hexashell → RoBIOS 插件迁移演示", "Hexashell → RoBIOS migration demo"), "HEXASHELL / MIGRATION")}</div>
      <div class="results-block"><div class="migration-flow"><div><strong>Hexashell</strong><small>${t("迁移前", "Before")}</small></div><span aria-hidden="true">→</span><div><strong>${t("RoBIOS 插件", "RoBIOS plugin")}</strong><small>${t("迁移后", "After")}</small></div><span aria-hidden="true">→</span><div><strong>RoboCasa</strong><small>${t("评测环境", "Evaluation")}</small></div></div>
        <table class="result-table"><thead><tr><th scope="col">${t("验证维度", "Metric")}</th><th scope="col">${t("迁移前", "Before")}</th><th scope="col" class="highlight-column">${t("迁移后", "After")}</th></tr></thead><tbody>${[t("任务成功率", "Success rate"), t("完成耗时", "Completion time"), t("适配改动", "Adaptation effort")].map(metric => `<tr><td>${metric}</td><td>—</td><td class="highlight-column">—</td></tr>`).join("")}</tbody></table><p class="results-note">${t("性能、迁移代码与适配成本待补充。", "Performance, migration code, and adaptation cost are pending.")}</p>
      </div></div>`;
}

function budgetPanel() {
  return `${evaluationHeading(t("5.2 预算敏感的闭环控制粒度", "5.2 Budget-aware control granularity"), t("实验预留", "Reserved for evaluation"))}
    <div class="budget-empty" aria-label="${t("预算敏感实验区域，内容暂留空", "Budget-aware evaluation area, intentionally empty")}"></div>`;
}
const evaluationPanels = { loop: loopPanel, budget: budgetPanel, simulation: simulationPanel, embodiment: embodimentPanel, migration: migrationPanel };
function renderEvaluations() {
  document.querySelector("#evaluation-content").innerHTML = Object.entries(evaluationPanels)
    .map(([category, render]) => `<section id="eval-${category}" class="experiment-section">${render()}</section>`).join("");
  document.querySelector("#hero-media").innerHTML = videoSources.hero
    ? mediaPlaceholder("hero", t("真实环境闭环执行演示", "Physical-world execution demo"), "RoBIOS / LIVE DEMO") : "";
}

function setupTabs(selector, dataKey, render) {
  const tablist = document.querySelector(selector);
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  function activate(tab, focus = false) {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    render(tab.dataset[dataKey]);
    if (focus) tab.focus();
  }
  tablist.addEventListener("click", event => {
    const tab = event.target.closest('[role="tab"]');
    if (tab) activate(tab);
  });
  tablist.addEventListener("keydown", event => {
    const current = tabs.indexOf(document.activeElement);
    if (current === -1) return;
    let index;
    if (event.key === "ArrowRight") index = (current + 1) % tabs.length;
    else if (event.key === "ArrowLeft") index = (current - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") index = 0;
    else if (event.key === "End") index = tabs.length - 1;
    else return;
    event.preventDefault();
    activate(tabs[index], true);
  });
}
setupTabs(".plugin-tabs", "plugin", renderPlugins);

document.querySelector("#evaluation-content").addEventListener("click", event => {
  const sceneButton = event.target.closest("[data-scene]");
  if (sceneButton) {
    activeScene = sceneButton.dataset.scene;
    document.querySelectorAll("[data-scene]").forEach(button => button.setAttribute("aria-pressed", String(button === sceneButton)));
    document.querySelector("#scene-media").innerHTML = mediaPlaceholder(`scene-${activeScene}`, sceneTitle(), `ROBODOJO / SCENE 0${activeScene}`);
  }
  const environmentButton = event.target.closest("[data-environment]");
  if (environmentButton) {
    activeEnvironment = environmentButton.dataset.environment;
    document.querySelectorAll("[data-environment]").forEach(button => button.setAttribute("aria-pressed", String(button === environmentButton)));
    document.querySelector("#environment-media").innerHTML = mediaPlaceholder(`sim-${activeEnvironment}`, simulationTitle(), `${environmentNames[activeEnvironment].toUpperCase()} / SIMULATION`);
  }
});

const videoDialog = document.querySelector("#video-dialog");
const architectureDialog = document.querySelector("#architecture-dialog");
let previouslyFocused = null;
function openDialog(dialog) {
  previouslyFocused = document.activeElement;
  dialog.showModal();
  document.body.classList.add("modal-open");
}
document.addEventListener("click", event => {
  const videoButton = event.target.closest("[data-video]");
  if (videoButton) {
    const source = videoSources[videoButton.dataset.video];
    if (!source) return;
    const title = videoButton.dataset.title;
    document.querySelector("#video-dialog-title").textContent = title;
    const video = document.createElement("video");
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.src = source;
    video.setAttribute("aria-label", title);
    document.querySelector("#video-dialog-content").replaceChildren(video);
    openDialog(videoDialog);
  }
  if (event.target.closest("[data-open-architecture]")) openDialog(architectureDialog);
  const closeButton = event.target.closest(".dialog-close");
  if (closeButton) closeButton.closest("dialog").close();
});
function resetArchitectureZoom() {
  document.querySelector(".architecture-scroll").classList.remove("zoomed");
  const zoom = document.querySelector("#architecture-zoom");
  zoom.setAttribute("aria-pressed", "false");
  zoom.textContent = t("原尺寸查看", "Original size");
}
[videoDialog, architectureDialog].forEach(dialog => {
  dialog.addEventListener("click", event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    dialog.querySelector("video")?.pause();
    previouslyFocused?.focus({ preventScroll: true });
    if (dialog === architectureDialog) resetArchitectureZoom();
  });
});
document.querySelector("#architecture-zoom").addEventListener("click", event => {
  const zoomed = document.querySelector(".architecture-scroll").classList.toggle("zoomed");
  event.currentTarget.setAttribute("aria-pressed", String(zoomed));
  event.currentTarget.textContent = zoomed ? t("适应窗口", "Fit to window") : t("原尺寸查看", "Original size");
});

const tocToggle = document.querySelector(".toc-toggle");
const tocLinks = document.querySelector("#toc-links");
const compactToc = window.matchMedia("(max-width: 900px)");
function setTocExpanded(expanded) {
  tocToggle.setAttribute("aria-expanded", String(expanded));
  tocToggle.querySelector(".toc-indicator").textContent = expanded ? "−" : "+";
  tocLinks.hidden = !expanded;
}
setTocExpanded(!compactToc.matches);
compactToc.addEventListener("change", event => setTocExpanded(!event.matches));
tocToggle.addEventListener("click", () => setTocExpanded(tocToggle.getAttribute("aria-expanded") !== "true"));
tocLinks.addEventListener("click", event => {
  if (event.target.closest("a") && compactToc.matches) setTocExpanded(false);
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && compactToc.matches && !tocLinks.hidden && !document.querySelector("dialog[open]")) {
    setTocExpanded(false);
    tocToggle.focus();
  }
});
const readingLinks = [...tocLinks.querySelectorAll("a")];
function syncTocHeadings() {
  readingLinks.forEach(link => {
    const heading = document.querySelector(link.hash)?.querySelector("h2, h3");
    if (!heading) return;
    const title = heading.textContent.trim();
    const numberedTitle = title.match(/^(\d+(?:\.\d+)*\.?)\s+(.+)$/);
    if (!numberedTitle) {
      link.textContent = title;
      return;
    }
    const number = document.createElement("span");
    number.className = "toc-number";
    number.textContent = numberedTitle[1];
    const label = document.createElement("span");
    label.className = "toc-title";
    label.textContent = numberedTitle[2];
    link.replaceChildren(number, document.createTextNode(" "), label);
  });
}
function markReadingPosition() {
  const offset = compactToc.matches ? 130 : 90;
  const sections = readingLinks.map(link => document.querySelector(link.hash)).filter(Boolean);
  let current = sections[0];
  for (const section of sections) if (section.getBoundingClientRect().top <= offset) current = section;
  readingLinks.forEach(link => {
    const active = link.hash === `#${current.id}`;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}
let readingFramePending = false;
window.addEventListener("scroll", () => {
  if (readingFramePending) return;
  readingFramePending = true;
  requestAnimationFrame(() => { markReadingPosition(); readingFramePending = false; });
}, { passive: true });

function setLanguage(next, save = true) {
  language = next;
  document.documentElement.lang = language === "en" ? "en" : "zh-CN";
  translations.forEach(({ element, zh, en }) => { element.innerHTML = language === "en" ? en : zh; });
  translatedAttributes.forEach(({ element, attribute, zh, en }) => element.setAttribute(attribute, language === "en" ? en : zh));
  document.querySelectorAll("[data-language]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.language === language)));
  document.title = t("RoBIOS — 具身原生 Agent 框架", "RoBIOS — Embodied-native Agent Framework");
  document.querySelector('meta[name="description"]').content = t(
    "RoBIOS：面向真实物理世界的具身原生 Agent 框架。由内核管理行动闭环，以插件复用具身能力。",
    "RoBIOS, an embodied-native agent framework for the physical world. A minimal kernel governs the action loop, with composable plugins for reusable capabilities."
  );
  renderPlugins(activePlugin);
  renderEvaluations();
  syncTocHeadings();
  resetArchitectureZoom();
  markReadingPosition();
  if (save) {
    try { localStorage.setItem("robios-language", language); } catch { /* Language switching also works without storage. */ }
    const url = new URL(window.location.href);
    url.searchParams.set("lang", language);
    history.replaceState(null, "", url);
  }
}
document.querySelectorAll("[data-language]").forEach(button => button.addEventListener("click", () => setLanguage(button.dataset.language)));
window.addEventListener("popstate", () => setLanguage(preferredLanguage(), false));
setLanguage(language, false);
