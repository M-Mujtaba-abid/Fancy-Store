// "use client";

// import React, { useState } from "react";
// import { useMyOrders } from "@/hooks/useOrders";
// import { Package, Clock, CheckCircle2, Truck, XCircle, Star, Check } from "lucide-react";
// import Link from "next/link";
// import Image from "next/image";
// import AddReviewModal from "@/components/shop/reviews/AddReviewModal";

// // Helper function status colors ke liye
// const getStatusConfig = (status: string) => {
//   switch (status) {
//     case "pending": return { color: "text-yellow-600 bg-yellow-100", icon: Clock };
//     case "processing": return { color: "text-blue-600 bg-blue-100", icon: Package };
//     case "shipped": return { color: "text-purple-600 bg-purple-100", icon: Truck };
//     case "delivered": return { color: "text-green-600 bg-green-100", icon: CheckCircle2 };
//     case "cancelled": return { color: "text-red-600 bg-red-100", icon: XCircle };
//     default: return { color: "text-gray-600 bg-gray-100", icon: Package };
//   }
// };

// export default function MyOrdersPage() {
//   const { data: orders, isLoading, isError } = useMyOrders();

//   // ✅ Review Modal State
//   const [reviewModalOpen, setReviewModalOpen] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState<{ id: string | number, name: string, image: string } | null>(null);

//   // ✅ Open Review Modal
//   const openReviewModal = (item: any) => {
//     setSelectedProduct({
//       id: item.productId,
//       name: item.Product?.name || "Product Name",
//       image: item.Product?.imageUrl || "/placeholder.png"
//     });
//     setReviewModalOpen(true);
//   };

//   if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading orders...</div>;
//   if (isError) return <div className="min-h-screen flex items-center justify-center text-red-500 font-medium">Please login to view your orders.</div>;

//   if (!orders || orders.length === 0) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
//         <Package size={64} className="text-gray-300 mb-4" />
//         <h2 className="text-2xl font-bold mb-2 text-text-main">No orders found</h2>
//         <p className="text-gray-500 mb-6 text-sm sm:text-base">You haven't placed any orders yet. Start exploring our products!</p>
//         <Link href="/products" className="bg-primary hover:bg-primary/90 transition-colors text-white px-6 py-2.5 rounded-full font-medium">
//           Start Shopping
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen py-8 bg-background px-4 sm:px-6 lg:px-8 flex justify-center">
//       {/* Container ki max-width control ki gayi hai taake large screens pe ajeeb na lage */}
//       <div className="w-full max-w-4xl space-y-6">
        
//         <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-text-main">My Orders</h1>

//         {orders.map((order) => {
//           const StatusIcon = getStatusConfig(order.status).icon;
//           const isDelivered = order.status === "delivered";
          
//           return (
//             <div key={order.id} className="bg-card border border-border/50 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              
//               {/* Order Header */}
//               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/50 pb-4 mb-4 gap-3 sm:gap-4">
//                 <div>
//                   <p className="text-sm font-semibold text-text-main mb-0.5">
//                     Order <span className="font-mono text-primary">#{String(order.id).substring(0, 8).toUpperCase()}</span>
//                   </p>
//                   <p className="text-xs text-text-muted">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
//                 </div>
                
//                 <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider w-fit ${getStatusConfig(order.status).color}`}>
//                   <StatusIcon size={14} />
//                   {order.status}
//                 </div>
//               </div>

//               {/* Order Items */}
//               <div className="space-y-4">
//                 {order.OrderItems?.map((item) => {
                  
//                   // NOTE: Backend se check lagana zaroori hai ke user ne review dia hai ya nahi (e.g. item.hasReviewed)
//                   // Abhi ke liye main ek farzi (mock) variable use kar raha hu. Isko apne backend hisaab se update kar lena.
//                   const hasReviewed = item.isReviewed || false; 

//                   return (
//                     <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 py-3 border-b border-border/20 last:border-0">
                      
//                       {/* Product Image & Details Container */}
//                       <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-grow">
//                         {/* Image */}
//                         <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-background rounded-lg overflow-hidden shrink-0 border border-border/60">
//                           <Image src={item.Product?.imageUrl || "/placeholder.png"} alt={item.Product?.name || "Product"} fill className="object-cover" />
//                         </div>
                        
