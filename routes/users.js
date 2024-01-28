const express = require('express');
const router = express.Router();
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const bcrypt = require('bcrypt');

const { check, validationResult } = require('express-validator');

// Catch-all route for undefined routes
router.use('*', (req, res) => {
  return res.status(404).json({ message: 'Unauthorized, Not Found' });
});


router.get('/', async (req, res) => {
  try {
    const { data: userByID, queryAllUsersError } = await supabase
      .from('users')
      .select('*');
    
    if (queryAllUsersError) {
      return res.status(500).json({ message: queryAllUsersError });
    }

    if (userByID && userByID.length > 0) {
      return res.status(200).json({ users: userByID });
    }

    return res.status(404).json({ message: 'No users found' });
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});


//Get function to pull a entry from the db based on ID
router.get('/:id', async (req, res) => {
  const { id } = req.params; // Access the ID

  try {
    let foundUser = await supabase.from('users').select('*').eq('id', id).single();

    if (foundUser) {
      return res.status(200).json({
        user: foundUser.data
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

    if (foundUser.data) {
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

//Delete route for params, given ID.
router.delete('/delete', async (req, res) => {
  const id = req.query.id;

  try {
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Query to check if the user exists given by ID.
    const { data: userByID, queryByIDError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (queryByIDError) {
      console.error('Error could not find user by ID:', queryByIDError);
      return res.status(500).json({ message: 'Error could not find user by ID', error: queryByIDError });
    }

    // If the user does not exist, return a 404 status
    if (!userByID) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Query to delete the entry given ID.
    const { error: deletionError } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (deletionError) {
      console.error('Could not delete.', deletionError);
      return res.status(500).json({ message: 'Could not delete', error: deletionError });
    }

    return res.status(200).json({ message: 'User was deleted.' });
  } catch (err) {
    console.log('Error deleting user.', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});



// PATCH route to update email
router.patch('/email/:id', async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newEmail } = req.body;

  try {
    const { data: user, error: authError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (authError) {
      console.error('Error authenticating user:', authError);
      return res.status(500).json({ message: 'Error authenticating user', error: authError });
    }

    if (!user || !user.hashedPassword) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.hashedPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Update the email since authentication was successful
    const { error: updateEmailError } = await supabase
      .from('users')
      .update({ email: newEmail })
      .eq('id', id);

    if (updateEmailError) {
      console.error('Error updating email:', updateEmailError);
      return res.status(500).json({ message: 'Error updating email', error: updateEmailError });
    }

    return res.status(200).json({ message: 'Email updated successfully' });
  } catch (err) {
    console.error('Error updating email:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH route for updating username
router.patch('/username/:id', [
  check('currentPassword').isLength({ min: 6 }),
  check('newUsername').isLength({ min: 3 }),
], async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newUsername } = req.body;

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Authenticate user
    const { data: user, error: authError } = await supabase
      .from('users')
      .select('hashedPassword')
      .eq('id', id)
      .single();

    if (authError) {
      console.error('Error authenticating user:', authError);
      return res.status(500).json({ message: 'Error authenticating user', error: authError });
    }

    if (!user || !user.hashedPassword) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the provided password is valid
    const isPasswordValid = await bcrypt.compare(currentPassword, user.hashedPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Update the username since authentication was successful
    const { error: updateUsernameError } = await supabase
      .from('users')
      .update({ username: newUsername })
      .eq('id', id);

    if (updateUsernameError) {
      console.error('Error updating username:', updateUsernameError);
      return res.status(500).json({ message: 'Error updating username', error: updateUsernameError });
    }

    return res.status(200).json({ message: 'Username updated successfully' });
  } catch (err) {
    console.error('Error updating username:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH route for updating password
router.patch('/password/:id', [
check('currentPassword').isLength({ min: 6 }),
check('newPassword').isLength({ min: 6 }),
], async (req, res) => {
try {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
  }

  // Authenticate user
  const { data: user, error: authError } = await supabase
  .from('users')
  .select('hashedPassword')
  .eq('id', id)
  .single();

  if (authError) {
  console.error('Error authenticating user:', authError);
  return res.status(500).json({ message: 'Error authenticating user', error: authError });
  }

  if (!user || !user.hashedPassword) {
  return res.status(404).json({ message: 'User not found' });
  }

  // Check if the provided password is valid
  const isPasswordValid = await bcrypt.compare(currentPassword, user.hashedPassword);

  if (!isPasswordValid) {
  return res.status(401).json({ message: 'Incorrect password' });
  }

  // Hash the new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 3);

  // Update the password since authentication was successful
  const { error: updatePasswordError } = await supabase
  .from('users')
  .update({ hashedPassword: hashedNewPassword })
  .eq('id', id);

  if (updatePasswordError) {
  console.error('Error updating password:', updatePasswordError);
  return res.status(500).json({ message: 'Error updating password', error: updatePasswordError });
  }

  return res.status(200).json({ message: 'Password updated successfully' });
} catch (err) {
  console.error('Error updating password:', err);
  return res.status(500).json({ message: 'Server error', error: err.message });
}
});



module.exports = router;

