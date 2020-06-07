import { Emoji, DatabaseConstructorOptions } from "./shared";

export default class Database {

  /**
   * Create a new Database.
   *
   * Note that multiple Databases pointing to the same locale will share the
   * same underlying IndexedDB connection and database.
   *
   * @param dataSource - URL to fetch the emojibase data from
   * @param locale - Locale string
   */
  constructor({
                dataSource = 'https://cdn.jsdelivr.net/npm/emojibase-data@5/en/data.json',
                locale = 'en'
              }: DatabaseConstructorOptions = {}) {
  }

  /**
   * Resolves when the Database is ready, or throws an error if
   * the Database could not initialize.
   *
   * Note that you don't need to do this before calling other APIs – they will
   * all wait for this promise to resolve before doing anything.
   */
  ready(): Promise<void> {
    return Promise.resolve()
  }

  /**
   * Returns all emoji belonging to a group, ordered by `order`.
   * @param group - the group number
   */
  getEmojiByGroup(group: number): Promise<Emoji[]> {
    return Promise.resolve([])
  }

  /**
   * Returns all emoji matching the given search query, ordered by `order`.
   * @param query - search query string
   */
  getEmojiBySearchQuery(query: string): Promise<Emoji[]> {
    return Promise.resolve([])
  }

  /**
   * Return a single emoji matching the shortcode, or null if not found.
   * @param shortcode
   */
  getEmojiByShortcode(shortcode: string): Promise<Emoji | null> {
    return Promise.resolve(null)
  }

  /**
   * Return a single emoji matching the unicode string, or null if not found.
   * @param unicode - unicode string
   */
  getEmojiByUnicode(unicode: string): Promise<Emoji | null> {
    return Promise.resolve(null)
  }

  /**
   * Closes the underlying IndexedDB connection. The Database is not usable after that (or any other Databases
   * with the same locale).
   *
   */
  close(): Promise<void> {
    return Promise.resolve()
  }

  /**
   * Deletes the underlying IndexedDB database. The Database is not usable after that (or any other Databases
   * with the same locale).
   *
   */
  delete(): Promise<void> {
    return Promise.resolve()
  }
}