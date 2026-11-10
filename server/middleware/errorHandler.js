export function notFound(req, res) {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// One place to handle all errors. Express 5 sends async errors here automatically.
export function errorHandler(err, req, res, next) {
    let status = err.statusCode || 500;
    let message = err.message || 'Something went wrong';

    if (err.name === 'ZodError') {
        status = 400;
        message = err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    } else if (err.name === 'ValidationError') {
        status = 400; // Mongoose validation
        message = Object.values(err.errors).map((e) => e.message).join(', ');
    } else if (err.name === 'CastError') {
        status = 400;
        message = 'Invalid id';
    } else if (err.code === 11000) {
        status = 409;
        message = 'This value already exists';
    } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        status = 401;
        message = 'Invalid or expired token. Please login again';
    }

    if (status === 500) console.error(err);

    res.status(status).json({
        message,
        ...(process.env.NODE_ENV === 'development' && status === 500 ? { stack: err.stack } : {}),
    });
}