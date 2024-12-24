export function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

export function replaceVariables(text) {
  return text.replace(/{{(.+?)}}/g, (_, key) => variables[key] || _);
}
