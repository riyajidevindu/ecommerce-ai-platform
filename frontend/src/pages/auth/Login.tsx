import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { NavLink, useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { useAuth } from "@/contexts/AuthContext";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Anchor,
  Box,
  rem,
} from "@mantine/core";
import { Chrome, Facebook } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await login(data.email, data.password);
      notifications.show({
        title: <Text size="lg">Login Successful</Text>,
        message: <Text size="md">Welcome back!</Text>,
        color: "green",
      });
      navigate("/dashboard");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        notifications.show({
          title: <Text size="lg">Login Failed</Text>,
          message: <Text size="md">{error.response.data.detail}</Text>,
          color: "red",
        });
      } else {
        notifications.show({
          title: <Text size="lg">Login Failed</Text>,
          message: <Text size="md">Please try again.</Text>,
          color: "red",
        });
      }
      console.error("Login failed:", error);
    }
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        backgroundSize: "cover",
        backgroundImage:
          "url(https://images.unsplash.com/photo-1484242857719-4b9144542727?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1280&q=80)",
        paddingTop: rem(80),
        paddingBottom: rem(80),
      }}
    >
      <Helmet>
        <title>Login – AI Seller Assistant</title>
        <meta
          name="description"
          content="Sign in to manage your AI automations and e-commerce tools."
        />
        <link rel="canonical" href="/login" />
      </Helmet>
      <Container size={420}>
        <Title
          ta="center"
          style={(theme) => ({
            fontFamily: `Greycliff CF, ${theme.fontFamily}`,
            color: theme.black
          })}
        >
          Welcome back!
        </Title>
        <Text color="dimmed" size="sm" ta="center" mt={5}>
          Do not have an account yet?{" "}
          <Anchor size="sm" component={NavLink} to="/signup">
            Create account
          </Anchor>
        </Text>

        <Paper
          withBorder
          shadow="md"
          p={30}
          mt={30}
          radius="md"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(10px)",
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextInput
              label="Email"
              placeholder="you@example.com"
              required
              size="lg"
              radius="md"
              {...register("email")}
              error={formState.errors.email?.message}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              size="lg"
              radius="md"
              mt="md"
              {...register("password")}
              error={formState.errors.password?.message}
            />
            <Group justify="space-between" mt="lg">
              <Anchor component={NavLink} to="/forgot-password" size="sm">
                Forgot password?
              </Anchor>
            </Group>
            <Button fullWidth mt="xl" type="submit" size="lg" radius="md">
              Sign in
            </Button>
          </form>

          <Text color="dimmed" size="sm" ta="center" mt="lg">
            or continue with
          </Text>

          <Group grow mb="md" mt="md">
            <Button
              radius="xl"
              leftSection={<Chrome />}
              variant="default"
              color="gray"
              component="a"
              href="http://localhost/api/v1/auth/google/login"
            >
              Google
            </Button>
            <Button
              radius="xl"
              leftSection={<Facebook />}
              variant="default"
              color="gray"
            >
              Facebook
            </Button>
          </Group>
        </Paper>
      </Container>
    </Box>
  );
}
