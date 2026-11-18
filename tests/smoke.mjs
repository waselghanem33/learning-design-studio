import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

const html = fs.readFileSync('index.html','utf8');
const scripts = [...html.matchAll(/<script\\b[^>]*\\bsrc=["']([^"']+)["']/g)].map(m=>m[1].split('?')[0].replace(/^\\.\\//,''));
const css = [...html.matchAll(/<link\\b[^>]*\\bhref=["']([^"']+\\.css(?:\\?[^"']*)?)["']/g)].map(m=>m[1].split('?')[0].replace(/^\\.\\//,''));
assert(scripts.length >= 5, 'Expected core and feature scripts');
assert(css.length > 0, 'Expected stylesheet');
for(const p of [...scripts,...css]) assert(fs.existsSync(p), 'Missing asset: '+p);
for(const p of scripts) execFileSync(process.execPath,['--check',p],{stdio:'pipe'});
const app=fs.readFileSync('app.js','utf8');
for(const name of ['Acquisition','Inquiry','Discussion','Practice','Collaboration','Production']) assert(app.includes(name),'Missing learning type '+name);
for(const p of ['ai-coach-v14.js','alignment-v15.js','alignment-review-v16.js','user-manual.js','guided-tour.js']) assert(scripts.includes(p),'Feature not loaded: '+p);
console.log('PASS: '+scripts.length+' JavaScript files parsed; '+css.length+' stylesheets present; core features referenced.');
