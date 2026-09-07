# MyMatchIQ Recovery Status

Date: 2026-09-06

## Protected sources

- Official permanent repository: `hwy99signs/MyMatchIQ`.
- Legacy MyMatchIQ repository: `hwy99signs/mymatchiq-coming-soon`.
- Locked legacy baseline branch: `lock/mymatchiq-coming-soon-baseline-20260906`.
- Last intact historical React shell inspected: commit `29fef13f4cfd06f0c2156f47a3e4d245065de645`.
- Existing Neon project reused: `MyMatchIQ` (`divine-unit-50379070`).
- Neon pre-migration backup branch: `backup-pre-migration-20260906`.
- Neon working branch: `migration-neon-cloudflare-20260906`.

## Recovery conclusion

The legacy MyMatchIQ history contains the approved marketing/coming-soon shell, including the MyMatchIQ identity, multilingual framework, privacy/consent positioning, Single Scan / Dual Scan references, and `Clarity Before Connection` language.

The full Compatibility Passport application source (assessment screens, real scoring engine, complete authenticated product UI, account/privacy screens, and full Single/Dual Scan application flow) was not found in the available MyMatchIQ GitHub repositories or searched File Library material during this recovery pass.

Repositories named `datingapp` and `dating-website` were inspected and rejected as restoration sources because they implement different products, including couple games and/or traditional dating discovery/chat behavior that conflicts with the locked MyMatchIQ product rules.

No replacement UI has been invented. No redesign has been performed.

## Backend migration completed on isolated Neon branch

The migration branch contains Neon Auth plus the `mymatchiq` schema for:

- Profiles and tier/locale/verification state
- Compatibility Passports
- Assessment questions and answers
- Single/Dual scan records
- Dual Scan invitations and consent events
- Compatibility results
- Verification records
- User-controlled compatibility shares
- Connection acceptance
- One2OneLove handoff state
- Notification preferences
- Legal acceptances
- Audit events

Core indexes, timestamps, and Dual Scan readiness checks are installed.

## QA completed

Two isolated Neon Auth QA users were created. Verified database behavior includes:

- Dual Scan blocked when one Compatibility Passport is incomplete
- Dual Scan ready after both passports are complete and an unexpired invitation is accepted
- Expired invitation remains not ready
- Compatibility result persistence and authorization data model
- Verified-state persistence
- Compatibility-sharing persistence
- Accepted connection -> ready One2OneLove handoff persistence

The compatibility score used in QA is explicitly a persistence fixture only. It does not represent or replace the approved scoring algorithm, which has not been recovered.

## Cloudflare preparation

A Cloudflare Worker backend is being prepared in this branch using Neon as the database. The repository intentionally contains no database password. `DATABASE_URL` must be stored as a Cloudflare secret at deployment time.

Actual production Cloudflare deployment must not occur until the approved full frontend source is recovered/restored and the Worker passes validation.
