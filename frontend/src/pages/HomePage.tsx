import { useEffect, useRef, useState } from "react";
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

const PAGE_LIMIT = 10;

export function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);

  const hasMore = todos.length < total;

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      loadingRef.current = true;
      setError(null);

      if (page === 1) {
        setInitialLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const response = await fetchTodos({ page, limit: PAGE_LIMIT });
        if (cancelled) return;

        setTotal(response.metadata.total);
        setTodos((prev) => {
          if (page === 1) return response.data;

          const existingIds = new Set(prev.map((todo) => todo.id));
          const next = response.data.filter(
            (todo) => !existingIds.has(todo.id),
          );
          return [...prev, ...next];
        });
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load todos");
      } finally {
        if (!cancelled) {
          setInitialLoading(false);
          setLoadingMore(false);
          loadingRef.current = false;
        }
      }
    }

    void loadPage();

    return () => {
      cancelled = true;
    };
  }, [page]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting;
        if (!visible || !hasMore || loadingRef.current || error) return;
        setPage((current) => current + 1);
      },
      { root: null, rootMargin: "240px", threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, error]);

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
              {!initialLoading && !error && (
                <Text size="sm" c="dimmed">
                  {total} total
                </Text>
              )}
            </Group>

            {initialLoading && (
              <Group justify="center" py="xl">
                <Loader color="teal" />
              </Group>
            )}

            {error && (
              <Alert color="red" title="Could not load todos" radius="md">
                {error}
              </Alert>
            )}

            {!initialLoading && !error && todos.length === 0 && (
              <Alert color="gray" title="No tasks yet" radius="md">
                Create your first todo to get started.
              </Alert>
            )}

            {!initialLoading &&
              !error &&
              todos.map((todo) => <TodoCard key={todo.id} todo={todo} />)}

            <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />

            {loadingMore && (
              <Group justify="center" py="md">
                <Loader color="teal" size="sm" />
              </Group>
            )}

            {!initialLoading && !error && !hasMore && todos.length > 0 && (
              <Text size="sm" c="dimmed" ta="center" py="sm">
                No more tasks here ;)
              </Text>
            )}
          </Stack>
        </Stack>
      </Container>
    </div>
  );
}
