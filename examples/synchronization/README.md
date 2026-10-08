# Synchronization lab

A small, deterministic JavaScript model of two ways to keep a screen up to date: periodic polling and event-driven updates. It also models the case that matters after a connection drops: fetching current state to recover missed changes.

This is an independent educational example extracted from my local portfolio lab. It contains no employer source, product data, or measurements. It is not a WebSocket client or a production-ready synchronization library.

## Run the tests

Node.js 22 or later; no dependencies or installation required.

```sh
git clone https://github.com/hrrt-f/hrrt-f.git
cd hrrt-f
node --test examples/synchronization/simulation.test.mjs
```

## The model

| Action | Behavior |
| --- | --- |
| `update` | Increment the server version; deliver an event only while online |
| `tick` | Advance simulated time by one step; poll every third step |
| `connection` | Toggle connectivity; on reconnect, refresh the event-driven view from server state |
| `reset` | Restore the initial state and clear counters |

```js
import { advance, initialSimulation } from './simulation.mjs';

let state = initialSimulation();
state = advance(state, 'connection'); // disconnect
state = advance(state, 'update');     // change missed by the client
console.log(state.server, state.event); // 1, 0
state = advance(state, 'connection'); // reconnect and read current state
console.log(state.server, state.event, state.recoveryReads); // 1, 1, 1
```

## Tradeoffs illustrated

Polling can perform reads even when nothing has changed. Events can deliver a change promptly, but a disconnected client can miss them. In this model, a fresh read on reconnection restores current state; it does not replay every intermediate event.

Neither approach is universally better. Real systems must consider ordering, authorization, duplicate delivery, reconnect backoff, a race between subscribing and reading state, and what happens if recovery fails. Those concerns are deliberately outside this small model. Counters represent simulated operations, not bandwidth, production latency, or a benchmark.

## Verified scenarios

- Immediate event delivery versus the next polling boundary.
- Polling during idle time without inventing events.
- Missed events and failed polling attempts while offline.
- Recovery through a fresh read after reconnecting.
- Reset behavior without mutating the original state.

## Em português

Simulação independente de polling, eventos e recuperação de estado após desconexão. O relógio avança manualmente; não há rede real. Execute os testes com o comando acima. O objetivo é tornar a decisão e suas limitações verificáveis, sem apresentar a demonstração como medição de um sistema em produção.
