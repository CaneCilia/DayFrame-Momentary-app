import { useState, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { getPendingSyncOperations } from '../database/syncQueue';
import { useAuth } from '../contexts/AuthContext';
import * as Network from 'expo-network';

export type SyncStatus = 'SYNCED' | 'SYNCING' | 'OFFLINE_PENDING' | 'NO_ACCOUNT';

export const useSyncStatus = () => {
  const db = useSQLiteContext();
  const { user } = useAuth();
  const [status, setStatus] = useState<SyncStatus>('NO_ACCOUNT');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      if (!user) {
        if (isMounted) setStatus('NO_ACCOUNT');
        return;
      }

      try {
        const ops = await getPendingSyncOperations(db);
        if (isMounted) setPendingCount(ops.length);

        if (ops.length === 0) {
          if (isMounted) setStatus('SYNCED');
          return;
        }

        const networkState = await Network.getNetworkStateAsync();
        if (!networkState.isConnected || !networkState.isInternetReachable) {
          if (isMounted) setStatus('OFFLINE_PENDING');
        } else {
          // If internet is reachable and there are pending ops, it means they are queued for sync
          if (isMounted) setStatus('SYNCING');
        }
      } catch (e) {
        console.error('Error checking sync status:', e);
      }
    };

    checkStatus();
    // Poll every 5 seconds for visual updates
    const interval = setInterval(checkStatus, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [db, user]);

  return { status, pendingCount };
};
