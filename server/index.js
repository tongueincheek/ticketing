// ticketing/server/index.js
// Server-side API for interacting with databases
// Created 4/11/2024
// Last updated 4/11/2024

import express from 'express'
const app = express()
const port = 3000
import * as databaseQueries from './databaseQueries.js'

app.get('/', (req, res) => {
  res.sendStatus(200)
})

app.get('/tickets', (req, res) => {
    // GET /tickets
    databaseQueries.getAllTickets().then(tickets => res.send(tickets))
})

app.get('/tickets/open', (req, res) => {
    // GET /tickets/open
    databaseQueries.getOpenTickets().then(tickets => res.send(tickets))
})

app.get('/tickets/closed', (req, res) => {
  // GET /tickets/closed
  databaseQueries.getClosedTickets().then(tickets => res.send(tickets))
})

app.get('/tickets/byuser', (req, res) => {
  // GET /tickets/byuser?userid=1
  const { userid } = req.query
  databaseQueries.getTicketsByUserId(userid).then(tickets => res.send(tickets))
})

app.get('/tickets/byseverity', (req, res) => {
  // GET /tickets/byseverity?severity=1
  const { severity } = req.query
  databaseQueries.getTicketsBySeverity(severity).then(tickets => res.send(tickets))
})

app.listen(port, () => {
  console.log(`Ticketing API server running on port ${port}`)
})