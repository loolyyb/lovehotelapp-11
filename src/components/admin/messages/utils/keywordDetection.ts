
// Liste des mots-clés sensibles à surveiller
export const SUSPICIOUS_KEYWORDS = [
  "prix",
  "tarif",
  "rose",
  "c'est combien",
  "cadeau"
];

/**
 * Vérifie si un message contient des mots-clés suspects
 * @param content Le contenu du message à analyser
 * @returns Un objet contenant le résultat de l'analyse
 */
export const detectSuspiciousKeywords = (content: string | null): {
  hasSuspiciousKeywords: boolean;
  detectedKeywords: string[];
} => {
  if (!content) {
    return { hasSuspiciousKeywords: false, detectedKeywords: [] };
  }

  const lowercaseContent = content.toLowerCase();
  const detectedKeywords = SUSPICIOUS_KEYWORDS.filter(keyword => 
    lowercaseContent.includes(keyword.toLowerCase())
  );

  return {
    hasSuspiciousKeywords: detectedKeywords.length > 0,
    detectedKeywords
  };
};
