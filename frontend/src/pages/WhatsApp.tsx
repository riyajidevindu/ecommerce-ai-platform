import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

export default function WhatsApp() {
  const connected = false;

  return (
    <div>
      <Helmet>
        <title>WhatsApp Integration – AI Seller Assistant</title>
        <meta name="description" content="Connect WhatsApp to sync conversations and automate replies." />
        <link rel="canonical" href="/whatsapp" />
      </Helmet>

      <h1 className="text-2xl md:text-3xl font-display font-semibold mb-6">WhatsApp Integration</h1>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>Connect your WhatsApp Business account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant={connected ? "default" : "secondary"}>
                {connected ? "Connected" : "Not connected"}
              </Badge>
              <Button>{connected ? "Reconnect" : "Connect"}</Button>
            </div>
            <Separator />
            <div>
              <h3 className="text-sm font-medium mb-2">Recent Synced Conversations</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>John Doe – "Order #12345 delivery?"</li>
                <li>Sarah Lee – "Need size guide for jacket"</li>
                <li>ACME Inc. – "Bulk pricing request"</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
