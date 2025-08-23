import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { NavLink } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import {
  TextInput,
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

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // TODO: Implement forgot password API call
      console.log(data);
      notifications.show({
        title: <Text size="lg">Password Reset Link Sent</Text>,
        message: (
          <Text size="md">
            Please check your email for a link to reset your password.
          </Text>
        ),
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: <Text size="lg">Failed to Send Link</Text>,
        message: <Text size="md">Please try again.</Text>,
        color: "red",
      });
      console.error("Forgot password failed:", error);
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
        <title>Forgot Password – AI Seller Assistant</title>
        <meta
          name="description"
          content="Reset your password to regain access to your account."
        />
        <link rel="canonical" href="/forgot-password" />
      </Helmet>
      <Container size={420}>
        <Title
          ta="center"
          style={(theme) => ({
            fontFamily: `Greycliff CF, ${theme.fontFamily}`,
            color: theme.white,
          })}
        >
          Forgot your password?
        </Title>
        <Text color="dimmed" size="sm" ta="center" mt={5}>
          Enter your email to get a reset link
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
            <Button fullWidth mt="xl" type="submit" size="lg" radius="md">
              Send reset link
            </Button>
          </form>
          <Group justify="center" mt="lg">
            <Anchor component={NavLink} to="/login" size="sm">
              Back to login
            </Anchor>
          </Group>
        </Paper>
      </Container>
    </Box>
  );
}
