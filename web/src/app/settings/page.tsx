"use client";

/**
 * Screen 7 — Settings.
 *
 * Two things only: the OneDrive connection and where the library lives. The
 * connect flow is stubbed — there is no Entra ID app registration behind it — but
 * it is stubbed *honestly*: the panel says what the real flow will ask for and
 * what it will not have access to, because "connect your OneDrive" is the one
 * screen in the prototype that would otherwise imply a permission grant that has
 * not happened.
 */

import { useState } from "react";
import { useStore } from "@/data/store";
import { Panel } from "@/components/primitives";

const FOLDERS = ["OneDrive/Books", "OneDrive/Documents/Library", "OneDrive/Reading/PDFs"];

export default function SettingsPage() {
  const { data, setConnection, reset } = useStore();
  const { connection } = data;
  const [connecting, setConnecting] = useState(false);
  const [folder, setFolder] = useState(connection.library_folder);

  function connect() {
    setConnecting(true);
    // Stands in for the Entra ID consent round-trip.
    window.setTimeout(() => {
      setConnection({
        connected: true,
        account: "gary.kavanagh@outlook.com",
        last_sync: new Date().toISOString(),
      });
      setConnecting(false);
    }, 900);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="border-b border-line pb-5">
        <p className="eyebrow">Settings</p>
        <h1 className="display mt-1 text-3xl font-bold">Where your books live</h1>
        <p className="mt-1.5 text-sm text-muted">
          Marginalia stores a reference to each file, never a copy of it. The PDFs stay in a
          folder you can open in Explorer.
        </p>
      </header>

      {/* ------------------------------------------------- OneDrive connection */}
      <Panel
        eyebrow="Storage"
        title="OneDrive"
        aside={
          <span
            className="inline-flex items-center gap-2 font-mono text-[0.625rem] uppercase"
            style={{ color: connection.connected ? "var(--color-mentions)" : "var(--color-dim)" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: connection.connected
                  ? "var(--color-mentions)"
                  : "var(--color-line-bright)",
              }}
            />
            {connection.connected ? "connected" : "not connected"}
          </span>
        }
      >
        {connection.connected ? (
          <div className="space-y-4">
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[10rem_1fr]">
              <Row label="Account" value={connection.account ?? "—"} />
              <Row label="Library folder" value={connection.library_folder} mono />
              <Row
                label="Last sync"
                value={
                  connection.last_sync
                    ? new Date(connection.last_sync).toLocaleString("en-GB")
                    : "never"
                }
              />
              <Row label="Files tracked" value={`${data.copies.length} PDFs`} />
            </dl>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setConnection({ last_sync: new Date().toISOString() })}
                className="cursor-pointer rounded-md border border-line-bright px-3 py-1.5 font-mono text-[0.6875rem] uppercase hover:border-cites hover:text-cites"
              >
                sync now
              </button>
              <button
                type="button"
                onClick={() =>
                  setConnection({ connected: false, account: null, last_sync: null })
                }
                className="cursor-pointer rounded-md border border-line px-3 py-1.5 font-mono text-[0.6875rem] text-dim uppercase hover:border-idea hover:text-idea"
              >
                disconnect
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Connecting asks Microsoft for read access to one folder — not your whole drive.
              Marginalia reads the PDFs to extract references and writes nothing back.
            </p>
            <button
              type="button"
              onClick={connect}
              disabled={connecting}
              className="cursor-pointer rounded-md px-4 py-2 text-sm font-semibold text-void disabled:opacity-60"
              style={{ background: "var(--color-cites)" }}
            >
              {connecting ? "Waiting for Microsoft…" : "Connect OneDrive"}
            </button>
          </div>
        )}

        <p className="mt-4 rounded-md border border-dashed border-line-bright p-3 text-[0.6875rem] text-dim">
          <strong className="text-muted">Stubbed in the prototype.</strong> No Entra ID app
          registration exists yet, so this button changes local state only. The real flow
          needs a consent screen and a cached refresh token; neither is in scope before you
          have seen these screens.
        </p>
      </Panel>

      {/* ------------------------------------------------------ library folder */}
      <Panel eyebrow="Library" title="Location">
        <p className="mb-3 text-sm text-muted">
          Which OneDrive folder holds your PDFs. Changing it re-points every Copy&apos;s file
          path; notes, highlights and references are unaffected because they hang off the
          Copy, not the path.
        </p>
        <div className="space-y-2">
          {FOLDERS.map((f) => (
            <label
              key={f}
              className={`flex cursor-pointer items-center gap-3 rounded-md border p-2.5 ${
                folder === f ? "border-line-bright bg-raised/60" : "border-line"
              }`}
            >
              <input
                type="radio"
                name="folder"
                checked={folder === f}
                onChange={() => {
                  setFolder(f);
                  setConnection({ library_folder: f });
                }}
                className="accent-[var(--color-cites)]"
              />
              <span className="font-mono text-[0.8125rem]">{f}</span>
              {f === data.connection.library_folder && (
                <span className="ml-auto font-mono text-[0.625rem] text-dim uppercase">
                  current
                </span>
              )}
            </label>
          ))}
        </div>
      </Panel>

      {/* -------------------------------------------------------- file formats */}
      <Panel eyebrow="Formats" title="PDF only">
        <p className="text-sm text-muted">
          PDF is the only supported format. EPUB is out of scope — not queued, not partially
          built. One format means one parser and one set of failure modes, and PDF is the one
          your library is actually in.
        </p>
        <p className="mt-2 text-[0.6875rem] text-dim">
          Scanned PDFs need OCR and are handled separately; the extraction spike will report
          digital-born and scanned as separate numbers rather than a blended average.
        </p>
      </Panel>

      {/* ----------------------------------------------------- prototype state */}
      <Panel eyebrow="Prototype" title="This build">
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[10rem_1fr]">
          <Row label="Data" value="Fixtures in memory — no backend, no database, no auth" />
          <Row
            label="Edges"
            value={`${data.edges.filter((e) => !e.dismissed).length} live, ${
              data.edges.filter((e) => e.dismissed).length
            } dismissed`}
          />
          <Row label="Hosting" value="Azure Static Web Apps, free tier" mono />
          <Row label="Running cost" value="£0" />
        </dl>
        <button
          type="button"
          onClick={reset}
          className="mt-4 cursor-pointer rounded-md border border-line px-3 py-1.5 font-mono text-[0.6875rem] text-dim uppercase hover:border-cites hover:text-cites"
        >
          reset to seeded state
        </button>
        <p className="mt-2 text-[0.6875rem] text-dim">
          Nothing persists across a page reload — every edit you make is thrown away, which
          is deliberate at this stage.
        </p>
      </Panel>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <>
      <dt className="eyebrow pt-0.5">{label}</dt>
      <dd className={`text-sm ${mono ? "font-mono text-[0.8125rem]" : ""} text-muted`}>
        {value}
      </dd>
    </>
  );
}
