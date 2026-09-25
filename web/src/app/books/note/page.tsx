import { Suspense } from "react";
import { NoteEditorClient } from "./NoteEditorClient";

export default function NoteEditorPage() {
  return (
    <Suspense fallback={null}>
      <NoteEditorClient />
    </Suspense>
  );
}
