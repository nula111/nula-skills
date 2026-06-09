/**
 * 设置页面脚本 - options.js
 */

// 移除卡片
function removeCard(btn) {
  const card = btn.closest('.item-card');
  if (card) {
    card.remove();
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // DOM 元素
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');

  // 基础信息
  const nameInput = document.getElementById('name');
  const genderSelect = document.getElementById('gender');
  const birthdayInput = document.getElementById('birthday');
  const politicsStatusSelect = document.getElementById('politicsStatus');
  const phoneInput = document.getElementById('phone');
  const emailInput = document.getElementById('email');
  const wechatInput = document.getElementById('wechat');
  const homepageInput = document.getElementById('homepage');

  // 教育经历
  const educationList = document.getElementById('educationList');
  const addEducationBtn = document.getElementById('addEducation');

  // 工作经历
  const workList = document.getElementById('workList');
  const addWorkBtn = document.getElementById('addWork');

  // 项目经历
  const projectList = document.getElementById('projectList');
  const addProjectBtn = document.getElementById('addProject');

  // 校园经历
  const campusList = document.getElementById('campusList');
  const addCampusBtn = document.getElementById('addCampus');

  // 技能
  const officeSkillsInput = document.getElementById('officeSkills');
  const designSkillsInput = document.getElementById('designSkills');
  const languageInputs = document.getElementById('languageInputs');
  const addLanguageBtn = document.getElementById('addLanguage');
  const otherSkillsInput = document.getElementById('otherSkills');

  // 个人总结
  const workStyleInput = document.getElementById('workStyle');
  const personalityInput = document.getElementById('personality');
  const hobbiesInput = document.getElementById('hobbies');

  // Toast 显示
  function showToast(message, type = 'info') {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // 添加教育经历卡片
  addEducationBtn.addEventListener('click', () => {
    const template = document.getElementById('educationTemplate');
    const clone = template.content.cloneNode(true);
    educationList.appendChild(clone);
  });

  // 添加工作经历卡片
  addWorkBtn.addEventListener('click', () => {
    const template = document.getElementById('workTemplate');
    const clone = template.content.cloneNode(true);
    workList.appendChild(clone);
  });

  // 添加项目经历卡片
  addProjectBtn.addEventListener('click', () => {
    const template = document.getElementById('projectTemplate');
    const clone = template.content.cloneNode(true);
    projectList.appendChild(clone);
  });

  // 添加校园经历卡片
  addCampusBtn.addEventListener('click', () => {
    const template = document.getElementById('campusTemplate');
    const clone = template.content.cloneNode(true);
    campusList.appendChild(clone);
  });

  // 添加语言能力
  addLanguageBtn.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'language-row';
    row.innerHTML = `
      <input type="text" class="lang-name" placeholder="如: CET-6">
      <input type="text" class="lang-score" placeholder="分数如: 619">
    `;
    languageInputs.appendChild(row);
  });

  // 从卡片中提取数据
  function getEducationData() {
    const cards = educationList.querySelectorAll('.item-card');
    const data = [];
    cards.forEach(card => {
      const item = {
        school: card.querySelector('.edu-school').value,
        degree: card.querySelector('.edu-degree').value,
        major: card.querySelector('.edu-major').value,
        startDate: card.querySelector('.edu-start').value,
        endDate: card.querySelector('.edu-end').value,
        ranking: card.querySelector('.edu-ranking').value,
        honors: card.querySelector('.edu-honors').value,
        courses: card.querySelector('.edu-courses').value
      };
      if (item.school) data.push(item);
    });
    return data;
  }

  function getWorkData() {
    const cards = workList.querySelectorAll('.item-card');
    const data = [];
    cards.forEach(card => {
      const highlightsText = card.querySelector('.work-highlights').value;
      const item = {
        company: card.querySelector('.work-company').value,
        department: card.querySelector('.work-department').value,
        position: card.querySelector('.work-position').value,
        startDate: card.querySelector('.work-start').value,
        endDate: card.querySelector('.work-end').value,
        highlights: highlightsText ? highlightsText.split('\n').filter(h => h.trim()) : []
      };
      if (item.company) data.push(item);
    });
    return data;
  }

  function getProjectData() {
    const cards = projectList.querySelectorAll('.item-card');
    const data = [];
    cards.forEach(card => {
      const highlightsText = card.querySelector('.proj-highlights').value;
      const item = {
        name: card.querySelector('.proj-name').value,
        role: card.querySelector('.proj-role').value,
        startDate: card.querySelector('.proj-start').value,
        endDate: card.querySelector('.proj-end').value,
        highlights: highlightsText ? highlightsText.split('\n').filter(h => h.trim()) : []
      };
      if (item.name) data.push(item);
    });
    return data;
  }

  function getCampusData() {
    const cards = campusList.querySelectorAll('.item-card');
    const data = [];
    cards.forEach(card => {
      const highlightsText = card.querySelector('.campus-highlights').value;
      const timeText = card.querySelector('.campus-time').value;
      let startDate = '', endDate = '';
      if (timeText.includes('-')) {
        [startDate, endDate] = timeText.split('-');
      } else {
        startDate = timeText;
      }
      const item = {
        organization: card.querySelector('.campus-org').value,
        position: card.querySelector('.campus-position').value,
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        highlights: highlightsText ? highlightsText.split('\n').filter(h => h.trim()) : []
      };
      if (item.organization) data.push(item);
    });
    return data;
  }

  function getLanguageData() {
    const rows = languageInputs.querySelectorAll('.language-row');
    const data = [];
    rows.forEach(row => {
      const name = row.querySelector('.lang-name').value;
      const score = row.querySelector('.lang-score').value;
      if (name) {
        data.push({ name, score });
      }
    });
    return data;
  }

  // 收集所有表单数据
  function collectFormData() {
    const languages = getLanguageData();
    const toolsText = otherSkillsInput.value;
    const tools = toolsText ? toolsText.split(/[,，]/).map(t => t.trim()).filter(t => t) : [];

    return {
      basic: {
        name: nameInput.value,
        gender: genderSelect.value,
        birthday: birthdayInput.value,
        politicsStatus: politicsStatusSelect.value,
        phone: phoneInput.value,
        email: emailInput.value,
        wechat: wechatInput.value,
        homepage: homepageInput.value
      },
      education: getEducationData(),
      workExperience: getWorkData(),
      projects: getProjectData(),
      campusExperience: getCampusData(),
      skills: {
        office: officeSkillsInput.value ? officeSkillsInput.value.split(/[,，]/).map(s => s.trim()).filter(s => s) : [],
        design: designSkillsInput.value ? designSkillsInput.value.split(/[,，]/).map(s => s.trim()).filter(s => s) : [],
        languages: languages,
        tools: tools
      },
      personalSummary: {
        workStyle: workStyleInput.value,
        personality: personalityInput.value,
        hobbies: hobbiesInput.value
      }
    };
  }

  // 填充表单
  function fillForm(data) {
    if (!data) return;

    // 基础信息
    if (data.basic) {
      nameInput.value = data.basic.name || '';
      genderSelect.value = data.basic.gender || '';
      birthdayInput.value = data.basic.birthday || '';
      politicsStatusSelect.value = data.basic.politicsStatus || '';
      phoneInput.value = data.basic.phone || '';
      emailInput.value = data.basic.email || '';
      wechatInput.value = data.basic.wechat || '';
      homepageInput.value = data.basic.homepage || '';
    }

    // 教育经历
    if (data.education && data.education.length > 0) {
      educationList.innerHTML = '';
      data.education.forEach(edu => {
        addEducationBtn.click();
        const card = educationList.lastElementChild;
        card.querySelector('.edu-school').value = edu.school || '';
        card.querySelector('.edu-degree').value = edu.degree || '';
        card.querySelector('.edu-major').value = edu.major || '';
        card.querySelector('.edu-start').value = edu.startDate || '';
        card.querySelector('.edu-end').value = edu.endDate || '';
        card.querySelector('.edu-ranking').value = edu.ranking || '';
        card.querySelector('.edu-honors').value = edu.honors || '';
        card.querySelector('.edu-courses').value = edu.courses || '';
      });
    }

    // 工作经历
    if (data.workExperience && data.workExperience.length > 0) {
      workList.innerHTML = '';
      data.workExperience.forEach(work => {
        addWorkBtn.click();
        const card = workList.lastElementChild;
        card.querySelector('.work-company').value = work.company || '';
        card.querySelector('.work-department').value = work.department || '';
        card.querySelector('.work-position').value = work.position || '';
        card.querySelector('.work-start').value = work.startDate || '';
        card.querySelector('.work-end').value = work.endDate || '';
        card.querySelector('.work-highlights').value = work.highlights?.join('\n') || '';
      });
    }

    // 项目经历
    if (data.projects && data.projects.length > 0) {
      projectList.innerHTML = '';
      data.projects.forEach(proj => {
        addProjectBtn.click();
        const card = projectList.lastElementChild;
        card.querySelector('.proj-name').value = proj.name || '';
        card.querySelector('.proj-role').value = proj.role || '';
        card.querySelector('.proj-start').value = proj.startDate || '';
        card.querySelector('.proj-end').value = proj.endDate || '';
        card.querySelector('.proj-highlights').value = proj.highlights?.join('\n') || '';
      });
    }

    // 校园经历
    if (data.campusExperience && data.campusExperience.length > 0) {
      campusList.innerHTML = '';
      data.campusExperience.forEach(campus => {
        addCampusBtn.click();
        const card = campusList.lastElementChild;
        card.querySelector('.campus-org').value = campus.organization || '';
        card.querySelector('.campus-position').value = campus.position || '';
        card.querySelector('.campus-time').value = `${campus.startDate || ''}-${campus.endDate || ''}`;
        card.querySelector('.campus-highlights').value = campus.highlights?.join('\n') || '';
      });
    }

    // 技能
    if (data.skills) {
      officeSkillsInput.value = data.skills.office?.join(', ') || '';
      designSkillsInput.value = data.skills.design?.join(', ') || '';
      otherSkillsInput.value = data.skills.tools?.join(', ') || '';

      if (data.skills.languages && data.skills.languages.length > 0) {
        languageInputs.innerHTML = '';
        data.skills.languages.forEach(lang => {
          addLanguageBtn.click();
          const rows = languageInputs.querySelectorAll('.language-row');
          const lastRow = rows[rows.length - 1];
          lastRow.querySelector('.lang-name').value = lang.name || '';
          lastRow.querySelector('.lang-score').value = lang.score || '';
        });
      }
    }

    // 个人总结
    if (data.personalSummary) {
      workStyleInput.value = data.personalSummary.workStyle || '';
      personalityInput.value = data.personalSummary.personality || '';
      hobbiesInput.value = data.personalSummary.hobbies || '';
    }
  }

  // 保存数据
  async function saveData() {
    const data = collectFormData();
    await chrome.storage.local.set({ resumeData: data });
    showToast('简历数据已保存', 'success');
  }

  // 重置表单
  function resetForm() {
    // 清空基础信息
    nameInput.value = '';
    genderSelect.value = '';
    birthdayInput.value = '';
    politicsStatusSelect.value = '';
    phoneInput.value = '';
    emailInput.value = '';
    wechatInput.value = '';
    homepageInput.value = '';

    // 清空经历列表
    educationList.innerHTML = '';
    workList.innerHTML = '';
    projectList.innerHTML = '';
    campusList.innerHTML = '';

    // 清空技能
    officeSkillsInput.value = '';
    designSkillsInput.value = '';
    languageInputs.innerHTML = '';
    otherSkillsInput.value = '';

    // 清空个人总结
    workStyleInput.value = '';
    personalityInput.value = '';
    hobbiesInput.value = '';

    showToast('表单已重置', 'info');
  }

  // 导出 JSON
  function exportJSON() {
    const data = collectFormData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume_${data.basic?.name || 'export'}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('简历已导出', 'success');
  }

  // 导入 JSON
  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        fillForm(data);
        showToast('简历已导入', 'success');
      } catch (error) {
        showToast('导入失败: ' + error.message, 'error');
      }
    };
    reader.readAsText(file);
  }

  // 加载已有数据
  async function loadData() {
    const result = await chrome.storage.local.get(['resumeData']);
    if (result.resumeData) {
      fillForm(result.resumeData);
    }
  }

  // 事件绑定
  saveBtn.addEventListener('click', saveData);
  resetBtn.addEventListener('click', resetForm);
  exportBtn.addEventListener('click', exportJSON);
  importBtn.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      importJSON(e.target.files[0]);
      e.target.value = '';
    }
  });

  // 初始化
  loadData();
});