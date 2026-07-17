import { ActionIcon, Badge, Card, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { IconCircleCheck, IconCircle, IconTrash } from "@tabler/icons-react";
import type { Todo } from "../types/todo";

type TodoCardProps = {
  todo: Todo;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
  deleting?: boolean;
  toggling?: boolean;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function TodoCard({
  todo,
  onDelete,
  onToggle,
  deleting = false,
  toggling = false,
}: TodoCardProps) {
  return (
    <Card
      padding="lg"
      radius="md"
      withBorder
      className="todo-card"
      style={{
        borderColor: todo.isDone ? "#b7d4cc" : "#d7e0dc",
        background: todo.isDone ? "#eef7f4" : "#ffffff",
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
        <Group align="flex-start" gap="sm" wrap="nowrap" style={{ flex: 1 }}>
          <UnstyledButton
            onClick={() => onToggle(todo.id)}
            disabled={toggling || deleting}
            aria-label={todo.isDone ? "Mark as undone" : "Mark as done"}
            style={{
              display: "flex",
              marginTop: 2,
              opacity: toggling ? 0.6 : 1,
            }}
          >
            {todo.isDone ? (
              <IconCircleCheck size={22} color="#2a9d8f" aria-hidden />
            ) : (
              <IconCircle size={22} color="#8aa099" aria-hidden />
            )}
          </UnstyledButton>
          <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
            <Text
              fw={600}
              size="md"
              c={todo.isDone ? "dimmed" : "dark"}
              td={todo.isDone ? "line-through" : undefined}
              style={{ wordBreak: "break-word" }}
            >
              {todo.title}
            </Text>
            <Text size="xs" c="dimmed">
              {formatDate(todo.createdAt)}
            </Text>
          </Stack>
        </Group>

        <Group gap="xs" wrap="nowrap">
          <Badge
            variant="light"
            color={
              todo.priority >= 8 ? "red" : todo.priority >= 5 ? "orange" : "teal"
            }
            radius="sm"
          >
            {todo.priority}
          </Badge>
          <ActionIcon
            variant="subtle"
            color="red"
            radius="md"
            type="button"
            aria-label="Delete todo"
            loading={deleting}
            disabled={deleting || toggling}
            onClick={() => onDelete(todo.id)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
  );
}
