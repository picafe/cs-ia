import { Card, Group, Image, RingProgress, Text } from "@mantine/core";

const stats = [
  { title: "Distance", value: "27.4 km" },
  { title: "Avg. speed", value: "9.6 km/h" },
  { title: "Score", value: "88/100" },
];

export function ClassCard() {
  const items = stats.map((stat) => (
    <div key={stat.title}>
      <Text size="xs" c="dimmed">
        {stat.title}
      </Text>
      <Text fw={500} size="sm">
        {stat.value}
      </Text>
    </div>
  ));

  return (
    <Card
      withBorder
      padding="lg"
      className="bg-zinc-300"
      component="a"
      href="/class/1"
    >
      <Card.Section>
        <Image
          src="https://images.unsplash.com/photo-1581889470536-467bdbe30cd0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80"
          alt="Running challenge"
          height={200}
        />
      </Card.Section>

      <Group justify="space-between" mt="xl">
        <Text fz="sm" fw={700}>
          Running challenge
        </Text>
        <Group gap={5}>
          <Text fz="xs" c="dimmed">
            80% completed
          </Text>
          <RingProgress
            size={18}
            thickness={2}
            sections={[{ value: 80, color: "blue" }]}
          />
        </Group>
      </Group>
      <Text mt="sm" mb="md" c="dimmed" fz="xs">
        56 km this month • 17% improvement compared to last month • 443 place in
        global scoreboard
      </Text>
      <Card.Section>{items}</Card.Section>
    </Card>
  );
}
