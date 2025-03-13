import { useState } from "react";
import {
  IconBellRinging,
  IconLogout,
  IconMoon,
  IconPalette,
  IconSettings,
  IconSun,
} from "@tabler/icons-react";
import {
  ActionIcon,
  Avatar,
  Group,
  Text,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import Logo from "../icons/Logo";
import classes from "./UserSettings.module.css";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import { User } from "../types";

const data = [
  { link: "", label: "General", icon: IconSettings },
  { link: "", label: "Appearance", icon: IconPalette },
  { link: "", label: "Notifications", icon: IconBellRinging },
];

export default function UserSettings() {
  const user: User = useOutletContext();
  const [active, setActive] = useState("General");
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const navigate = useNavigate();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  const links = data.map((item) => (
    <a
      className={classes.link}
      data-active={item.label === active || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setActive(item.label);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

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
    <>
      <nav className={classes.navbar}>
        <div className={classes.navbarMain}>
          <Group className={classes.header} justify="space-between">
            <Link to="/" className="no-underline text-black dark:text-gray-100" viewTransition>
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
      <div>
      </div>
    </>
  );
}
