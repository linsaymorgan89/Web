// Central content loader: single source of truth for all editable site content.
// The admin panel writes these JSON files; the static build reads them.
import siteRaw from './site.json';
import ratesRaw from './rates.json';
import toursRaw from './tours.json';
import postsRaw from './posts.json';
import galleryRaw from './gallery.json';

export type Post = {
  slug: string;
  title: string;
  date: string;
  category: string;
  answer: string;
  body: string[];
  img?: string;
  imgAlt?: string;
};

export interface SiteContent {
  phone: string;
  email: string;
  onlyfans: string;
  goodwill: { price: string; tagline: string };
  home: { eyebrow: string; lede: string };
  contactFaq: [string, string][];
  goodwillFaq: [string, string][];
  goodwillPerks: string[];
}

export interface RatesContent {
  wishlistUrl: string;
  wishlistLabel: string;
  local: [string, string][];
  touring: [string, string][];
  addons: [string, string][];
}

export type Tour = {
  city: string;
  dates: string;
  blurb: string;
  status: 'upcoming' | 'past';
};

export type GalleryPhoto = {
  img: string;
  alt: string;
};

export const site = siteRaw as unknown as SiteContent;
export const rates = ratesRaw as unknown as RatesContent;
export const tours = toursRaw as unknown as Tour[];
export const posts = (postsRaw as unknown as { posts: Post[]; categories: Record<string, string> }).posts;
export const categories = (postsRaw as unknown as { posts: Post[]; categories: Record<string, string> }).categories;
export const gallery = galleryRaw as unknown as GalleryPhoto[];