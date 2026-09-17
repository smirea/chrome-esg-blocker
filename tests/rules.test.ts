import { afterEach, expect, test } from 'bun:test';
import { Window } from 'happy-dom';
import { start } from '../src/engine';
import flights from '../rules/google-flights';
import maps from '../rules/google-maps';

let stop: (() => void) | undefined;
let page: Window;
afterEach(() => {
	stop?.();
	page?.happyDOM.abort();
});

function load(html: string, path: string) {
	page = new Window({ url: `https://www.google.com/${path}` });
	page.document.body.innerHTML = html;
	stop = start([flights, maps], page.document as unknown as Document, page as unknown as typeof window);
	return page.document;
}

const blocked = (doc: Window['document'], selector: string) =>
	Boolean(doc.querySelector(selector)?.closest('[data-esg-blocker-hidden]'));
const settle = () => new Promise(resolve => setTimeout(resolve, 160));

test('Flights collapses emissions columns and detail rows without hiding the flight or amenities', () => {
	const doc = load(
		`<ul><li class="pIav2d" id="flight">
        <div class="KhL0De"><div id="schedule">10:40 AM · JetBlue</div>
        <div class="y0NSEe" id="column"><div data-co2currentflight="184000">184 kg CO2e</div></div>
        <div id="price">$100</div></div>
        <ul><li class="WtSsrd" id="wifi">Free Wi-Fi</li>
        <li class="WtSsrd" id="emissions"><span aria-label="Carbon emissions estimate: 184 kilograms">184 kg CO2e</span></li>
        <li class="WtSsrd" id="contrails"><span>Contrail warming potential: Medium</span><button aria-label="Learn more about contrails"></button></li></ul>
        </li></ul>
        <span class="jfMcq" id="filter-wrapper"><button aria-label="Emissions, Not selected" id="filter">Emissions</button></span>
        <section data-filtertype="25" id="filter-section"><h2>Emissions</h2><div role="radiogroup" aria-label="Emissions"></div></section>
        <div role="menuitemradio" id="sort">Emissions</div>`,
		'travel/flights?q=test',
	);
	for (const id of ['column', 'emissions', 'contrails', 'filter-wrapper', 'filter', 'filter-section', 'sort'])
		expect(blocked(doc, `#${id}`)).toBe(true);
	for (const id of ['flight', 'schedule', 'price', 'wifi']) expect(blocked(doc, `#${id}`)).toBe(false);
});

test('Maps removes badges and empty headings, preserving mixed sections and product attributes', () => {
	const doc = load(
		`<article id="business"><h2>Women-owned Coffee</h2>
        <div class="Ahnjwc" id="badge-row"><div class="W6VQef">Identifies as women-owned</div></div>
        <p id="review">A women-owned coffee shop with great coffee.</p></article>
        <div data-item-id="place-info-links:" id="overview">LGBTQ+ friendly</div>
        <div class="iP2t7d" id="ownership"><h2>From the business</h2><ul>
        <li class="hpLkke"><span aria-label="Identifies as LGBTQ+ owned"></span></li></ul></div>
        <div class="iP2t7d" id="crowd"><h2>Crowd</h2><ul>
        <li class="hpLkke" id="family"><span aria-label="Family-friendly"></span></li>
        <li class="hpLkke" id="safe"><span aria-label="Transgender safespace"></span></li></ul></div>
        <div class="iP2t7d" id="amenities"><ul><li class="hpLkke" id="restroom"><span aria-label="Has gender-neutral restroom"></span></li>
        <li class="hpLkke" id="access"><span aria-label="Has wheelchair accessible entrance"></span></li></ul></div>`,
		'maps/place/cafe',
	);
	for (const id of ['badge-row', 'overview', 'ownership', 'safe']) expect(blocked(doc, `#${id}`)).toBe(true);
	for (const id of ['business', 'review', 'crowd', 'family', 'amenities', 'restroom', 'access'])
		expect(blocked(doc, `#${id}`)).toBe(false);
});

test('Rechecks lazy content and recycled nodes, and restores content after SPA navigation', async () => {
	const doc = load('<div id="badge" class="W6VQef">Identifies as women-owned</div>', 'maps/place/cafe');
	expect(blocked(doc, '#badge')).toBe(true);
	doc.querySelector('#badge')!.textContent = 'Serves coffee';
	doc.body.insertAdjacentHTML('beforeend', '<div class="W6VQef" id="new">LGBTQ+ friendly</div>');
	await settle();
	expect(blocked(doc, '#badge')).toBe(false);
	expect(blocked(doc, '#new')).toBe(true);
	page.history.pushState({}, '', '/search?q=coffee');
	await new Promise(resolve => setTimeout(resolve, 650));
	expect(blocked(doc, '#new')).toBe(false);
});
