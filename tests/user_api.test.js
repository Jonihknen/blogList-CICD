const bcrypt = require('bcrypt')
const User = require('../models/user')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)


describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await api.get('/api/users')
    const newUser = {
      username: 'JoniXD',
      name: 'Joni',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/users')
    expect(response.body).toHaveLength(usersAtStart.body.length + 1)

    const usernames = response.body.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })
})
describe('Username and password validations', () => {

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await api.get('/api/users')

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username must be unique')

    const usersAtEnd = await api.get('/api/users')
    expect(usersAtEnd.body).toEqual(usersAtStart.body)
  })
  test('creation fails with proper statuscode and message if username is missing', async () => {
    const usersAtStart = await api.get('/api/users')

    const newUser = {
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('missing username or password')

    const usersAtEnd = await api.get('/api/users')
    expect(usersAtEnd.body).toEqual(usersAtStart.body)
  })
  test('creation fails with proper statuscode and message if password is missing', async () => {
    const usersAtStart = await api.get('/api/users')

    const newUser = {
      username: 'testuser',
      name: 'Superuser',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('missing username or password')

    const usersAtEnd = await api.get('/api/users')
    expect(usersAtEnd.body).toEqual(usersAtStart.body)
  })
  test('creation fails with proper statuscode and message if username is too short', async () => {
    const usersAtStart = await api.get('/api/users')

    const newUser = {
      username: 'xx',
      name: 'Superuser',
      password: 'salasana'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username must be atleast 3 characters')

    const usersAtEnd = await api.get('/api/users')
    expect(usersAtEnd.body).toEqual(usersAtStart.body)
  })
  test('creation fails with proper statuscode and message if password is too short', async () => {
    const usersAtStart = await api.get('/api/users')

    const newUser = {
      username: 'uuser',
      name: 'Superuser',
      password: 'pw'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('password must be atleast 3 characters')

    const usersAtEnd = await api.get('/api/users')
    expect(usersAtEnd.body).toEqual(usersAtStart.body)
  })
})

afterAll(() => {
  mongoose.connection.close()
})