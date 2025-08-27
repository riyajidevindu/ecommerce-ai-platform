import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notifications } from "@mantine/notifications";
import { Text } from "@mantine/core";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getWhatsAppUser, createOrUpdateWhatsAppUser, getCurrentUser, getConnectedNumbers, getMessageStats, type MessageStatsRow } from "@/services/api";
import { useTheme } from "next-themes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, RefreshCcw, Phone, Check } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SettingsCard } from "@/components/whatsapp/SettingsCard";
import { CustomersHeader } from "@/components/whatsapp/CustomersHeader";
import { CustomersList } from "@/components/whatsapp/CustomersList";
import { PaginationControls } from "@/components/whatsapp/PaginationControls";
import { AnalyticsCard } from "@/components/whatsapp/AnalyticsCard";

export default function WhatsApp() {
  const { theme } = useTheme();
  const [whatsappNo, setWhatsappNo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [phoneNumberId, setPhoneNumberId] = useState<string>("");
  const [connectedNumbers, setConnectedNumbers] = useState<string[]>([]);
  const [cnLoading, setCnLoading] = useState<boolean>(false);
  const [cnError, setCnError] = useState<string | null>(null);
  const [numQuery, setNumQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [statsByNumber, setStatsByNumber] = useState<Record<string, MessageStatsRow>>({});
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

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

  useEffect(() => {
    const fetchConnected = async () => {
      if (!userId) return;
      setCnLoading(true);
      setCnError(null);
      try {
        const [nums, stats] = await Promise.all([
          getConnectedNumbers(userId),
          getMessageStats(userId),
        ]);
        setConnectedNumbers(nums);
        const map: Record<string, MessageStatsRow> = {};
        stats.forEach((row) => { map[row.whatsapp_no] = row; });
        setStatsByNumber(map);
      } catch (e) {
        setCnError("Failed to load connected numbers.");
      } finally {
        setCnLoading(false);
      }
    };
    fetchConnected();
  }, [userId]);

  const filteredNumbers = connectedNumbers.filter((n) =>
    n.toLowerCase().includes(numQuery.toLowerCase())
  );

  // Pagination + summary helpers
  useEffect(() => {
    setPage(1);
  }, [numQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredNumbers.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const visibleNumbers = filteredNumbers.slice(startIdx, endIdx);

  const sumStats = (keys: string[]) =>
    keys.reduce(
      (acc, k) => {
        const s = statsByNumber[k];
        acc.total += s?.total ?? 0;
        acc.ai += s?.ai ?? 0;
        acc.customer += s?.customer ?? 0;
        return acc;
      },
      { total: 0, ai: 0, customer: 0 }
    );
  const overall = sumStats(filteredNumbers);

  const refreshNumbers = async () => {
    if (!userId) return;
    setCnLoading(true);
    try {
      const [nums, stats] = await Promise.all([
        getConnectedNumbers(userId),
        getMessageStats(userId),
      ]);
      setConnectedNumbers(nums);
      const map: Record<string, MessageStatsRow> = {};
      stats.forEach((row) => { map[row.whatsapp_no] = row; });
      setStatsByNumber(map);
    } catch (e) {
      setCnError("Failed to load connected numbers.");
    } finally {
      setCnLoading(false);
    }
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  };

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

      {/* Hero header */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-r from-emerald-600/10 via-emerald-500/5 to-transparent mb-6">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
              <Phone className="h-5 w-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground">WhatsApp Integration</h1>
          </div>
          <p className="text-sm text-muted-foreground">Connect your number and manage customers reaching you via WhatsApp.</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <SettingsCard
              error={error}
              isLoading={isLoading}
              whatsappNo={whatsappNo}
              phoneNumberId={phoneNumberId}
              setWhatsappNo={setWhatsappNo}
              setPhoneNumberId={setPhoneNumberId}
              onSave={handleSave}
            />
          </TabsContent>

          <TabsContent value="customers">
            <Card>
              <CustomersHeader
                numQuery={numQuery}
                setNumQuery={setNumQuery}
                onRefresh={refreshNumbers}
                cnLoading={cnLoading}
                cnError={cnError}
                summary={{ totalCustomers: filteredNumbers.length, totalMsgs: overall.total, ai: overall.ai, sent: overall.customer }}
              />
              <CardContent>
                {cnLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="h-16 rounded-md bg-muted animate-pulse" />
                    ))}
                  </div>
                ) : filteredNumbers.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No numbers matched{numQuery ? ` "${numQuery}"` : ""}.</div>
                ) : (
                  <div>
                    <CustomersList
                      numbers={visibleNumbers}
                      statsByNumber={statsByNumber}
                      copied={copied}
                      onCopy={handleCopy}
                    />
                    <PaginationControls
                      page={page}
                      totalPages={totalPages}
                      onPrev={() => setPage((p) => Math.max(1, p - 1))}
                      onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsCard stats={Object.values(statsByNumber)} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
