import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: `${process.env.AUTH_TRUST_HOST}/dashboard/overview`,
      lastModified: new Date()
    }
  ];
}
