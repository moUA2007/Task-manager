/**
 * Base Component Class
 * Foundation for all UI components
 */

import { $, $$, createElement, render } from '../utils/dom.js';
import { store } from '../store/store.js';
import { eventBus } from '../store/eventBus.js';

export class Component {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? $(container) : container;
        this.options = options;
        this.state = {};
        this.subscriptions = [];
        this.eventListeners = [];
        this.isRendered = false;
    }

    setState(newState) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...newState };
        this.onStateChange(prevState, this.state);
        if (this.isRendered) {
            this.update();
        }
    }

    onStateChange(prevState, newState) {}

    subscribeToStore(action, callback) {
        const unsubscribe = store.subscribe(action, callback.bind(this));
        this.subscriptions.push(unsubscribe);
        return unsubscribe;
    }

    subscribeToEvent(event, callback) {
        const unsubscribe = eventBus.on(event, callback.bind(this));
        this.subscriptions.push(unsubscribe);
        return unsubscribe;
    }

    addEventListener(element, event, handler, options = {}) {
        const boundHandler = handler.bind(this);
        element.addEventListener(event, boundHandler, options);
        this.eventListeners.push({ element, event, handler: boundHandler, options });
    }

    emit(event, ...args) {
        eventBus.emit(event, ...args);
    }

    dispatch(action, payload) {
        store.dispatch(action, payload);
    }

    getStoreState() {
        return store.getState();
    }

    template() {
        return '';
    }

    render() {
        if (!this.container) {
            console.error('Container not found for component');
            return;
        }

        const html = this.template();
        render(this.container, html);
        this.isRendered = true;
        this.afterRender();
        this.bindEvents();
    }

    update() {
        this.render();
    }

    afterRender() {}

    bindEvents() {}

    $(selector) {
        return $(selector, this.container);
    }

    $$(selector) {
        return $$(selector, this.container);
    }

    show() {
        this.container?.classList.remove('hidden');
    }

    hide() {
        this.container?.classList.add('hidden');
    }

    destroy() {
        this.subscriptions.forEach(unsubscribe => unsubscribe());
        this.subscriptions = [];

        this.eventListeners.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        this.eventListeners = [];

        if (this.container) {
            this.container.innerHTML = '';
        }

        this.isRendered = false;
    }
}
