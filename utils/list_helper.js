const blog = require('../models/blog')
var _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const result = blogs.reduce(
    (accumulator, blogs) => accumulator + blogs.likes, 0
  )
  return result
}

const favouriteBlog = (blogs) => {
  if (Object.keys(blogs).length > 0) {
    const result = blogs.reduce((prev, current) => (prev.likes > current.likes) ? prev : current)
    delete result.url, delete result.__v, delete result._id
    return result
  } else return blogs
}

const mostBlogs = (blogs) => {
  if (Object.keys(blogs).length > 0) {
    const mostFrequent = _.maxBy(Object.values(_.groupBy(blogs,
      element => element.author)), arr => arr.length)[0]

    var amountOfBlogs = blogs.filter(obj =>
      obj.author === mostFrequent.author)

    return {
      author: mostFrequent.author,
      blogs: amountOfBlogs.length
    }
  } else return blogs
}

const mostLikes = (blogs) => {
  if (Object.keys(blogs).length > 0) {
    const groupedList = _(blogs).groupBy('author')

    const totalLikes = groupedList.map((objs, key) => ({
      'author': key,
      'likes': _.sumBy(objs, 'likes') }))
      .value()

    totalLikes.sort((a, b) => {
      return b.likes - a.likes
    })

    return totalLikes[0]
  } else return blogs
}

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog,
  mostBlogs,
  mostLikes
}