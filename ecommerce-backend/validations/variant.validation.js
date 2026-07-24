import ApiError from "../utils/apiError.js";

/**
 * Validates product variants array for creation or update.
 * Prevents negative price/stock, empty variant types/values, and duplicate variants.
 */
export const validateVariantsPayload = (variants) => {
  if (!variants || !Array.isArray(variants)) return;

  const seenVariants = new Set();
  const seenSKUs = new Set();

  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    
    // Normalize variantType & variantValue (with fallback for legacy materialName)
    const type = (v.variantType || "material").trim().toLowerCase();
    const value = (v.variantValue || v.materialName || "").trim();

    if (!type) {
      throw new ApiError(400, `Variant #${i + 1}: Variant Type is required`);
    }

    if (!value) {
      throw new ApiError(400, `Variant #${i + 1}: Variant Value is required`);
    }

    const price = Number(v.price);
    if (Number.isNaN(price) || price < 0) {
      throw new ApiError(400, `Variant #${i + 1} (${value}): Price cannot be negative or invalid`);
    }

    if (v.salePrice !== undefined && v.salePrice !== null && v.salePrice !== "") {
      const salePrice = Number(v.salePrice);
      if (Number.isNaN(salePrice) || salePrice < 0) {
        throw new ApiError(400, `Variant #${i + 1} (${value}): Sale price cannot be negative`);
      }
      if (salePrice > price) {
        throw new ApiError(400, `Variant #${i + 1} (${value}): Sale price cannot be greater than regular price`);
      }
    }

    const stock = Number(v.stock ?? 0);
    if (Number.isNaN(stock) || stock < 0) {
      throw new ApiError(400, `Variant #${i + 1} (${value}): Stock cannot be negative`);
    }

    // Duplicate variant check (same variantType + variantValue)
    const variantKey = `${type}:${value.toLowerCase()}`;
    if (seenVariants.has(variantKey)) {
      throw new ApiError(400, `Duplicate variant found: ${v.variantType || "Material"} - ${value}`);
    }
    seenVariants.add(variantKey);

    // Duplicate SKU check
    if (v.sku && v.sku.trim()) {
      const skuKey = v.sku.trim().toLowerCase();
      if (seenSKUs.has(skuKey)) {
        throw new ApiError(400, `Duplicate SKU in variants list: ${v.sku}`);
      }
      seenSKUs.add(skuKey);
    }
  }
};
