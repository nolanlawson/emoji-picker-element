import { Emoji } from "./shared";
/**
 * Given an array of emoji (e.g. emojibase-data/en/data.json), extract out only the data
 * needed for emoji-picker-element, resulting in a smaller object.
 * @param emojiData
 * @deprecated - Not required when using emoji-picker-element-data rather than emojibase-data
 */
export default function trimEmojiData(emojiData: Emoji[]): Emoji[];
