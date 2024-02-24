const express = require("express");
const db = require("../db");
const { getLoggedInUserId } = require("../utils");
const { plaidClient } = require("../plaid");

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const router = express.Router();


//recieve list of all banks the user is connected too. 
router.get("/list", async (req, res, next) => {
  try {
    const userId = getLoggedInUserId(req);
    const result = await db.getBankNamesForUser(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});


//removing a bank that a user is connected too.
router.post("/deactivate", async (req, res, next) => {
  try {
    const itemId = req.body.itemId;
    const userId = getLoggedInUserId(req);
    const { access_token: accessToken } = await db.getItemInfoForUser(
      itemId,
      userId
    );
    await plaidClient.itemRemove({
      access_token: accessToken,
    });
    await db.deactivateItem(itemId);

    res.json({ removed: itemId });
  } catch (error) {
    next(error);
  }
});

module.exports = router;