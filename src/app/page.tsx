"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"

type User = {
  username: string;
  password: string;
}

type Todo = {
  id: number;
  text: string;
  completed: boolean;
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [todos, setTodos] = useState<Todo[]>([])
  const [loginError, setLoginError] = useState<string | null>(null)

  useEffect(() => {
    const user = localStorage.getItem('currentUser')
    if (user) {
      setIsLoggedIn(true)
      setCurrentUser(user)
      loadTodos(user)
    }
  }, [])

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const newUser: User = { username, password }
    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))
    localStorage.setItem('currentUser', username)
    setIsLoggedIn(true)
    setCurrentUser(username)
    setTodos([])
    setLoginError(null)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]')
    const user = users.find(u => u.username === username)
    
    if (!user) {
      setLoginError("User not found. Please check your username.")
    } else if (user.password !== password) {
      setLoginError("Incorrect password. Please try again.")
    } else {
      localStorage.setItem('currentUser', username)
      setIsLoggedIn(true)
      setCurrentUser(username)
      loadTodos(username)
      setLoginError(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    setIsLoggedIn(false)
    setCurrentUser(null)
    setTodos([])
    setLoginError(null)
  }

  const loadTodos = (username: string) => {
    const userTodos = JSON.parse(localStorage.getItem(`todos_${username}`) || '[]')
    setTodos(userTodos)
  }

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault()
    const newTodoText = (e.target as HTMLFormElement).todo.value.trim()
    if (newTodoText && currentUser) {
      const newTodo: Todo = { id: Date.now(), text: newTodoText, completed: false }
      const updatedTodos = [...todos, newTodo]
      setTodos(updatedTodos)
      localStorage.setItem(`todos_${currentUser}`, JSON.stringify(updatedTodos))
      ;(e.target as HTMLFormElement).todo.value = ''
    }
  }

  const toggleTodo = (id: number) => {
    if (currentUser) {
      const updatedTodos = todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
      setTodos(updatedTodos)
      localStorage.setItem(`todos_${currentUser}`, JSON.stringify(updatedTodos))
    }
  }

  const deleteTodo = (id: number) => {
    if (currentUser) {
      const updatedTodos = todos.filter(todo => todo.id !== id)
      setTodos(updatedTodos)
      localStorage.setItem(`todos_${currentUser}`, JSON.stringify(updatedTodos))
    }
  }

  if (isLoggedIn) {
    return (
      <div className="container mx-auto p-4 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Todo List</h1>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
        <form onSubmit={addTodo} className="mb-4">
          <div className="flex">
            <Input
              type="text"
              name="todo"
              placeholder="Add a new todo"
              className="flex-grow mr-2"
            />
            <Button type="submit">Add</Button>
          </div>
        </form>
        <ul className="space-y-2">
          {todos.map(todo => (
            <li key={todo.id} className="flex items-center justify-between bg-white p-3 rounded shadow">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="mr-2"
                />
                <span className={todo.completed ? "line-through" : ""}>{todo.text}</span>
              </div>
              <Button variant="destructive" size="sm" onClick={() => deleteTodo(todo.id)}>Delete</Button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Login or register to manage your todos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="login-username">Username</Label>
                    <Input
                      id="login-username"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                {loginError && (
                  <Alert variant="destructive" className="mt-4">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full mt-4">Login</Button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleRegister}>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                      id="register-username"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Choose a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full mt-4">Register</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}