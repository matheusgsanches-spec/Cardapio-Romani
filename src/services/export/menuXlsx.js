import writeExcelFile from 'write-excel-file/browser'
import { buildMenuWorkbook } from './menuWorkbook.js'

export async function exportMenuXlsx(input) {
  const workbook = buildMenuWorkbook(input)
  await writeExcelFile(workbook.data, workbook.options, workbook.globalOptions).toFile(workbook.filename)
  return workbook.filename
}
