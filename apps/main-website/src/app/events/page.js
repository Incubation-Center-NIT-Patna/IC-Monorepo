import { getEvents } from '@/services/dataService';
import EventsPageClient from './EventsPageClient';

export const metadata = {
  title: 'Events & Timeline',
  description:
    'Explore upcoming and past entrepreneurship events, hackathons, pitch contests, and bootcamps at NIT Patna Incubation Center.',
};

export const revalidate = 60;

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <main className="pt-24 min-h-screen">
      <div className="site-container px-4 py-8">
        <div className="text-center mb-10 max-w-[820px] mx-auto">
          <h1 className="section-title mb-3">
            Events & <span className="text-[#0ef]">Timeline</span>
          </h1>
          <p className="section-copy">
            Discover flagship pitch competitions, deep-tech conclaves, rapid prototyping workshops, and angel investor roundtables hosted by NIT Patna Incubation Center.
          </p>
        </div>

        <EventsPageClient events={events} />
      </div>
    </main>
  );
}
