import React, { useEffect, useRef, useState } from 'react';
import * as todoService from './api/httpClient';
import { ErrorMessages, FilterStatus, Todo } from './types/Todo';
import { Header } from './component/Header';
import { Footer } from './component/Footer';
import { ErrorNotification } from './component/ErrorNotification';
import { TodoList } from './component/TodoList';
import { UserWarning } from './UserWarning';
import { TempTodo } from './component/TempTodo';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState<ErrorMessages>(
    ErrorMessages.DEFAULT,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>(
    FilterStatus.ALL,
  );
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [query, setQuery] = useState('');
  const [isLoadingTodo, setIsLoadingTodo] = useState<number[]>([]);

  function loadTodos() {
    setIsLoading(true);

    todoService
      .getTodos()
      .then(setTodos)
      .catch(() => {
        setErrorMessage(ErrorMessages.LOAD_TODOS);
        setTimeout(() => {
          setErrorMessage(ErrorMessages.DEFAULT);
        }, 3000);
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(loadTodos, []);

  const filteredTodos = todos.filter(todo => {
    switch (filterStatus) {
      case FilterStatus.ACTIVE:
        return !todo.completed;
      case FilterStatus.COMPLETED:
        return todo.completed;
      default:
        return true;
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAddTodo = ({ id, title, completed, userId }: Todo) => {
    setTempTodo({ id, title, completed, userId });
    (inputRef.current as HTMLInputElement).disabled = true;

    todoService
      .createTodo({ title, completed, userId })
      .then(newTodo => {
        setTodos(currentTodos => [...currentTodos, newTodo]);
        setTempTodo(null);
        setQuery('');
        (inputRef.current as HTMLInputElement).disabled = false;
        inputRef.current?.focus();
      })
      .catch(() => {
        setErrorMessage(ErrorMessages.ADD_TODO);
        setTimeout(() => {
          setErrorMessage(ErrorMessages.DEFAULT);
        }, 3000);
        setTempTodo(null);
        (inputRef.current as HTMLInputElement).disabled = false;
        inputRef.current?.focus();
      });
  };

  const handleDeleteTodo = (todoId: number) => {
    setIsLoadingTodo(prev => [...prev, todoId]);
    todoService
      .deleteTodo(todoId)
      .then(() => {
        const selectedTodo = todos.filter(todo => todo.id !== todoId);

        setTodos(selectedTodo);
        inputRef.current?.focus();
      })
      .catch(() => {
        setErrorMessage(ErrorMessages.DELETE_TODO);
        setTimeout(() => {
          setErrorMessage(ErrorMessages.DEFAULT);
        }, 3000);
        inputRef.current?.focus();
      })
      .finally(() =>
        setIsLoadingTodo(prev => prev.filter(id => id !== todoId)),
      );
  };

  const handleDeleteAllCompletedTodos = () => {
    const completedTodos = todos.filter(todo => todo.completed);

    if (completedTodos.length === 0) {
      return;
    }

    setIsLoadingTodo(completedTodos.map(todo => todo.id));

    completedTodos.forEach(todo =>
      todoService
        .deleteTodo(todo.id)
        .then(() => {
          setTodos(currentTodos =>
            currentTodos.filter(el => el.id !== todo.id),
          );
          inputRef.current?.focus();
        })
        .catch(() => {
          setErrorMessage(ErrorMessages.DELETE_TODO);
          setTimeout(() => {
            setErrorMessage(ErrorMessages.DEFAULT);
          }, 3000);
          inputRef.current?.focus();
        })
        .finally(() => {
          setIsLoadingTodo([]);
        }),
    );
  };

  const handleUpdateTodo = (updatedTodo: Todo) => {
    setIsLoadingTodo([...isLoadingTodo, updatedTodo.id]);
    todoService
      .updateTodo(updatedTodo)
      .then(todo => {
        setTodos(currentTodos => {
          return currentTodos.map(item => (todo.id === item.id ? todo : item));
        });
      })
      .catch(() => {
        setIsLoadingTodo(isLoadingTodo.filter(id => id !== updatedTodo.id));
        setErrorMessage(ErrorMessages.UPDATE_TODO);
        setTimeout(() => {
          setErrorMessage(ErrorMessages.DEFAULT);
        }, 3000);
      })
      .finally(() => {
        setIsLoadingTodo(ids => ids.filter(id => id !== updatedTodo.id));
      });
  };

  const handleChangeCompletedAllTodos = () => {
    const areAllCompleted = todos.every(todo => todo.completed);

    setTodos(
      todos.map(todo => ({
        ...todo,
        completed: !areAllCompleted,
      })),
    );
  };

  if (!todoService.USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          todos={todos}
          handleChangeCompletedAllTodos={handleChangeCompletedAllTodos}
          handleAddTodo={handleAddTodo}
          setErrorMessage={setErrorMessage}
          query={query}
          setQuery={setQuery}
          inputRef={inputRef}
        />

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            <TodoList
              filteredTodos={filteredTodos}
              handleDeleteTodo={handleDeleteTodo}
              isLoadingTodo={isLoadingTodo}
              handleUpdateTodo={handleUpdateTodo}
            />
            {tempTodo && <TempTodo tempTodo={tempTodo} />}
          </>
        )}
        {todos.length > 0 && (
          <Footer
            todos={todos}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            handleDeleteAllCompletedTodos={handleDeleteAllCompletedTodos}
          />
        )}
      </div>

      <ErrorNotification
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </div>
  );
};
