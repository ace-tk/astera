/**
 * Fallback-only mirror of server/src/cms/legalPagesDefaults.js's
 * DEFAULT_LEGAL_PAGES_CONTENT. Used ONLY when the CMS request fails or times
 * out (see useLegalPages.js) — the 4 footer legal pages must never render
 * blank/broken because of a temporary API failure.
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
    lead: 'Quels cookies sont utilisés sur atoopv.com et comment les gérer.',
    body: `${DRAFT_NOTE}

## 1. Qu'est-ce qu'un cookie ?

Un cookie est un petit fichier texte déposé sur votre appareil lors de votre navigation sur le site, permettant de reconnaître votre navigateur lors de visites ultérieures.

## 2. Cookies utilisés sur ce site

* **Cookies strictement nécessaires** — indispensables au fonctionnement du site (session de connexion, sécurité). Ils ne nécessitent pas votre consentement.
* **Cookies de mesure d'audience** — [à compléter si des outils d'analytics sont utilisés en production].

ATOOPV n'utilise aucun cookie publicitaire.

## 3. Gérer vos cookies

Vous pouvez configurer votre navigateur pour accepter, refuser ou être averti avant le dépôt de cookies. Le blocage de certains cookies peut affecter le bon fonctionnement du site.

## 4. Contact

Pour toute question relative à cette politique, écrivez à contact@atoopv.com.`,
  },
}
