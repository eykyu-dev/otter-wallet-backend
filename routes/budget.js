const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get budget for a specific user
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data: budget, error: budgetError } = await supabase
      .from('budget')
      .select('*')
      .eq('user_id', id)
      .single();

    if (budgetError) {
      console.error('Error fetching budget:', budgetError);
      return res.status(500).json({ message: 'Error fetching budget', error: budgetError });
    }

    if (budget) {
      return res.status(200).json({ budget });
    }

    // If no budget found, return a default or empty budget
    return res.status(404).json({ message: 'Budget not found for the user', budget: {} });
  } catch (err) {
    console.error('Error fetching budget:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create or update budget for a user
router.post('/:id', async (req, res) => {
  const { id } = req.params;
  const { wants, needs, bills } = req.body;

  try {
    // Check if the user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (userError) {
      console.error('Error checking user existence:', userError);
      return res.status(500).json({ message: 'Error checking user existence', error: userError });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create or update the budget
    const { data: updatedBudget, error: budgetError } = await supabase
      .from('budget')
      .upsert([{ user_id: id, wants, needs, bills }], { onConflict: ['user_id'] });

    if (budgetError) {
      console.error('Error updating budget:', budgetError);
      return res.status(500).json({ message: 'Error updating budget', error: budgetError });
    }

    return res.status(200).json({ message: 'Budget updated successfully', budget: updatedBudget });
  } catch (err) {
    console.error('Error updating budget:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
