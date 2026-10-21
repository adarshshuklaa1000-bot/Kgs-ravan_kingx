import CryptoJS from 'crypto-js';

// Shared cryptographic constants for Military-Grade Shield
export const SHIELD_SECRET_SALT = 'SM_GUARD_KGS_RAVAN_KINGX_SECURE_SALT_2026';
export const SHIELD_AES_KEY = 'RAVAN_KINGX_VAULT_AES256_MILITARY_KEY_099';
export const SHIELD_HEADER_GUARD = 'x-sm-guard';
export const SHIELD_HEADER_TS = 'x-sm-ts';
export const SHIELD_TAG = 'SM_VAULT_V1';

/**
 * Generates dynamic dynamic HMAC-SHA256 Client Guard headers for every outgoing request.
 * Validity window enforced by server is 60-120 seconds.
 */
export function createGuardHeaders(path: string): Record<string, string> {
  const cleanPath = path.split('?')[0];
  const timestamp = Date.now().toString();
  const signature = CryptoJS.HmacSHA256(
    `${cleanPath}:${timestamp}:${SHIELD_SECRET_SALT}`,
    SHIELD_SECRET_SALT
  ).toString();

  return {
    [SHIELD_HEADER_GUARD]: signature,
    [SHIELD_HEADER_TS]: timestamp,
    'x-sm-client': 'ravan_kingx_guard_v4'
  };
}

/**
 * Decrypts End-to-End AES-256 encrypted ciphertext response in client memory.
 * Network tab only sees gibberish _shield and _ct ciphertext.
 */
export function decryptVaultPayload<T>(rawPayload: any): T {
  if (!rawPayload) return rawPayload as T;

  let payload = rawPayload;
  if (typeof rawPayload === 'string') {
    try {
      payload = JSON.parse(rawPayload);
    } catch {
      return rawPayload as T;
    }
  }

  // Check if response is protected with AES-256 Shield Vault
  if (payload && payload._shield === SHIELD_TAG && typeof payload._ct === 'string') {
    try {
      const decryptedBytes = CryptoJS.AES.decrypt(payload._ct, SHIELD_AES_KEY);
      const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedText) {
        throw new Error('Malformed or empty decrypted text');
      }
      return JSON.parse(decryptedText) as T;
    } catch (err) {
      console.error('Shield decryption failed in client memory:', err);
      throw err;
    }
  }

  return payload as T;
}

/**
 * Encrypts plaintext JSON payload with AES-256 for network transit.
 */
export function encryptVaultPayload(data: any): { _shield: string; _ct: string; _ts: number } {
  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), SHIELD_AES_KEY).toString();
  return {
    _shield: SHIELD_TAG,
    _ct: ciphertext,
    _ts: Date.now()
  };
}

/**
 * Initializes Client-Side Anti-DevTools & Anti-Inspect Armor:
 * - Context menu disabled (right click)
 * - F12, Ctrl+Shift+I/J/C, Ctrl+U, Cmd+Option+I/J/C blocked
 * - Console inspection silenced + periodic console.clear()
 * - Text drag/selection block
 */
let armorInitialized = false;

export function initAntiInspectArmor() {
  if (armorInitialized || typeof window === 'undefined') return;
  armorInitialized = true;

  // 1. Disable Right Click / Context Menu
  window.addEventListener(
    'contextmenu',
    (e: MouseEvent) => {
      e.preventDefault();
      return false;
    },
    { capture: true }
  );

  // 2. Block Inspect Keyboard Shortcuts
  window.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      // F12 key
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      const isShiftOrAlt = e.shiftKey || e.altKey;
      const key = e.key.toLowerCase();

      // Ctrl + Shift + I / J / C (DevTools & Console) or Cmd + Option + I / J / C
      if (isCtrlOrMeta && isShiftOrAlt && ['i', 'j', 'c'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + U (View Source) or Ctrl + S (Save Page)
      if (isCtrlOrMeta && ['u', 's', 'p'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    },
    { capture: true }
  );

  // 3. Console silence & wipe
  try {
    const noop = () => {};
    // Keep internal error handling if critically needed, but silence standard logging
    console.log = noop;
    console.info = noop;
    console.warn = noop;
    console.table = noop;
    console.debug = noop;

    setInterval(() => {
      try {
        console.clear();
      } catch {
        // ignore
      }
    }, 5000);
  } catch {
    // ignore
  }

  // 4. Subtle DevTools detection guard
  let checkDevTools = () => {
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;
    if (widthDiff || heightDiff) {
      try {
        console.clear();
      } catch {}
    }
  };
  window.addEventListener('resize', checkDevTools);
}
