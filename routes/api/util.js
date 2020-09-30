//Helper functions
import jwt from 'jsonwebtoken';

async function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return {
                    status: 'fail',
                    error: 'Invalid JWT'
                }
            }

            req.user = user;
            next();
        });
    } else {
        return {
            status: 'fail',
            error: 'No JWT found'
        }
    }
}

export { authenticateToken }