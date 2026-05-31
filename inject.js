(() => {
  if (window.__autoDiscordBotInjected) return;
  window.__autoDiscordBotInjected = true;

  function getState() {
    window.lastClickedTime = window.lastClickedTime || 0;
    window.lastHealedMsgId = window.lastHealedMsgId || null;
    return {
      autoHeal: window.autoDiscordAutoHeal !== undefined ? window.autoDiscordAutoHeal : true,
      delayTime: window.autoDiscordDelayTime || 2000,
      cooldownTime: window.autoDiscordCooldownTime || 10000
    };
  }

  function setState(config) {
    window.autoDiscordAutoHeal = !!config.autoHeal;
    window.autoDiscordDelayTime = parseInt(config.delayTime, 10) || 2000;
    window.autoDiscordCooldownTime = parseInt(config.cooldownTime, 10) || 10000;
    window.lastClickedTime = window.lastClickedTime || 0;
    window.lastHealedMsgId = window.lastHealedMsgId || null;
  }

  function stopBot() {
    if (window.botInterval) {
      clearInterval(window.botInterval);
      window.botInterval = null;
    }
    window.autoDiscordBotRunning = false;
    console.log('AutoDiscord Bot đã dừng.');
  }

  function runBot() {
    const config = getState();
    const now = Date.now();
    console.log(`AutoDiscord runBot: delay=${config.delayTime}ms cooldown=${config.cooldownTime}ms autoHeal=${config.autoHeal}`);
    if (now - window.lastClickedTime < config.cooldownTime) {
      console.log('AutoDiscord: đang đợi cooldown', now - window.lastClickedTime, 'ms');
      return;
    }

    const dismissNodes = Array.from(document.querySelectorAll('div[role="button"], a, span')).filter((el) => {
      if (!el.innerText) return false;
      const text = el.innerText.trim().toLowerCase();
      return text === 'bỏ qua tin nhắn' || text === 'dismiss message';
    });
    if (dismissNodes.length > 0) {
      dismissNodes.forEach((n) => n.click());
      console.log('🧹 Đã dọn dẹp các tin báo lỗi hệ thống!');
    }

    let messages = Array.from(document.querySelectorAll('li[id^="chat-messages-"]'));
    if (messages.length === 0) {
      messages = Array.from(document.querySelectorAll('[class*="messageListItem"]'));
    }
    if (messages.length === 0) {
      console.log('AutoDiscord: không tìm thấy tin nhắn phù hợp để quét.');
      return;
    }

    const recentMessages = messages.slice(-2);
    let buttons = [];
    recentMessages.forEach((msg) => {
      buttons.push(...msg.querySelectorAll('button'));
    });

    const EXCLUDES = [
      'rời', 'khóa phòng', 'làm mới', 'sẵn sàng', 'nghỉ',
      'mời', 'trang chủ', 'kết thúc', 'tạo phòng', 'quay lại',
      'bất chấp', 'phá trận', 'cưỡng ép',
      'hành trang', 'tầm bảo', 'động phủ', 'lịch luyện', 'bí cảnh',
      'hoạt động', 'nhiệm vụ', 'cửa hàng', 'vấn đỉnh', 'vạn bảo lâu',
      'vạn thú các', 'chế tạo', 'bảng xếp hạng', 'hảo hữu', 'thư viện',
      'tông môn', 'đỗ phường', 'đạo quy', 'phúc lợi', 'chat thế giới'
    ];

    buttons = buttons.filter((b) => {
      if (b.disabled || !b.innerText) return false;
      const text = b.innerText.toLowerCase().trim();
      return !EXCLUDES.some((ex) => text.includes(ex));
    });
    if (buttons.length === 0) {
      console.log('AutoDiscord: không tìm thấy nút hợp lệ sau khi lọc exclude.');
      return;
    }

    buttons = buttons.reverse();

    const SPECIAL_PRIORITIES = ['hứng lấy linh nhũ', 'để lại cho sinh linh khác', 'lắng nghe', 'phong ấn', 'cân bằng'];
    const PRIORITIES = ['sinh', 'hưu', 'cảnh', 'khai', 'đỗ'];
    const AUTO_CLICKS = ['bắt đầu', 'tiếp tục', 'tiếp tục khám phá', 'khởi hành'];

    let targetButton = null;
    for (const sp of SPECIAL_PRIORITIES) {
      targetButton = buttons.find((b) => b.innerText.toLowerCase().trim().includes(sp));
      if (targetButton) break;
    }

    if (!targetButton && config.autoHeal) {
      const hasStart = buttons.find((b) => b.innerText.toLowerCase().includes('bắt đầu'));
      const hasHeal = buttons.find((b) => b.innerText.toLowerCase().includes('hồi phục'));
      if (hasStart && hasHeal) {
        const msgContainer = hasHeal.closest('li[id^="chat-messages-"]');
        const msgId = msgContainer ? msgContainer.id : 'unknown_lobby';
        if (window.lastHealedMsgId !== msgId) {
          window.lastHealedMsgId = msgId;
          targetButton = hasHeal;
        }
      }
    }

    if (!targetButton) {
      for (const p of PRIORITIES) {
        targetButton = buttons.find((b) => b.innerText.toLowerCase().includes(p) && b.innerText.includes('['));
        if (targetButton) break;
      }
    }

    if (!targetButton) {
      const doors = buttons.filter((b) => b.innerText.includes('[') && b.innerText.includes(']'));
      if (doors.length > 0) {
        targetButton = doors[Math.floor(Math.random() * doors.length)];
      }
    }

    if (!targetButton) {
      targetButton = buttons.find((b) => {
        const text = b.innerText.toLowerCase().trim();
        return AUTO_CLICKS.some((ac) => text.includes(ac));
      });
      if (targetButton) {
        console.log('AutoDiscord: chọn nút tự động cơ bản', targetButton.innerText);
      }
    }

    if (!targetButton && buttons.length > 0) {
      const bottomY = buttons[0].getBoundingClientRect().bottom;
      const recentButtons = buttons.filter((b) => Math.abs(bottomY - b.getBoundingClientRect().bottom) < 100);
      targetButton = recentButtons[Math.floor(Math.random() * recentButtons.length)];
      if (targetButton) {
        console.log('AutoDiscord: chọn nút ngẫu nhiên', targetButton.innerText);
      }
    }

    if (targetButton) {
      console.log('✅ Bot vừa bấm nút:', targetButton.innerText);
      window.lastClickedTime = Date.now();
      targetButton.click();
    } else {
      console.log('AutoDiscord: không tìm thấy nút để bấm trong lần quét này.');
    }
  }

  function startBot(config = {}) {
    setState(config);
    stopBot();
    window.botInterval = setInterval(runBot, window.autoDiscordDelayTime);
    window.autoDiscordBotRunning = true;
    runBot();
    console.log('🚀 AutoDiscord Bot đã bật.');
  }

  window.addEventListener('message', (event) => {
    if (!event.data || event.data.source !== 'auto-discord-extension') return;
    if (event.data.action === 'start') {
      startBot(event.data.config || {});
    } else if (event.data.action === 'stop') {
      stopBot();
    } else if (event.data.action === 'status-request') {
      window.postMessage({
        source: 'auto-discord-extension',
        action: 'status-response',
        requestId: event.data.requestId,
        running: !!window.autoDiscordBotRunning
      }, '*');
    }
  });

  console.log('AutoDiscord bot injector đã sẵn sàng.');
})();
