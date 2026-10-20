import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { strings } from '../i18n/strings'

const { he, en } = strings

async function openAbout() {
  const user = userEvent.setup()
  render(<App />)
  await user.click(screen.getByRole('button', { name: he.aboutButton }))
  return user
}

describe('About screen', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  it('shows the title, explanation and table title in Hebrew', async () => {
    await openAbout()
    expect(screen.getByRole('heading', { level: 1, name: he.aboutTitle })).toBeInTheDocument()
    expect(screen.getByText(he.aboutText)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: he.aboutTableTitle })).toBeInTheDocument()
  })

  it('renders a left-to-right 10×10 table with 100 correct results and row/column headers', async () => {
    await openAbout()
    const table = screen.getByRole('table', { name: he.aboutTableTitle })
    expect(table).toHaveAttribute('dir', 'ltr')

    const columnHeaders = within(table).getAllByRole('columnheader')
    expect(columnHeaders.map((th) => th.textContent)).toEqual(['×', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'])
    columnHeaders.forEach((th) => expect(th).toHaveAttribute('scope', 'col'))

    const bodyRows = table.querySelectorAll('tbody tr')
    expect(bodyRows).toHaveLength(10)
    expect(table.querySelectorAll('td')).toHaveLength(100)
    bodyRows.forEach((tr, r) => {
      const rowHeader = tr.querySelector('th')!
      expect(rowHeader).toHaveAttribute('scope', 'row')
      expect(rowHeader.textContent).toBe(String(r + 1))
      tr.querySelectorAll('td').forEach((td, c) => {
        expect(td.textContent).toBe(String((r + 1) * (c + 1)))
      })
    })
  })

  it('switches all texts to English and keeps the table left to right', async () => {
    const user = await openAbout()
    await user.click(screen.getByRole('button', { name: he.languageButton }))
    expect(screen.getByRole('heading', { level: 1, name: en.aboutTitle })).toBeInTheDocument()
    expect(screen.getByText(en.aboutText)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: en.back })).toBeInTheDocument()
    const table = screen.getByRole('table', { name: en.aboutTableTitle })
    expect(table).toHaveAttribute('dir', 'ltr')
    expect(document.documentElement.dir).toBe('ltr')
  })
})
