const express = require('express');
const router = express.Router();
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
router.use(express.json());


// User registration
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({
      email, 
      password,
    });
    if (error) throw error;
    res.json({session: data.session});
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Update user information
router.put('/update', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.update({
      email,
      password,
    });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user account
router.delete('/delete', async (req, res) => {
  try {
    const { email } = req.body;
    const { error } = await supabase.auth.delete({
      email,
    });
    if (error) throw error;
    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;
