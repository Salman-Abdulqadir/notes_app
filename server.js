const express = require('express');
const app = express();
const path = require('path')
const cookieParser = require('cookie-parser')
const PORT = process.env.PORT || 3500;
const {logger} = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cors = require('cors')

//logging every interaction with the server
app.use(logger)
// enabling the app to process json requests
app.use(express.json())
app.use(cookieParser)
app.use(cors())

app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/root'));

app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html'))
        res.sendFile(path.join(__dirname, 'view', '404.html'));
    else if (req.accepts('json'))
        res.json({message: "404 not found!"})
    else
        res.type('txt').send("404 Not found")
})

app.use(errorHandler);

app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`))