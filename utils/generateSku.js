import { customAlphabet } from "nanoid";

// Define alphabet (Uppercase + numbers) and SKU length (10 characters)
const generateSku = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

// eslint-disable-next-line import/prefer-default-export
export { generateSku };

// Or use default export if preferred:
// export default generateSku;
