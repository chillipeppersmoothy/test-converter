function sanitizeFileName(name) {
  return name.replace(/[^a-z0-9]/g, "_");
}

export default { sanitizeFileName };
