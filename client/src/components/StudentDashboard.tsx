import { Container, Tabs } from "@mantine/core";
import { IconHome, IconLogs } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";

export default function StudentDashBoard() {

    const navigate = useNavigate();
    const { tabValue } = useParams();
    return (
        <>
            <Container fluid className="justify-center">
                <Tabs
                    defaultValue="home"
                    value={tabValue}
                    onChange={(value) => value === "home" ? navigate('/') : navigate(`/student/${value}`)}
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
                </Tabs>

            </Container>
            <div>
                <h1>Student Dashboard</h1>
            </div>
        </>
    );
}

