describe('Blog app', function() {
  beforeEach(function() {
    cy.request('POST', 'http://localhost:3003/api/testing/reset')
    const user = {
      name: 'joni häkkänen',
      username: 'joni',
      password: 'keppana'
    }
    cy.request('POST', 'http://localhost:3003/api/users/', user)
    cy.visit('http://localhost:3003')
  })
  it('login form is shown', function() {
    cy.contains('username')
    cy.contains('Log in to application')
  })
  describe('Login',function() {
    it('succeeds with correct credentials', function() {
      cy.get('#username').type('joni')
      cy.get('#password').type('keppana')
      cy.get('#login-button').click()
      cy.contains('logged in as: joni häkkänen')
    })

    it('fails with wrong credentials', function() {
      cy.get('#username').type('joni')
      cy.get('#password').type('väärä')
      cy.get('#login-button').click()
      cy.contains('wrong username or password')
    })
  })
  describe('When logged in', function() {
    it('A blog can be created liked and deleted', function() {
      cy.login({ username: 'joni', password: 'keppana' })


      cy.contains('create new blog').click()
      cy.get('#titleinput').type('cypress test')
      cy.get('#authorinput').type('testuser')
      cy.get('#urlinput').type('cpress.com')
      cy.get('#createbutton').click()
      cy.contains('a new blog cypress test by testuser added')

      cy.visit('http://localhost:3003')
      cy.contains('cypress test by: testuser view')

      cy.contains('view').click()
      cy.contains('like').click()
      cy.contains('likes 1')

      cy.contains('remove').click()
      cy.visit('http://localhost:3003')
      cy.contains('cypress test by: testuser view').should('not.exist')
    })
    it('Blogs are ordered according to likes', function() {
      cy.login({ username: 'joni', password: 'keppana' })


      const blog = {
        title: 'mid likes blog',
        author: 'joni',
        url: 'test.com',
        likes: 10
      }
      cy.createBlog(blog)
      cy.createBlog({ ...blog, title: 'low likes blog', likes: 0 })
      cy.createBlog({ ...blog, title: 'high likes blog', likes: 25 })

      cy.get('.blogs').eq(0).should('contain', 'high likes blog')
      cy.get('.blogs').eq(1).should('contain', 'mid likes blog')
      cy.get('.blogs').eq(2).should('contain', 'low likes blog')
    })
  })
})