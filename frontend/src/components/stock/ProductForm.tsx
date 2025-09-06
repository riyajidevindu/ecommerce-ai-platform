import { useState } from "react";
import { Product, uploadFile } from "@/services/api";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  stock_qty: string;
  available_qty?: string;
  image: string;
  sku: string;
};

export function toFormValues(p?: Product): ProductFormValues {
  if (!p)
    return { name: "", description: "", price: "", stock_qty: "", available_qty: "", image: "", sku: "" };
  return {
    name: p.name,
    description: p.description,
    price: p.price.toString(),
    stock_qty: p.stock_qty.toString(),
    available_qty: (p.available_qty ?? 0).toString(),
    image: p.image,
    sku: p.sku,
  };
}

export default function ProductForm({
  initial,
  isEditing,
  onSubmit,
  onCancel,
}: {
  initial: ProductFormValues;
  isEditing: boolean;
  onSubmit: (values: ProductFormValues, uploadedImage?: string) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<ProductFormValues>(initial);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImageFile(e.target.files[0]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let imageUrl = values.image;
    try {
      if (imageFile) {
        const data = await uploadFile(imageFile);
        imageUrl = data.url;
      }
      await onSubmit(values, imageUrl);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-1">
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" name="name" value={values.name} onChange={handleInputChange} placeholder="Name" required className="bg-card text-foreground" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" value={values.description} onChange={handleInputChange} placeholder="Short description" className="bg-card text-foreground" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="price">Price</Label>
            <Input id="price" type="number" name="price" value={values.price} onChange={handleInputChange} onWheel={(e) => e.currentTarget.blur()} placeholder="0.00" required className="bg-card text-foreground" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="stock_qty">Stock Quantity</Label>
            <Input id="stock_qty" type="number" name="stock_qty" value={values.stock_qty} onChange={handleInputChange} onWheel={(e) => e.currentTarget.blur()} placeholder="0" required className="bg-card text-foreground" />
          </div>
        </div>

        {isEditing && (
          <div className="space-y-1">
            <Label htmlFor="available_qty">Available Quantity</Label>
            <Input id="available_qty" type="number" name="available_qty" value={values.available_qty} onChange={handleInputChange} onWheel={(e) => e.currentTarget.blur()} placeholder="0" required className="bg-card text-foreground" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" name="sku" value={values.sku} onChange={handleInputChange} placeholder="SKU" required className="bg-card text-foreground" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="image">Image</Label>
            <Input id="image" type="file" onChange={handleFileChange} className="bg-card text-foreground file:text-foreground" />
            <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
      </div>
    </form>
  );
}
