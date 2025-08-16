import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import ThemeToggle from "@/components/ThemeToggle";

export default function Settings() {
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
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="password">Change Password</Label>
              <Input id="password" type="password" placeholder="New password" />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button>Save changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
