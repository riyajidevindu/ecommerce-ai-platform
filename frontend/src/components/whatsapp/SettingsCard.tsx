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
        <CardHeader className="p-6">
          <CardTitle className="text-2xl">WhatsApp Configuration</CardTitle>
          <CardDescription className="text-base">
            Connect your WhatsApp account to enable AI-powered messaging.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-12 p-6">
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTitle className="text-lg">Error</AlertTitle>
                <AlertDescription className="text-base">{error}</AlertDescription>
              </Alert>
            )}
            {!whatsappNo && !isLoading && (
              <Alert>
                <AlertTitle className="text-lg">Action Required</AlertTitle>
                <AlertDescription className="text-base">
                  Please enter your WhatsApp number to activate the integration.
                </AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="whatsapp-no" className="text-lg font-medium">WhatsApp Number</Label>
              <Input
                id="whatsapp-no"
                type="text"
                value={whatsappNo}
                onChange={(e) => setWhatsappNo(e.target.value)}
                placeholder="e.g., +1234567890"
                disabled={isLoading}
                className="mt-2 text-lg p-4"
              />
              <p className="text-base text-muted-foreground mt-2">Must be in E.164 format.</p>
            </div>
            <div>
              <Label htmlFor="phone-id" className="text-lg font-medium">Phone Number ID (Optional)</Label>
              <Input
                id="phone-id"
                type="text"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="Enter your Phone Number ID"
                disabled={isLoading}
                className="mt-2 text-lg p-4"
              />
              <p className="text-base text-muted-foreground mt-2">Needed for webhook verification. Leave blank if you're not sure.</p>
            </div>
            <div>
              <Button onClick={onSave} disabled={isLoading} className="w-full md:w-auto text-lg p-6">
                {isLoading ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-8">
            <h3 className="text-2xl font-semibold mb-4">Setup Instructions</h3>
            <ol className="list-decimal list-inside space-y-4 text-lg text-muted-foreground">
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
