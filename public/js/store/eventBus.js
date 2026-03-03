/**
 * Event Bus
 * Pub/Sub pattern for component communication
 */

class EventBus {
    constructor() {
        this.events = new Map();
    }

    on(event, callback, context = null) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        
        this.events.get(event).push({ callback, context });
        
        return () => this.off(event, callback);
    }

    once(event, callback, context = null) {
        const onceWrapper = (...args) => {
            callback.apply(context, args);
            this.off(event, onceWrapper);
        };
        
        return this.on(event, onceWrapper, context);
    }

    off(event, callback) {
        if (!this.events.has(event)) return;
        
        if (!callback) {
            this.events.delete(event);
            return;
        }

        const listeners = this.events.get(event);
        const index = listeners.findIndex(l => l.callback === callback);
        
        if (index !== -1) {
            listeners.splice(index, 1);
        }

        if (listeners.length === 0) {
            this.events.delete(event);
        }
    }

    emit(event, ...args) {
        if (!this.events.has(event)) return;
        
        this.events.get(event).forEach(({ callback, context }) => {
            callback.apply(context, args);
        });
    }

    clear() {
        this.events.clear();
    }
}

export const eventBus = new EventBus();

export const EVENTS = {
    AUTH_LOGIN: 'auth:login',
    AUTH_LOGOUT: 'auth:logout',
    AUTH_ERROR: 'auth:error',
    
    TASK_CREATED: 'task:created',
    TASK_UPDATED: 'task:updated',
    TASK_DELETED: 'task:deleted',
    TASK_COMPLETED: 'task:completed',
    
    TOAST_SHOW: 'toast:show',
    TOAST_HIDE: 'toast:hide',
    
    MODAL_OPEN: 'modal:open',
    MODAL_CLOSE: 'modal:close',
    
    NAVIGATE: 'navigate',
    
    LOADING_START: 'loading:start',
    LOADING_END: 'loading:end'
};
