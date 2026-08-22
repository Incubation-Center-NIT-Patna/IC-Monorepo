export default function manifest() {
  return {
    name: 'Incubation Center, NIT Patna',
    short_name: 'IC NITP',
    description:
      'Official Incubation Center club of National Institute of Technology Patna for startups, innovation, mentorship, and entrepreneurship programs.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#020409',
    theme_color: '#020409',
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
