function errorHandler(error, req, res, next) {
    error.statusCode = res.statusCode || 500; // if the error has a status code we will set that as the status code else if we don't have a status code we set it to a server error
    error.status = error.status || "error"; //
    res.status(error.statusCode).json({
        status: error.statusCode,
        message: error.message,
    });
}

// This function will be used as the error handling middleware in the server.js file. It will catch any uncaught errors and send a JSON response with the appropriate status code and error message.
// To use this middleware you should create an error object, set the status and statusCode. Then call the next function and pass the error object to automatically call the global error handler

// const error = new Error("description of the error that has occurred that should be displayed in the error message");
// error.status = "fail";
// error.statusCode = 404;
// next(error);

module.exports = errorHandler;