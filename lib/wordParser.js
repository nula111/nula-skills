/**
 * Word 解析模块 - wordParser.js
 * 使用 mammoth.js 提取 Word 文档文本内容
 */

/**
 * 从 Word 文件 (.docx) 提取文本
 * @param {File} file - Word 文件
 * @returns {Promise<string>} 提取的文本内容
 */
async function extractTextFromDocx(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        // 动态加载 mammoth.js
        if (!window.mammoth) {
          await loadMammothJs();
        }

        const result = await window.mammoth.extractRawText({
          arrayBuffer: e.target.result
        });

        resolve(result.value);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * 从老版本 Word 文件 (.doc) 提取文本
 * @param {File} file - Word 文件
 * @returns {Promise<string>} 提取的文本内容
 * 注意: .doc 格式支持有限，可能无法完美解析
 */
async function extractTextFromDoc(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        if (!window.mammoth) {
          await loadMammothJs();
        }

        // mammoth 对 .doc 支持较差，尝试解析
        const result = await window.mammoth.extractRawText({
          arrayBuffer: e.target.result
        });

        if (!result.value || result.value.trim().length < 50) {
          console.warn('[Word解析] .doc 格式解析可能不完整，建议使用 .docx 格式');
        }

        resolve(result.value || '');
      } catch (error) {
        // .doc 解析失败，返回提示信息
        console.error('[Word解析] .doc 解析失败:', error);
        resolve('【提示: .doc 格式解析受限，请将文档另存为 .docx 格式后重试】');
      }
    };

    reader.onerror = () => {
      resolve('【提示: 文件读取失败】');
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * 加载 mammoth.js 库
 */
function loadMammothJs() {
  return new Promise((resolve, reject) => {
    if (window.mammoth) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * 根据文件类型选择解析方法
 * @param {File} file - 文件
 * @returns {Promise<string>} 提取的文本内容
 */
async function extractTextFromWord(file) {
  const extension = file.name.split('.').pop().toLowerCase();

  if (extension === 'docx') {
    return extractTextFromDocx(file);
  } else if (extension === 'doc') {
    return extractTextFromDoc(file);
  } else {
    throw new Error('不支持的文件格式，请上传 .doc 或 .docx 文件');
  }
}

// 导出到全局
window.WordParser = {
  extractTextFromDocx,
  extractTextFromDoc,
  extractTextFromWord,
  loadMammothJs
};