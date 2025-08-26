import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadFile,
  Product,
} from "@/services/api";
import { apiClient } from "@/services/api";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter as DialogFtr, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Stock = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_qty: "",
    available_qty: "",
    image: "",
    sku: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  const adjustAvailable = async (p: Product, delta: number) => {
    try {
      const currentAvail = typeof p.available_qty === "number" ? p.available_qty : 0;
      const newAvail = clamp(currentAvail + delta, 0, p.stock_qty);
      if (newAvail === currentAvail) return; // no-op

      const payload = {
        name: p.name,
        description: p.description,
        price: p.price,
        stock_qty: p.stock_qty,
        available_qty: newAvail,
        image: p.image,
        sku: p.sku,
      };
      await updateProduct(p.id, payload);
      await fetchProducts(); // refresh list
    } catch (err) {
      console.error("Failed to adjust available quantity:", err);
      alert("Failed to update available quantity. Please try again.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl = formData.image;

    if (imageFile) {
      try {
        const data = await uploadFile(imageFile);
        imageUrl = data.url;
      } catch (error) {
        console.error("Failed to upload image:", error);
        return;
      }
    }

    const productData = selectedProduct
      ? {
          ...formData,
          price: parseFloat(formData.price),
          stock_qty: parseInt(formData.stock_qty, 10),
          available_qty: parseInt(formData.available_qty, 10),
          image: imageUrl,
        }
      : {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock_qty: parseInt(formData.stock_qty, 10),
          image: imageUrl,
          sku: formData.sku,
        };

    console.log("Submitting product data:", productData);
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, productData);
      } else {
        await createProduct(productData);
      }
      fetchProducts();
      closeModal();
    } catch (error) {
      console.error("Failed to save product:", error);
    }
  };

  const handleEdit = (product: Product) => {
    console.log("Editing product:", product);
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock_qty: product.stock_qty.toString(),
      available_qty: product.available_qty.toString(),
      image: product.image,
      sku: product.sku,
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (productId: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId);
        fetchProducts();
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  };

  const openModal = () => {
    setSelectedProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      stock_qty: "",
      available_qty: "",
      image: "",
      sku: "",
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl = apiClient.defaults.baseURL;
    return `${baseUrl}${path}`;
  };

  const formatPrice = (n: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n ?? 0);

  return (
    <div className="container mx-auto p-4">
      <Helmet>
        <title>Stock Management – AI Seller Assistant</title>
        <meta name="description" content="Manage your products, stock levels, and availability." />
        <link rel="canonical" href="/stock" />
      </Helmet>
      <h1 className="text-2xl font-bold mb-4 text-foreground">Stock Management</h1>
      <Button onClick={openModal} className="mb-4">Add Product</Button>

      <Dialog open={isModalOpen} onOpenChange={(open) => (open ? setIsModalOpen(true) : closeModal())}>
        <DialogContent className="sm:max-w-xl bg-background text-foreground border border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedProduct ? "Update the product details below." : "Fill in the details to add a new product."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Name" required className="bg-card text-foreground" />
              </div>

              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Short description" className="bg-card text-foreground" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" type="number" name="price" value={formData.price} onChange={handleInputChange} onWheel={(e) => e.currentTarget.blur()} placeholder="0.00" required className="bg-card text-foreground" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="stock_qty">Stock Quantity</Label>
                  <Input id="stock_qty" type="number" name="stock_qty" value={formData.stock_qty} onChange={handleInputChange} onWheel={(e) => e.currentTarget.blur()} placeholder="0" required className="bg-card text-foreground" />
                </div>
              </div>

              {selectedProduct && (
                <div className="space-y-1">
                  <Label htmlFor="available_qty">Available Quantity</Label>
                  <Input id="available_qty" type="number" name="available_qty" value={formData.available_qty} onChange={handleInputChange} onWheel={(e) => e.currentTarget.blur()} placeholder="0" required className="bg-card text-foreground" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" name="sku" value={formData.sku} onChange={handleInputChange} placeholder="SKU" required className="bg-card text-foreground" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="image">Image</Label>
                  <Input id="image" type="file" onChange={handleFileChange} className="bg-card text-foreground file:text-foreground" />
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB.</p>
                </div>
              </div>
            </div>

            <DialogFtr className="gap-2">
              <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFtr>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card
            key={product.id}
            className="overflow-hidden bg-card/70 backdrop-blur border-border hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="relative">
              {getImageUrl(product.image) ? (
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="w-full aspect-[16/9] object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full aspect-[16/9] flex items-center justify-center bg-muted text-muted-foreground">
                  <span>No image available</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-background/70 text-foreground border">
                  {product.available_qty > 0 ? "In stock" : "Out of stock"}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-background/70 text-foreground border">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>

            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-foreground truncate" title={product.name}>
                {product.name}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground h-10 overflow-hidden">
                {product.description || "No description provided."}
              </p>
              <div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Availability</span>
                  <span>
                    {product.available_qty}/{product.stock_qty}
                  </span>
                </div>
                <div className="mt-1 h-2 w-full rounded bg-muted">
                  <div
                    className={`h-2 rounded ${product.available_qty > 0 ? "bg-emerald-500" : "bg-red-500"}`}
                    style={{ width: `${Math.round((product.available_qty / product.stock_qty) * 100)}%` }}
                    aria-valuenow={Math.round((product.available_qty / product.stock_qty) * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    role="progressbar"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => adjustAvailable(product, -1)}
                    disabled={(product.available_qty ?? 0) <= 0}
                  >
                    −
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => adjustAvailable(product, +1)}
                    disabled={(product.available_qty ?? 0) >= product.stock_qty}
                  >
                    +
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">SKU: {product.sku}</div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleEdit(product)}>
                Edit
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(product.id)}>
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Stock;
