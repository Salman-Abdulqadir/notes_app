const {format} = require('date-fns');
const {uuid} = require('uuid');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path')

const logEvents = async (message, logFileName) => {
    const dateTime = `${format(new Date, 'yyyyMMdd\tHH:mm:ss')}`;
    const logItem = `${dateTime}\t${uuid}\t${message}\n`;
    const logsPath = path.join(__dirname, "..", "logs");
    console.log(logItem);
    try{
        if(!fs.existsSync(logsPath))
            await fsPromises.mkdir(logsPath);
        await fsPromises.appendFile(path.join(logsPath, logFileName), logItem)
    }catch (err) {
        console.log(err);
    }
}

const logger = (req, res, next) => {
    const logMessage = `${req.method}\t${req.url}\t${req.headers.origin}`;
    logEvents(logMessage, 'reqLog.log');
    console.log(logMessage, `${req.method} ${req.path}`);
    next()

}

module.exports = {logger, logEvents}