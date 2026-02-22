const DEFAULT_STATE = {
  verdict: "No analysis yet",
  explanation: "Open a page with a video and run an analysis.",
  confidence: 0,
};

const demoSamples = [
  {
    verdict: "Likely AI-generated",
    explanation: "Model found synthetic motion patterns and inconsistent lip-sync.",
    confidence: 88,
  },
  {
    verdict: "Likely Real",
    explanation: "Temporal consistency and natural lighting patterns look authentic.",
    confidence: 81,
  },
  {
    verdict: "Uncertain",
    explanation: "Signals are mixed. Send to backend for a full frame-level check.",
    confidence: 53,
  },
];

const els = {
  analyzeBtn: document.getElementById("analyzeBtn"),
  demoBtn: document.getElementById("demoBtn"),
  saveSettingsBtn: document.getElementById("saveSettingsBtn"),
  verdictText: document.getElementById("verdictText"),
  verdictSubtext: document.getElementById("verdictSubtext"),
  confidenceLabel: document.getElementById("confidenceLabel"),
  confidenceBar: document.getElementById("confidenceBar"),
  statusChip: document.getElementById("statusChip"),
  tabTitle: document.getElementById("tabTitle"),
  tabUrl: document.getElementById("tabUrl"),
  endpointInput: document.getElementById("endpointInput"),
  tokenInput: document.getElementById("tokenInput"),
};

function setStatus(text, cssClass) {
  els.statusChip.textContent = text;
  els.statusChip.className = `chip ${cssClass}`;
}

function renderState(state) {
  els.verdictText.textContent = state.verdict;
  els.verdictSubtext.textContent = state.explanation;
  els.confidenceLabel.textContent = `${state.confidence}%`;
  els.confidenceBar.style.width = `${state.confidence}%`;
}

function pickDemoSample() {
  return demoSamples[Math.floor(Math.random() * demoSamples.length)];
}

async function getActiveTabInfo() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs?.[0];
  if (!activeTab) {
    els.tabTitle.textContent = "No active tab";
    els.tabUrl.textContent = "--";
    return;
  }

  els.tabTitle.textContent = activeTab.title || "Untitled tab";
  els.tabUrl.textContent = activeTab.url || "No URL available";
}

async function loadSettings() {
  const { endpointUrl = "", apiToken = "" } = await chrome.storage.local.get([
    "endpointUrl",
    "apiToken",
  ]);

  els.endpointInput.value = endpointUrl;
  els.tokenInput.value = apiToken;
}

async function saveSettings() {
  const endpointUrl = els.endpointInput.value.trim();
  const apiToken = els.tokenInput.value.trim();

  await chrome.storage.local.set({ endpointUrl, apiToken });
  setStatus("Saved", "chip-ready");
  setTimeout(() => setStatus("Idle", "chip-idle"), 1000);
}

async function analyzeWithBackend() {
  const { endpointUrl, apiToken } = await chrome.storage.local.get([
    "endpointUrl",
    "apiToken",
  ]);

  if (!endpointUrl || !apiToken) {
    renderState({
      verdict: "Setup needed",
      explanation: "Add your Databricks endpoint URL and token in Backend Settings.",
      confidence: 0,
    });
    setStatus("Missing config", "chip-working");
    return;
  }

  // Placeholder request flow until model payload schema is finalized.
  setStatus("Ready", "chip-ready");
  renderState({
    verdict: "Backend connected",
    explanation: "Connection details saved. Wire the request payload next.",
    confidence: 100,
  });
}

function setWorking(isWorking) {
  els.analyzeBtn.disabled = isWorking;
  els.demoBtn.disabled = isWorking;
  if (isWorking) {
    setStatus("Analyzing...", "chip-working");
  }
}

els.demoBtn.addEventListener("click", async () => {
  setWorking(true);
  await new Promise((resolve) => setTimeout(resolve, 400));
  renderState(pickDemoSample());
  setStatus("Ready", "chip-ready");
  setWorking(false);
});

els.analyzeBtn.addEventListener("click", async () => {
  setWorking(true);
  await analyzeWithBackend();
  setWorking(false);
});

els.saveSettingsBtn.addEventListener("click", saveSettings);

renderState(DEFAULT_STATE);
loadSettings();
getActiveTabInfo();
