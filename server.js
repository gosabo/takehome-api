const express = require('express')
const fs = require('fs')
const path = require('path')
const rateLimit = require('express-rate-limit')

const app = express()
const PORT = process.env.PORT || 8000

let listings = []

// Load listings from JSON file
fs.readFile(path.join(__dirname, 'listings.json'), 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading JSON file:', err)
    return
  }
  listings = JSON.parse(data)
})

// Apply rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
})

app.use(limiter)

app.get('/listings', (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const searchQuery = req.query.search || ''
  const sortBy = req.query.sortBy || 'price'
  const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc'
  const filterByActivity = req.query.activity
    ? req.query.activity.split(',')
    : ['fishing', 'hunting', 'camping']

  // Filter listings based on the search query
  let filteredListings = listings.filter(
    (listing) =>
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location.state
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      listing.location.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filter listings by activity if specified
  if (filterByActivity) {
    filteredListings = filteredListings.filter((listing) => {
      return filterByActivity.includes(listing.activity.toLowerCase())
    })
  }

  // Sort listings based on the specified criteria
  filteredListings.sort((a, b) => {
    if (sortBy === 'price' || sortBy === 'rating') {
      const valueA = a[sortBy]
      const valueB = b[sortBy]
      return sortOrder === 'desc' ? valueB - valueA : valueA - valueB
    }
    return 0
  })

  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit

  const results = filteredListings.slice(startIndex, endIndex)

  res.json({
    page,
    limit,
    totalListings: filteredListings.length,
    totalPages: Math.ceil(filteredListings.length / limit),
    results,
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
