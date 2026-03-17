import crypto from 'crypto';

const plain_text = 'my_secret_key';
const secret = 'b700fd4258de403a6f1535379612e3e84b5520372482281574d65d1c5fad2e11';
const message = 'hDp72Pw/0zTV+glirc2ipqNTBYg57iMBZ3qGULv4XxU=';

const hmac = crypto.createHmac('sha256', Buffer.from(secret, 'hex'));
hmac.update(message);
const signature = hmac.digest('hex');

console.log(signature);