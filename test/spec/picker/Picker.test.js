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

    await waitFor(() => expect(getAllByRole('option')).toHaveLength(2))

    expect(getByRole('option', { name: /🐵/ })).toBeVisible()
    expect(getByRole('option', { name: /🐒/ })).toBeVisible()
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
        tags: ['face', 'grin'],
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
        tags: ['+1', 'hand', 'thumb', 'up'],
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
        tags: ['face', 'grin'],
        unicode: '😀',
        version: 1
      },
      skinTone: 4,
      unicode: '😀'
    }))
  })

  test('press up/down on search input', async () => {
    type(getByRole('combobox'), 'monk')
    await waitFor(() => expect(getAllByRole('option')).toHaveLength(2))

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
    await pressKeyAndExpectAriaDescendant('ArrowUp', '🐵')
    await pressKeyAndExpectAriaDescendant('ArrowUp', '🐒')

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
        tags: ['monkey'],
        unicode: '🐒',
        version: 0.6
      },
      skinTone: 0,
      unicode: '🐒'
    }))
  })

  test('press enter to make first search item active', async () => {
    await tick(20)
    type(getByRole('combobox'), 'monkey face')
    await waitFor(() => expect(getAllByRole('option')).toHaveLength(1))
    expect(getByRole('combobox').getAttribute('aria-activedescendant')).toBeFalsy()
    await tick(20)
    fireEvent.keyDown(getByRole('combobox'), { key: 'Enter', code: 'Enter' })
    await waitFor(() => (
      expect(getByRole('combobox').getAttribute('aria-activedescendant'))
        .toBe(getByRole('option', { name: /🐵/ }).getAttribute('id'))
    ), { timeout: 2000 })
  }, 5000)

  test('press enter to make first search item active - custom emoji', async () => {
    picker.customEmoji = [
      {
        name: 'donkey',
        shortcodes: ['donkey'],
        url: 'donkey.png',
        category: 'Ungulates'
      }
    ]

    type(getByRole('combobox'), 'donkey')
    await waitFor(() => expect(getAllByRole('option')).toHaveLength(1))
    expect(getByRole('combobox').getAttribute('aria-activedescendant')).toBeFalsy()
    fireEvent.keyDown(getByRole('combobox'), { key: 'Enter', code: 'Enter' })
    await waitFor(() => {
      return expect(getByRole('combobox').getAttribute('aria-activedescendant'))
        .toBe(getByRole('option', { name: /donkey/ }).getAttribute('id'))
    }, { timeout: 2000 })

    let emoji
    picker.addEventListener('emoji-click', event => {
      emoji = event.detail
    })

    fireEvent.keyDown(getByRole('combobox'), { key: 'Enter', code: 'Enter' })

    await waitFor(() => expect(emoji && emoji.name === 'donkey'))
  }, 5000)

  test('Closes skintone picker when blurred', async () => {
    fireEvent.click(getByRole('button', { name: /Choose a skin tone/ }))
    await waitFor(() => expect(getByRole('listbox', { name: 'Skin tones' })).toBeVisible())
    // Simulating a focusout event is hard, have to both focus and blur
    getByRole('combobox').focus()
    fireEvent.focusOut(getByRole('listbox', { name: 'Skin tones' }))
    await waitFor(() => expect(queryAllByRole('listbox', { name: 'Skin tones' })).toHaveLength(0))
  })

  test('Closes skintone picker when focus moves to skintone trigger button', async () => {
    const chooseSkintoneButton = getByRole('button', { name: /Choose a skin tone/ })
    fireEvent.click(chooseSkintoneButton)
    await waitFor(() => expect(getByRole('listbox', { name: 'Skin tones' })).toBeVisible())
    // Simulating a focusout event is hard, have to both focus and blur
    chooseSkintoneButton.focus()
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

    // confirm alphabetical order for categories
    expect(
      await Promise.all(getAllByRole('menu').map(node => getAccessibleName(container, node)))
    ).toStrictEqual(
      ['Custom', 'Primates', 'Ungulates', 'Favorites']
    )

    // try searching
    await type(getByRole('combobox'), 'donkey')
    await waitFor(() => expect(getByRole('option', { name: 'donkey' })).toBeVisible())
  })

  test('Custom emoji with sorted categories and no shortcodes', async () => {
    picker.customEmoji = [
      {
        name: 'monkey',
        url: 'monkey.png',
        category: 'Primates'
      },
      {
        name: 'donkey',
        url: 'donkey.png',
        category: 'Ungulates'
      },
      {
        name: 'horse',
        url: 'horse.png',
        category: 'Ungulates'
      },
      {
        name: 'bird',
        url: 'bird.png',
        category: 'Avians'
      },
      {
        name: 'human',
        url: 'human.png'
      }
    ]
    await waitFor(() => expect(getAllByRole('tab')).toHaveLength(groups.length + 1))
    await waitFor(() => expect(getAllByRole('menu')).toHaveLength(5)) // favorites + four custom categories

    // confirm alphabetical order for categories
    expect(
      await Promise.all(getAllByRole('menu').map(node => getAccessibleName(container, node)))
    ).toStrictEqual([
      'Custom',
      'Avians',
      'Primates',
      'Ungulates',
      'Favorites'
    ])

    const order = ['Ungulates', 'Primates', 'Avians']
    picker.customCategorySorting = (a, b) => {
      const aIdx = order.indexOf(a)
      const bIdx = order.indexOf(b)
      return aIdx < bIdx ? -1 : 1
    }

    await waitFor(async () => (
      expect(
        await Promise.all(getAllByRole('menu').map(node => getAccessibleName(container, node)))
      ).toStrictEqual([
        'Custom',
        ...order,
        'Favorites'
      ])
    ))
  })

  test('Custom emoji with all the same category', async () => {
    picker.customEmoji = [
      {
        name: 'sheep',
        url: 'sheep.png',
        category: 'Ungulates'
      },
      {
        name: 'deer',
        url: 'deer.png',
        category: 'Ungulates'
      },
      {
        name: 'pig',
        url: 'pig.png',
        category: 'Ungulates'
      },
      {
        name: 'horse',
        url: 'horse.png',
        category: 'Ungulates'
      },
      {
        name: 'donkey',
        url: 'donkey.png',
        category: 'Ungulates'
      },
      {
        name: 'rhinoceros',
        url: 'rhinoceros.png',
        category: 'Ungulates'
      }
    ]

    await waitFor(() => expect(getAllByRole('tab')).toHaveLength(groups.length + 1))
    await waitFor(() => expect(getAllByRole('menu')).toHaveLength(2)) // favorites + 1 custom categories

    await waitFor(async () => (
      expect(
        await Promise.all(getAllByRole('menu').map(node => getAccessibleName(container, node)))
      ).toStrictEqual([
        'Ungulates',
        'Favorites'
      ])
    ))

    // Visibility test, has nothing to do with accessibility. We visually show the label if there's a single category
    // and it's not the default "Custom" one.
    expect(container.querySelector('.category').textContent).toEqual('Ungulates')
    expect(container.querySelector('.category')).not.toHaveClass('gone')
  })

  test('Styles are working in Jest', async () => {
    const style = picker.shadowRoot.querySelector('style')
    expect(style.textContent).not.toEqual('')
  })
})
