// Server
const express = require('express');
const app = express();
const port = 8080;
const cookiePaser= require('cookie-parser');

app.use(express.json());
app.use(cookiePaser());

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

console.log("Testing");

// Database
// MongoDB Server Information - user:password
const mongoose = require('mongoose');
const mongoURI = "mongodb+srv://sshah:demofs1@cluster0.ucie3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(mongoURI)
    .then(console.log('DB Connected!'))
    .catch(err => {console.log(err)});

// Sign Up
const { User } = require('./models/User');
app.post('/signup', (req, res) => {
    const user = new User(req.body);

    user.save((err, doc) => {
        if (err) return res.json({ signupSuccess : false});
        return res.status(200).json({ signupSuccess : true });
    });
});

app.get('/', (req, res) => {
    res.send("Hello World");
})

// Login
app.post('/login', (req, res) => {
    // 1. Find whether or not the ID exists
    User.findOne({ id : req.body.id }, (err, user1) => {
        if(err) return res.json({ loginSuccess : false });
        if(!user1) return res.json({ loginSuccess : false, msg : 'ID not found' });
        // 2. If ID exists, compare password w/ password in DB
        user1.comparePassword(req.body.password, (err, isMatch) => {
            if(err) return res.json({ loginSuccess : false });
            if(!isMatch) return res.json({ loginSuccess : false, msg : 'PW does not match!' });
            // 3. Create a Tolen and save it to web cookie
            user1.createToken((err, user2) => {
                if(err) return res.json({ loginSuccess : false, msg : "createToken err" });
                if(!user1) return res.json({ loginSuccess : false, msg : 'ID not found' });
                // Save that Token into the cookie.
                return res.cookie('x_auth', user2.token)
                            .status(200)
                            .json({loginSuccess : true, token : user2.token});
            });

        });        
    })
});

const { auth } = require('./middleware/auth'); 

app.get('/auth', auth, (req, res) => {
    return res.json({
        // _id : req.user._id,
        id : req.user.id
    });
});

app.get('/logout', auth, (req, res) => {
    // reset the token
    User.findByIdAndUpdate({_id : req.user._id }, { token : ''}, (err, user) => {
        if(err) return res.json({ logoutSuccess : false });
        return res.status(200).json({ logoutSuccess : true });
    })
});