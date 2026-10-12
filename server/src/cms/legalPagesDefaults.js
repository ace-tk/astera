/**
 * The site's 4 footer legal pages' real, live content as of the Legal Pages
 * CMS migration — i.e. exactly what used to be hardcoded in
 * client/src/constants/legalPages.js. legalPagesService.getLegalPages() seeds
 * a brand-new LegalPages document with this in BOTH draft and live the first
 * time it is ever read, so the public pages never show anything different
 * from what they already show today, and no separate "import" admin step is
 * needed.
 *
 * TODO(legal): every body below is PLACEHOLDER text (clearly marked as a
 * draft inside its own markdown), not ATOOPV's real, lawyer-approved legal
 * copy. An admin can now replace it from Content → Menus → Legal pages —
 * no code change or redeploy needed for that anymore.
 */

const DRAFT_NOTE =
  '> **Brouillon** — ce texte est un espace réservé en attendant le texte juridique définitif validé par ATOOPV. Ne pas considérer comme contractuel.'

export const DEFAULT_LEGAL_PAGES_CONTENT = {
  mentionsLegales: {
    title: 'Mentions légales',
    lead: 'Informations légales relatives à l’éditeur et à l’hébergeur du site atoopv.com.',
    body: `${DRAFT_NOTE}

## 1. Éditeur du site

Le site atoopv.com est édité par **[Raison sociale à compléter]**, [forme juridique] au capital de [montant] euros, immatriculée au Registre du Commerce et des Sociétés de [ville] sous le numéro [SIRET], dont le siège social est situé [adresse à compléter].

Directeur de la publication : [nom à compléter].
Contact : contact@atoopv.com — 04 12 10 06 06.

## 2. Hébergement

Le site est hébergé par **[Hébergeur à compléter]**, dont le siège social est situé [adresse de l'hébergeur à compléter].

## 3. Propriété intellectuelle

L'ensemble des éléments du site (textes, visuels, logos, structure) est protégé par le droit de la propriété intellectuelle. Toute reproduction, même partielle, est soumise à autorisation préalable.

## 4. Contact

Pour toute question relative aux présentes mentions légales, écrivez à contact@atoopv.com.`,
  },
  cgv: {
    title: 'Conditions générales de vente',
    lead: 'Les présentes conditions générales de vente régissent les prestations proposées par ATOOPV.',
    body: `${DRAFT_NOTE}

## Article 1 — Objet

Les présentes conditions générales de vente (« CGV ») définissent les modalités de commande, de livraison et de paiement des prestations proposées par ATOOPV : rédaction de procès-verbaux, formations et services associés.

## Article 2 — Devis et commande

Toute prestation fait l'objet d'un devis préalable. La commande est réputée ferme à réception de l'accord écrit du client (signature du devis ou confirmation par e-mail).

## Article 3 — Tarifs

Les tarifs sont ceux en vigueur au jour de la commande, exprimés en euros hors taxes. La TVA applicable s'ajoute au montant indiqué sur le devis.

## Article 4 — Modalités de paiement

[Modalités à compléter — acompte, délai de paiement, moyens de paiement acceptés.]

## Article 5 — Rétractation et annulation

[Conditions à compléter conformément à la réglementation applicable aux prestations de services entre professionnels/particuliers.]

## Article 6 — Responsabilité

ATOOPV s'engage à exécuter sa prestation avec diligence. Sa responsabilité ne saurait être engagée en cas de force majeure ou de manquement du client à ses propres obligations.

## Article 7 — Droit applicable

Les présentes CGV sont soumises au droit français. Tout litige relève, à défaut d'accord amiable, de la compétence des tribunaux français.`,
  },
  confidentialite: {
    title: 'Politique de confidentialité',
    lead: 'Comment ATOOPV collecte, utilise et protège vos données personnelles.',
    body: `${DRAFT_NOTE}

## 1. Responsable du traitement

Le responsable du traitement des données collectées sur ce site est ATOOPV. Pour toute question, contactez-nous à contact@atoopv.com.

## 2. Données collectées

Dans le cadre de l'utilisation du site et de la création d'un compte, ATOOPV peut collecter : nom, prénom, adresse e-mail, numéro de téléphone, nom de l'entreprise et informations transmises via le formulaire de contact ou d'inscription.

## 3. Finalités du traitement

Ces données sont utilisées pour : la gestion de votre compte, la fourniture des prestations demandées, la réponse à vos demandes de contact et, le cas échéant, l'envoi d'informations commerciales que vous pouvez refuser à tout moment.

## 4. Durée de conservation

[Durées à compléter par finalité, conformément au RGPD.]

## 5. Vos droits

Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation et de portabilité de vos données, ainsi que d'un droit d'opposition. Pour exercer ces droits, écrivez à contact@atoopv.com.

Vous pouvez également introduire une réclamation auprès de la Commission nationale de l'informatique et des libertés (CNIL).

## 6. Sécurité

ATOOPV met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé.`,
  },
  cookies: {
    title: 'Politique de cookies',
    lead: 'Les traceurs utilisés sur atoopv.com et comment les gérer.',
    body: `*Dernière mise à jour : 12 octobre 2026*

## Qu’est-ce qu’un cookie ?

Un cookie est un petit fichier déposé sur votre ordinateur, votre tablette ou votre téléphone lorsque vous consultez un site. D’autres techniques, comme le stockage local du navigateur, remplissent la même fonction et obéissent aux mêmes règles. Ils permettent de reconnaître votre terminal d’une page à l’autre ou d’une visite à l’autre.

## Ce qu’utilise atoopv.com

atoopv.com utilise deux catégories de traceurs.

**Les traceurs strictement nécessaires** au fonctionnement du site et de votre espace client : maintien de votre connexion, sécurité des accès, mémorisation de vos préférences d’affichage (thème, accessibilité, son) et mémorisation de votre choix en matière de cookies. Conformément à l’article 82 de la loi n° 78-17 du 6 janvier 1978, dite loi Informatique et Libertés, ils ne nécessitent pas votre consentement.

**Les traceurs de mesure publicitaire**, déposés uniquement si vous les acceptez, qui permettent de mesurer l’efficacité de nos annonces Google Ads (voir ci-dessous).

## Votre choix

Lors de votre première visite, un bandeau vous permet d’**accepter tout**, de **tout rejeter** ou de **personnaliser** vos choix par catégorie. Aucun traceur non nécessaire n’est déposé avant votre accord, et refuser ne limite pas l’accès au site.

Votre choix est conservé pendant **180 jours**, puis nous vous le demandons de nouveau. Vous pouvez le modifier ou le retirer à tout moment, aussi simplement que vous l’avez donné, avec le lien **« Gérer les cookies »** en bas de chaque page ou avec le bouton flottant « Préférences de consentement ».

## Mesure des conversions publicitaires (Google Ads)

Avec votre consentement uniquement, nous utilisons Google Ads, un service de **Google Ireland Limited**, pour mesurer les conversions issues de nos annonces : une demande de devis envoyée depuis le formulaire de contact ou un clic sur notre numéro de téléphone. Cette mesure dépose des cookies de la famille « _gcl » sur votre terminal et transmet à Google l’information qu’une conversion a eu lieu.

Si vous refusez ces traceurs, aucun cookie publicitaire n’est déposé et aucune requête n’est envoyée à Google Ads depuis le site. Pour en savoir plus sur le traitement des données par Google, consultez la [politique de confidentialité de Google](https://policies.google.com/privacy).

## Polices de caractères

Pour afficher ses polices de caractères, le site fait appel aux services Google Fonts et Fontshare. Ces services reçoivent votre adresse IP mais ne déposent pas de cookie publicitaire. Voir notre [Politique de confidentialité](/politique-de-confidentialite).

## Paramétrer votre navigateur

Vous pouvez bloquer ou supprimer les cookies et le stockage local depuis les réglages de votre navigateur (Chrome, Firefox, Safari, Edge). Attention : bloquer les traceurs strictement nécessaires empêche l’accès à l’espace client.

## En savoir plus

Pour toute question, écrivez-nous à [contact@atoopv.com](mailto:contact@atoopv.com). Vous pouvez aussi consulter les recommandations de la CNIL sur [www.cnil.fr](https://www.cnil.fr).

## Liste des cookies et traceurs

La liste ci-dessous est générée automatiquement par notre outil de gestion du consentement et tenue à jour avec les traceurs réellement détectés sur le site.`,
  },
}
