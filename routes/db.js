const getitem_idsForUser = async function (user_id) {

};

const getItemsAndAccessTokensForUser = async function (user_id) 
{

};

const getaccount_idsForItem = async function (item_id) 
{

};

const deactivateItem = async function (item_id) 
{
  // If your user wanted all the data associated with this bank removed, you
  // could...
  // - Delete transactions for accounts belonging to this item
  // - Delete accounts that belong to this item
  // - Delete the item itself from the database
};


const addItem = async (item_id, user_id, access_token) => {
    try {
        let { data: items, error } = await supabase
            .from('items')
            .upsert({ uuid: user_id, access_token: access_token, id: item_id });

        if (error) {
            console.log({message: error.message, location: "addItem"});
        }

        // Handle successful operation here if needed
        console.log("Item upserted successfully:", items);

        // You can return items or any other value you need upon successful operation
        return items;
    } catch (error) {
        // Handle any error that occurs during the database operation or error thrown above
        console.error("Error while adding item:", error.message);
        // You might want to throw the error further to handle it in the caller function
        throw error;
    }
}

const addBankNameForItem = async function (item_id, institutionName) 
{

};

const addAccount = async function (account_id, item_id, acctName) 
{
};

const getItemInfoForUser = async function (item_id, user_id) 
{

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
