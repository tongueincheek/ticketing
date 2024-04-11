// ticketing/server/databaseQueries.js
// Server-side API for interacting with databases
// Created 4/11/2024
// Last updated 4/11/2024

// Example usage:
// getAllTickets().then(tickets => console.log(JSON.stringify(tickets))).catch(err => console.error(err));
// getTicketsByUserId(1).then(tickets => console.log(JSON.stringify(tickets))).catch(err => console.error(err));
// getClosedTickets().then(tickets => console.log(JSON.stringify(tickets))).catch(err => console.error(err));
// getOpenTickets().then(tickets => console.log(JSON.stringify(tickets))).catch(err => console.error(err));
// getTicketsBySeverity('HIGH').then(tickets => console.log(JSON.stringify(tickets))).catch(err => console.error(err));
// getTicketsCreatedLast7Days().then(tickets => console.log(JSON.stringify(tickets))).catch(err => console.error(err));
// getTicketsCreatedMoreThan7DaysAgo().then(tickets => console.log(JSON.stringify(tickets))).catch(err => console.error(err));
// searchTickets('error').then(tickets => console.log(JSON.stringify(tickets))).catch(err => console.error(err));
// changeTicketToClosed(ticketId).then(message => console.log(message)).catch(err => console.error(err));
// closeTask(123, '2024-04-13T12:00:00Z').then(message => console.log(message)).catch(err => console.error(err));
// createTask(newTaskData).then(message => console.log(message)).catch(err => console.error(err));
// createTicket(newTicketData).then(message => console.log(message)).catch(err => console.error(err));

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

// Function to retrieve all tickets as JSON
export const getAllTickets = () => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbFilePath);
        db.all("SELECT * FROM tickets", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
            db.close();
        });
    });
};

// Function to retrieve all tickets of a given user_id as JSON
export const getTicketsByUserId = (userId) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbFilePath);
        db.all("SELECT * FROM tickets WHERE user_id = ?", [userId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
            db.close();
        });
    });
};

// Function to retrieve all closed tickets as JSON
export const getClosedTickets = () => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbFilePath);
        db.all("SELECT * FROM tickets WHERE status = 'Closed'", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
            db.close();
        });
    });
};

// Function to retrieve all open tickets as JSON
export const getOpenTickets = () => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbFilePath);
        db.all("SELECT * FROM tickets WHERE status = 'Open'", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
            db.close();
        });
    });
};

// Function to retrieve tickets by severity
export const getTicketsBySeverity = (severity) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbFilePath);
        db.all("SELECT * FROM tickets WHERE priority = ?", [severity], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
            db.close();
        });
    });
};

// Function to retrieve tickets created in the last 7 days
export const getTicketsCreatedLast7Days = () => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbFilePath);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        db.all("SELECT * FROM tickets WHERE creation_date > ?", [sevenDaysAgo], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
            db.close();
        });
    });
};

// Function to retrieve tickets created more than 7 days ago
export const getTicketsCreatedMoreThan7DaysAgo = () => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbFilePath);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        db.all("SELECT * FROM tickets WHERE creation_date <= ?", [sevenDaysAgo], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
            db.close();
        });
    });
};

// Function to retrieve tickets searchable by a string on either title or description
export const searchTickets = (searchString) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbFilePath);
        const query = "SELECT * FROM tickets WHERE title LIKE ? OR description LIKE ?";
        const searchParam = `%${searchString}%`;
        db.all(query, [searchParam, searchParam], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
            db.close();
        });
    });
};

// Function to change a ticket to closed status
export const changeTicketToClosed = (ticketId) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbFilePath);

        // Check if the ticket has comments
        db.get("SELECT COUNT(*) AS comment_count FROM comments WHERE ticket_id = ?", [ticketId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                const commentCount = row.comment_count;

                // Check if the ticket has assigned tasks
                db.get("SELECT COUNT(*) AS task_count FROM tasks WHERE ticket_id = ? AND status != 'closed'", [ticketId], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        const openTaskCount = row.task_count;

                        // If the ticket has comments and all tasks are closed, update status to 'closed'
                        if (commentCount > 0 && openTaskCount === 0) {
                            db.run("UPDATE tickets SET status = 'closed' WHERE id = ?", [ticketId], (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(`Ticket ${ticketId} successfully changed to closed status.`);
                                }
                            });
                        } else {
                            // If the ticket doesn't have comments or not all tasks are closed, reject with an error message
                            reject(`Ticket ${ticketId} cannot be closed. Ensure it has comments and all tasks are closed.`);
                        }
                    }
                });
            }
        });

        db.close();
    });
};

// Function to close a task
export const closeTask = (taskId, closureDate) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbFilePath);

        // Update the task status to 'closed' and set the closure date
        db.run("UPDATE tasks SET status = 'closed', closure_date = ? WHERE id = ?", [closureDate, taskId], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(`Task ${taskId} successfully closed.`);
            }
        });

        db.close();
    });
};

// Function to create a new task
export const createTask = (taskData) => {
    return new Promise((resolve, reject) => {
        const { ticket_id, task_id, assigned_to, title, description } = taskData;

        // Validate input data
        if (!ticket_id || !task_id || !assigned_to || !title || !description) {
            reject("Invalid task data. Please provide all required fields.");
            return;
        }

        const db = new sqlite3.Database(dbFilePath);

        // Insert new task into the database
        const stmt = db.prepare("INSERT INTO tasks (ticket_id, task_id, assigned_to, title, description, status) VALUES (?, ?, ?, ?, ?, 'open')");
        stmt.run(ticket_id, task_id, assigned_to, title, description, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(`Task ${this.lastID} successfully created.`);
            }
        });
        stmt.finalize();

        db.close();
    });
};

// Function to create a new ticket
export const createTicket = (ticketData) => {
    return new Promise((resolve, reject) => {
        const { ticket_id, assigned_to, title, description } = ticketData;

        // Validate input data
        if (!ticket_id || !assigned_to || !title || !description) {
            reject("Invalid ticket data. Please provide all required fields.");
            return;
        }

        const db = new sqlite3.Database(dbFilePath);

        // Insert new ticket into the database
        const stmt = db.prepare("INSERT INTO tickets (id, user_id, title, description, status, priority, creation_date) VALUES (?, ?, ?, ?, 'open', 'LOW', DATETIME('now'))");
        stmt.run(ticket_id, assigned_to, title, description, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(`Ticket ${this.lastID} successfully created.`);
            }
        });
        stmt.finalize();

        db.close();
    });
};