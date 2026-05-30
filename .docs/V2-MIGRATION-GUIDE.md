# V2 Migration Guide — For Existing Users

V2 adds public profiles, an Explore page, friends, groups, and notifications.
This guide explains what changes for existing accounts and data.

## Your projects are PRIVATE by default

**All existing projects were set to `PRIVATE` during the V2 migration.** Nothing
you already had became publicly visible. A private project:

- does **not** appear on the Explore page,
- does **not** show on your public profile,
- is only visible to you and members you invite.

### Make a project public

To list a project on Explore and your public profile:

1. (UI for toggling visibility ships with the project settings surface; until
   then, visibility can be set via the API.)
2. Set `visibility: "PUBLIC"` on the project.

Only flip projects to PUBLIC that you intend the world to see — names,
descriptions, tags, member counts, and the owner's public profile become
visible to everyone.

## Your profile is partly public

A new **public profile** lives at `/users/<your-id>`. By default:

| Field | Public by default? |
|-------|--------------------|
| Display name | Yes |
| Avatar | Yes |
| Tags | Yes |
| Bio | No |
| Email | No |

Change these anytime in **Settings → Profile visibility**. Your email is
**never** searchable and is hidden by default.

## Set up your profile

If you haven't set a **display name**, you'll see a one-time prompt on the
dashboard. Adding a display name + bio makes you discoverable in Explore,
Friends, and Groups. You appear as "Anonymous" until you set a display name.

## Friends & Groups

- **Friends**: send/accept requests from any public profile or the `/friends`
  page. You can block/unblock users. Mutual friends show on profiles.
- **Groups**: create or join groups at `/groups`. Group rosters (including
  member emails) are only visible to **active members** — non-members see a
  redacted view.

## Notifications

- A **bell icon** in the top bar shows unread notifications (friend requests,
  invites, @mentions, group activity) with live updates.
- **Email digests** are **OFF by default**. Opt in at **Settings → Email digest**
  (DAILY or WEEKLY). Every digest email includes a one-click unsubscribe link.
  *(Note: digest email delivery requires an email provider to be configured;
  until then digests are generated but not sent.)*

## Privacy summary

- Existing projects: PRIVATE (unchanged visibility).
- Profile email: hidden + non-searchable.
- Group member emails: visible only to active members.
- All social write actions are rate-limited (20/min) to prevent abuse.
