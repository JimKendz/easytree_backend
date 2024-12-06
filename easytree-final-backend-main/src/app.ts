import express, { Request, Response } from 'express';
import "express-async-errors" // needs to be imported before routers and other stuff!
const swaggerUi = require('swagger-ui-express');
import swaggerSpec from './swagger';
import loginRouter from './routes/login';
import userRouter from './routes/user';
import usersRouter from './routes/users';
import kophaseRouter from './routes/kophase';
import blockRouter from './routes/block';
import tournamentRouter from './routes/tournament';
import tournamentsRouter from './routes/tournaments';
var cors = require('cors')

const app = express();

// Middleware:
app.use('*', express.json())

// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, { explorer: true }));

app.use("*", cors({
    exposedHeaders: ['*']
}))
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Expose-Headers","Authorization");
    next();
});

// Routes
app.use("/api/login", loginRouter)
app.use("/api/users", usersRouter)
app.use("/api/user", userRouter)
app.use("/api/kophase", kophaseRouter)
app.use("/api/block", blockRouter)
app.use("/api/tournament", tournamentRouter)
app.use("/api/tournaments", tournamentsRouter)

export default app;