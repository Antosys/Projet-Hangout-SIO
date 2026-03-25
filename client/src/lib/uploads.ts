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

const getUploadsBaseUrl = () => {
  const explicitUploadsUrl = import.meta.env.VITE_UPLOADS_URL;
  if (explicitUploadsUrl) {
    return explicitUploadsUrl.replace(/\/$/, '');
  }

  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  if (/^https?:\/\//i.test(apiUrl)) {
    return apiUrl.replace(/\/api\/?$/i, '').replace(/\/$/, '') + '/uploads';
  }

  return '/uploads';
};

export const buildUploadUrl = (value?: string | null) => {
  const filename = normalizeUploadFilename(value);
  return filename ? `${getUploadsBaseUrl()}/${filename}` : null;
};