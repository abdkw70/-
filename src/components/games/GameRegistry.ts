import React from 'react';
import { WheelGameModule } from './WheelGameModule';
import { QuizGameModule } from './QuizGameModule';
import { MemoryCardsGameModule } from './MemoryCardsGameModule';
import { StationeryCatcherGameModule } from './StationeryCatcherGameModule';

export interface GameModuleProps {
  game: any;
  onGameComplete: (score: number, metadata?: any) => Promise<any>;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export type GameModuleComponent = React.FC<GameModuleProps>;

const gameRegistry: Record<string, GameModuleComponent> = {
  wheel_spin: WheelGameModule,
  quiz_challenge: QuizGameModule,
  memory_cards: MemoryCardsGameModule,
  stationery_catcher: StationeryCatcherGameModule,
};

/**
 * Register a new game module dynamically
 */
export function registerGameModule(gameId: string, component: GameModuleComponent) {
  gameRegistry[gameId] = component;
}

/**
 * Retrieve a registered game component module by ID
 */
export function getGameModule(gameId: string): GameModuleComponent | null {
  return gameRegistry[gameId] || null;
}
