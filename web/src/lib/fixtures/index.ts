import type { Library } from "@/lib/types";
import { authors } from "./authors";
import { works, copies } from "./works";
import { tags } from "./tags";
import { concepts } from "./concepts";
import { notes, highlights } from "./notes";
import { edges } from "./edges";

export const initialLibrary: Library = {
  authors,
  works,
  copies,
  tags,
  concepts,
  notes,
  highlights,
  edges,
};
