// ticketing/server/index.js
// Server-side API for interacting with databases
// Created 4/11/2024
// Last updated 4/11/2024

import express from 'express'
const app = express()
import ticketData from './sample.json' assert { type: "json" };
const port = 3000
import {  getAllTickets, getTicketsByUserId, getClosedTickets, getOpenTickets, getTicketsBySeverity, getTicketsCreatedLast7Days, getTicketsCreatedMoreThan7DaysAgo, searchTickets } from './databaseQueries.js'

app.get('/', (req, res) => {
  res.sendStatus(200)
})

app.get('/tickets', (req, res) => {
    // GET /tickets
    getAllTickets().then(tickets => res.send(tickets))
})

app.get('/tickets/open', (req, res) => {
    // GET /tickets/open
    getOpenTickets().then(tickets => res.send(tickets))
})

app.get('/tickets/closed', (req, res) => {
  // GET /tickets/closed
  getClosedTickets().then(tickets => res.send(tickets))
})

app.listen(port, () => {
  console.log(`Ticketing API server running on port ${port}`)
})