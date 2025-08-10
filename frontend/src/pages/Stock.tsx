import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const productSchema = z.object({
  name: z.string().min(2),
  price: z.coerce.number().min(0),
  quantity: z.coerce.number().min(0),
  image: z.any().optional(),
});

type Product = z.infer<typeof productSchema> & { id: string };


export default function Stock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const { register, handleSubmit, reset, formState } = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
  });

  const onSubmit = (data: z.infer<typeof productSchema>) => {
    const file = (data.image as FileList | undefined)?.[0];
    const id = Math.random().toString(36).slice(2, 9);
    setProducts((prev) => [
      {
        id,
        name: data.name,
        price: Number(data.price),
        quantity: Number(data.quantity),
        image: file ? URL.createObjectURL(file) : undefined,
      },
      ...prev,
    ]);
    reset();
  };

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
    if (filter === "low") list = list.filter((p) => p.quantity < 5);
    if (filter === "oos") list = list.filter((p) => p.quantity === 0);
    return list;
  }, [products, query, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <Helmet>
        <title>Stock Management – AI Seller Assistant</title>
        <meta name="description" content="Manage products, inventory and pricing." />
        <link rel="canonical" href="/stock" />
      </Helmet>

      <h1 className="text-2xl md:text-3xl font-display font-semibold mb-6">Stock Management</h1>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Product name" {...register("name")} />
                {formState.errors.name && <p className="text-destructive text-sm">Name is required</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" type="number" step="0.01" placeholder="0.00" {...register("price")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" placeholder="0" {...register("quantity")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <Input id="image" type="file" accept="image/*" {...register("image")} />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full">Add</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 mb-3">
          <Input placeholder="Search products..." value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-xs" />
          <Select value={filter} onValueChange={(v) => setFilter(v)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Filter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="low">Low stock</SelectItem>
              <SelectItem value="oos">Out of stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Manage your inventory</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Image</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageData.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>${p.price.toFixed(2)}</TableCell>
                    <TableCell>{p.quantity}</TableCell>
                    <TableCell>
                      {p.image ? (
                        <img src={p.image} alt={`${p.name} image`} className="h-10 w-10 object-cover rounded" loading="lazy" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
              <div className="px-2 py-1 text-sm text-muted-foreground">Page {page} of {totalPages}</div>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
