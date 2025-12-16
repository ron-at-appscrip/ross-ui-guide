import { supabase } from '@/integrations/supabase/client';

export interface UploadImageResult {
  url: string;
  path: string;
  publicUrl: string;
}

export interface UploadImageOptions {
  bucket?: string;
  folder?: string;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

class ImageUploadService {
  private readonly DEFAULT_BUCKET = 'client-photos';
  private readonly DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly DEFAULT_ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ];

  /**
   * Check if bucket exists (bucket should be created via migration)
   */
  async checkBucket(bucketName: string = this.DEFAULT_BUCKET): Promise<boolean> {
    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('Error listing buckets:', listError);
        return false;
      }

      return buckets?.some(bucket => bucket.name === bucketName) || false;
    } catch (error) {
      console.error('Error checking bucket:', error);
      return false;
    }
  }

  /**
   * Validate image file before upload
   */
  private validateFile(file: File, options: UploadImageOptions): void {
    const maxSize = options.maxSize || this.DEFAULT_MAX_SIZE;
    const allowedTypes = options.allowedTypes || this.DEFAULT_ALLOWED_TYPES;

    // Check file size
    if (file.size > maxSize) {
      throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${(maxSize / 1024 / 1024).toFixed(2)}MB)`);
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type '${file.type}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
  }

  /**
   * Generate a unique file path for the image
   */
  private generateFilePath(file: File, folder?: string, prefix?: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    
    const fileName = `${prefix || 'image'}_${timestamp}_${randomString}.${fileExtension}`;
    
    return folder ? `${folder}/${fileName}` : fileName;
  }

  /**
   * Upload an image file to Supabase Storage
   */
  async uploadImage(
    file: File, 
    options: UploadImageOptions & { prefix?: string } = {}
  ): Promise<UploadImageResult> {
    try {
      // Validate the file
      this.validateFile(file, options);

      const bucket = options.bucket || this.DEFAULT_BUCKET;
      
      // Verify bucket exists (should work now with proper RLS policies)
      const bucketExists = await this.checkBucket(bucket);
      if (!bucketExists) {
        throw new Error(`Storage bucket '${bucket}' is not accessible. Please ensure you're logged in.`);
      }
      
      // Generate unique file path
      const filePath = this.generateFilePath(file, options.folder, options.prefix);

      // Upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        
        // Provide more specific error messages
        if (uploadError.message.includes('new row violates row-level security policy')) {
          throw new Error('Authentication required. Please log in and try again.');
        } else if (uploadError.message.includes('bucket_id')) {
          throw new Error('Storage bucket not accessible. Please contact support.');
        } else {
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }
      }

      if (!uploadData?.path) {
        throw new Error('Upload succeeded but no path returned');
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(uploadData.path);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL for uploaded image');
      }

      return {
        url: urlData.publicUrl,
        path: uploadData.path,
        publicUrl: urlData.publicUrl
      };

    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }

  /**
   * Upload a client profile photo
   */
  async uploadClientPhoto(file: File, clientId?: string): Promise<UploadImageResult> {
    const prefix = clientId ? `client_${clientId}` : 'client';
    
    return this.uploadImage(file, {
      bucket: this.DEFAULT_BUCKET,
      folder: 'profiles',
      prefix,
      maxSize: 2 * 1024 * 1024, // 2MB for profile photos
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    });
  }

  /**
   * Delete an image from Supabase Storage
   */
  async deleteImage(path: string, bucket: string = this.DEFAULT_BUCKET): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('Delete error:', error);
        throw new Error(`Failed to delete image: ${error.message}`);
      }
    } catch (error) {
      console.error('Image deletion error:', error);
      throw error;
    }
  }

  /**
   * Replace an existing image with a new one
   */
  async replaceImage(
    file: File, 
    existingPath: string, 
    options: UploadImageOptions = {}
  ): Promise<UploadImageResult> {
    try {
      // Upload new image first
      const uploadResult = await this.uploadImage(file, options);

      // Delete old image after successful upload
      try {
        await this.deleteImage(existingPath, options.bucket);
      } catch (deleteError) {
        console.warn('Failed to delete old image:', deleteError);
        // Don't throw here, as the new image was uploaded successfully
      }

      return uploadResult;
    } catch (error) {
      console.error('Image replacement error:', error);
      throw error;
    }
  }

  /**
   * Get the file path from a Supabase Storage URL
   */
  getPathFromUrl(url: string, bucket: string = this.DEFAULT_BUCKET): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const bucketIndex = pathParts.findIndex(part => part === bucket);
      
      if (bucketIndex === -1 || bucketIndex === pathParts.length - 1) {
        return null;
      }

      return pathParts.slice(bucketIndex + 1).join('/');
    } catch (error) {
      console.error('Error extracting path from URL:', error);
      return null;
    }
  }

  /**
   * Convert base64 data URL to File object
   */
  dataUrlToFile(dataUrl: string, filename: string = 'image.jpg'): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  }

  /**
   * Upload image from base64 data URL
   */
  async uploadImageFromDataUrl(
    dataUrl: string, 
    filename: string = 'image.jpg',
    options: UploadImageOptions & { prefix?: string } = {}
  ): Promise<UploadImageResult> {
    const file = this.dataUrlToFile(dataUrl, filename);
    return this.uploadImage(file, options);
  }
}

// Export a singleton instance
export const imageUploadService = new ImageUploadService();
export default imageUploadService;