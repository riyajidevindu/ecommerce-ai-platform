import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
        <div className="flex items-center gap-3">
          <Input
            type="text"
            value={whatsappNo}
            onChange={(e) => setWhatsappNo(e.target.value)}
            placeholder="Enter your WhatsApp number (E.164, e.g., +1234567890)"
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
          <Button onClick={onSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
