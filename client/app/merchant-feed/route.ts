import { productService } from '@/service/productservice/product.service';
import { NextResponse } from 'next/server';
// Is utility function ko file mein upar add kar dein
function escapeXml(unsafe: string) {
  return unsafe
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
    <link>https://fancystore.store</link>
    <description>Premium Car and Bike Covers</description>
    ${products.map((p: any) => `
    <item>
      <g:id>${p.id || p._id}</g:id>
      <g:title>${escapeXml(p.name)}</g:title>
      <g:description>${p.description ? escapeXml(p.description).substring(0, 5000) : ''}</g:description>
      <g:link>https://fancystore.store/products/${p.id || p._id}</g:link>
      <g:image_link>${p.imageUrl || p.image}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${p.stock > 0 ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${p.price} PKR</g:price>
      <g:brand>Fancy Store</g:brand>
      <g:google_product_category>6010</g:google_product_category> 
    </item>`).join('')}
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