const jwt = require('jsonwebtoken');

// Generate a lifetime JWT token
function generateToken() {
    const payload = { service: 'my-backend-service' };  // This can be any information you want
    const secretKey = 'your-secret-key'; // Use a strong secret key
    const options = {
        expiresIn: '10y' // Set a very long expiration time, like 10 years
    };

    const token = jwt.sign(payload, secretKey, options);
    return token;
}

const token = generateToken();
console.log('Your JWT token:', token);
