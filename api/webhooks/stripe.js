import handlers from '../_billing/index.js';
export const config = { api: { bodyParser: false } };
export default handlers.webhook;
