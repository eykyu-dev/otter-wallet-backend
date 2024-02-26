const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
require('dotenv').config();

/**
 * Retrieves bank names associated with a user from the database.
 *
 * @param {string} user_id - The UUID of the user.
 * @returns {Array|null} An array of bank names or null if an error occurs.
 */
const getBankNamesForUser = async function (user_id) {
    try {
        let { data, error } = await supabase
            .from('items')
            .select('bank_name')
            .eq('uuid', user_id);

        if (error) {
            console.error({ message: error.message, location: "getBankNamesForUser", query: 'SELECT bank_name FROM items WHERE uuid = ' + user_id });
            return null;
        }

        return {bank_names: data};
    } catch (error) {
        console.error('Error fetching bank names:', error.message);
        return null;
    }
};


/**
 * Retrieves item IDs associated with a user from the database.
 *
 * @param {string} user_id - The UUID of the user.
 * @returns {Array|null} An array of item IDs or null if an error occurs.
 */
const getitem_idsForUser = async function (user_id) {
    let { data, error } = await supabase
        .from('items')
        .select('id')
        .eq('uuid', user_id);

    if (error) {
        console.error({ message: error.message, location: "getitem_idsForUser", query: 'SELECT id FROM items WHERE uuid = ' + user_id });
        return null;
    }
    return data;
};

/**
 * Retrieves items and access tokens associated with a user from the database.
 *
 * @param {string} user_id - The UUID of the user.
 * @returns {Array|null} An array of items and access tokens or null if an error occurs.
 */
const getItemsAndAccessTokensForUser = async function (user_id) {
    let { data, error } = await supabase
        .from('items')
        .select()
        .eq('uuid', user_id);

    if (error) {
        console.error({ message: error.message, location: "getItemsAndAccessTokensForUser", query: 'SELECT * FROM items WHERE uuid = ' + user_id });
        return null;
    }
    return data;
};

/**
 * Retrieves account IDs associated with an item from the database.
 *
 * @param {string} item_id - The ID of the item.
 * @returns {Array|null} An array of account IDs or null if an error occurs.
 */
const getaccount_idsForItem = async function (item_id) {
    let { data, error } = await supabase
        .from('accounts')
        .select('id')
        .eq('item_id', item_id);

    if (error) {
        console.error({ message: error.message, location: "getaccount_idsForItem", query: 'SELECT id FROM accounts WHERE item_id = ' + item_id });
        return null;
    }
    return data;
};

// const deactivateItem = async function (item_id) 
// {
//   // If your user wanted all the data associated with this bank removed, you
//   // could...
//   // - Delete transactions for accounts belonging to this item
//   // - Delete accounts that belong to this item
//   // - Delete the item itself from the database
// };


/**
 * Adds a new item to the database.
 *
 * @param {string} item_id - The ID of the item.
 * @param {string} user_id - The UUID of the user.
 * @param {string} access_token - The access token of the item.
 */
const addItem = async (item_id, user_id, access_token) => {
    let { error } = await supabase
        .from('items')
        .upsert({ uuid: user_id, access_token: access_token, id: item_id });

    if (error) {
        console.error({ message: error.message, location: "addItem", query: 'UPSERT INTO items (uuid, access_token, id) VALUES (' + user_id + ', ' + access_token + ', ' + item_id + ')' });
        throw new Error(error.message);
    }
};

/**
 * Adds a bank name for a specific item in the database.
 *
 * @param {string} item_id - The ID of the item.
 * @param {string} institutionName - The name of the bank.
 */
const addBankNameForItem = async function (item_id, institutionName) {
    let { error } = await supabase
        .from('items')
        .update({ bank_name: institutionName })
        .eq('id', item_id);

    if (error) {
        console.error({ message: error.message, location: "addBankNameForItem", query: 'UPDATE items SET bank_name = ' + institutionName + ' WHERE id = ' + item_id });
        throw new Error(error.message);
    }
};

/**
 * Adds an account to the database.
 *
 * @param {string} account_id - The ID of the account.
 * @param {string} item_id - The ID of the item.
 * @param {string} acctName - The name of the account.
 */
const addAccount = async function (account_id, item_id, acctName) {
    let { error } = await supabase
        .from('accounts')
        .upsert({ id: account_id, item_id: item_id, name: acctName });

    if (error) {
        console.error({ message: error.message, location: "addAccount", query: 'UPSERT INTO accounts (id, item_id, name) VALUES (' + account_id + ', ' + item_id + ', ' + acctName + ')' });
        throw new Error(error.message);
    }
};

/**
 * Retrieves item information associated with a user and item from the database.
 *
 * @param {string} item_id - The ID of the item.
 * @param {string} user_id - The UUID of the user.
 * @returns {Array|null} An array of item information or null if an error occurs.
 */
const getItemInfoForUser = async function (item_id, user_id) {
    let { data, error } = await supabase
        .from('items')
        .select()
        .eq('item_id', item_id)
        .eq('uuid', user_id);

    if (error) {
        console.error({ message: error.message, location: "getItemInfoForUser", query: 'SELECT * FROM items WHERE item_id = ' + item_id + ' AND uuid = ' + user_id });
        throw new Error(error.message);
    }

    return data;
};


/**
 * Add a new transaction to our database
 *
 * @param {SimpleTransaction} transactionObj
 */
const addNewTransaction = async function (transactionObj) 
{

};

/**
 * Modify an existing transaction in our database
 *
 * @param {SimpleTransaction} transactionObj
 */
const modifyExistingTransaction = async function (transactionObj) 
{

};

/**
 * Mark a transaction as removed from our database
 *
 * @param {string} transactionId
 */
const markTransactionAsRemoved = async function (transactionId) 
{

};

/**
 * Actually delete a transaction from the database
 *
 * @param {string} transactionId
 */
const deleteExistingTransaction = async function (transactionId) 
{

};

/**
 * Fetch transactions for our user from the database
 *
 * @param {string} user_id
 * @param {number} maxNum
 */
const getTransactionsForUser = async function (user_id, maxNum) 
{

};

/**
 * Save our cursor to the database
 *
 * @param {string} transactionCursor
 * @param {string} item_id
 */
const saveCursorForItem = async function (transactionCursor, item_id) 
{

};


module.exports = {
    // getItemIdsForUser,
    getItemsAndAccessTokensForUser,
    // getAccountIdsForItem,
    // confirmItemBelongsToUser,
    // deactivateItem,
    getBankNamesForUser,
    addItem,
    addBankNameForItem,
    addAccount,
    // getItemInfo,
    getItemInfoForUser,
    // addNewTransaction,
    // modifyExistingTransaction,
    // deleteExistingTransaction,
    // markTransactionAsRemoved,
    // getTransactionsForUser,
    // saveCursorForItem,
  };