import { spawn } from 'node:child_process';

const commands = [
  ['api', ['run', 'dev:api']],
  ['web', ['run', 'dev:web']]
];
const children = commands.map(([name, args]) => {
  const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, {
    stdio: 'inherit',
    shell: false,
    env: process.env
  });
  child.on('exit', (code) => {
    if (code && !shuttingDown) {
      console.error(`${name} exited with status ${code}`);
      terminate();
      process.exitCode = code;
    }
  });
  return child;
});
let shuttingDown = false;
function terminate() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) if (!child.killed) child.kill('SIGTERM');
}
process.on('SIGINT', terminate);
process.on('SIGTERM', terminate);
