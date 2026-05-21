import DOMPurify, { Config } from "dompurify";

/**
 * HTML Sanitization utilities using DOMPurify
 * 
 * Use these functions to sanitize any user-generated or external HTML content
 * before rendering to prevent XSS attacks.
 */

// Configure DOMPurify defaults
const defaultConfig: Config = {
  // Allow only safe HTML tags
  ALLOWED_TAGS: [
    "p", "br", "b", "i", "u", "strong", "em", "a", "ul", "ol", "li",
    "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "code", "pre",
    "span", "div", "img", "hr", "table", "thead", "tbody", "tr", "th", "td"
  ],
  // Allow only safe attributes
  ALLOWED_ATTR: [
    "href", "title", "alt", "src", "class", "id", "target", "rel",
    "width", "height", "style"
  ],
  // Force links to open in new tab safely
  ADD_ATTR: ["target", "rel"],
  // Strip data attributes
  FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
  // Forbid javascript: URLs
  FORBID_TAGS: ["script", "style", "iframe", "form", "input", "button"],
};

/**
 * Sanitize HTML content
 * 
 * Usage:
 * const cleanHtml = sanitizeHtml(userContent);
 * <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
 */
export function sanitizeHtml(dirty: string, config?: Config): string {
  return DOMPurify.sanitize(dirty, { ...defaultConfig, ...config }) as string;
}

/**
 * Sanitize and allow only basic text formatting (no links or images)
 */
export function sanitizeBasicText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["p", "br", "b", "i", "u", "strong", "em", "span"],
    ALLOWED_ATTR: ["class"],
  });
}

/**
 * Sanitize rich content (blog posts, tour descriptions)
 * Allows images and links with safe attributes
 */
export function sanitizeRichContent(dirty: string): string {
  const clean = DOMPurify.sanitize(dirty, defaultConfig) as string;
  
  // Post-process to add security attributes to links
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = clean;
  
  // Add rel="noopener noreferrer" to external links
  const links = tempDiv.querySelectorAll("a[href]");
  links.forEach((link) => {
    const href = link.getAttribute("href");
    // Add null/undefined and type check before calling startsWith()
    if (href && typeof href === "string" && (href.startsWith("http://") || href.startsWith("https://"))) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }
  });
  
  return tempDiv.innerHTML;
}

/**
 * Strip all HTML and return plain text
 */
export function stripHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize user input for form fields
 * Escapes HTML entities to prevent injection
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Sanitize URL to prevent javascript: and data: exploits
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== "string") {
    return "#";
  }
  
  const sanitized = url.trim().toLowerCase();
  
  // Block dangerous protocols
  if (
    sanitized.startsWith("javascript:") ||
    sanitized.startsWith("data:") ||
    sanitized.startsWith("vbscript:")
  ) {
    return "#";
  }
  
  return url;
}

/**
 * React-safe HTML rendering hook
 * 
 * Usage:
 * const { createMarkup } = useSanitizedHtml();
 * <div dangerouslySetInnerHTML={createMarkup(htmlContent)} />
 */
export function createSafeMarkup(html: string) {
  return { __html: sanitizeRichContent(html) };
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
  // Basic sanitization - strip HTML
  const stripped = stripHtml(email).trim().toLowerCase();
  
  // Basic email regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(stripped)) {
    return "";
  }
  
  return stripped;
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  // Strip all except digits, +, -, (, ), and spaces
  return stripHtml(phone).replace(/[^\d+\-() ]/g, "").trim();
}

export { DOMPurify };