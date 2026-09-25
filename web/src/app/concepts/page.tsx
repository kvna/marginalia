import { Suspense } from "react";
import { ConceptsClient } from "./ConceptsClient";

export default function ConceptsPage() {
  return (
    <Suspense fallback={null}>
      <ConceptsClient />
    </Suspense>
  );
}
