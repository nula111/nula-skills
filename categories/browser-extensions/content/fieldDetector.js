/**
 * 字段检测引擎 - fieldDetector.js
 * 用于识别表单字段对应的简历数据类型
 */

const FieldDetector = {
  // 字段类型及其关键词映射
  fieldPatterns: {
    name: {
      keywords: ['name', 'username', 'realname', '姓名', '您的姓名', '个人姓名', '真实姓名'],
      type: 'text'
    },
    gender: {
      keywords: ['gender', 'sex', '性别'],
      type: 'select'
    },
    birthday: {
      keywords: ['birthday', 'birth', 'birthdate', 'birthday', '出生日期', '生日', '出生年月', '出生'],
      type: 'text'
    },
    politicsStatus: {
      keywords: ['politics', 'politicalstatus', '政治面貌', '政治面貌'],
      type: 'select'
    },
    phone: {
      keywords: ['phone', 'tel', 'mobile', 'telephone', '手机', '电话', '联系方式', '移动电话', '手机号'],
      type: 'tel'
    },
    email: {
      keywords: ['email', 'mail', '邮箱', '电子邮件', '邮箱地址', 'emailaddress', '电子邮箱'],
      type: 'email'
    },
    wechat: {
      keywords: ['wechat', 'weixin', '微信', '微信号', 'wechatid'],
      type: 'text'
    },
    location: {
      keywords: ['location', 'city', 'address', '居住地', '现居地', '所在地', '所在城市', '目前所在地'],
      type: 'text'
    },
    homepage: {
      keywords: ['homepage', 'portfolio', 'github', '个人主页', '作品集', '个人网站', '博客', '链接'],
      type: 'url'
    },

    // 教育相关
    education: {
      keywords: ['education', '学历', '最高学历', '教育背景', '受教育程度'],
      type: 'select'
    },
    degree: {
      keywords: ['degree', '学位', '学历'],
      type: 'select'
    },
    school: {
      keywords: ['school', 'university', 'college', '学校', '毕业院校', '教育经历', '就读学校', '全日制学历'],
      type: 'text'
    },
    major: {
      keywords: ['major', 'profession', '专业', '主修专业', '所学专业', '专业名称'],
      type: 'text'
    },
    startDate: {
      keywords: ['startdate', 'startdate', 'entrancedate', '入学时间', '开始时间', '入校时间', '就读时间'],
      type: 'text'
    },
    endDate: {
      keywords: ['enddate', 'enddate', 'graduationdate', '毕业时间', '结束时间', '毕业日期'],
      type: 'text'
    },
    gpa: {
      keywords: ['gpa', '绩点', '排名', 'gpa', 'rank', '学分', '平均成绩'],
      type: 'text'
    },
    ranking: {
      keywords: ['ranking', '排名', '名次', '专业排名'],
      type: 'text'
    },
    courses: {
      keywords: ['courses', 'curriculum', '主修课程', '课程', '主要课程', '专业课'],
      type: 'text'
    },
    honors: {
      keywords: ['honors', '奖励', '奖学金', '荣誉', '奖项', '获奖情况', '奖惩情况'],
      type: 'text'
    },
    researchDirection: {
      keywords: ['researchdirection', '研究方向', '研究领域', '研究课题'],
      type: 'text'
    },

    // 工作相关
    company: {
      keywords: ['company', 'workcompany', 'organization', '公司', '工作单位', '任职公司', '所属公司', '目前公司'],
      type: 'text'
    },
    department: {
      keywords: ['department', 'dept', '部门', '所在部门', '所属部门'],
      type: 'text'
    },
    position: {
      keywords: ['position', 'job', 'title', '职位', '岗位', '工作岗位', '职务', '担任职务', '职业'],
      type: 'text'
    },
    workStartDate: {
      keywords: ['workstartdate', 'workstart', '入职时间', '参加工作时间', '工作开始时间'],
      type: 'text'
    },
    workEndDate: {
      keywords: ['workenddate', 'workend', '离职时间', '工作结束时间', '截止时间'],
      type: 'text'
    },
    description: {
      keywords: ['description', 'responsibilities', '工作内容', '工作描述', '工作职责', '工作业绩', '工作内容描述'],
      type: 'textarea'
    },

    // 项目相关
    projectName: {
      keywords: ['projectname', 'project', '项目名称', '项目', '项目经历'],
      type: 'text'
    },
    projectRole: {
      keywords: ['projectrole', 'role', '角色', '担任角色', '项目职责', '项目身份'],
      type: 'text'
    },
    projectDescription: {
      keywords: ['projectdesc', 'projectdescription', '项目描述', '项目内容', '项目业绩', '项目职责'],
      type: 'textarea'
    },

    // 校园经历
    organization: {
      keywords: ['organization', 'club', '组织', '社团', '团队', '学生会', '党委', '团委'],
      type: 'text'
    },
    campusPosition: {
      keywords: ['campusposition', 'campusrole', '职务', '担任职务', '学生会职务', '社团职务', '干部'],
      type: 'text'
    },

    // 技能相关
    skills: {
      keywords: ['skill', 'skills', '技能', '技术栈', '专业技能', '个人技能', '能力特长'],
      type: 'text'
    },
    english: {
      keywords: ['english', 'cet', '英语', '外语', '语言能力', '语言成绩'],
      type: 'select'
    },
    computer: {
      keywords: ['computer', 'software', '计算机', '办公软件', '技能专长', 'office'],
      type: 'text'
    },

    // 其他
    selfEvaluation: {
      keywords: ['summary', 'intro', 'evaluation', '自我评价', '个人总结', '自我介绍', '简介', '个人简介', '自我描述'],
      type: 'textarea'
    },
    hobbies: {
      keywords: ['hobby', 'interest', '兴趣爱好', '爱好', '个人爱好', '特长爱好'],
      type: 'text'
    },
    expectedSalary: {
      keywords: ['salary', 'expectedsalary', '期望薪资', '薪资要求', '期望薪酬', '工资'],
      type: 'text'
    },
    availability: {
      keywords: ['availability', '到岗时间', '入职时间', '可到岗时间', '可入职时间'],
      type: 'select'
    }
  },

  /**
   * 检测单个元素对应的字段类型
   * @param {HTMLElement} element - 表单元素
   * @returns {string|null} 字段类型
   */
  detectFieldType(element) {
    if (!element) return null;

    const tagName = element.tagName.toLowerCase();
    if (!['input', 'select', 'textarea'].includes(tagName)) {
      // 尝试查找内部的输入元素
      const input = element.querySelector('input, select, textarea');
      if (input) element = input;
    }

    // 1. 检查 name 属性
    const name = element.name || '';
    const nameLower = name.toLowerCase().replace(/[_-]/g, '');
    for (const [fieldType, config] of Object.entries(this.fieldPatterns)) {
      if (this.matchKeywords(nameLower, config.keywords)) {
        return fieldType;
      }
    }

    // 2. 检查 id 属性
    const id = element.id || '';
    const idLower = id.toLowerCase().replace(/[_-]/g, '');
    for (const [fieldType, config] of Object.entries(this.fieldPatterns)) {
      if (this.matchKeywords(idLower, config.keywords)) {
        return fieldType;
      }
    }

    // 3. 检查 data-* 属性
    const dataField = element.dataset.field || element.getAttribute('data-name') || '';
    const dataFieldLower = dataField.toLowerCase();
    for (const [fieldType, config] of Object.entries(this.fieldPatterns)) {
      if (this.matchKeywords(dataFieldLower, config.keywords)) {
        return fieldType;
      }
    }

    // 4. 检查 placeholder
    const placeholder = element.placeholder || '';
    const placeholderLower = placeholder.toLowerCase();
    for (const [fieldType, config] of Object.entries(this.fieldPatterns)) {
      if (this.matchKeywords(placeholderLower, config.keywords)) {
        return fieldType;
      }
    }

    // 5. 检查 aria-label
    const ariaLabel = element.getAttribute('aria-label') || '';
    const ariaLabelLower = ariaLabel.toLowerCase();
    for (const [fieldType, config] of Object.entries(this.fieldPatterns)) {
      if (this.matchKeywords(ariaLabelLower, config.keywords)) {
        return fieldType;
      }
    }

    // 6. 检查标签文本（通过父级元素）
    const labelText = this.getLabelText(element);
    if (labelText) {
      const labelLower = labelText.toLowerCase();
      for (const [fieldType, config] of Object.entries(this.fieldPatterns)) {
        if (this.matchKeywords(labelLower, config.keywords)) {
          return fieldType;
        }
      }
    }

    // 7. 根据 input type 推断
    const inputType = element.type || '';
    if (inputType === 'email' && !this.hasTextMatch(element)) return 'email';
    if (inputType === 'tel' && !this.hasTextMatch(element)) return 'phone';
    if (inputType === 'url' && !this.hasTextMatch(element)) return 'homepage';

    return null;
  },

  /**
   * 匹配关键词
   */
  matchKeywords(text, keywords) {
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      if (text.includes(keywordLower)) {
        return true;
      }
      // 处理中文字符串的模糊匹配
      if (this.isChinese(keywordLower) && text.includes(keywordLower)) {
        return true;
      }
    }
    return false;
  },

  /**
   * 检查是否是中文
   */
  isChinese(text) {
    return /[一-龥]/.test(text);
  },

  /**
   * 获取关联的标签文本
   */
  getLabelText(element) {
    // 查找 for 属性指向的 label
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent;
    }

    // 查找父级 label
    let parent = element.parentElement;
    while (parent) {
      if (parent.tagName === 'LABEL') {
        return parent.textContent;
      }
      // 查找前面的兄弟 label
      const prevSibling = parent.previousElementSibling;
      if (prevSibling && prevSibling.tagName === 'LABEL') {
        return prevSibling.textContent;
      }
      parent = parent.parentElement;
    }

    // 查找最近的文本节点
    const container = element.closest('.field, .form-group, .form-item, .item, .row, [class*="field"]');
    if (container) {
      const labelEl = container.querySelector('label, .label, .title, [class*="label"]');
      if (labelEl) return labelEl.textContent;
    }

    return '';
  },

  /**
   * 检查元素是否有文本匹配
   */
  hasTextMatch(element) {
    const labelText = this.getLabelText(element);
    const placeholder = element.placeholder || '';
    const ariaLabel = element.getAttribute('aria-label') || '';

    const text = (labelText + placeholder + ariaLabel).toLowerCase();
    for (const [fieldType, config] of Object.entries(this.fieldPatterns)) {
      if (this.matchKeywords(text, config.keywords)) {
        return true;
      }
    }
    return false;
  },

  /**
   * 获取字段的建议输入类型
   */
  getSuggestedInputType(fieldType) {
    const config = this.fieldPatterns[fieldType];
    return config ? config.type : 'text';
  },

  /**
   * 扫描页面上的所有表单字段
   * @returns {Array} 字段信息列表
   */
  scanFormFields() {
    const fields = [];
    const inputs = document.querySelectorAll('input, select, textarea');

    inputs.forEach((input, index) => {
      // 跳过隐藏元素
      if (this.isElementHidden(input)) return;

      const fieldType = this.detectFieldType(input);
      const labelText = this.getLabelText(input);

      fields.push({
        element: input,
        index: index,
        fieldType: fieldType,
        labelText: labelText.trim(),
        placeholder: input.placeholder || '',
        name: input.name || '',
        id: input.id || '',
        tagName: input.tagName.toLowerCase(),
        type: input.type || 'text',
        value: input.value || '',
        options: this.getSelectOptions(input)
      });
    });

    return fields;
  },

  /**
   * 检查元素是否隐藏
   */
  isElementHidden(element) {
    const style = window.getComputedStyle(element);
    return style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0';
  },

  /**
   * 获取 select 元素的所有选项
   */
  getSelectOptions(select) {
    const options = [];
    select.querySelectorAll('option').forEach(opt => {
      options.push({
        value: opt.value,
        text: opt.textContent.trim()
      });
    });
    return options;
  },

  /**
   * 检测站点类型
   */
  detectSite() {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    const siteConfigs = {
      'zhipin.com': 'zhipin',
      'zhaopin.com': 'zhaopin',
      '51job.com': '51job',
      'liepin.com': 'liepin',
      'lagou.com': 'lagou',
      'jd.com': 'jd',
      'tencent.com': 'tencent',
      'alibaba.com': 'alibaba',
      'bytedance.com': 'bytedance',
      'baidu.com': 'baidu'
    };

    for (const [domain, siteId] of Object.entries(siteConfigs)) {
      if (hostname.includes(domain)) {
        return {
          id: siteId,
          hostname: hostname,
          pathname: pathname
        };
      }
    }

    return {
      id: 'unknown',
      hostname: hostname,
      pathname: pathname
    };
  }
};

// 导出到全局
window.FieldDetector = FieldDetector;