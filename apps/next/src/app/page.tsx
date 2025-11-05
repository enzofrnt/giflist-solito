'use client';

import { HomeScreen } from 'app/features/home/screen';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Contenu principal - utilise la version partagée qui inclut le FlickeringGrid */}
      <HomeScreen />
    </div>
  );
}