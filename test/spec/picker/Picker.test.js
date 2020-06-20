import { basicBeforeEach, basicAfterEach, ALL_EMOJI, truncatedEmoji, tick } from '../shared'
import * as testingLibrary from '@testing-library/dom'
import Picker from '../../../src/picker/PickerElement.js'
import userEvent from '@testing-library/user-event'
import { groups } from '../../../src/picker/groups'
import Database from '../../../src/database/Database'

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
  const { getAllByRole, getByRole, queryAllByRole } = proxy

  const activeElement = () => container.getRootNode().activeElement

  beforeEach(async () => {
    basicBeforeEach()
    picker = new Picker({ dataSource: ALL_EMOJI, locale: 'en' })
    document.body.appendChild(picker)
    container = picker.shadowRoot.querySelector('.picker')
    await tick(20)
    await waitFor(() => expect(
      testingLibrary.getAllByRole(getByRole('tabpanel'), 'menuitem')).toHaveLength(numInGroup1)
    )
  })
  afterEach(async () => {
    await tick(20)
    document.body.removeChild(picker)
    await tick(20)
    await new Database({ dataSource: ALL_EMOJI, locale: 'en' }).delete()
    await tick(20)
    basicAfterEach()
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
    await type(getByRole('searchbox'), 'monk')

    await waitFor(() => expect(getAllByRole('option')).toHaveLength(2))

    expect(getByRole('option', { name: /🐵/ })).toBeVisible()
    expect(getByRole('option', { name: /🐒/ })).toBeVisible()
  })

  test('basic skintone test', async () => {
    let event
    picker.addEventListener('skin-tone-change', newEvent => {
      event = newEvent
    })
    await waitFor(() => expect(getByRole('button', { name: 'Choose a skin tone (currently Default)' })).toBeVisible())
    expect(queryAllByRole('listbox', { name: 'Skin tones' })).toHaveLength(0)
    await fireEvent.click(getByRole('button', { name: 'Choose a skin tone (currently Default)' }))
    await waitFor(() => expect(getByRole('listbox', { name: 'Skin tones' })).toBeVisible())
    expect(getAllByRole('option')).toHaveLength(6)
    getByRole('option', { name: 'Default', selected: true }).focus()
    await waitFor(() => expect(getByRole('option', { name: 'Default', selected: true })).toBe(activeElement()))

    const pressKeyAndExpectActiveOption = async (key, name) => {
      await fireEvent.keyDown(activeElement(), { key, code: key })
      await waitFor(() => expect(getByRole('option', { name, selected: true })).toBe(activeElement()))
    }

    await pressKeyAndExpectActiveOption('ArrowDown', 'Light', 1)
    await pressKeyAndExpectActiveOption('ArrowDown', 'Medium-Light', 2)
    await pressKeyAndExpectActiveOption('ArrowUp', 'Light', 1)
    await pressKeyAndExpectActiveOption('ArrowUp', 'Default', 0)
    await pressKeyAndExpectActiveOption('ArrowUp', 'Dark', 5)
    await pressKeyAndExpectActiveOption('ArrowDown', 'Default', 5)
    await pressKeyAndExpectActiveOption('ArrowUp', 'Dark', 5)

    await fireEvent.click(activeElement(), { key: 'Enter', code: 'Enter' })

    await waitFor(() => expect(event && event.detail).toStrictEqual({ skinTone: 5 }))
    await waitFor(() => expect(queryAllByRole('listbox', { name: 'Skin tones' })).toHaveLength(0))
    expect(getByRole('button', { name: 'Choose a skin tone (currently Dark)' })).toBeVisible()

    getByRole('button', { name: 'Choose a skin tone (currently Dark)' }).click()
    await waitFor(() => expect(queryAllByRole('listbox', { name: 'Skin tones' })).toHaveLength(1))
    getByRole('option', { name: 'Default' }).click()
    await waitFor(() => expect(event && event.detail).toStrictEqual({ skinTone: 0 }))
    expect(getByRole('button', { name: 'Choose a skin tone (currently Default)' })).toBeVisible()
  })

  test('nav keyboard test', async () => {
    getByRole('tab', { name: 'Smileys and emoticons', selected: true }).focus()

    const expectGroupLength = async group => {
      await waitFor(() => expect(testingLibrary.getAllByRole(getByRole('tabpanel'), 'menuitem'))
        .toHaveLength(truncatedEmoji.filter(_ => _.group === group).length))
    }

    const pressKeyAndExpectActiveTab = async (key, name, group) => {
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
    await waitFor(() => expect(emoji).toStrictEqual({
      emoji: {
        annotation: 'grinning face',
        group: 0,
        order: 1,
        shortcodes: ['gleeful'],
        tags: ['face', 'grin'],
        tokens: [':d', 'face', 'gleeful', 'grin', 'grinning'],
        unicode: '😀',
        version: 1,
        emoticon: ':D'
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
    await waitFor(() => expect(emoji).toStrictEqual({
      emoji: {
        annotation: 'thumbs up',
        group: 1,
        order: 280,
        shortcodes: ['thumbsup', '+1', 'yes'],
        tags: ['+1', 'hand', 'thumb', 'up'],
        tokens: ['+1', 'hand', 'thumb', 'thumbs', 'thumbsup', 'up', 'yes'],
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
    await waitFor(() => expect(emoji).toStrictEqual({
      emoji: {
        annotation: 'grinning face',
        group: 0,
        order: 1,
        shortcodes: ['gleeful'],
        tags: ['face', 'grin'],
        tokens: [':d', 'face', 'gleeful', 'grin', 'grinning'],
        unicode: '😀',
        version: 1,
        emoticon: ':D'
      },
      skinTone: 4,
      unicode: '😀'
    }))
  })

  test('press up/down on search input', async () => {
    type(getByRole('searchbox'), 'monk')
    await waitFor(() => expect(getAllByRole('option')).toHaveLength(2))

    const pressKeyAndExpectAriaDescendant = async (key, emoji) => {
      fireEvent.keyDown(getByRole('searchbox'), { key, code: key })
      await waitFor(() => expect(getByRole('searchbox').getAttribute('aria-activedescendant')).toBe(`emoji-${emoji}`))
    }

    await pressKeyAndExpectAriaDescendant('ArrowDown', '🐵')
    await pressKeyAndExpectAriaDescendant('ArrowDown', '🐒')
    await pressKeyAndExpectAriaDescendant('ArrowUp', '🐵')
    await pressKeyAndExpectAriaDescendant('ArrowUp', '🐒')

    let emoji
    picker.addEventListener('emoji-click', event => {
      emoji = event.detail
    })

    fireEvent.keyDown(activeElement(), { key: 'Enter', code: 'Enter' })
    await waitFor(() => expect(emoji).toStrictEqual({
      emoji: {
        annotation: 'monkey',
        group: 3,
        order: 2658,
        shortcodes: ['monkey'],
        tags: ['monkey'],
        tokens: ['monkey'],
        unicode: '🐒',
        version: 0.6
      },
      skinTone: 0,
      unicode: '🐒'
    }))
  })

  test('Closes skintone picker when blurred', async () => {
    fireEvent.click(getByRole('button', { name: /Choose a skin tone/ }))
    await waitFor(() => expect(getByRole('listbox', { name: 'Skin tones' })).toBeVisible())
    // Simulating a focusout event is hard, have to both focus and blur
    getByRole('searchbox').focus()
    fireEvent.focusOut(getByRole('listbox', { name: 'Skin tones' }))
    await waitFor(() => expect(queryAllByRole('listbox', { name: 'Skin tones' })).toHaveLength(0))
  })

  test('Custom emoji with categories', async () => {
    picker.customEmoji = [
      {
        name: 'monkey',
        shortcodes: ['monkey'],
        url: 'monkey.png',
        category: 'Primates'
      },
      {
        name: 'donkey',
        shortcodes: ['donkey'],
        url: 'donkey.png',
        category: 'Ungulates'
      },
      {
        name: 'horse',
        shortcodes: ['horse'],
        url: 'horse.png',
        category: 'Ungulates'
      },
      {
        name: 'human',
        shortcodes: ['human'],
        url: 'human.png'
      }
    ]
    await waitFor(() => expect(getAllByRole('tab')).toHaveLength(groups.length + 1))
    await waitFor(() => expect(getAllByRole('menu')).toHaveLength(4)) // favorites + three custom categories
    await waitFor(() => expect(getByRole('menuitem', { name: 'human' })).toBeVisible())
    await waitFor(() => expect(getByRole('menuitem', { name: 'donkey' })).toBeVisible())
    await waitFor(() => expect(getByRole('menuitem', { name: 'monkey' })).toBeVisible())
    await waitFor(() => expect(getByRole('menuitem', { name: 'horse' })).toBeVisible())
    // TODO: can't actually test the category names because they're only exposed as menus, and
    // testing-library doesn't seem to understand that menus can have aria-labels
  })
})
