const encoder = new TextEncoder();
const UINT32_RANGE = 0x100000000;

function cryptoApi() {
  if (!globalThis.crypto?.subtle || !globalThis.crypto?.getRandomValues) {
    throw new Error("Web Crypto is required to run AISlots securely.");
  }
  return globalThis.crypto;
}

export function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function randomSeed(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  cryptoApi().getRandomValues(bytes);
  return bytesToHex(bytes);
}

export async function sha256Hex(input) {
  const digest = await cryptoApi().subtle.digest("SHA-256", encoder.encode(input));
  return bytesToHex(new Uint8Array(digest));
}

/**
 * A deterministic SHA-256 counter stream. Rejection sampling avoids modulo bias,
 * so every weighted ticket remains exactly proportional to its published weight.
 */
export async function createFairRng(serverSeed, clientSeed, nonce) {
  let counter = 0;
  let bytePool = new Uint8Array();
  let offset = 0;

  async function refill() {
    const material = `${serverSeed}:${clientSeed}:${nonce}:${counter}`;
    counter += 1;
    const digest = await cryptoApi().subtle.digest("SHA-256", encoder.encode(material));
    bytePool = new Uint8Array(digest);
    offset = 0;
  }

  async function nextUint32() {
    if (offset + 4 > bytePool.length) await refill();
    const value = new DataView(bytePool.buffer, bytePool.byteOffset + offset, 4).getUint32(0, false);
    offset += 4;
    return value;
  }

  async function int(maxExclusive) {
    if (!Number.isSafeInteger(maxExclusive) || maxExclusive <= 0 || maxExclusive > UINT32_RANGE) {
      throw new RangeError("maxExclusive must be an integer between 1 and 2^32.");
    }

    const unbiasedLimit = Math.floor(UINT32_RANGE / maxExclusive) * maxExclusive;
    let value;
    do {
      value = await nextUint32();
    } while (value >= unbiasedLimit);
    return value % maxExclusive;
  }

  return { int };
}
