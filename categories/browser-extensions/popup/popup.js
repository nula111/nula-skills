/**
 * Popup 脚本 - popup.js
 * 处理弹窗交互逻辑
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 获取 DOM 元素
  const fillBtn = document.getElementById('fillBtn');
  const importBtn = document.getElementById('importBtn');
  const exportBtn = document.getElementById('exportBtn');
  const fileInput = document.getElementById('fileInput');
  const siteInfo = document.getElementById('siteInfo');
  const resumeStatus = document.getElementById('resumeStatus');
  const resumePreview = document.getElementById('resumePreview');
  const previewName = document.getElementById('previewName');
  const previewEmail = document.getElementById('previewEmail');
  const resultSection = document.getElementById('resultSection');
  const resultIcon = document.getElementById('resultIcon');
  const resultTitle = document.getElementById('resultTitle');
  const resultDetails = document.getElementById('resultDetails');
  const fieldsList = document.getElementById('fieldsList');
  const openOptions = document.getElementById('openOptions');

  // 加载简历数据
  async function loadResumeData() {
    const result = await chrome.storage.local.get(['resumeData']);
    return result.resumeData || null;
  }

  // 保存简历数据
  async function saveResumeData(data) {
    await chrome.storage.local.set({ resumeData: data });
  }

  // 更新 UI 状态
  function updateUI(resumeData) {
    if (resumeData) {
      resumeStatus.textContent = '已导入';
      resumeStatus.classList.add('active');
      resumePreview.style.display = 'flex';
      previewName.textContent = resumeData.basic?.name || '';
      previewEmail.textContent = resumeData.basic?.email || '';
      fillBtn.disabled = false;
      exportBtn.disabled = false;
    } else {
      resumeStatus.textContent = '未导入';
      resumeStatus.classList.remove('active');
      resumePreview.style.display = 'none';
      fillBtn.disabled = true;
      exportBtn.disabled = true;
    }
  }

  // 获取当前标签页
  async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  // 扫描当前页面字段
  async function scanFields() {
    const tab = await getCurrentTab();
    if (!tab || !tab.id) return { fields: [], site: null };

    try {
      const result = await chrome.tabs.sendMessage(tab.id, { action: 'getFieldInfo' });
      return result || { fields: [], site: null };
    } catch (error) {
      console.error('[Popup] 扫描字段失败:', error);
      return { fields: [], site: null };
    }
  }

  // 填充当前页面
  async function fillCurrentPage() {
    const tab = await getCurrentTab();
    if (!tab || !tab.id) return;

    fillBtn.disabled = true;
    fillBtn.innerHTML = '<span class="btn-icon">⏳</span> 填充中...';

    try {
      const result = await chrome.tabs.sendMessage(tab.id, { action: 'fillForm' });
      showResult(result);
    } catch (error) {
      showResult({ success: false, message: '无法连接到页面，请刷新后重试' });
    }

    fillBtn.disabled = false;
    fillBtn.innerHTML = '<span class="btn-icon">🚀</span> 填充当前页面';
  }

  // 显示填充结果
  function showResult(result) {
    resultSection.style.display = 'block';

    if (result.success) {
      resultIcon.textContent = '✅';
      resultTitle.textContent = '填充完成';
      resultDetails.innerHTML = `
        已填充 <span class="stat">${result.filledCount}</span> 个字段，
        跳过 <span class="stat">${result.skippedCount}</span> 个字段
        <br>当前站点: ${result.site?.hostname || '未知'}
      `;
    } else {
      resultIcon.textContent = '❌';
      resultTitle.textContent = '填充失败';
      resultDetails.textContent = result.message || '未知错误';
    }

    // 3秒后隐藏结果
    setTimeout(() => {
      resultSection.style.display = 'none';
    }, 5000);
  }

  // 渲染字段列表
  function renderFields(fields) {
    if (!fields || fields.length === 0) {
      fieldsList.innerHTML = '<div class="loading">未检测到可填充字段</div>';
      return;
    }

    const matchedFields = fields.filter(f => f.fieldType);
    const unmatchedFields = fields.filter(f => !f.fieldType);

    let html = '';

    // 显示匹配的字段
    if (matchedFields.length > 0) {
      matchedFields.slice(0, 20).forEach(field => {
        html += `
          <div class="field-item">
            <span class="field-type">${field.fieldType || 'unknown'}</span>
            <span class="field-label" title="${field.labelText || field.placeholder || field.name || ''}">
              ${field.labelText || field.placeholder || field.name || '(未命名字段)'}
            </span>
            <span class="field-status matched">✓</span>
          </div>
        `;
      });
    }

    // 显示未匹配的字段
    if (unmatchedFields.length > 0 && matchedFields.length < 20) {
      unmatchedFields.slice(0, 5).forEach(field => {
        const label = field.labelText || field.placeholder || field.name || '(未命名)';
        html += `
          <div class="field-item">
            <span class="field-type">-</span>
            <span class="field-label" title="${label}">${label}</span>
            <span class="field-status unmatched">?</span>
          </div>
        `;
      });
    }

    fieldsList.innerHTML = html;
  }

  // 导入简历
  function importResume() {
    fileInput.click();
  }

  // 处理文件导入
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // 验证数据结构
      if (!data.basic || !data.basic.name) {
        throw new Error('简历数据格式不正确，缺少 basic.name 字段');
      }

      await saveResumeData(data);
      updateUI(data);
      showResult({ success: true, message: `成功导入简历: ${data.basic.name}` });
    } catch (error) {
      showResult({ success: false, message: `导入失败: ${error.message}` });
    }

    // 清空文件输入
    fileInput.value = '';
  });

  // 导出简历
  async function exportResume() {
    const data = await loadResumeData();
    if (!data) {
      showResult({ success: false, message: '没有可导出的简历数据' });
      return;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume_${data.basic.name}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showResult({ success: true, message: '简历已导出' });
  }

  // 打开设置页面
  function openOptionsPage() {
    chrome.runtime.openOptionsPage();
  }

  // 初始化
  async function init() {
    // 加载简历数据
    const resumeData = await loadResumeData();
    updateUI(resumeData);

    // 扫描页面字段
    const { fields, site } = await scanFields();

    // 更新站点信息
    if (site) {
      siteInfo.textContent = site.hostname || '未知站点';
    } else {
      siteInfo.textContent = '非招聘网站';
    }

    // 渲染字段列表
    renderFields(fields);
  }

  // 绑定事件
  fillBtn.addEventListener('click', fillCurrentPage);
  importBtn.addEventListener('click', importResume);
  exportBtn.addEventListener('click', exportResume);
  openOptions.addEventListener('click', (e) => {
    e.preventDefault();
    openOptionsPage();
  });

  // 初始化
  init();
});