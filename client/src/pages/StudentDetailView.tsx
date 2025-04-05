import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconArrowLeft,
  IconCheck,
  IconExclamationCircle,
} from "@tabler/icons-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

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

export default function StudentDetailView() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    initialValues: {
      status: "",
    },
  });

  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${serverUrl}/student/${studentId}/details`,
          {
            withCredentials: true,
          },
        );

        if (res.data.success) {
          setStudentData(res.data.data);
          form.setValues({
            status: res.data.data.status,
          });
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load student data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [serverUrl, studentId]);

  // Update student status
  const handleUpdateStatus = async (values: typeof form.values) => {
    try {
      setUpdateStatusLoading(true);
      setError(null);
      setSuccess(false);

      const res = await axios.post(
        `${serverUrl}/user/student/${studentId}`,
        {
          status: values.status,
          totalHours: studentData.totalHours, // Keep the same hours
        },
        { withCredentials: true },
      );

      if (res.status === 200) {
        setSuccess(true);
        // Update student data with new status
        setStudentData({
          ...studentData,
          status: values.status,
        });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update student status");
    } finally {
      setUpdateStatusLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name?.split(" ").map((word) => word.charAt(0).toUpperCase()).join(
      "",
    );
  };

  if (loading) {
    return (
      <Container className="flex justify-center items-center h-64">
        <Loader size="xl" />
      </Container>
    );
  }

  if (error && !studentData) {
    return (
      <Container>
        <Alert
          icon={<IconExclamationCircle />}
          title="Error"
          color="red"
          variant="filled"
        >
          {error}
        </Alert>
        <Group mt="lg" justify="center">
          <Button onClick={() => navigate(-1)} leftSection={<IconArrowLeft />}>
            Go Back
          </Button>
        </Group>
      </Container>
    );
  }

  if (!studentData) {
    return (
      <Container>
        <Alert
          title="Student Not Found"
          color="yellow"
          variant="filled"
        >
          The requested student could not be found.
        </Alert>
        <Group mt="lg" justify="center">
          <Button onClick={() => navigate(-1)} leftSection={<IconArrowLeft />}>
            Go Back
          </Button>
        </Group>
      </Container>
    );
  }

  return (
    <Container>
      <Group mb="md">
        <Button
          component={Link}
          to="/"
          variant="subtle"
          leftSection={<IconArrowLeft />}
        >
          Back Home
        </Button>
      </Group>

      {success && (
        <Alert
          icon={<IconCheck />}
          title="Success"
          color="green"
          mb="md"
          withCloseButton
          onClose={() => setSuccess(false)}
        >
          Student status updated successfully.
        </Alert>
      )}

      {error && (
        <Alert
          icon={<IconExclamationCircle />}
          title="Error"
          color="red"
          mb="md"
          withCloseButton
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Paper withBorder p="md" mb="md">
        <Group mb="md">
          <Group>
            <Avatar size={50} color="cyan" radius="xl">
              {getInitials(studentData.name)}
            </Avatar>
            <div>
              <Title order={3}>{studentData.name}</Title>
              <Text c="dimmed">{studentData.email}</Text>
            </div>
          </Group>

          <Group>
            <Badge color={getStatusColor(studentData.status)} size="lg">
              {studentData.status.replace(/_/g, " ")}
            </Badge>
            <Text fw={500}>
              {studentData.totalHours.toFixed(1)}/{studentData.requiredHours}
              {" "}
              hours
            </Text>
          </Group>
        </Group>

        <Group>
          <Text>
            <strong>Class:</strong> {studentData.className}
          </Text>
          <Text>
            <strong>Joined:</strong> {studentData.createdAt}
          </Text>
        </Group>
      </Paper>

      <Card withBorder mb="md">
        <Title order={4} mb="md">Update Student Status</Title>
        <form onSubmit={form.onSubmit(handleUpdateStatus)}>
          <Group>
            <Select
              label="Status"
              placeholder="Select student status"
              data={[
                { value: "NOT_STARTED", label: "Not Started" },
                { value: "ON_TRACK", label: "On Track" },
                { value: "CONCERN", label: "Concern" },
                { value: "ALERT", label: "Alert" },
                { value: "COMPLETED", label: "Completed" },
              ]}
              {...form.getInputProps("status")}
              style={{ flex: 1 }}
            />
            <Button
              type="submit"
              mt="xl"
              loading={updateStatusLoading}
            >
              Update Status
            </Button>
          </Group>
        </form>
      </Card>

      <Title order={3} mb="md">Activities & Logs</Title>

      {studentData.activities.length > 0
        ? (
          studentData.activities.map((activity: any) => (
            <Card key={activity.id} withBorder mb="md">
              <Group>
                <Title order={4}>{activity.name}</Title>
                <Text c="dimmed">Created: {activity.createdAt}</Text>
              </Group>

              <Text mb="md">{activity.description}</Text>
              <Text mb="md">Total Hours: {activity.totalHours.toFixed(1)}</Text>

              <Divider mb="md" />

              <Title order={5} mb="sm">Logs</Title>

              {activity.logs.length > 0
                ? (
                  <Table striped>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Date</Table.Th>
                        <Table.Th>Hours</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {activity.logs.map((log: any) => (
                        <Table.Tr key={log.id}>
                          <Table.Td>{log.date}</Table.Td>
                          <Table.Td>{log.hours.toFixed(1)}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                )
                : <Text c="dimmed">No logs recorded for this activity</Text>}
            </Card>
          ))
        )
        : (
          <Paper p="xl" withBorder>
            <Stack align="center" gap="md">
              <Text c="dimmed" ta="center">No activities recorded yet</Text>
              <Text size="sm" ta="center">
                The student hasn't logged any activities. Activities will appear
                here once the student starts logging their work.
              </Text>
            </Stack>
          </Paper>
        )}
    </Container>
  );
}
