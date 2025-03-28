import classNames from 'classnames';
import React from 'react';
import { ErrorMessages, Todo } from '../types/Todo';
import { USER_ID } from '../api/httpClient';

type Props = {
  todos: Todo[];
  handleChangeCompletedAllTodos: () => void;
  handleAddTodo: (newTodo: Todo) => void;
  setErrorMessage: (error: ErrorMessages) => void;
  setQuery: (query: string) => void;
  query: string;
  inputRef: React.RefObject<HTMLInputElement>;
};

export const Header: React.FC<Props> = ({
  todos,
  handleChangeCompletedAllTodos,
  handleAddTodo,
  setErrorMessage,
  setQuery,
  query,
  inputRef,
}) => {
  const handleCreateTodo = () => {
    if (!query.trim()) {
      setErrorMessage(ErrorMessages.EMPTY_TITLE);
      setTimeout(() => {
        setErrorMessage(ErrorMessages.DEFAULT);
      }, 3000);

      return;
    }

    const newTodo: Todo = {
      id: 0,
      userId: USER_ID,
      title: query.trim(),
      completed: false,
    };

    handleAddTodo(newTodo);
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleCreateTodo();
  };

  return (
    <header className="todoapp__header">
      <button
        type="button"
        className={classNames('todoapp__toggle-all', {
          active: todos.every(todo => todo.completed),
        })}
        data-cy="ToggleAllButton"
        onClick={handleChangeCompletedAllTodos}
      />
      <form onSubmit={onSubmit}>
        <input
          ref={inputRef}
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
      </form>
    </header>
  );
};
