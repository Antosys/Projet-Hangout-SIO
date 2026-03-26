export const normalizeUploadFilename = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const filename = String(value)
    .trim()
    .replace(/^https?:\/\/[^/]+\/uploads\//i, '')
    .replace(/^\/?uploads\//i, '')
    .split('?')[0]
    .split('#')[0]
    .replace(/\\/g, '/');

  return filename || null;
};

export const buildUploadUrl = (value?: string | null) => {
  const filename = normalizeUploadFilename(value);
  return filename ? `https://projet-hangout-sio.onrender.com/uploads/${filename}` : null;
};
