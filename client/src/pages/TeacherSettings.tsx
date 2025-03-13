import { ActionIcon, Badge, Code, Group, TextInput, Tooltip, Text, UnstyledButton, Container, Tabs } from "@mantine/core";
import { IconBulb, IconCheckbox, IconHome, IconPlus, IconSearch, IconSettings, IconUser } from "@tabler/icons-react";
import classes from './TeacherSettings.module.css';
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";



export default function TeacherSettings() {
    const serverUrl = import.meta.env.VITE_SERVER_URL;

    const links = [
        { icon: IconBulb, label: 'Activity', notifications: 3 },
        { icon: IconCheckbox, label: 'Tasks', notifications: 4 },
        { icon: IconUser, label: 'Contacts' },
    ];


    const getClasses = async () => {
        try {
            const res = await axios.get(serverUrl + "/classes", {withCredentials: true})
            console.log(res.data);
        } catch (error) {
            console.error(error);
        } 

    };

    getClasses();



    const mainLinks = links.map((link) => (
        <UnstyledButton key={link.label} className={classes.mainLink}>
            <div className={classes.mainLinkInner}>
                <link.icon size={20} className={classes.mainLinkIcon} stroke={1.5} />
                <span>{link.label}</span>
            </div>
            {link.notifications && (
                <Badge size="sm" variant="filled" className={classes.mainLinkBadge}>
                    {link.notifications}
                </Badge>
            )}
        </UnstyledButton>
    ));

    return (
        <>
            <nav className={classes.navbar}>

                <TextInput
                    placeholder="Search"
                    size="xs"
                    leftSection={<IconSearch size={12} stroke={1.5} />}
                    rightSectionWidth={70}
                    rightSection={<Code className={classes.searchCode}>Ctrl + K</Code>}
                    styles={{ section: { pointerEvents: 'none' } }}
                    mb="sm"
                />

                {/* <div className={classes.section}>
                <div className={classes.mainLinks}>{mainLinks}</div>
            </div> */}

                <div className={classes.section}>
                    <Group className={`${classes.collectionsHeader} mr-2.5 items-center`} justify="space-between">
                        <Text size="sm" fw={500} c="dimmed">
                            Classes
                        </Text>
                        <Tooltip label="Create Class" withArrow position="right" >
                            <ActionIcon variant="default" size={18} component={Link} to="/class/new" viewTransition>
                                <IconPlus size={16} stroke={1.5} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                    <div className={classes.collections}>
                        <div className={classes.mainLinks}>{mainLinks}</div>
                    </div>
                    {/* <div className={classes.collections}>{collectionLinks}</div> */}
                </div>
            </nav>
        </>
    );
}