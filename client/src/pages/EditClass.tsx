import {
  Alert,
  Button,
  Container,
  Group,
  Loader,
  Stack,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import {
  IconArrowLeft,
  IconCheck,
  IconExclamationCircle,
} from "@tabler/icons-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function EditClass() {
  const { id } = useParams();
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      name: "",
      courseCode: "",
      description: "",
      endDate: null as Date | null,
    },
    validate: {
      name: (value) => (!value.trim() ? "Class name is required" : null),
      courseCode: (
        value,
      ) => (value.length > 20
        ? "Course code must be under 20 characters"
        : null),
      description: (
        value,
      ) => (value.length > 500
        ? "Description must be under 500 characters"
        : null),
    },
  });

  // Fetch class details
  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        setFetchLoading(true);
        const res = await axios.get(`${serverUrl}/class/${id}`, {
          withCredentials: true,
        });

        if (res.data.success) {
          const classData = res.data.data;
          form.setValues({
            name: classData.name || "",
            courseCode: classData.courseCode || "",
            description: classData.description || "",
            endDate: classData.endDate ? new Date(classData.endDate) : null,
          });
        }
      } catch (err) {
        let errorMessage = "Failed to fetch class details";
        if (axios.isAxiosError(err) && err.response) {
          errorMessage = err.response.data.error || errorMessage;
        }
        setError(errorMessage);
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) {
      fetchClassDetails();
    }
  }, [id, serverUrl]);

  // Handle form submission
  const updateClass = async (values: typeof form.values) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await axios.put(
        `${serverUrl}/class/${id}`,
        values,
        { withCredentials: true },
      );

      if (res.data.success) {
        setSuccess(true);
        // Auto-navigate back after success
        setTimeout(() => {
          navigate("/teacher/settings");
        }, 2000);
      }
    } catch (err) {
      let errorMessage = "Failed to update class";
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data.error || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // close the success alert after 5s
  useEffect(() => {
    let timer: number | undefined;
    if (success) {
      timer = window.setTimeout(() => {
        setSuccess(false);
      }, 5000);
    }
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [success]);

  if (fetchLoading) {
    return (
      <Container size="sm" py="xl">
        <div className="flex justify-center items-center h-64">
          <Loader size="lg" />
        </div>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Group mb="md">
        <Link to="/teacher/settings" className="no-underline">
          <Button
            leftSection={<IconArrowLeft size={16} />}
            variant="light"
          >
            Back to Settings
          </Button>
        </Link>
      </Group>

      <Title order={2} mb="lg">Edit Class</Title>

      {error && (
        <Alert
          icon={<IconExclamationCircle size={16} />}
          title="Error"
          color="red"
          mb="md"
          withCloseButton
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          icon={<IconCheck size={16} />}
          title="Success"
          color="green"
          mb="md"
          withCloseButton
          onClose={() => setSuccess(false)}
        >
          Class updated successfully. Redirecting...
        </Alert>
      )}

      <form onSubmit={form.onSubmit(updateClass)}>
        <Stack>
          <TextInput
            required
            label="Class Name"
            placeholder="Enter class name"
            {...form.getInputProps("name")}
          />

          <TextInput
            label="Course Code"
            placeholder="Enter course code"
            {...form.getInputProps("courseCode")}
          />

          <Textarea
            label="Description"
            placeholder="Enter class description"
            minRows={3}
            {...form.getInputProps("description")}
          />

          <DateInput
            label="End Date"
            placeholder="Select end date"
            value={form.values.endDate}
            onChange={(date) => form.setFieldValue("endDate", date)}
            clearable
          />

          <Group justify="flex-end" mt="md">
            <Button component={Link} to="/teacher/settings" variant="light">
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Container>
  );
}
