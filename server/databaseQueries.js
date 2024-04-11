// Example usage:
// getAllTickets().then(tickets => console.log(JSON.stringify(tickets))).catch(err => console.error(err));
// getTicketsByUserId(1).then(tickets => console.log(JSON.stringify(tickets))).catch(err => console.error(err));
// getClosedTickets().then(tickets => console.log(JSON.stringify(tickets))).catch(err => console.error(err));
// getOpenTickets().then(tickets => console.log(JSON.stringify(tickets))).catch(err => console.error(err));
// getTicketsBySeverity('HIGH').then(tickets => console.log(JSON.stringify(tickets))).catch(err => console.error(err));
// getTicketsCreatedLast7Days().then(tickets => console.log(JSON.stringify(tickets))).catch(err => console.error(err));
// getTicketsCreatedMoreThan7DaysAgo().then(tickets => console.log(JSON.stringify(tickets))).catch(err => console.error(err));
// searchTickets('error').then(tickets => console.log(JSON.stringify(tickets))).catch(err => console.error(err));

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
const getAllTickets = () => {
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
const getTicketsByUserId = (userId) => {
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
const getClosedTickets = () => {
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
const getOpenTickets = () => {
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
const getTicketsBySeverity = (severity) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('database.db');
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
const getTicketsCreatedLast7Days = () => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('database.db');
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
const getTicketsCreatedMoreThan7DaysAgo = () => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('database.db');
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
const searchTickets = (searchString) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('database.db');
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


export { getAllTickets, getTicketsByUserId, getClosedTickets, getOpenTickets, getTicketsBySeverity, getTicketsCreatedLast7Days, getTicketsCreatedMoreThan7DaysAgo, searchTickets  }