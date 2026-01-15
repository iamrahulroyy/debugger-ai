/**
 * Popup Script
 * Configuration UI only - delegates to background for API calls
 */

const API_BASE = 'http://localhost:8000';

document.getElementById('promptForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('generateBtn');
    const resultDiv = document.getElementById('result');

    btn.disabled = true;
    btn.textContent = 'Generating...';
    resultDiv.style.display = 'none';

    const schema = {
        schemaVersion: '1.0',
        role: document.getElementById('role').value,
        domain: document.getElementById('domain').value,
        expertiseLevel: document.getElementById('expertiseLevel').value,
        tone: document.getElementById('tone').value,
        writingStyle: document.getElementById('writingStyle').value,
        objective: document.getElementById('objective').value,
    };

    try {
        // Delegate to background service worker
        const response = await chrome.runtime.sendMessage({
            type: 'GENERATE_PROMPT',
            schema
        });

        if (response.error) {
            throw new Error(response.error);
        }

        resultDiv.innerHTML = `<pre>${response.prompt}</pre>`;
        resultDiv.classList.remove('error');

        // Copy to clipboard
        await navigator.clipboard.writeText(response.prompt);
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Generate Prompt'; }, 2000);

    } catch (err) {
        resultDiv.innerHTML = `Error: ${err.message}`;
        resultDiv.classList.add('error');
        btn.textContent = 'Generate Prompt';
    }

    resultDiv.style.display = 'block';
    btn.disabled = false;
});

// Load saved values
chrome.storage.local.get(['lastSchema'], (result) => {
    if (result.lastSchema) {
        const s = result.lastSchema;
        if (s.role) document.getElementById('role').value = s.role;
        if (s.domain) document.getElementById('domain').value = s.domain;
        if (s.expertiseLevel) document.getElementById('expertiseLevel').value = s.expertiseLevel;
        if (s.tone) document.getElementById('tone').value = s.tone;
        if (s.writingStyle) document.getElementById('writingStyle').value = s.writingStyle;
    }
});

// Save values on change
document.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('change', () => {
        const lastSchema = {
            role: document.getElementById('role').value,
            domain: document.getElementById('domain').value,
            expertiseLevel: document.getElementById('expertiseLevel').value,
            tone: document.getElementById('tone').value,
            writingStyle: document.getElementById('writingStyle').value,
        };
        chrome.storage.local.set({ lastSchema });
    });
});
