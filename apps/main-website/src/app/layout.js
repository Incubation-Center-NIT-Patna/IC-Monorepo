import { Bai_Jamjuree } from "next/font/google";
import "./globals.css";
import Footer from "../components/global/Footer";
import Navbar from "../components/global/Navbar";

const baiJamjuree = Bai_Jamjuree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bai-jamjuree",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://incubationcenter.nitp.ac.in";

const siteName = "Incubation Center, NIT Patna";

const siteDescription =
  "Official Incubation Center of National Institute of Technology Patna (NIT Patna). Fostering innovation, seed funding, prototyping workspace, startup mentorship, Pitchtember, and entrepreneurship growth in Bihar.";

export const metadata = {
  metadataBase: new URL(siteUrl),

  applicationName: siteName,

  title: {
    default: `${siteName} | National Institute of Technology Patna`,
    template: `%s | ${siteName}`,
  },

  description: siteDescription,

  keywords: [
    "Incubation Center NIT Patna",
    "NIT Patna Incubation Center",
    "Startup Incubation Bihar",
    "National Institute of Technology Patna",
    "NIT Patna Startups",
    "Pitchtember NIT Patna",
    "Tinkering Lab NIT Patna",
    "Entrepreneurship Cell NIT Patna",
    "E-Summit Bihar",
    "Student Startup Grants",
    "DPIIT Incubator Patna",
    "Bihar Startup Policy",
    "Seed Funding Guidance Patna",
    "Innovation & Entrepreneurship Hub Bihar",
  ],

  authors: [{ name: "Incubation Center, NIT Patna", url: siteUrl }],
  creator: "Incubation Center, NIT Patna",
  publisher: "National Institute of Technology Patna",
  category: "Education & Business Incubation",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName,
    title: `${siteName} | National Institute of Technology Patna`,
    description: siteDescription,
    images: [
      {
        url: "https://res.cloudinary.com/ddb6lsyht/image/upload/v1782884080/ic_logo.png",
        width: 1200,
        height: 630,
        alt: "Incubation Center, NIT Patna",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${siteName} | National Institute of Technology Patna`,
    description: siteDescription,
    images: ["https://res.cloudinary.com/ddb6lsyht/image/upload/v1782884080/ic_logo.png"],
  },

  manifest: "/manifest.webmanifest",

  icons: {
    icon: "/ic_logo.png",
    apple: "/ic_logo.png",
  },

  other: {
    "geo.region": "IN-BR",
    "geo.placename": "Patna, Bihar, India",
    "geo.position": "25.6207;85.1725",
    ICBM: "25.6207, 85.1725",
  },
};

export const viewport = {
  themeColor: "#020409",
  colorScheme: "dark",
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Incubation Center, NIT Patna",
  alternateName: "IC NITP",
  url: siteUrl,
  logo: "https://res.cloudinary.com/ddb6lsyht/image/upload/v1782884080/ic_logo.png",
  sameAs: [
    "https://www.facebook.com/icnitp/",
    "https://www.instagram.com/incubation_nitp/",
    "https://www.linkedin.com/company/incubation-centre-nit-patna/posts/?feedView=all",
    "https://www.nitp.ac.in",
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Ashok Rajpath",
    addressLocality: "Patna",
    addressRegion: "Bihar",
    postalCode: "800005",
    addressCountry: "IN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "Incubation@nitp.ac.in",
    contactType: "Customer Support & Incubation Inquiries",
  },
  parentOrganization: {
    "@type": "CollegeOrUniversity",
    name: "National Institute of Technology Patna",
    url: "https://www.nitp.ac.in",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
      </head>
      <body className={baiJamjuree.variable} suppressHydrationWarning>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}