# /cookies — new text, for the client's approval (NOT published)

The Fix Instructions (12 Oct 2026, item 6) ask for the new text to be approved before it is published.
`body.md` is the Markdown body; the page keeps its title/lead:

- Title: **Politique de cookies**
- Lead: **Les traceurs utilisés sur atoopv.com et comment les gérer.**

What changed against the live text (1 Oct 2026):

1. removed: "C'est pourquoi aucun bandeau ne vous est présenté", "Ce que nous n'utilisons pas … aucun cookie publicitaire";
2. added: the consent banner (accept all / reject all / customise), 180-day validity, withdrawal with the
   "Gérer les cookies" link or the floating button;
3. added: Google Ads (Google Ireland Limited) used only with consent, to measure conversions (quote requests,
   phone clicks), "_gcl" cookies;
4. the manual tracker list is replaced by CookieYes' automatic cookie list, rendered by the site right after
   this text (the page contains the `cky-audit-table-element` container; nothing to paste).

To publish once approved: Admin → Content → Menus → Legal pages → Cookies → replace the body → Publish
(the "Gérer les cookies" button and the cookie list are added by the page itself, not by this text).

Open point: the "Polices de caractères" section stays only until the Google Fonts / Fontshare calls are
removed (self-hosting, Fix Instructions item 6) — delete that section at the same time.
