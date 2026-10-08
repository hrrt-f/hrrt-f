import test from 'node:test';
import assert from 'node:assert/strict';
import {advance,initialSimulation} from './simulation.mjs';
const ticks=(s,n)=>Array.from({length:n}).reduce(s=>advance(s,'tick'),s);
test('events deliver immediately; polling waits for its boundary',()=>{
 const s=advance(initialSimulation(),'update');assert.equal(s.event,1);assert.equal(s.poll,0);
 assert.equal(ticks(s,2).poll,0);const p=ticks(s,3);assert.equal(p.poll,1);assert.equal(p.pollSuccess,1);
});
test('idle time still polls without fabricating events',()=>{const s=ticks(initialSimulation(),6);assert.equal(s.pollAttempts,2);assert.equal(s.eventMessages,0)});
test('lost events recover through a fresh read, polling waits; failed reads count',()=>{
 let s=advance(initialSimulation(),'connection');s=advance(s,'update');s=ticks(s,3);
 assert.equal(s.pollAttempts,1);assert.equal(s.pollSuccess,0);assert.equal(s.eventMessages,0);assert.equal(s.event,0);
 s=advance(s,'connection');assert.equal(s.event,1);assert.equal(s.recoveryReads,1);assert.equal(s.poll,0);
 s=ticks(s,3);assert.equal(s.poll,1);assert.equal(s.pollSuccess,1);
});
test('reset clears all counters and disconnected state without mutating prior state',()=>{const original=initialSimulation();const changed=advance(original,'update');assert.equal(original.server,0);assert.deepEqual(advance(changed,'reset'),initialSimulation())});
