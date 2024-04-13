// ticketing/server/databaseQueries.js
// Server-side API for interacting with databases
// Created 4/11/2024
// Last updated 4/12/2024

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
// getLatestCommentsWithTicketData().then(comments => console.log("Latest comments with associated ticket data:", comments)).catch(err => console.error("Error retrieving latest comments:", err));
// getLatestComments().then(comments => console.log("Latest comments:", comments)).catch(err => console.error("Error retrieving latest comments:", err));
// updateComment(1, "Updated comment text").then(message => console.log(message)).catch(err => console.error("Error updating comment:", err));
// updateUserNameAndEmail(1, "New Name", "newemail@example.com").then(message => console.log(message)).catch(err => console.error("Error updating user name and email:", err));
// getUserById(1).then(user => console.log("User information:", user)).catch(err => console.error("Error retrieving user information:", err));

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

const db = new sqlite3.Database(dbFilePath);

// Function to retrieve all tickets as JSON
export const getAllTickets = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM tickets", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }

        });
    });
};

// Function to retrieve all tickets of a given user_id as JSON
export const getTicketsByUserId = (userId) => {
    return new Promise((resolve, reject) => {

        db.all("SELECT * FROM tickets WHERE user_id = ?", [userId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Function to retrieve all closed tickets as JSON
export const getClosedTickets = () => {
    return new Promise((resolve, reject) => {

        db.all("SELECT * FROM tickets WHERE status = 'Closed'", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Function to retrieve all open tickets as JSON
export const getOpenTickets = () => {
    return new Promise((resolve, reject) => {

        db.all("SELECT * FROM tickets WHERE status = 'Open'", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Function to retrieve tickets by severity
export const getTicketsBySeverity = (severity) => {
    const Severity = ['LOW', 'MEDIUM', 'HIGH', 'SEVERE'];

    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM tickets WHERE priority = ?", Severity[severity], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Function to retrieve tickets created in the last 7 days
export const getTicketsCreatedLast7Days = () => {
    return new Promise((resolve, reject) => {

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        db.all("SELECT * FROM tickets WHERE creation_date > ?", [sevenDaysAgo], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Function to retrieve tickets created more than 7 days ago
export const getTicketsCreatedMoreThan7DaysAgo = () => {
    return new Promise((resolve, reject) => {

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        db.all("SELECT * FROM tickets WHERE creation_date <= ?", [sevenDaysAgo], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Function to retrieve tickets searchable by a string on either title or description
export const searchTickets = (searchString) => {
    return new Promise((resolve, reject) => {

        const query = "SELECT * FROM tickets WHERE title LIKE ? OR description LIKE ?";
        const searchParam = `%${searchString}%`;
        db.all(query, [searchParam, searchParam], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Function to change a ticket to closed status
export const changeTicketToClosed = (ticketId) => {
    return new Promise((resolve, reject) => {


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
    });
};

// Function to close a task
export const closeTask = (taskId, closureDate) => {
    return new Promise((resolve, reject) => {


        // Update the task status to 'closed' and set the closure date
        db.run("UPDATE tasks SET status = 'closed', closure_date = ? WHERE id = ?", [closureDate, taskId], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(`Task ${taskId} successfully closed.`);
            }
        });
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
    });
};

// Function to get JSON for a ticket including up to the first 5 tasks and comments
export const getTicketWithDetails = (ticketId) => {
    return new Promise((resolve, reject) => {


        // Fetch ticket details
        db.get("SELECT * FROM tickets WHERE id = ?", [ticketId], (err, ticket) => {
            if (err) {
                reject(err);
                return;
            }

            if (!ticket) {
                reject(`Ticket with ID ${ticketId} not found.`);
                return;
            }

            // Fetch up to the first 5 tasks associated with the ticket
            db.all("SELECT * FROM tasks WHERE ticket_id = ? LIMIT 5", [ticketId], (err, tasks) => {
                if (err) {
                    reject(err);
                    return;
                }

                // Fetch up to the first 5 comments associated with the ticket
                db.all("SELECT * FROM comments WHERE ticket_id = ? LIMIT 5", [ticketId], (err, comments) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    // Combine ticket, tasks, and comments into a single JSON object
                    const ticketWithDetails = {
                        ticket: ticket,
                        tasks: tasks,
                        comments: comments
                    };

                    resolve(ticketWithDetails);
                });
            });
        });
    });
};

// Function to get the latest comments with associated ticket data
export const getLatestCommentsWithTicketData = () => {
    return new Promise((resolve, reject) => {


        // Query to retrieve the latest comments with associated ticket data
        db.all("SELECT c.*, t.title AS ticket_title, t.description AS ticket_description, t.status AS ticket_status, t.priority AS ticket_priority, t.creation_date AS ticket_creation_date, u.name AS assigned_to FROM comments c INNER JOIN tickets t ON c.ticket_id = t.id INNER JOIN users u ON t.user_id = u.id ORDER BY c.creation_date DESC LIMIT 10", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

export const getLatestComments = () => {
    return new Promise((resolve, reject) => {


        // Query to retrieve the latest comments by timestamp
        db.all("SELECT * FROM comments ORDER BY creation_date DESC LIMIT 10", (err, rows) => {
            console.log(err, rows)
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Function to update a comment
export const updateComment = (commentId, updatedComment) => {
    return new Promise((resolve, reject) => {


        // Update the comment in the database
        const stmt = db.prepare(`UPDATE comments SET comment = ?, creation_date = CURRENT_TIMESTAMP WHERE id = ?`);
        stmt.run(updatedComment, commentId, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(`Comment with ID ${commentId} updated successfully.`);
            }
        });
        stmt.finalize();
    });
};

// Function to update a user's email and name
const updateUserNameAndEmail = (userId, newName, newEmail) => {
    return new Promise((resolve, reject) => {

        // Update the user's email and name in the database
        const stmt = db.prepare(`UPDATE users SET name = ?, email = ? WHERE id = ?`);
        stmt.run(newName, newEmail, userId, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(`Name and email for user with ID ${userId} updated successfully.`);
            }
        });
        stmt.finalize();
    });
};

export const getUserById = (userId) => {
    return new Promise((resolve, reject) => {

        // Execute SQL query to select user by ID
        db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row); // Resolve with user information
            }
        });
    });
};

// Function to update a user's information by ID
export const updateUserById = (userId, newData) => {
    return new Promise((resolve, reject) => {

        // Execute SQL query to update user information
        db.run(`UPDATE users SET name = ?, email = ? WHERE id = ?`, [newData.name, newData.email, userId], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(`User with ID ${userId} updated successfully.`);
            }
        });
    });
};

// Function to retrieve a comment by comment ID
export const getCommentById = (commentId) => {
    return new Promise((resolve, reject) => {

        // Execute SQL query to select comment by ID
        db.get("SELECT * FROM comments WHERE id = ?", [commentId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                if (row) {
                    resolve(row); // Resolve with comment information
                } else {
                    resolve(null); // Comment not found
                }
            }
        });
    });
};

// Function to fetch comments by ticket ID
export const getCommentsByTicketId = (ticketId) => {
    return new Promise((resolve, reject) => {

        // Execute SQL query to select comments by ticket ID
        db.all("SELECT * FROM comments WHERE ticket_id = ?", [ticketId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows); // Resolve with array of comment information
            }
        });
    });
};

// Function to fetch last 20 comments by user ID
export const getLastCommentsByUserId = (userId, count) => {
    return new Promise((resolve, reject) => {

        // Execute SQL query to select last 20 comments by user ID
        db.all("SELECT * FROM comments WHERE user_id = ? ORDER BY creation_date DESC LIMIT ?", [userId, count], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows); // Resolve with array of comment information
            }
        });
    });
};

// Function to retrieve all tickets as JSON
export const getAllTasks = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM tasks", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};