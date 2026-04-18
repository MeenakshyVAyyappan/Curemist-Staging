import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { blogPosts } from '../client/lib/blogs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, '../dist');
const indexHtmlPath = path.join(distDir, 'index.html');

console.log("Starting to generate blog static meta files...");

if (!fs.existsSync(indexHtmlPath)) {
  console.error("Error: dist/index.html not found. This script should run after Vite build.");
  process.exit(1);
}

let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

const websiteName = "Curemist";
const domain = "https://www.curemist.in";

let count = 0;
blogPosts.forEach(post => {
  const dirPath = path.join(distDir, 'blog', post.id);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const imageUrl = post.image.startsWith('http') 
    ? post.image 
    : `${domain}${post.image.startsWith('/') ? '' : '/'}${post.image}`;
  const postUrl = `${domain}/blog/${post.id}`;
  
  const excerptText = post.excerpt ? post.excerpt.replace(/"/g, '&quot;') : '';
  const escapedTitle = post.title.replace(/"/g, '&quot;');

  const metaTags = `
    <!-- Dynamic Initial Meta Tags for Social Sharing Previews (SSG) --->
    <meta property="og:title" content="${escapedTitle} | ${websiteName}" />
    <meta property="og:description" content="${excerptText}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:url" content="${postUrl}" />
    <meta property="og:type" content="article" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapedTitle} | ${websiteName}" />
    <meta name="twitter:description" content="${excerptText}" />
    <meta name="twitter:image" content="${imageUrl}" />
  `;

  // Insert just before the </head> tag for best parsing
  const replacedHtml = indexHtml.replace('</head>', `${metaTags}\n  </head>`);
  
  fs.writeFileSync(path.join(dirPath, 'index.html'), replacedHtml, 'utf8');
  count++;
});

console.log(`Successfully generated meta preview pages for ${count} blogs.`);