//                         {/* Title, Qty, Price */}
//                         <div className="flex flex-col justify-between h-full py-1">
//                           <Link href={`/products/${item.productId}`} className="font-semibold text-text-main hover:text-primary line-clamp-2 text-sm sm:text-base leading-tight">
//                             {item.Product?.name || "Product Name"}
//                           </Link>
//                           <div className="mt-1 sm:mt-2">
//                             <span className="text-xs sm:text-sm text-text-muted">Qty: {item.quantity}</span>
//                             <span className="mx-2 text-border">|</span>
//                             <span className="text-xs sm:text-sm font-bold text-text-main">Rs. {item.price.toLocaleString()}</span>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Review Buttons Section (Responsive Alignment) */}
//                       {isDelivered && (
//                         <div className="w-full sm:w-auto mt-2 sm:mt-0 flex sm:justify-end">
//                           {hasReviewed ? (
//                             // ✅ Reviewed Button State
//                             <button disabled className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-green-50 text-green-600 border border-green-200 text-xs sm:text-sm font-semibold rounded-lg cursor-default opacity-80">
//                               <Check size={16} />
//                               Review Done
//                             </button>
//                           ) : (
//                             // ⭐️ Write Review Button State
//                             <button 
//                               onClick={() => openReviewModal(item)}
//                               className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white border border-transparent hover:border-primary text-xs sm:text-sm font-semibold rounded-lg transition-all active:scale-95"
//                             >
//                               <Star size={16} />
//                               Write a Review
//                             </button>
//                           )}
//                         </div>
//                       )}
                      
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Order Footer */}
//               <div className="mt-4 pt-4 border-t border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
//                 <span className="text-xs sm:text-sm text-text-muted font-medium bg-background px-3 py-1.5 rounded-md">
//                   Payment: <span className="text-text-main font-bold uppercase">{order.paymentMethod}</span>
//                 </span>
                
//                 <div className="text-left sm:text-right w-full sm:w-auto">
//                   <p className="text-[11px] sm:text-xs text-text-muted uppercase tracking-wide font-bold mb-0.5">Total Amount</p>
//                   <p className="text-lg sm:text-xl font-black text-primary">Rs. {order.totalAmount.toLocaleString()}</p>
//                 </div>
//               </div>
              
//             </div>
//           );
//         })}
//       </div>

//       {/* ✅ Rendering the Review Modal */}
//       <AddReviewModal 
//         isOpen={reviewModalOpen} 
//         onClose={() => setReviewModalOpen(false)} 
//         product={selectedProduct} 
//       />
//     </div>
//   );
// }
































"use client";

