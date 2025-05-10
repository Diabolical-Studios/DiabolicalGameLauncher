// sitemap-builder.js
const fs = require('fs');
const path = require('path');
const routes = require('./sitemap-routes');

// Base URL for your site
const BASE_URL = 'https://launcher.diabolical.studio';

// Function to build the sitemap XML string
const buildSitemap = paths => {
  const urlEntries = paths
    .map(
      route => `
    <url>
      <loc>${BASE_URL}${route}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.8</priority>
    </url>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlEntries}
</urlset>`;
};

// Generate sitemap XML
const sitemapXml = buildSitemap(routes);

// Save the sitemap to the public folder so it’s accessible at /sitemap.xml
const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
fs.writeFileSync(sitemapPath, sitemapXml);

console.log('Sitemap generated at', sitemapPath);
