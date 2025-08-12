import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { apiClient } from "@/services/api";
import { useTheme } from "next-themes";

interface User {
  id: number;
  name: string;
  whatsapp_no: string | null;
}

export default function WhatsApp() {
  const { theme } = useTheme();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [whatsappNo, setWhatsappNo] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const meResponse = await apiClient.get<User>("/api/v1/users/me");
        const userResponse = await apiClient.get<User>(`/api/v1/whatsapp/users/${meResponse.data.id}`);
        setUser(userResponse.data);
        setWhatsappNo(userResponse.data.whatsapp_no || "");
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const handleSave = async () => {
    if (user) {
      try {
        await apiClient.put(`/api/v1/whatsapp/users/${user.id}?whatsapp_no=${whatsappNo}`);
        const userResponse = await apiClient.get<User>(`/api/v1/whatsapp/users/${user.id}`);
        setUser(userResponse.data);
        setWhatsappNo(userResponse.data.whatsapp_no || "");
        toast({
          title: "Success",
          description: "WhatsApp number updated successfully.",
        });
      } catch (error) {
        console.error("Failed to update WhatsApp number:", error);
        toast({
          title: "Error",
          description: "Failed to update WhatsApp number.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className={`container mx-auto p-4 ${theme === "dark" ? "dark" : ""}`}>
      <Helmet>
        <title>WhatsApp Integration – AI Seller Assistant</title>
        <meta name="description" content="Connect WhatsApp to sync conversations and automate replies." />
        <link rel="canonical" href="/whatsapp" />
      </Helmet>

      <h1 className="text-2xl md:text-3xl font-display font-semibold mb-6">WhatsApp Integration</h1>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle>Your WhatsApp Number</CardTitle>
            <CardDescription>Enter your WhatsApp number to connect your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Input
                type="text"
                value={whatsappNo}
                onChange={(e) => setWhatsappNo(e.target.value)}
                placeholder="Enter your WhatsApp number"
              />
              <Button onClick={handleSave}>Save</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Connected Customers</h2>
        <div className="overflow-x-auto">
          {/* Placeholder for the table of connected customers */}
          <p className="text-muted-foreground">This feature is coming soon.</p>
        </div>
      </div>
    </div>
  );
}
