import {
    ActionIcon,
    Badge,
    Card,
    Container,
    Group,
    Table,
    Text,
    Title,
    Tooltip
  } from "@mantine/core";
  import { IconEdit, IconUserCog } from "@tabler/icons-react";
  import { Link, useNavigate, useParams } from "react-router-dom";
  import { ClassDetails, UserStatus } from "../types";
  
  interface ClassDetailsViewProps {
    classesData: ClassDetails[];
    onRefresh: () => void;
  }
  
  export default function ClassDetailsView({ classesData }: ClassDetailsViewProps) {
    const { classId } = useParams();
    const navigate = useNavigate();
    const selectedClass = classesData.find(c => c.id === Number(classId));
  
    if (!selectedClass) {
      return <div>Class not found</div>;
    }
  
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
  
    const handleEditStudent = (studentId: number) => {
      navigate(`/teacher/settings/student/${studentId}`);
    };
  
    return (
      <Container size="lg">
        <Card withBorder shadow="sm" p="md" mb="lg">
          <Group mb="xs">
            <Title order={2}>{selectedClass.name}</Title>
            <Tooltip label="Edit Class">
              <ActionIcon
                component={Link}
                to={`/class/${selectedClass.id}/edit`}
              >
                <IconEdit size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
  
          <Text>
            <strong>Course Code:</strong> {selectedClass.courseCode}
          </Text>
          <Text>
            <strong>Description:</strong> {selectedClass.description}
          </Text>
          <Text>
            <strong>Class Code:</strong> {selectedClass.code}
          </Text>
          {selectedClass.endDate && (
            <Text>
              <strong>End Date:</strong>{" "}
              {new Date(selectedClass.endDate).toLocaleDateString()}
            </Text>
          )}
          <Text>
            <strong>Teacher:</strong>{" "}
            {selectedClass.TeacherUser?.user.name}
          </Text>
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
                    {student.status.replace(/_/g, " ")}
                  </Badge>
                </Table.Td>
                <Table.Td>{student.totalHours}</Table.Td>
                <Table.Td>
                  <Tooltip label="Edit Student" withArrow>
                    <ActionIcon onClick={() => handleEditStudent(student.id)}>
                      <IconUserCog size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Container>
    );
  }