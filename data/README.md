# Local Runtime Data

`data/` is intentionally local-only for the release repo.

Lantern Garage creates journal entries, conversation logs, RAG cache records,
operator notes, and validation output here while running. Those files can
contain private operator or dream journal data, so they are ignored by Git.

Keep source fixtures, schemas, and public examples outside `data/` unless a
future PR explicitly promotes them with a small manifest and validation path.
