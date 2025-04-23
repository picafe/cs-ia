import {
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Loader,
  Paper,
  RingProgress,
  ScrollArea,
  Stack,
  Table,
  Tabs,
  Text,
} from "@mantine/core";
import {
  IconHome,
  IconSettings,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { client } from "../lib/client";

type StudentDashboardSummary = {
  id: number;
  name: string;
  email: string;
  status: string;
  totalHours: number;
  requiredHours: number;
  progress: number;
};

type DueDateSummary = {
  date: string;
  required: number;
  completed: number;
};

type ClassDashboardSummary = {
  id: number;
  name: string;
  courseCode: string | null;
  students: StudentDashboardSummary[];
  totalStudents: number;
  avgProgress: number;
  onTrackCount: number;
  concernCount: number;
  alertCount: number;
  dueDates: DueDateSummary[];
};

type TeacherDashboardData = {
  classes: ClassDashboardSummary[];
};

export default function TeacherDashboard() {
  const [dashboardData, setDashboardData] = useState<
    TeacherDashboardData | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string | null>("home");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await client.teacher.dashboard.$get();

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${res.status}`,
          );
        }

        const data = await res.json();
        if (data.success) {
          setDashboardData(data.data);
        } else {
          throw new Error(data.error || "Failed to load dashboard data");
        }
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(
          err.message || "Failed to load dashboard data. Please try again.",
        );
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleNavChange = (value: string | null) => {
    setActiveTab(value);
    if (value === "settings") {
      navigate("/teacher/settings");
    } else {
      navigate("/");
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
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
          <Stack align="center">
            <Text color="red" size="lg" fw={500}>
              Error Loading Dashboard
            </Text>
            <Text c="dimmed" size="sm">
              {error}
            </Text>
            <Button onClick={() => window.location.reload()} mt="md">
              Retry
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  if (!dashboardData || dashboardData.classes.length === 0) {
    return (
      <Container>
        <Tabs value={activeTab} onChange={handleNavChange} mb="lg">
          <Tabs.List>
            <Tabs.Tab value="home" leftSection={<IconHome size={16} />}>
              Dashboard
            </Tabs.Tab>
            <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />}>
              Settings
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
        <Paper p="xl" shadow="xs" radius="md" withBorder>
          <Stack align="center">
            <Text size="lg" fw={500}>
              No Classes Found
            </Text>
            <Text c="dimmed" size="sm" ta="center">
              You haven't created or been assigned to any classes yet.
            </Text>
            <Button
              leftSection={<IconUserPlus size={16} />}
              mt="md"
              onClick={() => navigate("/class/new")}
            >
              Create Your First Class
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Tabs value={activeTab} onChange={handleNavChange} mb="lg">
        <Tabs.List>
          <Tabs.Tab value="home" leftSection={<IconHome size={16} />}>
            Dashboard
          </Tabs.Tab>
          <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />}>
            Settings
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {dashboardData.classes.map((classStats) => (
        <Paper
          key={classStats.id}
          p="md"
          shadow="sm"
          radius="md"
          withBorder
          mb="xl"
        >
          <Stack>
            <Group justify="space-between" align="center">
              <div>
                <Text size="xl" fw={700}>
                  {classStats.name}
                </Text>
                {classStats.courseCode && (
                  <Text c="dimmed" size="sm">
                    {classStats.courseCode}
                  </Text>
                )}
              </div>
              <Group>
                <Group gap="xs">
                  <IconUsers size={20} stroke={1.5} />
                  <Text fw={500}>{classStats.totalStudents} Students</Text>
                </Group>
              </Group>
            </Group>

            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Card
                  p="md"
                  radius="md"
                  withBorder
                  className={classes.cardHeight}
                >
                  <Stack align="center" justify="center" h="100%">
                    <Text fw={500} c="dimmed" mb="xs">
                      Class Status Overview
                    </Text>
                    <RingProgress
                      size={180}
                      thickness={16}
                      roundCaps
                      sections={[
                        {
                          value: (classStats.onTrackCount /
                                classStats.totalStudents) * 100 || 0,
                          color: "green",
                          tooltip: `On Track: ${classStats.onTrackCount}`,
                        },
                        {
                          value: (classStats.concernCount /
                                classStats.totalStudents) * 100 || 0,
                          color: "orange",
                          tooltip: `Concern: ${classStats.concernCount}`,
                        },
                        {
                          value:
                            (classStats.alertCount / classStats.totalStudents) *
                              100 || 0,
                          color: "red",
                          tooltip: `Alert: ${classStats.alertCount}`,
                        },
                      ]}
                      label={
                        <Stack align="center" gap={0}>
                          <Text ta="center" fw={700} size="xl">
                            {`${classStats.avgProgress}%`}
                          </Text>
                          <Text ta="center" size="xs" c="dimmed">
                            Avg. Progress
                          </Text>
                        </Stack>
                      }
                    />
                  </Stack>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 8 }}>
                <Card
                  p="md"
                  radius="md"
                  withBorder
                  className={classes.cardHeight}
                >
                  <Stack h="100%">
                    <Text fw={500} c="dimmed" mb="xs">
                      Upcoming Due Dates
                    </Text>
                    {classStats.dueDates.length > 0
                      ? (
                        <ScrollArea style={{ flex: 1 }}>
                          <Table verticalSpacing="xs" striped highlightOnHover>
                            <Table.Thead>
                              <Table.Tr>
                                <Table.Th>Date</Table.Th>
                                <Table.Th>Required Hours</Table.Th>
                                <Table.Th>Students Completed</Table.Th>
                              </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                              {classStats.dueDates.map((dueDate, index) => (
                                <Table.Tr key={index}>
                                  <Table.Td>{dueDate.date}</Table.Td>
                                  <Table.Td>{dueDate.required}</Table.Td>
                                  <Table.Td>
                                    {dueDate.completed} /{" "}
                                    {classStats.totalStudents}
                                  </Table.Td>
                                </Table.Tr>
                              ))}
                            </Table.Tbody>
                          </Table>
                        </ScrollArea>
                      )
                      : (
                        <Center style={{ flex: 1 }}>
                          <Text c="dimmed">
                            No due dates set for this class.
                          </Text>
                        </Center>
                      )}
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>

            <Card p="md" radius="md" withBorder mt="md">
              <Text fw={500} c="dimmed" mb="xs">
                Student Progress
              </Text>
              {classStats.students.length > 0
                ? (
                  <ScrollArea h={300}>
                    <Table verticalSpacing="sm" striped highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Student</Table.Th>
                          <Table.Th>Status</Table.Th>
                          <Table.Th>Total Hours</Table.Th>
                          <Table.Th>Progress</Table.Th>
                          <Table.Th>Actions</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {classStats.students.map((student) => (
                          <Table.Tr key={student.id}>
                            <Table.Td>
                              <Group gap="sm">
                                <Avatar size={26} radius={26}>
                                  {getInitials(student.name)}
                                </Avatar>
                                <Text size="sm" fw={500}>
                                  {student.name}
                                </Text>
                              </Group>
                            </Table.Td>
                            <Table.Td>
                              <Badge
                                color={student.status === "ALERT"
                                  ? "red"
                                  : student.status === "CONCERN"
                                  ? "orange"
                                  : student.status === "COMPLETED"
                                  ? "teal"
                                  : "green"}
                                variant="light"
                              >
                                {student.status.replace("_", " ")}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              {student.totalHours.toFixed(1)} /{" "}
                              {student.requiredHours}
                            </Table.Td>
                            <Table.Td>{student.progress}%</Table.Td>
                            <Table.Td>
                              <Button
                                variant="subtle"
                                size="xs"
                                onClick={() =>
                                  navigate(`/teacher/student/${student.id}`)}
                              >
                                View Details
                              </Button>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </ScrollArea>
                )
                : (
                  <Center h={100}>
                    <Text c="dimmed">
                      No students enrolled in this class yet.
                    </Text>
                  </Center>
                )}
            </Card>
          </Stack>
        </Paper>
      ))}
    </Container>
  );
}
