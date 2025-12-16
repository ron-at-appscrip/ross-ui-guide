import React, { useCallback, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive,
  AlertCircle,
  CheckCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  onClose: () => void;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  className?: string;
}

interface FileWithStatus extends File {
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

const getFileIcon = (file: File) => {
  const type = file.type;
  if (type.startsWith('image/')) return <Image className="h-6 w-6" />;
  if (type.startsWith('video/')) return <Video className="h-6 w-6" />;
  if (type.startsWith('audio/')) return <Music className="h-6 w-6" />;
  if (type.includes('zip') || type.includes('rar')) return <Archive className="h-6 w-6" />;
  return <FileText className="h-6 w-6" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getLegalDocumentType = (filename: string): string | null => {
  const name = filename.toLowerCase();
  if (name.includes('contract') || name.includes('agreement')) return 'Contract';
  if (name.includes('motion') || name.includes('brief')) return 'Legal Brief';
  if (name.includes('deposition') || name.includes('transcript')) return 'Deposition';
  if (name.includes('discovery') || name.includes('interrogator')) return 'Discovery';
  if (name.includes('complaint') || name.includes('petition')) return 'Pleading';
  if (name.includes('evidence') || name.includes('exhibit')) return 'Evidence';
  return null;
};

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesSelected,
  onClose,
  accept = '.pdf,.doc,.docx,.txt,.jpg,.png,.gif,.mp3,.mp4,.zip',
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  className,
}) => {
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isDragReject, setIsDragReject] = useState(false);

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);
    const validFiles = fileArray.filter(file => {
      const isValidSize = file.size <= maxSize;
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidType = accept.split(',').some(a => a.trim() === extension);
      return isValidSize && isValidType;
    });

    const newFiles: FileWithStatus[] = validFiles.map(file => ({
      ...file,
      id: Date.now().toString() + Math.random().toString(36),
      status: 'pending' as const,
    }));

    setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
  }, [maxFiles, maxSize, accept]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    
    // Simulate upload process
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'uploading', progress: 0 } : f
      ));

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, progress } : f
        ));
      }

      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'success', progress: 100 } : f
      ));
    }

    setUploading(false);
    
    // Convert back to File objects and call callback
    const successfulFiles = files.filter(f => f.status === 'success' || f.status === 'pending');
    onFilesSelected(successfulFiles);
  };

  const canUpload = files.length > 0 && !uploading;
  const allUploaded = files.length > 0 && files.every(f => f.status === 'success');

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Upload Documents</h3>
        <Button size="sm" variant="ghost" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive && !isDragReject ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
          isDragReject ? 'border-red-500 bg-red-50' : '',
          uploading || files.length >= maxFiles ? 'cursor-not-allowed opacity-50' : 'hover:border-blue-400 hover:bg-gray-50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={uploading || files.length >= maxFiles}
        />
        
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        
        {isDragActive ? (
          <p className="text-blue-600 font-medium">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Drag & drop legal documents here, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              PDF, DOC, DOCX, images up to {formatFileSize(maxSize)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Maximum {maxFiles} files
            </p>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
          {files.map((file) => {
            const docType = getLegalDocumentType(file.name);
            
            return (
              <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                <div className="flex-shrink-0 text-gray-500">
                  {getFileIcon(file)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    {docType && (
                      <Badge variant="secondary" className="text-xs">
                        {docType}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatFileSize(file.size)}</span>
                    
                    {file.status === 'uploading' && file.progress !== undefined && (
                      <>
                        <span>•</span>
                        <span>{file.progress}%</span>
                      </>
                    )}
                  </div>
                  
                  {file.status === 'uploading' && file.progress !== undefined && (
                    <Progress value={file.progress} className="h-1 mt-1" />
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  {file.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  {(file.status === 'pending' || file.status === 'uploading') && !uploading && (
                    <Button size="sm" variant="ghost" onClick={() => removeFile(file.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-gray-500">
          {files.length} of {maxFiles} files selected
        </p>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          
          {allUploaded ? (
            <Button onClick={onClose}>
              Done
            </Button>
          ) : (
            <Button onClick={handleUpload} disabled={!canUpload}>
              {uploading ? 'Uploading...' : 'Upload & Analyze'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};