# 🔐 Run Verification System — Patch Notes

A full **verification system** for logged runs is now live. Players can request verification, admins review and approve or deny, and super admins can add or remove verification on any run. Run owners get in-app notifications for every verification decision.

---

## 📋 **Overview**

- **Run owners** can request verification when logging or editing a run (with proof required).
- **Admins** see a pending verification queue, can approve or deny with a reason, and can submit any run for verification.
- **Super admins** can add a verified checkmark to any run or remove verification from any run (including their own).
- **Everyone** sees verified runs with a blue checkmark on leaderboards and run lists; run detail shows a “Pending verification” state when a run is awaiting review.

---

## ✨ **For Players**

### Requesting verification
- When **creating** or **editing** a run (challenge or Easter egg), you can check **“Request verification.”**
- You must add **at least one proof** (URL or screenshot) to request verification; otherwise the form will ask you to add proof or uncheck the box.
- After saving, your run appears as **“Pending verification”** on the run detail page (amber badge with clock icon).
- When an admin **approves**, the run becomes **verified** (blue “Verified run” badge) and you get a notification: *“Your run was verified.”*
- When an admin **denies**, the run stays unverified and you get a notification that includes **who denied it** and their reason, e.g. *“Denied by [Admin Name]: Proof link is private.”*

### Notifications
- **Verification approved** — Your run was verified.
- **Verification denied** — Message includes the admin’s name and reason.
- **Verification removed** — A super admin removed the verified checkmark from your run; you see *“Your run’s verification was removed.”*
- In the **notification dropdown** (bell icon) you can:
  - **Mark all read** — Marks every notification as read.
  - **Clear all** — Deletes all of your notifications (with confirmation in behavior; list clears and unread count resets).

### Where you see “verified”
- **Run detail page** — “Verified run” badge in the hero when the run is verified; “Pending verification” when it’s awaiting review.
- **Leaderboards** (map and global) — Verified runs show a **blue checkmark** next to the player name on every screen size.
- **Your Runs** (map page tab) and **user profile run lists** — Each verified run has the same blue checkmark next to the run name.

---

## 👑 **For Admins**

### Pending verification queue
- On your **profile** (when logged in as admin), you’ll see tabs: **Pending Co-Op Runs** and **Pending Verification**.
- **Pending Verification** lists all runs that have requested verification and are not yet approved or denied (excluding **your own** runs).
- Clicking a run **opens it in a new tab** so you stay on the queue; from there you can approve or deny.

### On a run pending verification
- You’ll see **“Admin: approve or deny verification”** with two actions:
  - **Approve Verification** — Marks the run as verified, clears “pending,” and notifies the run owner.
  - **Deny Verification** — Opens a modal where you **must enter a reason**. The run stays unverified, the request is cleared, and the run owner gets a notification: *“Denied by [Your Display Name]: [your reason].”*
- You **cannot approve or deny your own runs**; your own runs do not appear in the pending verification list.

### Submitting a run for verification (any admin)
- On **any run** that is **not** verified and **not** already pending, you’ll see **“Admin: submit this run for verification.”**
- Click **Submit for verification** → a confirmation modal: *“Submit this run for verification? It will be added to the pending verification queue for admin review.”*
- Confirm → the run is added to the pending queue (as if the owner had requested it). Only admins see this button and modal.

---

## 🛡️ **For Super Admins**

### Add verification
- On any run that is **not** verified, you’ll see **“Super admin: add verification to this run”** with an **Add verification** button.
- Click → modal: *“Add verification to this run? The run owner will be notified.”* → **Yes, add verification** / **No**.
- The run is marked verified and the owner gets a “Your run was verified” notification.  
- You **cannot add verification to your own runs** (API will reject; button is not shown on your own runs).

### Remove verification
- On **any verified run** (including your own), you’ll see **“Super admin: remove verification”** with a **Remove verification** button (white text, red-tinted border).
- Click → verification is removed; the run owner gets a **VERIFICATION_REMOVED** notification (*“Your run’s verification was removed”*).
- If the notification fails to create (e.g. backend issue), the run is still unverified and the action no longer shows an internal server error to you.

---

## 🔧 **Technical / UX Fixes Included**

- **Deny vs approve** — Deny button and API correctly deny (clear request, send denial notification); no longer any mix-up with approve.
- **Remove verification** — Super admin can remove verification even when viewing their own run; button text is white for readability.
- **Notifications** — New type `VERIFICATION_REMOVED`; dropdown shows “Mark all read” and “Clear all” at the bottom when you have notifications; success feedback after deny/remove/add/submit.
- **Verified checkmark** — Shown on all leaderboard entries and “Your Runs” / user map runs, with `flex-shrink-0` and min-width so it stays visible on all screen widths.
- **Run detail** — “Verified” badge appears only once (in the hero); “Pending verification” appears only once (in the hero) and disappears when the run is approved or denied.
- **Edit page** — `requestVerification` added to challenge form type so production build succeeds.

---

## 📌 **Summary**

| Who            | Can do what |
|----------------|-------------|
| **Run owner**  | Request verification (with proof), see pending/verified state and notifications. |
| **Admin**      | See pending queue (excluding own runs), approve/deny with reason, submit any run for verification. |
| **Super admin**| Add verification to any run (except own), remove verification from any run (including own). |
| **Everyone**   | See verified checkmarks on leaderboards and run lists; run detail shows pending or verified. |

If you run into any edge cases or want different wording in notifications, we can adjust in a follow-up patch.
