function injectPageScript() {
  if (document.getElementById('auto-discord-inject-script')) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.id = 'auto-discord-inject-script';
    script.src = chrome.runtime.getURL('inject.js');
    script.onload = () => resolve();
    script.onerror = () => resolve();
    (document.head || document.documentElement).appendChild(script);
  });
}

function queryInjectedBotStatus() {
  return new Promise((resolve) => {
    const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    let timedOut = false;
    let timeout = null;

    const cleanup = () => {
      window.removeEventListener('message', handleStatusResponse);
      if (timeout) clearTimeout(timeout);
    };

    const handleStatusResponse = (event) => {
      if (!event.data || event.data.source !== 'auto-discord-extension' || event.data.action !== 'status-response' || event.data.requestId !== requestId) {
        return;
      }
      cleanup();
      resolve(event.data.running === true);
    };

    const sendRequest = () => {
      window.postMessage({source: 'auto-discord-extension', action: 'status-request', requestId}, '*');
    };

    window.addEventListener('message', handleStatusResponse);
    sendRequest();
    timeout = setTimeout(() => {
      if (timedOut) return;
      timedOut = true;
      sendRequest();
      timeout = setTimeout(() => {
        cleanup();
        resolve(false);
      }, 400);
    }, 200);
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.source !== 'popup') {
    return;
  }

  injectPageScript().then(() => {
    if (message.action === 'status') {
      queryInjectedBotStatus().then((running) => {
        sendResponse({status: 'ok', running});
      });
      return;
    }

    window.postMessage(
      {
        source: 'auto-discord-extension',
        action: message.action,
        config: message.config
      },
      '*'
    );
    sendResponse({status: 'ok'});
  });

  return true;
});
