export default function manifest() {
  return {
    name: 'Incubation Center, NIT Patna',
    short_name: 'IC NITP',
    description:
      'Official Incubation Center of National Institute of Technology Patna (NIT Patna). Fostering innovation, seed funding, prototyping workspace, startup mentorship, Pitchtember, and entrepreneurship growth in Bihar.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#020409',
    theme_color: '#0ef',
    categories: ['education', 'business', 'productivity'],
    icons: [
      {
        src: '/ic_logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/ic_logo.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
