# Service content index

This library contains extracted service-related content from AtoopV for later use inside Astera.

## Service pages by category

### home

- [Accueil](./home/accueil.md)

### about

- [À propos](./about/a-propos.md)

### autodiagnostic

- [Autodiagnostic CSE](./autodiagnostic/autodiagnostic.md)

### atoosavoir

Crawled from the "atoosavoir" nav item starting at
https://atoopv.com/atoosavoir/ via `scripts/extract_atoosavoir.py`
— scope limited to the `/atoosavoir/...` URL subtree.

- [atoosavoir — page de présentation](./atoosavoir/atoosavoir.md)
- [Exemple de fiche atoosavoir](./atoosavoir/atoosavoir-exemple.md)
- [Conditions générales de vente — atoosavoir](./atoosavoir/atoosavoir-cgv.md)

### drafting, by-city, tarifs-infos, guides, communication, training

Crawled from the "Services" nav dropdown (all six sub-groups) via
`scripts/extract_services.py` — see that script's docstring for the
crawl/scope rules and the slug → category mapping. Supersedes an earlier,
now-deleted extraction that used stale `/services/<slug>/` URLs (those all
301-redirect to the flat URLs below on the live site).

#### drafting — "Rédaction PV"

- [Rédaction de PV, formation et communication CSE](./drafting/services.md) — overall Services hub (`/services`)
- [Vos procès-verbaux de CSE, CSSCT & IRP rédigés par des experts](./drafting/nos-services-pv.md) — category hub (`/services/drafting`)
- [Rédaction PV CSE](./drafting/redaction-pv-cse.md)
- [Rédaction à l'acte](./drafting/redaction-pv-cse-a-lacte.md)
- [Rédaction PV CSSCT](./drafting/redaction-pv-cssct.md)
- [Externaliser son PV CSE](./drafting/externaliser-pv-cse.md)
- [Rédaction PV IRP](./drafting/redaction-pv-irp.md)
- [Rédaction PV CSEC](./drafting/redaction-pv-csec.md)

#### by-city — "Par ville"

- [Rédaction PV CSE Grenoble](./by-city/redaction-pv-cse-grenoble.md)
- [Rédaction PV CSE Marseille](./by-city/redaction-pv-cse-marseille.md)
- [Rédaction PV CSE Toulouse](./by-city/redaction-pv-cse-toulouse.md)
- [Rédaction PV CSE Bordeaux](./by-city/redaction-pv-cse-bordeaux.md)
- [Rédaction PV CSE Nantes](./by-city/redaction-pv-cse-nantes.md)
- [Rédaction PV CSE Lille](./by-city/redaction-pv-cse-lille.md)
- [Rédaction PV CSE Saint-Étienne](./by-city/redaction-pv-cse-saint-etienne.md)
- [Rédaction PV CSE Clermont-Ferrand](./by-city/redaction-pv-cse-clermont-ferrand.md)
- [Rédaction PV CSE Annecy](./by-city/redaction-pv-cse-annecy.md)
- [Rédaction PV CSE Lyon](./by-city/redaction-pv-cse-lyon.md)
- [Rédaction PV CSE Paris](./by-city/redaction-pv-cse-paris.md)

#### tarifs-infos — "Tarifs & Infos"

- [Tarif Rédaction PV CSE](./tarifs-infos/tarif-redaction-pv-cse.md) — category hub (`/services/tarifs-infos`)
- [PV CSE et Code du Travail](./tarifs-infos/pv-cse-code-travail.md)
- [Délai Rédaction PV CSE](./tarifs-infos/delai-redaction-pv-cse.md)
- [Rédacteur PV CSE](./tarifs-infos/redacteur-pv-cse.md)

#### guides — "Guides pratiques" (no hub page on the live site — its nav
group header is a same-page anchor; `/services/guides` renders a
synthesized directory of these 13 pages instead)

