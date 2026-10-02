'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface PreloaderContextType {
  isLoaded: boolean;
  setIsLoaded: (loaded: boolean) => void;
  showPreloader: boolean;
  setShowPreloader: (show: boolean) => void;
}

const PreloaderContext = createContext<PreloaderContextType>({
  isLoaded: false,
  setIsLoaded: () => {},
  showPreloader: true,
  setShowPreloader: () => {},
});

export function PreloaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);

  return (
    <PreloaderContext.Provider
      value={{
        isLoaded,
        setIsLoaded,
        showPreloader,
        setShowPreloader,
      }}
    >
      {children}
    </PreloaderContext.Provider>
  );
}

export function usePreloader() {
  return useContext(PreloaderContext);
}
