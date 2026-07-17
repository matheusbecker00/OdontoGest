import type { Request } from 'express';

export interface RequestMetadata {
  requestId: string;
  ipPrefix: string | null;
  userAgentSummary: string | null;
}

function reduceIp(ip: string | undefined): string | null {
  if (!ip) return null;

  const normalized = ip.replace(/^::ffff:/, '');
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(normalized)) {
    const octets = normalized.split('.');
    return `${octets[0]}.${octets[1]}.${octets[2]}.0/24`;
  }

  if (normalized.includes(':')) {
    return `${normalized.split(':').slice(0, 4).join(':')}::/64`;
  }

  return null;
}

export function requestMetadata(request: Request): RequestMetadata {
  const requestId = typeof request.id === 'string' ? request.id : 'unknown';
  const userAgent = request.get('user-agent');

  return {
    requestId,
    ipPrefix: reduceIp(request.ip),
    userAgentSummary: userAgent ? userAgent.slice(0, 255) : null,
  };
}
