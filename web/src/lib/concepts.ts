/**
 * The `[[concept]]` convention. Lives in its own module because it is the one
 * piece of note syntax that is really a foreign key — the editor, the markdown
 * renderer and the save path all have to agree on exactly what counts as a link,
 * and it is worth testing without dragging React in.
 */

/** Pulls `[[Concept name]]` out of a markdown body, de-duplicated, in order. */
export function extractConceptLinks(body: string): string[] {
  const out: string[] = [];
  const re = /\[\[([^\]\n]+)\]\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const name = m[1]?.trim();
    if (name && !out.includes(name)) out.push(name);
  }
  return out;
}
