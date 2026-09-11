const path = require('node:path');
const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');
const XLSX = require('xlsx');

const MAX_CONTEXT_CHARS = 120000;

const isTextLike = (file) => {
  const extension = path.extname(file.originalname || '').toLowerCase();
  return file.mimetype?.startsWith('text/') || [
    '.txt', '.md', '.csv', '.json', '.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.xml', '.yaml', '.yml', '.py', '.java', '.c', '.cpp', '.sql', '.log',
  ].includes(extension);
};

const truncate = (value) => value.length > MAX_CONTEXT_CHARS
  ? `${value.slice(0, MAX_CONTEXT_CHARS)}\n\n[Document truncated for model context.]`
  : value;

const extractDocumentText = async (file) => {
  if (!file?.buffer) return null;
  const extension = path.extname(file.originalname || '').toLowerCase();
  const mimeType = file.mimetype || '';

  if (isTextLike(file)) {
    return truncate(file.buffer.toString('utf8'));
  }

  if (extension === '.pdf' || mimeType === 'application/pdf') {
    const parser = new PDFParse({ data: file.buffer });
    try {
      const result = await parser.getText();
      return truncate(result.text || '');
    } finally {
      await parser.destroy();
    }
  }

  if (extension === '.docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return truncate(result.value || '');
  }

  if (['.xlsx', '.xls', '.ods'].includes(extension) || mimeType.includes('spreadsheet')) {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheets = workbook.SheetNames.map((name) => {
      const sheet = XLSX.utils.sheet_to_csv(workbook.Sheets[name]);
      return `## Sheet: ${name}\n${sheet}`;
    });
    return truncate(sheets.join('\n\n'));
  }

  return null;
};

const buildFileContext = async (file) => {
  if (!file) return null;
  const text = await extractDocumentText(file);
  if (!text) return null;
  return `The user attached a file named "${file.originalname || 'document'}". Read it as source material and answer the user's request using it.\n\n<file name="${file.originalname || 'document'}">\n${text}\n</file>`;
};

module.exports = { extractDocumentText, buildFileContext, isTextLike };
