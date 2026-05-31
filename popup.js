const autoHealInput = document.getElementById('autoHeal');
const delayInput = document.getElementById('delayTime');
const cooldownInput = document.getElementById('cooldownTime');
const startStopBtn = document.getElementById('startStopBtn');
const statusText = document.getElementById('statusText');

const DEFAULT_SETTINGS = {
  autoHeal: true,
  delayTime: 2000,
  cooldownTime: 10000
};

function updateStatusText(running) {
  statusText.textContent = running ? 'Đang chạy' : 'Đang dừng';
  startStopBtn.textContent = running ? 'Dừng' : 'Bắt đầu';
  startStopBtn.dataset.mode = running ? 'stop' : 'start';
}

function getConfig() {
  return {
    autoHeal: autoHealInput.checked,
    delayTime: Number(delayInput.value) || DEFAULT_SETTINGS.delayTime,
    cooldownTime: Number(cooldownInput.value) || DEFAULT_SETTINGS.cooldownTime
  };
}

function saveConfig() {
  chrome.storage.local.set(getConfig());
}

async function ensureContentScript(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, {source: 'popup', action: 'ping'});
  } catch {
    await chrome.scripting.executeScript({
      target: {tabId},
      files: ['content.js']
    });
  }
}

async function findDiscordTab() {
  const [activeTab] = await chrome.tabs.query({active: true, currentWindow: true});
  if (activeTab && activeTab.url && activeTab.url.includes('discord.com')) {
    return activeTab;
  }

  const tabs = await chrome.tabs.query({currentWindow: true});
  return tabs.find((tab) => tab.url && tab.url.includes('discord.com')) || null;
}

async function sendAction(action) {
  const tab = await findDiscordTab();
  if (!tab) {
    statusText.textContent = 'Không tìm thấy tab Discord.';
    return;
  }

  await ensureContentScript(tab.id);

  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      source: 'popup',
      action,
      config: getConfig()
    });
    if (response && response.status === 'ok') {
      updateStatusText(action === 'start');
    }
  } catch (error) {
    statusText.textContent = 'Không thể gửi lệnh đến trang.';
    console.error(error);
  }
}

async function getRunningStatus() {
  const tab = await findDiscordTab();
  if (!tab) return false;

  await ensureContentScript(tab.id);

  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      source: 'popup',
      action: 'status'
    });
    return response && response.running === true;
  } catch {
    return false;
  }
}

async function loadSettings() {
  chrome.storage.local.get(DEFAULT_SETTINGS, async (result) => {
    autoHealInput.checked = result.autoHeal;
    delayInput.value = result.delayTime;
    cooldownInput.value = result.cooldownTime;
    const running = await getRunningStatus();
    updateStatusText(running);
  });
}

startStopBtn.addEventListener('click', async () => {
  saveConfig();
  if (startStopBtn.dataset.mode === 'stop') {
    await sendAction('stop');
  } else {
    await sendAction('start');
  }
});

autoHealInput.addEventListener('change', saveConfig);
delayInput.addEventListener('change', saveConfig);
cooldownInput.addEventListener('change', saveConfig);

document.addEventListener('DOMContentLoaded', loadSettings);
