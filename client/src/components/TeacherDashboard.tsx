import { Container, Select, Tabs } from "@mantine/core";
import { IconHome, IconSettings } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TeacherSettings from "../pages/TeacherSettings";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  let location = useLocation();
  const [activeTab, setActiveTab] = useState<string | null>("home");

  useEffect(() => {
    if (location.pathname === "/teacher/settings") setActiveTab("settings");
    else setActiveTab("home");
  }, [location]);

  // Handles the navigation between home and settings
  const handleNavChange = (value: string | null) => {
    setActiveTab(value || "home");
    if (value === "settings") navigate("/teacher/settings");
    else navigate("/");
  };

  return (
    <>
      <Container fluid className="justify-center">
        <Tabs
          defaultValue="home"
          value={activeTab}
          onChange={handleNavChange}
        >
          <Tabs.List style={{ justifyContent: "center" }}>
            <Tabs.Tab
              value="home"
              leftSection={<IconHome className="size-3" />}
            >
              Home
            </Tabs.Tab>

            <Tabs.Tab
              value="settings"
              leftSection={<IconSettings className="size-3" />}
            >
              Settings
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="home">
            <div>
              <Select
                label="Your favorite library"
                placeholder="Pick value"
                data={["React", "Angular", "Vue", "Svelte"]}
              />
            </div>
          </Tabs.Panel>
          <Tabs.Panel value="settings">
            <TeacherSettings />
          </Tabs.Panel>
        </Tabs>
      </Container>
    </>
  );
}
