require('dotenv').config();

const express = require("express");
const db = require("../db");
const { plaidClient } = require("../plaid");

const router = express.Router();

const verifyTokenAndExtractUserId = require("./middleware/verifyTokenAndExtractUserId");
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
    const user_id = req.user_id;
    const exists = await db.itemExists(item_id)
    if(exists){
        const { access_token: accessToken } = await db.getItemInfoForUser(
            item_id,
            user_id
          );
          await plaidClient.itemRemove({
            access_token: accessToken,
          });
          await db.deactivateItem(item_id);
          res.json({ removed: item_id });
    }else{
      res.status(500).json({message: "Cannot delete id that doesn't exist."})
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
