import {
  waitFor, getAllByRole,
  getByRole, fireEvent, queryAllByRole
} from '@testing-library/dom'

export async function openSkintoneListbox (container) {
  await waitFor(() => expect(getByRole(container, 'button', { name: /Choose a skin tone/ }))
    .toBeVisible())
  expect(queryAllByRole(container, 'listbox', { name: 'Skin tones' })).toHaveLength(0)
  await fireEvent.click(getByRole(container, 'button', { name: /Choose a skin tone/ }))
  await waitFor(() => expect(getByRole(container, 'listbox', { name: 'Skin tones' })).toBeVisible())
  expect(getAllByRole(container, 'option')).toHaveLength(6)
  getByRole(container, 'option', { name: 'Default', selected: true }).focus()
  await waitFor(() => expect(getByRole(container, 'option', { name: 'Default', selected: true }))
    .toBeVisible())
  // JSDom doesn't fire transitionend events, so we do it manually here
  // https://github.com/jsdom/jsdom/issues/1781#issuecomment-467935000
  fireEvent(getByRole(container, 'listbox', { name: 'Skin tones' }), new Event('transitionend'))

  await waitFor(() => (
    expect(container.getRootNode().activeElement)
      .toBe(getByRole(container, 'listbox', { name: 'Skin tones' }))
  ))
}

export function checkEmojiEquals (actual, expected) {
  actual = JSON.parse(JSON.stringify(actual))
  expect(actual.emoji.order).toBeGreaterThan(0)
  delete actual.emoji.order // could change from version to version
  expect(actual).toStrictEqual(expected)
}
