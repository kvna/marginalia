import { Suspense } from "react";
import { BookDetailClient } from "./BookDetailClient";

export default function BooksPage() {
  return (
    <Suspense fallback={null}>
      <BookDetailClient />
    </Suspense>
  );
}
