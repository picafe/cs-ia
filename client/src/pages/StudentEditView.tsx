import {
    ActionIcon,
    Alert,
    Button,
    Card,
    Group,
    Loader,
    NumberInput,
    Select,
    Text,
    Title,
    Tooltip
  } from "@mantine/core";
  import { useForm } from "@mantine/form";
  import { IconArrowLeft, IconCheck, IconExclamationCircle } from "@tabler/icons-react";
  import axios from "axios";
  import { useEffect, useRef, useState } from "react";
  import { useNavigate, useParams } from "react-router-dom";
  import { ClassDetails } from "../types";
  
  interface StudentEditViewProps {
    classesData: ClassDetails[];
    onRefresh: () => void;
  }
  
  export default function StudentEditView({ classesData, onRefresh }: StudentEditViewProps) {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    const [editStudentLoading, setEditStudentLoading] = useState(false);
    const [editStudentError, setEditStudentError] = useState<string>("");
    const [saveSuccess, setSaveSuccess] = useState(false);
    const prevSaveSuccessRef = useRef(false);
  
    const studentDetails = classesData.flatMap(c => c.students)
      .find(s => s.id === Number(studentId));
  
    const classDetails = classesData.find(c => 
      c.students.some(s => s.id === Number(studentId))
    );
  
    const editStudentForm = useForm({
      initialValues: {
        status: "NOT_STARTED",
        totalHours: 0,
      },
    });
  
    useEffect(() => {
      if (studentDetails) {
        editStudentForm.setValues({
          status: studentDetails.status,
          totalHours: studentDetails.totalHours,
        });
      }
    }, [studentDetails]);
  
    // Auto refresh data
    useEffect(() => {
      if (saveSuccess && !prevSaveSuccessRef.current) {
        onRefresh();
      }
      prevSaveSuccessRef.current = saveSuccess;
    }, [saveSuccess, onRefresh]);
  
    // close the success alert after 5s
    useEffect(() => {
      let timer: number | undefined;
      if (saveSuccess) {
        timer = window.setTimeout(() => {
          setSaveSuccess(false);
        }, 5000);
      }
      return () => {
        if (timer) window.clearTimeout(timer);
      };
    }, [saveSuccess]);
  
    if (!studentDetails || !classDetails) {
      return <div>Student not found</div>;
    }
  
    const handleBack = () => {
      navigate(`/teacher/settings/class/${classDetails.id}`);
    };
  
    const saveStudentData = async (
      values: { status: string; totalHours: number },
    ) => {
      setSaveSuccess(false);
      try {
        setEditStudentLoading(true);
        const res = await axios.post(
          `${serverUrl}/user/student/${studentId}`,
          values,
          { withCredentials: true },
        );
        if (res.status === 200) {
          setSaveSuccess(true);
        }
      } catch (error) {
        let errorMessage: string;
        if (axios.isAxiosError(error) && error.response) {
          errorMessage = error.response.data.error;
        } else {
          errorMessage = "Something unexpected happened! Please contact support.";
        }
        setEditStudentError("Save failed: " + errorMessage);
        console.error(error);
      } finally {
        setEditStudentLoading(false);
      }
    };
  
    return (
      <div>
        <Group mb="md">
          <Group>
            <Tooltip label="Back to class view" withArrow>
              <ActionIcon
                onClick={handleBack}
                size="lg"
                variant="light"
              >
                <IconArrowLeft size={20} />
              </ActionIcon>
            </Tooltip>
            <Title order={3}>Edit Student</Title>
          </Group>
  
          <Text size="sm" c="dimmed">
            Class: {classDetails.name}
          </Text>
        </Group>
  
        {saveSuccess && (
          <Alert
            icon={<IconCheck size={16} />}
            title="Changes saved"
            color="green"
            mb="md"
          >
            Student information has been successfully updated.
          </Alert>
        )}
  
        {editStudentError && (
          <Alert
            icon={<IconExclamationCircle />}
            title="Error"
            color="red"
            mb="md"
          >
            {editStudentError}
          </Alert>
        )}
  
        <div>
          <Card withBorder shadow="sm" p="md" mb="md">
            <Text size="lg" fw={500}>
              {studentDetails.user.name}
            </Text>
            <Text size="sm" c="dimmed">
              {studentDetails.user.email}
            </Text>
          </Card>
  
          <form
            onSubmit={editStudentForm.onSubmit((values) =>
              saveStudentData(values)
            )}
          >
            <Card withBorder shadow="sm" p="md">
              <Select
                label="Status"
                placeholder="Select student status"
                allowDeselect={false}
                {...editStudentForm.getInputProps("status")}
                data={[
                  { value: "NOT_STARTED", label: "Not Started" },
                  { value: "ON_TRACK", label: "On Track" },
                  { value: "ALERT", label: "Alert" },
                  { value: "CONCERN", label: "Concern" },
                  { value: "COMPLETED", label: "Completed" },
                ]}
                mb="md"
                required
              />
  
              <NumberInput
                label="Total Hours"
                description="Total hours of activity completed"
                value={editStudentForm.values.totalHours}
                onChange={(val) =>
                  editStudentForm.setFieldValue(
                    "totalHours",
                    Number(val),
                  )}
                min={0}
                decimalScale={1}
                required
              />
  
              <Group mt="lg">
                <Button type="submit" color="blue">
                  {editStudentLoading
                    ? <Loader size={24} />
                    : "Save Changes"}
                </Button>
              </Group>
            </Card>
          </form>
        </div>
      </div>
    );
  }