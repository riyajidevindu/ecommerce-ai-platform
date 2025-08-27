import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

export default function Settings() {
  const { user, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Placeholder save handler (extend later to call profile update endpoint when available)
  const handleSave = (e) => {
    e.preventDefault();
    // TODO: implement update profile API when backend route exists
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
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="password">Change Password</Label>
                  <Input id="password" type="password" placeholder="New password" disabled />
                  <p className="text-xs text-muted-foreground">
                    Password change coming soon.
                  </p>
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" disabled>
                    Save changes
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
