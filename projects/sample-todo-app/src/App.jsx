import { useRef, useState } from 'react'

function App() {
  const inputRef = useRef(null);
  const [items, setItems] = useState([])

  const handleOnSubmit = (event) => { 
    const text = inputRef.current.value;
    event.preventDefault();

    if (!text) return;

    if (items.some(item => item.text === text)) return;

    setItems(prev => [...prev, { text, completed: false }]);
    inputRef.current.value = '';
    inputRef.current.focus();
  }

  const removeItem = (index) => setItems(prev => prev.filter((_, i) => i !== index  ));

  const toggleComplete = (index) => setItems(prev => prev.map((item, i) => i === index ? {...item, completed: !item.completed} : item));

  return (
    <section>
      <h1>Todo List</h1>

      <TodoList items={items} toggleComplete={toggleComplete} removeItem={removeItem} />

      <TodoForm inputRef={inputRef} onSubmit={handleOnSubmit} />
    </section>
  )
}

const TodoList = ({ items, toggleComplete, removeItem }) => items?.length ? (
  <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', maxWidth: '400px' }}>
    {items.map((item, index) => (
      <TodoItem key={index} item={item} index={index} toggleComplete={toggleComplete} removeItem={removeItem} />
    ))}
  </ul>
) : (
  <p style={{ marginTop: '1rem' }}>No items yet. Add a new item!</p>
)

const TodoItem = ({ item, index, toggleComplete, removeItem }) => (
  <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
    <span style={{ textDecoration: item.completed ? 'line-through' : 'none', flexGrow: 1 }}>{item.text}</span>
    <button onClick={() => toggleComplete(index)} style={{ marginRight: '0.5rem' }}>
      {item.completed ? 'Undo' : 'Complete'}
    </button>
    <button onClick={() => removeItem(index)}>Remove</button>
  </li>
)

const TodoForm = ({ inputRef, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
      <input ref={inputRef} type="text" placeholder="Add a new todo" />
      <button type="submit">Add</button>
    </form>
  )
}

export default App
