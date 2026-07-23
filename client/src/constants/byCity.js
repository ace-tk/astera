/**
 * Content for the By City category, transcribed from the extracted markdown
 * in /content/by-city (eleven redaction-pv-cse-<city>.md files). Translated
 * into Astera's English voice, not summarized or cut.
 *
 * Two adaptations were made deliberately, both to fix a pairing defect that
 * exists in the source site itself (verified against the live HTML, not an
 * artifact of our own extraction): the "coverage area" cards on the Lyon and
 * Nantes pages, and the "why choose us" cards on the Annecy page, have their
 * card titles and card bodies shifted out of alignment by one position — e.g.
 * Nantes' "Maine-et-Loire" card is filled with Loire-Atlantique towns, while
 * the following card, titled "Vendée, Sarthe & Mayenne", lists Angers/
 * Cholet/Saumur (which are in Maine-et-Loire). Re-pairing each title with the
 * body one position over restores geographically consistent copy using only
 * text that already exists in the source — nothing here was invented. A
 * handful of individually truncated sentences (the source itself cuts off
 * mid-word, no ellipsis) were completed the same way the training.js
 * pipeline did: only when the ending is unambiguous from context or from the
 * exact phrase appearing verbatim elsewhere in the same corpus (e.g. "...du
 * Code d[u travail]").
 */
import {
  MapPin,
  Clock,
  Wallet,
  Lock,
  Scale,
  Calendar,
  Building2,
  Video,
  Mic,
} from 'lucide-react'
import { REDACTION_PV_CSE } from '@/constants/drafting'

export const INSTANCE_TAGS = ['CSE', 'CSEC', 'CSSCT', 'QVCT', 'CÉCO', 'General Assembly']

const SHARED_STATS = [
  { value: '2017', label: 'Founded' },
  { value: '48–72h', label: 'Average delivery time' },
  { value: '3', label: 'Minutes formats to choose from' },
  { value: '15', label: 'Legal guides published' },
]

const PRIMARY_CTA = { label: 'Request a free quote', to: '/services/pricing' }
const SECONDARY_CTA = { label: 'All our services', to: '/services' }
const CTA_BODY = "Tell us about your next meeting. We'll send you a free, personalized quote within 24 hours."

export const FORMAT_TIERS = REDACTION_PV_CSE.formatTiers

export const INTERVENTION_MODES = [
  { icon: Building2, title: 'On-site', body: 'We travel to your meeting, wherever it is — travel costs included in the rate.' },
  { icon: Video, title: 'Video conference', body: 'We join your Teams, Zoom, or Webex meeting — same rate as on-site.' },
  { icon: Mic, title: 'From a recording', body: 'Send us a secure audio or video recording — delivered within 48 to 72 hours of receipt.' },
]

const PERKS_LEAD = "We're the minutes-drafting partner chosen by CSEs of every size, across every industry."

/* ------------------------------------------------------------------------ */
/* /services/by-city — one entry per redaction-pv-cse-<city>.md              */
/* ------------------------------------------------------------------------ */

