const jwt = require('jsonwebtoken');
const User = require('../model/user.model');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    console.log("token from angular",token);
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("decoded",decoded);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

const adminMiddleware = async (req, res, next) => {
    try {
        console.log("userId",req.user._id);
        const user = await User.findById(req.user._id);
        

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied, admin role required' });
        }

        next();
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

module.exports = { authMiddleware, adminMiddleware };
