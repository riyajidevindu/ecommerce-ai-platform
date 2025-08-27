import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { register as registerUser } from "@/services/api";
import { notifications } from "@mantine/notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome, Facebook } from "lucide-react";
import { motion } from "framer-motion";
import './Auth.css';

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function Signup() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await registerUser(data.name, data.email, data.password);
      notifications.show({
        title: "Registration Successful",
        message: "You can now log in with your new account.",
        color: "green",
      });
      navigate("/login");
    } catch (error) {
      const detail = error.response?.data?.detail || "Please try again.";
      notifications.show({
        title: "Registration Failed",
        message: detail,
        color: "red",
      });
      console.error("Registration failed:", error);
    }
  };

  return (
    <div
      className="auth-container"
      style={{
        backgroundImage: "url(https://images.unsplash.com/photo-1484242857719-4b9144542727?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80)",
      }}
    >
      <Helmet>
        <title>Sign up – AI Seller Assistant</title>
        <meta name="description" content="Create your account to start automating customer chats and sales." />
        <link rel="canonical" href="/signup" />
      </Helmet>

      <div className="auth-hero">
        <div className="auth-logo">
          <img src="/logo.png" alt="Logo" className="h-12 w-12" />
          <span className="font-bold text-2xl">AI Seller Assistant</span>
        </div>
        <h1 className="text-5xl font-bold mt-4">Create Your Account</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Join our platform and start selling smarter with AI.
        </p>
      </div>

      <div className="auth-form">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Sign Up</CardTitle>
            <CardDescription>Enter your details to create an account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" type="text" placeholder="Your name" {...register("name")} />
                {formState.errors.name && <p className="text-red-500 text-sm mt-1">{formState.errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
                {formState.errors.email && <p className="text-red-500 text-sm mt-1">{formState.errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Your password" {...register("password")} />
                {formState.errors.password && <p className="text-red-500 text-sm mt-1">{formState.errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full text-lg py-6">Create Account</Button>
            </form>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="py-6"><Chrome className="mr-2 h-5 w-5" /> Google</Button>
              <Button variant="outline" className="py-6"><Facebook className="mr-2 h-5 w-5" /> Facebook</Button>
            </div>
            <p className="text-center text-base text-muted-foreground mt-6">
              Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </div>
  );
}
