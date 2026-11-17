import { expect, test } from 'bun:test';
import { matchUrl } from './rule';

// Chrome injects content scripts by the manifest's match patterns, and the engine reuses the same patterns to switch
// rules on and off across SPA navigation. Cases come from Chrome's match pattern documentation.
test('Rule URL patterns match the same URLs as Chrome content-script match patterns', () => {
	const cases: Array<[pattern: string, url: string, matches: boolean]> = [
		['https://*/*', 'https://example.com/any/path?x=1', true],
		['https://*/*', 'http://example.com/', false],
		['https://*/foo*', 'https://www.google.com/foo', true],
		['https://*/foo*', 'https://example.com/foo/bar.html', true],
		['https://*/foo*', 'https://example.com/bar/foo', false],
		['https://*.google.com/foo*bar', 'https://www.google.com/foo/baz/bar', true],
		['https://*.google.com/foo*bar', 'https://docs.google.com/foobar', true],
		['https://*.google.com/*', 'https://google.com/', true],
		['https://*.google.com/*', 'https://evilgoogle.com/', false],
		['*://mail.google.com/', 'http://mail.google.com/', true],
		['*://mail.google.com/', 'https://mail.google.com/', true],
		['*://mail.google.com/', 'https://mail.google.com/inbox', false],
		['*://*/*', 'ftp://example.com/', false],
		['http://127.0.0.1/*', 'http://127.0.0.1/foo/bar.html', true],
		['https://www.google.com/travel/flights*', 'https://www.google.com/travel/flights?q=JFK&hl=en', true],
		['https://www.google.com/travel/flights*', 'https://www.google.com/travel/flights/search?tfs=x#top', true],
		['https://www.google.com/travel/flights*', 'https://www.google.com/search?q=/travel/flights', false],
		['https://www.google.com/travel/flights*', 'https://maps.google.com/travel/flights', false],
	];
	for (const [pattern, url, matches] of cases)
		expect([pattern, url, matchUrl(pattern, url)]).toEqual([pattern, url, matches]);
});
