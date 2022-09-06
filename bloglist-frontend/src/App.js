/* eslint-disable react/react-in-jsx-scope */
import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import LoginForm from './components/LoginForm'
import loginService from './services/login'
import CreateBlog from './components/CreateBlog'
import Notification from './components/Notification'
import Togglable from './components/Togglable'



const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [messageText, setMessageText] = useState(null)
  const blogFormRef = useRef()

  const sort = (blogList) => {
    const sortedByLikes = [...blogList].sort((a, b) => b.likes - a.likes)
    setBlogs( sortedByLikes )
  }

  useEffect(() => {
    blogService.getAll().then(blogs => sort(blogs)
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    console.log('logging in with', username, password)

    try {
      const user = await loginService.login({
        username, password,
      })
      window.localStorage.setItem(
        'loggedUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      msgText('wrong username or password', 'error')
    }
  }
  const handleLogout = (event) => {
    event.preventDefault()
    window.localStorage.removeItem('loggedUser')
    setUser(null)
  }

  const msgText = (message, type='success') => {
    setMessageText({ message, type })
    setTimeout(() => {
      setMessageText(null)
    }, 3600)
  }

  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>
        <Notification message={messageText}/>
        <div>
          <LoginForm onSubmit={handleLogin} username={username} password={password}
            setUsername={setUsername} setPassword={setPassword} user={user} />
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2>blogs</h2>
      <Notification message={messageText}/>
      <div>
        <p>logged in as: {user.name} <button onClick={handleLogout}> logout</button></p>
      </div>
      <div>
        <Togglable buttonLabel='create new blog' ref={blogFormRef}>
          <CreateBlog user={user} msgText={msgText} blogFormRef={blogFormRef}/>
        </Togglable>
      </div>
      {blogs.map(blog =>
        <Blog key={blog.id} blog={blog} user={user} />
      )}
    </div>
  )
}

export default App
