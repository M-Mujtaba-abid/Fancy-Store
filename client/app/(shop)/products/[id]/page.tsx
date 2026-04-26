// import ProductDetailsClient from "@/components/shop/ProductDetailsClient"; // Apne path ke mutabiq verify karein
import ProductDetailsClient from "@/components/shop/share/ProductDetails";
import { productService } from "@/service/product.service";

export const revalidate = 3600; 

// ✅ 1. params ab ek Promise hai, isko type mein specify karein
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  // ✅ 2. params ko await kar ke usme se id nikalen
  const { id } = await params;
  
  if (!id || id === "undefined") return { title: 'Product Not Found' };
  
  try {
    const response = await productService.getProductById(id);
    const product = response?.product || response;
    
    if (!product) return { title: 'Product Not Found' };
    
    return {
      title: `${product.name} | Fancy Store`,
      description: product.description,
      openGraph: {
        images: [product.imageUrl],
      },
    };
  } catch (error) {
    return { title: 'Error loading product' };
  }
}

// ✅ 3. Main component mein bhi params Promise hoga
export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  
  // ✅ 4. Yahan bhi id ko await karein
  const { id } = await params;
  console.log("👉 Resolved Product ID:", id); // Ab yahan undefined nahi aayega!

  if (!id || id === "undefined") {
    return (
      <div className="text-center py-20 text-red-500 font-medium text-2xl">
        Invalid Product ID.
      </div>
    );
  }

  try {
    const response = await productService.getProductById(id);
    const product = response?.product || response;

    if (!product) {
      return (
        <div className="text-center py-20 text-red-500 font-medium text-2xl">
          Product not found.
        </div>
      );
    }

    return <ProductDetailsClient product={product} />;
    
  } catch (error) {
    return (
      <div className="text-center py-20 text-red-500 font-medium text-2xl">
        Something went wrong while fetching the product.
      </div>
    );
  }
}