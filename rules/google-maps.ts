import type { Rule } from '../src/rule';

const badge =
	/^(?:Identifies as (?:women|Black|Asian|Latino|Latina|Latinx|Hispanic|Indigenous|Native American|LGBTQ\+?|veteran|disabled)[ -]owned|LGBTQ\+? friendly|Transgender safe\s?space)$/i;

const ownership = [
	'women',
	'Black',
	'Asian',
	'Latino',
	'Latina',
	'Latinx',
	'Hispanic',
	'Indigenous',
	'Native American',
	'LGBTQ',
	'LGBTQ+',
	'veteran',
	'disabled',
];
const labels = [
	...ownership.flatMap(owner => [`Identifies as ${owner}-owned`, `Identifies as ${owner} owned`]),
	'LGBTQ friendly',
	'LGBTQ+ friendly',
	'Transgender safespace',
	'Transgender safe space',
]
	.map(label => `[aria-label=${JSON.stringify(label)} i]`)
	.join(', ');

export default {
	id: 'google-maps',
	matches: ['https://www.google.com/maps*', 'https://maps.google.com/*'],
	operations: [
		{
			type: 'hide',
			selector: `li.hpLkke:has(:is(${labels}))`,
		},
		{
			type: 'hide',
			selector:
				':is([data-item-id="place-info-links:"], .W6VQef):has(img[src*="/placeinfo/"]:is([src*="women_led_"], [src*="lgbtq_friendly_"], [src*="lgbtq_owned_"]))',
		},
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
