import * as React from 'react'
import { CustomEmoji, EmojiClickEvent, I18n, CategorySortingFunction, SkinToneChangeEvent } from './shared'

export interface EmojiPickerProps {
    className?: string
    style?: React.CSSProperties
    locale?: string
    dataSource?: string
    skinToneEmoji?: string
    customCategorySorting?: CategorySortingFunction
    customEmoji?: CustomEmoji
    i18n?: I18n
    onEmojiClick?: (event: EmojiClickEvent) => void
    onSkinToneChange?: (event: SkinToneChangeEvent) => void
}

declare const EmojiPicker: (props: EmojiPickerProps) => JSX.Element

export default EmojiPicker