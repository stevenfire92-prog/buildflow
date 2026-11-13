// ProUpgrade.jsx — legacy upgrade component PURGED by Steve's order (Nov 13, 2026).
// Payments run through PayPal only. The old component is gone; this stub
// re-exports PayPalCheckout so any stray import of ProUpgrade still
// resolves to the PayPal flow.
import PayPalCheckout from './PayPalCheckout.jsx';

export { isFounder, hasProAccess } from './PayPalCheckout.jsx';
export const ProUpgrade = PayPalCheckout;
export default PayPalCheckout;
