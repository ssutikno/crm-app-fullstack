const bcrypt = require('bcryptjs');

// The password you want to use for logging in
const plainTextPassword = 'password123';

const salt = bcrypt.genSaltSync(10);
const hashedPassword = bcrypt.hashSync(plainTextPassword, salt);

console.log('--- New Hashed Password ---');
console.log(hashedPassword);
console.log('---------------------------');