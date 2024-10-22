const jwt = require('jsonwebtoken');

// Define the single valid JWT token (this token would be predefined or generated in a secure way)
const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2aWNlIjoibXktYmFja2VuZC1zZXJ2aWNlIiwiaWF0IjoxNzI5NTk0ODA4LCJleHAiOjIwNDUxNzA4MDh9.66XRHLU4jLcdQSJLdFTONDSYdZ4wynMXWIw5iORQhIo';

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    // Skip JWT verification for the /display route
    if (req.path === '/api/tokens/display') {
        return next(); 
    }

    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        if (token === validJWT) {
            // If the token matches the predefined valid JWT, proceed
            next();
        } else {
            // Token does not match the valid JWT
            return res.status(403).json({ message: 'Forbidden: Invalid token' });
        }
    } else {
        // No token was provided
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
};

module.exports = authenticateJWT;
