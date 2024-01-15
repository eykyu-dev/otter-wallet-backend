const express = require('express');
const router = express.Router();
const User = require('./model/user_model.js');

// Need to add email validator after implementing database
app.post('/register', [check('name').isLength(3), check('email').isEmail()],
async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { username, email, password } = req.body;

    try{
        let findExisting = await User.findOne({email});
        if (findExisting){
            return res.status(400).json({message: 'User already exists.'});
        }
        
        const newUser = new User({username, email, password});
        await newUser.save();

        return res.status(201).json({message: 'User was created.'})
    }

    catch (err){
        console.log('Error registering user.', err)
        return res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
