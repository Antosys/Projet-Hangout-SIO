export interface UploadResponse {
  filename: string;
  filePath?: string;
}

export interface UploadPhotosResponse {
  filePaths: string[];
}

export interface PhotoItem {
  id: string;
  filename: string;
  previewUrl?: string;
  isUploading?: boolean;
  file?: File;
}
