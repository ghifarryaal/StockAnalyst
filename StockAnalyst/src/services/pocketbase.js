import PocketBase from 'pocketbase';

// Get PocketBase URL from environment variables
const pbUrl = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';

// Initialize PocketBase client
export const pb = new PocketBase(pbUrl);

// Optional: Enable auto-cancellation for frequent requests
pb.autoCancellation(false);

export default pb;
