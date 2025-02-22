
interface AnnouncementContentProps {
  content: string;
  imageUrl: string | null;
}

export function AnnouncementContent({ content, imageUrl }: AnnouncementContentProps) {
  return (
    <div className="mt-2">
      <p className="text-gray-700">{content}</p>
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Image de l'annonce"
          className="mt-4 rounded-lg max-h-96 object-cover w-full"
        />
      )}
    </div>
  );
}
