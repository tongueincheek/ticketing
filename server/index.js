// ticketing/server/index.js
// Server-side API for interacting with databases
// Created 4/11/2024
// Last updated 4/11/2024

import express from 'express'
import bodyParser from 'body-parser'
import routes from './routes.js';

const app = express()
const port = 9001

app.use(bodyParser.json())
app.use('/', routes);

app.listen(port, () => {
  console.log(`Ticketing API server running on port ${port}`)
})

export default app;