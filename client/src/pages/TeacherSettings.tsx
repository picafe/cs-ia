import {
  ActionIcon,
  Badge,
  Code,
  Group,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { IconCheckbox, IconPlus, IconSearch } from "@tabler/icons-react";
import classes from "./TeacherSettings.module.css";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { ClassDetails } from "../types";
import ClassDetailsView from "./ClassDetailsView";
import StudentEditView from "./StudentEditView";

function DefaultView() {
  return (
    <div>
      <h1>Teacher Settings</h1>
      <Text>Select a class from the sidebar to view details</Text>
    </div>
  );
}

export default function TeacherSettings() {
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const [classesData, setClassesData] = useState<ClassDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    getClasses();
  }, []);

  const getStudentsOfConcern = (classItem: ClassDetails) => {
    return classItem.students.filter(
      (student) => student.status === "ALERT" || student.status === "CONCERN",
    ).length;
  };

  const handleClassSelection = (classId: number) => {
    setSelectedClassId(classId);
    navigate(`/teacher/settings/class/${classId}`);
  };

  // Class links
  const classLinks = classesData.map((classItem) => (
    <UnstyledButton
      key={classItem.id}
      className={`${classes.mainLink} ${
        selectedClassId === classItem.id
          ? "bg-gray-100 dark:bg-zinc-900"
          : " bg-white"
      }`}
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
          disabled
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

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<DefaultView />} />
          <Route
            path="/class/:classId"
            element={
              <ClassDetailsView
                classesData={classesData}
                onRefresh={getClasses}
              />
            }
          />
          <Route
            path="/student/:studentId"
            element={
              <StudentEditView
                classesData={classesData}
                onRefresh={getClasses}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}
