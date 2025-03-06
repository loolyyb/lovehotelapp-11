
export function EmptyConversation() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <p className="text-[#f3ebad]/70">Aucun message dans cette conversation</p>
      <p className="text-[#f3ebad]/50 text-sm mt-2">Commencez à écrire pour envoyer un message</p>
    </div>
  );
}
