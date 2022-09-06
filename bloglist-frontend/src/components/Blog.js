import React, { useState, useEffect } from 'react'
import blogService from '../services/blogs'

const Blog = ({ blog, user }) => {

  const [visible, setVisible] = useState(false)
  const [likes, setLikes] = useState(blog.likes)
  const [isSameUser, setSameUser] = useState(false)


  const hideWhenVisible = { display: visible ? 'none' : '' }
  const showWhenVisible = { display: visible ? '' : 'none' }

  const showDeleteButton = { display: isSameUser ? '' : 'none' }

  useEffect(() => {
    if (blog.user && blog.user.username === user.username) {
      setSameUser(true)
    }
  }, [])

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }
  const handleClick = () => {
    setVisible(!visible)
  }

  const handleLikes = async (event) => {
    event.preventDefault()
    const newBlog = {
      ...blog,
      likes: likes + 1
    }
    const response = await blogService.update(newBlog)
    setLikes(response.likes)
  }

  const handleDelete = async (event) => {
    event.preventDefault()
    if (window.confirm(`delete blog ${blog.title} ?`)) {
      const response = await blogService.remove(blog.id)
      console.log(response)
    }}

  return (
    <div className='blogs' style={blogStyle}>
      <div style={hideWhenVisible}>
        {blog.title} by: {blog.author} <button onClick={handleClick}> view </button>
      </div>
      <div style={showWhenVisible}>
        {blog.title} <button onClick={handleClick}> hide </button>
        <div>{blog.url}</div>
        <div>likes {likes} <button onClick={handleLikes} placeholder='likebutton'> like </button></div>
        <div>{blog.author}</div>
        <div style={showDeleteButton }><button onClick={handleDelete}> remove </button></div>
      </div>
    </div>
  )}

export default Blog