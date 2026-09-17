export type Operation =
	| { type: 'hide'; selector: string; text?: RegExp; attribute?: string; closest?: string }
	| { type: 'collapse-empty'; selector: string; items: string }
	| { type: 'style'; css: string };

export interface Rule {
	id: string;
	matches: string[];
	operations: Operation[];
}

export function matchUrl(pattern: string, href: string): boolean {
	const match = /^(https?|\*):\/\/([^/]+)(\/.*)$/.exec(pattern);
	if (!match) throw new Error(`Invalid URL match pattern: ${pattern}`);
	const [, scheme, host, path] = match;
	const url = new URL(href);
	if (!['http:', 'https:'].includes(url.protocol)) return false;
	if (scheme !== '*' && url.protocol !== `${scheme}:`) return false;
	const hostname = host.startsWith('*.') ? host.slice(2) : host;
	if (host !== '*' && url.hostname !== hostname && !(host.startsWith('*.') && url.hostname.endsWith(`.${hostname}`)))
		return false;
	const expression = path
		.split('*')
		.map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
		.join('.*');
	return new RegExp(`^${expression}$`).test(url.pathname + url.search);
}
