/**
 * Middleware function that checks if the user's role (decoded from JWT) 
 * is included in the list of roles required to access the route.
 * * Usage: router.get('/protected', checkRole(['admin', 'teacher']), handler);
 */
module.exports = (requiredRoles) => (req, res, next) => {
    // req.user should be populated by the preceding authentication middleware (auth.js)
    if (!req.user || !req.user.role) {
        // This should theoretically not be hit if auth middleware runs first, 
        // but acts as a safeguard.
        return res.status(403).json({ 
            message: 'Access denied. Role information missing.' 
        });
    }

    const userRole = req.user.role.toLowerCase();

    // Check if the user's role is included in the list of allowed roles
    if (requiredRoles.map(r => r.toLowerCase()).includes(userRole)) {
        // Role is valid, proceed to the next middleware or route handler
        next();
    } else {
        // Role is not authorized for this route
        console.log(`Authorization Failed: User role '${userRole}' cannot access required roles: ${requiredRoles.join(', ')}`);
        return res.status(403).json({ 
            message: 'You do not have permission to view this page or an error occurred.' 
        });
    }
};