import { MessageSquare } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
      <MessageSquare className="w-12 h-12 text-rose/50" />
      <h3 className="text-lg font-medium text-burgundy">Pas encore de messages</h3>
      <p className="text-sm text-gray-500">
        Commencez à discuter avec d'autres membres pour voir vos conversations ici
      </p>
    </div>
  );
}