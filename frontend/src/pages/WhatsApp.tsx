import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notifications } from "@mantine/notifications";
import { Text } from "@mantine/core";
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
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(whatsappNo)) {
        notifications.show({
          title: <Text size="lg">Error</Text>,
          message: <Text size="md">Invalid phone number format. Please use E.164 format (e.g., +1234567890).</Text>,
          color: "red",
        });
        return;
      }

      try {
        await apiClient.put(`/api/v1/whatsapp/users/${user.id}?whatsapp_no=${whatsappNo}`);
        const userResponse = await apiClient.get<User>(`/api/v1/whatsapp/users/${user.id}`);
        setUser(userResponse.data);
        setWhatsappNo(userResponse.data.whatsapp_no || "");
        notifications.show({
          title: <Text size="lg">Success</Text>,
          message: <Text size="md">WhatsApp number updated successfully.</Text>,
          color: "green",
        });
      } catch (error) {
        console.error("Failed to update WhatsApp number:", error);
        notifications.show({
          title: <Text size="lg">Error</Text>,
          message: <Text size="md">Failed to update WhatsApp number.</Text>,
          color: "red",
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

      <h1 className="text-2xl md:text-3xl font-display font-semibold mb-6 text-foreground">WhatsApp Integration</h1>

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
