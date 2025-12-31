const { customAlphabet } = require("nanoid");

// Define alphabet (Uppercase only) and SKU length (e.g., 10 characters)
const generateSku = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);
module.exports = { generateSku };
