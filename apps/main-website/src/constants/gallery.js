import { CLOUDINARY_BASE_URL } from './const';

const createImg = (id, path, alt, caption = null) => ({
  id,
  src: `${CLOUDINARY_BASE_URL}/${path}`,
  fullSrc: `${CLOUDINARY_BASE_URL}/${path}`,
  alt,
  caption,
});

export const GALLERY_IMAGES_DATA = [
  createImg('g1', 'v1782885324/img1_llfq3q.jpg', 'Event Photo 1'),
  createImg('g2', 'v1782885312/img2_oqtdxx.jpg', 'Event Photo 2'),
  createImg('g3', 'v1782885306/img3_qt0ixe.jpg', 'Event Photo 3'),
  createImg('g4', 'v1782885303/img4_kaghsf.jpg', 'Event Photo 4'),
  createImg('g5', 'v1782885283/img5_hm4jnm.jpg', 'Event Photo 5'),
  createImg('g6', 'v1782887004/img6_btqcam.jpg', 'Event Photo 6'),
  createImg('g7', 'v1782887052/img7_j6mg4v.jpg', 'Event Photo 7'),
  createImg('g8', 'v1782887048/img8_ipfuws.jpg', 'Event Photo 8'),
  createImg('g9', 'v1782887046/img9_arcgxv.jpg', 'Event Photo 9'),
  createImg('g10', 'v1782887005/img10_l1g4dq.jpg', 'Event Photo 10'),
  createImg('g11', 'v1782887009/img11_zuxe66.jpg', 'Event Photo 11'),
  createImg('g12', 'v1782887029/img12_qcnwhw.jpg', 'Event Photo 12'),
  createImg('g13', 'v1782887043/img13_hy5rv2.jpg', 'Event Photo 13'),
  createImg('g14', 'v1782887019/img14_mu0q19.jpg', 'Event Photo 14'),
  createImg('g15', 'v1782887029/img15_gvvduj.jpg', 'Event Photo 15'),
  createImg('g16', 'v1782886259/img1.jpg', 'Event Photo 16'),
  createImg('g17', 'v1782886253/img2.jpg', 'Event Photo 17'),
  createImg('g18', 'v1782886248/img3.jpg', 'Event Photo 18'),
  createImg('g19', 'v1782886249/img4.jpg', 'Event Photo 19'),
  createImg('g20', 'v1782886261/img5.jpg', 'Event Photo 20'),
  createImg('g21', 'v1782886259/img6.jpg', 'Event Photo 21'),
  createImg('g22', 'v1782886256/img7.jpg', 'Event Photo 22'),
  createImg('g23', 'v1782886255/img8.jpg', 'Event Photo 23'),
];