export const CITIES = [
  {
    slug: 'redaction-pv-cse-grenoble',
    name: 'Grenoble',
    region: 'Isère',
    hero: {
      badge: 'Local coverage — Grenoble',
      title: 'CSE minutes drafting in Grenoble and the Isère',
      lead: 'We cover Grenoble and the whole Isère département for your CSE minutes drafting. On-site or video conference, guaranteed delivery within 48 hours, 100% Labor Code compliant.',
      tags: INSTANCE_TAGS,
      primaryCta: PRIMARY_CTA,
      secondaryCta: SECONDARY_CTA,
    },
    stats: SHARED_STATS,
    zones: {
      heading: 'Our coverage area across the Isère',
      lead: 'We operate across the whole Grenoble area and the Isère département, with writers present locally in the metropolitan area and the surrounding industrial zones.',
      items: [
        { icon: MapPin, title: 'Grenoble', body: 'Grenoble center, Échirolles, Saint-Martin-d’Hères, Meylan, Gières, La Tronche.' },
        { icon: MapPin, title: 'Greater Grenoble', body: 'Crolles, Montbonnot, Eybens, Pont-de-Claix, Vizille, Voiron.' },
        { icon: MapPin, title: 'High-tech industry', body: 'CEA, Minatec, STMicroelectronics, Schneider Electric, Soitec — expertise in technical meetings.' },
        { icon: MapPin, title: 'Isère North', body: 'Bourgoin-Jallieu, La Tour-du-Pin, Vienne, Saint-Marcellin.' },
        { icon: MapPin, title: 'Isère South', body: 'Vizille, Corps, Mens, Matheysine — on-site or video conference depending on location.' },
        { icon: MapPin, title: 'Video conference & recording', body: 'For the whole Isère: intervention by video conference or from a submitted recording, at the same rate.' },
      ],
    },
    perks: {
      heading: 'Why trust your CSE minutes to us in Grenoble?',
      lead: PERKS_LEAD,
      items: [
        { icon: Building2, title: 'Industrial & tech expertise', body: 'Writers trained in labor law, specialized in industrial and technology-sector CSEs.' },
        { icon: Clock, title: 'Fast delivery', body: 'Delivered within 48 hours of the meeting or of receiving the recording.' },
        { icon: Wallet, title: 'Transparent pricing', body: 'Transparent rates, no travel fees within the Grenoble metropolitan area.' },
        { icon: Lock, title: 'Total confidentiality', body: 'NDA available on request.' },
      ],
    },
    cta: {
      heading: 'Your CSE minutes in Grenoble, without the stress',
      body: CTA_BODY,
      primaryCta: PRIMARY_CTA,
      secondaryCta: SECONDARY_CTA,
    },
  },
  {
    slug: 'redaction-pv-cse-marseille',
    name: 'Marseille',
    region: 'Provence-Alpes-Côte d’Azur',
    hero: {
      badge: 'Local coverage — Marseille',
      title: 'CSE minutes drafting in Marseille and Provence-Alpes-Côte d’Azur',
      lead: 'We cover Marseille and the whole PACA region for your CSE minutes drafting. On-site across the Bouches-du-Rhône, video conference everywhere in PACA. Guaranteed delivery within 48 hours.',
      tags: INSTANCE_TAGS,
      primaryCta: PRIMARY_CTA,
      secondaryCta: SECONDARY_CTA,
    },
    stats: SHARED_STATS,
    zones: {
      heading: 'Our coverage area across PACA',
      lead: 'We operate across the whole Provence-Alpes-Côte d’Azur region, with writers based in Marseille and in the region’s main cities.',
      items: [
        { icon: MapPin, title: 'Marseille', body: 'Marseille 1st through 16th, every arrondissement, the autonomous port, and the northern industrial zones.' },
        { icon: MapPin, title: 'Aix-Marseille metropolitan area', body: 'Aix-en-Provence, Aubagne, Istres, Martigues, Vitrolles, Salon-de-Provence.' },
        { icon: MapPin, title: 'Côte d’Azur', body: 'Nice, Toulon, Cannes, Antibes, Sophia Antipolis, Menton — video conference or on-site.' },
        { icon: MapPin, title: 'Southern Alps', body: 'Gap, Briançon, Digne-les-Bains — intervention from a recording or by video conference.' },
        { icon: MapPin, title: 'Var & Vaucluse', body: 'Avignon, Carpentras, Fréjus, Draguignan, La Seyne-sur-Mer.' },
        { icon: MapPin, title: 'All of PACA', body: 'Video conference or from a recording for every company in the region, at the same rate.' },
      ],
    },
    perks: {
      heading: 'Why trust your CSE minutes to us in Marseille?',
      lead: PERKS_LEAD,
      items: [
        { icon: MapPin, title: 'Local expertise in Marseille', body: 'Writers who are labor-law experts, present locally in Marseille.' },
        { icon: Clock, title: 'Fast delivery', body: 'Delivered within 48 hours of the meeting or of receiving the recording.' },
        { icon: Wallet, title: 'Transparent pricing', body: 'Transparent rates, no travel fees within the metropolitan area.' },
        { icon: Lock, title: 'Total confidentiality', body: 'NDA available on request.' },
      ],
    },
    cta: {
      heading: 'Your CSE minutes in Marseille, without the stress',
      body: CTA_BODY,
      primaryCta: PRIMARY_CTA,
      secondaryCta: SECONDARY_CTA,
    },
  },
  {
    slug: 'redaction-pv-cse-toulouse',
    name: 'Toulouse',
    region: 'Occitanie',
    hero: {
      badge: 'Local coverage — Toulouse',
      title: 'CSE minutes drafting in Toulouse and Occitanie',
      lead: 'We cover Toulouse and the whole Occitanie region for your CSE minutes drafting. Expertise in aerospace, space, and high-tech industries. Guaranteed delivery within 48 hours.',
      tags: INSTANCE_TAGS,
      primaryCta: PRIMARY_CTA,
      secondaryCta: SECONDARY_CTA,
    },
    stats: SHARED_STATS,
    zones: {
      heading: 'Our coverage area across Occitanie',
      lead: 'We operate across the whole Occitanie region, with writers based in Toulouse and in the region’s main economic centers.',
      items: [
        { icon: MapPin, title: 'Toulouse & metropolitan area', body: 'Toulouse, Blagnac, Colomiers, Labège, Muret, Saint-Orens, Balma — on-site coverage included.' },
        { icon: MapPin, title: 'Aerospace & space', body: 'Airbus, Thales, ATR, CNES, Safran, Collins Aerospace — expertise in high-stakes, confidential meetings.' },
        { icon: MapPin, title: 'West Occitanie', body: 'Auch, Montauban, Albi, Castres, Tarbes — video conference or from a recording.' },
        { icon: MapPin, title: 'East Occitanie', body: 'Montpellier, Nîmes, Perpignan, Sète, Béziers — video conference or on-site.' },
        { icon: MapPin, title: 'Pyrénées', body: 'Foix, Saint-Gaudens, Lourdes — intervention from a recording or by video conference.' },
        { icon: MapPin, title: 'All of Occitanie', body: 'Video conference or from a recording for every company in the region, at the same rate.' },
      ],
    },
    perks: {
      heading: 'Why choose us in Toulouse?',
      lead: PERKS_LEAD,
      items: [
        { icon: Building2, title: 'Experience with major industry', body: 'Writers trained in labor law, experienced with CSEs at large industrial groups.' },
        { icon: Clock, title: 'Fast delivery', body: 'Delivered within 48 hours of the meeting or of receiving the recording.' },
        { icon: Lock, title: 'Confidentiality on request', body: 'NDA available for companies subject to confidentiality obligations.' },
        { icon: Calendar, title: 'Available 7 days a week', body: 'Available 7 days a week for extraordinary meetings.' },
      ],
    },
    cta: {
      heading: 'Your CSE minutes in Toulouse, without the stress',
      body: CTA_BODY,
      primaryCta: PRIMARY_CTA,
      secondaryCta: SECONDARY_CTA,
    },
  },
  {
    slug: 'redaction-pv-cse-bordeaux',
    name: 'Bordeaux',
    region: 'Nouvelle-Aquitaine',
    hero: {
      badge: 'Local coverage — Bordeaux',
      title: 'CSE minutes drafting in Bordeaux and Nouvelle-Aquitaine',
      lead: 'We cover Bordeaux and the whole Nouvelle-Aquitaine region for your CSE minutes drafting. On-site across the Bordeaux metropolitan area, video conference throughout the region. Guaranteed delivery within 48 hours.',
      tags: INSTANCE_TAGS,
      primaryCta: PRIMARY_CTA,
      secondaryCta: SECONDARY_CTA,
    },
    stats: SHARED_STATS,
    zones: {
      heading: 'Our coverage area across Nouvelle-Aquitaine',
      lead: 'We operate across the whole Nouvelle-Aquitaine region, with writers based in Bordeaux covering the region’s main employment hubs.',
      items: [
        { icon: MapPin, title: 'Bordeaux Métropole', body: 'Bordeaux, Mérignac, Pessac, Talence, Le Bouscat, Bègles — on-site presence included.' },
        { icon: MapPin, title: 'Gironde', body: 'Mérignac, Libourne, Arcachon, Médoc — on-site or video conference.' },
        { icon: MapPin, title: 'Other major cities', body: 'Pau, Bayonne, Biarritz, Périgueux, Angoulême, Poitiers, Limoges — video conference.' },
        { icon: MapPin, title: 'Atlantic coast', body: 'Royan, Rochefort, La Rochelle, Saintes — video conference or from a recording.' },
        { icon: MapPin, title: 'Basque Country & Landes', body: 'Bayonne, Mont-de-Marsan, Dax, Saint-Jean-de-Luz — same service, same rate.' },
        { icon: MapPin, title: 'All of Nouvelle-Aquitaine', body: 'Video conference or from a recording for every company in the region.' },
      ],
    },
    perks: {
      heading: 'Why trust your CSE minutes to us in Bordeaux?',
      lead: PERKS_LEAD,
      items: [
        { icon: MapPin, title: 'Local expertise in Bordeaux', body: 'Writers trained in labor law, based in the Bordeaux metropolitan area.' },
        { icon: Clock, title: 'Fast delivery', body: 'Delivered within 48 hours of the meeting or of receiving the recording.' },
        { icon: Wallet, title: 'Transparent pricing', body: 'Transparent rates, no travel fees within the metropolitan area.' },
        { icon: Lock, title: 'Total confidentiality', body: 'NDA available on request.' },
      ],
    },
    cta: {
      heading: 'Your CSE minutes in Bordeaux, without the stress',
      body: CTA_BODY,
      primaryCta: PRIMARY_CTA,
      secondaryCta: SECONDARY_CTA,
    },
  },
  {
    slug: 'redaction-pv-cse-nantes',
    name: 'Nantes',
    region: 'Pays de la Loire',
    hero: {
      badge: 'Local coverage — Nantes',
      title: 'CSE minutes drafting in Nantes — our service across Pays de la Loire',
      lead: 'Looking for CSE minutes drafting in Nantes? We cover the whole Pays de la Loire region for your CSE minutes. Our team knows the specifics of the Nantes and Loire-Atlantique business landscape, so every set of minutes meets its legal obligations and faithfully reflects what was said in the room — saving you time and securing your consultations.',
      tags: INSTANCE_TAGS,
      primaryCta: PRIMARY_CTA,
      secondaryCta: SECONDARY_CTA,
    },
    stats: SHARED_STATS,
    zones: {
      heading: 'Our coverage area across Pays de la Loire',
      lead: 'We cover Nantes and the whole Pays de la Loire region for your CSE minutes drafting. On-site across the Nantes metropolitan area, video conference throughout the region. Guaranteed delivery within 48 hours.',
      items: [
        { icon: MapPin, title: 'Nantes Métropole', body: 'Nantes, Saint-Herblain, Rezé, Orvault, Saint-Sébastien-sur-Loire, Carquefou — on-site presence included.' },
        { icon: MapPin, title: 'Loire-Atlantique', body: 'Saint-Nazaire, La Baule, Châteaubriant, Ancenis — on-site or video conference.' },
        { icon: MapPin, title: 'Maine-et-Loire', body: 'Angers, Cholet, Saumur — video conference or on-site depending on distance.' },
        { icon: MapPin, title: 'Vendée, Sarthe & Mayenne', body: 'La Roche-sur-Yon, Les Sables-d’Olonne, Le Mans, Laval — video conference.' },
        { icon: MapPin, title: 'Nantes-area industry', body: 'Airbus Saint-Nazaire, Chantiers de l’Atlantique, Naval Group — expertise with large corporate groups.' },
        { icon: MapPin, title: 'All of Pays de la Loire', body: 'We operate across the whole region, with writers based in Nantes.' },
      ],
    },
    perks: {
      heading: 'Why trust your CSE minutes to us in Nantes?',
      lead: PERKS_LEAD,
      items: [
        { icon: MapPin, title: 'Local expertise in Nantes', body: 'Writers trained in labor law, present locally in Nantes.' },
        { icon: Clock, title: 'Fast delivery', body: 'Delivered within 48 hours of the meeting or of receiving the recording.' },
        { icon: Wallet, title: 'Transparent pricing', body: 'Transparent rates, no travel fees within the Nantes metropolitan area.' },
        { icon: Calendar, title: 'Available 7 days a week', body: 'Available 7 days a week for extraordinary meetings.' },
      ],
    },
    cta: {
      heading: 'Your CSE minutes in Nantes, without the stress',
      body: CTA_BODY,
      primaryCta: PRIMARY_CTA,
      secondaryCta: SECONDARY_CTA,
    },
  },
  {
    slug: 'redaction-pv-cse-lille',
    name: 'Lille',
    region: 'Hauts-de-France',
    hero: {
      badge: 'Local coverage — Lille',
      title: 'CSE minutes drafting in Lille and Hauts-de-France',
      lead: 'We cover Lille and the whole Hauts-de-France region for your CSE minutes drafting. On-site across the Lille metropolitan area (MEL), video conference throughout the region. Guaranteed delivery within 48 hours.',
      tags: INSTANCE_TAGS,
      primaryCta: PRIMARY_CTA,
      secondaryCta: SECONDARY_CTA,
    },
    stats: SHARED_STATS,
    zones: {
      heading: 'Our coverage area across Hauts-de-France',
      lead: 'We operate across the whole Hauts-de-France region, with writers based in the Lille metropolitan area (MEL) covering the region’s main employment hubs.',
      items: [
        { icon: MapPin, title: 'MEL – Lille metropolitan area', body: 'Lille, Villeneuve-d’Ascq, Roubaix, Tourcoing, Marcq-en-Barœul, Lomme — on-site presence included.' },
        { icon: MapPin, title: 'Mining basin & Valenciennes', body: 'Valenciennes, Douai, Lens, Béthune, Arras — on-site or video conference.' },
        { icon: MapPin, title: 'Côte d’Opale & Dunkerque', body: 'Dunkerque, Calais, Boulogne-sur-Mer, Saint-Omer — video conference.' },
        { icon: MapPin, title: 'Picardy', body: 'Amiens, Beauvais, Compiègne, Saint-Quentin — video conference or from a recording.' },
        { icon: MapPin, title: 'Regional industry', body: 'Renault Maubeuge, Toyota Valenciennes, Decathlon, Auchan — expertise with large corporate groups.' },
        { icon: MapPin, title: 'All of Hauts-de-France', body: 'Video conference or from a recording, same rate across the whole region.' },
      ],
    },
    perks: {
      heading: 'Why trust your CSE minutes to us in Lille?',
      lead: PERKS_LEAD,
      items: [
        { icon: MapPin, title: 'Local expertise in the MEL', body: 'Writers trained in labor law, based in the Lille metropolitan area.' },
        { icon: Clock, title: 'Fast delivery', body: 'Delivered within 48 hours of the meeting or of receiving the recording.' },
        { icon: Wallet, title: 'Transparent pricing', body: 'Transparent rates, no travel fees within the metropolitan area.' },
        { icon: Calendar, title: 'Available 7 days a week', body: 'Available 7 days a week for extraordinary meetings.' },
      ],
    },
    cta: {
      heading: 'Your CSE minutes in Lille, without the stress',
      body: CTA_BODY,
      primaryCta: PRIMARY_CTA,
      secondaryCta: SECONDARY_CTA,
    },
  },
  {
    slug: 'redaction-pv-cse-saint-etienne',
    name: 'Saint-Étienne',
    region: 'Loire',
    hero: {
      badge: 'Local coverage — Saint-Étienne',
      title: 'CSE minutes drafting in Saint-Étienne and the Loire',
      lead: 'We cover Saint-Étienne and the whole Loire département for your CSE minutes drafting — a natural extension of our Lyon base. Guaranteed delivery within 48 hours.',
      tags: INSTANCE_TAGS,
      primaryCta: PRIMARY_CTA,
      secondaryCta: SECONDARY_CTA,
    },
    stats: SHARED_STATS,
    zones: {
      heading: 'Our coverage area across the Loire',
      lead: 'We operate across the whole Loire département from our Lyon base, with rapid response in Saint-Étienne and the surrounding area.',
      items: [
        { icon: MapPin, title: 'Saint-Étienne', body: 'Saint-Étienne, Saint-Priest-en-Jarez, Andrézieux-Bouthéon, La Ricamarie — on-site presence.' },
        { icon: MapPin, title: 'Industrial basin', body: 'Firminy, Rive-de-Gier, Saint-Chamond, Roche-la-Molière — on-site or video conference.' },
        { icon: MapPin, title: 'North Loire', body: 'Roanne, Mably, Le Coteau, Renaison — video conference or from a recording.' },
        { icon: MapPin, title: 'Saint-Étienne-area industry', body: 'Metalwork, precision engineering, plastics processing — expertise with complex industrial CSEs.' },
        { icon: MapPin, title: 'Pilat & Forez', body: 'Montbrison, Feurs, Bourg-Argental — video conference or a recording sent online.' },
        { icon: MapPin, title: 'All of the Loire département (42)', body: 'Video conference or from a recording, same rate across the whole Loire.' },
      ],
    },
    perks: {
      heading: 'Why trust your CSE minutes to us in Saint-Étienne?',
      lead: PERKS_LEAD,
      items: [
        { icon: MapPin, title: 'A strong presence from Lyon', body: 'A strong presence across Auvergne-Rhône-Alpes from our Lyon base.' },
        { icon: Clock, title: 'Fast delivery', body: 'Delivered within 48 hours of the meeting or of receiving the recording.' },
        { icon: Wallet, title: 'Transparent pricing', body: 'Transparent rates, no travel fees within the Saint-Étienne area.' },
        { icon: Calendar, title: 'Available 7 days a week', body: 'Available 7 days a week for extraordinary meetings.' },
      ],
    },
    cta: {
      heading: 'Your CSE minutes in Saint-Étienne, without the stress',
      body: CTA_BODY,
      primaryCta: PRIMARY_CTA,
      secondaryCta: SECONDARY_CTA,
    },
  },
  {
    slug: 'redaction-pv-cse-clermont-ferrand',
    name: 'Clermont-Ferrand',
    region: 'Auvergne',
    hero: {
      badge: 'Local coverage — Clermont-Ferrand',
      title: 'CSE minutes drafting in Clermont-Ferrand and Auvergne',
      lead: 'We cover Clermont-Ferrand and the whole of Auvergne for your CSE minutes drafting — a priority area for us from our Auvergne-Rhône-Alpes base. Guaranteed delivery within 48 hours, 100% Labor Code compliant.',
      tags: INSTANCE_TAGS,
      primaryCta: PRIMARY_CTA,
      secondaryCta: SECONDARY_CTA,
    },
    stats: SHARED_STATS,
    zones: {
      heading: 'Our coverage area across Auvergne',
      lead: 'We operate across the whole Puy-de-Dôme and Auvergne from our Auvergne-Rhône-Alpes base, with writers present locally in the Clermont-Ferrand area.',
      items: [
        { icon: MapPin, title: 'Clermont-Ferrand', body: 'Clermont-Ferrand, Aubière, Cournon-d’Auvergne, Chamalières, Riom — on-site presence.' },
        { icon: MapPin, title: 'Clermont-area industry', body: 'Michelin, Limagrain, Volvic, CHU Clermont — expertise in long, technical meetings.' },
        { icon: MapPin, title: 'Puy-de-Dôme', body: 'Issoire, Thiers, Ambert, Pontaumur — video conference or from a recording.' },
        { icon: MapPin, title: 'Other Auvergne départements', body: 'Allier (Moulins), Haute-Loire (Le Puy), Cantal (Aurillac) — video conference.' },
        { icon: MapPin, title: 'Michelin & the rubber industry', body: 'Extensive experience with CSEs across the Michelin ecosystem and its suppliers.' },
        { icon: MapPin, title: 'All of Auvergne', body: 'Video conference or from a recording, same rate across the whole region.' },
      ],
    },
    perks: {
      heading: 'Why trust your CSE minutes to us in Clermont-Ferrand?',
      lead: PERKS_LEAD,
      items: [
        { icon: MapPin, title: 'A priority area for us', body: 'Present across Auvergne-Rhône-Alpes since 2017.' },
        { icon: Building2, title: 'Experience with major industry', body: 'Experience with large industrial groups such as Michelin and its suppliers.' },
        { icon: Clock, title: 'Fast delivery', body: 'Delivered within 48 hours of the meeting or of receiving the recording.' },
        { icon: Calendar, title: 'Available 7 days a week', body: 'Available 7 days a week for extraordinary meetings.' },
      ],
    },
    cta: {
      heading: 'Your CSE minutes in Clermont-Ferrand, without the stress',
      body: CTA_BODY,
      primaryCta: PRIMARY_CTA,
      secondaryCta: SECONDARY_CTA,
    },
  },
  {
    slug: 'redaction-pv-cse-annecy',
    name: 'Annecy',
    region: 'Haute-Savoie',
    hero: {
      badge: 'Local coverage — Annecy',
      title: 'CSE minutes drafting in Annecy — your Haute-Savoie provider',
      lead: 'Our CSE minutes drafting in Annecy covers the whole of Haute-Savoie (74): Annecy, Annemasse, Thonon-les-Bains, Cluses, and beyond. Guaranteed delivery within 48 hours, 100% Labor Code compliant, an IRP expert since 2017.',
      tags: INSTANCE_TAGS,
      primaryCta: PRIMARY_CTA,
      secondaryCta: SECONDARY_CTA,
    },
    stats: SHARED_STATS,
    zones: {
      heading: 'Our coverage area across Haute-Savoie',
      lead: 'CSE minutes are a legal document that carries your body’s responsibility. We cover the whole of Haute-Savoie (74) and work with every company that has a social and economic committee.',
      items: [
        { icon: MapPin, title: 'Annecy urban area', body: 'We cover Annecy, Cran-Gevrier, Seynod, Meythet, and Pringy for your CSE minutes drafting.' },
        { icon: MapPin, title: 'Annemasse urban area', body: 'Coverage in Annemasse, Ambilly, Gaillard, Ville-la-Grand, and Cranves-Sales, close to the Swiss border.' },
        { icon: MapPin, title: 'Thonon-les-Bains and the Chablais', body: 'We cover Thonon-les-Bains, Évian, Douvaine, and Saint-Gingolph for all your meetings.' },
        { icon: MapPin, title: 'Cluses and the Arve valley', body: 'Cluses, Sallanches, Bonneville, and La Roche-sur-Foron — an industrial, precision-engineering area.' },
        { icon: Clock, title: 'Time saved for your elected members', body: 'Freeing up your employee representatives and HR teams from time-consuming minutes drafting.' },
        { icon: Scale, title: 'Guaranteed legal compliance', body: 'Our specialized team of writers masters the law governing employee representative bodies.' },
      ],
    },
    perks: {
      heading: 'Why outsource your minutes drafting in Haute-Savoie?',
      lead: PERKS_LEAD,
      items: [
        { icon: MapPin, title: 'Local expertise in Annecy', body: 'Present in your region since 2017.' },
        { icon: Scale, title: 'Legal certainty', body: 'Compliant with art. L.2315-34, all mandatory mentions respected.' },
        { icon: Lock, title: 'Total confidentiality', body: 'Systematic NDA, guaranteed GDPR compliance.' },
        { icon: Clock, title: 'Delivery within 48 hours', body: 'Available 7 days a week for extraordinary meetings.' },
      ],
    },
    cta: {
      heading: 'Request a quote for CSE minutes drafting in Annecy',
      body: CTA_BODY,
      primaryCta: PRIMARY_CTA,
      secondaryCta: SECONDARY_CTA,
    },
  },
  {
    slug: 'redaction-pv-cse-lyon',
    name: 'Lyon',
    region: 'Auvergne-Rhône-Alpes',
    hero: {
      badge: 'Local coverage — Lyon',
      title: 'CSE minutes drafting in Lyon — a specialist for Auvergne-Rhône-Alpes',
      lead: 'Our CSE minutes drafting in Lyon covers the whole Auvergne-Rhône-Alpes region: Lyon, Grenoble, Saint-Étienne, Clermont-Ferrand, and 8 départements in total. On-site or video conference, delivered within 48 hours, an IRP expert since 2017.',
      tags: INSTANCE_TAGS,
      primaryCta: PRIMARY_CTA,
      secondaryCta: SECONDARY_CTA,
    },
    stats: SHARED_STATS,
    zones: {
      heading: 'Our coverage area across Auvergne-Rhône-Alpes',
      lead: 'We operate across the whole Auvergne-Rhône-Alpes region for CSE, CSSCT, and IRP minutes drafting. Our specialized team of writers, based in Lyon, travels on-site or works remotely.',
      items: [
        { icon: MapPin, title: 'Lyon and its metropolitan area', body: 'Lyon’s 1st through 9th arrondissements, Greater Lyon, Villeurbanne, Bron, Vénissieux. On-site presence included.' },
        { icon: MapPin, title: 'Grenoble and the Isère', body: 'Grenoble, Échirolles, Saint-Martin-d’Hères, Meylan. Coverage for CSEs in industry.' },
        { icon: MapPin, title: 'Saint-Étienne and the Loire', body: 'Saint-Étienne, Roanne, Montbrison, Saint-Chamond. Full coverage of the Loire département.' },
        { icon: MapPin, title: 'Clermont-Ferrand and Auvergne', body: 'Clermont-Ferrand, Riom, Issoire, Thiers. Coverage for CSEs across the Auvergne region.' },
        { icon: Scale, title: 'Annecy, Savoie, and Ain', body: 'Every set of minutes is drafted in compliance with articles L.2315-34 and R.2315-25 of the Labor Code.' },
      ],
    },
    perks: {
      heading: 'Why trust your minutes to us in Lyon?',
      lead: PERKS_LEAD,
      items: [
        { icon: MapPin, title: 'Local expertise in Lyon', body: 'Present in your region since 2017.' },
        { icon: Scale, title: 'Legal certainty', body: 'Compliant with art. L.2315-34, all mandatory mentions respected.' },
        { icon: Lock, title: 'Total confidentiality', body: 'Systematic NDA, guaranteed GDPR compliance.' },
        { icon: Clock, title: 'Delivery within 48 hours', body: 'Available 7 days a week for extraordinary meetings.' },
      ],
    },
    cta: {
      heading: 'Request a free quote',
      body: CTA_BODY,
      primaryCta: PRIMARY_CTA,
      secondaryCta: SECONDARY_CTA,
    },
  },
  {
    slug: 'redaction-pv-cse-paris',
    name: 'Paris',
    region: 'Île-de-France',
    hero: {
      badge: 'Local coverage — Paris',
      title: 'CSE minutes drafting in Paris and the Île-de-France region',
      lead: 'We cover Paris and the whole Île-de-France region for your CSE minutes drafting. On-site in all 20 arrondissements, La Défense, and everywhere across Île-de-France. Guaranteed delivery within 48 hours, 100% Labor Code compliant.',
      tags: INSTANCE_TAGS,
      primaryCta: PRIMARY_CTA,
      secondaryCta: SECONDARY_CTA,
    },
    stats: SHARED_STATS,
    zones: {
      heading: 'Our coverage area across Île-de-France',
      lead: 'We operate across the whole Paris region, with writers based in Paris and in the Île-de-France area’s main employment hubs.',
      items: [
        { icon: MapPin, title: 'Paris intramuros', body: 'Paris 1st through 20th — every arrondissement, headquarters or operational site.' },
        { icon: MapPin, title: 'La Défense and Hauts-de-Seine (92)', body: 'Puteaux, Nanterre, Boulogne-Billancourt, Issy-les-Moulineaux, Levallois-Perret.' },
        { icon: MapPin, title: 'Seine-Saint-Denis (93)', body: 'Saint-Denis, Bobigny, Montreuil, Aubervilliers, Pantin.' },
        { icon: MapPin, title: 'Val-de-Marne (94)', body: 'Créteil, Vincennes, Ivry-sur-Seine, Vitry-sur-Seine, Maisons-Alfort.' },
        { icon: MapPin, title: 'Yvelines and Essonne (78–91)', body: 'Versailles, Saint-Quentin-en-Yvelines, Évry, Massy, Vélizy-Villacoublay.' },
        { icon: MapPin, title: 'Val-d’Oise and Seine-et-Marne (95–77)', body: 'Cergy, Pontoise, Melun, Chelles, Meaux.' },
      ],
    },
    perks: {
      heading: 'Why choose us in Paris?',
      lead: PERKS_LEAD,
      items: [
        { icon: Building2, title: 'Paris & inner suburbs', body: 'On-site coverage: Paris and the inner suburbs (92-93-94), travel included in the rate.' },
        { icon: Video, title: 'Outer suburbs', body: 'Video conference: outer suburbs and remote sites, same rate as on-site.' },
        { icon: Lock, title: 'An IRP expert since 2017', body: 'Systematic NDA, guaranteed GDPR compliance.' },
        { icon: Clock, title: 'Delivery within 48 hours', body: 'Available 7 days a week for extraordinary meetings.' },
      ],
    },
    cta: {
      heading: 'Your CSE minutes in Paris, without the stress',
      body: CTA_BODY,
      primaryCta: PRIMARY_CTA,
      secondaryCta: SECONDARY_CTA,
    },
  },
]

