import React from 'react';

export function ProfileLoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-50 to-rose-100 flex items-center justify-center">
      <div className="animate-pulse text-burgundy">Chargement...</div>
    </div>
  );
}