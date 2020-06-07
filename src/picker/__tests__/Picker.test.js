import { basicBeforeEach, basicAfterEach, ALL_EMOJI } from '../../database/__tests__/shared'
import { getByRole } from '@testing-library/dom'
import { Picker } from '../../../index.js'

beforeEach(basicBeforeEach)
afterEach(basicAfterEach)

describe('Picker tests', () => {
  test('basic picker test', async () => {
    const picker = new Picker({ props: { dataSource: ALL_EMOJI } })
    expect(getByRole(picker.shadowRoot.children[0], 'tab')).toBeInTheDocument()
  })
})
