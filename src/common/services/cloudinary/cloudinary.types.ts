export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  transformation?: any;
  public_id?: string;
  overwrite?: boolean;
}

export interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
}
