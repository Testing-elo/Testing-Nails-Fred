
export interface Service {
  id: string;
  name: string;
  nameFr?: string;
  description: string;
  descriptionFr?: string;
  price: string;
  duration: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
}

export interface Appointment {
  serviceId: string;
  date: string;
  time: string;
  customerName: string;
  email: string;
}
