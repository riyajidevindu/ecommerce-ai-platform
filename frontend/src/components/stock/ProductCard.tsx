import { Product } from "@/services/api";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/services/api";
import { formatCurrency } from "@/lib/utils";

function getImageUrl(path?: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const baseUrl = apiClient.defaults.baseURL;
  return `${baseUrl}${path}`;
}

export default function ProductCard({
  product,
  onEdit,
  onDelete,
  onAdjust,
}: {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (id: number) => void;
  onAdjust: (p: Product, delta: number) => void;
}) {
  const percent = product.stock_qty > 0 ? Math.round(((product.available_qty ?? 0) / product.stock_qty) * 100) : 0;
  return (
    <Card className="overflow-hidden bg-card/70 backdrop-blur border-border hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5">
      <div className="relative">
        {getImageUrl(product.image) ? (
          <img src={getImageUrl(product.image)} alt={product.name} className="w-full aspect-[16/9] object-cover" loading="lazy" />
        ) : (
          <div className="w-full aspect-[16/9] flex items-center justify-center bg-muted text-muted-foreground">
            <span>No image available</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-background/70 text-foreground border">
            {(product.available_qty ?? 0) > 0 ? "In stock" : "Out of stock"}
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-background/70 text-foreground border">
            {formatCurrency(product.price)}
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
              className={`h-2 rounded ${(product.available_qty ?? 0) > 0 ? "bg-emerald-500" : "bg-red-500"}`}
              style={{ width: `${percent}%` }}
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => onAdjust(product, -1)} disabled={(product.available_qty ?? 0) <= 0}>
              -
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onAdjust(product, +1)} disabled={(product.available_qty ?? 0) >= product.stock_qty}>
              +
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">SKU: {product.sku}</div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onEdit(product)}>
          Edit
        </Button>
        <Button variant="destructive" onClick={() => onDelete(product.id)}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
