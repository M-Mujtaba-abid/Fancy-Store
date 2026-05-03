import { productService } from '@/service/productservice/product.service';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Merchant feed ke liye humein pagination nahi, balki saare products chahiye.
    // Isliye limit ko 1000 ya koi bara number rakhen.
    const data = await productService.getAllProducts(1, 1000); 
    
    // Aapki service res.data.data return kar rahi hai, 
    // to yahan check karein ke products array kahan hai.
    const products = data.products || []; 

    const xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Fancy Store</title>
    <link>https://fancystore.store</link>
    <description>Premium Car and Bike Covers</description>
    ${products.map((p: any) => `
    <item>
      <g:id>${p.id || p._id}</g:id>
      <g:title>${p.name}</g:title>
      <g:description>${p.description ? p.description.replace(/<[^>]*>?/gm, '').substring(0, 5000) : ''}</g:description>
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
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error("Feed Error:", error);
    return new NextResponse("Error fetching products", { status: 500 });
  }
}