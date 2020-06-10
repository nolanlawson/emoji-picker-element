import { basicBeforeEach, basicAfterEach, ALL_EMOJI, tick, truncatedEmoji } from '../shared'
import { getAllByRole, getByRole } from '@testing-library/dom'
import Picker from '../../../src/picker/PickerElement.js'

describe('Picker tests', () => {
  beforeEach(basicBeforeEach)
  afterEach(basicAfterEach)

  test('basic picker test', async () => {
    expect(process.env.NODE_ENV).toBe('test')
    const picker = new Picker({ dataSource: ALL_EMOJI, locale: 'en' })
    document.body.appendChild(picker)
    const container = picker.shadowRoot.querySelector('.picker')
    await tick(20)
    expect(getByRole(container, 'button', { name: 'Choose a skin tone' })).toBeVisible()
    expect(getAllByRole(container, 'tab')).toHaveLength(9)

    const numInGroup1 = truncatedEmoji.filter(_ => _.group === 0).length
    // const numInGroup2 = truncatedEmoji.filter(_ => _.group === 1).length

    expect(getByRole(container, 'tab', { name: 'Smileys and emoticons', selected: true })).toBeVisible()
    expect(getAllByRole(container, 'menuitem')).toHaveLength(numInGroup1)

    expect(getByRole(container, 'tab', { name: 'People and body' })).toBeVisible()

    // fireEvent.click(getByRole(container, 'tab', { name: 'People and body' }))

    // expect(getByRole(container, 'tab', { name: 'People and body', selected: true })).toBeVisible()
    // expect(getAllByRole(container, 'menuitem')).toHaveLength(numInGroup2)

    await picker.database.delete()
  })
})
