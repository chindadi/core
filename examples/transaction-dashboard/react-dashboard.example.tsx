/**
 * React transaction status dashboard example (#708).
 *
 * Copy this pattern into your app. It subscribes to a
 * `TransactionStatusAggregator` (live metrics + chart data) and renders
 * success rate, fee analysis, status distribution, and recent transactions.
 *
 * User-facing strings are routed through src/shared/i18n.ts so translators
 * and extraction tooling can discover every message key in one place.
 */
import { useEffect, useState } from "react";
import {
  TransactionStatusAggregator,
  streamTransactionStatus,
  type DashboardSnapshot,
} from "../../src/transaction/transactionDashboard";
import type { TransactionResult } from "../../src/transaction/types";
import { createI18n } from "../../src/shared/i18n";

const i18n = createI18n({ locale: "en" });

export const dashboard = new TransactionStatusAggregator({ maxEntries: 1000 });

// Poll your transaction source and fan out to all subscribers.
export function startLiveUpdates(fetchRecent: () => Promise<TransactionResult[]>): () => void {
  const handle = streamTransactionStatus(fetchRecent, dashboard, { intervalMs: 5000 });
  return () => handle.stop();
}

export function TransactionStatusDashboard({ aggregator = dashboard }: { aggregator?: TransactionStatusAggregator }) {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(() => aggregator.getSnapshot());

  useEffect(() => aggregator.subscribe(setSnapshot), [aggregator]);

  const unavailable = i18n.t("ui.dashboard.unavailable");

  return (
    <section aria-label="Transaction status dashboard">
      <header>
        <h2>
          {i18n.t("ui.dashboard.heading")} ({snapshot.metrics.total})
        </h2>
        <p>
          {i18n.t("ui.dashboard.success_rate")}: {(snapshot.metrics.successRate * 100).toFixed(1)}%
          {" · "}
          {i18n.t("ui.dashboard.avg_fee")}: {snapshot.metrics.avgFee ?? unavailable}
          {" · "}
          {i18n.t("ui.dashboard.avg_confirmation")}:{" "}
          {snapshot.metrics.avgProcessingTimeMs !== null
            ? `${Math.round(snapshot.metrics.avgProcessingTimeMs)}ms`
            : unavailable}
        </p>
      </header>
      <ul>
        {snapshot.charts.statusDistribution.map((s) => (
          <li key={s.label}>
            {s.label}: {s.value}
          </li>
        ))}
      </ul>
      <ol>
        {snapshot.recent.map((entry) => (
          <li key={entry.tx.hash}>
            {entry.tx.hash.slice(0, 8)}… — {entry.tx.status} ({entry.category})
          </li>
        ))}
      </ol>
    </section>
  );
}
