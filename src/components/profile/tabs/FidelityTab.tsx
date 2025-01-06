interface FidelityTabProps {
  profile: any;
}

export function FidelityTab({ profile }: FidelityTabProps) {
  return (
    <div className="p-6 text-center">
      <h3 className="text-2xl font-semibold text-burgundy mb-4">Programme de Fidélité</h3>
      <p className="text-gray-600">
        Votre solde de points : {profile?.loolyb_tokens || 0} LooLyyb Tokens
      </p>
    </div>
  );
}