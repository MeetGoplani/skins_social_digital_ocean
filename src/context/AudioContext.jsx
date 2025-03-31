import React, { createContext, useEffect } from 'react';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  useEffect(() => {
    const audio = new Audio('');
    audio.loop = true;
    let hasStarted = false;

    const startAudio = () => {
      if (!hasStarted) {
        audio.play()
          .then(() => {
            hasStarted = true;
          })
          .catch(error => console.log("Audio playback prevented:", error));
      }
    };

    const handleScroll = () => {
      startAudio();
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      audio.pause();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return <>{children}</>;
};