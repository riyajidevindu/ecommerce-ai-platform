import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";
import { useProducts } from "@/hooks/useProducts";
import { useCustomerCount } from "@/hooks/useCustomerCount";
import { useAuth } from "@/contexts/AuthContext";

const interactions = [
  { name: "Mon", value: 120 },
  { name: "Tue", value: 98 },
  { name: "Wed", value: 160 },
  { name: "Thu", value: 130 },
  { name: "Fri", value: 180 },
  { name: "Sat", value: 90 },
  { name: "Sun", value: 150 },
];

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
  const totalProducts = products.length;
  const { count: customerCount, loading: customerLoading } = useCustomerCount(user?.id);
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
  <StatCard title="Recent Messages" value={customerLoading ? "..." : String(customerCount)} />
        <StatCard title="Total Stocks" value={productsLoading ? "..." : String(totalProducts)} />
        <StatCard title="Conversion Rate per Day" value="3.2%" />
      </div>

      <Tabs defaultValue="interactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="interactions">Customer Interactions</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>
        <TabsContent value="interactions">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Interactions</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={interactions}>
                  <defs>
                    <linearGradient id="colorInteractions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <RTooltip cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeDasharray: 3 }} />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorInteractions)" />
                </AreaChart>
              </ResponsiveContainer>
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
