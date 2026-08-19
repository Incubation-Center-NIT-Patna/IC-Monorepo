import { CLOUDINARY_BASE_URL, director_profile } from './const';

export const LEADERSHIP_DATA = [
  {
    id: 'director',
    role: 'Director, NIT Patna',
    name: 'Prof. Pradip K. Ray',
    image: `${CLOUDINARY_BASE_URL}/v1782901704/director_yasexw.jpg`,
    accentColor: '#0ef',
    glowClass: 'hover:shadow-[0_0_25px_rgba(0,238,255,0.15)]',
    link: director_profile,
    descriptionHtml: `
      <p>Prof. Pradip K. Jain, Director of NIT Patna, renowned for high-power microwave research, with extensive contributions, publications, and international collaborations in his career.He has made significant contribution in the areas of analysis, modeling and development of high power microwave tubes and gyrotron devices.He has so far guided 20 doctoral theses, published more than 100 research papers in SCI journals and 200 in the conference proceedings beside a patent and authoring six book/monograph chapters. Dr. Jain is a senior member of IEEE, fellow of Institution of Electronics and Telecommunications Engineers of India, Fellow of Institution of Engineers of India and also a fellow of Vacuum Electron Devices and Application Society.</p>
    `,
  },
  {
    id: 'pic',
    role: 'Professor-In-Charge, Incubation Center',
    name: 'Prof. Bharat Gupta',
    image: `${CLOUDINARY_BASE_URL}/v1782901328/prof_bharat_gupta_ubqzlo.jpg`,
    accentColor: '#0ef',
    glowClass: 'hover:shadow-[0_0_25px_rgba(0,238,255,0.15)]',
    link: 'https://www.linkedin.com/in/bharatgupta-nitp/',
    descriptionHtml: `
      <p>Our vision at the Incubation Center is to bridge academia and industry by nurturing deep-tech ventures, fostering interdisciplinary startup collaborations, and mentoring student innovators to transform groundbreaking ideas into sustainable businesses that drive real societal value.</p>
    `,
  },
];
