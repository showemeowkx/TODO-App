import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Container,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconPlus,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { fetchTodos } from "../services/api";
import { TodoCard } from "../components/TodoCard";
import type { Todo } from "../types/todo";

export function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchTodos();
        if (cancelled) return;
        setTodos(response.data);
        setTotal(response.metadata.total);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load todos");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="app-shell">
      <Container size="sm" py={{ base: "xl", sm: 48 }}>
        <Stack gap="xl">
          <header className="app-header">
            <Text size="sm" tt="uppercase" fw={700} lts={1.5} c="teal.7" mb={6}>
              Task board
            </Text>
            <Title order={1} className="app-title">
              TODOs
            </Title>
            <Text c="dimmed" mt={8} maw={420}>
              Keep track of what matters.
            </Text>
          </header>

          <Stack gap="md" className="toolbar">
            <TextInput
              placeholder="Search tasks…"
              leftSection={<IconSearch size={16} />}
              size="md"
              radius="md"
              aria-label="Search tasks"
            />

            <Group gap="xs" wrap="wrap">
              <Text size="sm" c="dimmed" mr={4}>
                Status
              </Text>
              <Button variant="light" color="gray" radius="md" type="button">
                All
              </Button>
              <Button variant="light" color="teal" radius="md" type="button">
                Done
              </Button>
              <Button variant="light" color="gray" radius="md" type="button">
                Undone
              </Button>
            </Group>

            <Group gap="xs" wrap="wrap" justify="space-between">
              <Group gap="xs">
                <Text size="sm" c="dimmed" mr={4}>
                  Sort
                </Text>
                <Button
                  variant="default"
                  radius="md"
                  type="button"
                  leftSection={<IconSortAscending size={16} />}
                >
                  Priority ↑
                </Button>
                <Button
                  variant="default"
                  radius="md"
                  type="button"
                  leftSection={<IconSortDescending size={16} />}
                >
                  Priority ↓
                </Button>
              </Group>

              <Button
                color="teal"
                radius="md"
                type="button"
                leftSection={<IconPlus size={18} />}
              >
                New todo
              </Button>
            </Group>
          </Stack>

          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={600} size="sm">
                Your tasks
              </Text>
              {!loading && !error && (
                <Text size="sm" c="dimmed">
                  {total} total
                </Text>
              )}
            </Group>

            {loading && (
              <Group justify="center" py="xl">
                <Loader color="teal" />
              </Group>
            )}

            {error && (
              <Alert color="red" title="Could not load todos" radius="md">
                {error}
              </Alert>
            )}

            {!loading && !error && todos.length === 0 && (
              <Alert color="gray" title="No tasks yet" radius="md">
                Create your first todo to get started.
              </Alert>
            )}

            {!loading &&
              !error &&
              todos.map((todo) => <TodoCard key={todo.id} todo={todo} />)}
          </Stack>
        </Stack>
      </Container>
    </div>
  );
}
