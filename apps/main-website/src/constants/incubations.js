import { incubationsData } from './incubationsData';

export const INCUBATIONS_DATA = incubationsData.map((item, index) => ({
  id: `startup-${index + 1}`,
  name: item.name,
  img: item.img || '',
  description: item.description,
  email: item.email || '',
  website: item.email ? `mailto:${item.email}` : '#',
}));
