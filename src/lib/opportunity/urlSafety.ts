import { lookup } from "node:dns/promises";

const isPrivateIpv4 = (ip: string) => {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [a, b] = parts;
  return a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
};
const isPrivateIp = (raw: string) => {
  const ip = raw.toLowerCase().replace(/^\[|\]$/g, "");
  if (isPrivateIpv4(ip)) return true;
  const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  const mappedHex = ip.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  const mappedHexIpv4 = mappedHex
    ? `${parseInt(mappedHex[1], 16) >> 8}.${parseInt(mappedHex[1], 16) & 255}.${parseInt(mappedHex[2], 16) >> 8}.${parseInt(mappedHex[2], 16) & 255}`
    : undefined;
  return Boolean(mapped && isPrivateIpv4(mapped[1])) || Boolean(mappedHexIpv4 && isPrivateIpv4(mappedHexIpv4)) || ip === "::" || ip === "::1" || ip.startsWith("fe80:") || ip.startsWith("fc") || ip.startsWith("fd");
};

export type DnsLookup = (hostname: string) => Promise<{ address: string }[]>;

export async function assertSafePublicUrl(value: string, resolve: DnsLookup = async (hostname) => lookup(hostname, { all: true, verbatim: true })): Promise<URL> {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("INVALID_URL"); }
  if (!/^https?:$/.test(url.protocol) || !url.hostname || url.username || url.password) throw new Error("INVALID_URL");
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || isPrivateIp(host)) throw new Error("UNSAFE_URL");
  const addresses = await resolve(host).catch(() => { throw new Error("UNRESOLVABLE_URL"); });
  if (!addresses.length || addresses.some(({ address }) => isPrivateIp(address))) throw new Error("UNSAFE_URL");
  return url;
}
