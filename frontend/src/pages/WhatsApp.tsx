import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notifications } from "@mantine/notifications";
import { Text } from "@mantine/core";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getWhatsAppUser, createOrUpdateWhatsAppUser, getCurrentUser } from "@/services/api";
import { useTheme } from "next-themes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function WhatsApp() {
  const { theme } = useTheme();
  const [whatsappNo, setWhatsappNo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [phoneNumberId, setPhoneNumberId] = useState<string>("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const meResponse = await getCurrentUser();
        setUserId(meResponse.id);
  const whatsappUser = await getWhatsAppUser(meResponse.id);
  setWhatsappNo(whatsappUser.whatsapp_no || "");
  setPhoneNumberId(whatsappUser.phone_number_id || "");
      } catch (error) {
        setError("Failed to fetch user data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleSave = async () => {
    if (userId) {
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(whatsappNo)) {
        notifications.show({
          title: <Text size="lg">Error</Text>,
          message: <Text size="md">Invalid phone number format. Please use E.164 format (e.g., +1234567890).</Text>,
          color: "red",
        });
        return;
      }

      setIsLoading(true);
      try {
        await createOrUpdateWhatsAppUser(userId, { whatsapp_no: whatsappNo, phone_number_id: phoneNumberId || undefined });
        notifications.show({
          title: <Text size="lg">Success</Text>,
          message: <Text size="md">WhatsApp number updated successfully.</Text>,
          color: "green",
        });
      } catch (error) {
        setError("Failed to update WhatsApp number.");
      } finally {
        setIsLoading(false);
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
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {!whatsappNo && !isLoading && (
              <Alert>
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  You have not set a WhatsApp number. Please set one to enable WhatsApp integration.
                </AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Input
                  type="text"
                  value={whatsappNo}
                  onChange={(e) => setWhatsappNo(e.target.value)}
                  placeholder="Enter your WhatsApp number"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label className="mb-1 block">Phone Number ID (optional)</Label>
                <Input
                  type="text"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  placeholder="Enter your WhatsApp Phone Number ID"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground mt-1">Used to verify webhooks and route messages correctly. Leave blank if unsure.</p>
              </div>
              <div>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save"}
                </Button>
              </div>
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