import React, { useState } from "react";
import { useMyOrders } from "@/hooks/useOrders";
import { isAuthenticated } from "@/utils/auth";
import { Package, Clock, CheckCircle2, Truck, XCircle, Star, Check, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AddReviewModal from "@/components/shop/reviews/AddReviewModal";

const getStatusConfig = (status: string) => {
  switch (status) {
    case "pending": return { color: "text-yellow-600 bg-yellow-100", icon: Clock };
    case "processing": return { color: "text-blue-600 bg-blue-100", icon: Package };
    case "shipped": return { color: "text-purple-600 bg-purple-100", icon: Truck };
    case "delivered": return { color: "text-green-600 bg-green-100", icon: CheckCircle2 };
    case "cancelled": return { color: "text-red-600 bg-red-100", icon: XCircle };
    default: return { color: "text-gray-600 bg-gray-100", icon: Package };
  }
};

export default function MyOrdersPage() {
  const isUserLoggedIn = isAuthenticated();
  
  // Tracking States (For Guest Users)
  const [searchQuery, setSearchQuery] = useState("");
  const [trackParams, setTrackParams] = useState<{ phone?: string; orderId?: string } | undefined>(undefined);

  // Fetching orders dynamically based on login or guest search parameters
  const { data: orders, isLoading, isError, refetch } = useMyOrders(trackParams);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: string | number, name: string, image: string } | null>(null);

  const openReviewModal = (item: any) => {
    setSelectedProduct({
      id: item.productId,
      name: item.Product?.name || "Product Name",
      image: item.Product?.imageUrl || "/placeholder.png"
    });
    setReviewModalOpen(true);
  };

  // Handle Track Order Search
  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if input is phone number or numerical Order ID
    if (searchQuery.startsWith("03") || searchQuery.startsWith("+92") || searchQuery.length > 9) {
      setTrackParams({ phone: searchQuery.trim() });
    } else {
      setTrackParams({ orderId: searchQuery.trim() });
    }
  };

  return (
    <div className="min-h-screen py-8 bg-background px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
        
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-text-main">My Orders</h1>
        <p className="text-sm text-text-muted mb-6">Track and manage your recent store purchases.</p>

        {/* ======================================================= */}
        {/* GUEST FLOW: SHOW TRACKING BOX IF NOT LOGGED IN */}
        {/* ======================================================= */}
        {!isUserLoggedIn && (
          <div className="bg-card border border-border/60 rounded-2xl p-5 sm:p-6 shadow-sm mb-6">
            <h2 className="text-base font-bold text-text-main mb-2 flex items-center gap-2">
              <Search size={18} className="text-primary" /> Guest Order Tracking
            </h2>
            <p className="text-xs text-text-muted mb-4">Don't have an account? Enter your Order ID or Phone Number used during checkout to get real-time tracking status.</p>
            
            <form onSubmit={handleTrackSearch} className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                placeholder="e.g. 03030646863 or Order ID" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-text-main focus:outline-none focus:border-primary transition-colors"
              />
              <button type="submit" className="bg-primary hover:bg-primary/90 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shrink-0">
                Track Order
              </button>
            </form>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="py-12 text-center text-sm font-medium text-text-muted animate-pulse">
            Fetching order details...
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="p-4 bg-red-50 text-red-600 font-semibold border border-red-100 rounded-xl text-center text-sm">
            Something went wrong while loading the order. Please verify your credentials and try again.
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && (!orders || orders.length === 0) && (
          <div className="bg-card border border-border/40 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <Package size={54} className="text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-text-main mb-1">No Orders Found</h3>
            <p className="text-xs text-text-muted max-w-sm mb-6">
              {isUserLoggedIn 
                ? "You haven't placed any orders from this profile yet." 
                : "Enter your tracking information above to view active guest orders."}
            </p>
            {isUserLoggedIn && (
              <Link href="/products" className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary/95 transition-all">
                Start Shopping
              </Link>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* RENDER ORDERS LIST */}
        {/* ======================================================= */}
        {!isLoading && !isError && orders && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order: any) => {
              const StatusIcon = getStatusConfig(order.status).icon;
              const isDelivered = order.status === "delivered";
              
              return (
                <div key={order.id} className="bg-card border border-border/50 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                  
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/50 pb-4 mb-4 gap-3 sm:gap-4">
                    <div>
                      <p className="text-sm font-semibold text-text-main mb-0.5">
                        Order <span className="font-mono text-primary">#{String(order.id).substring(0, 8).toUpperCase()}</span>
                      </p>
                      <p className="text-xs text-text-muted">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider w-fit ${getStatusConfig(order.status).color}`}>
                      <StatusIcon size={14} />
                      {order.status}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4">
                    {order.OrderItems?.map((item: any) => {
                      const hasReviewed = item.isReviewed || false; 

                      return (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 py-3 border-b border-border/20 last:border-0">
                          
                          {/* Product Image & Details Container */}
                          <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-grow">
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-background rounded-lg overflow-hidden shrink-0 border border-border/60">
                              <Image src={item.Product?.imageUrl || "/placeholder.png"} alt={item.Product?.name || "Product"} fill className="object-cover" />
                            </div>
                            
                            <div className="flex flex-col justify-between h-full py-1">
                              <Link href={`/products/${item.productId}`} className="font-semibold text-text-main hover:text-primary line-clamp-2 text-sm sm:text-base leading-tight">
                                {item.Product?.name || "Product Name"}
                              </Link>
                              <div className="mt-1 sm:mt-2">
                                <span className="text-xs sm:text-sm text-text-muted">Qty: {item.quantity}</span>
                                <span className="mx-2 text-border">|</span>
                                <span className="text-xs sm:text-sm font-bold text-text-main">Rs. {item.price.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Review Buttons Section (Only allowed for logged-in users) */}
                          {isDelivered && isUserLoggedIn && (
                            <div className="w-full sm:w-auto mt-2 sm:mt-0 flex sm:justify-end">
                              {hasReviewed ? (
                                <button disabled className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-green-50 text-green-600 border border-green-200 text-xs sm:text-sm font-semibold rounded-lg cursor-default opacity-80">
                                  <Check size={16} /> Review Done
                                </button>
                              ) : (
                                <button 
                                  onClick={() => openReviewModal(item)}
                                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white border border-transparent hover:border-primary text-xs sm:text-sm font-semibold rounded-lg transition-all active:scale-95"
                                >
                                  <Star size={16} /> Write a Review
                                </button>
                              )}
                            </div>
                          )}
                          
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Footer */}
                  <div className="mt-4 pt-4 border-t border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex flex-col gap-1 text-xs text-text-muted">
                      <span>Payment Method: <strong className="text-text-main uppercase">{order.paymentMethod}</strong></span>
                      {!isUserLoggedIn && <span>Recipient Name: <strong className="text-text-main">{order.fullName}</strong></span>}
                    </div>
                    
                    <div className="text-left sm:text-right w-full sm:w-auto">
                      <p className="text-[11px] sm:text-xs text-text-muted uppercase tracking-wide font-bold mb-0.5">Total Amount</p>
                      <p className="text-lg sm:text-xl font-black text-primary">Rs. {order.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AddReviewModal 
        isOpen={reviewModalOpen} 
        onClose={() => setReviewModalOpen(false)} 
        product={selectedProduct} 
      />
    </div>
  );
}