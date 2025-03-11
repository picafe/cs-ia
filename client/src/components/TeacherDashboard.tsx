import { Container, Select, Tabs } from "@mantine/core";
import { IconHome, IconSettings } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";

export default function TeacherDashboard() {
    const navigate = useNavigate();
    const { tabValue } = useParams();
    return (
        <>
            <Container fluid className="justify-center">
                <Tabs
                    defaultValue="home"
                    value={tabValue}
                    onChange={(value) => value === "home" ? navigate('/') : navigate(`/teacher/${value}`)}
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

                </Tabs>

            </Container>
            <div>
                <Select
                    label="Your favorite library"
                    placeholder="Pick value"
                    data={['React', 'Angular', 'Vue', 'Svelte']}
                />

            </div>
        </>

    )
}