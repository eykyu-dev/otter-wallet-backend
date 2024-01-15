const express = require('express');
const router = express.Router();
const User = require('../models/user_model');

const bcrypt = require('bcrypt');

const { check, validationResult } = require('express-validator');


router.get('/', async (req, res) => {
  try {
    let allUsers = await User.find({});

    if (allUsers.length > 0) {
      return res.status(200).json({ users: allUsers }); // Sending fetched users in the response
    } else {
      return res.status(404).json({ message: 'No users found' }); // If no users are found
    }
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.status(500).json({ message: 'Server error' }); // Internal server error
  }
});

//Get function to pull a entry from the db based on ID
router.get('/:id', 
[
  check('id').isMongoId(), // Validate that the ID is a valid MongoDB ObjectId
], 

async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Error in validating:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params; // Access the ID from req.params, not req.body

  try {
    let foundUser = await User.findById(id);

    if (foundUser) {
      return res.status(200).json({
        user: foundUser
      });
    }

    // If user not found, return a 404 status
    return res.status(404).json({ message: 'User not found' });
  } catch (err) {
    console.error('Error fetching user:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

//Register function to sign-up new users
router.post('/register', [
  check('username').isLength({ min: 3 }), // Validate username length
  check('email').isEmail(), // Validate email format
  check('password').isLength({ min: 6 })], // Validate password length
async(req, res) => {
  //Checks for input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Error in validating.', errors.array())
      return res.status(400).json({ errors: errors.array() });
    }
    
    //Pulls data from res.body after validating input
    const { username, email, password } = req.body;

    try{
      //Tries to find existing user, if not create one and return a 201
        let findExisting = await User.findOne({email});
        if (findExisting){
            return res.status(400).json({message: 'User already exists.'});
        }
        
        // 3 is how encrypted the password should be. 
        const hashedPassword = await bcrypt.hash(password, 3);

        const newUser = new User({username, email, hashedPassword});
        await newUser.save();

        return res.status(201).json({message: 'User was created.'})
    }

    catch (err){
        console.log('Error registering user.', err)
        return res.status(500).json({ message: 'Server error' });
    }
});




module.exports = router;
