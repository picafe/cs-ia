import {
  ActionIcon,
  Badge,
  Code,
  Group,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
  Container,
  Title,
  Table,
  Card,
  Alert,
  Button,
  NumberInput,
  Select,
  Loader
} from "@mantine/core";
import {
  IconCheckbox,
  IconPlus,
  IconSearch,
  IconEdit,
  IconUserCog,
  IconArrowLeft,
  IconCheck,
  IconExclamationCircle,
} from "@tabler/icons-react";
import classes from "./TeacherSettings.module.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { ClassDetails, UserStatus } from "../types";
import { useForm } from "@mantine/form";

export default function TeacherSettings() {
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const [classesData, setClassesData] = useState<ClassDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [editStudentLoading, setEditStudentLoading] = useState(false);
  const [editStudentError, setEditStudentError] = useState<string>("");


  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const prevSaveSuccessRef = useRef(false);

  // DATA LOADING
  const getClasses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(serverUrl + "/classes", {
        withCredentials: true,
      });
      setClassesData(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Only fetch classes when saveSuccess turns true
  useEffect(() => {
    if (saveSuccess && !prevSaveSuccessRef.current) {
      getClasses();
    }
    prevSaveSuccessRef.current = saveSuccess;
  }, [location, saveSuccess]);

  useEffect(() => {
    getClasses();
  }, []);


  const getStudentsOfConcern = (classItem: ClassDetails) => {
    return classItem.students.filter(
      student => student.status === "ALERT" || student.status === "CONCERN"
    ).length;
  };

  const selectedClass = classesData.find(c => c.id === selectedClassId);

  // Class links
  const classLinks = classesData.map((classItem) => (
    <UnstyledButton
      key={classItem.id}
      className={`${classes.mainLink}  ${selectedClassId === classItem.id ? 'bg-gray-100 dark:bg-zinc-900' : 'dark:bg-[#242424] bg-white'}`}
      onClick={() => handleClassSelection(classItem.id)}
    >
      <div className={classes.mainLinkInner}>
        <IconCheckbox size={20} className={classes.mainLinkIcon} stroke={1.5} />
        <span>{classItem.name}</span>
      </div>
      {getStudentsOfConcern(classItem) > 0 && (
        <Badge size="sm" variant="filled" className={classes.mainLinkBadge}>
          {getStudentsOfConcern(classItem)}
        </Badge>
      )}
    </UnstyledButton>
  ));

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case "NOT_STARTED": return "gray";
      case "ON_TRACK": return "green";
      case "COMPLETED": return "green";
      case "ALERT": return "orange";
      case "CONCERN": return "red";
      default: return "gray";
    }
  };
  // CLASS AND STUDENT TABS

  const handleClassSelection = (classId: number) => {
    setSelectedClassId(classId);
    if (editingStudentId) {
      setEditingStudentId(null);
    }
  };

  const editStudentForm = useForm({
    initialValues: {
      status: "NOT_STARTED",
      totalHours: 0,
    }
  })

  // Set form values with stored values when editing student
  useEffect(() => {
    if (editingStudentId) {
      const currentStudent = classesData.flatMap(course => course.students)
        .find(student => student.id === editingStudentId);

      if (currentStudent) {
        editStudentForm.setValues({
          status: currentStudent.status,
          totalHours: currentStudent.totalHours,
        });
      }
    }
  }, [editingStudentId, classesData]);

  const saveStudentData = async (values: { status: string, totalHours: number }) => {
    setSaveSuccess(false);
    try {
      setEditStudentLoading(true);
      const res = await axios.post(`${serverUrl}/user/student/${editingStudentId}`, values, { withCredentials: true })
      if (res.status === 200)
        setSaveSuccess(true);
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

  const handleStudentEditBack = () => {
    setEditingStudentId(null);
    setSaveSuccess(false);
  };

  // Automatically close the success alert after 5s
  useEffect(() => {
    let timer: number | undefined;

    if (saveSuccess) {
      timer = window.setTimeout(() => {
        setSaveSuccess(false);
      }, 5000);
    }

    // Cleanup function
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [saveSuccess]);

  return (
    <div className="flex flex-row">
      {/* Sidebar */}
      <nav className={classes.navbar}>
        <TextInput
          placeholder="Search"
          size="xs"
          leftSection={<IconSearch size={12} stroke={1.5} />}
          rightSectionWidth={70}
          rightSection={<Code className={classes.searchCode}>Ctrl + K</Code>}
          styles={{ section: { pointerEvents: "none" } }}
          mb="sm"
        />

        <div className={classes.section}>
          <Group
            className={`${classes.collectionsHeader} mr-2.5 items-center`}
            justify="space-between"
          >
            <Text size="sm" fw={500} c="dimmed">
              Classes
            </Text>
            <Tooltip label="Create Class" position="right" withArrow>
              <ActionIcon
                variant="default"
                size={18}
                component={Link}
                to="/class/new"
                viewTransition
              >
                <IconPlus size={16} stroke={1.5} />
              </ActionIcon>
            </Tooltip>
          </Group>
          <div className={classes.collections}>
            <div className={classes.mainLinks}>
              {loading ? <Text>Loading...</Text> : classLinks}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 p-6">
        {editingStudentId ? (
          // Student editing view
          <div>
            <Group mb="md">
              <Group>
                <Tooltip label="Back to class view" withArrow>
                  <ActionIcon onClick={handleStudentEditBack} size="lg" variant="light">
                    <IconArrowLeft size={20} />
                  </ActionIcon>
                </Tooltip>
                <Title order={3}>Edit Student</Title>
              </Group>

              {selectedClass && (
                <Text size="sm" c="dimmed">
                  Class: {selectedClass.name}
                </Text>
              )}
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
                <Text size="lg" fw={500}>{classesData.flatMap(course => course.students).filter((student) => student.id === editingStudentId)[0].user.name}</Text>
                <Text size="sm" c="dimmed">{classesData.flatMap(course => course.students).filter((student) => student.id === editingStudentId)[0].user.email}</Text>
              </Card>

              <form onSubmit={editStudentForm.onSubmit((values) => saveStudentData(values))}>
                <Card withBorder shadow="sm" p="md">
                  <Select
                    label="Status"
                    placeholder="Select student status"
                    allowDeselect={false}
                    {...editStudentForm.getInputProps('status')}
                    data={[
                      { value: "NOT_STARTED", label: "Not Started" },
                      { value: "ON_TRACK", label: "On Track" },
                      { value: "ALERT", label: "Alert" },
                      { value: "CONCERN", label: "Concern" },
                      { value: "COMPLETED", label: "Completed" }
                    ]}
                    mb="md"
                    required
                  />

                  <NumberInput
                    label="Total Hours"
                    description="Total hours of activity completed"
                    value={editStudentForm.values.totalHours}
                    onChange={(val) => editStudentForm.setFieldValue('totalHours', Number(val))}
                    min={0}
                    decimalScale={1}
                    required
                  />

                  <Group mt="lg">
                    <Button type="submit" color="blue">{editStudentLoading ? <Loader size={24} /> : "Save Changes"}</Button>
                  </Group>
                </Card>
              </form>
            </div>
          </div>
        ) : selectedClass ? (
          // Class details view
          <Container size="lg">
            <Card withBorder shadow="sm" p="md" mb="lg">
              <Group mb="xs">
                <Title order={2}>{selectedClass.name}</Title>
                <Tooltip label="Edit Class">
                  <ActionIcon component={Link} to={`/class/${selectedClass.id}/edit`}>
                    <IconEdit size={18} />
                  </ActionIcon>
                </Tooltip>
              </Group>

              <Text><strong>Course Code:</strong> {selectedClass.courseCode}</Text>
              <Text><strong>Description:</strong> {selectedClass.description}</Text>
              <Text><strong>Class Code:</strong> {selectedClass.code}</Text>
              {selectedClass.endDate && <Text><strong>End Date:</strong> {new Date(selectedClass.endDate).toLocaleDateString()}</Text>}
              <Text><strong>Teacher:</strong> {selectedClass.TeacherUser?.user.name}</Text>
            </Card>

            <Title order={3} mb="md">Students</Title>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Total Hours</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {selectedClass.students.map((student) => (
                  <Table.Tr key={student.id}>
                    <Table.Td>{student.user.name}</Table.Td>
                    <Table.Td>{student.user.email}</Table.Td>
                    <Table.Td>
                      <Badge color={getStatusColor(student.status)}>
                        {student.status.replace(/_/g, ' ')}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{student.totalHours}</Table.Td>
                    <Table.Td>
                      <Tooltip label="Edit Student" withArrow>
                        <ActionIcon onClick={() => setEditingStudentId(student.id)}>
                          <IconUserCog size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Container>
        ) : (
          // Default prompt
          <div>
            <h1>Teacher Settings</h1>
            <Text>Select a class from the sidebar to view details</Text>
          </div>
        )}
      </main>
    </div>
  );
}