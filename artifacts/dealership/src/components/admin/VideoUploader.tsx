import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Video as VideoIcon, Link2, Loader2, Trash2 } from "lucide-react";
import { uploadFile } from "@/lib/uploadFile";
import { useToast } from "@/hooks/use-toast";

interface VideoUploaderProps {
  value: string;
  onChange: (v: string) => void;
}

export function VideoUploader({ value, onChange }: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!f.type.startsWith("video/")) {
      toast({ title: "Not a video file", variant: "destructive" });
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const url = await uploadFile(f, setProgress);
      onChange(url);
      toast({ title: "Video uploaded" });
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
      {value && (
        <div className="rounded-lg overflow-hidden border border-white/10 bg-black">
          <video src={value} controls className="w-full max-h-64" preload="metadata" />
          <div className="p-2 flex gap-2 items-center bg-secondary">
            <span className="text-xs text-gray-400 truncate flex-1">{value}</span>
            <button
              type="button"
              onClick={() => onChange("")}
              className="w-7 h-7 flex items-center justify-center text-red-400 hover:bg-red-400/10 rounded"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="border-white/10"
        >
          {uploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
          {uploading ? `Uploading ${progress}%` : "Upload video file"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
          className="border-white/10"
        >
          <VideoIcon className="w-4 h-4 mr-1" /> Record with camera
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="...or paste a video URL (MP4, YouTube embed, etc.)"
            className="bg-background border-white/10 text-white pl-9"
          />
        </div>
      </div>

      {!value && (
        <p className="text-xs text-gray-500">Add a walk-around or 360° video. Customers will see a play button on the car detail page.</p>
      )}
    </div>
  );
}
