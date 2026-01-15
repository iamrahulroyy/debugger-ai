/**
 * Content Script
 * DOM injection only - injects generated prompts into AI chat interfaces
 */

// Inject button to paste prompt
function injectPromptButton() {
    // Check if we're on a supported page
    const isOpenAI = window.location.hostname === 'chat.openai.com';
    const isClaude = window.location.hostname === 'claude.ai';
    const isGemini = window.location.hostname === 'gemini.google.com';

    if (!isOpenAI && !isClaude && !isGemini) return;

    // Create floating button
    const button = document.createElement('button');
    button.id = 'promptforge-inject-btn';
    button.innerHTML = '⚡';
    button.title = 'Paste PromptForge prompt';
    document.body.appendChild(button);

    button.addEventListener('click', async () => {
        try {
            const clipboard = await navigator.clipboard.readText();
            const textarea = findTextArea();

            if (textarea) {
                // Insert text
                textarea.focus();
                document.execCommand('selectAll', false, null);
                document.execCommand('insertText', false, clipboard);

                // Trigger input event for React-based apps
                textarea.dispatchEvent(new Event('input', { bubbles: true }));

                showToast('Prompt inserted!');
            } else {
                showToast('Text area not found', 'error');
            }
        } catch (err) {
            showToast('Failed to paste: ' + err.message, 'error');
        }
    });
}

function findTextArea() {
    // OpenAI ChatGPT
    const openaiTextarea = document.querySelector('#prompt-textarea');
    if (openaiTextarea) return openaiTextarea;

    // Claude
    const claudeTextarea = document.querySelector('[contenteditable="true"]');
    if (claudeTextarea) return claudeTextarea;

    // Gemini
    const geminiTextarea = document.querySelector('rich-textarea textarea');
    if (geminiTextarea) return geminiTextarea;

    // Fallback
    return document.querySelector('textarea');
}

function showToast(message, type = 'success') {
    const existing = document.getElementById('promptforge-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'promptforge-toast';
    toast.className = type;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectPromptButton);
} else {
    injectPromptButton();
}