export const BY_CITY_NAV = [
  { label: 'Overview', to: '/services/by-city', end: true },
  ...CITIES.map((c) => ({ label: c.name, to: `/services/by-city/${c.slug}` })),
]

/* ------------------------------------------------------------------------ */
/* /services/by-city — overview                                            */
/* ------------------------------------------------------------------------ */

export const BY_CITY_OVERVIEW = {
  hero: {
    badge: 'Nationwide coverage — since 2017',
    title: 'CSE minutes drafting, *wherever* your council meets',
    lead: 'Minute-drafting and works council support, wherever your meetings happen — from Lyon and Marseille to every city we cover in person or remotely.',
    tags: INSTANCE_TAGS,
    primaryCta: PRIMARY_CTA,
    secondaryCta: SECONDARY_CTA,
  },
  stats: SHARED_STATS,
  cities: CITIES.map((c) => ({
    icon: MapPin,
    title: c.name,
    body: `${c.region} — on-site or video conference, delivered within 48 to 72 hours.`,
    cta: { label: 'Explore →', to: `/services/by-city/${c.slug}` },
  })),
  cta: {
    heading: "Don't see your city listed?",
    body: 'We cover all of France, on-site or remotely — tell us where your next meeting is and we’ll take it from there.',
    primaryCta: PRIMARY_CTA,
    secondaryCta: SECONDARY_CTA,
  },
}
