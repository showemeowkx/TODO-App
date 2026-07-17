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
import { createTodo, deleteTodo, fetchTodos, toggleTodo } from "../services/api";
import { TodoCard } from "../components/TodoCard";
import { CreateTodoModal } from "../components/CreateTodoModal";
import {
  SortMethods,
  TodoFilters,
  type CreateTodoDto,
  type SortMethod,
  type Todo,
  type TodoFilter,
} from "../types/todo";

const PAGE_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<TodoFilter | null>(null);
  const [sortMethod, setSortMethod] = useState<SortMethod | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);

  const hasMore = todos.length < total;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = search.trim();
      setDebouncedSearch((prev) => {
        if (prev === next) return prev;
        setPage(1);
        setTodos([]);
        return next;
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [search]);

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
        const response = await fetchTodos({
          page,
          limit: PAGE_LIMIT,
          search: debouncedSearch || undefined,
          filter: filter ?? undefined,
          sortMethod: sortMethod ?? undefined,
        });
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
  }, [page, debouncedSearch, filter, sortMethod, reloadKey]);

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

  async function handleDelete(id: number) {
    setDeletingId(id);
    setError(null);

    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete todo");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggle(id: number) {
    setTogglingId(id);
    setError(null);

    try {
      await toggleTodo(id);
      setTodos((prev) =>
        prev.flatMap((todo) => {
          if (todo.id !== id) return [todo];

          const next = { ...todo, isDone: !todo.isDone };

          if (filter === TodoFilters.DONE && !next.isDone) {
            return [];
          }
          if (filter === TodoFilters.UNDONE && next.isDone) {
            return [];
          }

          return [next];
        }),
      );
      if (
        filter === TodoFilters.DONE ||
        filter === TodoFilters.UNDONE
      ) {
        setTotal((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle todo");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleCreate(payload: CreateTodoDto) {
    await createTodo(payload);
    setPage(1);
    setTodos([]);
    setReloadKey((key) => key + 1);
  }

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
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
            />

            <Group gap="xs" wrap="wrap">
              <Text size="sm" c="dimmed" mr={4}>
                Status
              </Text>
              <Button
                variant={filter === null ? "filled" : "light"}
                color={filter === null ? "teal" : "gray"}
                radius="md"
                type="button"
                onClick={() => {
                  setFilter(null);
                  setPage(1);
                  setTodos([]);
                }}
              >
                All
              </Button>
              <Button
                variant={filter === TodoFilters.DONE ? "filled" : "light"}
                color={filter === TodoFilters.DONE ? "teal" : "gray"}
                radius="md"
                type="button"
                onClick={() => {
                  setFilter(TodoFilters.DONE);
                  setPage(1);
                  setTodos([]);
                }}
              >
                Done
              </Button>
              <Button
                variant={filter === TodoFilters.UNDONE ? "filled" : "light"}
                color={filter === TodoFilters.UNDONE ? "teal" : "gray"}
                radius="md"
                type="button"
                onClick={() => {
                  setFilter(TodoFilters.UNDONE);
                  setPage(1);
                  setTodos([]);
                }}
              >
                Undone
              </Button>
            </Group>

            <Group gap="xs" wrap="wrap" justify="space-between">
              <Group gap="xs">
                <Text size="sm" c="dimmed" mr={4}>
                  Sort
                </Text>
                <Button
                  variant={
                    sortMethod === SortMethods.PRIORITY_ASC
                      ? "filled"
                      : "default"
                  }
                  color={
                    sortMethod === SortMethods.PRIORITY_ASC ? "teal" : undefined
                  }
                  radius="md"
                  type="button"
                  leftSection={<IconSortAscending size={16} />}
                  onClick={() => {
                    setSortMethod((current) =>
                      current === SortMethods.PRIORITY_ASC
                        ? null
                        : SortMethods.PRIORITY_ASC,
                    );
                    setPage(1);
                    setTodos([]);
                  }}
                >
                  Priority ↑
                </Button>
                <Button
                  variant={
                    sortMethod === SortMethods.PRIORITY_DESC
                      ? "filled"
                      : "default"
                  }
                  color={
                    sortMethod === SortMethods.PRIORITY_DESC
                      ? "teal"
                      : undefined
                  }
                  radius="md"
                  type="button"
                  leftSection={<IconSortDescending size={16} />}
                  onClick={() => {
                    setSortMethod((current) =>
                      current === SortMethods.PRIORITY_DESC
                        ? null
                        : SortMethods.PRIORITY_DESC,
                    );
                    setPage(1);
                    setTodos([]);
                  }}
                >
                  Priority ↓
                </Button>
                <Button
                  variant={
                    sortMethod === SortMethods.DUE_DATE_ASC
                      ? "filled"
                      : "default"
                  }
                  color={
                    sortMethod === SortMethods.DUE_DATE_ASC ? "teal" : undefined
                  }
                  radius="md"
                  type="button"
                  leftSection={<IconSortAscending size={16} />}
                  onClick={() => {
                    setSortMethod((current) =>
                      current === SortMethods.DUE_DATE_ASC
                        ? null
                        : SortMethods.DUE_DATE_ASC,
                    );
                    setPage(1);
                    setTodos([]);
                  }}
                >
                  Due ↑
                </Button>
                <Button
                  variant={
                    sortMethod === SortMethods.DUE_DATE_DESC
                      ? "filled"
                      : "default"
                  }
                  color={
                    sortMethod === SortMethods.DUE_DATE_DESC
                      ? "teal"
                      : undefined
                  }
                  radius="md"
                  type="button"
                  leftSection={<IconSortDescending size={16} />}
                  onClick={() => {
                    setSortMethod((current) =>
                      current === SortMethods.DUE_DATE_DESC
                        ? null
                        : SortMethods.DUE_DATE_DESC,
                    );
                    setPage(1);
                    setTodos([]);
                  }}
                >
                  Due ↓
                </Button>
              </Group>

              <Button
                color="teal"
                radius="md"
                type="button"
                leftSection={<IconPlus size={18} />}
                onClick={() => setCreateOpen(true)}
              >
                New todo
              </Button>
            </Group>
          </Stack>

          <CreateTodoModal
            opened={createOpen}
            onClose={() => setCreateOpen(false)}
            onSubmit={handleCreate}
          />

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
              todos.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  deleting={deletingId === todo.id}
                  toggling={togglingId === todo.id}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              ))}

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
