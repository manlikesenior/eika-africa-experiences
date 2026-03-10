import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2, Images } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface MultiImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  bucket?: string;
  folder?: string;
  maxFiles?: number;
}

const MultiImageUpload = ({ 
  values, 
  onChange, 
  label = "Images", 
  bucket = "uploads", 
  folder = "images",
  maxFiles = 20
}: MultiImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [manualUrl, setManualUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check max files limit
    if (values.length + files.length > maxFiles) {
      toast({ 
        title: `Maximum ${maxFiles} images allowed`, 
        description: `You can add ${maxFiles - values.length} more images.`,
        variant: "destructive" 
      });
      return;
    }

    // Validate all files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith("image/")) {
        toast({ title: `${file.name} is not an image`, variant: "destructive" });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: `${file.name} exceeds 5MB limit`, variant: "destructive" });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    setUploadingCount(validFiles.length);
    setUploadProgress(0);

    const uploadedUrls: string[] = [];
    let completed = 0;

    for (const file of validFiles) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) {
        toast({ title: `Failed to upload ${file.name}`, variant: "destructive" });
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);
        uploadedUrls.push(publicUrl);
      }

      completed++;
      setUploadProgress(Math.round((completed / validFiles.length) * 100));
    }

    if (uploadedUrls.length > 0) {
      onChange([...values, ...uploadedUrls]);
      toast({ 
        title: `${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''} uploaded successfully` 
      });
    }

    setUploading(false);
    setUploadProgress(0);
    setUploadingCount(0);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addManualUrl = () => {
    if (!manualUrl.trim()) return;
    if (values.includes(manualUrl)) {
      toast({ title: "Image already added", variant: "destructive" });
      return;
    }
    onChange([...values, manualUrl]);
    setManualUrl("");
  };

  const removeImage = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">{label}</Label>
      
      {/* Upload area */}
      <div 
        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Uploading {uploadingCount} image{uploadingCount > 1 ? 's' : ''}...
            </p>
            <Progress value={uploadProgress} className="max-w-xs mx-auto" />
          </div>
        ) : (
          <>
            <Images className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-1">
              Click to upload multiple images
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, GIF up to 5MB each (max {maxFiles} images)
            </p>
          </>
        )}
      </div>

      {/* Manual URL input */}
      <div className="flex gap-2">
        <Input
          value={manualUrl}
          onChange={(e) => setManualUrl(e.target.value)}
          placeholder="Or paste image URL"
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addManualUrl())}
        />
        <Button
          type="button"
          variant="outline"
          onClick={addManualUrl}
          disabled={!manualUrl.trim()}
        >
          <Upload className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>

      {/* Image preview grid */}
      {values.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {values.map((url, index) => (
            <div key={index} className="relative group aspect-square">
              <img 
                src={url} 
                alt={`Image ${index + 1}`} 
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              <span className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {values.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {values.length} of {maxFiles} images added
        </p>
      )}
    </div>
  );
};

export default MultiImageUpload;
