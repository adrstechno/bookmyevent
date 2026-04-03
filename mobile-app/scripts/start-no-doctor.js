const { spawn } = require('node:child_process');

const args = process.argv.slice(2);
const command = 'npx';

process.env.EXPO_NO_DOCTOR = '1';
process.env.EXPO_DOCTOR_SKIP_DEPENDENCY_VERSION_CHECK = '1';

const child = spawn(command, ['expo', 'start', ...args], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('error', (error) => {
  console.error('Failed to start Expo:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(typeof code === 'number' ? code : 1);
});
