import fs from 'fs'

// Function to generate random user names
const generateRandomUserName = () => {
    const firstNames = ['John', 'Emma', 'Michael', 'Sophia', 'William', 'Olivia', 'James', 'Ava', 'Alexander', 'Isabella'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Jones', 'Garcia', 'Martinez', 'Lee', 'Kim', 'Wilson', 'Taylor'];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return { firstName: firstName, lastName: lastName };
};

// Function to generate JSON data for users
const generateUsersData = () => {
    const users = [];

    // Generate 30 users
    for (let i = 1; i <= 30; i++) {
        const userName = generateRandomUserName();
        users.push({ id: i, name: `${userName.firstName} ${userName.lastName}`, firstName: userName.firstName, lastName: userName.lastName });
    }

    return users;
};

// Function to export JSON data for users to a file
const exportUsersData = () => {
    const usersData = generateUsersData();
    fs.writeFileSync('users_data.json', JSON.stringify(usersData, null, 2));
};

// Call the function to export the JSON data for users
exportUsersData();

// Function to generate random date within a range
const randomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Function to generate and export JSON data for tickets, tasks, and comments
const generateAndExportTicketsData = (usersData) => {
    const tickets = [];

    // Generate tickets
    for (let i = 1; i <= 120; i++) {
        console.log(`Creating ticket ${i}`)
        const assignedTo = Math.floor(Math.random() * 30) + 1; // Random user ID
        const requestor = Math.floor(Math.random() * 30) + 1; // Random user ID
        const priorities = ['LOW', 'MEDIUM', 'HIGH', 'SEVERE'];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        let creationDate = new Date();
        const sla = {
            LOW: 14 * 24 * 60 * 60 * 1000, // 14 days
            MEDIUM: 7 * 24 * 60 * 60 * 1000, // 7 days
            HIGH: 2 * 24 * 60 * 60 * 1000, // 48 hours
            SEVERE: 12 * 60 * 60 * 1000 // 12 hours
        };
        creationDate.setTime(creationDate.getTime() - Math.floor(Math.random() * sla[priority]));
        const ticket = {
            id: i,
            assigned_to: assignedTo,
            requestor: requestor,
            title: `Ticket ${i}`,
            description: `Description of Ticket ${i}`,
            status: 'Open',
            priority: priority,
            creation_date: creationDate.toISOString(),
            comments: [],
            tasks: [],
            closure_date: null
        };

        // Generate random number of comments (up to 5)
        const numComments = Math.floor(Math.random() * 6);
        for (let j = 1; j <= numComments; j++) {
            const commentUser = usersData[Math.floor(Math.random() * usersData.length)];
            const commentDate = randomDate(creationDate, new Date());
            ticket.comments.push({
                user_id: commentUser.id,
                content: `Comment ${j} for Ticket ${i}`,
                datetime: commentDate.toISOString()
            });
        }

        // Generate random number of tasks (up to 10)
        const numTasks = Math.floor(Math.random() * 11);
        for (let k = 1; k <= numTasks; k++) {
            const taskUser = usersData[Math.floor(Math.random() * usersData.length)];
            const taskDueDate = randomDate(creationDate, new Date(creationDate.getTime() + sla[priority]));
            ticket.tasks.push({
                id: k,
                assigned_to: taskUser.id,
                description: `Task ${k} for Ticket ${i}`,
                status: 'Open',
                creation_date: creationDate.toISOString(),
                due_date: taskDueDate.toISOString(),
                closure_date: null
            });
        }

        // If ticket is closed, set closure date and close all tasks
        if (Math.random() < 0.5) {
            ticket.status = 'Closed';
            ticket.closure_date = new Date().toISOString();
            ticket.tasks.forEach(task => {
                task.status = 'Closed';
                task.closure_date = ticket.closure_date;
            });
        }

        tickets.push(ticket);
    }

    // Export the JSON data to a file
    fs.writeFileSync('tickets_data.json', JSON.stringify(tickets, null, 2));
};

// Read users data from file
const usersData = JSON.parse(fs.readFileSync('users_data.json', 'utf8'));

// Call the function to generate and export the JSON data for tickets
generateAndExportTicketsData(usersData);
