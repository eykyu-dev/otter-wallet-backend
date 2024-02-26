const jwt = require('jsonwebtoken');

// Middleware to verify JWT token and extract user_id
const verifyTokenAndExtractUserId = (req, res, next) => {
  // Get token from request headers or query parameters or cookies, wherever it's expected to be
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1]

  // Check if token exists
  if (!token && !authHeader) {
    return res.status(401).json({ message: 'Unauthorized: Token is missing' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Extract user_id from the decoded token
    const user_id = decoded.sub;

    // Attach user_id to req object for further use in route handlers
    req.user_id = user_id;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Token verification failed
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = verifyTokenAndExtractUserId;
