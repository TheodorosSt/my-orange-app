/* ===================================
   ORANGE — Real-Time Collaboration Hook
   Supabase Realtime Presence + Broadcast.
   =================================== */

import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/services/auth';
import { useAuthStore } from '@/stores/authStore';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Collaborator {
  userId: string;
  email: string;
  fullName: string;
  color: string;
  cursor?: { line: number; column: number };
  lastSeen: string;
}

interface CollabState {
  text?: string;
  translatedText?: string;
  [key: string]: unknown;
}

const COLORS = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12',
  '#9b59b6', '#1abc9c', '#e67e22', '#e91e63',
];

export function useCollaboration(documentId: string | null) {
  const { user } = useAuthStore();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState<string | null>(null);
  const colorIndex = useRef(Math.floor(Math.random() * COLORS.length));

  // ===================================
  // Join / Leave Channel
  // ===================================

  useEffect(() => {
    if (!documentId || !user) return;

    const channelName = `collab:${documentId}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: { key: user.id },
        broadcast: { self: false },
      },
    });

    // Presence: track who's online
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<{
        email: string;
        full_name: string;
        color: string;
      }>();

      const collabs: Collaborator[] = Object.entries(state).map(
        ([userId, presences]) => {
          const p = presences[0]; // Latest presence
          return {
            userId,
            email: p.email || '',
            fullName: p.full_name || 'Unknown',
            color: p.color || COLORS[0],
            lastSeen: new Date().toISOString(),
          };
        },
      );

      // Filter out self
      setCollaborators(collabs.filter((c) => c.userId !== user.id));
    });

    // Broadcast: cursor updates
    channel.on('broadcast', { event: 'cursor_update' }, ({ payload }) => {
      setCollaborators((prev) =>
        prev.map((c) =>
          c.userId === payload.user_id
            ? { ...c, cursor: payload.cursor }
            : c,
        ),
      );
    });

    // Broadcast: state sync
    channel.on('broadcast', { event: 'state_sync' }, ({ payload }) => {
      // Handled by parent component via onStateSync callback
      stateCallbackRef.current?.(payload.state, payload.user_id);
    });

    // Broadcast: lock events
    channel.on('broadcast', { event: 'lock_change' }, ({ payload }) => {
      setIsLocked(!!payload.locked_by);
      setLockedBy(payload.locked_by);
    });

    // Subscribe and track presence
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email,
          color: COLORS[colorIndex.current],
          online_at: new Date().toISOString(),
        });
      }
    });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [documentId, user]);

  // ===================================
  // State sync callback ref
  // ===================================

  const stateCallbackRef = useRef<
    ((state: CollabState, userId: string) => void) | null
  >(null);

  const onStateSync = useCallback(
    (callback: (state: CollabState, userId: string) => void) => {
      stateCallbackRef.current = callback;
    },
    [],
  );

  // ===================================
  // Broadcast cursor
  // ===================================

  const broadcastCursor = useCallback(
    (cursor: { line: number; column: number }) => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'cursor_update',
        payload: {
          user_id: user?.id,
          cursor,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [user],
  );

  // ===================================
  // Broadcast state change
  // ===================================

  const broadcastState = useCallback(
    (state: CollabState) => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'state_sync',
        payload: {
          user_id: user?.id,
          state,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [user],
  );

  return {
    collaborators,
    isLocked,
    lockedBy,
    broadcastCursor,
    broadcastState,
    onStateSync,
    isConnected: !!channelRef.current,
  };
}