import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ResponsiveModal from '@/components/ui/responsive-modal';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  FileText, 
  Image, 
  X, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Cloud,
  FolderOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const documentSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  type: z.string().min(1, 'Document type is required'),
  matter: z.string().optional(),
  description: z.string().optional(),
  tags: z.string().optional(),
  confidential: z.boolean().default(false),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
}

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
}

const DocumentUploadModal = ({ isOpen, onClose, clientId, clientName }: DocumentUploadModalProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      name: '',
      type: '',
      matter: '',
      description: '',
      tags: '',
      confidential: false,
    },
  });

  const documentTypes = [
    'Contract',
    'Legal Brief',
    'Correspondence',
    'Court Document',
    'Financial Document',
    'Policy Document',
    'Analysis',
    'Research',
    'Other'
  ];

  const mockMatters = [
    'Contract Review - Software License',
    'Employment Dispute Resolution', 
    'IP Portfolio Review',
    'General'
  ];

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension || '')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    if (['pdf'].includes(extension || '')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      file,
      id: `${Date.now()}-${Math.random()}`,
      progress: 0,
      status: 'pending' as const,
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Auto-populate name if it's the first file
    if (uploadedFiles.length === 0 && newFiles.length > 0) {
      form.setValue('name', newFiles[0].file.name.split('.')[0]);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const simulateUpload = async (fileId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        
        setUploadedFiles(prev => prev.map(file => 
          file.id === fileId 
            ? { ...file, progress: Math.min(progress, 100), status: 'uploading' }
            : file
        ));

        if (progress >= 100) {
          clearInterval(interval);
          
          // Simulate success/failure (90% success rate)
          if (Math.random() > 0.1) {
            setUploadedFiles(prev => prev.map(file => 
              file.id === fileId 
                ? { ...file, progress: 100, status: 'success', url: `https://example.com/docs/${fileId}` }
                : file
            ));
            resolve();
          } else {
            setUploadedFiles(prev => prev.map(file => 
              file.id === fileId 
                ? { ...file, status: 'error' }
                : file
            ));
            reject(new Error('Upload failed'));
          }
        }
      }, 200);
    });
  };

  const handleSubmit = async (data: DocumentFormData) => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Upload all files
      const uploadPromises = uploadedFiles
        .filter(file => file.status === 'pending')
        .map(file => simulateUpload(file.id));
      
      await Promise.all(uploadPromises);
      
      // Simulate document metadata save
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Documents Uploaded",
        description: `${uploadedFiles.length} document(s) uploaded successfully for ${clientName}.`,
      });
      
      onClose();
      form.reset();
      setUploadedFiles([]);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Some documents failed to upload. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
    setUploadedFiles([]);
  };

  return (
    <ResponsiveModal 
      isOpen={isOpen} 
      onClose={handleClose}
      title="Upload Documents"
      description={`Upload documents for ${clientName}`}
      size="lg"
      showCloseButton={!isUploading}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-6">
            {/* File Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted-foreground/25 hover:border-primary/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Drop files here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, and image files
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                  />
                  <label htmlFor="file-upload">
                    <Button type="button" variant="outline" className="cursor-pointer">
                      Choose Files
                    </Button>
                  </label>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="font-medium">Selected Files</h4>
                    {uploadedFiles.map((uploadedFile) => (
                      <div key={uploadedFile.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        {getFileIcon(uploadedFile.file.name)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {uploadedFile.file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(uploadedFile.file.size)}
                          </p>
                          {uploadedFile.status === 'uploading' && (
                            <Progress value={uploadedFile.progress} className="h-1 mt-1" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {uploadedFile.status === 'pending' && (
                            <Badge variant="outline">Pending</Badge>
                          )}
                          {uploadedFile.status === 'uploading' && (
                            <Badge variant="outline" className="gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Uploading
                            </Badge>
                          )}
                          {uploadedFile.status === 'success' && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Complete
                            </Badge>
                          )}
                          {uploadedFile.status === 'error' && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Failed
                            </Badge>
                          )}
                          {uploadedFile.status !== 'uploading' && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(uploadedFile.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Document Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Document Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter document name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {documentTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="matter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Matter (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select matter" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockMatters.map((matter) => (
                            <SelectItem key={matter} value={matter}>
                              {matter}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. contract, confidential, draft" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Brief description of the document..."
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isUploading || uploadedFiles.length === 0}
                className="bg-primary hover:bg-primary/90"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Cloud className="mr-2 h-4 w-4" />
                    Upload Documents
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  );
};

export default DocumentUploadModal;