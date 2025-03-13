import { Container, Tabs } from "@mantine/core";
import { IconHome, IconLogs } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Test from "./Test";

export default function StudentDashBoard() {
  const navigate = useNavigate();
  let location = useLocation();

  const [activeTab, setActiveTab] = useState<string | null>('home');


  useEffect(() => {
    if (location.pathname === "/student/logging") setActiveTab("logging");
    else setActiveTab("home");
  }, [location]);

  // Handles the navigation between home and logging
  const handleNavChange = (value: string | null) => {
    setActiveTab(value || "home");
    if (value === "logging") navigate("/teacher/logging");
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
              value="logging"
              leftSection={<IconLogs className="size-3" />}
            >
              Logging
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="home">
            <div>
              <h1>Home</h1>
            </div>
          </Tabs.Panel>
          <Tabs.Panel value="logging">
            <Test />
          </Tabs.Panel>
        </Tabs>
      </Container>
    </>
  );
}
