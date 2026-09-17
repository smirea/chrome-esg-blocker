import type { Rule } from './rule';

export const readyAttribute = 'data-esg-blocker-ready';

export function staticSelectors(rule: Rule): string[] {
	return rule.operations.flatMap(operation =>
		operation.type === 'hide' && !operation.text && !operation.closest ? [operation.selector] : [],
	);
}

export function ruleCss(rule: Rule): string {
	return [
		...staticSelectors(rule).map(selector => `:is(${selector}) { display: none !important; }`),
		...rule.operations.flatMap(operation => (operation.type === 'style' ? [operation.css] : [])),
	].join('\n');
}

export function earlyCss(rule: Rule): string {
	// JS replaces these initial URL-scoped styles so they cannot leak across SPA routes.
	return staticSelectors(rule)
		.map(selector => `:root:not([${readyAttribute}]) :is(${selector}) { display: none !important; }`)
		.join('\n');
}
