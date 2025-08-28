import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/useAuth";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { user, isLoading, updateProfile } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Placeholder save handler (extend later to call profile update endpoint when available)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim() || !email.trim()) {
      toast({ title: "Name and email required", variant: "destructive" });
      return;
    }
    if (changingPassword && !newPassword.trim()) {
      toast({ title: "Enter new password or disable password change", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
  const payload: { username?: string; email?: string; current_password?: string; new_password?: string } = {};
      if (name !== user.username) payload.username = name;
      if (email !== user.email) payload.email = email;
      if (changingPassword && newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }
      await updateProfile(payload);
      setCurrentPassword("");
      setNewPassword("");
      setChangingPassword(false);
      toast({ title: "Profile updated" });
    } catch (err) {
      interface AxiosLikeError { response?: { data?: { detail?: string } } }
      const e = err as AxiosLikeError;
      const msg = e.response?.data?.detail || "Update failed";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Helmet>
        <title>Settings – AI Seller Assistant</title>
        <meta name="description" content="Manage profile, security, notifications and theme." />
        <link rel="canonical" href="/settings" />
      </Helmet>

      <h1 className="text-2xl md:text-3xl font-display font-semibold mb-6 text-foreground">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>AI Automation</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="font-medium">Enable automation</div>
              <p className="text-sm text-muted-foreground">Automatically draft replies</p>
            </div>
            <Switch />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="font-medium">Dark / Light Mode</div>
              <p className="text-sm text-muted-foreground">Toggle color scheme</p>
            </div>
            <ThemeToggle />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading profile...</div>
            ) : !user ? (
              <div className="text-sm text-muted-foreground">You are not logged in.</div>
            ) : (
              <form
                onSubmit={handleSave}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center gap-2">
                    <Switch id="change_password" checked={changingPassword} onCheckedChange={setChangingPassword} />
                    <Label htmlFor="change_password">Change password</Label>
                  </div>
                  {changingPassword && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="current_password">Current Password</Label>
                        <Input id="current_password" type="password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} placeholder="Current password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new_password">New Password</Label>
                        <Input id="new_password" type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} placeholder="New password" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
