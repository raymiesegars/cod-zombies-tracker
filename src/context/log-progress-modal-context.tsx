'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, Button, Select } from '@/components/ui';
import type { Game, MapWithGame } from '@/types';

type LogProgressModalContextValue = {
  openLogProgressModal: () => void;
};

const LogProgressModalContext = createContext<LogProgressModalContextValue | null>(null);

export function useLogProgressModal() {
  const ctx = useContext(LogProgressModalContext);
  return ctx;
}

export function LogProgressModalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [maps, setMaps] = useState<MapWithGame[]>([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedMap, setSelectedMap] = useState('');
  const [loading, setLoading] = useState(false);

  const openLogProgressModal = useCallback(() => setIsOpen(true), []);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    Promise.all([fetch('/api/games'), fetch('/api/maps')])
      .then(async ([gamesRes, mapsRes]) => {
        const [gamesData, mapsData] = await Promise.all([
          gamesRes.ok ? gamesRes.json() : [],
          mapsRes.ok ? mapsRes.json() : [],
        ]);
        return { games: gamesData, maps: mapsData };
      })
      .then(({ games: g, maps: m }) => {
        setGames(Array.isArray(g) ? g : []);
        setMaps(Array.isArray(m) ? m : []);
      })
      .catch(() => {
        setGames([]);
        setMaps([]);
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  // Reset selections when opening
  useEffect(() => {
    if (isOpen) {
      setSelectedGame('');
      setSelectedMap('');
    }
  }, [isOpen]);

  const filteredMaps = selectedGame ? maps.filter((m) => m.gameId === selectedGame) : [];

  const gameOptions = [
    { value: '', label: 'Select a game' },
    ...games.map((g) => ({ value: g.id, label: g.name })),
  ];

  const mapOptions = [
    { value: '', label: 'Select a map' },
    ...filteredMaps.map((m) => ({ value: m.slug, label: `${m.name} (${m.game?.shortName ?? ''})` })),
  ];

  const handleContinue = () => {
    if (!selectedMap) return;
    closeModal();
    router.push(`/maps/${selectedMap}/edit`);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <LogProgressModalContext.Provider value={{ openLogProgressModal }}>
      {children}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title="Log Progress"
        description="Choose a game and map to log your run. You’ll be taken to the log form for that map."
        size="md"
      >
        <div className="space-y-4">
          {loading ? (
            <p className="text-bunker-400 text-sm">Loading games and maps…</p>
          ) : (
            <>
              <Select
                label="Game"
                options={gameOptions}
                value={selectedGame}
                onChange={(e) => {
                  setSelectedGame(e.target.value);
                  setSelectedMap('');
                }}
                className="w-full"
              />
              <Select
                label="Map"
                options={mapOptions}
                value={selectedMap}
                onChange={(e) => setSelectedMap(e.target.value)}
                disabled={!selectedGame}
                placeholder={!selectedGame ? 'Select a game first' : 'Select a map'}
                className="w-full"
              />
              <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                <Button
                  variant="primary"
                  className="flex-1 bg-blood-600 hover:bg-blood-500 text-white"
                  onClick={handleContinue}
                  disabled={!selectedMap}
                >
                  {selectedMap ? `Log Progress → ${filteredMaps.find((m) => m.slug === selectedMap)?.name ?? selectedMap}` : 'Select a map to continue'}
                </Button>
                <Button variant="secondary" onClick={closeModal}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </LogProgressModalContext.Provider>
  );
}
