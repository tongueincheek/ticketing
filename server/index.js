// ticketing/server/index.js
// Server-side API for interacting with databases
// Created 4/11/2024
// Last updated 4/11/2024

import express from 'express'
const app = express()
const port = 9000
import * as databaseQueries from './databaseQueries.js'

app.get('/', (req, res) => {
  res.send(`
    <div>
      <p>Welcome to ticketing API</p>
      <p>GET /tickets</p>
      <p>GET /tickets/open</p>
      <p>GET /tickets/closed</p>
      <p>GET /tickets/byuser?userid=1</p>
      <p>GET /tickets/byseverity?severity=1</p>
    </div>
    `)
})

app.get('/tickets', (req, res) => {
  // GET /tickets
  databaseQueries.getAllTickets().then(tickets => res.send(tickets))
})

app.get('/tickets/open', (req, res) => {
  // GET /tickets/open
  databaseQueries.getOpenTickets().then(tickets => {
    console.log(`${tickets.length} tickets are open`)
    res.send(tickets)
    }
  )
})

app.get('/tickets/closed', (req, res) => {
  // GET /tickets/closed
  databaseQueries.getClosedTickets().then(tickets => {
    console.log(`${tickets.length} tickets are closed`)
    res.send(tickets)
    }
  )
})

app.get('/tickets/byuser', (req, res) => {
  // GET /tickets/byuser?userid=1
  const { userid } = req.query
  databaseQueries.getTicketsByUserId(userid).then(tickets => {
    console.log(`User ${userid} has ${tickets.length} tickets`)
    res.send(tickets)
    }
  )
})

app.get('/tickets/byseverity', (req, res) => {
  // GET /tickets/byseverity?severity=1
  const { severity } = req.query
  databaseQueries.getTicketsBySeverity(severity).then(tickets => {
      console.log(`${tickets.length} tickets are considered ${severity}`)
      res.send(tickets)
    }
  )
})

app.listen(port, () => {
  console.log(`Ticketing API server running on port ${port}`)
})