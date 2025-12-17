import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/dashboard/', '/admin/', '/profile/', '/contracts/*/view', '/auth/callback'],
        },
        sitemap: 'https://helios-contract.vercel.app/sitemap.xml', // Update domain when live
    };
}
