import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface SettingsCardProps {
  error: string | null;
  isLoading: boolean;
  whatsappNo: string;
  phoneNumberId: string;
  setWhatsappNo: (v: string) => void;
  setPhoneNumberId: (v: string) => void;
  onSave: () => void;
}

export function SettingsCard({ error, isLoading, whatsappNo, phoneNumberId, setWhatsappNo, setPhoneNumberId, onSave }: SettingsCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Configuration</CardTitle>
          <CardDescription>Connect your WhatsApp account to enable AI-powered messaging.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {!whatsappNo && !isLoading && (
              <Alert>
                <AlertTitle>Action Required</AlertTitle>
                <AlertDescription>
                  Please enter your WhatsApp number to activate the integration.
                </AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="whatsapp-no" className="text-base font-medium">WhatsApp Number</Label>
              <Input
                id="whatsapp-no"
                type="text"
                value={whatsappNo}
                onChange={(e) => setWhatsappNo(e.target.value)}
                placeholder="e.g., +1234567890"
                disabled={isLoading}
                className="mt-1 text-base"
              />
              <p className="text-sm text-muted-foreground mt-1">Must be in E.164 format.</p>
            </div>
            <div>
              <Label htmlFor="phone-id" className="text-base font-medium">Phone Number ID (Optional)</Label>
              <Input
                id="phone-id"
                type="text"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="Enter your Phone Number ID"
                disabled={isLoading}
                className="mt-1 text-base"
              />
              <p className="text-sm text-muted-foreground mt-1">Needed for webhook verification. Leave blank if you're not sure.</p>
            </div>
            <div>
              <Button onClick={onSave} disabled={isLoading} className="w-full md:w-auto text-base">
                {isLoading ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Setup Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-base text-muted-foreground">
              <li>Enter your WhatsApp Business phone number in the E.164 format.</li>
              <li>(Optional) Provide the Phone Number ID from your Meta Developer dashboard.</li>
              <li>Click "Save Configuration" to connect your account.</li>
              <li>Once connected, you can manage customer conversations from the "Customers" tab.</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
