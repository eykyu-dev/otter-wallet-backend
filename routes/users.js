const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qwfjhjpqozyfenwiqhoe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3ZmpoanBxb3p5ZmVud2lxaG9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwNTcxMDkyNSwiZXhwIjoyMDIxMjg2OTI1fQ.3eLQnacCrc_G2VwaP2m96pHhjfe_OYLfzC9Yfoh4Uxc'
const supabase = createClient(supabaseUrl, supabaseKey);

const bcrypt = require('bcrypt');

const { check, validationResult } = require('express-validator');


router.get('/', async (req, res) => {
  try {
    let allUsers = await supabase.from('users').select('*')

    if (allUsers && allUsers.length > 0) {
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
router.get('/:id', async (req, res) => {

  const { id } = req.params; // Access the ID

  try {
    let foundUser = await supabase.from('users').select('*').eq('email', email).single();

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

// Register function to sign-up new users
router.post('/register', [
  check('username').isLength({ min: 3 }), // Validate username length
  check('email').isEmail(), // Validate email format
  check('password').isLength({ min: 6 })
], // Validate password length
async (req, res) => {
  try {
    // Checks for input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Error in validating.', errors.array())
      return res.status(400).json({ errors: errors.array() });
    }

    // Pulls data from res.body after validating input
    const { username, email, password } = req.body;

    // Tries to find existing user, if not create one and return a 201
    let foundUser = await supabase.from('users').select('*').eq('email', email).single();

    if (foundUser && foundUser.data) {
      return res.status(400).json({ message: 'User found, cannot register.' });
    }else{
      // No user found, proceed with registration
      const hashedPassword = await bcrypt.hash(password, 3);

      const { data: newUser, error: registrationError } = await supabase
        .from('users')
        .upsert([{ username, email, hashedPassword }], { onConflict: ['email'] });

      if (registrationError) {
        console.error('Error registering user:', registrationError);
        return res.status(500).json({ message: 'Error registering user', error: registrationError });
      }
      
      return res.status(201).json({ message: 'User was created.' });
    }
  } catch (err) {
    console.log('Error registering user.', err)
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.delete('/delete', async (req, res) => {
  const { id } = req.query;

  try {
    // Query to check if the user exists given by ID.
    const { data: userByID, queryByIDError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (queryByIDError) 
    {
      console.error('Error could not find user by ID:', queryByIDError);
      return res.status(500).json({ message: 'Error could not find user by ID', error: queryByIDError });
    }

    // If the user does not exist, return a 404 status
    if (!userByID) 
    {
      return res.status(404).json({ message: 'User not found' });
    }

    // Query to delete the entry given ID.
    const { error: deletionError } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (deletionError) 
    {
      console.error('Could not delete.', deletionError);
      return res.status(500).json({ message: 'Could not delete', error: deletionError });
    }

    return res.status(200).json({ message: 'User was deleted.' });
  } catch (err) {
    console.log('Error deleting user.', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});



module.exports = router;
