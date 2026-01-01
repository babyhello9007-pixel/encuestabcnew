import { useState, useEffect } from 'react';

export interface SavedCoalition {
  id: string;
  name: string;
  parties: string[];
  totalSeats: number;
  createdAt: string;
}

const STORAGE_KEY = 'saved_coalitions';

export function useSavedCoalitions() {
  const [coalitions, setCoalitions] = useState<SavedCoalition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar coaliciones guardadas del localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCoalitions(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading saved coalitions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Guardar una nueva coalición
  const saveCoalition = (name: string, parties: string[], totalSeats: number) => {
    const newCoalition: SavedCoalition = {
      id: Date.now().toString(),
      name,
      parties,
      totalSeats,
      createdAt: new Date().toISOString(),
    };

    const updated = [...coalitions, newCoalition];
    setCoalitions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newCoalition;
  };

  // Eliminar una coalición guardada
  const deleteCoalition = (id: string) => {
    const updated = coalitions.filter(c => c.id !== id);
    setCoalitions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // Actualizar nombre de una coalición
  const updateCoalitionName = (id: string, newName: string) => {
    const updated = coalitions.map(c =>
      c.id === id ? { ...c, name: newName } : c
    );
    setCoalitions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // Limpiar todas las coaliciones
  const clearAllCoalitions = () => {
    setCoalitions([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    coalitions,
    isLoading,
    saveCoalition,
    deleteCoalition,
    updateCoalitionName,
    clearAllCoalitions,
  };
}
