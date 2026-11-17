import { resolve } from 'node:path';

// Older Bun has no built-in `bun check`, so `bun check --no-script` would run the package's `check` script, which calls
// this one again and loops forever.
const minimum = '1.4.4';
if (!Bun.semver.satisfies(Bun.version, `>=${minimum}`)) {
	throw new Error(
		`Type checking needs Bun ${minimum} or newer for \`bun check\`; found ${Bun.version}. Run \`bun upgrade\`.`,
	);
}

const cwd = resolve(import.meta.dir, '..');
for (const command of [
	['bun', 'scripts/build.ts'],
	['bun', 'check', '--no-script'],
]) {
	const { exitCode } = Bun.spawnSync(command, { cwd, stdio: ['inherit', 'inherit', 'inherit'] });
	if (exitCode !== 0) process.exit(exitCode);
}
