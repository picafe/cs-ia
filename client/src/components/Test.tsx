import { useState } from "react";
import { ActionIcon, Popover, Table, Text } from "@mantine/core";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconCircleMinus,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";

const logs = [
  {
    status: "flagged",
    hours: 6,
    category: "Speaking",
    name: "Debating with a French pen pal on current events",
  },
  {
    status: "neutral",
    hours: 2,
    category: "Reading",
    name: "Reading articles from Le Monde on political issues",
  },
  {
    status: "neutral",
    hours: 3,
    category: "Writing",
    name:
      "Composing a detailed essay on the impact of French culture in modern society",
  },
  {
    status: "approved",
    hours: 5,
    category: "Listening",
    name: 'Listening to advanced French podcasts such as "France Culture"',
  },
  {
    status: "neutral",
    hours: 5,
    category: "Reading",
    name: 'Reading "L’Étranger" by Albert Camus',
  },
];

export default function Test() {
  const [popoverState, setPopoverState] = useState(
    Array(logs.length).fill(false),
  );
  const togglePopover = (index: number) => {
    setPopoverState((prev) =>
      prev.map((isOpen, i) => (i === index ? !isOpen : isOpen))
    );
  };
  const rows = logs.map((log, index) => (
    <Table.Tr
      key={log.name}
    >
      <Table.Td>
        {(() => {
          switch (log.status) {
            case "flagged":
              return (
                <Popover
                  width={175}
                  opened={popoverState[index]}
                  withArrow
                  arrowPosition="side"
                >
                  <Popover.Target>
                    <IconAlertTriangle
                      onMouseEnter={() => togglePopover(index)}
                      onMouseLeave={() => togglePopover(index)}
                      stroke={1.75}
                      className="size-[22px] stroke-orange-600"
                    />
                  </Popover.Target>
                  <Popover.Dropdown
                    bg={"var(--mantine-color-gray-0)"}
                    style={{ pointerEvents: "none" }}
                  >
                    <Text ta="center" size="xs">
                      This entry has been flagged by your teacher. Please modify
                      it and let your teacher know.
                    </Text>
                  </Popover.Dropdown>
                </Popover>
              );

            case "approved":
              return (
                <Popover
                  width={175}
                  opened={popoverState[index]}
                  withArrow
                  arrowPosition="side"
                >
                  <Popover.Target>
                    <IconCircleCheck
                      onMouseEnter={() => togglePopover(index)}
                      onMouseLeave={() => togglePopover(index)}
                      stroke={1.75}
                      className="size-[22px] stroke-green-700"
                    />
                  </Popover.Target>
                  <Popover.Dropdown
                    bg={"var(--mantine-color-gray-0)"}
                    style={{ pointerEvents: "none" }}
                  >
                    <Text ta="center" size="xs">
                      This entry has been approved by your teacher.
                    </Text>
                  </Popover.Dropdown>
                </Popover>
              );

            default:
              return (
                <Popover
                  width={175}
                  opened={popoverState[index]}
                  withArrow
                  arrowPosition="side"
                >
                  <Popover.Target>
                    <IconCircleMinus
                      onMouseEnter={() => togglePopover(index)}
                      onMouseLeave={() => togglePopover(index)}
                      stroke={1.75}
                      className="size-[22px]"
                    />
                  </Popover.Target>
                  <Popover.Dropdown
                    bg={"var(--mantine-color-gray-0)"}
                    style={{ pointerEvents: "none" }}
                  >
                    <Text ta="center" size="xs">
                      This entry has yet to be approved by your teacher. Submit
                      your hours for your teacher to review it.
                    </Text>
                  </Popover.Dropdown>
                </Popover>
              );
          }
        })()}
      </Table.Td>
      <Table.Td>{log.hours}</Table.Td>
      <Table.Td>{log.category}</Table.Td>
      <Table.Td align="left">{log.name}</Table.Td>
      <Table.Td className="flex flex-row gap-2">
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label="Edit Entry"
          size={24}
        >
          <IconEdit stroke={1.5} className="size-5" />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="red"
          aria-label="Delete Entry"
          size={24}
        >
          <IconTrash stroke={1.5} className="size-5 stroke-red-600" />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table.ScrollContainer minWidth={800} className="relative">
      <Table verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th ta="left">Status</Table.Th>
            <Table.Th ta="center">Hours</Table.Th>
            <Table.Th ta="center">Category</Table.Th>
            <Table.Th ta="left">Name</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
