import {
  waitFor, getAllByRole,
  getByRole, fireEvent, queryAllByRole
} from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { basicAfterEach, basicBeforeEach, tick, truncatedEmoji } from '../shared'
import Picker from '../../../src/picker/PickerElement'
import allData from 'emoji-picker-element-data/en/emojibase/data.json'
import { MOST_COMMONLY_USED_EMOJI } from '../../../src/picker/constants'
import { uniqBy } from '../../../src/shared/uniqBy'
import { groups } from '../../../src/picker/groups'
import { mockGetAndHead } from '../mockFetch.js'
const { type } = userEvent

const dataSource = 'with-favs.json'

describe('Favorites UI', () => {
  let picker
  let container

  beforeEach(async () => {
    basicBeforeEach()

    const dataWithFavorites = uniqBy([
      ...truncatedEmoji,
      ...allData.filter(_ => MOST_COMMONLY_USED_EMOJI.includes(_.emoji))
    ], _ => _.emoji)

    mockGetAndHead(dataSource, dataWithFavorites, { headers: { ETag: 'W/favs' } })

    picker = new Picker({ dataSource, locale: 'en' })
    document.body.appendChild(picker)
    container = picker.shadowRoot.querySelector('.picker')

    await tick(40)
  })
  afterEach(async () => {
    await tick(40)
    document.body.removeChild(picker)
    await tick(40)
    await basicAfterEach()
  })

  async function remount () {
    await tick(40)
    document.body.removeChild(picker)
    await tick(40)
    document.body.appendChild(picker)
    container = picker.shadowRoot
    await tick(40)
  }

  test('Favorites UI basic test', async () => {
    let favoritesBar = getByRole(container, 'menu', { name: 'Favorites' })
    expect(favoritesBar).toBeVisible()
    await waitFor(() => expect(getAllByRole(favoritesBar, 'menuitem')).toHaveLength(8))
    expect(getAllByRole(favoritesBar, 'menuitem').map(_ => _.getAttribute('id').substring(4))).toStrictEqual(
      MOST_COMMONLY_USED_EMOJI.slice(0, 8)
    )
    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /🤣/ })).toBeVisible())
    fireEvent.click(getByRole(container, 'menuitem', { name: /🤣/ }))

    // have to unmount/remount to force a favorites refresh
    await remount()

    favoritesBar = getByRole(container, 'menu', { name: 'Favorites' })
    await waitFor(() => expect(getAllByRole(favoritesBar, 'menuitem')
      .map(_ => _.getAttribute('id').substring(4))).toStrictEqual([
      '🤣',
      ...MOST_COMMONLY_USED_EMOJI.slice(0, 7)
    ]
    ))
  })

  test('Favorites with custom emoji', async () => {
    const transparent = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    const black = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='

    const customEmoji = [
      {
        name: 'transparent',
        shortcodes: ['transparent'],
        url: transparent
      },
      {
        name: 'black',
        shortcodes: ['black'],
        url: black
      }
    ]

    await waitFor(() => expect(getAllByRole(container, 'tab')).toHaveLength(groups.length))

    // when setting custom emoji, they can appear in the favorites
    await tick(40)
    picker.customEmoji = customEmoji
    await tick(40)

    await waitFor(() => expect(getAllByRole(container, 'tab')).toHaveLength(groups.length + 1))

    expect(getByRole(container, 'tab', { name: 'Custom', selected: true })).toBeVisible()
    await tick(40)
    await waitFor(() => expect(queryAllByRole(container, 'menuitem', { name: /transparent/i })).toHaveLength(1), {
      timeout: 5000
    })
    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /transparent/i })).toBeVisible(), {
      timeout: 3000
    })

    fireEvent.click(getByRole(container, 'menuitem', { name: /transparent/i }))
    fireEvent.click(getByRole(container, 'menuitem', { name: /black/i }))

    // have to unmount/remount to force a favorites refresh
    await remount()

    await waitFor(
      () => expect(getByRole(getByRole(container, 'menu', { name: 'Favorites' }), 'menuitem', { name: /transparent/i })).toBeVisible
    )

    await waitFor(
      () => expect(getByRole(getByRole(container, 'menu', { name: 'Favorites' }), 'menuitem', { name: /black/i })).toBeVisible
    )

    // when setting custom emoji back to [], the favorites bar removes the custom emoji
    picker.customEmoji = []

    await waitFor(() => expect(getAllByRole(container, 'tab')).toHaveLength(groups.length))

    await waitFor(
      () => expect(queryAllByRole(getByRole(container, 'menu', { name: 'Favorites' }), 'menuitem', { name: /transparent/i })).toHaveLength(0)
    )
    await waitFor(
      () => expect(queryAllByRole(getByRole(container, 'menu', { name: 'Favorites' }), 'menuitem', { name: /black/i })).toHaveLength(0)
    )
  })

  test('press down on search input - does not affect favorites', async () => {
    type(getByRole(container, 'combobox'), 'monk')
    await waitFor(() => expect(getAllByRole(container, 'option')).toHaveLength(2))

    const pressKeyAndExpectAriaDescendant = async (key, emoji) => {
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))) // delay
      fireEvent.keyDown(getByRole(container, 'combobox'), { key, code: key })
      await waitFor(() => {
        return expect(getByRole(container, 'combobox').getAttribute('aria-activedescendant'))
          .toBe(getByRole(container, 'option', { name: new RegExp(emoji) }).getAttribute('id'))
      })
    }

    await pressKeyAndExpectAriaDescendant('ArrowDown', '🐵')

    // Only one emoji is selected in the main search results
    const region = getByRole(container, 'region', { name: 'Search results' })
    expect(queryAllByRole(region, 'option', {
      selected: true
    })).toHaveLength(1)

    // Favorites bar emoji are not selected when a search option is selected
    const favoritesBar = getByRole(container, 'menu', { name: 'Favorites' })
    expect(queryAllByRole(favoritesBar, 'menuitem')
      .filter(_ => _.getAttribute('aria-selected') === 'true')
    ).toHaveLength(0)
  })
})
