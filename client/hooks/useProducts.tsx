import { productService } from "@/service/product.service";
import { ProductMutationInput, ProductUpdateInput } from "@/types/product.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
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

// Admin hooks
export const useAdminProducts = (page: number, limit: number) => {
  return useQuery({
    queryKey: ["admin-products", page, limit],
    queryFn: () => productService.getAdminProducts(page, limit),
    placeholderData: (prev) => prev,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductMutationInput) => productService.createProduct(payload),
    onSuccess: () => {
      toast.success("Product created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create product");
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductUpdateInput }) =>
      productService.updateProduct(id, payload),
    onSuccess: () => {
      toast.success("Product updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update product");
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete product");
    },
  });
};



// hooks wali file mein add karein

// Filtered Products fetch karne ka hook (Best for Shop Page)
// hooks/useProducts.tsx

export const useFilteredProducts = (
  filters: { vehicleType?: string; category?: string; subCategory?: string }, 
  page: number = 1, 
  limit: number = 12
) => {
  return useQuery({
    queryKey: ["products", "filter", filters, page, limit],
    queryFn: () => {
      // Fallback ("top_cover") hata diya
      const categoryName = filters.category; 
      
      const filterOptions = {
        vehicleType: filters.vehicleType,
        subCategory: filters.subCategory
      };

      return productService.getProductsByFilter(categoryName, filterOptions, page, limit);
    },
    placeholderData: (previousData) => previousData, 
    enabled: true, // Ab yeh "All Products" ke liye bhi bina error chalega
  });
};