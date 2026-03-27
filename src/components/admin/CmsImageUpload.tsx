import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CmsImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  previewWidth?: number;
  previewHeight?: number;
}

export default function CmsImageUpload({
  value,
  onChange,
  label = "IMAGE",
  previewWidth = 300,
  previewHeight,
}: CmsImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB", variant: "destructive" });
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast({ title: "Invalid format", description: "JPG, PNG, or WebP only", variant: "destructive" });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from("cms-images").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("cms-images").getPublicUrl(path);
    onChange(urlData.publicUrl);
    setUploading(false);
    toast({ title: "Image uploaded" });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div className="space-y-2">
      <Label className="font-display text-[10px] tracking-widest">{label}</Label>

      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt=""
            className="border border-border object-cover rounded"
            style={{ width: previewWidth, height: previewHeight || "auto", maxHeight: 200 }}
          />
          <button
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-border rounded p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/50 transition-colors bg-background"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          ) : (
            <>
              <Upload className="w-6 h-6 text-muted-foreground" />
              <p className="font-body text-xs text-muted-foreground">
                Click or drag image here (JPG, PNG, WebP — max 5MB)
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
          e.target.value = "";
        }}
      />

      {!value && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Or paste image URL
          </button>
        </div>
      )}

      {showUrlInput && !value && (
        <Input
          placeholder="https://..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onChange((e.target as HTMLInputElement).value);
              setShowUrlInput(false);
            }
          }}
          onBlur={(e) => {
            if (e.target.value) {
              onChange(e.target.value);
              setShowUrlInput(false);
            }
          }}
        />
      )}
    </div>
  );
}
