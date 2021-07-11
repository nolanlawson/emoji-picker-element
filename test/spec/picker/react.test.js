import React from 'react'
import { cleanup, render } from '@testing-library/react'
import EmojiPicker from '../../../src/react/index.js'
import { ALL_EMOJI, basicAfterEach, basicBeforeEach, tick } from '../shared'
import { getByRole, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

describe('react', () => {
  beforeEach(() => {
    basicBeforeEach()
  })

  afterEach(async () => {
    basicAfterEach()
    cleanup()
    await tick(20)
  })

  test('basic', async () => {
    render(React.createElement(EmojiPicker))

    await tick(20)
    const container = document.body.querySelector('emoji-picker').shadowRoot.querySelector('.picker')
    await waitFor(() => expect(getByRole(container, 'tab', { name: 'Smileys and emoticons', selected: true })).toBeVisible())
    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /😀/ })).toBeVisible())
  })

  test('styles and class', async () => {
    render(React.createElement(EmojiPicker, { className: 'dark', style: { '--num-columns': 6 } }))
    await tick(20)
    const picker = document.body.querySelector('emoji-picker')
    expect([...picker.classList]).toEqual(['dark'])
    expect(getComputedStyle(picker).getPropertyValue('--num-columns')).toEqual('6')
  })

  test('properties', async () => {
    render(React.createElement(EmojiPicker, { dataSource: ALL_EMOJI, skinToneEmoji: '👍' }))
    await tick(20)

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(ALL_EMOJI, undefined)

    const container = document.body.querySelector('emoji-picker').shadowRoot.querySelector('.picker')
    await waitFor(() => expect(getByRole(container, 'button', { name: /Choose a skin tone/ }).innerHTML).toContain('👍'))
  })

  test('listeners', async () => {
    let clicked = false
    const onEmojiClick = () => {
      clicked = true
    }
    render(React.createElement(EmojiPicker, { onEmojiClick }))
    await tick(20)

    const container = document.body.querySelector('emoji-picker').shadowRoot.querySelector('.picker')

    await userEvent.click(getByRole(container, 'menuitem', { name: /😀/ }))
    await waitFor(() => expect(clicked).toEqual(true))
  })
})
