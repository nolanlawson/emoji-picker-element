import { Emoji, DatabaseConstructorOptions, SkinTone, CustomEmoji, NativeEmoji } from "./shared";
export default class Database {
    /**
     * Create a new Database.
     *
     * Note that multiple Databases pointing to the same locale will share the
     * same underlying IndexedDB connection and database.
     *
     * @param dataSource - URL to fetch the emoji data from
     * @param locale - Locale string
     * @param customEmoji - Array of custom emoji
     */
    constructor({ dataSource, locale, customEmoji }?: DatabaseConstructorOptions);
    /**
     * Resolves when the Database is ready, or throws an error if
     * the Database could not initialize.
     *
     * Note that you don't need to do this before calling other APIs – they will
     * all wait for this promise to resolve before doing anything.
     */
    ready(): Promise<void>;
    /**
     * Returns all emoji belonging to a group, ordered by `order`. Only returns native emoji;
     * custom emoji don't belong to a group.
     *
     * Non-numbers throw an error.
     * @param group - the group number
     */
    getEmojiByGroup(group: number): Promise<NativeEmoji[]>;
    /**
     * Returns all emoji matching the given search query, ordered by `order`.
     *
     * Empty/null strings throw an error.
     *
     * @param query - search query string
     */
    getEmojiBySearchQuery(query: string): Promise<Emoji[]>;
    /**
     * Return a single emoji matching the shortcode, or null if not found.
     *
     * The colons around the shortcode should not be included when querying, e.g.
     * use "slight_smile", not ":slight_smile:". Uppercase versus lowercase
     * does not matter. Empty/null strings throw an error.
     * @param shortcode
     */
    getEmojiByShortcode(shortcode: string): Promise<Emoji | null>;
    /**
     * Return a single native emoji matching the unicode string, or
     * a custom emoji matching the name, or null if not found.
     *
     * In the case of native emoji, the unicode string can be either the
     * main unicode string, or the unicode of one of the skin tone variants.
     *
     * Empty/null strings throw an error.
     * @param unicodeOrName - unicode (native emoji) or name (custom emoji)
     */
    getEmojiByUnicodeOrName(unicodeOrName: string): Promise<Emoji | null>;
    /**
     * Get the user's preferred skin tone. Returns 0 if not found.
     */
    getPreferredSkinTone(): Promise<SkinTone>;
    /**
     * Set the user's preferred skin tone. Non-numbers throw an error.
     *
     * @param skinTone - preferred skin tone
     */
    setPreferredSkinTone(skinTone: SkinTone): Promise<void>;
    /**
     * Increment the favorite count for an emoji by one. The unicode string must be non-empty. It should
     * correspond to the base (non-skin-tone) unicode string from the emoji object, or in the case of
     * custom emoji, it should be the name.
     *
     * @param unicodeOrName - unicode of a native emoji, or name of a custom emoji
     */
    incrementFavoriteEmojiCount(unicodeOrName: string): Promise<void>;
    /**
     * Get the top favorite emoji in descending order. If there are no favorite emoji yet, returns an empty array.
     * @param limit - maximum number of results to return
     */
    getTopFavoriteEmoji(limit: number): Promise<Emoji[]>;
    /**
     * Set the custom emoji for this database. Throws an error if custom emoji are not in the correct format.
     *
     *
     * @param customEmoji
     */
    set customEmoji(customEmoji: CustomEmoji[]);
    /**
     * Return the custom emoji associated with this Database, or the empty array if none.
     */
    get customEmoji(): CustomEmoji[];
    /**
     * Closes the underlying IndexedDB connection. The Database is not usable after that (or any other Databases
     * with the same locale).
     *
     * Note that as soon as any other non-close/delete method is called, the database will automatically reopen.
     *
     */
    close(): Promise<void>;
    /**
     * Deletes the underlying IndexedDB database. The Database is not usable after that (or any other Databases
     * with the same locale).
     *
     * Note that as soon as any other non-close/delete method is called, the database will be recreated.
     *
     */
    delete(): Promise<void>;
}
