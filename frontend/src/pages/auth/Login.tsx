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
import { NavLink, useNavigate } from "react-router-dom";
import { login } from "@/services/api";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const onSubmit = async (data: FormValues) => {
    try {
      const response = await login(data.email, data.password);
      localStorage.setItem("token", response.access_token);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Login failed. Please try again.");
      }
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Helmet>
        <title>Login – AI Seller Assistant</title>
        <meta name="description" content="Sign in to manage your AI automations and e-commerce tools." />
        <link rel="canonical" href="/login" />
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Enter your email to sign in to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                {formState.errors.password && (
                  <p className="text-destructive text-sm">{formState.errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full">Sign in</Button>
            </form>

            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button variant="secondary"><Mail className="h-4 w-4 mr-2" /> Google</Button>
              <Button variant="secondary"><Github className="h-4 w-4 mr-2" /> Facebook</Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Don’t have an account? <NavLink to="/signup" className="underline">Create one</NavLink>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
