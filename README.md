# ESG Blocker

A local Chrome extension that hides political, social-cause, and environmental badges unrelated to choosing a product. It starts with English-language Google Flights and Google Maps on `google.com`.

- **Flights:** removes the CO2e column, average/percentage emissions comparisons, emissions filter and sort option, and emissions/contrail rows in expanded flight details.
- **Maps:** removes ownership and identity badges from results, place information, and About attributes. Empty badge rows and sections disappear with their headings. Mixed sections retain their other attributes.

Rules hide entire layout elements with `display: none`, so adjacent content can use the space. The page keeps its DOM nodes and event handlers. Updates apply as results load and as you navigate within the site.

Business names, reviews, descriptions, prices, schedules, accessibility, food options, and amenities remain intact. This is a set of site-specific rules, not a classifier for every political phrase or image on the web. Google's DOM changes and other languages will need additional rules.

## Install

```sh
bun install
bun run build
```

Open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select this repo's `dist` folder. Refresh any already-open Flights or Maps tabs. Keep the folder in place; Chrome loads the extension from it.

For changes, run `bun run build`, click the extension's reload button, then refresh the website. `bun run dev` rebuilds when files change or rules are added or removed; Chrome still needs that reload. Disable or remove the extension in Chrome and refresh the page to restore the original appearance.

## Rules

Every `rules/**/*.ts` file exports one `Rule`. The build discovers them automatically, bundles them into `dist/content.js`, and derives the manifest's website access from their URL patterns. Test files and declaration files are excluded. No registry to maintain.

See [AGENTS.md](AGENTS.md) for the operations and DOM investigation workflow. Run `bun run check` and `bun test` to check a change.

The extension runs locally with no server, telemetry, remote rule downloads, account, or API key. Its only website access is the content-script URL patterns in the generated manifest.

## Browser findings, September 17, 2026

Inspected [FLL to New York results](https://www.google.com/travel/flights?q=Flights%20from%20Fort%20Lauderdale%20to%20New%20York%20on%20October%2020%202026%20one%20way&hl=en), including expanded flights, All filters, and the sort menu. Observed CO2e amounts, average and percentage emissions comparisons, “Less emissions only,” emissions sorting, and “Contrail warming potential: Medium.”

Inspected [Austin coffee search results](https://www.google.com/maps/search/women+owned+coffee+Austin/) and [Dear Diary Coffee](https://www.google.com/maps/search/Dear+Diary+Coffee+Austin/), including Overview and About. Observed “Identifies as women-owned,” “Identifies as LGBTQ+ owned,” “LGBTQ+ friendly,” and “Transgender safespace.” Rules also recognize other ownership labels listed in `google-maps.ts`; those variants were not all observed during this check.

The same place lists gender-neutral restrooms, wheelchair access, vegan and vegetarian options, and organic dishes. Those describe facilities or products and stay visible under this project's definition. Review excerpts mentioning ownership also stay intact rather than losing the accompanying product feedback.
