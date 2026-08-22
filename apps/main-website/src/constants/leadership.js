import { CLOUDINARY_BASE_URL, director_profile } from './const';

export const LEADERSHIP_DATA = [
  {
    id: 'director',
    role: 'Director, NIT Patna',
    name: 'Prof. Pradip K. Jain',
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
    link: 'https://www.linkedin.com/in/sgbharat/',
    date: 'Mon, May 25th 2020',
    descriptionHtml: `
      <p>Dr. Bharat Gupta leads the Electronics and Communication Department, spearheading research and educational initiatives in cutting-edge technologies and applications.</p>
    `,
  },
];
