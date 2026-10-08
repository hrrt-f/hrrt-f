// Deterministic state model: no network, timers, or employer code.
export function initialSimulation() {
  return {
    time: 0,
    online: true,
    server: 0,
    poll: 0,
    event: 0,
    pollAttempts: 0,
    pollSuccess: 0,
    eventMessages: 0,
    recoveryReads: 0,
    log: [],
  };
}

export function advance(state, action) {
  if (action === 'reset') return initialSimulation();
  const next = { ...state };

  if (action === 'update') {
    next.server++;
    if (next.online) {
      next.event = next.server;
      next.eventMessages++;
    }
  } else if (action === 'tick') {
    next.time++;
    if (next.time % 3 === 0) {
      next.pollAttempts++;
      if (next.online) {
        next.poll = next.server;
        next.pollSuccess++;
      }
    }
  } else if (action === 'connection') {
    next.online = !next.online;
    if (next.online) {
      // Restore the latest state, without claiming to replay missed events.
      next.event = next.server;
      next.recoveryReads++;
    }
  } else {
    return state;
  }

  next.log = [
    { action, time: next.time, online: next.online, server: next.server },
    ...state.log,
  ].slice(0, 6);
  return next;
}
