import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/data/store";
import { Chrome } from "@/components/Chrome";

export const metadata: Metadata = {
  title: "Marginalia — prototype",
  description:
    "Book notes with a reference graph between them. Clickable prototype, fixture data.",
};

export const viewport: Viewport = {
  themeColor: "#0d0f13",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <Chrome>{children}</Chrome>
        </StoreProvider>
      </body>
    </html>
  );
}
