/**
 * AI 解析模块 - aiParser.js
 * 从简历文本中自动识别和提取字段
 */

const ResumeParser = {
  // 中国高校数据库（部分）
  universities: [
    '北京大学', '清华大学', '复旦大学', '上海交通大学', '浙江大学',
    '南京大学', '中国人民大学', '中国科学技术大学', '武汉大学',
    '华中科技大学', '中山大学', '四川大学', '西安交通大学', '哈尔滨工业大学',
    '北京师范大学', '同济大学', '北京航空航天大学', '天津大学', '东南大学',
    '南开大学', '山东大学', '厦门大学', '中南大学', '湖南大学',
    '中央民族大学', '华东师范大学', '电子科技大学', '大连理工大学', '吉林大学',
    '东北大学', '西北工业大学', '重庆大学', '华南理工大学', '兰州大学',
    '中国农业大学', '中国海洋大学', '西北农林科技大学', '武汉理工大学',
    '北京理工大学', '南京航空航天大学', '西安电子科技大学', '南京理工大学',
    '天津科技大学', '北京科技大学', '北京交通大学', '北京邮电大学', '华北电力大学'
  ],

  // 正则表达式模式
  patterns: {
    email: /[\w.-]+@[\w.-]+\.\w+/gi,
    phone: /1[3-9]\d{9}/g,
    phoneAlt: /\d{3,4}[-]?\d{7,8}/g,
    date: /(\d{4}[-.年]\d{1,2}(?:[-.月]\d{1,2}[日]?)?|\d{4}[-.年]\d{1,2})/g,
    dateRange: /(\d{4}[-.年]\d{1,2})\s*[-~至]\s*(\d{4}[-.年]\d{1,2}|至今|现在)/g,
    yearMonth: /\d{4}[-.年]\d{1,2}[月]?/g
  },

  /**
   * 从文本中提取所有简历字段
   * @param {string} text - 简历文本内容
   * @returns {Object} 提取的字段数据
   */
  extractFields(text) {
    if (!text || typeof text !== 'string') {
      return { basic: {}, education: [], workExperience: [], projects: [], skills: {} };
    }

    // 清理文本
    const cleanText = this.cleanText(text);

    return {
      basic: this.extractBasicInfo(cleanText),
      education: this.extractEducation(cleanText),
      workExperience: this.extractWorkExperience(cleanText),
      projects: this.extractProjects(cleanText),
      skills: this.extractSkills(cleanText)
    };
  },

  /**
   * 清理文本
   */
  cleanText(text) {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  },

  /**
   * 提取基本信息
   */
  extractBasicInfo(text) {
    const basic = {};

    // 提取邮箱
    const emails = text.match(this.patterns.email);
    if (emails && emails.length > 0) {
      basic.email = emails[0].toLowerCase();
    }

    // 提取电话
    const phones = text.match(this.patterns.phone);
    if (phones && phones.length > 0) {
      basic.phone = phones[0];
    }

    // 尝试提取姓名（通常在文本开头）
    const firstLine = text.split('\n')[0].trim();
    if (firstLine && firstLine.length <= 10 && !firstLine.includes('@') && !/\d/.test(firstLine)) {
      basic.name = firstLine;
    }

    // 尝试提取微信（常见格式）
    const wechatMatch = text.match(/微信[：:]\s*([a-zA-Z0-9_]+)/i);
    if (wechatMatch) {
      basic.wechat = wechatMatch[1];
    }

    // 尝试提取 GitHub
    const githubMatch = text.match(/github\.com\/([a-zA-Z0-9_-]+)/i);
    if (githubMatch) {
      basic.homepage = 'github.com/' + githubMatch[1];
    }

    // 尝试提取政治面貌
    if (text.includes('中共党员') || text.includes('党员')) {
      basic.politicsStatus = '中共党员';
    } else if (text.includes('共青团员') || text.includes('团员')) {
      basic.politicsStatus = '共青团员';
    }

    return basic;
  },

  /**
   * 提取教育经历
   */
  extractEducation(text) {
    const education = [];
    const lines = text.split('\n');

    // 查找教育经历部分
    let inEducationSection = false;
    let currentEdu = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 检测教育经历开始
      if (/教育|学历|毕业院校/.test(line) && !inEducationSection) {
        inEducationSection = true;
        continue;
      }

      // 检测其他经历开始，结束教育经历
      if (inEducationSection && /工作|实习|项目|经历/.test(line) && currentEdu) {
        if (currentEdu.school) {
          education.push(currentEdu);
        }
        currentEdu = null;
        inEducationSection = false;
      }

      if (inEducationSection) {
        // 查找学校名称
        for (const uni of this.universities) {
          if (line.includes(uni)) {
            if (currentEdu && currentEdu.school) {
              education.push(currentEdu);
            }
            currentEdu = {
              school: uni,
              degree: '',
              major: '',
              startDate: '',
              endDate: '',
              honors: ''
            };
            break;
          }
        }

        if (currentEdu) {
          // 提取学历
          if (/硕士|研究生/.test(line)) {
            currentEdu.degree = line.includes('博士') ? '博士' : '硕士';
          } else if (/本科|学士/.test(line)) {
            currentEdu.degree = '本科';
          } else if (/大专/.test(line)) {
            currentEdu.degree = '大专';
          }

          // 提取专业
          if (/专业[:：]/.test(line)) {
            const majorMatch = line.match(/专业[:：]\s*([^，,]+)/);
            if (majorMatch) {
              currentEdu.major = majorMatch[1].trim();
            }
          }

          // 提取时间范围
          const dateMatch = line.match(this.patterns.dateRange);
          if (dateMatch) {
            currentEdu.startDate = dateMatch[1].replace(/[年.]/g, '.');
            currentEdu.endDate = dateMatch[2] === '至今' ? '至今' : dateMatch[2].replace(/[年.]/g, '.');
          }

          // 提取荣誉
          if (/奖学金|获奖|荣誉/.test(line)) {
            currentEdu.honors = line;
          }
        }
      }
    }

    // 添加最后一个教育经历
    if (currentEdu && currentEdu.school) {
      education.push(currentEdu);
    }

    return education;
  },

  /**
   * 提取工作经历
   */
  extractWorkExperience(text) {
    const experiences = [];
    const lines = text.split('\n');

    let inWorkSection = false;
    let currentWork = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 检测工作经历开始
      if (/工作|实习|任职/.test(line) && !inWorkSection) {
        inWorkSection = true;
        continue;
      }

      // 检测其他经历开始
      if (inWorkSection && /项目经历|校园|学生会/.test(line) && currentWork) {
        if (currentWork.company) {
          experiences.push(currentWork);
        }
        currentWork = null;
        inWorkSection = false;
      }

      if (inWorkSection) {
        // 查找公司名称（常见公司后缀）
        const companyMatch = line.match(/(.+)(公司|集团|有限|责任)/);
        if (companyMatch && !currentWork) {
          currentWork = {
            company: line.substring(0, line.indexOf(companyMatch[1]) + companyMatch[1].length).trim(),
            department: '',
            position: '',
            startDate: '',
            endDate: '',
            highlights: []
          };
        }

        if (currentWork) {
          // 提取职位
          if (/产品经理|运营|开发|设计|测试|主管|经理|总监/.test(line) && !currentWork.position) {
            const posMatch = line.match(/(产品经理|运营|开发|设计|测试|主管|经理|总监|专员|助理)[^，,]*[，,]?/);
            if (posMatch) {
              currentWork.position = posMatch[0].replace(/[，,]$/, '');
            }
          }

          // 提取时间
          const dateMatch = line.match(this.patterns.dateRange);
          if (dateMatch) {
            currentWork.startDate = dateMatch[1].replace(/[年.]/g, '.');
            currentWork.endDate = dateMatch[2] === '至今' ? '至今' : dateMatch[2].replace(/[年.]/g, '.');
          }

          // 提取工作描述
          if (/负责|推动|完成|提升|优化|搭建|开展/.test(line) && line.length > 10) {
            currentWork.highlights.push(line);
          }
        }
      }
    }

    if (currentWork && currentWork.company) {
      experiences.push(currentWork);
    }

    return experiences;
  },

  /**
   * 提取项目经历
   */
  extractProjects(text) {
    const projects = [];
    const lines = text.split('\n');

    let inProjectSection = false;
    let currentProject = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 检测项目经历开始
      if (/项目经历|项目/.test(line) && !inProjectSection) {
        inProjectSection = true;
        continue;
      }

      // 检测其他经历
      if (inProjectSection && /工作|实习|校园|学生会/.test(line) && currentProject) {
        if (currentProject.name) {
          projects.push(currentProject);
        }
        currentProject = null;
        inProjectSection = false;
      }

      if (inProjectSection) {
        // 项目名称通常用书名号或引号
        const projectMatch = line.match(/[《"](.+?)[》"]/);
        if (projectMatch && !currentProject) {
          currentProject = {
            name: projectMatch[1],
            role: '',
            startDate: '',
            endDate: '',
            highlights: []
          };
        } else if (line.length > 5 && !currentProject) {
          // 没有书名号，尝试用第一行作为项目名
          currentProject = {
            name: line,
            role: '',
            startDate: '',
            endDate: '',
            highlights: []
          };
        }

        if (currentProject) {
          // 提取角色
          if (/创始人|负责人|成员|参与者/.test(line) && !currentProject.role) {
            currentProject.role = line;
          }

          // 提取时间
          const dateMatch = line.match(this.patterns.dateRange);
          if (dateMatch) {
            currentProject.startDate = dateMatch[1].replace(/[年.]/g, '.');
            currentProject.endDate = dateMatch[2] === '至今' ? '至今' : dateMatch[2].replace(/[年.]/g, '.');
          }

          // 提取项目描述
          if (/完成|开发|搭建|推动|实现|优化/.test(line) && line.length > 10) {
            currentProject.highlights.push(line);
          }
        }
      }
    }

    if (currentProject && currentProject.name) {
      projects.push(currentProject);
    }

    return projects;
  },

  /**
   * 提取技能
   */
  extractSkills(text) {
    const skills = {
      office: [],
      design: [],
      languages: [],
      tools: []
    };

    // 提取办公软件
    const officeSkills = ['Office', 'Excel', 'PowerPoint', 'Word', 'WPS'];
    for (const skill of officeSkills) {
      if (text.includes(skill)) {
        skills.office.push(skill);
      }
    }

    // 提取设计工具
    const designSkills = ['Axure', 'ProcessOn', 'Xmind', 'Figma', 'Sketch', 'Photoshop', 'Illustrator'];
    for (const skill of designSkills) {
      if (text.includes(skill)) {
        skills.design.push(skill);
      }
    }

    // 提取语言能力（CET）
    const cetMatch = text.match(/CET[-]?(\d)[^0-9]*(\d{2,3})/i);
    if (cetMatch) {
      skills.languages.push({
        name: `CET-${cetMatch[1]}`,
        score: cetMatch[2]
      });
    }

    // 提取编程语言/工具
    const tools = ['Python', 'Java', 'JavaScript', 'SQL', 'R', 'MATLAB', 'AIGC', '飞书', '钉钉'];
    for (const tool of tools) {
      if (text.includes(tool)) {
        skills.tools.push(tool);
      }
    }

    return skills;
  },

  /**
   * 验证提取结果
   */
  validateExtractedData(data) {
    const issues = [];

    if (!data.basic.name) {
      issues.push('未识别到姓名');
    }
    if (!data.basic.email) {
      issues.push('未识别到邮箱');
    }
    if (!data.basic.phone) {
      issues.push('未识别到电话');
    }

    return {
      isValid: issues.length === 0,
      issues: issues
    };
  }
};

// 导出到全局
window.ResumeParser = ResumeParser;