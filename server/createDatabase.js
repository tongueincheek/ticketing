import ticketData from './tickets_data.json' assert { type: "json" };
import userData from './users_data.json' assert { type: "json" };

import sqlite3 from 'sqlite3'
import fs from 'fs'

// Specify the path to the SQLite database file
const dbFilePath = ('./database.db')

// Check if the database file exists, if not, create it
if (!fs.existsSync(dbFilePath)) {
    // Create a new SQLite database connection
    const db = new sqlite3.Database(dbFilePath)

    // Close the database connection
    db.close()
}

// Create a new SQLite database connection
// const db = new sqlite3.Database(':memory:') // You can change ':memory:' to a file path to create a persistent database
const db = new sqlite3.Database(dbFilePath)

// Create tables for tickets and users
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name TEXT,
        email TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY,
        user_id INTEGER,
        requestor_id INTEGER,
        title TEXT,
        description TEXT,
        status TEXT,
        priority TEXT,
        creation_date TEXT,
        closure_date TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(requestor_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY,
        user_id INTEGER,
        requestor_id INTEGER,
        ticket_id INTEGER,
        description TEXT,
        status TEXT,
        creation_date TEXT,
        due_date TEXT,
        closure_date TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(requestor_id) REFERENCES users(id),
        FOREIGN KEY(ticket_id) REFERENCES tickets(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY,
        ticket_id INTEGER,
        user_id INTEGER,
        comment TEXT,
        creation_date TEXT,
        FOREIGN KEY(ticket_id) REFERENCES tickets(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Insert users from the JSON array into the users table
    const insertUserStmt = db.prepare(`INSERT INTO users (name, email) VALUES (?, ?)`);
    userData.forEach(user => {
        insertUserStmt.run(user.name, `${user.name}@example.com`);
    });
    insertUserStmt.finalize();

    // Insert tickets from the JSON array into the tickets table
    const insertTicketStmt = db.prepare(`INSERT INTO tickets (user_id, requestor_id, title, description, status, priority, creation_date, closure_date)
                                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    // Insert tasks from the JSON array into the tasks table
    const insertTaskStmt = db.prepare(`INSERT INTO tasks (user_id, requestor_id, ticket_id, description, status, creation_date, due_date, closure_date)
                                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    // Insert comments from the JSON array into the comments table
    const insertCommentStmt = db.prepare(`INSERT INTO comments (ticket_id, user_id, comment, creation_date)
                                         VALUES (?, ?, ?, ?)`);

    ticketData.forEach(ticket => {
        // Find the corresponding user_id for the ticket based on the assigned user ID
        const assignedUserId = ticket.assigned_to;
        const user = userData.find(user => user.id === assignedUserId);
        if (user) {
            insertTicketStmt.run(user.id, ticket.requestor, ticket.title, ticket.description, ticket.status, ticket.priority, ticket.creation_date, ticket.closure_date);
            // Check if the ticket has tasks
            if (ticket.tasks && ticket.tasks.length > 0) {
                ticket.tasks.forEach(task => {
                    // Insert task associated with the current ticket
                    insertTaskStmt.run(user.id, /* task.requestor */ 1, ticket.id, task.description, task.status, task.creation_date, task.due_date, task.closure_date);
                });
            }
            if (ticket.comments && ticket.comments.length >0) {
                ticket.comments.forEach(comment => {
                    // Insert comment associated with the current ticket
                    insertCommentStmt.run(ticket.id, user.id, comment.content, comment.datetime);
                })
            }
        } else {
            console.error(`User not found for ticket: ${ticket.title}`);
        }
    });
    insertTicketStmt.finalize();
    insertTaskStmt.finalize();
    insertCommentStmt.finalize();

    // Retrieve and log all tickets from the database
    db.all("SELECT * FROM tickets", (err, rows) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log(JSON.stringify(rows, null, 2)); // Convert the retrieved rows to JSON and log
        }
    });
    
    // Retrieve and log all tasks from the database
    db.all("SELECT * FROM tasks", (err, rows) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log("Tasks:");
            console.log(rows);
        }
    });

    // Retrieve and log all comments from the database
    db.all("SELECT * FROM comments", (err, rows) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log("Comments:");
            console.log(rows);
        }
    });
});

// Close the database connection
db.close();