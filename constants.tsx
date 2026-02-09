
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
];

export const ADDONS: Service[] = [
  { 
    id: 'ft', 
    name: 'French tips', 
    nameFr: 'French classique',
    description: 'Classic or color', 
    descriptionFr: 'Classique ou couleur',
    price: '1$–10$', 
    duration: '+15 mins' 
  },
  { 
    id: 'od', 
    name: 'Other designs', 
    nameFr: 'Autres designs',
    description: 'Custom artistry', 
    descriptionFr: 'Créations personnalisées',
    price: '5$–20$', 
    duration: '+20 mins' 
  },
  { 
    id: '3d', 
    name: '3D designs', 
    nameFr: 'Designs 3D',
    description: 'Sculpted texture', 
    descriptionFr: 'Texture sculptée',
    price: '2$–5$', 
    duration: '+10 mins' 
  },
  { 
    id: 'cg', 
    name: 'Charms / gems', 
    nameFr: 'Bijoux / Gems',
    description: 'Curated jewelry', 
    descriptionFr: 'Bijoux sélectionnés',
    price: '2$–5$', 
    duration: '+5 mins' 
  },
  { 
    id: 'bn', 
    name: 'Bling nails', 
    nameFr: 'Ongles "Bling"',
    description: 'Ultimate luxury', 
    descriptionFr: 'Le luxe ultime',
    price: '3$', 
    duration: '+10 mins' 
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
