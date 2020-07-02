const https = require('https');
const crypto = require('crypto');
const url = require('url');

const API_URL = 'api4.temp-mail.org';

/**
 * Generate MD5 hash by source
 * @param {string} source
 * @return {string}
 */
function md5(source) {
  return crypto.createHash('md5').update(source).digest('hex');
}

/**
 * Makes a GET request, expects application/json in response
 * @param {string} path
 * @return {Promise<string>}
 */
function getJSON(pathname) {
  const path = url.resolve(pathname, 'format/json');
  return new Promise((resolve, reject) => {
    https
      .get({ host: API_URL, path }, (res) => {
        if (res.statusCode < 200 || res.statusCode > 299) {
          return reject(new Error(`Request failed: ${res.statusCode}`));
        }

        let data = '';

        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => resolve(data));
        res.on('error', reject);
      })
      .on('error', reject);
  });
}

/**
 * Returns a random array item
 * @param {Array<T>} array
 * @return {T}
 */
function getRandomArrayItem(array) {
  return array[Math.round(Math.random() * (array.length - 1))];
}

/**
 * Returns a random email
 * @param {string[]} domains
 * @return {string}
 */
function getRandomEmail(domains, len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const name = new Array(len).fill('').map(() => getRandomArrayItem(chars)).join('');
  const domain = getRandomArrayItem(domains);
  return name + domain;
}

/**
 * Returns a domains list from temp-mail.org
 * @return {Promise<string[]>}
 */
function getDomainsList() {
  return getJSON('/request/domains/');
}

/**
 * Returns a random email
 * @param {number} [len]
 * @return {string}
 */
function generateEmail(len = 7) {
  return getDomainsList().then((domains) => getRandomEmail(domains, len));
}

/**
 * Receives messages from temp-mail.org
 * @param {string} email
 * @return {Promise<Array<object> | object>}
 */
function getAllMessages(email) {
  if (!email) {
    throw new Error('Please specify email');
  }

  return getJSON(`/request/mail/id/${md5(email)}/`);
}

/**
 * Returns a message object from temp-mail.org
 * @param {string} mailId - unique message identifier (md5 hash)
 * @return {object}
 */
function getMessage(mailId) {
  if (!mailId) {
    throw new Error('Please specify mailId');
  }

  return getJSON(`/request/one_mail/id/${mailId}/`);
}

/**
 * Returns a message source from temp-mail.org
 * @param {string} mailId - unique message identifier (md5 hash)
 * @return {Array<string>}
 */
function getMessageSource(mailId) {
  if (!mailId) {
    throw new Error('Please specify mailId');
  }

  return getJSON(`/request/source/id/${mailId}/`);
}

/**
 * Delete message from temp-mail.org
 * @param {string} mailId - unique message identifier (md5 hash)
 * @return {{success: true | false}}
 */
function deleteMessage(mailId) {
  if (!mailId) {
    throw new Error('Please specify mailId');
  }

  return getJSON(`/request/delete/id/${mailId}/`);
}

module.exports = {
  deleteMessage,
  getMessageSource,
  getMessage,
  getAllMessages,
  generateEmail,
  getDomainsList,
};
