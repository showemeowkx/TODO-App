import { useState, type FormEvent } from 'react';
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import type { CreateTodoDto } from '../types/todo';

type CreateTodoModalProps = {
  opened: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTodoDto) => Promise<void>;
};

export function CreateTodoModal({
  opened,
  onClose,
  onSubmit,
}: CreateTodoModalProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<number | string>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setTitle('');
    setPriority(1);
    setError(null);
  }

  function handleClose() {
    if (submitting) return;
    resetForm();
    onClose();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 3) {
      setError('Title must be at least 3 characters');
      return;
    }

    const priorityNumber =
      typeof priority === 'number' ? priority : Number(priority);

    if (
      Number.isNaN(priorityNumber) ||
      priorityNumber < 1 ||
      priorityNumber > 10
    ) {
      setError('Priority must be a number between 1 and 10');
      return;
    }

    const payload: CreateTodoDto = {
      title: trimmedTitle,
      priority: priorityNumber,
    };

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(payload);
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="New todo"
      centered
      radius="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Title"
            placeholder="What needs doing?"
            description="At least 3 characters"
            required
            value={title}
            onChange={(event) => setTitle(event.currentTarget.value)}
            data-autofocus
          />

          <NumberInput
            label="Priority"
            description="Optional, 1–10"
            min={1}
            max={10}
            clampBehavior="strict"
            value={priority}
            onChange={setPriority}
          />

          {error && (
            <Text size="sm" c="red">
              {error}
            </Text>
          )}

          <Group justify="flex-end" mt="xs">
            <Button
              variant="default"
              type="button"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button color="teal" type="submit" loading={submitting}>
              Create
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
