import { useCallback, useEffect, useState } from "react";
import { createProduct, deleteProduct, getProducts, Product, updateProduct } from "@/services/api";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const saveProduct = useCallback(
    async (p: Partial<Product> & { id?: number }) => {
      if (p.id) {
        await updateProduct(p.id, p);
      } else {
        const { id, ...rest } = p as any;
        await createProduct(rest as any);
      }
      await fetchProducts();
    },
    [fetchProducts]
  );

  const removeProduct = useCallback(
    async (id: number) => {
      await deleteProduct(id);
      await fetchProducts();
    },
    [fetchProducts]
  );

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  const adjustAvailable = useCallback(
    async (p: Product, delta: number) => {
      const currentAvail = typeof p.available_qty === "number" ? p.available_qty : 0;
      const newAvail = clamp(currentAvail + delta, 0, p.stock_qty);
      if (newAvail === currentAvail) return;
      const payload: Partial<Product> = {
        name: p.name,
        description: p.description,
        price: p.price,
        stock_qty: p.stock_qty,
        available_qty: newAvail,
        image: p.image,
        sku: p.sku,
      };
      await updateProduct(p.id, payload);
      await fetchProducts();
    },
    [fetchProducts]
  );

  return { products, loading, error, fetchProducts, saveProduct, removeProduct, adjustAvailable };
}
