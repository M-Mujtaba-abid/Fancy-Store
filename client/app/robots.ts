// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Auth-gated, per-user pages — koi public unique content nahi, GSC
      // inhe "currently not indexed" report kar raha tha.
      disallow: ['/cart', '/wishlist', '/profile', '/checkout', '/order', '/order-success'],
    },
    sitemap: 'https://www.fancystore.store/sitemap.xml',
  };
}