import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { NavLink, useNavigate } from "react-router-dom";
import { register as registerUser } from "@/services/api";
import { notifications } from "@mantine/notifications";
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
        title: <Text size="lg">Registration Successful</Text>,
        message: (
          <Text size="md">You can now log in with your new account.</Text>
        ),
        color: "green",
      });
      navigate("/login");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        notifications.show({
          title: <Text size="lg">Registration Failed</Text>,
          message: <Text size="md">{error.response.data.detail}</Text>,
          color: "red",
        });
      } else {
        notifications.show({
          title: <Text size="lg">Registration Failed</Text>,
          message: <Text size="md">Please try again.</Text>,
          color: "red",
        });
      }
      console.error("Registration failed:", error);
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
        <title>Sign up – AI Seller Assistant</title>
        <meta
          name="description"
          content="Create your account to start automating customer chats and sales."
        />
        <link rel="canonical" href="/signup" />
      </Helmet>
      <Container size={420}>
        <Title
          ta="center"
          style={(theme) => ({
            fontFamily: `Greycliff CF, ${theme.fontFamily}`,
            color: theme.white,
          })}
        >
          Create an account
        </Title>
        <Text color="dimmed" size="sm" ta="center" mt={5}>
          Already have an account?{" "}
          <Anchor size="sm" component={NavLink} to="/login">
            Sign in
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
              label="Name"
              placeholder="Your name"
              required
              size="lg"
              radius="md"
              {...register("name")}
              error={formState.errors.name?.message}
            />
            <TextInput
              label="Email"
              placeholder="you@example.com"
              required
              size="lg"
              radius="md"
              mt="md"
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
            <Button fullWidth mt="xl" type="submit" size="lg" radius="md">
              Create account
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
              href="http://localhost:8000/api/v1/auth/google/login"
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
