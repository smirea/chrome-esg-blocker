import type { Rule } from '../src/rule';

export default {
	id: 'google-flights',
	matches: ['https://www.google.com/travel/flights*'],
	operations: [
		{
			type: 'hide',
			selector: '.y0NSEe:has([data-co2currentflight]), [data-co2currentflight]',
		},
		{
			type: 'hide',
			selector:
				'li.WtSsrd:has([aria-label^="Carbon emissions estimate"]), li.WtSsrd:has([aria-label="Learn more about contrails"])',
		},
		{
			type: 'hide',
			selector:
				'.jfMcq:has(button[aria-label^="Emissions,"]), button[aria-label^="Emissions,"], [role="button"][aria-label^="Emissions,"]',
		},
		{
			type: 'hide',
			selector: 'section[data-filtertype="25"]:has([role="radiogroup"][aria-label="Emissions"])',
		},
		{
			type: 'hide',
			selector: '[role="option"], [role="menuitem"], [role="menuitemradio"]',
			text: /^(?:CO2 emissions|Emissions|Lowest emissions)$/i,
		},
	],
} satisfies Rule;
