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
        <CardHeader className="p-5">
          <CardTitle className="text-xl">WhatsApp Configuration</CardTitle>
          <CardDescription className="text-sm">
            Connect your WhatsApp account to enable AI-powered messaging.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 p-5">
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTitle className="text-base">Error</AlertTitle>
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
            {!whatsappNo && !isLoading && (
              <Alert>
                <AlertTitle className="text-base">Action Required</AlertTitle>
                <AlertDescription className="text-sm">
                  Please enter your WhatsApp number to activate the integration.
                </AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="whatsapp-no" className="text-sm font-medium">WhatsApp Number</Label>
              <Input
                id="whatsapp-no"
                type="text"
                value={whatsappNo}
                onChange={(e) => setWhatsappNo(e.target.value)}
                placeholder="e.g., +1234567890"
                disabled={isLoading}
                className="mt-2 text-sm p-3"
              />
              <p className="text-xs text-muted-foreground mt-2">Must be in E.164 format.</p>
            </div>
            <div>
              <Label htmlFor="phone-id" className="text-sm font-medium">Phone Number ID (Optional)</Label>
              <Input
                id="phone-id"
                type="text"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="Enter your Phone Number ID"
                disabled={isLoading}
                className="mt-2 text-sm p-3"
              />
              <p className="text-xs text-muted-foreground mt-2">Needed for webhook verification. Leave blank if you're not sure.</p>
            </div>
            <div>
              <Button onClick={onSave} disabled={isLoading} className="w-full md:w-auto text-sm p-3">
                {isLoading ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-8">
            <h3 className="text-lg font-semibold mb-3">Setup Instructions</h3>
            <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
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
