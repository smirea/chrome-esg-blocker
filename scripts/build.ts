import { watch } from 'node:fs';
import { resolve } from 'node:path';
import type { Rule } from '../src/rule';
import { matchUrl } from '../src/rule';

const root = resolve(import.meta.dir, '..');

async function build() {
	const files = [...new Bun.Glob('**/*.ts').scanSync({ cwd: `${root}/rules` })]
		.filter(file => !file.endsWith('.test.ts') && !file.endsWith('.d.ts'))
		.sort();
	if (!files.length) throw new Error('No rules found');
	const rules: Rule[] = [];
	for (const file of files) {
		const rule: Rule = (await import(`${root}/rules/${file}?build=${Date.now()}`)).default;
		if (!rule.id || !rule.matches?.length || !rule.operations?.length) throw new Error(`Invalid rule: ${file}`);
		if (rules.some(existing => existing.id === rule.id)) throw new Error(`Duplicate rule: ${rule.id}`);
		for (const pattern of rule.matches) matchUrl(pattern, 'https://example.com/');
		rules.push(rule);
	}
	await Bun.write(
		`${root}/src/rules.generated.ts`,
		files.map((file, index) => `import rule${index} from ${JSON.stringify(`../rules/${file}`)};`).join('\n') +
			`\nexport default [${files.map((_, index) => `rule${index}`).join(', ')}];\n`,
	);
	const result = await Bun.build({
		entrypoints: [`${root}/src/index.ts`],
		outdir: `${root}/dist`,
		naming: 'content.js',
		target: 'browser',
		format: 'iife',
		minify: true,
	});
	if (!result.success) throw new AggregateError(result.logs, 'Build failed');
	await Bun.write(
		`${root}/dist/manifest.json`,
		JSON.stringify(
			{
				manifest_version: 3,
				name: 'ESG Blocker',
				version: '0.1.0',
				description: 'Hide ESG badges and emissions panels on supported websites.',
				content_scripts: [
					{
						matches: [...new Set(rules.flatMap(rule => rule.matches))],
						js: ['content.js'],
						run_at: 'document_idle',
					},
				],
			},
			null,
			2,
		) + '\n',
	);
	console.log(`Built ${rules.length} rules into dist/`);
}

await build();
if (process.argv.includes('--watch')) {
	let pending: ReturnType<typeof setTimeout>;
	let running = Promise.resolve();
	for (const directory of ['src', 'rules']) {
		watch(`${root}/${directory}`, { recursive: true }, (_, file) => {
			if (!file?.endsWith('.ts') || file.endsWith('.generated.ts')) return;
			clearTimeout(pending);
			pending = setTimeout(() => {
				running = running.then(build).catch(console.error);
			}, 100);
		});
	}
	console.log('Watching src/ and rules/. Reload the extension and page after a build.');
}
