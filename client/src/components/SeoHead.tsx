import { useEffect } from "react";

type SeoHeadProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  robots?: string;
};

function setMeta(selector: string, attribute: "name" | "property", value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, selector.match(/="([^"]+)/)?.[1] || "");
    document.head.appendChild(element);
  }
  element.content = value;
}

export function SeoHead({ title, description, path = "/", image = "/favicon.png", robots = "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" }: SeoHeadProps) {
  useEffect(() => {
    const baseUrl = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, "");
    const canonicalUrl = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
    const imageUrl = image.startsWith("http") ? image : `${baseUrl}${image.startsWith("/") ? image : `/${image}`}`;
    document.title = title;
    setMeta('meta[name="description"]', "name", description);
    setMeta('meta[name="robots"]', "name", robots);
    setMeta('meta[property="og:title"]', "property", title);
    setMeta('meta[property="og:description"]', "property", description);
    setMeta('meta[property="og:url"]', "property", canonicalUrl);
    setMeta('meta[property="og:image"]', "property", imageUrl);
    setMeta('meta[name="twitter:title"]', "name", title);
    setMeta('meta[name="twitter:description"]', "name", description);
    setMeta('meta[name="twitter:image"]', "name", imageUrl);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    const schema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Batalla Cultural",
      alternateName: "La Encuesta BC",
      url: baseUrl,
      inLanguage: "es-ES",
      description,
      publisher: {
        "@type": "Organization",
        name: "Batalla Cultural",
        url: baseUrl,
        sameAs: ["https://x.com/bcultural_es", "https://www.instagram.com/bcultural_es/", "https://bsky.app/profile/bcultural-es.bsky.social"],
      },
    };
    let schemaScript = document.head.querySelector<HTMLScriptElement>("#bc-website-schema");
    if (!schemaScript) {
      schemaScript = document.createElement("script");
      schemaScript.id = "bc-website-schema";
      schemaScript.type = "application/ld+json";
      document.head.appendChild(schemaScript);
    }
    schemaScript.text = JSON.stringify(schema);
  }, [title, description, path, image, robots]);

  return null;
}
