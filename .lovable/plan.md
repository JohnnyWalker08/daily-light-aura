# Restore the complete multi-translation Bible reader

## Confirmed causes

- The two screenshots show different reader toolbars: the reduced state has only Note and Mark Read, while the complete state also has Translation and Compare. The current source contains all four controls, so the restored layout must be made stable and verified in the live mobile view rather than relying on a historical preview state.
- Lovable Cloud is currently paused. That is why auth, chapter-table, and Bible function requests are returning `Failed to fetch`.
- A failed version-list request is currently treated as proof that licensed translations are unavailable. The picker then disables them and incorrectly says publisher approval is pending, even when the backend is merely paused or unreachable.
- The deployed Bible function could not be tested while Cloud is paused. Its source lists only the first returned page of English versions and does not request the complete catalog, so availability can also be undercounted.
- Mobile intentionally hides the Compare label and other action labels, making important controls look like anonymous icons.

## Implementation

1. **Recover and verify the backend**
   - Resume Lovable Cloud and wait until database, auth, and functions report healthy.
   - Test the deployed `bible-text` function with the stored YouVersion key for the version catalog and real passages in NIV, NKJV, NLT, ESV, and GNT.
   - Inspect function logs and response bodies before changing provider parsing, so fixes match the provider's actual responses.

2. **Stop false licensing locks**
   - Replace the current binary `available/locked` model with explicit states: checking, verified available, temporarily unreachable, and genuinely rejected.
   - Never disable a listed translation merely because catalog discovery failed. Allow selection and verify availability using the actual passage request.
   - Remove the inaccurate “awaiting publisher approval” copy. Show a useful retry/error state only when a passage request is genuinely rejected.
   - Preserve the last successfully verified translation catalog locally so a temporary outage does not collapse the app back to KJV-only.

3. **Correct catalog discovery and passage loading**
   - Update the Bible function to request the complete English catalog and follow provider pagination when present.
   - Normalize version IDs from the live response and match them against the app registry without assuming the first response page is complete.
   - Keep the shared server-side provider key as the default; personal device keys remain optional overrides, not a requirement to use already licensed shared translations.
   - Return structured provider errors so invalid requests, temporary outages, and true access denial are distinguishable.

4. **Restore a stable mobile reader toolbar**
   - Keep Translation and Compare visible in every reader state and viewport, with readable labels on mobile.
   - Rework the compact action row so Translation, Compare, Note, and Mark Read fit without disappearing or colliding with the floating settings control.
   - Keep the selected translation visibly attached to the chapter heading and retain side-by-side comparison, verse comparison, bookmarks, highlights, and review actions.

5. **Make dependent translation features consistent**
   - Apply the same resilient availability model to the translation picker, comparison picker, verse peek, cross-translation search, and offline packs.
   - Ensure cached chapters remain readable offline even when provider/catalog checks cannot run.
   - Clear stale negative availability data after recovery while retaining successfully cached Bible text.

## Validation

- Verify the mobile reader at the supplied 450 × 813 viewport: all four toolbar actions are visible, named, tappable, and non-overlapping.
- Switch John 1 among KJV, NIV, NKJV, NLT, ESV, and GNT and confirm real verse text and the correct version badge.
- Verify Compare and per-verse comparison with two licensed translations.
- Simulate an unavailable backend and confirm translations are not falsely marked unlicensed and cached chapters still open.
- Verify cross-translation search and an offline pack use the same enabled translation set.
- Run the relevant tests/build checks and inspect browser console/network output for repeated auth refreshes or failed Bible requests.

## Technical scope

- Reader toolbar and picker components.
- Translation registry, availability cache, and chapter loader.
- `bible-text` Lovable Cloud function and its deployment.
- No redesign of unrelated pages and no removal of existing reading, review, bookmark, highlight, or offline features.