- [Qui rédige le PV de CSE ?](./guides/qui-redige-pv-cse.md)
- [Approbation du PV CSE](./guides/approbation-pv-cse.md)
- [Contenu obligatoire d'un PV de CSE](./guides/pv-cse-contenu-obligatoire.md)
- [PV CSE dans les entreprises de moins de 50 salariés](./guides/pv-cse-moins-50-salaries.md)
- [Modèle PV CSE Gratuit](./guides/modele-pv-cse-gratuit.md)
- [Le procès-verbal du CSE](./guides/proces-verbal-cse.md)
- [Procès-verbal de CSE : quels délais pour le rédiger ?](./guides/delai-pv-cse.md)
- [Que doit contenir un procès-verbal de CSE ?](./guides/contenu-pv-cse.md)
- [Procès-verbal de CSE et délit d'entrave](./guides/pv-cse-delit-entrave.md)
- [La BDESE et le procès-verbal du CSE](./guides/bdese-pv-cse.md)
- [Information et consultation du CSE](./guides/information-consultation-cse.md)
- [La réunion extraordinaire du CSE](./guides/reunion-extraordinaire-cse.md)
- [Procès-verbal de CSE : synthétique ou in extenso ?](./guides/pv-cse-synthetique-ou-integral.md)

#### communication — "Communication"

- [Communication CSE](./communication/communication-cse.md) — category hub (`/services/communication`)
- [ActuCSE — Newsletter](./communication/newsletter-actucse.md)
- [Communication ASC CSE](./communication/communication-asc.md)
- [Le Guide du Comité CSE](./communication/guide-du-comite.md)

#### training — "Formations"

- [Formation élus CSE](./training/formations-elus-cse-agree.md) — category hub (`/services/training`)
- [Formation économique des élus du CSE — 5 jours](./training/formation-economique-elus-cse.md)
- [Formation CSE — Rôle et missions du trésorier](./training/formation-cse-tresorier.md)
- [Formation CSE — Rôles et missions de la CSSCT](./training/formation-cssct-roles-missions.md)
- [Formation Pro — Communication](./training/formation-pro-communication.md)
- [Formation Droit Social — Le contrat de travail et sa rupture](./training/formation-droit-social-contrat-travail.md)

### pricing

- [Tarification](./pricing/tarification.md) — the interactive pricing simulator (`/services/pricing` and `/atoopv/tarification`), not part of the Services nav dropdown and not re-crawled here.

### resources

Crawled from the "Ressources" nav section starting at
https://atoopv.com/guides-livres-blancs-cse/ via `scripts/extract_resources.py`
— see that script's docstring for the crawl/scope rules.

- [Guides juridiques CSE](./resources/guides-livres-blancs-cse.md)
- [Modèles de PV — Essentiel, Scope, Premium](./resources/modeles-pv.md)
- [PV Premium Intégral — Exemple complet CSE](./resources/modele-pv-cse-premium-integral.md)
- [Mentions obligatoires du PV de CSE — Guide complet AtooPV](./resources/mentions-obligatoires-pv.md)
- [Cas pratiques](./resources/cas-pratiques.md)
- [Actualité sociale](./resources/actualite-sociale.md)
- [Jurisprudence sociale — Les arrêts qui comptent pour le CSE](./resources/jurisprudence-sociale-les-arrets-qui-comptent-pour-le-cse.md)
- [Comment lire un arrêt de la Cour de cassation — Guide pratique pour les élus CSE](./resources/comment-lire-arret-cour-de-cassation.md)
- [La Minute CSE : le droit du CSE expliqué en vidéo](./resources/la-minute-cse.md)
- [Le procès-verbal de réunion](./resources/proces-verbal.md)
- [Signature du procès-verbal de réunion du CSE](./resources/signature-du-proces-verbal-de-reunion-du-cse.md)
- [Droits des élus CSE — Ce que l'employeur ne vous dit pas](./resources/droits-elus-cse-guide-juridique.md)
- [Quand un élu du CSE démissionne, qui a perdu ?](./resources/demission-mandat-cse-elu-protection.md)
- [Mise à pied conservatoire d'un élu CSE](./resources/mise-a-pied-conservatoire-elu-cse.md)
- [Le CSE dans lequel vous siégez est né dans un appartement clandestin](./resources/histoire-cse-comite-entreprise-cnr-1943.md)
- [La réorganisation silencieuse : quand les meilleurs partent en premier](./resources/reorganisation-silencieuse-cse-demissions.md)
- [Solde de tout compte : ne pas signer est souvent la meilleure décision](./resources/solde-de-tout-compte-signature.md)
- [Élu CSE : le CV que personne ne lit](./resources/competences-elu-cse-mandat.md)
- [Surveillance des salariés : quand la CNIL sanctionne](./resources/surveillance-salaries-cnil-cse.md)
- [Un commissaire de justice en réunion CSE](./resources/commissaire-de-justice-cse-constat-entrave.md) — *thin source stub, teaser text only*
- [Télétravail imposé : ce que le CSE peut faire](./resources/teletravail-impose-cse-droits-employeur.md) — *thin source stub, teaser text only*
- [Harcèlement moral : quand les méthodes de management suffisent](./resources/harcelement-moral-methodes-gestion-cse.md) — *thin source stub, teaser text only*
- [Congés payés et heures supplémentaires : tout ce qui change depuis le 10 septembre 2025](./resources/heures-supplementaires-conges-payes-calcul.md)
- [Veille sociale — Publications LinkedIn du président d'ALC SAS](./resources/veille-sociale-cse-juin-2026.md)
- [Règlement intérieur : fin du dépôt au greffe depuis le 28 mai 2026](./resources/reglement-interieur-fin-depot-greffe-mai-2026-loi-simplification.md)
- [Tickets-restaurant et télétravail](./resources/tickets-restaurant-teletravail-droit-teletravailleurs.md)
- [Droit à l'image du salarié après son départ](./resources/droit-image-salarie-depart-jurisprudence-cour-cassation.md)
- [Grossesse et licenciement nul](./resources/grossesse-licenciement-nul-protection-salariee-cour-cassation-2026.md)
- [Heures supplémentaires et annualisation : calcul après arrêt maladie](./resources/heures-supplementaires-annualisation-arret-maladie-calcul-cour-cassation.md)
- [Compteur de CP après arrêt maladie](./resources/compteur-cp-arret-maladie-verifications-avant-solder.md)
- [Congés payés et heures supplémentaires : 3 bulletins, 3 résultats](./resources/conges-payes-heures-supplementaires-calcul-bulletins-paie.md)
- [Congé payé vendredi après 37h lundi-jeudi](./resources/conge-paye-vendredi-37h-decompte-jours-ouvrables.md)
- [Arrêt maladie : durée légale, LFSS 2026 et droits du salarié](./resources/arret-maladie-duree-legale-lfss-2026-droits-salarie.md)
- [Canicule au travail : ce que le décret n° 2025-482 change](./resources/canicule-travail-decret-2025-482-obligations-employeur-cse.md)
- [Veille juridique · 3 arrêts de la Cour de cassation (8 juillet 2026)](./resources/veille-juridique-cse-8-25-juillet-2026.md)
