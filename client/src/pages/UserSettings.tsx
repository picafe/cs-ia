import { useEffect, useState } from "react";
import {
  IconBell,
  IconCheck,
  IconDownload,
  IconExclamationCircle,
  IconLanguage,
  IconLock,
  IconLogout,
  IconMoon,
  IconPalette,
  IconSettings,
  IconSun,
  IconTrash,
  IconUserCircle,
} from "@tabler/icons-react";
import {
  ActionIcon,
  Alert,
  Avatar,
  Button,
  Card,
  Center,
  Group,
  MantineColorScheme,
  Modal,
  PasswordInput,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import Logo from "../icons/Logo";
import classes from "./UserSettings.module.css";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { User } from "../types";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import Footer from "../components/Footer";
import { authClient, client } from "../lib/client";

const data = [
  { label: "General", icon: IconSettings },
  { label: "Security", icon: IconLock },
  { label: "Notifications", icon: IconBell },
  { label: "Appearance", icon: IconPalette },
  { label: "Delete Account", icon: IconTrash },
];

export default function UserSettings() {
  const user: User = useOutletContext();
  const [active, setActive] = useState("General");
  const navigate = useNavigate();
  const { setColorScheme, colorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const profileForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
    validate: {
      name: (
        value,
      ) => (value.length > 2 ? null : "Name must be at least 3 characters"),
      email: (value) =>
        /^\S+\.+\S+@(student\.)?tdsb\.on\.ca+$/.test(value)
          ? null
          : "Invalid email format",
    },
  });

  useEffect(() => {
    let timer: number | undefined;

    if (success) {
      timer = window.setTimeout(() => {
        setSuccess("");
      }, 5000);
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [success]);

  const passwordForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: {
      currentPassword: (
        value,
      ) => (value ? null : "Current password is required"),
      newPassword: (value) => {
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/[A-Z]/.test(value)) {
          return "Password must include uppercase letter";
        }
        if (!/[a-z]/.test(value)) {
          return "Password must include lowercase letter";
        }
        if (!/[0-9]/.test(value)) return "Password must include a number";
        if (!/[$&+,:;=?@#|'<>.^*()%!-]/.test(value)) {
          return "Password must include a special character";
        }
        return null;
      },
      confirmPassword: (value, { newPassword }) =>
        value === newPassword ? null : "Passwords don't match",
    },
  });

  const notificationForm = useForm({
    initialValues: {
      browserNotifications: "false",
      emailNotifications: "false",
    },
  });

  const fetchNotificationSettings = async () => {
    setNotificationLoading(true);
    setError("");
    try {
      const res = await client.user.notifications.$get();

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        notificationForm.setValues({
          browserNotifications: data.data.browserNotifications.toString(),
          emailNotifications: data.data.emailNotifications.toString(),
        });
      } else {
        throw new Error(data.error || "Failed to fetch notification settings");
      }
    } catch (err: any) {
      console.error("Notification settings fetch error:", err);
    } finally {
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const updateProfile = async (values: { name: string; email: string }) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await client.user.profile.$put({ json: values });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setSuccess("Profile updated successfully");
      } else {
        throw new Error(data.error || "Failed to update profile");
      }
    } catch (err: any) {
      console.error("Profile update error:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (
    values: { currentPassword: string; newPassword: string },
  ) => {
    setPasswordLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await client.user.password.$put({ json: values });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setSuccess("Password updated successfully");
        passwordForm.reset();
      } else {
        throw new Error(data.error || "Failed to update password");
      }
    } catch (err: any) {
      console.error("Password update error:", err);
      setError(err.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const deleteAccount = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await client.user.account.$delete();

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              navigate("/login");
            },
          },
        });
      } else {
        throw new Error(data.error || "Failed to delete account");
      }
    } catch (err: any) {
      console.error("Account deletion error:", err);
      setError(err.message || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  const updateNotifications = async (
    values: { browserNotifications: string; emailNotifications: string },
  ) => {
    const payload = {
      browserNotifications: values.browserNotifications === "true",
      emailNotifications: values.emailNotifications === "true",
    };
    setNotificationLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await client.user.notifications.$put({ json: payload });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setSuccess("Notification preferences updated successfully");
      } else {
        throw new Error(
          data.error || "Failed to update notification preferences",
        );
      }
    } catch (err: any) {
      console.error("Notification update error:", err);
      setError(err.message || "Failed to update notification preferences");
    } finally {
      setNotificationLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError("");
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            navigate("/login");
          },
        },
      });
    } catch (err: any) {
      console.error("Logout error:", err);
      setError("Logout failed. Please try again later.");
      setLoading(false);
    }
  };

  const links = data.map((item) => (
    <a
      className={classes.link}
      data-active={item.label === active || undefined}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setActive(item.label);
        setError("");
        setSuccess("");
      }}
      href="#"
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  return (
    <div className="flex flex-row h-screen overflow-hidden">
      <nav className={classes.navbar}>
        <div className={classes.navbarMain}>
          <Group className={classes.header} justify="space-between">
            <Link
              to="/"
              className="no-underline text-black dark:text-gray-100"
              viewTransition
            >
              <span className="flex justify-center gap-0.5 items-center text-2xl font-bold ">
                <Logo size={28} /> LearnLog
              </span>
            </Link>
            <ActionIcon
              onClick={() =>
                setColorScheme(
                  computedColorScheme === "light" ? "dark" : "light",
                )}
              variant="filled"
              size="md"
              aria-label="Toggle color scheme"
            >
              <IconSun className="hidden dark:block size-5" stroke={1.5} />
              <IconMoon className="block dark:hidden size-5" stroke={1.5} />
            </ActionIcon>
          </Group>

          {links}
        </div>

        <div className={classes.footer}>
          <Group gap={6} className={classes.display}>
            <Avatar color="cyan" radius="xl" size={28}>
              {user?.name?.split(" ").map((word) =>
                word.charAt(0).toUpperCase()
              ).join("")}
            </Avatar>
            <Text fw={500} visibleFrom="sm" size="sm" lh={1} mr={2}>
              {user?.name}
            </Text>
          </Group>
          <a
            href="#"
            className={classes.link}
            onClick={(e) => {
              e.preventDefault();
              logout();
            }}
          >
            <IconLogout className={classes.linkIcon} stroke={1.5} />
            <span>Logout</span>
          </a>
        </div>
      </nav>

      <div className="flex-1 p-6 overflow-y-auto relative">
        {error && (
          <Alert
            color="red"
            title="Error"
            icon={<IconExclamationCircle />}
            withCloseButton
            onClose={() => setError("")}
            mb="md"
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            color="green"
            title="Success"
            icon={<IconCheck />}
            withCloseButton
            onClose={() => setSuccess("")}
            mb="md"
          >
            {success}
          </Alert>
        )}

        {active === "General" && (
          <Stack>
            <Title order={2} mb="md">General Settings</Title>
            <Card withBorder shadow="sm" p="lg" radius="md" mb="md">
              <Title order={3} mb="sm">Profile Information</Title>
              <form onSubmit={profileForm.onSubmit(updateProfile)}>
                <Stack>
                  <TextInput
                    label="Name"
                    placeholder="Your name"
                    {...profileForm.getInputProps("name")}
                    required
                    disabled={loading}
                  />
                  <TextInput
                    label="Email"
                    placeholder="Your email"
                    {...profileForm.getInputProps("email")}
                    required
                    disabled={loading}
                  />
                  <Group justify="flex-end" mt="sm">
                    <Button type="submit" loading={loading}>
                      Save Changes
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Card>
            <Card withBorder shadow="sm" p="lg" radius="md" mb="md">
              <Title order={3} mb="sm">Export Data</Title>
              <Text size="sm" c="dimmed" mb="md">
                Download a copy of your data.
              </Text>
              <Button leftSection={<IconDownload size={16} />} disabled>
                Export Data (Coming Soon)
              </Button>
            </Card>
            <Footer />
          </Stack>
        )}

        {active === "Security" && (
          <Stack>
            <Title order={2} mb="md">Security Settings</Title>
            <Card withBorder shadow="sm" p="lg" radius="md" mb="md">
              <Title order={3} mb="sm">Change Password</Title>
              <form onSubmit={passwordForm.onSubmit(updatePassword)}>
                <Stack>
                  <PasswordInput
                    label="Current Password"
                    placeholder="Enter your current password"
                    {...passwordForm.getInputProps("currentPassword")}
                    required
                    disabled={passwordLoading}
                  />
                  <PasswordInput
                    label="New Password"
                    placeholder="Enter your new password"
                    {...passwordForm.getInputProps("newPassword")}
                    required
                    disabled={passwordLoading}
                  />
                  <PasswordInput
                    label="Confirm New Password"
                    placeholder="Confirm your new password"
                    {...passwordForm.getInputProps("confirmPassword")}
                    required
                    disabled={passwordLoading}
                  />
                  <Group justify="flex-end" mt="sm">
                    <Button type="submit" loading={passwordLoading}>
                      Update Password
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Card>
            <Footer />
          </Stack>
        )}

        {active === "Notifications" && (
          <Stack>
            <Title order={2} mb="md">Notification Settings</Title>
            <Card withBorder shadow="sm" p="lg" radius="md" mb="md">
              <Title order={3} mb="sm">Preferences</Title>
              <Text size="sm" c="dimmed" mb="md">
                Choose how you receive notifications about your activities.
              </Text>
              <form onSubmit={notificationForm.onSubmit(updateNotifications)}>
                <Stack>
                  <Select
                    label="Browser Notifications"
                    placeholder="Select preference"
                    data={[
                      { value: "true", label: "Enabled" },
                      { value: "false", label: "Disabled" },
                    ]}
                    {...notificationForm.getInputProps("browserNotifications")}
                    disabled={notificationLoading}
                  />
                  <Select
                    label="Email Notifications"
                    placeholder="Select preference"
                    data={[
                      { value: "true", label: "Enabled" },
                      { value: "false", label: "Disabled" },
                    ]}
                    {...notificationForm.getInputProps("emailNotifications")}
                    disabled={notificationLoading}
                  />
                  <Group justify="flex-end" mt="sm">
                    <Button
                      type="submit"
                      loading={notificationLoading}
                    >
                      Save Preferences
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Card>
            <Footer />
          </Stack>
        )}

        {active === "Appearance" && (
          <Stack>
            <Title order={2} mb="md">Appearance Settings</Title>
            <Card withBorder shadow="sm" p="lg" radius="md" mb="md">
              <Title order={3} mb="sm">Theme</Title>
              <Stack>
                <Text size="sm" c="dimmed" mb="md">
                  Choose your preferred theme mode.
                </Text>
                <SegmentedControl
                  value={colorScheme}
                  onChange={(value) =>
                    setColorScheme(value as MantineColorScheme)}
                  data={[
                    {
                      value: "light",
                      label: (
                        <Center style={{ gap: 10 }}>
                          <IconSun size={16} stroke={1.5} />
                          <span>Light</span>
                        </Center>
                      ),
                    },
                    {
                      value: "dark",
                      label: (
                        <Center style={{ gap: 10 }}>
                          <IconMoon size={16} stroke={1.5} />
                          <span>Dark</span>
                        </Center>
                      ),
                    },
                    {
                      value: "auto",
                      label: (
                        <Center style={{ gap: 10 }}>
                          <IconSun size={16} stroke={1.5} />/<IconMoon
                            size={16}
                            stroke={1.5}
                          />
                          <span>Auto</span>
                        </Center>
                      ),
                    },
                  ]}
                />
              </Stack>
            </Card>
            <Card withBorder shadow="sm" p="lg" radius="md">
              <Title order={3} mb="sm">Language</Title>
              <Stack>
                <Text size="sm" c="dimmed" mb="md">
                  Select your preferred language.
                </Text>
                <Select
                  data={[
                    { value: "en", label: "English" },
                  ]}
                  defaultValue="en"
                  leftSection={<IconLanguage size={16} />}
                  disabled
                  label="Language (Coming Soon)"
                />
              </Stack>
            </Card>
            <Footer />
          </Stack>
        )}

        {active === "Delete Account" && (
          <Stack>
            <Title order={2} mb="md">Delete Account</Title>
            <Card
              withBorder
              shadow="sm"
              p="lg"
              radius="md"
              mb="md"
              bg="rgba(255, 0, 0, 0.03)"
            >
              <Title order={3} mb="sm" c="red">Danger Zone</Title>
              <Text size="sm" c="dimmed" mb="md">
                Once you delete your account, there is no going back. All your
                data will be permanently lost. Please be certain.
              </Text>
              <Button
                leftSection={<IconTrash size={16} />}
                color="red"
                variant="filled"
                onClick={open}
                loading={loading}
              >
                Delete My Account
              </Button>
            </Card>
            <Modal
              opened={opened}
              onClose={close}
              title="Confirm Account Deletion"
              centered
            >
              <Stack>
                {error && (
                  <Alert
                    color="red"
                    title="Error"
                    icon={<IconExclamationCircle />}
                  >
                    {error}
                  </Alert>
                )}
                <Text size="sm">
                  Are you absolutely sure you want to delete your account? This
                  action cannot be undone.
                </Text>
                <Group justify="flex-end" mt="md">
                  <Button variant="default" onClick={close} disabled={loading}>
                    Cancel
                  </Button>
                  <Button
                    color="red"
                    onClick={deleteAccount}
                    loading={loading}
                  >
                    Yes, Delete My Account
                  </Button>
                </Group>
              </Stack>
            </Modal>
            <Footer />
          </Stack>
        )}
      </div>
    </div>
  );
}
