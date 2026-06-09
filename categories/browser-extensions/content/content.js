/**
 * 内容脚本 - content.js
 * 处理表单扫描和填充逻辑
 */

// 等待 FieldDetector 加载
if (!window.FieldDetector) {
  console.error('[简历填充] FieldDetector 未加载');
}

// 简历填充器
const ResumeFiller = {
  // 简历数据（将从 storage 加载）
  resumeData: null,

  /**
   * 初始化
   */
  async init() {
    // 从 storage 加载简历数据
    const result = await chrome.storage.local.get(['resumeData']);
    this.resumeData = result.resumeData || null;

    // 监听来自 popup 的消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'fillForm') {
        this.fillCurrentPage().then(result => {
          sendResponse(result);
        });
        return true; // 异步响应
      }

      if (message.action === 'updateResumeData') {
        this.resumeData = message.data;
        sendResponse({ success: true });
        return true;
      }

      if (message.action === 'getFieldInfo') {
        const fields = FieldDetector.scanFormFields();
        sendResponse({ fields: fields, site: FieldDetector.detectSite() });
        return true;
      }
    });

    console.log('[简历填充] 内容脚本已初始化');
  },

  /**
   * 填充当前页面
   */
  async fillCurrentPage() {
    if (!this.resumeData) {
      return { success: false, message: '请先在弹窗中导入简历数据' };
    }

    const fields = FieldDetector.scanFormFields();
    const site = FieldDetector.detectSite();
    let filledCount = 0;
    let skippedCount = 0;

    // 根据站点获取对应的填充策略
    const fillStrategy = this.getFillStrategy(site);

    for (const field of fields) {
      if (!field.fieldType) {
        skippedCount++;
        continue;
      }

      const value = this.getValueForField(field.fieldType, fillStrategy);
      if (value !== null && value !== undefined && value !== '') {
        this.fillField(field, value);
        filledCount++;
      } else {
        skippedCount++;
      }
    }

    return {
      success: true,
      filledCount,
      skippedCount,
      totalFields: fields.length,
      site: site
    };
  },

  /**
   * 获取站点的填充策略
   */
  getFillStrategy(site) {
    // 针对不同站点的特殊处理
    const strategies = {
      zhipin: {
        // BOSS直聘的特殊选择器映射
      },
      '51job': {
        // 前程无忧的特殊映射
      },
      // 可以继续添加其他站点配置
    };

    return strategies[site.id] || {};
  },

  /**
   * 根据字段类型获取对应的值
   */
  getValueForField(fieldType, strategy) {
    if (!this.resumeData) return null;

    // basic 信息
    if (fieldType === 'name') return this.resumeData.basic?.name;
    if (fieldType === 'gender') return this.resumeData.basic?.gender;
    if (fieldType === 'birthday') return this.resumeData.basic?.birthday;
    if (fieldType === 'politicsStatus') return this.resumeData.basic?.politicsStatus;
    if (fieldType === 'phone') return this.resumeData.basic?.phone;
    if (fieldType === 'email') return this.resumeData.basic?.email;
    if (fieldType === 'wechat') return this.resumeData.basic?.wechat;
    if (fieldType === 'location') return this.resumeData.basic?.location;
    if (fieldType === 'homepage') return this.resumeData.basic?.homepage;

    // Wecruit 特殊字段
    if (fieldType === 'height') return this.resumeData.basic?.height;
    if (fieldType === 'weight') return this.resumeData.basic?.weight;
    if (fieldType === 'ethnicity') return this.resumeData.basic?.ethnicity;
    if (fieldType === 'maritalStatus') return this.resumeData.basic?.maritalStatus;
    if (fieldType === 'idType') return this.resumeData.basic?.idType || '身份证';
    if (fieldType === 'idNumber') return this.resumeData.basic?.idNumber;
    if (fieldType === 'nativePlace') return this.resumeData.basic?.nativePlace;
    if (fieldType === 'homePhone') return this.resumeData.basic?.homePhone;
    if (fieldType === 'expectedSalary') return this.resumeData.personalSummary?.expectedSalary;
    if (fieldType === 'expectedLocation') return this.resumeData.personalSummary?.expectedLocation;
    if (fieldType === 'acceptAdjustment') return this.resumeData.personalSummary?.acceptAdjustment || '是';
    if (fieldType === 'adjustmentPosition') return this.resumeData.personalSummary?.adjustmentPosition;
    if (fieldType === 'hasExperience') return this.resumeData.workExperience?.length > 0 ? '是' : '否';

    // 教育相关 - 取第一条
    if (fieldType === 'school' && this.resumeData.education?.length > 0) {
      return this.resumeData.education[0].school;
    }
    if (fieldType === 'degree' && this.resumeData.education?.length > 0) {
      return this.resumeData.education[0].degree;
    }
    if (fieldType === 'major' && this.resumeData.education?.length > 0) {
      return this.resumeData.education[0].major;
    }
    if (fieldType === 'startDate' && this.resumeData.education?.length > 0) {
      return this.resumeData.education[0].startDate;
    }
    if (fieldType === 'endDate' && this.resumeData.education?.length > 0) {
      return this.resumeData.education[0].endDate;
    }
    if (fieldType === 'gpa' && this.resumeData.education?.length > 0) {
      return this.resumeData.education[0].gpa;
    }
    if (fieldType === 'ranking' && this.resumeData.education?.length > 0) {
      return this.resumeData.education[0].ranking;
    }
    if (fieldType === 'honors' && this.resumeData.education?.length > 0) {
      return this.resumeData.education[0].honors;
    }
    if (fieldType === 'courses' && this.resumeData.education?.length > 0) {
      return this.resumeData.education[0].courses;
    }
    if (fieldType === 'researchDirection' && this.resumeData.education?.length > 0) {
      return this.resumeData.education[0].researchDirection;
    }
    if (fieldType === 'college' && this.resumeData.education?.length > 0) {
      return this.resumeData.education[0].college;
    }
    if (fieldType === 'mentor' && this.resumeData.education?.length > 0) {
      return this.resumeData.education[0].mentor;
    }
    if (fieldType === 'avgScore' && this.resumeData.education?.length > 0) {
      return this.resumeData.education[0].avgScore;
    }
    if (fieldType === 'studyType' && this.resumeData.education?.length > 0) {
      return this.resumeData.education[0].studyType || '全日制';
    }
    if (fieldType === 'eduType' && this.resumeData.education?.length > 0) {
      return this.resumeData.education[0].eduType || '统招';
    }

    // 工作经历 - 取第一条
    if (fieldType === 'company' && this.resumeData.workExperience?.length > 0) {
      return this.resumeData.workExperience[0].company;
    }
    if (fieldType === 'department' && this.resumeData.workExperience?.length > 0) {
      return this.resumeData.workExperience[0].department;
    }
    if (fieldType === 'position' && this.resumeData.workExperience?.length > 0) {
      return this.resumeData.workExperience[0].position;
    }
    if (fieldType === 'workStartDate' && this.resumeData.workExperience?.length > 0) {
      return this.resumeData.workExperience[0].startDate;
    }
    if (fieldType === 'workEndDate' && this.resumeData.workExperience?.length > 0) {
      return this.resumeData.workExperience[0].endDate;
    }
    if (fieldType === 'description' && this.resumeData.workExperience?.length > 0) {
      return this.resumeData.workExperience[0].highlights?.join('\n');
    }

    // 项目相关
    if (fieldType === 'projectName' && this.resumeData.projects?.length > 0) {
      return this.resumeData.projects[0].name;
    }
    if (fieldType === 'projectRole' && this.resumeData.projects?.length > 0) {
      return this.resumeData.projects[0].role;
    }
    if (fieldType === 'projectDescription' && this.resumeData.projects?.length > 0) {
      return this.resumeData.projects[0].highlights?.join('\n');
    }

    // 校园经历
    if (fieldType === 'organization' && this.resumeData.campusExperience?.length > 0) {
      return this.resumeData.campusExperience[0].organization;
    }
    if (fieldType === 'campusPosition' && this.resumeData.campusExperience?.length > 0) {
      return this.resumeData.campusExperience[0].position;
    }

    // 技能相关
    if (fieldType === 'skills') {
      const skills = this.resumeData.skills;
      if (skills) {
        const skillArr = [];
        if (skills.office) skillArr.push(...skills.office);
        if (skills.design) skillArr.push(...skills.design);
        if (skills.tools) skillArr.push(...skills.tools);
        return skillArr.join(', ');
      }
    }
    if (fieldType === 'english' && this.resumeData.skills?.languages) {
      return this.resumeData.skills.languages[0]?.name || 'CET-6';
    }
    if (fieldType === 'languageScore' && this.resumeData.skills?.languages) {
      return this.resumeData.skills.languages[0]?.score || '619';
    }
    if (fieldType === 'computer' && this.resumeData.skills) {
      const arr = [];
      if (this.resumeData.skills.office) arr.push(...this.resumeData.skills.office);
      if (this.resumeData.skills.design) arr.push(...this.resumeData.skills.design);
      return arr.join(', ');
    }

    // 自我评价等
    if (fieldType === 'selfEvaluation') {
      const ps = this.resumeData.personalSummary;
      if (ps) {
        return [ps.workStyle, ps.personality, ps.hobbies].filter(Boolean).join('；');
      }
    }
    if (fieldType === 'hobbies') {
      return this.resumeData.personalSummary?.hobbies;
    }

    return null;
  },

  /**
   * 填充单个字段
   */
  fillField(field, value) {
    const element = field.element;
    const tagName = field.tagName;
    const type = field.type;

    // 格式化日期
    const formattedValue = this.formatValue(value, field.fieldType);

    if (tagName === 'select') {
      this.fillSelect(element, formattedValue);
    } else if (tagName === 'textarea') {
      this.fillTextarea(element, formattedValue);
    } else {
      this.fillInput(element, formattedValue);
    }

    // 触发 change 事件
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('input', { bubbles: true }));
  },

  /**
   * 填充输入框
   */
  fillInput(element, value) {
    // 设置值
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    ).set;

    nativeInputValueSetter.call(element, value);
    element.value = value;

    // 触发 input 事件
    element.dispatchEvent(new Event('input', { bubbles: true }));
  },

  /**
   * 填充文本框
   */
  fillTextarea(element, value) {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    ).set;

    nativeInputValueSetter.call(element, value);
    element.value = value;

    element.dispatchEvent(new Event('input', { bubbles: true }));
  },

  /**
   * 填充下拉框
   */
  fillSelect(element, value) {
    const options = element.querySelectorAll('option');
    const normalizedValue = value.toString().toLowerCase().trim();

    for (const option of options) {
      const optionText = option.textContent.toLowerCase().trim();
      const optionValue = option.value.toLowerCase().trim();

      // 精确匹配或包含匹配
      if (optionText === normalizedValue || optionValue === normalizedValue ||
          optionText.includes(normalizedValue) || normalizedValue.includes(optionText)) {
        element.value = option.value;
        return;
      }
    }

    // 如果没有匹配，尝试第一个非空选项
    if (options.length > 0 && options[0].value) {
      element.value = options[0].value;
    }
  },

  /**
   * 格式化值
   */
  formatValue(value, fieldType) {
    if (value === null || value === undefined) return '';

    let str = value.toString();

    // 日期格式标准化
    if (fieldType === 'startDate' || fieldType === 'endDate' ||
        fieldType === 'workStartDate' || fieldType === 'workEndDate') {
      // 保持原格式或转换为 yyyy.mm 格式
      if (/^\d{4}[-./]\d{1,2}$/.test(str)) {
        return str.replace(/\//g, '.');
      }
    }

    // 布尔值转换
    if (fieldType === 'education' || fieldType === 'degree') {
      const degreeMap = {
        '本科': '本科', '学士': '本科',
        '硕士': '硕士', '研究生': '硕士',
        '博士': '博士', '博士生': '博士',
        '高中': '高中', '中专': '中专', '大专': '大专'
      };
      return degreeMap[str] || str;
    }

    // 政治面貌标准化
    if (fieldType === 'politicsStatus') {
      const politicsMap = {
        '党员': '中共党员', '中共党员': '中共党员',
        '预备党员': '预备党员',
        '共青团员': '共青团员', '团员': '共青团员',
        '群众': '群众', '无党派人士': '无党派人士'
      };
      return politicsMap[str] || str;
    }

    // 性别标准化
    if (fieldType === 'gender') {
      const genderMap = {
        '男': '男', '男性': '男',
        '女': '女', '女性': '女'
      };
      return genderMap[str] || str;
    }

    // 是否接受调剂
    if (fieldType === 'acceptAdjustment') {
      return str === '是' || str === 'yes' || str === 'Y' ? '是' : '否';
    }

    // 民族标准化
    if (fieldType === 'ethnicity') {
      if (!str || str === '汉族') return '汉族';
      return str;
    }

    return str;
  }
};

// 初始化
ResumeFiller.init();