import React from 'react';
import { notFound } from 'next/navigation';
import { getEvents, getEventById } from '@/services/dataService';
import EventDetailClient from './EventDetailClient';


export const revalidate = 60;

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((event) => ({
    id: event.id,
  }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const event = await getEventById(resolvedParams.id);
  if (!event) {
    return { title: 'Event Not Found' };
  }

  return {
    title: `${event.title} | NIT Patna Incubation Center`,
    description: event.description,
    openGraph: {
      title: `${event.title} | NIT Patna Incubation Center`,
      description: event.description,
      images: [event.image],
    },
  };
}

export default async function EventDetailPage({ params }) {
  const resolvedParams = await params;
  const event = await getEventById(resolvedParams.id);

  if (!event) {
    notFound();
  }

  // Structured Schema for Event
  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    image: event.image,
    startDate: event.startDate,
    endDate: event.endDate || event.startDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode:
      event.mode === 'Virtual'
        ? 'https://schema.org/OnlineEventAttendanceMode'
        : event.mode === 'Hybrid'
        ? 'https://schema.org/MixedEventAttendanceMode'
        : 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venue,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Ashok Rajpath',
        addressLocality: 'Patna',
        addressRegion: 'Bihar',
        postalCode: '800005',
        addressCountry: 'IN',
      },
    },
    organizer: {
      '@type': 'Organization',
      name: 'Incubation Center, NIT Patna',
      url: 'https://incubationcenter.nitp.ac.in',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />

      <main className="pt-28 sm:pt-32 pb-20 min-h-screen bg-[#050810] bg-[radial-gradient(#142850_1px,#050810_1px)] [background-size:20px_20px] text-white">
        <div className="site-container px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto">
          <EventDetailClient event={event} />
        </div>
      </main>
    </>
  );
}
