import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Loader,
  Paper,
  Progress,
  RingProgress,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconCheckbox,
  IconClock,
  IconEye,
  IconHome,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const getStatusColor = (status: string) => {
  switch (status) {
    case "NOT_STARTED":
      return "gray";
    case "ON_TRACK":
      return "green";
    case "COMPLETED":
      return "teal";
    case "ALERT":
      return "red";
    case "CONCERN":
      return "orange";
    default:
      return "gray";
  }
};

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string | null>("home");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);

  const serverUrl = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    if (location.pathname === "/") setActiveTab("home");
    else setActiveTab("settings");
  }, [location]);

  // Fetch dashboard data from the API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${serverUrl}/teacher/dashboard`, {
          withCredentials: true,
        });

        if (res.data.success) {
          setDashboardData(res.data.data);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [serverUrl]);

  // Handles the navigation between home and settings
  const handleNavChange = (value: string | null) => {
    setActiveTab(value || "home");
    if (value === "settings") navigate("/teacher/settings");
    else navigate("/");
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((word) => word.charAt(0).toUpperCase()).join("");
  };

  if (loading) {
    return (
      <Container className="flex justify-center items-center h-64">
        <Loader size="xl" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="flex justify-center items-center h-64">
        <Paper p="md" shadow="xs" radius="md" withBorder>
          <Text color="red" size="lg">{error}</Text>
          <Button mt="md" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Paper>
      </Container>
    );
  }

  // If no classes found
  if (!dashboardData?.classes || dashboardData.classes.length === 0) {
    return (
      <Container className="flex justify-center items-center h-64">
        <Paper p="md" shadow="xs" radius="md" withBorder>
          <Title order={3} mb="md">No classes found</Title>
          <Text mb="lg">You haven't created any classes yet.</Text>
          <Button component={Link} to="/class/new">
            Create Your First Class
          </Button>
        </Paper>
      </Container>
    );
  }

  const classStats = dashboardData.classes[selectedClassIndex];
  const studentData = classStats.students;

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
            <Container size="xl" mt="md">
              <Paper p="md" shadow="xs" radius="md" withBorder>
                <Group justify="space-between" mb="md">
                  <Title order={3}>Class Dashboard</Title>
                  <Select
                    value={selectedClassIndex.toString()}
                    onChange={(value) =>
                      setSelectedClassIndex(parseInt(value || "0"))}
                    data={dashboardData.classes.map((
                      c: any,
                      index: number,
                    ) => ({
                      value: index.toString(),
                      label: c.name,
                    }))}
                    w={250}
                  />
                </Group>

                <Grid>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card p="md" radius="md" withBorder>
                      <Stack align="center">
                        <Text fw={500} c="dimmed" mb="xs">Class Progress</Text>
                        <RingProgress
                          size={180}
                          thickness={16}
                          roundCaps
                          sections={[
                            {
                              value: (classStats.onTrackCount /
                                    classStats.totalStudents) * 100 || 0,
                              color: "green",
                              tooltip: "On Track",
                            },
                            {
                              value: (classStats.concernCount /
                                    classStats.totalStudents) * 100 || 0,
                              color: "orange",
                              tooltip: "Concern",
                            },
                            {
                              value: (classStats.alertCount /
                                    classStats.totalStudents) * 100 || 0,
                              color: "red",
                              tooltip: "Alert",
                            },
                          ]}
                          label={
                            <Text ta="center" fw={700} size="xl">
                              {classStats.avgProgress}%
                            </Text>
                          }
                        />
                        <Group mt="xs">
                          <Badge color="green">
                            {classStats.onTrackCount} On Track
                          </Badge>
                          <Badge color="orange">
                            {classStats.concernCount} Concern
                          </Badge>
                          <Badge color="red">
                            {classStats.alertCount} Alert
                          </Badge>
                        </Group>
                      </Stack>
                    </Card>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, md: 8 }}>
                    <Card p="md" radius="md" withBorder h="100%">
                      <Title order={5} mb="md">Upcoming Deadlines</Title>

                      {classStats.dueDates.length > 0
                        ? (
                          classStats.dueDates.map((
                            dueDate: any,
                            index: number,
                          ) => (
                            <Stack key={index} mb="md">
                              <Group justify="space-between" mb={0}>
                                <Text size="sm" fw={500}>{dueDate.date}</Text>
                                <Group gap={8}>
                                  <Text size="sm" c="dimmed" fw={500}>
                                    {dueDate.completed}/{classStats
                                      .totalStudents} students
                                  </Text>
                                  <Text size="sm" c="dimmed">
                                    {dueDate.required} hours required
                                  </Text>
                                </Group>
                              </Group>
                              <Progress.Root size="xl">
                                <Progress.Section
                                  value={(dueDate.completed /
                                        classStats.totalStudents) * 100 || 0}
                                  color="green"
                                >
                                  <Progress.Label>
                                    {Math.round(
                                      (dueDate.completed /
                                        classStats.totalStudents) * 100,
                                    ) || 0}%
                                  </Progress.Label>
                                </Progress.Section>
                              </Progress.Root>
                            </Stack>
                          ))
                        )
                        : (
                          <Text c="dimmed">
                            No deadlines set for this class
                          </Text>
                        )}

                      {classStats.dueDates.length > 0 && (
                        <Group gap={10} mt="xl">
                          <IconClock size={18} style={{ opacity: 0.7 }} />
                          <Text size="sm" c="dimmed">
                            Next due date: <b>{classStats.dueDates[0].date}</b>
                            {" "}
                            ({classStats.dueDates[0].required} hours)
                          </Text>
                        </Group>
                      )}
                    </Card>
                  </Grid.Col>
                </Grid>

                <Stack pt="md">
                  <Paper p="md" shadow="xs" radius="md" withBorder>
                    <Title order={5} mb="md">Class Overview</Title>
                    <Group gap={8} mb="sm">
                      <IconUsers size={18} />
                      <Text fw={500}>{classStats.totalStudents} Students</Text>
                    </Group>
                    <Group gap={8} mb="sm">
                      <IconCheckbox size={18} />
                      <Text fw={500}>
                        {classStats.onTrackCount} Students on track
                      </Text>
                    </Group>
                    <Group gap={8} mb="sm">
                      <IconAlertTriangle size={18} />
                      <Text fw={500}>
                        {classStats.concernCount + classStats.alertCount}{" "}
                        Students need attention
                      </Text>
                    </Group>
                  </Paper>
                </Stack>

                <Card p="md" radius="md" withBorder mt="md">
                  <Title order={4} mb="md">Student Progress Tracking</Title>
                  {studentData.length > 0
                    ? (
                      <Table striped highlightOnHover>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>Student</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th>Hours</Table.Th>
                            <Table.Th>Progress</Table.Th>
                            <Table.Th>Actions</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {studentData.map((student: any) => (
                            <Table.Tr key={student.id}>
                              <Table.Td>
                                <Group gap="sm">
                                  <Avatar size={30} radius="xl" color="cyan">
                                    {getInitials(student.name)}
                                  </Avatar>
                                  <div>
                                    <Text size="sm" fw={500}>
                                      {student.name}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                      {student.email}
                                    </Text>
                                  </div>
                                </Group>
                              </Table.Td>
                              <Table.Td>
                                <Badge color={getStatusColor(student.status)}>
                                  {student.status.replace(/_/g, " ")}
                                </Badge>
                              </Table.Td>
                              <Table.Td>
                                <Text size="sm">
                                  {student.totalHours.toFixed(1)}/{student
                                    .requiredHours}
                                </Text>
                              </Table.Td>
                              <Table.Td style={{ width: "30%" }}>
                                <Group gap={8}>
                                  <Progress
                                    value={student.progress}
                                    color={getStatusColor(student.status)}
                                    size="lg"
                                    radius="xl"
                                    style={{ width: "70%" }}
                                  />
                                  <Text size="sm" fw={500}>
                                    {student.progress}%
                                  </Text>
                                </Group>
                              </Table.Td>
                              <Table.Td>
                                <ActionIcon
                                  component={Link}
                                  to={`/teacher/student/${student.id}`}
                                  variant="light"
                                  color="blue"
                                >
                                  <IconEye size={16} />
                                </ActionIcon>
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    )
                    : (
                      <Text c="dimmed" ta="center" py="xl">
                        No students enrolled in this class
                      </Text>
                    )}
                </Card>
              </Paper>
            </Container>
          </Tabs.Panel>

          <Tabs.Panel value="settings">
            <Outlet />
          </Tabs.Panel>
        </Tabs>
      </Container>
    </>
  );
}
