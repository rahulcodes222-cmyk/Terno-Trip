/**
 * EventBus — in-memory singleton event bus for inter-service communication.
 *
 * ⚠️  IMPORTANT: This is an in-process, in-memory event bus.
 *   - Events are NOT durable. If the process crashes, unprocessed events are lost.
 *   - This bus is NOT shared across separate OS processes. Each service that
 *     imports @terno/shared-events gets its own isolated instance.
 *   - For true inter-service event delivery, replace the adapter here with a
 *     message broker (e.g. RabbitMQ, AWS SQS, or Redis Streams).
 *
 * Design intent:
 *   - Single import surface: import { eventBus } from '@terno/shared-events'
 *   - Drop-in replacement surface: every emitter and subscriber uses the same
 *     three methods (emit / on / off), so swapping to a broker adapter later
 *     is a one-file change.
 */

import { EventEmitter } from "node:events";

class EventBus {
  private readonly emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
    // Allow many listeners without Node.js issuing a memory-leak warning.
    this.emitter.setMaxListeners(50);
  }

  /**
   * Publish an event.
   *
   * @param event   - Event name constant (use the exported constants from events.ts)
   * @param payload - Typed event payload
   */
  emit(event: string, payload: unknown): void {
    this.emitter.emit(event, payload);
  }

  /**
   * Subscribe to an event.
   *
   * @param event   - Event name constant
   * @param handler - Callback receiving the typed payload
   */
  on(event: string, handler: (payload: unknown) => void): void {
    this.emitter.on(event, handler);
  }

  /**
   * Unsubscribe a handler from an event.
   *
   * @param event   - Event name constant
   * @param handler - The same function reference passed to `on`
   */
  off(event: string, handler: (payload: unknown) => void): void {
    this.emitter.off(event, handler);
  }

  /**
   * Subscribe to an event, but fire only once then automatically unsubscribe.
   */
  once(event: string, handler: (payload: unknown) => void): void {
    this.emitter.once(event, handler);
  }
}

/**
 * Singleton EventBus instance.
 * Import this — do not instantiate EventBus directly.
 *
 * @example
 *   import { eventBus, BOOKING_CREATED } from '@terno/shared-events';
 *
 *   // Publisher
 *   eventBus.emit(BOOKING_CREATED, { bookingId, userId, ... });
 *
 *   // Subscriber
 *   eventBus.on(BOOKING_CREATED, (payload) => { ... });
 */
export const eventBus = new EventBus();

export { EventBus };
