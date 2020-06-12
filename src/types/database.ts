import {Emoji, DatabaseConstructorOptions, SkinTone} from "./shared";

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
   *
   * Non-numbers throw an error.
   * @param group - the group number
   */
  getEmojiByGroup(group: number): Promise<Emoji[]> {
    return Promise.resolve([])
  }

  /**
   * Returns all emoji matching the given search query, ordered by `order`.
   *
   * Empty/null strings throw an error.
   *
   * @param query - search query string
   */
  getEmojiBySearchQuery(query: string): Promise<Emoji[]> {
    return Promise.resolve([])
  }

  /**
   * Return a single emoji matching the shortcode, or null if not found.
   *
   * The colons around the shortcode should not be included when querying, e.g.
   * use "slight_smile", not ":slight_smile:". Uppercase versus lowercase
   * does not matter. Empty/null strings throw an error.
   * @param shortcode
   */
  getEmojiByShortcode(shortcode: string): Promise<Emoji | null> {
    return Promise.resolve(null)
  }

  /**
   * Return a single emoji matching the unicode string, or null if not found.
   *
   * Empty/null strings throw an error.
   * @param unicode - unicode string
   */
  getEmojiByUnicode(unicode: string): Promise<Emoji | null> {
    return Promise.resolve(null)
  }

  /**
   * Get the user's preferred skin tone. Returns 0 if not found.
   */
  getPreferredSkinTone(): Promise<SkinTone> {
    return Promise.resolve(1)
  }

  /**
   * Set the user's preferred skin tone. Non-numbers throw an error.
   *
   * @param skinTone - preferred skin tone
   */
  setPreferredSkinTone(skinTone: SkinTone): Promise<void> {
    return Promise.resolve()
  }

  /**
   * Increment the favorite count for an emoji by one. The unicode string must be non-empty. It should
   * correspond to the base (non-skin-tone) unicode string from the emoji object.
   *
   * @param unicode - unicode of the emoji to increment
   */
  incrementFavoriteEmojiCount (unicode: string): Promise<void> {
    return Promise.resolve()
  }

  /**
   * Get the top favorite emoji in descending order. If there are no favorite emoji yet, returns an empty array.
   * @param n - maximum number of results to return
   */
  getTopFavoriteEmoji (n: number): Promise<Emoji[]> {
    return Promise.resolve([])
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