// Migration script to update localStorage with new HTTPS Ollama URL
// This should be run once when the app loads to migrate existing users

export function migrateOllamaUrl() {
    const currentUrl = localStorage.getItem('ollamaUrl');

    // If the URL is HTTP-based or contains localhost/IP with port 11434, update it
    if (currentUrl && (
        currentUrl.startsWith('http://') ||
        currentUrl.includes(':11434') ||
        currentUrl.includes('localhost')
    )) {
        console.log('Migrating Ollama URL from HTTP to HTTPS...');
        localStorage.setItem('ollamaUrl', 'https://ollama.progenicslabs.com');
        console.log('✅ Ollama URL migrated to HTTPS');

        // Reload to apply changes
        window.location.reload();
    }
}
