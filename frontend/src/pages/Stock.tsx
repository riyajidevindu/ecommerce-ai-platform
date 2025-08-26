import { useState, useEffect } from "react";
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
      <h1 className="text-2xl font-bold mb-4 text-foreground">Stock Management</h1>
      <button
        onClick={openModal}
        className=" bg-gray-600 text-white px-4 py-2 rounded mb-4"
      >
        Add Product
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold">
              {selectedProduct ? "Edit Product" : "Add Product"}
            </h3>
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Name"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description"
                  className="w-full p-2 border rounded"
                ></textarea>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="Price"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                <input
                  type="number"
                  name="stock_qty"
                  value={formData.stock_qty}
                  onChange={handleInputChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="Stock Quantity"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              {selectedProduct && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700">Available Quantity</label>
                  <input
                    type="number"
                    name="available_qty"
                    value={formData.available_qty}
                    onChange={handleInputChange}
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="Available Quantity"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              )}
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="SKU"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">
                  Image
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
