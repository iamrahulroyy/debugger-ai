/**
 * Background Service Worker
 * Handles API calls and state synchronization
 */

const API_BASE = 'http://localhost:8000';

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GENERATE_PROMPT') {
        generatePrompt(message.schema)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ error: error.message }));
        return true; // Keep channel open for async response
    }

    if (message.type === 'VALIDATE_PROMPT') {
        validatePrompt(message.schema)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ error: error.message }));
        return true;
    }

    if (message.type === 'GET_TEMPLATES') {
        getTemplates()
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ error: error.message }));
        return true;
    }
});

async function generatePrompt(schema) {
    const response = await fetch(`${API_BASE}/prompts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schema)
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
}

async function validatePrompt(schema) {
    const response = await fetch(`${API_BASE}/prompts/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schema)
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
}

async function getTemplates() {
    const response = await fetch(`${API_BASE}/prompts/templates`);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
}

// Install event
chrome.runtime.onInstalled.addListener(() => {
    console.log('PromptForge OS extension installed');
});
