// Connection Status Indicator - Shows backend connection status
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import api from '../services/axios';

export const ConnectionStatus: React.FC = () => {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const checkConnection = async () => {
    setChecking(true);
    try {
      await api.get('/health');
      setConnected(true);
    } catch (error) {
      setConnected(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  if (connected === null || checking) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 text-xs text-slate-500">
        <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
        <span>Checking...</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 text-xs rounded cursor-pointer ${
        connected
          ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-300'
          : 'text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300'
      }`}
      onClick={checkConnection}
      title={connected ? 'Backend connected' : 'Backend offline - using mock data'}
    >
      {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
      <span>{connected ? 'Live' : 'Demo'}</span>
    </div>
  );
};
