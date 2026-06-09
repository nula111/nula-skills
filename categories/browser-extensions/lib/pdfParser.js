/**
 * PDF 解析模块 - pdfParser.js
 * 使用 pdf.js 提取 PDF 文本内容
 */

// PDF.js 配置
const PDF_CONFIG = {
  workerSrc: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
};

let pdfjsLib = null;

/**
 * 加载 PDF.js 库
 */
async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib;

  return new Promise((resolve, reject) => {
    // 加载 pdf.js
    const script1 = document.createElement('script');
    script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script1.onload = () => {
      pdfjsLib = window.pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_CONFIG.workerSrc;
      resolve(pdfjsLib);
    };
    script1.onerror = reject;
    document.head.appendChild(script1);
  });
}

/**
 * 从 PDF 文件提取文本
 * @param {File} file - PDF 文件
 * @returns {Promise<string>} 提取的文本内容
 */
async function extractTextFromPdf(file) {
  await loadPdfJs();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n\n';
  }

  return fullText.trim();
}

/**
 * 从 PDF URL 提取文本
 * @param {string} url - PDF 文件 URL
 * @returns {Promise<string>} 提取的文本内容
 */
async function extractTextFromPdfUrl(url) {
  await loadPdfJs();

  const loadingTask = pdfjsLib.getDocument(url);
  const pdf = await loadingTask.promise;

  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n\n';
  }

  return fullText.trim();
}

// 导出到全局
window.PdfParser = {
  extractTextFromPdf,
  extractTextFromPdfUrl,
  loadPdfJs
};