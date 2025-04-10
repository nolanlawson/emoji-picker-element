import { basicBeforeEach, basicAfterEach, ALL_EMOJI, truncatedEmoji, tick } from '../shared'
import * as testingLibrary from '@testing-library/dom'
import Picker from '../../../src/picker/PickerElement.js'
import userEvent from '@testing-library/user-event'
import { groups } from '../../../src/picker/groups'
import Database from '../../../src/database/Database'
import { getAccessibleName } from '../utils'
import { clear } from './shared.js'

const { waitFor, fireEvent } = testingLibrary
const { type } = userEvent

describe('Picker tests part 2', () => {
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

  test('press enter to make first search item active', async () => {
    type(getByRole('combobox'), 'monkey face')
    await waitFor(() => expect(getAllByRole('option')).toHaveLength(1))
    expect(getByRole('combobox').getAttribute('aria-activedescendant')).toBeFalsy()
    await tick(120)
    fireEvent.keyDown(getByRole('combobox'), { key: 'Enter', code: 'Enter' })
    await waitFor(() => (
      expect(getByRole('combobox').getAttribute('aria-activedescendant'))
        .toBe(getByRole('option', { name: /🐵/ }).getAttribute('id'))
    ), { timeout: 5000 })
  }, 10000)

  test('press enter on an empty search list', async () => {
    type(getByRole('combobox'), 'xxxyyyzzzhahaha')
    await waitFor(() => expect(queryAllByRole('option')).toHaveLength(0))
    expect(getByRole('combobox').getAttribute('aria-activedescendant')).toBeFalsy()
    await tick(120)
    fireEvent.keyDown(getByRole('combobox'), { key: 'Enter', code: 'Enter' })
    await tick(120)
    // should do nothing basically since there's nothing to search for
    expect(queryAllByRole('option')).toHaveLength(0)
    expect(getByRole('combobox').getAttribute('aria-activedescendant')).toBeFalsy()
  }, 10000)

  test('press enter to make first search item active - custom emoji', async () => {
    picker.customEmoji = [
      {
        name: 'donkey',
        shortcodes: ['donkey'],
        url: 'donkey.png',
        category: 'Ungulates'
      }
    ]

    await tick(120)
    type(getByRole('combobox'), 'donkey')
    await waitFor(() => expect(getAllByRole('option')).toHaveLength(1))
    expect(getByRole('combobox').getAttribute('aria-activedescendant')).toBeFalsy()
    await tick(120)
    fireEvent.keyDown(getByRole('combobox'), { key: 'Enter', code: 'Enter' })
    await waitFor(() => {
      return expect(getByRole('combobox').getAttribute('aria-activedescendant'))
        .toBe(getByRole('option', { name: /donkey/ }).getAttribute('id'))
    }, { timeout: 5000 })

    let emoji
    picker.addEventListener('emoji-click', event => {
      emoji = event.detail
    })

    fireEvent.keyDown(getByRole('combobox'), { key: 'Enter', code: 'Enter' })

    await waitFor(() => expect(emoji && emoji.name === 'donkey'))
  }, 10000)

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

  test('aria-selected is not rendered for role=menuitem', async () => {
    // aria-selected should not be set for role=menuitem
    for (const menuitem of getAllByRole('menuitem')) {
      expect(menuitem.getAttribute('aria-selected')).toBeNull()
    }

    // type in the search to switch from menuitems to options
    type(getByRole('combobox'), 'smile')
    await waitFor(() => expect(getAllByRole('option')).not.toHaveLength(0))

    // switch back
    clear(getByRole('combobox'))
    await waitFor(() => expect(queryAllByRole('option')).toHaveLength(0))

    // aria-selected should not be set for role=menuitem
    for (const menuitem of getAllByRole('menuitem')) {
      expect(menuitem.getAttribute('aria-selected')).toBeNull()
    }
  })
})
