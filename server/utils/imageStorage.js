const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

function sanitizeStoredFilename(value) {
  if (!value) {
    return null;
  }

  const cleanedValue = String(value)
    .trim()
    .replace(/^https?:\/\/[^/]+\/uploads\//i, '')
    .replace(/^\/?uploads\//i, '')
    .split('?')[0]
    .split('#')[0]
    .replace(/\\/g, '/');

  const filename = path.basename(cleanedValue);
  return filename || null;
}

function extractQuotedEntries(value) {
  const matches = value.match(/"([^"]+)"/g) || [];
  return matches
    .map((entry) => entry.replace(/^"|"$/g, ''))
    .filter(Boolean);
}

function normalizePhotoEntries(input) {
  if (!input) {
    return [];
  }

  if (Array.isArray(input)) {
    return [...new Set(input.flatMap((entry) => normalizePhotoEntries(entry)).filter(Boolean))];
  }

  if (typeof input !== 'string') {
    return [];
  }

  const trimmedValue = input.trim();
  if (!trimmedValue) {
    return [];
  }

  if (trimmedValue.startsWith('[') && trimmedValue.endsWith(']')) {
    try {
      return normalizePhotoEntries(JSON.parse(trimmedValue));
    } catch (error) {
      return [];
    }
  }

  if (trimmedValue.startsWith('{') && trimmedValue.endsWith('}')) {
    const quotedEntries = extractQuotedEntries(trimmedValue);
    if (quotedEntries.length > 0) {
      return [...new Set(quotedEntries.map((entry) => sanitizeStoredFilename(entry)).filter(Boolean))];
    }

    return [...new Set(
      trimmedValue
        .slice(1, -1)
        .split(',')
        .map((entry) => sanitizeStoredFilename(entry))
        .filter(Boolean)
    )];
  }

  const singleFilename = sanitizeStoredFilename(trimmedValue);
  return singleFilename ? [singleFilename] : [];
}

function buildStoredFilename(originalName = 'image.jpg') {
  const extension = path.extname(originalName).toLowerCase() || '.jpg';
  return `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`;
}

module.exports = {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  UPLOAD_DIR,
  buildStoredFilename,
  ensureUploadDir,
  normalizePhotoEntries,
  sanitizeStoredFilename,
};