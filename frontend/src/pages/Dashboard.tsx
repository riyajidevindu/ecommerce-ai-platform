import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { motion } from "framer-motion";
import { useProducts } from "@/hooks/useProducts";
import { useCustomerCount } from "@/hooks/useCustomerCount";
import { useAuth } from "@/contexts/AuthContext";

// interactions dataset removed – replaced by dynamic available products data

const sales = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 5200 },
  { name: "Apr", value: 4800 },
  { name: "May", value: 6100 },
  { name: "Jun", value: 7300 },
];

const StatCard = ({ title, value }: { title: string; value: string }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const { products, loading: productsLoading } = useProducts();
  const userProducts = user ? products.filter(p => p.owner_id === user.id) : [];
  const totalProducts = userProducts.length;
  const totalStockQty = userProducts.reduce((sum, p) => sum + (p.stock_qty || 0), 0);
  const { count: customerCount, loading: customerLoading } = useCustomerCount(user?.id);
  const availableProductsData = userProducts.map(p => {
    const stock = p.stock_qty || 0;
    const available = typeof p.available_qty === 'number' ? p.available_qty : stock;
    return {
      name: p.name,
      stock,
      available: Math.min(available, stock),
    };
  });
  // If instead you want total stock quantity across products, you could use:
  // const totalStockQty = products.reduce((sum, p) => sum + (p.stock_qty || 0), 0);

  return (
    <div>
      <Helmet>
        <title>Dashboard – AI Seller Assistant</title>
        <meta name="description" content="Overview of chats, stock alerts, and sales analytics." />
        <link rel="canonical" href="/dashboard" />
      </Helmet>

      <h1 className="text-2xl md:text-3xl font-display font-semibold mb-6 text-foreground">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  <StatCard title="Recent Conversions" value={customerLoading ? "..." : String(customerCount)} />
  <StatCard title="Total Stocks (Products / Units)" value={productsLoading ? "..." : `${totalProducts} / ${totalStockQty}`} />
        <StatCard title="Conversions per Day" value="3.2%" />
      </div>

      <Tabs defaultValue="interactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="interactions">Available Products</TabsTrigger>
          <TabsTrigger value="sales">Customer Interactions</TabsTrigger>
        </TabsList>
        <TabsContent value="interactions">
          <Card>
            <CardHeader>
              <CardTitle>Available Products</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              {productsLoading ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Loading...</div>
              ) : availableProductsData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No products</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={availableProductsData} layout="horizontal">
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" interval={0} angle={-25} textAnchor="end" height={70} />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <RTooltip />
                    <Legend />
                    <Bar dataKey="stock" name="Stock Qty" fill="#ef4444" radius={[6,6,0,0]} />
                    <Bar dataKey="available" name="Available Qty" fill="#22c55e" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Sales</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sales}>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <RTooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
