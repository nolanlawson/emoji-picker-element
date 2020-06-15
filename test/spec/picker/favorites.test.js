import {
  waitFor, getByTestId, getAllByRole,
  getByRole, fireEvent, queryAllByRole
} from '@testing-library/dom'
import { basicAfterEach, basicBeforeEach, tick, truncatedEmoji } from '../shared'
import Picker from '../../../src/picker/PickerElement'
import allData from 'emojibase-data/en/data.json'
import { MOST_COMMONLY_USED_EMOJI } from '../../../src/picker/constants'
import { uniqBy } from '../../../src/shared/uniqBy'
import { categories } from '../../../src/picker/categories'

describe('Favorites UI', () => {
  let picker
  let container

  beforeEach(async () => {
    basicBeforeEach()
    const dataSource = 'with-favs.json'

    const dataWithFavorites = uniqBy([
      ...truncatedEmoji,
      ...allData.filter(_ => MOST_COMMONLY_USED_EMOJI.includes(_.emoji))
    ], _ => _.emoji)

    fetch.get(dataSource, () => new Response(JSON.stringify(dataWithFavorites), { headers: { ETag: 'W/favs' } }))
    fetch.head(dataSource, () => new Response(null, { headers: { ETag: 'W/favs' } }))

    picker = new Picker({ dataSource, locale: 'en' })
    document.body.appendChild(picker)
    container = picker.shadowRoot.querySelector('.picker')

    await tick(20)
  })
  afterEach(async () => {
    basicAfterEach()
    await tick(20)
    await picker.database.delete()
    document.body.removeChild(picker)
  })

  test('Favorites UI basic test', async () => {
    // using a testId because testing-library seems to think role=menu has no aria-label
    const favoritesBar = getByTestId(container, 'favorites')
    expect(favoritesBar).toBeVisible()
    await waitFor(() => expect(getAllByRole(favoritesBar, 'menuitem')).toHaveLength(8))
    expect(getAllByRole(favoritesBar, 'menuitem').map(_ => _.getAttribute('data-emoji'))).toStrictEqual(
      MOST_COMMONLY_USED_EMOJI.slice(0, 8)
    )
    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /🤣/ })).toBeVisible())
    fireEvent.click(getByRole(container, 'menuitem', { name: /🤣/ }))
    await waitFor(() => expect(getAllByRole(favoritesBar, 'menuitem')
      .map(_ => _.getAttribute('data-emoji'))).toStrictEqual([
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

    await waitFor(() => expect(getAllByRole(container, 'tab')).toHaveLength(categories.length))

    // when setting custom emoji, they can appear in the favorites

    picker.customEmoji = customEmoji

    await waitFor(() => expect(getAllByRole(container, 'tab')).toHaveLength(categories.length + 1))

    expect(getByRole(container, 'tab', { name: 'Custom', selected: true })).toBeVisible()
    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /transparent/i })).toBeVisible())

    fireEvent.click(getByRole(container, 'menuitem', { name: /transparent/i }))
    fireEvent.click(getByRole(container, 'menuitem', { name: /black/i }))

    await waitFor(
      () => expect(getByRole(getByTestId(container, 'favorites'), 'menuitem', { name: /transparent/i })).toBeVisible
    )

    await waitFor(
      () => expect(getByRole(getByTestId(container, 'favorites'), 'menuitem', { name: /black/i })).toBeVisible
    )

    // when setting custom emoji back to [], the favorites bar removes the custom emoji
    picker.customEmoji = []

    await waitFor(() => expect(getAllByRole(container, 'tab')).toHaveLength(categories.length))

    await waitFor(
      () => expect(queryAllByRole(getByTestId(container, 'favorites'), 'menuitem', { name: /transparent/i })).toHaveLength(0)
    )
    await waitFor(
      () => expect(queryAllByRole(getByTestId(container, 'favorites'), 'menuitem', { name: /black/i })).toHaveLength(0)
    )
  })
})
