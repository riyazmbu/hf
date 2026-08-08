export function parseRows(tableData) {
  if (!tableData || !tableData.rows) return []

  return tableData.rows.map((row) =>
    (row.c || []).map((cell) => {
      if (!cell) return ''
      return cell.f ? cell.f : cell.v !== null && cell.v !== undefined ? cell.v : ''
    })
  )
}

export function findRowByKeyword(rows, phrase) {
  const target = phrase.toLowerCase().replace(/[^a-z0-9]/g, '')

  return (
    rows.find((row) =>
      row.some((cell) => String(cell).toLowerCase().replace(/[^a-z0-9]/g, '').includes(target))
    ) || []
  )
}

export function parseChangePercent(changeStr) {
  const cleaned = String(changeStr || '').replace(/[^0-9.-]/g, '')
  const num = parseFloat(cleaned)
  return Number.isNaN(num) ? 0 : num
}
