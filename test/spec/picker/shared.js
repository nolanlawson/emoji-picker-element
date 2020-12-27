import {
  waitFor, getAllByRole,
  getByRole, fireEvent, queryAllByRole
} from '@testing-library/dom'

export const openSkintoneListbox = async (container, skipActiveElementCheck) => {
  await waitFor(() => expect(getByRole(container, 'button', { name: /Choose a skin tone/ }))
    .toBeVisible())
  expect(queryAllByRole(container, 'listbox', { name: 'Skin tones' })).toHaveLength(0)
  await fireEvent.click(getByRole(container, 'button', { name: /Choose a skin tone/ }))
  await waitFor(() => expect(getByRole(container, 'listbox', { name: 'Skin tones' })).toBeVisible())
  expect(getAllByRole(container, 'option')).toHaveLength(6)
  getByRole(container, 'option', { name: 'Default', selected: true }).focus()
  await waitFor(() => expect(getByRole(container, 'option', { name: 'Default', selected: true }))
    .toBeVisible())
}
