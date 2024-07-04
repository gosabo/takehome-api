const express = require('express')
const listings = require('./listings')
const app = express()
const port = 8000

app.get('/listings', (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit

  const results = listings.slice(startIndex, endIndex)

  res.json({
    page,
    limit,
    totalListings: listings.length,
    totalPages: Math.ceil(listings.length / limit),
    results,
  })
})

app.listen(port, () => {
  console.log(`Listening on ${port}`)
})
