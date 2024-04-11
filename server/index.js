// ticketing/server/index.js
// Server-side API for interacting with databases
// Created 4/11/2024
// Last updated 4/11/2024

const express = require('express')
const app = express()
const ticketdata = require('./sample.json')
const port = 3000


app.get('/', (req, res) => {
  res.sendStatus(200)
})

app.get('/tickets', (req, res) => {
    res.send(ticketdata)
})

app.listen(port, () => {
  console.log(`Ticketing API server running on port ${port}`)
})