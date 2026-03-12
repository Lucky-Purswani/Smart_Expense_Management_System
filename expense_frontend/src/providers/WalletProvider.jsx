"use client";

import { createContext, useContext, useState } from "react";

const WalletContext = createContext(null);

// Provides wallet state (balance, account info) to the app
export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  // TODO: Fetch wallet on mount when user is authenticated

  return (
    <WalletContext.Provider value={{ wallet, loading, setWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within a WalletProvider");
  }
  return context;
}
