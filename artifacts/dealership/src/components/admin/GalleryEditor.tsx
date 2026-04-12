import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface GalleryEditorProps {
  value: string[];
  onChange: (v: string[]) => void;
}

export function GalleryEditor({ value, onChange }: GalleryEditorProps) {
  const [newUrl, setNewUrl] = useState("");
  const images = value || [];

  const addImage = () => {
    if (newUrl.trim()) {
      onChange([...images, newUrl.trim()]);
      setNewUrl("");
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
      <div className="flex gap-2">
        <Input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(); } }}
          placeholder="Paste image URL and press Add..."
          className="bg-background border-white/10 text-white flex-1"
        />
        <Button type="button" variant="outline" onClick={addImage} className="border-white/10">
          <Plus className="w-4 h-4 mr-1" /> Add Photo
        </Button>
      </div>
      {images.length === 0 && (
        <p className="text-xs text-gray-500">No photos added yet. Add image URLs above to populate the gallery.</p>
      )}
    </div>
  );
}
