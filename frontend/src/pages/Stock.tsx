import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Product } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProductCard from "@/components/stock/ProductCard";
import ProductForm, { ProductFormValues, toFormValues } from "@/components/stock/ProductForm";
import { useProducts } from "@/hooks/useProducts";

const Stock = () => {
  const { products, loading, error, saveProduct, removeProduct, adjustAvailable } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto p-4">
      <Helmet>
        <title>Stock Management – AI Seller Assistant</title>
        <meta name="description" content="Manage your products, stock levels, and availability." />
        <link rel="canonical" href="/stock" />
      </Helmet>

      <h1 className="text-2xl font-bold mb-4 text-foreground">Stock Management</h1>

      <div className="mb-4 flex items-center justify-between">
        <Button onClick={openModal}>Add Product</Button>
        {loading && <span className="text-sm text-muted-foreground">Loading…</span>}
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl bg-background text-foreground border border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedProduct ? "Update the product details below." : "Fill in the details to add a new product."}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            initial={toFormValues(selectedProduct ?? undefined)}
            isEditing={!!selectedProduct}
            onCancel={() => setIsModalOpen(false)}
            onSubmit={async (vals: ProductFormValues, imageUrl?: string) => {
              const payload = selectedProduct
                ? {
                    id: selectedProduct.id,
                    name: vals.name,
                    description: vals.description,
                    price: parseFloat(vals.price),
                    stock_qty: parseInt(vals.stock_qty, 10),
                    available_qty: parseInt(vals.available_qty || "0", 10),
                    image: imageUrl,
                    sku: vals.sku,
                  }
                : {
                    name: vals.name,
                    description: vals.description,
                    price: parseFloat(vals.price),
                    stock_qty: parseInt(vals.stock_qty, 10),
                    image: imageUrl!,
                    sku: vals.sku,
                  };
              await saveProduct(payload as any);
              setIsModalOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAdjust={adjustAvailable}
            onEdit={(p) => {
              setSelectedProduct(p);
              setIsModalOpen(true);
            }}
            onDelete={async (id) => {
              if (window.confirm("Are you sure you want to delete this product?")) {
                await removeProduct(id);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Stock;
