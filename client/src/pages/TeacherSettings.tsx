import {
  UnstyledButton,
  Badge,
  Text,
  Group,
  ActionIcon,
  Tooltip,
  rem,
  Loader,
  Button,
} from "@mantine/core";
import {
  IconBulb,
  IconCheckbox,
  IconPlus,
  IconUser,
} from "@tabler/icons-react";
import classes from "./TeacherSettings.module.css";
import { useEffect, useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { client } from "../lib/client";
import type { InferResponseType } from "hono/client";

type StudentSummary = {
  id: number;
  name: string;
  status: string;
};

type ClassDetails = InferResponseType<typeof client.class.$get, 200>["data"][0];

function DefaultView() {
  return (
    <div>
      <Text size="lg" fw={500} mb="md">
        Teacher Settings
      </Text>
      <Text c="dimmed">
        Select a class from the sidebar to view or edit its details.
      </Text>
    </div>
  );
}

function ClassDetailsView({ onRefresh }: { onRefresh: () => void }) {
  const { classId } = useParams<{ classId: string }>();
  return (
    <div>
      Details for Class ID: {classId} <Button onClick={onRefresh}>Refresh List</Button>
    </div>
  );
}

function StudentEditView({ onRefresh }: { onRefresh: () => void }) {
  const { studentId } = useParams<{ studentId: string }>();
  return (
    <div>
      Editing Student ID: {studentId} <Button onClick={onRefresh}>Refresh List</Button>
    </div>
  );
}

export default function TeacherSettings() {
  const [classesData, setClassesData] = useState<ClassDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const navigate = useNavigate();

  const getClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.class.$get();

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        setClassesData(Array.isArray(data.data) ? data.data : []);
      } else {
        throw new Error(data.error || "Failed to fetch classes");
      }
    } catch (err: any) {
      console.error("Error fetching classes:", err);
      setError(err.message || "Failed to load classes. Please try again.");
      setClassesData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getClasses();
  }, []);

  const getStudentsOfConcern = (classItem: ClassDetails) => {
    if (!Array.isArray(classItem.students)) {
      return 0;
    }
    return classItem.students.filter(
      (student) => student.status === "ALERT" || student.status === "CONCERN",
    ).length;
  };

  const handleClassSelection = (classId: number) => {
    setSelectedClassId(classId);
    navigate(`/teacher/settings/class/${classId}`);
  };

  const classLinks = classesData.map((classItem) => (
    <UnstyledButton
      key={classItem.id}
      className={`${classes.mainLink} ${
        selectedClassId === classItem.id ? classes.mainLinkActive : ""
      }`}
      onClick={() => handleClassSelection(classItem.id)}
    >
      <div className={classes.mainLinkInner}>
        <IconCheckbox size={20} className={classes.mainLinkIcon} stroke={1.5} />
        <span>{classItem.name}</span>
      </div>
      {getStudentsOfConcern(classItem) > 0 && (
        <Badge
          size="sm"
          variant="filled"
          color="red"
          className={classes.mainLinkBadge}
        >
          {getStudentsOfConcern(classItem)}
        </Badge>
      )}
    </UnstyledButton>
  ));

  return (
    <div className="flex flex-row">
      <nav className={classes.navbar}>
        <div className={classes.section}>
          <Group className={classes.collectionsHeader} justify="space-between">
            <Text size="xs" fw={500} c="dimmed">
              Classes
            </Text>
            <Tooltip label="Create class" withArrow position="right">
              <ActionIcon
                variant="default"
                size={18}
                onClick={() => navigate("/class/new")}
              >
                <IconPlus
                  style={{ width: rem(12), height: rem(12) }}
                  stroke={1.5}
                />
              </ActionIcon>
            </Tooltip>
          </Group>
          <div className={classes.mainLinks}>
            {loading && <Loader size="sm" m="md" />}
            {!loading && error && (
              <Text c="red" size="sm" m="md">
                {error}
              </Text>
            )}
            {!loading && !error && classesData.length === 0 && (
              <Text c="dimmed" size="sm" m="md">
                No classes found.
              </Text>
            )}
            {!loading && !error && classLinks}
          </div>
        </div>
      </nav>

      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<DefaultView />} />
          <Route
            path="/class/:classId"
            element={<ClassDetailsView onRefresh={getClasses} />}
          />
          <Route
            path="/student/:studentId"
            element={<StudentEditView onRefresh={getClasses} />}
          />
        </Routes>
      </main>
    </div>
  );
}
