#!/usr/bin/env node
import readline from 'node:readline';
import { createCliRunner } from './runner';

const args = process.argv.slice(2);
const jsonOnly = args.includes('--json-only');

const runner = createCliRunner({
  jsonOnly,
  log: (message) => {
    process.stderr.write(`${message}\n`);
  },
});

const rl = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
});

rl.on('line', (line) => {
  const result = runner.handleLine(line);
  if (!result) {
    return;
  }
  process.stdout.write(`${JSON.stringify(result)}\n`);
});
