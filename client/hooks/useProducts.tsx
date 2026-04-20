import { productService } from "@/service/product.service";
import { useQuery } from "@tanstack/react-query";
// import { productService } from "../services/product.service";

// Sare products fetch karne ka hook
export const useAllProducts = (page: number, limit: number) => {
  return useQuery({
    queryKey: ["products", page, limit],
    queryFn: () => productService.getAllProducts(page, limit),
    placeholderData: (previousData) => previousData, // Pagination smooth karne ke liye
  });
};

// New Arrivals fetch karne ka hook
export const useNewArrivals = () => {
  return useQuery({
    queryKey: ["products", "new-arrivals"],
    queryFn: () => productService.getNewArrivals(1, 10),
  });
};

export const useProductDetails = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id, // Jab tak id na mile, hit na ho
  });
};