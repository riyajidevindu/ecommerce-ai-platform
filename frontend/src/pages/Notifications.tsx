import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState } from "react";

const all = [
  { id: "1", title: "Low stock: Blue Hoodie", category: "Stock", read: false },
  { id: "2", title: "WhatsApp reconnected", category: "Integration", read: true },
  { id: "3", title: "New message from Jane", category: "Chat", read: false },
];

export default function Notifications() {
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    return all.filter((n) => (status === "all" ? true : status === "read" ? n.read : !n.read)).filter((n) =>
      category === "all" ? true : n.category.toLowerCase() === category
    );
  }, [status, category]);

  return (
    <div>
      <Helmet>
        <title>Notifications – AI Seller Assistant</title>
        <meta name="description" content="View system notifications and alerts." />
        <link rel="canonical" href="/notifications" />
      </Helmet>

      <h1 className="text-2xl md:text-3xl font-display font-semibold mb-6">Notifications</h1>

      <div className="flex items-center gap-3 mb-4">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="stock">Stock</SelectItem>
            <SelectItem value="integration">Integration</SelectItem>
            <SelectItem value="chat">Chat</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((n) => (
          <Card key={n.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{n.title}</CardTitle>
              <Badge variant="secondary">{n.category}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{n.read ? "Read" : "Unread"}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
