import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
}

const DEFAULT_TITLE = "Eika Africa Experience";
const DEFAULT_DESCRIPTION = "Your trusted gateway to authentic, unforgettable adventures across Africa. Book safari tours, beach holidays, and more.";
const DEFAULT_IMAGE = "/favicon.png";
const SITE_NAME = "Eika Africa Experience";

/**
 * SEO component for dynamic meta tags on each page
 * 
 * Usage:
 * <SEO 
 *   title="12-Day Uganda Safari" 
 *   description="Explore the beauty of Uganda..."
 *   image="/tours/uganda-safari.jpg"
 * />
 */
export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = [],
  image = DEFAULT_IMAGE,
  url,
  type = "website",
  author,
  publishedTime,
  modifiedTime,
  noIndex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Your Home to Unforgettable African Journeys`;
  const canonicalUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const imageUrl = image.startsWith("http") ? image : `${typeof window !== "undefined" ? window.location.origin : ""}${image}`;
  
  const defaultKeywords = [
    "Africa safari",
    "African tours",
    "wildlife safari",
    "Kenya safari",
    "Tanzania safari",
    "Uganda tours",
    "beach holiday Africa",
    "African travel",
    "safari booking",
    "Eika Africa"
  ];
  
  const allKeywords = [...new Set([...defaultKeywords, ...keywords])].join(", ");

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      {author && <meta name="author" content={author} />}
      
      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      
      {/* Article specific */}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@EikaAfrica" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      
      {/* Additional SEO */}
      <meta name="theme-color" content="#C4612C" />
      <meta name="format-detection" content="telephone=yes" />
    </Helmet>
  );
}

/**
 * Generate structured data for a tour (JSON-LD)
 */
export function TourStructuredData({
  name,
  description,
  image,
  price,
  currency = "USD",
  duration,
  destinations,
}: {
  name: string;
  description: string;
  image: string;
  price?: number;
  currency?: string;
  duration: string;
  destinations: string[];
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name,
    description,
    image,
    touristType: "Safari",
    itinerary: {
      "@type": "ItemList",
      itemListElement: destinations.map((dest, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: dest,
      })),
    },
    ...(price && {
      offers: {
        "@type": "Offer",
        price,
        priceCurrency: currency,
        availability: "https://schema.org/InStock",
      },
    }),
    provider: {
      "@type": "TravelAgency",
      name: SITE_NAME,
      url: typeof window !== "undefined" ? window.location.origin : "",
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}

/**
 * Organization structured data for the homepage
 */
export function OrganizationStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: typeof window !== "undefined" ? window.location.origin : "",
    logo: typeof window !== "undefined" ? `${window.location.origin}/favicon.png` : "",
    sameAs: [
      "https://twitter.com/EikaAfrica",
      // Add other social media URLs
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English"],
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}
