// Import the Express.js module
import express from 'express';
import * as databaseQueries from './databaseQueries.js'
// Create a new Router instance
const router = express.Router();

router.get('/', (req, res) => {
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
  
  router.get('/tickets', (req, res) => {
    // GET /tickets
    databaseQueries.getAllTickets().then(tickets => res.send(tickets))
  })
  
  router.get('/tickets/open', (req, res) => {
    // GET /tickets/open
    databaseQueries.getOpenTickets().then(tickets => {
      console.log(`${tickets.length} tickets are open`)
      res.send(tickets)
      }
    ).catch(err => {
      console.log(err)
      res.send(err)
    })
  })
  
  router.get('/tickets/closed', (req, res) => {
    // GET /tickets/closed
    databaseQueries.getClosedTickets().then(tickets => {
      console.log(`${tickets.length} tickets are closed`)
      res.send(tickets)
      }
    ).catch(err => {
      console.log(err)
      res.send(err)
    })
  })
  
  router.get('/tickets/byuser/:id', (req, res) => {
    // GET /tickets/byuser?userid=1
    // const { userid, status } = req.query
    const { id } = req.params
    databaseQueries.getTicketsByUserId(id).then(tickets => {
        console.log(`User ${id} has ${tickets.length} tickets`)
        res.send(tickets)
      }
    ).catch(err => {
      console.log(err)
      res.send(err)
    })
  })

  router.get('/tickets/byuser/:id/:status', (req, res) => {
    const { id, status } = req.params
  
    databaseQueries.getTicketsByUserId(id).then(tickets => {
      if (status) {
        const statusTickets = tickets.filter(ticket =>
          ticket.status.toUpperCase() == status.toUpperCase())
          console.log(`User ${id} has ${tickets.length} ${status} tickets`)
          res.send(statusTickets)
      } else {
        console.log(`User ${id} has ${tickets.length} tickets`)
        res.send(tickets)
        }
      }
    ).catch(err => {
      console.log(err)
      res.send(err)
    })
  })
  
  router.get('/tickets/byseverity', (req, res) => {
    // GET /tickets/byseverity?severity=1
    const { severity, status } = req.query
  
    databaseQueries.getTicketsBySeverity(severity).then(tickets => {
  
      if (status) {
        const statusTickets = tickets.filter(ticket =>
          ticket.status.toUpperCase() == status.toUpperCase())
        res.send(statusTickets)
      } else {
        console.log(`${tickets.length} tickets are considered ${severity}`)
        res.send(tickets)
      }
    }).catch(err => {
      console.log(err)
      res.send(err)
    })
  })
  
  router.get('/tickets/:ticketId', (req, res) => {
    const { ticketId } = req.params
    databaseQueries.getTicketWithDetails(ticketId).then(ticket => {
      console.log(ticket)
      res.send(ticket)
    }).catch(err => {
      console.log(err)
      res.send(err)
    })
  })

  router.get('/tickets/:ticketId/comments', (req, res) => {
    const { ticketId } = req.params
    databaseQueries.getCommentsByTicketId(ticketId).then(comments => {
      console.log(comments)
      res.send(comments)
    }).catch(err => {
      console.log(err)
      res.send(err)
    })
  })
  
  router.get('/comments/latest', (req, res) => {
    const { status } = req.query
  
    databaseQueries.getLatestCommentsWithTicketData().then(comments => {
      res.send(comments)
    }).catch(err => {
      res.send(err)
    })
  })

  router.get('/comments/:commentId', (req, res) => {
    const { commentId } = req.params

    databaseQueries.getCommentById(commentId).then(comment => {
      console.log(comment)
      res.send(comment)
    }).catch(err => {
      console.log(err)
      res.send(err)
    })
  })

  router.post('/comments/:id/update', (req, res) => {
    const { id } = req.params
    const { comment_content } = req.body
    
    console.log(`Updating comment_id: ${id} with message: ${comment_content}`)
    databaseQueries.updateComment(1, comment_content).then(message => {
      res.send(message)
    }).catch(err => {
      console.error("Error updating comment:", err)
    });
  })
  
  router.get('/users/:id', (req, res) => {
    const { id } = req.params
    console.log(id)
    databaseQueries.getUserById(id).then(user => {
      res.send(user)
    }).catch(err => {
      console.log(err)
      res.send(err)
    })
  })

  router.post('/users/:id/update', (req, res) => {
    const { id } = req.params
    const { user_name, user_email } = req.body

    console.log(req.body)
    databaseQueries.updateUserById(id, { name: user_name, email: user_email }).then(message => {
      res.send(message)
    }).catch(err => {
      console.err("Error updating user:", err)
    });
  })

  router.get('/users/:id/comments/:count', (req, res) => {
    const { id, count } = req.params

    if (!count) {
      count = 10
    }

    databaseQueries.getLastCommentsByUserId(id, count).then(comments => {
      console.log(comments)
      res.send(comments)
    }).catch(err => {
      console.log(err)
      res.send(err)
    })
  })

  router.get('/users/:id/comments', (req, res) => {
    const { id } = req.params
    const count = 10

    databaseQueries.getLastCommentsByUserId(id, count).then(comments => {
      console.log(comments)
      res.send(comments)
    }).catch(err => {
      console.log(err)
      res.send(err)
    })
  })

  router.get('/tasks', (req, res) => {
    databaseQueries.getAllTasks().then(tasks => {
      console.log(tasks)
      res.send(tasks)
    }).catch(err => {
      console.log(err)
      res.send(err)
    })
  })

// Export the router
export default router;