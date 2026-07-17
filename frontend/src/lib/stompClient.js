import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class StompClientManager {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
    this.connected = false;
    this.connectCallbacks = [];
  }

  connect() {
    if (this.client && this.client.active) {
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL || 'http://localhost:8080/api/v1/ws-chat'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.connected = true;
        this.connectCallbacks.forEach(cb => cb());
        this.connectCallbacks = [];
      },
      onDisconnect: () => {
        this.connected = false;
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      }
    });

    this.client.activate();
  }

  onConnect(callback) {
    if (this.connected && this.client && this.client.active) {
      callback();
    } else {
      this.connectCallbacks.push(callback);
      this.connect();
    }
  }

  subscribe(destination, callback) {
    this.onConnect(() => {
      if (this.subscriptions.has(destination)) {
        // Unsubscribe previous callback for this destination if exists
        try {
          this.subscriptions.get(destination).unsubscribe();
        } catch {}
      }
      const sub = this.client.subscribe(destination, (message) => {
        try {
          const body = JSON.parse(message.body);
          callback(body);
        } catch {
          callback(message.body);
        }
      });
      this.subscriptions.set(destination, sub);
    });

    // Return an object with unsubscribe method
    return {
      unsubscribe: () => {
        if (this.subscriptions.has(destination)) {
          try {
            this.subscriptions.get(destination).unsubscribe();
            this.subscriptions.delete(destination);
          } catch {}
        }
      }
    };
  }

  disconnect() {
    if (this.client) {
      this.subscriptions.forEach(sub => {
        try { sub.unsubscribe(); } catch {}
      });
      this.subscriptions.clear();
      this.client.deactivate();
      this.connected = false;
    }
  }
}

const stompClient = new StompClientManager();
export default stompClient;
