/**
 * 后台脚本 - background.js
 * 处理扩展生命周期和消息协调
 */

// 扩展安装时初始化
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[简历填充] 扩展已安装');

    // 设置默认示例数据
    const defaultResume = {
      basic: {
        name: '张三',
        gender: '',
        birthday: '',
        politicsStatus: '',
        phone: '',
        email: '',
        wechat: '',
        location: '',
        homepage: ''
      },
      education: [],
      workExperience: [],
      projects: [],
      campusExperience: [],
      skills: {
        office: [],
        design: [],
        languages: [],
        tools: []
      },
      personalSummary: {
        workStyle: '',
        personality: '',
        hobbies: ''
      }
    };

    chrome.storage.local.set({ resumeData: defaultResume });
  } else if (details.reason === 'update') {
    console.log('[简历填充] 扩展已更新到版本', chrome.runtime.getManifest().version);
  }
});

// 监听来自 content script 和 popup 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getResumeData') {
    chrome.storage.local.get(['resumeData'], (result) => {
      sendResponse(result.resumeData || null);
    });
    return true; // 异步响应
  }

  if (message.action === 'saveResumeData') {
    chrome.storage.local.set({ resumeData: message.data }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.action === 'log') {
    console.log('[简历填充]', message.message);
    sendResponse({ logged: true });
    return true;
  }
});

// 监听标签页更新，以便重新注入 content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // 可以在这里添加特定站点的日志
    try {
      const url = new URL(tab.url);
      if (url.hostname.includes('zhipin') ||
          url.hostname.includes('zhaopin') ||
          url.hostname.includes('51job') ||
          url.hostname.includes('liepin') ||
          url.hostname.includes('lagou')) {
        console.log('[简历填充] 检测到招聘网站:', url.hostname);
      }
    } catch (e) {
      // 忽略无效 URL
    }
  }
});

console.log('[简历填充] 后台脚本已加载');