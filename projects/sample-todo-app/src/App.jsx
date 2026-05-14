import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'

const TODO_ITEMS_KEY = 'todo-items'

const ACTION_MAP = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  TOGGLE_ITEM: 'TOGGLE_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
}

function reducerFn (state, action) {
  switch (action.type) {
    case ACTION_MAP.ADD_ITEM:
      return [...state, { id: Date.now().toString(), completed: false, ...action.payload }];
    case ACTION_MAP.REMOVE_ITEM:
      return state.filter(prev => prev.id !== action?.payload?.id);
    case ACTION_MAP.TOGGLE_ITEM:
      return state.map(prev => prev.id === action?.payload?.id ? { ...prev, completed: !prev.completed } : prev);
    case ACTION_MAP.UPDATE_ITEM:
      return state.map(prev => prev.id === action?.payload?.id ? { ...prev, ...action.payload } : prev);
    default:
      return state;
  }
}

function App() {
  const inputRef = useRef(null);
  const [items, dispatch] = useReducer(reducerFn, [], () => {
    try {
      const localStorageItems = localStorage.getItem(TODO_ITEMS_KEY);

      if (!localStorageItems) return [];

      return JSON.parse(localStorageItems);
    } catch {
      return [];
    }
  });
  
  const [editItemId, setEditItemId] = useState('');
  const [filter, setFilter] = useState('');

  const handleOnSubmit = useCallback((event) => { 
    const text = inputRef.current?.value?.trim();
    event.preventDefault();

    if (!text) return;

    if (items.some(item => item.text === text)) return;

    dispatch({ type: ACTION_MAP.ADD_ITEM, payload: { text } });
    inputRef.current.value = '';
    inputRef.current.focus();
  }, [items, dispatch]);

  const handleOnRemoveItem = useCallback((id) => dispatch({ type: ACTION_MAP.REMOVE_ITEM, payload: { id } }), [dispatch]);

  const handleOnToggleComplete = useCallback((id) => dispatch({ type: ACTION_MAP.TOGGLE_ITEM, payload: { id } }), [dispatch]);

  const handleOnEdit = (id) => setEditItemId(id);

  const handleOnUpdate = useCallback((text) => {
    if (!editItemId) return false;

    dispatch({ type: ACTION_MAP.UPDATE_ITEM, payload: { id: editItemId, text } })

    setEditItemId('');
  }, [editItemId, dispatch]);

  const handleOnCancel = useCallback(() => setEditItemId(''), [])

  const handleOnUpdateFilter = useCallback((filter) => {
    if (filter !== 'all' && filter !== '' && filter !== 'pending' && filter !== 'completed') return false;

    setFilter(filter);
  }, [])

  const filteredItems = useMemo(() => items.filter((item) => {
    switch (filter) {
      case 'pending':
        return !item.completed;
      case 'completed':
        return item.completed;
      default:
        return true;
    }
  }), [items, filter]);

  useEffect(() => {
    const itemsToPersist = JSON.stringify(items);

    localStorage.setItem(TODO_ITEMS_KEY, itemsToPersist);
  }, [items])

  return (
    <section>
      <h1>Todo List</h1>

      <TodoList
        editItemId={editItemId}
        onEdit={handleOnEdit}
        onUpdate={handleOnUpdate}
        onCancel={handleOnCancel}
        items={filteredItems}
        onToggleComplete={handleOnToggleComplete}
        onRemoveItem={handleOnRemoveItem}
        onUpdateFilter={handleOnUpdateFilter}
      />

      <TodoForm inputRef={inputRef} onSubmit={handleOnSubmit} />
    </section>
  )
}

const TodoList = ({
  items,
  onToggleComplete,
  onRemoveItem,
  editItemId,
  onEdit,
  onUpdate,
  onCancel,
  onUpdateFilter
}) => {
  
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <label htmlFor="filter">Filter By</label>
        <select
          id="filter"
          onChange={(e) => onUpdateFilter(e.target?.value)}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      {
        items?.length ? (
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', maxWidth: '400px' }}>
            {items.map((item, index) => (
              <TodoItem
                key={item.id}
                item={item}
                onToggleComplete={onToggleComplete}
                onRemoveItem={onRemoveItem}
                editItemId={editItemId}
                onEdit={onEdit}
                onUpdate={onUpdate}
                onCancel={onCancel}
              />
            ))}
          </ul>
        ) : (
          <p>There are no items. Please change the filter or add more items</p>
        )
      }
    </div>
  )
}

const TodoItem = ({ item, onToggleComplete, onRemoveItem, editItemId, onEdit, onCancel, onUpdate }) => {
  const editInputRef = useRef(null);
  const handleOnSubmit = useCallback((e) => {
    e.preventDefault();

    const newText = editInputRef.current?.value?.trim();
    
    if (!newText || newText === item.text) return false;
    
    editInputRef.current.value = ''
    onUpdate(newText);
  }, [onUpdate, item.text]);

  const handleOnEdit = useCallback(() => onEdit(item.id), [onEdit]);

  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', width: '100%' }}>
      {editItemId === item.id ? (
        <form onSubmit={handleOnSubmit} style={{display: 'flex', gap: '0.5rem'}}>
          <input type="text" ref={editInputRef} defaultValue={item.text} />

          <button type="submit">Save</button>
          <button onClick={onCancel}>Cancel</button>
        </form>
      ) : (
        <>
          <span style={{ textDecoration: item.completed ? 'line-through' : 'none', flexGrow: 1 }}>{item.text}</span>
          <button onClick={handleOnEdit}>Edit</button>
          <button onClick={() => onToggleComplete(item.id)}>
            {item.completed ? 'Undo' : 'Complete'}
          </button>
          <button onClick={() => onRemoveItem(item.id)}>Remove</button>
        </>
      )}
    </li>
  )
}

const TodoForm = ({ inputRef, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
      <input ref={inputRef} type="text" placeholder="Add a new todo" />
      <button type="submit">Add</button>
    </form>
  )
}

export default App
