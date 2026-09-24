"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/data/store";
import { hubs, inboundReferenceCount, isOwned } from "@/data/selectors";

const NAV = [
  { href: "/", label: "Library" },
  { href: "/graph", label: "Graph" },
  { href: "/concepts", label: "Concepts & tags" },
  { href: "/search", label: "Search" },
  { href: "/settings", label: "Settings" },
];

export function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data, reset } = useStore();

  const owned = data.copies.length;
  const unowned = data.works.filter((w) => !isOwned(data, w.id)).length;
  const topHub = hubs(data, 1)[0];

  return (
    <div className="relative z-10 min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-page/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center gap-6 px-5 py-3">
          <Link href="/" className="group flex items-baseline gap-2">
            <span className="display text-xl font-bold tracking-tight">Marginalia</span>
            <span className="font-mono text-[0.625rem] tracking-widest text-dim uppercase">
              prototype
            </span>
          </Link>

          <nav className="flex flex-1 items-center gap-1">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                    active ? "text-paper" : "text-dim hover:text-muted"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span
                      className="absolute inset-x-2.5 -bottom-[13px] h-[2px]"
                      style={{ background: "var(--color-cites)" }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-4 font-mono text-[0.6875rem] text-dim lg:flex">
            <span>
              <span className="text-paper">{owned}</span> owned
            </span>
            <span>
              <span className="text-paper">{unowned}</span> referenced
            </span>
            {topHub && (
              <span title="Most-referenced work in the graph">
                hub:{" "}
                <span style={{ color: "var(--color-cites)" }}>
                  {topHub.work.cover.glyph}
                </span>{" "}
                ×{inboundReferenceCount(data, topHub.work.id)}
              </span>
            )}
            <button
              type="button"
              onClick={reset}
              className="cursor-pointer text-dim uppercase hover:text-paper"
              title="Reset the prototype to its seeded state"
            >
              reset
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-5 py-7">{children}</main>

      <footer className="mx-auto max-w-[1400px] px-5 pb-10 text-[0.6875rem] text-dim">
        Clickable prototype — fixture data, no backend, no auth. Reference evidence is
        plausible rather than verified. Static export on Azure Static Web Apps free tier.
      </footer>
    </div>
  );
}
