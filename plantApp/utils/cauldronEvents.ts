export interface Sample { ts: number; pct: number }
export interface CollectionEvent { ts: number; amountPct: number }
export interface Ticket { id: string; ts: number; amountPct: number }

export interface ReconcileResult {
  matched: Array<{ event: CollectionEvent; ticket: Ticket }>; 
  missingTickets: Ticket[]; // have ticket but no detected event
  missingEvents: CollectionEvent[]; // detected event but no ticket
}

// Simple drop-based event detection: if percent drops by >= dropThresholdPct between any two consecutive samples
// and at least minGapMs elapsed since last detected event, create a CollectionEvent with that delta.
export function detectEvents(samples: Sample[], dropThresholdPct = 12, minGapMs = 60_000): CollectionEvent[] {
  const events: CollectionEvent[] = [];
  let lastEventTs = -Infinity;
  for (let i = 1; i < samples.length; i++) {
    const prev = samples[i - 1];
    const cur = samples[i];
    const delta = prev.pct - cur.pct; // drop is positive when decreasing
    if (delta >= dropThresholdPct && cur.ts - lastEventTs >= minGapMs) {
      events.push({ ts: cur.ts, amountPct: Math.round(delta) });
      lastEventTs = cur.ts;
    }
  }
  return events;
}

export function reconcile(events: CollectionEvent[], tickets: Ticket[], timeWindowMs = 5 * 60_000, amountTolerancePct = 8): ReconcileResult {
  const matched: Array<{ event: CollectionEvent; ticket: Ticket }> = [];
  const unmatchedEvents: CollectionEvent[] = [...events];
  const unmatchedTickets: Ticket[] = [...tickets];

  for (let i = unmatchedEvents.length - 1; i >= 0; i--) {
    const ev = unmatchedEvents[i];
    const idx = unmatchedTickets.findIndex((t) => {
      const timeOk = Math.abs(t.ts - ev.ts) <= timeWindowMs;
      const amtOk = Math.abs(t.amountPct - ev.amountPct) <= amountTolerancePct;
      return timeOk && amtOk;
    });
    if (idx !== -1) {
      const t = unmatchedTickets.splice(idx, 1)[0];
      matched.push({ event: ev, ticket: t });
      unmatchedEvents.splice(i, 1);
    }
  }

  return { matched, missingTickets: unmatchedTickets, missingEvents: unmatchedEvents };
}
