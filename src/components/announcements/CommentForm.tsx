
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
}

export function CommentForm({ onSubmit }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setIsSubmitting(true);
      await onSubmit(content);
      setContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Écrire un commentaire..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[80px]"
      />
      <Button 
        type="submit" 
        disabled={isSubmitting || !content.trim()} 
        className="bg-[#ce0067] hover:bg-[#ce0067]/90 text-white"
      >
        {isSubmitting && <Loader className="w-4 h-4 animate-spin mr-2" />}
        Commenter
      </Button>
    </form>
  );
}
