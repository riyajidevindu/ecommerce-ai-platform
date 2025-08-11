import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import "./Stock.css";

interface Product {
  id: number;
  name: string;
  price: number;
  stock_qty: number;
  available_qty: number;
  description: string;
  image: string;
  sku: string;
}

export default function Stock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetch("http://localhost:8001/api/v1/products/")
      .then((response) => {
        if (!response.ok) throw new Error(`Products fetch failed: ${response.status}`);
        return response.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => console.error("Products load error", err));
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    let imageUrl = selectedProduct?.image || "";

    if (imageFile) {
      const imageFormData = new FormData();
      imageFormData.append("file", imageFile);

      const response = await fetch("http://localhost:8005/upload", {
        method: "POST",
        body: imageFormData,
      });
      if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
      const data = await response.json();
      imageUrl = `http://localhost:8005${data.url}`;
    }

    const newProduct: Partial<Product> = {
      sku: formData.get("sku") as string,
      name: formData.get("name") as string,
      price: parseFloat(formData.get("price") as string),
      stock_qty: parseInt(formData.get("stock_qty") as string),
      description: formData.get("description") as string,
      image: imageUrl,
    };

    if (selectedProduct) {
      newProduct.available_qty = parseInt(formData.get("available_qty") as string);
    }

    const url = selectedProduct
      ? `http://localhost:8001/api/v1/products/${selectedProduct.id}`
      : "http://localhost:8001/api/v1/products/";
    const method = selectedProduct ? "PUT" : "POST";

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProduct),
    })
      .then((response) => response.json())
      .then((data) => {
        if (selectedProduct) {
          setProducts(
            products.map((p) => (p.id === selectedProduct.id ? data : p))
          );
        } else {
          setProducts([...products, data]);
        }
        setOpen(false);
        setSelectedProduct(null);
        setImageFile(null);
      });
  };

  const handleDelete = (productId: number) => {
    fetch(`http://localhost:8001/api/v1/products/${productId}`, {
      method: "DELETE",
    }).then(() => {
      setProducts(products.filter((p) => p.id !== productId));
    });
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Stock</CardTitle>
              <CardDescription>Manage your products.</CardDescription>
            </div>
            <Dialog
              open={open}
              onOpenChange={(isOpen) => {
                setOpen(isOpen);
                if (!isOpen) {
                  setSelectedProduct(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="dialog-content">
                <DialogHeader>
                  <DialogTitle>
                    {selectedProduct ? "Edit Product" : "Add Product"}
                  </DialogTitle>
                  <DialogDescription>
                    Fill in the details of the product.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="sku" className="text-right text-white">
                        SKU
                      </Label>
                      <Input
                        id="sku"
                        name="sku"
                        defaultValue={selectedProduct?.sku}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right text-white">
                        Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={selectedProduct?.name}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right text-white">
                        Price
                      </Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        defaultValue={selectedProduct?.price}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="stock_qty" className="text-right text-white">
                        Stock Quantity
                      </Label>
                      <Input
                        id="stock_qty"
                        name="stock_qty"
                        type="number"
                        defaultValue={selectedProduct?.stock_qty}
                        className="col-span-3"
                      />
                    </div>
                    {selectedProduct && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="available_qty" className="text-right text-white">
                          Available Quantity
                        </Label>
                        <Input
                          id="available_qty"
                          name="available_qty"
                          type="number"
                          defaultValue={selectedProduct?.available_qty}
                          className="col-span-3"
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right text-white">
                        Description
                      </Label>
                      <Input
                        id="description"
                        name="description"
                        defaultValue={selectedProduct?.description}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="image" className="text-right text-white">
                        Image
                      </Label>
                      <Input
                        id="image"
                        name="image"
                        type="file"
                        onChange={(e) =>
                          setImageFile(e.target.files ? e.target.files[0] : null)
                        }
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save</Button>
                    <Button type="button" onClick={() => { setOpen(false); setSelectedProduct(null); setImageFile(null); }}>Close</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock Qty</TableHead>
                <TableHead>Available Qty</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.stock_qty}</TableCell>
                  <TableCell>{product.available_qty}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>
                    <img
                      src={product.image.startsWith("http") ? product.image : `http://localhost:8005${product.image}`}
                      alt={product.name}
                      width="50"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedProduct(product);
                        setOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
