"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [connected, setConnected] = useState(false);

  return (
    <div className="flex max-w-xl flex-col gap-8">
      <h1 className="text-xl font-semibold text-ink">Settings</h1>

      <section className="rounded-xl border border-line px-6 py-5">
        <h2 className="text-sm font-semibold text-ink">OneDrive</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Marginalia reads your PDFs from OneDrive — it stores a file reference, not the bytes.
        </p>
        <div className="mt-4 flex items-center justify-between rounded-lg bg-paper-sunken px-4 py-3">
          <div>
            <p className="text-sm font-medium text-ink">
              {connected ? "Connected" : "Not connected"}
            </p>
            {connected && <p className="text-xs text-ink-muted">you@example.com</p>}
          </div>
          <button
            type="button"
            onClick={() => setConnected((c) => !c)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              connected
                ? "border border-line text-ink hover:bg-paper-raised"
                : "bg-accent text-white hover:bg-accent-ink"
            }`}
          >
            {connected ? "Disconnect" : "Connect OneDrive"}
          </button>
        </div>
        <p className="mt-2 text-xs text-ink-faint">Stubbed in this prototype — no real OAuth flow runs.</p>
      </section>

      <section className="rounded-xl border border-line px-6 py-5">
        <h2 className="text-sm font-semibold text-ink">Library location</h2>
        <p className="mt-1 text-sm text-ink-muted">Where in OneDrive your book files live.</p>
        <input
          defaultValue="OneDrive/Marginalia/Library"
          disabled
          className="mt-3 w-full rounded-md border border-line bg-paper-sunken px-3 py-2 text-sm text-ink-muted"
        />
        <p className="mt-2 text-xs text-ink-faint">
          Not editable in this prototype — this is fixed until the real backend exists.
        </p>
      </section>
    </div>
  );
}
