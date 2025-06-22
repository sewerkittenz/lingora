import React, { useEffect } from 'react';

export interface SoundEffects {
  playCorrect: () => void;
  playIncorrect: () => void;
  playSkip: () => void;
}

export function useSoundEffects(): SoundEffects {
  useEffect(() => {
    // Preload sound effects
    const correctSound = new Audio('/audio/effects/correct.mp3');
    const incorrectSound = new Audio('/audio/effects/incorrect.mp3');
    const skipSound = new Audio('/audio/effects/skip.mp3');
    
    correctSound.preload = 'auto';
    incorrectSound.preload = 'auto';
    skipSound.preload = 'auto';
  }, []);

  const playCorrect = () => {
    try {
      const audio = new Audio('/audio/effects/correct.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Silently handle autoplay restrictions
      });
    } catch (error) {
      // Silently handle audio errors
    }
  };

  const playIncorrect = () => {
    try {
      const audio = new Audio('/audio/effects/incorrect.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Silently handle autoplay restrictions
      });
    } catch (error) {
      // Silently handle audio errors
    }
  };

  const playSkip = () => {
    try {
      const audio = new Audio('/audio/effects/skip.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Silently handle autoplay restrictions
      });
    } catch (error) {
      // Silently handle audio errors
    }
  };

  return { playCorrect, playIncorrect, playSkip };
}