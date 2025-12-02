import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, File, X } from 'lucide-react';
import { toast } from 'sonner';

export default function FileUploadModal({ open, onOpenChange, onUpload }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['vcf', 'xlsx', 'xls', 'csv', 'txt'].includes(ext);
    });

    if (validFiles.length !== files.length) {
      toast.error('Some files were rejected. Only VCF, Excel, CSV, and TXT files are allowed.');
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    onUpload(selectedFiles);
    toast.success(`${selectedFiles.length} file(s) uploaded successfully!`);
    setSelectedFiles([]);
    onOpenChange(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="file-upload-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" style={{ fontFamily: 'Bricolage Grotesque' }}>
            Upload Genetic Data
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {/* Drag and Drop Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-cyan-300 rounded-2xl p-12 text-center cursor-pointer transition-all hover:border-cyan-500 hover:bg-cyan-50/50 bg-gradient-to-br from-cyan-50/30 to-violet-50/30"
            data-testid="file-drop-zone"
          >
            <Upload className="h-16 w-16 text-cyan-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-700 mb-2">
              Click to browse or drag files here
            </p>
            <p className="text-sm text-slate-500">
              Supported formats: VCF, Excel (.xlsx, .xls), CSV, TXT
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".vcf,.xlsx,.xls,.csv,.txt"
            onChange={handleFileSelect}
            className="hidden"
            data-testid="file-input"
          />

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-700">Selected Files ({selectedFiles.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white border-2 border-cyan-100 rounded-xl hover:border-cyan-300 transition-colors"
                    data-testid={`selected-file-${index}`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-lg flex items-center justify-center">
                        <File className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      className="flex-shrink-0 h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50"
                      data-testid={`remove-file-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedFiles([]);
                onOpenChange(false);
              }}
              data-testid="cancel-upload-button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0}
              className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white font-bold px-8"
              data-testid="upload-files-button"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
