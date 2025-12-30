---
description: Push changes to GitHub and verify functionalities on Vercel
---

1. Check for any uncommitted changes
// turbo
2. Add all changes to staging
   `git add .`
3. Commit changes (User should provide message, or use default "chore: update")
   `git commit -m "chore: update and deploy"` 
   *(Note: Ideally, ask user for commit message if not provided)*
// turbo
4. Push changes to main branch
   `git push`
5. Notify user that deployment has started and wait for ~60 seconds to allow Vercel to build.
6. Open Browser to Production URL
   `https://senteng.co/`
7. Verify Critical Paths:
   - Check Console for Errors (F12)
   - Navigate to modified pages (e.g., Material Calculator)
   - Perform a smoke test (add a record, check calculation)
8. Report status to user.
