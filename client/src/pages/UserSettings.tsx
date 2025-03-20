import { useState, useEffect } from "react";
import {
  IconLogout,
  IconMoon,
  IconPalette,
  IconSettings,
  IconSun,
  IconTrash,
  IconDownload,
  IconLanguage
} from "@tabler/icons-react";
import {
  ActionIcon,
  Avatar,
  Button,
  Card,
  Group,
  Modal,
  PasswordInput,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
  Alert,
  SegmentedControl,
  Center,
  MantineColorScheme,
} from "@mantine/core";
import Logo from "../icons/Logo";
import classes from "./UserSettings.module.css";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import { User } from "../types";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import Footer from "../components/Footer";

const data = [
  { label: "General", icon: IconSettings },
  { label: "Appearance", icon: IconPalette },
];

export default function UserSettings() {
  const user: User = useOutletContext();
  const [active, setActive] = useState("General");
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const navigate = useNavigate();
  const { setColorScheme, colorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);



  // Form for general profile settings
  const profileForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
    validate: {
      name: (value) => (value.length > 2 ? null : "Name must be at least 3 characters"),
      email: (value) =>
        /^\S+\.+\S+@(student\.)?tdsb\.on\.ca+$/.test(value) ? null : "Invalid email format"
    }
  });


  useEffect(() => {
    let timer: number | undefined;

    if (success) {
      timer = window.setTimeout(() => {
        setSuccess("");
      }, 5000);
    }

    // Cleanup function
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [success]);

  // Form for password change
  const passwordForm = useForm({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: {
      currentPassword: (value) => (value ? null : "Current password is required"),
      newPassword: (value) => {
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/[A-Z]/.test(value)) return "Password must include uppercase letter";
        if (!/[a-z]/.test(value)) return "Password must include lowercase letter";
        if (!/[0-9]/.test(value)) return "Password must include a number";
        if (!/[$&+,:;=?@#|'<>.^*()%!-]/.test(value)) return "Password must include a special character";
        return null;
      },
      confirmPassword: (value, { newPassword }) =>
        value === newPassword ? null : "Passwords don't match",
    },
  });

  // Form for notification settings
  const notificationForm = useForm({
    initialValues: {
      browserNotifications: 'false',
      emailNotifications: 'false',
    },
  });


  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true);
      const res = await axios.get(`${serverUrl}/user/profile`, {
        withCredentials: true
      });

      if (res.data.success) {
        profileForm.setValues({
          email: res.data.data.email,
        });
      }
    } catch (err) {
      let errorMessage = "Failed to fetch user profile";
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data.error || errorMessage;
      }
      console.error(errorMessage);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      setNotificationLoading(true);
      const res = await axios.get(`${serverUrl}/user/notifications`, { 
        withCredentials: true 
      });
      console.log(res.data.data);

      if (res.data.data.success) {
        notificationForm.setValues({
          browserNotifications: res.data.data.browserNotifications.toString(),
          emailNotifications: res.data.data.emailNotifications.toString(),
        });
      }
    } catch (err) {
      let errorMessage = "Failed to fetch notification settings";
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data.error || errorMessage;
      }
      console.error(errorMessage);
    } finally {
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();

    fetchNotificationSettings();
  }, []);

  // Update profile settings
  const updateProfile = async (values: { name: string, email: string }) => {
    setError("");
    try {
      setLoading(true);
      const res = await axios.put(
        `${serverUrl}/user/profile`,
        values,
        { withCredentials: true }
      );
      if (res.data.success) {
        setSuccess("Profile updated successfully");
        profileForm.setValues({
          name: values.name,
          email: values.email,
        });
      }
    } catch (err) {
      let errorMessage = "Failed to update profile";
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data.error || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (values: { currentPassword: string, newPassword: string }) => {
    setPasswordLoading(true);
    setError("");
    try {
      const res = await axios.put(
        `${serverUrl}/user/password`,
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
        { withCredentials: true }
      );
      if (res.data.success) {
        setSuccess("Password updated successfully");
        passwordForm.reset();
      }
    } catch (err) {
      let errorMessage = "Failed to update password";
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data.error || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Delete account
  const deleteAccount = async () => {
    setLoading(true);
    try {
      const res = await axios.delete(
        `${serverUrl}/user/account`,
        { withCredentials: true }
      );
      if (res.data.success) {
        navigate('/login');
      }
    } catch (err) {
      let errorMessage = "Failed to delete account";
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data.error || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
      close();
    }
  };

  // Update notification settings
  const updateNotifications = async (values: { browserNotifications: string, emailNotifications: string }) => {
    const vals = {
      browserNotifications: values.browserNotifications === 'true',
      emailNotifications: values.emailNotifications === 'true',
    }
    try {
      setLoading(true);
      const res = await axios.put(
        `${serverUrl}/user/notifications`,
        vals,
        { withCredentials: true }
      );
      if (res.data.success) {
        setSuccess("Notification preferences updated successfully");
      }
    } catch (err) {
      let errorMessage = "Failed to update notification preferences";
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data.error || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const res = await axios.post(serverUrl + "/user/logout", {}, {
        withCredentials: true,
      });
      if (res.status === 200) navigate("/login");
      else {
        window.alert("An unexpected error occurred. Please try again later.");
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        alert("Logout failed:" + err.response.data);
      } else {
        window.alert("An unexpected error occurred. Please try again later.");
      }
    }
  };

  const links = data.map((item) => (
    <a
      className={classes.link}
      data-active={item.label === active || undefined}
      key={item.label}
      onClick={() => {
        setActive(item.label);
      }}
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
            <Avatar color="initials" radius="xl" size={28}>
              {user?.name.split(" ").map((word) =>
                word.charAt(0).toUpperCase()
              )}
            </Avatar>
            <Text fw={500} visibleFrom="sm" size="sm" lh={1} mr={2}>
              {user?.name}
            </Text>
          </Group>
          <a href="#" className={classes.link} onClick={logout}>
            <IconLogout className={classes.linkIcon} stroke={1.5} />
            <span>Logout</span>
          </a>
        </div>
      </nav>

      <div className="flex-1 p-6 overflow-y-auto">
        {active === "General" ? (
          <Stack>
            <Title order={2} mb="md">General Settings</Title>

            {error && (
              <Alert color="red" title="Error" withCloseButton onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert color="green" title="Success" withCloseButton onClose={() => setSuccess("")}>
                {success}
              </Alert>
            )}

            <Card withBorder shadow="sm" p="lg" radius="md" mb="md">
              <Title order={3} mb="md">Profile Information</Title>
              <form onSubmit={profileForm.onSubmit(updateProfile)}>
                <Stack>
                  <TextInput
                    label="Name"
                    placeholder="Your name"
                    {...profileForm.getInputProps('name')}
                    required
                  />
                  <TextInput
                    label="Email"
                    placeholder="Your email"
                    {...profileForm.getInputProps('email')}
                    required
                  />
                  <Group justify="flex-end">
                    <Button type="submit" loading={loading}>Save Changes</Button>
                  </Group>
                </Stack>
              </form>
            </Card>

            <Card withBorder shadow="sm" p="lg" radius="md" mb="md">
              <Title order={3} mb="md">Password</Title>
              <form onSubmit={passwordForm.onSubmit(updatePassword)}>
                <Stack>
                  <PasswordInput
                    label="Current Password"
                    placeholder="Enter your current password"
                    {...passwordForm.getInputProps('currentPassword')}
                    required
                  />
                  <PasswordInput
                    label="New Password"
                    placeholder="Enter your new password"
                    {...passwordForm.getInputProps('newPassword')}
                    required
                  />
                  <PasswordInput
                    label="Confirm New Password"
                    placeholder="Confirm your new password"
                    {...passwordForm.getInputProps('confirmPassword')}
                    required
                  />
                  <Group justify="flex-end">
                    <Button type="submit" loading={passwordLoading}>Update Password</Button>
                  </Group>
                </Stack>
              </form>
            </Card>

            <Card withBorder shadow="sm" p="lg" radius="md" mb="md">
              <Title order={3} mb="md">Notifications</Title>
              <Text mb="md">You will only be notified regarding updates to your activities</Text>
              <form onSubmit={notificationForm.onSubmit(updateNotifications)}>
                <Stack>
                  <Select
                    label="Browser Notifications"
                    placeholder="Select notification preference"
                    data={[
                      { value: 'true', label: 'Enabled' },
                      { value: 'false', label: 'Disabled' },
                    ]}
                    disabled={notificationLoading}
                    value={notificationForm.values.browserNotifications.toString()}
                    onChange={(value) => notificationForm.setFieldValue('browserNotifications', value || 'false')}
                  />
                  <Select
                    label="Email Notifications"
                    placeholder="Select notification preference"
                    data={[
                      { value: 'true', label: 'Enabled' },
                      { value: 'false', label: 'Disabled' },
                    ]}
                    disabled={notificationLoading}
                    value={notificationForm.values.emailNotifications.toString()}
                    onChange={(value) => notificationForm.setFieldValue('emailNotifications', value || 'false')}
                  />
                  <Group justify="flex-end">
                    <Button type="submit" loading={loading || notificationLoading}>Save Preferences</Button>
                  </Group>
                </Stack>
              </form>
            </Card>

            <Card withBorder shadow="sm" p="lg" radius="md" mb="md">
              <Title order={3} mb="md">Export Data</Title>
              <Text mb="md">Download a copy of your data</Text>
              <Button leftSection={<IconDownload size={16} />} disabled>
                Export Data (Coming Soon)
              </Button>
            </Card>

            <Card withBorder shadow="sm" p="lg" radius="md" mb="md" bg="rgba(255, 0, 0, 0.03)">
              <Title order={3} mb="md" c="red">Danger Zone</Title>
              <Text mb="md">Once you delete your account, there is no going back. Please be certain.</Text>
              <Button
                leftSection={<IconTrash size={16} />}
                color="red"
                variant="outline"
                onClick={open}
              >
                Delete Account
              </Button>
            </Card>

            <Modal
              opened={opened}
              onClose={close}
              title="Delete Account"
              centered
            >
              <Stack>
                <Text>Are you sure you want to delete your account? This action is irreversible.</Text>
                <Group justify="flex-end" mt="md">
                  <Button variant="default" onClick={close}>Cancel</Button>
                  <Button color="red" onClick={deleteAccount} loading={loading}>Delete Account</Button>
                </Group>
              </Stack>
            </Modal>
            <Footer />

          </Stack>
        ) : (
          <Stack>
            <Title order={2} mb="md">Appearance Settings</Title>

            <Card withBorder shadow="sm" p="lg" radius="md" mb="md">
              <Title order={3} mb="md">Theme</Title>
              <Stack>
                <Text mb="md">Choose your preferred theme mode</Text>
                <SegmentedControl
                  value={colorScheme}
                  onChange={(value) => setColorScheme(value as MantineColorScheme)}
                  data={[
                    {
                      value: 'light',
                      label: (
                        <Center style={{ gap: 10 }}>
                          <IconSun size={16} stroke={1.5} />
                          <span>Light</span>
                        </Center>
                      ),
                    },
                    {
                      value: 'dark',
                      label: (
                        <Center style={{ gap: 10 }}>
                          <IconMoon size={16} stroke={1.5} />
                          <span>Dark</span>
                        </Center>
                      ),
                    },
                    {
                      value: 'auto',
                      label: (
                        <Center style={{ gap: 10 }}>
                          <IconSun size={16} stroke={1.5} />/<IconMoon size={16} stroke={1.5} />
                          <span>Auto</span>
                        </Center>
                      ),
                    },
                  ]}
                />
              </Stack>
            </Card>

            <Card withBorder shadow="sm" p="lg" radius="md">
              <Title order={3} mb="md">Language</Title>
              <Stack>
                <Text mb="md">Select your preferred language</Text>
                <Select
                  data={[
                    { value: 'en', label: 'English' },
                    { value: 'fr', label: 'Français' },
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
      </div>
    </div>
  );
}