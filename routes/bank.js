const express = require("express");
const db = require("../db");
const { plaidClient } = require("../plaid");

const router = express.Router();
const verifyTokenAndExtractUserId = require("./middleware/verifyTokenAndExtractUserId");

require('dotenv').config();

router.use(verifyTokenAndExtractUserId)

// Recieve list of all banks the user is connected too. 
router.get("/list", async (req, res, next) => {
  try {
    const result = await db.getBankNamesForUser(req.user_id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Removing a bank that a user is connected to.
router.post("/deactivate", async (req, res, next) => {
  try {
    const item_id = req.body.item_id;
    const user_id = getLoggedInUserId(req);
    const { access_token: accessToken } = await db.getItemInfoForUser(
      item_id,
      user_id
    );
    await plaidClient.itemRemove({
      access_token: accessToken,
    });
    await db.deactivateItem(item_id);

    res.json({ removed: item_id });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
