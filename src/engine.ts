import { matchUrl, type Rule } from './rule';
import { readyAttribute, ruleCss, staticSelectors } from './styles';

const hiddenAttribute = 'data-esg-blocker-hidden';
const hiddenSelector = `[${hiddenAttribute}]`;

export function start(rules: Rule[], doc = document, win = window) {
	const style = doc.createElement('style');
	style.id = 'esg-blocker-style';
	let hidden = new Set<Element>();
	let frame: number | undefined;
	let href = '';
	let active: Rule[] = [];
	let selectors: string[] = [];
	let stylesheet = '';
	const reported = new Set<string>();

	function report(id: string, error: unknown) {
		if (reported.has(id)) return;
		reported.add(id);
		console.warn(`[ESG Blocker] ${id}`, error);
	}

	function apply() {
		frame = undefined;
		observer.disconnect();
		try {
			if (!doc.documentElement) return;
			if (href !== win.location.href) {
				href = win.location.href;
				active = rules.filter(rule => rule.matches.some(pattern => matchUrl(pattern, href)));
				selectors = active.flatMap(staticSelectors);
				stylesheet = [`${hiddenSelector} { display: none !important; }`, ...active.map(ruleCss)].join('\n');
			}
			const next = new Set<Element>();
			const cleanup: Array<{ selector: string; items: string; id: string }> = [];
			for (const rule of active) {
				try {
					for (const operation of rule.operations) {
						if (operation.type === 'style') {
							continue;
						} else if (operation.type === 'collapse-empty') {
							cleanup.push({ ...operation, id: rule.id });
						} else {
							if (!operation.text && !operation.closest) continue;
							for (const element of doc.querySelectorAll(operation.selector)) {
								if (operation.text) {
									operation.text.lastIndex = 0;
									const value = operation.attribute
										? (element.getAttribute(operation.attribute) ?? '')
										: (element.textContent ?? '');
									if (!operation.text.test(value.replace(/\s+/g, ' ').trim())) continue;
								}
								const target = operation.closest ? element.closest(operation.closest) : element;
								if (target && !target.matches('html, body, main, [role="main"]')) next.add(target);
							}
						}
					}
				} catch (error) {
					report(rule.id, error);
				}
			}
			const isBlocked = (item: Element) => {
				for (let node: Element | null = item; node; node = node.parentElement) {
					if (next.has(node) || selectors.some(selector => node!.matches(selector))) return true;
				}
				return false;
			};
			for (const operation of cleanup) {
				try {
					for (const section of doc.querySelectorAll(operation.selector)) {
						const items = [...section.querySelectorAll(operation.items)];
						if (items.length && items.every(isBlocked)) next.add(section);
					}
				} catch (error) {
					report(operation.id, error);
				}
			}
			for (const element of hidden) {
				if (!next.has(element)) element.removeAttribute(hiddenAttribute);
			}
			for (const element of next) {
				if (!element.hasAttribute(hiddenAttribute)) element.setAttribute(hiddenAttribute, '');
			}
			hidden = next;
			if (style.textContent !== stylesheet) style.textContent = stylesheet;
			if (!style.isConnected) (doc.head ?? doc.documentElement).append(style);
			if (!doc.documentElement.hasAttribute(readyAttribute)) doc.documentElement.setAttribute(readyAttribute, '');
		} finally {
			observer.observe(doc, {
				childList: true,
				subtree: true,
				characterData: true,
				attributes: true,
			});
		}
	}

	function schedule() {
		frame ??= win.requestAnimationFrame(apply);
	}

	// Disconnect during our own mutations to avoid an observer feedback loop.
	const observer = new win.MutationObserver(schedule);
	apply();
	win.addEventListener('popstate', schedule);
	win.addEventListener('hashchange', schedule);
	const navigation = setInterval(() => {
		if (href !== win.location.href) schedule();
	}, 500);

	return () => {
		observer.disconnect();
		if (frame !== undefined) win.cancelAnimationFrame(frame);
		clearInterval(navigation);
		win.removeEventListener('popstate', schedule);
		win.removeEventListener('hashchange', schedule);
		for (const element of hidden) element.removeAttribute(hiddenAttribute);
		style.remove();
	};
}
