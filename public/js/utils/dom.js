/**
 * DOM Utility Functions
 * Abstraction layer for DOM operations
 */

export const $ = (selector, context = document) => {
    return context.querySelector(selector);
};

export const $$ = (selector, context = document) => {
    return Array.from(context.querySelectorAll(selector));
};

export const createElement = (tag, attributes = {}, children = []) => {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else if (key.startsWith('on') && typeof value === 'function') {
            const eventName = key.slice(2).toLowerCase();
            element.addEventListener(eventName, value);
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else {
            element.setAttribute(key, value);
        }
    });

    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            element.appendChild(child);
        }
    });

    return element;
};

export const render = (container, content) => {
    if (typeof content === 'string') {
        container.innerHTML = content;
    } else if (content instanceof Node) {
        container.innerHTML = '';
        container.appendChild(content);
    }
};

export const show = (element) => {
    element.classList.remove('hidden');
};

export const hide = (element) => {
    element.classList.add('hidden');
};

export const toggle = (element, force) => {
    element.classList.toggle('hidden', force !== undefined ? !force : undefined);
};

export const addClass = (element, ...classes) => {
    element.classList.add(...classes);
};

export const removeClass = (element, ...classes) => {
    element.classList.remove(...classes);
};

export const hasClass = (element, className) => {
    return element.classList.contains(className);
};

export const setAttributes = (element, attributes) => {
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
};

export const removeElement = (element) => {
    element?.parentNode?.removeChild(element);
};

export const delegate = (container, selector, event, handler) => {
    container.addEventListener(event, (e) => {
        const target = e.target.closest(selector);
        if (target && container.contains(target)) {
            handler.call(target, e, target);
        }
    });
};

export const onReady = (callback) => {
    if (document.readyState !== 'loading') {
        callback();
    } else {
        document.addEventListener('DOMContentLoaded', callback);
    }
};

export const animate = (element, keyframes, options = {}) => {
    const defaultOptions = {
        duration: 300,
        easing: 'ease-out',
        fill: 'forwards'
    };
    return element.animate(keyframes, { ...defaultOptions, ...options });
};
