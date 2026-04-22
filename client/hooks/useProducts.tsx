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

// Car Products (Top Covers) fetch karne ka hook
export const useCarProducts = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["products", "cars", page, limit],
    queryFn: () => productService.getCarProducts(page, limit),
    placeholderData: (previousData) => previousData,
  });
};

// Bike Products (Top Covers) fetch karne ka hook
export const useBikeProducts = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["products", "bikes", page, limit],
    queryFn: () => productService.getBikeProducts(page, limit),
    placeholderData: (previousData) => previousData,
  });
};
