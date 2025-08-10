import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Github, Mail } from "lucide-react";
import { useMemo } from "react";
import { register as registerUser } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

function getPasswordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
}

export default function Signup() {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const password = watch("password") || "";
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const onSubmit = async (data: FormValues) => {
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success("Registration successful!");
      navigate("/login");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Registration failed. Please try again.");
      }
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Helmet>
        <title>Sign up – AI Seller Assistant</title>
        <meta name="description" content="Create your account to start automating customer chats and sales." />
        <link rel="canonical" href="/signup" />
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create account</CardTitle>
            <CardDescription>Start your journey with AI-powered assistance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your name" {...register("name")} />
                {formState.errors.name && (
                  <p className="text-destructive text-sm">{formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
                {formState.errors.email && (
                  <p className="text-destructive text-sm">{formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
                <div className="h-2 bg-muted rounded">
                  <div
                    className={`h-2 rounded transition-all`} 
                    style={{ width: `${(strength / 4) * 100}%`, backgroundColor: "hsl(var(--primary))" }}
                    aria-label="password strength"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Use 8+ chars, with a number, uppercase, and symbol.</p>
                {formState.errors.password && (
                  <p className="text-destructive text-sm">{formState.errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full">Create account</Button>
            </form>

            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button variant="secondary"><Mail className="h-4 w-4 mr-2" /> Google</Button>
              <Button variant="secondary"><Github className="h-4 w-4 mr-2" /> Facebook</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
