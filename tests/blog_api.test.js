const { join, set } = require('lodash')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const api = supertest(app)

const twoTestBlogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})
  let noteObject = new Blog(twoTestBlogs[0])
  await noteObject.save()
  noteObject = new Blog(twoTestBlogs[1])
  await noteObject.save()
})

describe('when there are some blogs already in database', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are two blogs', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(twoTestBlogs.length)
  })

  test('id attribute is named "id"', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
  })
})

describe('adding blogs to database', () => {

  let headers
  beforeEach(async () => {
    const user = {
      username: 'Jonii',
      name: 'joni',
      password: 'salasana'
    }
    await api
      .post('/api/users')
      .send(user)

    const loggedIn = await api
      .post('/api/login')
      .send(user)

    headers = {
      'Authorization': `bearer ${loggedIn.body.token}`
    }
  })

  test('blog can be added', async () => {

    const blog = {
      title: 'new test blog',
      author: 'Me',
      url: 'testurl.com',
      likes: 5,
    }
    await api
      .post('/api/blogs')
      .send(blog)
      .set(headers)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(twoTestBlogs.length + 1)
    expect(response.body[2].title).toContain('new test blog')
  })

  test('if likes is missing, it will default to the value 0', async () => {
    const blog = {
      title: 'new test blog',
      author: 'Me',
      url: 'testurl.com',
    }
    await api
      .post('/api/blogs')
      .send(blog)
      .set(headers)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const response = await api.get('/api/blogs')
    expect(response.body[2].likes).toBe(0)
  })

  test('if title and url are empty, status code 400', async () => {
    const blog = {
      author: 'Me',
      likes: 5
    }
    await api
      .post('/api/blogs')
      .send(blog)
      .set(headers)
      .expect(400)
  })
})

test('if token is not provided, status code 401', async () => {
  const user = {
    username: 'anothruser',
    name: 'joni',
    password: 'salasana'
  }
  await api
    .post('/api/users')
    .send(user)

  const loggedIn = await api
    .post('/api/login')
    .send(user)

  const blog = {
    title: 'new test blog',
    author: 'Me',
    likes: 5
  }
  await api
    .post('/api/blogs')
    .send(blog)
    .expect(401)
})



test('find by ID', async () => {
  await api
    .get(`/api/blogs/${twoTestBlogs[0]._id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

describe('deleting blog', () => {

  let headers
  beforeEach(async () => {
    const user = {
      username: 'Jonii',
      name: 'joni',
      password: 'salasana'
    }
    await api
      .post('/api/users')
      .send(user)

    const loggedIn = await api
      .post('/api/login')
      .send(user)

    headers = {
      'Authorization': `bearer ${loggedIn.body.token}`
    }
    const blog = {
      title: 'delete with user authentication',
      author: 'Me',
      url: 'testurl.com',
      likes: 5,
    }
    await api
      .post('/api/blogs')
      .send(blog)
      .set(headers)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  })
  test('succesfull delete with token', async () => {

    const blogs = await api.get('/api/blogs')

    await api
      .delete(`/api/blogs/${blogs.body[2].id}`)
      .set(headers)
      .expect(204)
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(twoTestBlogs.length)
    expect(response.body[0].title).not.toContain(blogs.body[2].title)
  })
  test('fail delete with wrong token', async () => {

    const user = {
      username: 'anothruser',
      name: 'joni',
      password: 'salasana'
    }
    await api
      .post('/api/users')
      .send(user)

    const loggedIn = await api
      .post('/api/login')
      .send(user)

    headers = {
      'Authorization': `bearer ${loggedIn.body.token}`
    }

    const blogs = await api.get('/api/blogs')

    await api
      .delete(`/api/blogs/${blogs.body[2].id}`)
      .set(headers)
      .expect(401)
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(twoTestBlogs.length + 1)
    expect(response.body[2].title).toContain(blogs.body[2].title)
  })
})

afterAll(() => {

  mongoose.connection.close()
})