const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (user)=>{
    const payload ={
        _id: user._id,
        username:user.username,
        email:user.email,
        role:user.role
    }
    return jwt.sign(payload,process.env.JWT_SECRET)
}

module.exports= generateToken;