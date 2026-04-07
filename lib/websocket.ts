/**
 * WebSocket / real-time messaging layer.
 *
 * This project uses Firebase Firestore real-time listeners as the primary
 * transport (see lib/services/messagingService.ts).  Socket.io is not
 * installed; this module provides a thin compatibility layer so that any
 * code referencing `lib/websocket` compiles without errors while the
 * Firestore-based solution remains the canonical implementation.
 *
 * To upgrade to Socket.io in the future:
 *  1. `npm install socket.io socket.io-client`
 *  2. Create a custom Next.js server (server.ts) and call initWebSocketServer(httpServer)
 *  3. Replace the stub functions below with real Socket.io logic.
 */

export type WebSocketEventType =
  | 'message'
  | 'typing_start'
  | 'typing_stop'
  | 'conversation_read'
  | 'user_online'
  | 'user_offline'

export interface WebSocketMessage {
  event: WebSocketEventType
  conversationId?: string
  userId?: string
  data?: unknown
}

/** Callback type for WebSocket event listeners. */
export type WebSocketListener = (msg: WebSocketMessage) => void

const listeners = new Set<WebSocketListener>()

/**
 * Subscribe to real-time WebSocket events.
 * Returns an unsubscribe function.
 */
export function onWebSocketMessage(listener: WebSocketListener): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

/**
 * Emit a WebSocket event to all local listeners.
 * In a full Socket.io setup this would broadcast via the server socket.
 */
export function emitWebSocketEvent(msg: WebSocketMessage): void {
  listeners.forEach((fn) => {
    try { fn(msg) } catch { /* ignore */ }
  })
}

/**
 * Placeholder — initialises the Socket.io server on a Node.js http.Server.
 * Currently a no-op because Socket.io is not yet installed.
 */
export function initWebSocketServer(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  httpServer: any
): void {
  void httpServer
  if (process.env.NODE_ENV !== 'production') {
    console.info('[websocket] Socket.io server not configured — using Firestore real-time listeners.')
  }
}
