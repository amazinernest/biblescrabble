/**
 * Multiplayer Engine for Scripture Scrabble
 * Hybrid WebRTC DataChannel (PeerJS) + BroadcastChannel fallback
 * Enables zero-lag live matches across different computers, phones, or browser tabs.
 */

import { BoardSquare, ScrabbleTile, PlacedTile } from './scrabbleEngine';
import { ScriptureDefinition } from './scrabbleDictionary';

export type GameModeType = 'ai' | 'pass_and_play' | 'online_host' | 'online_guest';

export interface MultiplayerMessage {
  type: 'GAME_INIT' | 'MOVE_PLAYED' | 'PASS_TURN' | 'SWAP_TILES' | 'REACTION' | 'REMATCH';
  senderName: string;
  payload?: any;
}

export interface GameSyncState {
  board: BoardSquare[][];
  tileBag: ScrabbleTile[];
  hostRack: ScrabbleTile[];
  guestRack: ScrabbleTile[];
  hostScore: number;
  guestScore: number;
  isHostTurn: boolean;
  isFirstMove: boolean;
  latestLore?: ScriptureDefinition;
}

class MultiplayerEngine {
  private peer: any = null;
  private connection: any = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private roomCode: string = '';
  private playerName: string = 'Pilgrim';
  private onMessageCallback: ((msg: MultiplayerMessage) => void) | null = null;
  private onConnectCallback: (() => void) | null = null;
  private onDisconnectCallback: (() => void) | null = null;

  public setPlayerName(name: string) {
    this.playerName = name || 'Pilgrim';
  }

  public getPlayerName(): string {
    return this.playerName;
  }

  public getRoomCode(): string {
    return this.roomCode;
  }

  public onMessage(callback: (msg: MultiplayerMessage) => void) {
    this.onMessageCallback = callback;
  }

  public onConnect(callback: () => void) {
    this.onConnectCallback = callback;
  }

  public onDisconnect(callback: () => void) {
    this.onDisconnectCallback = callback;
  }

  /**
   * Host an Online Match room with a given 6-character code
   */
  public async hostRoom(roomCode: string): Promise<string> {
    this.cleanup();
    this.roomCode = roomCode.toUpperCase().trim();
    const peerId = `wordquest-${this.roomCode.toLowerCase()}`;

    // Init local BroadcastChannel for same-browser testing
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel(`wordquest_room_${this.roomCode}`);
      this.broadcastChannel.onmessage = (event) => {
        if (event.data && this.onMessageCallback) {
          this.onMessageCallback(event.data);
        }
      };
    }

    try {
      const { default: Peer } = await import('peerjs');
      this.peer = new Peer(peerId, {
        debug: 1,
      });

      return new Promise((resolve) => {
        this.peer.on('open', (id: string) => {
          this.peer.on('connection', (conn: any) => {
            this.connection = conn;
            this.setupConnectionHandlers(conn);
            if (this.onConnectCallback) this.onConnectCallback();
          });
          resolve(id);
        });

        this.peer.on('error', (err: any) => {
          console.warn('Peer host error (using broadcast fallback):', err);
          resolve(peerId);
        });
      });
    } catch (e) {
      console.warn('PeerJS import error:', e);
      return peerId;
    }
  }

  /**
   * Join an Online Match room with a given room code
   */
  public async joinRoom(roomCode: string): Promise<boolean> {
    this.cleanup();
    this.roomCode = roomCode.toUpperCase().trim();
    const hostPeerId = `wordquest-${this.roomCode.toLowerCase()}`;
    const guestPeerId = `wordquest-guest-${Date.now()}`;

    // Init local BroadcastChannel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel(`wordquest_room_${this.roomCode}`);
      this.broadcastChannel.onmessage = (event) => {
        if (event.data && this.onMessageCallback) {
          this.onMessageCallback(event.data);
        }
      };
    }

    try {
      const { default: Peer } = await import('peerjs');
      this.peer = new Peer(guestPeerId, {
        debug: 1,
      });

      return new Promise((resolve) => {
        this.peer.on('open', () => {
          const conn = this.peer.connect(hostPeerId, {
            reliable: true,
          });

          conn.on('open', () => {
            this.connection = conn;
            this.setupConnectionHandlers(conn);
            if (this.onConnectCallback) this.onConnectCallback();
            resolve(true);
          });

          conn.on('error', (err: any) => {
            console.warn('Peer join error:', err);
            resolve(true);
          });

          // Fallback resolve after 4s
          setTimeout(() => resolve(true), 4000);
        });

        this.peer.on('error', (err: any) => {
          console.warn('Peer guest error:', err);
          resolve(true);
        });
      });
    } catch (e) {
      console.warn('PeerJS join error:', e);
      return false;
    }
  }

  private setupConnectionHandlers(conn: any) {
    conn.on('data', (data: any) => {
      if (this.onMessageCallback) {
        this.onMessageCallback(data);
      }
    });

    conn.on('close', () => {
      if (this.onDisconnectCallback) {
        this.onDisconnectCallback();
      }
    });
  }

  /**
   * Send a message to the connected peer / room
   */
  public send(message: MultiplayerMessage) {
    // Send via WebRTC DataChannel if open
    if (this.connection && this.connection.open) {
      this.connection.send(message);
    }

    // Also broadcast via BroadcastChannel for same-browser / network fallback
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(message);
    }
  }

  public cleanup() {
    if (this.connection) {
      try {
        this.connection.close();
      } catch (e) {}
      this.connection = null;
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch (e) {}
      this.peer = null;
    }
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch (e) {}
      this.broadcastChannel = null;
    }
    this.roomCode = '';
  }
}

export const multiplayer = new MultiplayerEngine();
