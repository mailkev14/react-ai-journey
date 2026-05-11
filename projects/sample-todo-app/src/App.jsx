import { useCallback, useRef, useState } from 'react'

function App() {
  const inputRef = useRef(null);
  const [items, setItems] = useState([])
  const [editIndex, setEditIndex] = useState(-1);

  const handleOnSubmit = useCallback((event) => { 
    const text = inputRef.current?.value?.trim();
    event.preventDefault();

    if (!text) return;

    if (items.some(item => item.text === text)) return;

    setItems(prev => [...prev, { text, completed: false }]);
    inputRef.current.value = '';
    inputRef.current.focus();
  }, [items]);

  const removeItem = useCallback((index) => setItems(prev => prev.filter((_, i) => i !== index  )), []);

  const toggleComplete = useCallback((index) => setItems(prev => prev.map((item, i) => i === index ? {...item, completed: !item.completed} : item)), []);

  const handleOnEdit = useCallback((index) => setEditIndex(index), [] )

  const handleOnUpdate = useCallback((text) => {
    if (editIndex < 0) return false;

    setItems(prev => items.map((item, i) => i === editIndex ? {...item, text} : item ))

    setEditIndex(-1);
  }, []);

  const handleOnCancel = useCallback(() => setEditIndex(-1), [])

  return (
    <section>
      <h1>Todo List</h1>

      <TodoList
        editIndex={editIndex}
        onEdit={handleOnEdit}
        onUpdate={handleOnUpdate}
        onCancel={handleOnCancel}
        items={items}
        toggleComplete={toggleComplete}
        removeItem={removeItem}
      />

      <TodoForm inputRef={inputRef} onSubmit={handleOnSubmit} />
    </section>
  )
}

const TodoList = ({ items, toggleComplete, removeItem, editIndex, onEdit, onUpdate, onCancel }) => items?.length ? (
  <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', maxWidth: '400px' }}>
    {items.map((item, index) => (
      <TodoItem
        key={index}
        item={item}
        index={index}
        toggleComplete={toggleComplete}
        removeItem={removeItem}
        editIndex={editIndex}
        onEdit={onEdit}
        onUpdate={onUpdate}
        onCancel={onCancel}
      />
    ))}
  </ul>
) : (
  <p style={{ marginTop: '1rem' }}>No items yet. Add a new item!</p>
)

const TodoItem = ({ item, index, toggleComplete, removeItem, editIndex, onEdit, onCancel, onUpdate }) => {
  const editInputRef = useRef(null);
  const handleOnSubmit = useCallback((e) => {
    e.preventDefault();

    const newText = editInputRef.current?.value?.trim();
    
    if (!newText || newText === item.text) return false;
    
    editInputRef.current.value = ''
    onUpdate(newText);
  }, [onUpdate]);

  const handleOnEdit = useCallback(() => onEdit(index), [onEdit]);

  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', width: '100%' }}>
      {editIndex === index ? (
        <form onSubmit={handleOnSubmit} style={{display: 'flex', gap: '0.5rem'}}>
          <input type="text" ref={editInputRef} defaultValue={item.text} />

          <button type="submit">Save</button>
          <button onClick={onCancel}>Cancel</button>
        </form>
      ) : (
        <>
          <span style={{ textDecoration: item.completed ? 'line-through' : 'none', flexGrow: 1 }}>{item.text}</span>
          <button onClick={handleOnEdit}>Edit</button>
          <button onClick={() => toggleComplete(index)}>
            {item.completed ? 'Undo' : 'Complete'}
          </button>
          <button onClick={() => removeItem(index)}>Remove</button>
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
