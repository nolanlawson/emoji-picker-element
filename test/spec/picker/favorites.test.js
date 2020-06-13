import { waitFor, getByTestId, getAllByRole, getByRole, fireEvent } from '@testing-library/dom'
import { basicAfterEach, basicBeforeEach, tick, truncatedEmoji } from '../shared'
import Picker from '../../../src/picker/PickerElement'
import allData from 'emojibase-data/en/data.json'
import { MOST_COMMONLY_USED_EMOJI } from '../../../src/picker/constants'
import { uniqBy } from '../../../src/shared/uniqBy'

describe('Favorites UI', () => {
  beforeEach(basicBeforeEach)
  afterEach(basicAfterEach)

  test('Favorites UI basic test', async () => {
    const dataSource = 'with-favs.json'

    const dataWithFavorites = uniqBy([
      ...truncatedEmoji,
      ...allData.filter(_ => MOST_COMMONLY_USED_EMOJI.includes(_.emoji))
    ], _ => _.emoji)

    fetch.get(dataSource, () => new Response(JSON.stringify(dataWithFavorites), { headers: { ETag: 'W/favs' } }))
    fetch.head(dataSource, () => new Response(null, { headers: { ETag: 'W/favs' } }))

    const picker = new Picker({ dataSource, locale: 'en' })
    document.body.appendChild(picker)
    const container = picker.shadowRoot.querySelector('.picker')

    await tick(20)

    // using a testId because testing-library seems to think role=menu has no aria-label
    const favoritesBar = getByTestId(container, 'favorites')
    expect(favoritesBar).toBeVisible()
    await waitFor(() => expect(getAllByRole(favoritesBar, 'menuitem')).toHaveLength(8))
    expect(getAllByRole(favoritesBar, 'menuitem').map(_ => _.getAttribute('data-emoji'))).toStrictEqual(
      MOST_COMMONLY_USED_EMOJI.slice(0, 8)
    )
    fireEvent.click(getByRole(container, 'menuitem', { name: /🤣/ }))
    await waitFor(() => expect(getAllByRole(favoritesBar, 'menuitem')
      .map(_ => _.getAttribute('data-emoji'))).toStrictEqual([
      '🤣',
      ...MOST_COMMONLY_USED_EMOJI.slice(0, 7)
    ]
    ))

    await tick(20)
    await picker.database.delete()
    document.body.removeChild(picker)
  })
})
