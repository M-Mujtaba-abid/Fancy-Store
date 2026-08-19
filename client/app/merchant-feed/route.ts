import { productService } from '@/service/productservice/product.service';
import { NextResponse } from 'next/server';
const SITE_URL = 'https://www.fancystore.store';

// Is utility function ko file mein upar add kar dein
function escapeXml(unsafe: string | null | undefined) {
  // null/undefined guard — pehle `escapeXml(p.name)` null name pe throw kar
  // deta tha aur poora feed 500 ho jata tha
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/<[^>]*>?/gm, '') // HTML tags remove karein
    .replace(/&nbsp;/g, ' ')   // &nbsp; ko space se badlein
    .replace(/[<>&"']/g, (c) => { // XML special characters escape karein
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '"': return '&quot;';
        case "'": return '&apos;';
        default: return c;
      }
    });
}

export async function GET() {
  try {
    const data = await productService.getAllProducts(1, 1000); 
    const products = data.products || []; 

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Fancy Store</title>
    <link>${SITE_URL}</link>
    <description>Premium Car and Bike Covers</description>
    ${products
      // image_link Merchant Center mein required hai. Pehle `${p.imageUrl || p.image}`
      // dono null hone pe literal "undefined" emit karta tha, jisse Google poora
      // item reject kar deta tha. Ab aise items feed se hi nikal dete hain.
      .filter((p: any) => Boolean(p.imageUrl || p.images?.[0]))
      .map((p: any) => {
        const imageLink = p.imageUrl || p.images?.[0];
        // g:product_type = merchant ki apni taxonomy. Yehi field Google Shopping
        // campaign subdivisions aur reporting mein segment hoti hai. Iske bina
        // koi bhi nayi category Google/Meta catalog mein invisible rehti hai,
        // aur helmets wahi Google category mein baithte hain jahan floor mats.
        const productType = escapeXml((p.category || '').replace(/_/g, ' '));
        const subType = escapeXml(p.subCategory || '');
        return `
    <item>
      <g:id>${p.id || p._id}</g:id>
      <g:title>${escapeXml(p.name)}</g:title>
      <g:description>${p.description ? escapeXml(p.description).substring(0, 5000) : ''}</g:description>
      <g:link>${SITE_URL}/products/${p.id || p._id}</g:link>
      <g:image_link>${imageLink}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${p.stock > 0 ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${p.price} PKR</g:price>
      <g:brand>Fancy Store</g:brand>
      <g:google_product_category>6010</g:google_product_category>${
        productType
          ? `
      <g:product_type>${subType ? `${productType} &gt; ${subType}` : productType}</g:product_type>`
          : ''
      }
    </item>`;
      })
      .join('')}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  } catch (error) {
    return new NextResponse("Error fetching products", { status: 500 });
  }
}