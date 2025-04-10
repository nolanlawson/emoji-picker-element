import { basicBeforeEach, basicAfterEach, ALL_EMOJI, truncatedEmoji, tick } from '../shared'
import * as testingLibrary from '@testing-library/dom'
import Picker from '../../../src/picker/PickerElement.js'
import userEvent from '@testing-library/user-event'
import { groups } from '../../../src/picker/groups'
import Database from '../../../src/database/Database'
import { getAccessibleName } from '../utils'
import { checkEmojiEquals, openSkintoneListbox } from './shared'

const { waitFor, fireEvent } = testingLibrary
const { type } = userEvent

describe('Picker tests', () => {
  let picker
  let container

  const proxy = new Proxy(testingLibrary, {
    get (obj, prop) {
      return function (...args) {
        return obj[prop](container, ...args)
      }
    }
  })
  const { getAllByRole, getByRole, queryAllByRole, queryByRole } = proxy

  const activeElement = () => container.getRootNode().activeElement

  beforeEach(async () => {
    basicBeforeEach()
    picker = new Picker({ dataSource: ALL_EMOJI, locale: 'en' })
    document.body.appendChild(picker)
    container = picker.shadowRoot.querySelector('.picker')
    await tick(20)
    await waitFor(() => expect(
      testingLibrary.getAllByRole(getByRole('tabpanel'), 'menuitem')).toHaveLength(numInGroup1),
    { timeout: 2000 }
    )
    await tick(20)
  })
  afterEach(async () => {
    await tick(20)
    document.body.removeChild(picker)
    await tick(20)
    await new Database({ dataSource: ALL_EMOJI, locale: 'en' }).delete()
    await tick(20)
    await basicAfterEach()
  })

  const numInGroup1 = truncatedEmoji.filter(_ => _.group === 0).length
  const numInGroup2 = truncatedEmoji.filter(_ => _.group === 1).length

  test('basic picker test', async () => {
    await waitFor(() => expect(getByRole('button', { name: 'Choose a skin tone (currently Default)' })).toBeVisible())
    expect(getAllByRole('tab')).toHaveLength(groups.length)

    expect(getByRole('tab', { name: 'Smileys and emoticons', selected: true })).toBeVisible()
    await waitFor(() => expect(
      testingLibrary.getAllByRole(getByRole('tabpanel'), 'menuitem')).toHaveLength(numInGroup1)
    )

    expect(getByRole('tab', { name: 'People and body' })).toBeVisible()
    fireEvent.click(getByRole('tab', { name: 'People and body' }))

    await waitFor(() => expect(
      testingLibrary.getAllByRole(getByRole('tabpanel'), 'menuitem')).toHaveLength(numInGroup2))

    expect(getByRole('tab', { name: 'People and body', selected: true })).toBeVisible()
  })

  test('basic search test', async () => {
    expect(queryAllByRole('tab', { selected: true })).toHaveLength(1) // one tab selected at first
    await type(getByRole('combobox'), 'monk')

    await waitFor(() => expect(getAllByRole('option')).toHaveLength(3))

    expect(getByRole('option', { name: /🐵/ })).toBeVisible()
    expect(getByRole('option', { name: /🐒/ })).toBeVisible()
    expect(getByRole('option', { name: /🦧/ })).toBeVisible()
    expect(queryAllByRole('tab', { selected: true })).toHaveLength(0) // no tabs selected when searching
  })

  test('basic skintone test', async () => {
    let event
    picker.addEventListener('skin-tone-change', newEvent => {
      event = newEvent
    })

    await openSkintoneListbox(container)

    await waitFor(() => (
      expect(
        getByRole('option', { name: 'Default', selected: true }).id)
        .toBe(queryByRole('listbox', { name: 'Skin tones' }).getAttribute('aria-activedescendant'))
    )
    )

    const pressKeyAndExpectActiveOption = async (key, name) => {
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))) // delay
      await fireEvent.keyDown(activeElement(), { key, code: key })
      await waitFor(() => {
        const selectedOption = getByRole('option', { name, selected: true })
        return expect(selectedOption.id).toBe(
          queryByRole('listbox', { name: 'Skin tones' }).getAttribute('aria-activedescendant')
        )
      })
    }

    await pressKeyAndExpectActiveOption('ArrowDown', 'Light')
    await pressKeyAndExpectActiveOption('ArrowDown', 'Medium-Light')
    await pressKeyAndExpectActiveOption('ArrowUp', 'Light')
    await pressKeyAndExpectActiveOption('ArrowUp', 'Default')
    await pressKeyAndExpectActiveOption('ArrowUp', 'Dark')
    await pressKeyAndExpectActiveOption('ArrowDown', 'Default')
    await pressKeyAndExpectActiveOption('ArrowUp', 'Dark')
    await pressKeyAndExpectActiveOption('Home', 'Default')
    await pressKeyAndExpectActiveOption('Home', 'Default')
    await pressKeyAndExpectActiveOption('End', 'Dark')
    await pressKeyAndExpectActiveOption('End', 'Dark')

    await fireEvent.keyDown(activeElement(), { key: 'Enter', code: 'Enter' })

    await waitFor(() => expect(event && event.detail).toStrictEqual({ skinTone: 5 }))
    await waitFor(() => expect(queryAllByRole('listbox', { name: 'Skin tones' })).toHaveLength(0))
    expect(getByRole('button', { name: 'Choose a skin tone (currently Dark)' })).toBeVisible()

    // favorites has the skin tone
    await waitFor(() => (
      expect(queryAllByRole('menuitem').map(_ => _.getAttribute('aria-label')).some(_ => _.includes('👍🏿'))))
    )
    getByRole('tab', { name: 'People and body' }).click()

    // tabpanel emoji has the skin tone
    await waitFor(() => (
      expect(queryAllByRole('menuitem').map(_ => _.getAttribute('aria-label')).some(_ => _.includes('🖐🏿'))))
    )

    getByRole('button', { name: 'Choose a skin tone (currently Dark)' }).click()
    await waitFor(() => expect(queryAllByRole('listbox', { name: 'Skin tones' })).toHaveLength(1))
    getByRole('option', { name: 'Default' }).click()
    await waitFor(() => expect(event && event.detail).toStrictEqual({ skinTone: 0 }))
    expect(getByRole('button', { name: 'Choose a skin tone (currently Default)' })).toBeVisible()
  })

  test('skintone can be chosen with Enter key', async () => {
    expect(getByRole('button', { name: 'Choose a skin tone (currently Default)' })).toBeVisible()
    await openSkintoneListbox(container)
    await fireEvent.keyDown(activeElement(), { key: 'ArrowDown', code: 'ArrowDown' })
    await fireEvent.keyDown(activeElement(), { key: 'Enter', code: 'Enter' })
    await waitFor(() => expect(queryAllByRole('listbox', { name: 'Skin tones' })).toHaveLength(0))
    expect(getByRole('button', { name: 'Choose a skin tone (currently Light)' })).toBeVisible()
  })

  test('skintone can be chosen with Spacebar key', async () => {
    expect(getByRole('button', { name: 'Choose a skin tone (currently Default)' })).toBeVisible()
    await openSkintoneListbox(container)
    await fireEvent.keyDown(activeElement(), { key: 'ArrowDown', code: 'ArrowDown' })
    await fireEvent.keyDown(activeElement(), { key: 'ArrowDown', code: 'ArrowDown' })
    await fireEvent.keyDown(activeElement(), { key: ' ', code: ' ' })
    await fireEvent.keyUp(activeElement(), { key: ' ', code: ' ' })
    await waitFor(() => expect(queryAllByRole('listbox', { name: 'Skin tones' })).toHaveLength(0))
    expect(getByRole('button', { name: 'Choose a skin tone (currently Medium-Light)' })).toBeVisible()
  })

  test('Escape key dismisses skintone listbox', async () => {
    await openSkintoneListbox(container)
    await waitFor(() => (
      expect(
        getByRole('option', { name: 'Default', selected: true }).id)
        .toBe(queryByRole('listbox', { name: 'Skin tones' }).getAttribute('aria-activedescendant'))
    )
    )

    await fireEvent.keyDown(activeElement(), { key: 'Escape', code: 'Escape' })

    // listbox closes and skintone dropdown button becomes active element
    await waitFor(async () => (
      expect(await getAccessibleName(container, activeElement())).toEqual('Choose a skin tone (currently Default)'))
    )
    await waitFor(() => expect(queryAllByRole('listbox', { name: 'Skin tones' })).toHaveLength(0))
  })

  test('Click skintone button while picker is open', async () => {
    // this should not be possible since the picker covers the button when it's open,
    // but this is for test coverage, and just to be safe
    await openSkintoneListbox(container)
    await fireEvent.click(getByRole('button', { name: /Choose a skin tone/ }))

    // listbox closes
    await waitFor(() => expect(queryAllByRole('listbox', { name: 'Skin tones' })).toHaveLength(0))
  })

  test('nav keyboard test', async () => {
    getByRole('tab', { name: 'Smileys and emoticons', selected: true }).focus()

    const expectGroupLength = async group => {
      await waitFor(() => expect(testingLibrary.getAllByRole(getByRole('tabpanel'), 'menuitem'))
        .toHaveLength(truncatedEmoji.filter(_ => _.group === group).length))
    }

    const pressKeyAndExpectActiveTab = async (key, name, group) => {
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))) // delay
      await fireEvent.keyDown(activeElement(), { key, code: key })
      await fireEvent.click(activeElement())
      await waitFor(() => expect(getByRole('tab', { name, selected: true })).toBe(activeElement()))
      await expectGroupLength(group)
    }

    await expectGroupLength(0)
    await pressKeyAndExpectActiveTab('ArrowLeft', 'Smileys and emoticons', 0)
    await pressKeyAndExpectActiveTab('ArrowRight', 'People and body', 1)
    await pressKeyAndExpectActiveTab('ArrowRight', 'Animals and nature', 3)
    await pressKeyAndExpectActiveTab('ArrowLeft', 'People and body', 1)
    await pressKeyAndExpectActiveTab('ArrowRight', 'Animals and nature', 3)
    await pressKeyAndExpectActiveTab('ArrowRight', 'Food and drink', 4)
    await pressKeyAndExpectActiveTab('ArrowRight', 'Travel and places', 5)
    await pressKeyAndExpectActiveTab('ArrowRight', 'Activities', 6)
    await pressKeyAndExpectActiveTab('ArrowRight', 'Objects', 7)
    await pressKeyAndExpectActiveTab('ArrowRight', 'Symbols', 8)
    await pressKeyAndExpectActiveTab('ArrowRight', 'Flags', 9)
    await pressKeyAndExpectActiveTab('ArrowRight', 'Flags', 9)
    await pressKeyAndExpectActiveTab('Home', 'Smileys and emoticons', 0)
    await pressKeyAndExpectActiveTab('Home', 'Smileys and emoticons', 0)
    await pressKeyAndExpectActiveTab('End', 'Flags', 9)
    await pressKeyAndExpectActiveTab('End', 'Flags', 9)
  })

  test('measures zwj emoji', async () => {
    getByRole('tab', { name: 'Flags' }).click()
    await tick(20)
    await waitFor(() => expect(testingLibrary.getAllByRole(getByRole('tabpanel'), 'menuitem'))
      .toHaveLength(truncatedEmoji.filter(_ => _.group === 9).length))
  })

  test('click emoji and get an event', async () => {
    let emoji
    picker.addEventListener('emoji-click', event => {
      emoji = event.detail
    })

    getByRole('menuitem', { name: /😀/ }).click()
    await waitFor(() => checkEmojiEquals(emoji, {
      emoji: {
        annotation: 'grinning face',
        group: 0,
        shortcodes: ['grinning', 'grinning_face'],
        tags: [
          'cheerful',
          'cheery',
          'face',
          'grin',
          'grinning',
          'happy',
          'laugh',
          'nice',
          'smile',
          'smiling',
          'teeth'

        ],
        unicode: '😀',
        version: 1
      },
      skinTone: 0,
      unicode: '😀'
    }))

    // choose a skin tone and then click an emoji where it would apply
    getByRole('button', { name: /Choose a skin tone/ }).click()
    await waitFor(() => expect(getByRole('option', { name: /Medium-Dark/ })).toBeVisible())
    getByRole('option', { name: /Medium-Dark/ }).click()
    await waitFor(
      () => expect(getByRole('button', { name: 'Choose a skin tone (currently Medium-Dark)' })).toBeVisible()
    )
    getByRole('tab', { name: /People/ }).click()
    await waitFor(() => expect(getByRole('menuitem', { name: /👍/ })).toBeVisible())
    getByRole('menuitem', { name: /👍/ }).click()
    await waitFor(() => checkEmojiEquals(emoji, {
      emoji: {
        annotation: 'thumbs up',
        group: 1,
        shortcodes: ['+1', 'thumbsup', 'yes'],
        tags: ['+1', 'good', 'hand', 'like', 'thumb', 'up', 'yes'],
        unicode: '👍️',
        version: 0.6,
        skins: [
          { tone: 1, unicode: '👍🏻', version: 1 },
          { tone: 2, unicode: '👍🏼', version: 1 },
          { tone: 3, unicode: '👍🏽', version: 1 },
          { tone: 4, unicode: '👍🏾', version: 1 },
          { tone: 5, unicode: '👍🏿', version: 1 }
        ]
      },
      skinTone: 4,
      unicode: '👍🏾'
    }))

    // then click one that has no skins
    getByRole('tab', { name: /Smileys/ }).click()
    await waitFor(() => expect(getByRole('menuitem', { name: /😀/ })).toBeVisible())
    getByRole('menuitem', { name: /😀/ }).click()
    await waitFor(() => checkEmojiEquals(emoji, {
      emoji: {
        annotation: 'grinning face',
        group: 0,
        shortcodes: ['grinning', 'grinning_face'],
        tags: [
          'cheerful',
          'cheery',
          'face',
          'grin',
          'grinning',
          'happy',
          'laugh',
          'nice',
          'smile',
          'smiling',
          'teeth'
        ],
        unicode: '😀',
        version: 1
      },
      skinTone: 4,
      unicode: '😀'
    }))
  })

  test('press up/down on search input', async () => {
    type(getByRole('combobox'), 'monk')
    await waitFor(() => expect(getAllByRole('option')).toHaveLength(3))

    const pressKeyAndExpectAriaDescendant = async (key, emoji) => {
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))) // delay
      fireEvent.keyDown(getByRole('combobox'), { key, code: key })
      await waitFor(() => {
        return expect(getByRole('combobox').getAttribute('aria-activedescendant'))
          .toBe(getByRole('option', { name: new RegExp(emoji) }).getAttribute('id'))
      })
    }

    await pressKeyAndExpectAriaDescendant('ArrowDown', '🐵')
    await pressKeyAndExpectAriaDescendant('ArrowDown', '🐒')
    await pressKeyAndExpectAriaDescendant('ArrowDown', '🦧')
    await pressKeyAndExpectAriaDescendant('ArrowDown', '🐵')
    await pressKeyAndExpectAriaDescendant('ArrowUp', '🦧')
    await pressKeyAndExpectAriaDescendant('ArrowUp', '🐒')
    await pressKeyAndExpectAriaDescendant('ArrowUp', '🐵')
    await pressKeyAndExpectAriaDescendant('ArrowDown', '🐒')

    let emoji
    picker.addEventListener('emoji-click', event => {
      emoji = event.detail
    })

    fireEvent.keyDown(activeElement(), { key: 'Enter', code: 'Enter' })
    await waitFor(() => checkEmojiEquals(emoji, {
      emoji: {
        annotation: 'monkey',
        group: 3,
        shortcodes: ['monkey'],
        tags: ['animal', 'banana'],
        unicode: '🐒',
        version: 0.6
      },
      skinTone: 0,
      unicode: '🐒'
    }))
  })
})
