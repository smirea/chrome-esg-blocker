import type { Rule } from '../src/rule';

const badge =
	/^(?:Identifies as (?:women|Black|Asian|Latino|Latina|Latinx|Hispanic|Indigenous|Native American|LGBTQ\+?|veteran|disabled)[ -]owned|LGBTQ\+? friendly|Transgender safe\s?space)$/i;

export default {
	id: 'google-maps',
	matches: ['https://www.google.com/maps*', 'https://maps.google.com/*'],
	operations: [
		{
			type: 'hide',
			selector: '[data-item-id="place-info-links:"]',
			text: badge,
		},
		{
			type: 'hide',
			selector: '.W6VQef',
			text: badge,
		},
		{
			type: 'hide',
			selector: 'li.hpLkke [aria-label]',
			attribute: 'aria-label',
			text: badge,
			closest: 'li.hpLkke',
		},
		{ type: 'collapse-empty', selector: '.iP2t7d', items: 'li.hpLkke' },
		{ type: 'collapse-empty', selector: '.Ahnjwc', items: '.W6VQef' },
		{
			type: 'style',
			css: `
                .iP2t7d[data-esg-blocker-hidden] + .AyRUI,
                .iP2t7d[data-esg-blocker-hidden] + .AyRUI + .TFQHme,
                .iP2t7d[data-esg-blocker-hidden] + .AyRUI + .TFQHme + .AyRUI {
                    display: none !important;
                }
            `,
		},
	],
} satisfies Rule;
