import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EditAnnouncementDialogProps } from "../types";
import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
export function EditAnnouncementDialog({
  announcement,
  isOpen,
  onOpenChange,
  onSubmit
}: EditAnnouncementDialogProps) {
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(announcement?.image_url || null);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      content: formData.get("content") as string,
      image: newImage
    });
  };
  const removeImage = () => {
    setNewImage(null);
    setPreviewUrl(null);
  };
  return <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifier la publication</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="content">Contenu</label>
            <textarea id="content" name="content" defaultValue={announcement?.content || ""} className="w-full min-h-[100px] p-2 border rounded bg-pink-800" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label>Image</label>
              {previewUrl && <Button type="button" variant="ghost" size="sm" onClick={removeImage}>
                  <X className="h-4 w-4 mr-2" />
                  Supprimer l'image
                </Button>}
            </div>
            
            {previewUrl ? <div className="relative">
                <img src={previewUrl} alt="Preview" className="max-h-48 rounded object-cover" />
              </div> : <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6">
                <label className="cursor-pointer flex items-center">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  <ImagePlus className="h-6 w-6 mr-2" />
                  <span>Ajouter une image</span>
                </label>
              </div>}
          </div>

          <DialogFooter>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>;
}