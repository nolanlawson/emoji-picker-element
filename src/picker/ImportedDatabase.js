// Import the database into the picker from exactly one module so that we can easily
// replace it at build time in rollup.config.js
import Database from '../database/Database.js'

export default Database
