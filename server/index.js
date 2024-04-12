// ticketing/server/index.js
// Server-side API for interacting with databases
// Created 4/11/2024
// Last updated 4/11/2024

import express from 'express'
import bodyParser from 'body-parser'
import * as databaseQueries from './databaseQueries.js'

const app = express()
const port = 9000
app.use(bodyParser.json())

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
  const { userid, status } = req.query

  databaseQueries.getTicketsByUserId(userid).then(tickets => {
    if (status) {
      const statusTickets = tickets.filter(ticket =>
        ticket.status.toUpperCase() == status.toUpperCase())
        console.log(`User ${userid} has ${tickets.length} ${status} tickets`)
        res.send(statusTickets)
    } else {
      console.log(`User ${userid} has ${tickets.length} tickets`)
      res.send(tickets)
      }
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

app.get('/ticket/:ticketId', (req, res) => {
  const { ticketId } = req.params
  databaseQueries.getTicketWithDetails(ticketId).then(ticket => {
    console.log(ticket)
    res.send(ticket)
  })
})

app.get('/comments/latest', (req, res) => {
  const { status } = req.query

  databaseQueries.getLatestCommentsWithTicketData().then(comments => {
    res.send(comments)
  }).catch(err => {
    res.send(err)
  })
})

app.post('/comment/:id/update', (req, res) => {
  const { id } = req.params
  const { comment_content } = req.body

  // { "comment_id": 1, "comment_content": "Updated comment" }
  // "Content-Type: application/json"
  
  console.log(`Updating comment_id: ${id} with message: ${comment_content}`)
  databaseQueries.updateComment(1, comment_content).then(message => res.send(message)).catch(err => console.error("Error updating comment:", err));
})

app.listen(port, () => {
  console.log(`Ticketing API server running on port ${port}`)
})