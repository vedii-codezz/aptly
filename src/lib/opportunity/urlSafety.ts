import { lookup } from "node:dns/promises";

const isPrivateIpv4 = (ip: string) => /^(127\.|10\.|192\.168\.|169\.254\.)/.test(ip) || /^172\.(1[6-9]|2\d|3[01])\./.test(ip) || ip === "0.0.0.0";
const isPrivateIp = (ip: string) => isPrivateIpv4(ip) || ip === "::1" || ip.toLowerCase().startsWith("fe80:") || ip.toLowerCase().startsWith("fc") || ip.toLowerCase().startsWith("fd");

export async function assertSafePublicUrl(value: string): Promise<URL> {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("INVALID_URL"); }
  if (!/^https?:$/.test(url.protocol) || !url.hostname || url.username || url.password) throw new Error("INVALID_URL");
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || isPrivateIp(host)) throw new Error("UNSAFE_URL");
  const addresses = await lookup(host, { all: true, verbatim: true }).catch(() => { throw new Error("UNRESOLVABLE_URL"); });
  if (!addresses.length || addresses.some(({ address }) => isPrivateIp(address))) throw new Error("UNSAFE_URL");
  return url;
}
