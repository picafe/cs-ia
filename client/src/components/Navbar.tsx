import {
  ActionIcon,
  Avatar,
  Container,
  Group,
  Menu,
  Tabs,
  Text,
  UnstyledButton,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import Logo from "../icons/Logo";
import {
  IconChevronDown,
  IconHome,
  IconLogout,
  IconLogs,
  IconMoon,
  IconSettings,
  IconSun,
} from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { User } from "../types";

interface NavbarProps {
  user: User | undefined;
}

export default function Navbar({ user }: NavbarProps) {
  const navigate = useNavigate();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  const serverUrl = import.meta.env.VITE_SERVER_URL;

  const logout = async () => {
    try {
      const res = await axios.post(serverUrl + "/user/logout", {}, {
        withCredentials: true,
      });
      if (res.status === 204) navigate("/login");
      else {window.alert(
          "An unexpected error occurred. Please try again later.",
        );}
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        alert("Logout failed:" + err.response.data);
      } else {window.alert(
          "An unexpected error occurred. Please try again later.",
        );}
    }
  };
  return (
    <div>
      <Container fluid>
        <Group justify="space-between">
          <Link
            to="/"
            className="no-underline text-black dark:text-gray-100"
            viewTransition
          >
            <Group gap={4}>
              <Logo />
              <Text size="xl" fw={700}>LearnLog</Text>
            </Group>
          </Link>

          <Group gap="sm">
            <Menu
              width={160}
              position="bottom-end"
              transitionProps={{ transition: "rotate-left", duration: 150 }}
              withArrow
            >
              <Menu.Target>
                <UnstyledButton>
                  <Group gap={6}>
                    <Avatar color="cyan" radius="xl" size={24}>
                      {user?.name.split(" ").map((word) =>
                        word.charAt(0).toUpperCase()
                      )}
                    </Avatar>
                    <Text fw={500} visibleFrom="sm" size="sm" lh={1} mr={2}>
                      {user?.name}
                    </Text>
                    <IconChevronDown className="size-3" stroke={1.5} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  component={Link}
                  to="/settings"
                  leftSection={<IconSettings className="size-4" stroke={1.5} />}
                  viewTransition
                >
                  Settings
                </Menu.Item>
                <Menu.Item
                  onClick={logout}
                  leftSection={
                    <IconLogout
                      className="size-4 stroke-red-600"
                      stroke={1.5}
                    />
                  }
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <ActionIcon
              onClick={() =>
                setColorScheme(
                  computedColorScheme === "light" ? "dark" : "light",
                )}
              variant="default"
              size="md"
              aria-label="Toggle color scheme"
            >
              <IconSun className="hidden dark:block size-5" stroke={1.5} />
              <IconMoon className="block dark:hidden size-5" stroke={1.5} />
            </ActionIcon>
          </Group>
        </Group>
      </Container>
    </div>
  );
}
