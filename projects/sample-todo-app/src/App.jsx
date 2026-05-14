import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const TODO_ITEMS_KEY = 'todo-items'

function App() {
  const inputRef = useRef(null);
  const [items, setItems] = useState(() => {
    try {
      const localStorageItems = localStorage.getItem(TODO_ITEMS_KEY);

      if (!localStorageItems) return [];

      return JSON.parse(localStorageItems);
    } catch {
      return [];
    }
  })
  const [editItemId, setEditItemId] = useState('');
  const [filter, setFilter] = useState('');

  const handleOnSubmit = useCallback((event) => { 
    const text = inputRef.current?.value?.trim();
    event.preventDefault();

    if (!text) return;

    if (items.some(item => item.text === text)) return;

    setItems(prev => [...prev, { id: Date.now().toString(), text, completed: false }]);
    inputRef.current.value = '';
    inputRef.current.focus();
  }, [items]);

  const removeItem = useCallback((id) => setItems(prev => prev.filter((item) => item.id !== id  )), []);

  const toggleComplete = useCallback((id) => setItems(prev => prev.map((item) => item.id === id ? {...item, completed: !item.completed} : item)), []);

  const handleOnEdit = useCallback((id) => setEditItemId(id), [] )

  const handleOnUpdate = useCallback((text) => {
    if (!editItemId) return false;

    setItems(prev => prev.map((item) => item.id === editItemId ? {...item, text} : item ))

    setEditItemId('');
  }, [editItemId]);

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
        toggleComplete={toggleComplete}
        removeItem={removeItem}
        onUpdateFilter={handleOnUpdateFilter}
      />

      <TodoForm inputRef={inputRef} onSubmit={handleOnSubmit} />
    </section>
  )
}

const TodoList = ({
  items,
  toggleComplete,
  removeItem,
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
                toggleComplete={toggleComplete}
                removeItem={removeItem}
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

const TodoItem = ({ item, toggleComplete, removeItem, editItemId, onEdit, onCancel, onUpdate }) => {
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
          <button onClick={() => toggleComplete(item.id)}>
            {item.completed ? 'Undo' : 'Complete'}
          </button>
          <button onClick={() => removeItem(item.id)}>Remove</button>
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
