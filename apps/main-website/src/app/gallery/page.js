import { getGalleryImages } from '@/services/dataService';
import GalleryPageClient from './GalleryPageClient';

export const metadata = {
  title: 'Photo Gallery & Moments',
  description:
    'Browse memorable moments, pitching sessions, hackathons, workshop bootcamps, and award ceremonies at Incubation Center, NIT Patna.',
};

export const revalidate = 60;

export default async function GalleryPage() {
  const images = await getGalleryImages();

  return (
    <main className="pt-24 min-h-screen">
      <div className="site-container px-4 py-8">
        <GalleryPageClient images={images} />
      </div>
    </main>
  );
}
