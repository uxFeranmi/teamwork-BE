/* eslint-disable no-console */

const pg = require('pg');
const uuid = require('uuid/v4');

const { DATABASE_URL } = require('../../constants/constants');
const createUserQuery = require('../../database/users/create-user.sql.js');
const getUserQuery = require('../../database/users/get-user.sql.js');
// import getUserQuery from '../../database/users/get-user.sql.js';

const pool = new pg.Pool({ connectionString: DATABASE_URL });

/**
 * Create a new user.
 * @param {object} userData The user data from the request body.
 */
const createUser = async (userData) => {
  const {
    firstName, lastName, email, password, gender, jobRole, department, address,
  } = userData;

  const id = uuid();
  const userDataArray = [
    id, firstName, lastName, email, password, gender, jobRole, department, address,
  ];

  await pool.query(createUserQuery, userDataArray);
  const [newUser] = (await pool.query(getUserQuery, [id, email])).rows;

  return newUser;
};

module.exports = createUser;
