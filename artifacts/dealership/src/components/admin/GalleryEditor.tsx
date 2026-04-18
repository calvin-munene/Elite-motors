import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Upload, Camera, Link2, Loader2 } from "lucide-react";
import { uploadFile } from "@/lib/uploadFile";
import { useToast } from "@/hooks/use-toast";

interface GalleryEditorProps {
  value: string[];
  onChange: (v: string[]) => void;
}

export function GalleryEditor({ value, onChange }: GalleryEditorProps) {
  const [newUrl, setNewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const images = value || [];

  const addImageUrl = () => {
    if (newUrl.trim()) {
      onChange([...images, newUrl.trim()]);
      setNewUrl("");
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (!f.type.startsWith("image/")) {
          toast({ title: `Skipped ${f.name}`, description: "Not an image file", variant: "destructive" });
          continue;
        }
        setProgress(0);
        const url = await uploadFile(f, setProgress);
        uploaded.push(url);
      }
      if (uploaded.length) {
        onChange([...images, ...uploaded]);
        toast({ title: `Uploaded ${uploaded.length} photo${uploaded.length === 1 ? "" : "s"}` });
      }
    } catch (e: any) {
      toast({ title: "Upload failed", description: e?.message, variant: "destructive" });
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((url, idx) => (
            <div key={idx}>
              <div className="h-24 rounded-lg overflow-hidden border border-white/10 bg-secondary">
                <img
                  src={url}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <div className="mt-1.5 flex gap-1">
                <Input
                  value={url}
                  onChange={(e) => {
                    const updated = [...images];
                    updated[idx] = e.target.value;
                    onChange(updated);
                  }}
                  className="bg-background border-white/10 text-white text-xs h-7 flex-1"
                  placeholder="Image URL"
                />
                <button
                  type="button"
                  onClick={() => onChange(images.filter((_, i) => i !== idx))}
                  className="w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload buttons */}
      <div className="flex flex-wrap gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="border-white/10"
        >
          {uploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
          {uploading ? `Uploading ${progress}%` : "Upload from device"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
          className="border-white/10"
        >
          <Camera className="w-4 h-4 mr-1" /> Take photo
        </Button>
      </div>

      {/* URL fallback */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageUrl(); } }}
            placeholder="...or paste an image URL"
            className="bg-background border-white/10 text-white pl-9"
          />
        </div>
        <Button type="button" variant="outline" onClick={addImageUrl} className="border-white/10">
          <Plus className="w-4 h-4 mr-1" /> Add URL
        </Button>
      </div>

      {images.length === 0 && (
        <p className="text-xs text-gray-500">No photos yet. Upload from your device, take one with the camera, or paste an image URL.</p>
      )}
    </div>
  );
}
