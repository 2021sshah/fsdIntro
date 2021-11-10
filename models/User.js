const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    id: {
        type : String
    },
    password: {
        type : String
    },
    token : {
        type : String
    }
});

userSchema.methods.comparePassword = function(inputPassword, cb) {
    var user = this;
    if(inputPassword === user.password) {
        return cb(null, true);
    } else {
        return cb(null, false);
    }
}

userSchema.methods.createToken = function(cb) {
    var user = this;
    // secret key can be anything
    var token = jwt.sign(user._id.toHexString(), 'fsd');

    user.token = token;
    user.save((err, user) => {
        if(err) return cb(err, null); 
        return cb(null, user);
    });
}

userSchema.statics.findByToken = function(token, cb) {
    jwt.verify(token, 'fsd', (err, decoded) => {
        // What does decoded actually mean?
        User.findOne({ _id : decoded}, (err, user) => {
            if(err) return cb(err, null);
            if(!user) return cb(err, null);
            return cb(null, user);
        });

    });
}

const User = mongoose.model('user', userSchema);
module.exports = { User };