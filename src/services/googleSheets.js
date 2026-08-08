import { NEWS_SHEET_ID, NEWS_SHEET_TAB } from '../constants/market'

export function fetchTopNews() {
  const tq = encodeURIComponent('SELECT * LIMIT 4')
  const url = `https://docs.google.com/spreadsheets/d/${NEWS_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
    NEWS_SHEET_TAB
  )}&tq=${tq}&_=${Date.now()}`

  return fetch(url)
    .then((response) => response.text())
    .then((text) => {
      const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([^]+)\);?$/)
      if (!jsonMatch) return []

      const data = JSON.parse(jsonMatch[1])
      const table = data.table
      if (!table || !table.rows) return []

      const getVal = (row, idx) => {
        const cell = row.c[idx]
        return cell && cell.v !== null && cell.v !== undefined ? String(cell.v).trim() : ''
      }

      return table.rows
        .map((row) => ({
          dt: getVal(row, 0),
          name: getVal(row, 1),
          headline: getVal(row, 2),
        }))
        .filter((item) => item.headline)
    })
    .catch(() => [])
}

export function dispatchGoogleSheetRequest({ spreadsheetId, sheet, handler }) {
  const nonceUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?sheet=${encodeURIComponent(
    sheet
  )}&tqx=responseHandler:${handler}&cb=${Date.now()}`
  const targetScript = document.createElement('script')
  targetScript.src = nonceUrl
  targetScript.onload = () => targetScript.remove()

  const residual = document.getElementById(`scr_${handler}`)
  if (residual) residual.remove()

  targetScript.id = `scr_${handler}`
  document.body.appendChild(targetScript)
}
