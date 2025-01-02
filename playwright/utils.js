export function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-z0-9]+/gi, "_").toLowerCase();
}

export function replaceVariables(text, variables) {
  return text.replace(/{{(.+?)}}/g, (_, key) => variables[key.trim()] ?? _);
}

export function cleanCarriageReturns(obj) {
  if (typeof obj === "string") {
    return obj.replace(/\r/g, "");
  } else if (Array.isArray(obj)) {
    return obj.map(cleanCarriageReturns);
  } else if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, cleanCarriageReturns(value)])
    );
  }
  return obj;
}
