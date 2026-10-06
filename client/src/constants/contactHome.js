/**
 * Content of the Contact ("demande de démo") page — every visible string, moved out of
 * pages/atoopv/Contact.jsx so the admin CMS can edit it (cms/sitePageRegistry.js). The
 * form's field NAMES, validation rules and layout stay in Contact.jsx; only what the
 * visitor reads lives here. Dropdown option lists are fixed-length: the admin can reword
 * an option but not add or remove one.
 */
export const CONTACT_PAGE = {
  hero: {
    heading: ['Voyons ce que SIRUS ', 'peut faire ', 'sur l’une de vos séances.'],
    lead:
      'Demandez une démonstration personnalisée — nous vous présentons la chaîne de traitement sur un cas type proche de votre instance et répondons à vos questions sur l’intégration, la confidentialité et la qualité des projets de PV générés.',
    micro: 'Réponse sous 48 heures ouvrées · Sans engagement.',
  },
  sections: {
    contact: 'Vos coordonnées',
    cse: 'Votre CSE',
    request: 'Votre demande',
  },
  fields: {
    firstName: { label: 'Prénom', placeholder: 'Christine' },
    lastName: { label: 'Nom', placeholder: 'Lefèvre' },
    email: { label: 'Email professionnel', placeholder: 'prenom@entreprise.fr' },
    phone: { label: 'Téléphone', placeholder: '06 12 34 56 78' },
    role: { label: 'Fonction au sein du CSE', placeholder: 'Sélectionner…' },
    company: { label: 'Entreprise', placeholder: 'Nom de votre entreprise' },
    companySize: { label: "Effectif de l'entreprise", placeholder: 'Sélectionner…' },
    electedCount: { label: "Nombre d'élus (titulaires + suppléants)", placeholder: 'Sélectionner…' },
    meetingDuration: { label: "Durée moyenne d'une réunion", placeholder: 'Sélectionner…' },
    hasRecording: { label: 'Avez-vous déjà un enregistrement ?', placeholder: 'Sélectionner…' },
    message: {
      label: 'Message (optionnel)',
      placeholder: "Type d'instance (CSE, CSSCT, CSEE…) · format souhaité · contexte particulier",
    },
  },
  options: {
    role: [
      'Secrétaire',
      'Secrétaire adjoint(e)',
      'Trésorier(ère)',
      'Trésorier(ère) adjoint(e)',
      'Président(e) (employeur)',
      'Membre élu titulaire',
      'Membre élu suppléant',
      'Membre de la CSSCT',
      'Représentant syndical',
      'Autre',
    ],
    companySize: ['Moins de 11 salariés', '11 — 49 salariés', '50 — 149 salariés', '150 — 299 salariés', '300 — 499 salariés', '500 salariés et plus'],
    electedCount: ['Moins de 8', '8 — 15', '16 — 25', 'Plus de 25'],
    meetingDuration: ['Moins de 2 heures', '2 — 4 heures', 'Plus de 4 heures'],
    hasRecording: ['Oui — audio ou vidéo disponible', 'Non, pas encore', 'Je ne sais pas encore'],
  },
  messages: {
    submit: 'Envoyer la demande',
    success: 'Merci ! Votre demande a bien été envoyée. Nous vous répondons sous 48 heures ouvrées.',
    connectionError: 'Impossible d’envoyer votre demande pour le moment. Vérifiez votre connexion ou écrivez-nous à contact@atoopv.com.',
    privacy: 'Vos données restent confidentielles · conformité RGPD · pas de tracking publicitaire.',
    companyAccount: 'Créer un compte entreprise',
  },
  validation: {
    firstName: 'Le prénom est requis.',
    lastName: 'Le nom est requis.',
    role: 'Sélectionnez votre fonction.',
    company: "Le nom de l'entreprise est requis.",
    emailRequired: "L'email professionnel est requis.",
    emailInvalid: 'Format email invalide.',
    phoneRequired: 'Le téléphone est requis.',
    phoneInvalid: 'Numéro de téléphone invalide.',
  },
}
