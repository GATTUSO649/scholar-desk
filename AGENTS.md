<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Student/admin data is read and written from the browser client with row-level security as the guard; admin rights come only from the `user_roles` table via `has_role` (why: keeps one source of truth for access).
- Signed-in pages live under `src/routes/_authenticated/` with a shared sidebar shell; admin pages wrap content in `AdminGate` (why: UI gating only, the database policies enforce access).
- Uploaded files go to the private `assignment-files` bucket under `<studentId>/<requestId>/` (why: folder-based storage policies).
