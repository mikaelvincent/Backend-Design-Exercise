/**
 * This module handles basic operations on the mock user database, which is stored
 * in a JSON file. It includes functions to read, write, and update user data,
 * simulating the behavior of a persistent data storage.
 *
 * The user data is stored in `users.json`, and this file provides functions for:
 * - Retrieving all users
 * - Finding users by username or ID
 * - Adding new users
 * - Updating existing users
 *
 * Note: Since the data is stored in a JSON file, changes are written to disk
 * every time an update occurs. This is not optimized for large-scale applications
 * and is only used here for demonstration purposes.
 */

const fs = require('fs');
const path = require('path');

// Path to the JSON file simulating the user database
const usersFilePath = path.join(__dirname, '../data/users.json');

/**
 * Reads the user data from the JSON file and parses it into an array of user objects.
 * This simulates the behavior of a database read operation.
 *
 * @returns {Array} List of users from the JSON file, or an empty array if the file is empty or missing.
 */
function readUsersFromFile() {
	try {
		const data = fs.readFileSync(usersFilePath, 'utf8'); // Read file content as UTF-8 string
		return JSON.parse(data); // Parse the string into a JSON object
	} catch (err) {
		return []; // Return an empty array if the file is not found or any error occurs
	}
}

/**
 * Writes the updated user data back to the JSON file. This simulates a database
 * write operation by persisting the updated user list to disk.
 *
 * @param {Array} users - The updated list of user objects to be written to the JSON file.
 */
function writeUsersToFile(users) {
	fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8'); // Save data with 2-space indentation
}

module.exports = {
	/**
	 * Retrieves all users from the mock database.
	 *
	 * @returns {Array} List of all users.
	 */
	getAllUsers: function() {
		return readUsersFromFile();
	},

	/**
	 * Finds a user by their username. This function simulates a database query
	 * by iterating through the list of users and returning the first match.
	 *
	 * @param {string} username - The username of the user to find.
	 * @returns {Object|null} The user object if found, or null if not found.
	 */
	findUserByUsername: function(username) {
		const users = readUsersFromFile();
		return users.find(user => user.username === username) || null; // Return null if user is not found
	},

	/**
	 * Finds a user by their ID. This function simulates a database query
	 * by searching for a user with a matching ID.
	 *
	 * @param {number} id - The ID of the user to find.
	 * @returns {Object|null} The user object if found, or null if not found.
	 */
	findUserById: function(id) {
		const users = readUsersFromFile();
		return users.find(user => user.id === id) || null;
	},

	/**
	 * Adds a new user to the mock database. This function simulates inserting a new
	 * record into a database by appending the new user object to the list of users.
	 *
	 * @param {Object} user - The new user object to add, including the fields: id, username, email, and password.
	 */
	addUser: function(user) {
		const users = readUsersFromFile();
		users.push(user);			// Append the new user to the list
		writeUsersToFile(users);	// Persist the updated user list to the JSON file
	},

	/**
	 * Updates an existing user in the mock database. This function simulates an update
	 * operation by replacing the old user object with the updated one, if found.
	 *
	 * @param {Object} updatedUser - The updated user object with the same ID as the user to be updated.
	 * @returns {boolean} True if the user was successfully updated, false if the user was not found.
	 */
	updateUser: function(updatedUser) {
		const users = readUsersFromFile();
		const index = users.findIndex(user => user.id === updatedUser.id); // Find the index of the user by ID
		if (index !== -1) {
			users[index] = updatedUser;	// Replace the old user with the updated user
			writeUsersToFile(users);	// Save changes to disk
			return true;
		}
		return false; // Return false if the user was not found
	}
};
