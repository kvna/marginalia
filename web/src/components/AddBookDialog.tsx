"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLibrary } from "@/lib/store";
import { Modal } from "./Modal";
import { TagPicker } from "./TagPicker";

export function AddBookDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { library, addCopy, addTag } = useLibrary();
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [year, setYear] = useState("");
  const [fileName, setFileName] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);

  function reset() {
    setTitle("");
    setAuthorName("");
    setYear("");
    setFileName("");
    setTagIds([]);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !authorName.trim()) return;
    const work = addCopy({
      title: title.trim(),
      authorName: authorName.trim(),
      year: Number(year) || new Date().getFullYear(),
      tagIds,
      fileName,
    });
    handleClose();
    router.push(`/books?id=${work.id}`);
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add a book">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
            className="rounded-md border border-line bg-paper-raised px-3 py-1.5 outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Author</span>
          <input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
            className="rounded-md border border-line bg-paper-raised px-3 py-1.5 outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Year</span>
          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            inputMode="numeric"
            placeholder={String(new Date().getFullYear())}
            className="rounded-md border border-line bg-paper-raised px-3 py-1.5 outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">File</span>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
            className="text-xs text-ink-muted file:mr-3 file:rounded-md file:border file:border-line file:bg-paper-sunken file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink"
          />
          <span className="text-xs text-ink-faint">PDF only — the prototype does not read the file.</span>
        </label>
        <div className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Tags</span>
          <TagPicker allTags={library.tags} selectedIds={tagIds} onChange={setTagIds} onCreate={addTag} />
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-muted hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-ink"
          >
            Add book
          </button>
        </div>
      </form>
    </Modal>
  );
}
