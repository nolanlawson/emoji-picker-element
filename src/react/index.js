import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import '../picker/PickerElement.js'

function EmojiPicker ({
  className,
  style,
  locale,
  dataSource,
  skinToneEmoji,
  customCategorySorting,
  customEmoji,
  i18n,
  onEmojiClick,
  onSkinToneChange
}) {
  const ref = useRef(null)

  const events = {
    'emoji-click': onEmojiClick,
    'skin-tone-change': onSkinToneChange
  }

  for (const [eventName, listener] of Object.entries(events)) {
    useEffect(() => {
      if (typeof listener !== 'undefined') {
        ref.current.addEventListener(eventName, listener)
      }
    }, [])
  }

  const props = {
    locale,
    dataSource,
    skinToneEmoji,
    customCategorySorting,
    customEmoji,
    i18n
  }

  for (const [propName, prop] of Object.entries(props)) {
    useEffect(() => {
      if (typeof prop !== 'undefined' && ref.current[propName] !== prop) {
        ref.current[propName] = prop
      }
    }, [prop])
  }

  return /* #__PURE__ */React.createElement('emoji-picker', { ref, class: className, style })
}

EmojiPicker.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  locale: PropTypes.string,
  dataSource: PropTypes.string,
  skinToneEmoji: PropTypes.string,
  customCategorySorting: PropTypes.function,
  customEmoji: PropTypes.object,
  i18n: PropTypes.object,
  onEmojiClick: PropTypes.function,
  onSkinToneChange: PropTypes.function
}

export default EmojiPicker
