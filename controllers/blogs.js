const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')





const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, id: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const note = await Blog.findById(request.params.id)
  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {

  const user = request.user

  const blogToDelete = await Blog.findById(request.params.id)

  if (blogToDelete.user.toString() !== user.id.toString()) {
    return response.status(401).json({ error: 'No permission to remove blog' })
  }
  if (blogToDelete.user.toString() === user.id.toString()) {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  }
})

blogsRouter.post('/',  middleware.userExtractor, async (request, response) => {
  const body = request.body

  const user = request.user

  if (!body.title && !body.url) {
    return response.status(400).json({
      error: 'tittle and url missing'
    })
  } else {
    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes ? body.likes : 0,
      user: user._id
    })
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(blog)
  }
})

blogsRouter.put('/:id',  middleware.userExtractor, async (request, response) => {
  const body = request.body

  const blog = {
    ...body,
    user: body.user.id
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog,
    { new: true })
  response.json(updatedBlog)
})


module.exports = blogsRouter