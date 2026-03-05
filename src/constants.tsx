import { Service, GalleryImage } from './types';

export const SIZINGS: Service[] = [
  { 
    id: 'fs-s', 
    name: 'Full set (short)', 
    nameFr: 'Pose complète (courte)',
    description: 'Clean & natural', 
    descriptionFr: 'Propre et naturel',
    price: '50$', 
    duration: '60+ mins' 
  },
  { 
    id: 'fs-m', 
    name: 'Full set (medium)', 
    nameFr: 'Pose complète (moyenne)',
    description: 'The perfect balance', 
    descriptionFr: 'L\'équilibre parfait',
    price: '55$', 
    duration: '75+ mins' 
  },
  { 
    id: 'fs-ml', 
    name: 'Full set (medium-long)', 
    nameFr: 'Pose complète (mi-longue)',
    description: 'Sophisticated length', 
    descriptionFr: 'Longueur sophistiquée',
    price: '60$', 
    duration: '90+ mins' 
  },
  { 
    id: 'fs-l', 
    name: 'Full set (long)', 
    nameFr: 'Pose complète (longue)',
    description: 'Maximum statement', 
    descriptionFr: 'Style affirmé',
    price: '65$', 
    duration: '105+ mins' 
  },
  {
    id: 'acrylic-toes',
    name: 'Acrylic Toes',
    nameFr: 'Acrylique orteils',
    description: 'Full acrylic set for toes',
    descriptionFr: 'Pose acrylique complète pour les orteils',
    price: '55$',
    duration: '60+ mins'
  },
];

export const ADDONS: Service[] = [
  {
    id: 'tier-1',
    name: 'Tier 1 – Basic Color / French Tips',
    nameFr: 'Tier 1 – Couleur de base / French',
    description: 'Simple color or classic french tips',
    descriptionFr: 'Couleur simple ou french classique',
    price: '10$',
    duration: '+15 mins'
  },
  {
    id: 'tier-2',
    name: 'Tier 2 – Light Design',
    nameFr: 'Tier 2 – Design léger',
    description: 'Simple nail art & light patterns',
    descriptionFr: 'Nail art simple & motifs légers',
    price: '15$',
    duration: '+20 mins'
  },
  {
    id: 'tier-3',
    name: 'Tier 3 – Glam Design',
    nameFr: 'Tier 3 – Design Glam',
    description: 'Light bling & charms included',
    descriptionFr: 'Petits bijoux & charms inclus',
    price: '20$',
    duration: '+30 mins'
  },
  {
    id: 'tier-4',
    name: 'Tier 4 – Luxury Design',
    nameFr: 'Tier 4 – Design Luxe',
    description: 'Extra bling & extra charms',
    descriptionFr: 'Bijoux & charms en abondance',
    price: '25$',
    duration: '+40 mins'
  },
  { 
    id: 'sm', 
    name: 'Simple manicure', 
    nameFr: 'Manucure simple',
    description: 'Essential care', 
    descriptionFr: 'Soin essentiel',
    price: '30$', 
    duration: '45 mins' 
  },
  { 
    id: 'so', 
    name: 'Soak-off', 
    nameFr: 'Dépose (Soak-off)',
    description: 'Safe removal', 
    descriptionFr: 'Retrait en douceur',
    price: '15$', 
    duration: '30 mins' 
  },
];

export const SERVICES: Service[] = [...SIZINGS, ...ADDONS];

export const GALLERY: GalleryImage[] = [];
