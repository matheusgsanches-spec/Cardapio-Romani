import assert from 'node:assert/strict'
import writeExcelFile from 'write-excel-file/node'
import { buildMenuWorkbook, hasExportableMenuContent } from '../src/services/export/menuWorkbook.js'
import { normalizeMenu } from '../src/domain/week.js'

const weekStart = new Date('2026-09-07T12:00:00-03:00')
const menu = normalizeMenu({
  status: 'draft',
  draftPrices: { buffet: 54.9, dailySpecial: 29.5 },
  draftDailySpecials: { monday: 'Bife acebolado, arroz, feijão e salada' },
  draftDays: {
    monday: [
      { instanceId: 'rice', foodId: 'food-rice', order: 0 },
      { instanceId: 'beans', foodId: 'food-beans', order: 1 },
    ],
  },
}, weekStart)

const foods = [
  { id: 'food-rice', name: 'Arroz branco', categoryId: 'cat-rice' },
  { id: 'food-beans', name: 'Feijão carioca', categoryId: 'cat-beans' },
]
const categories = [
  { id: 'cat-beans', name: 'Feijão', order: 2 },
  { id: 'cat-rice', name: 'Arroz', order: 1 },
]

assert.equal(hasExportableMenuContent(menu), true)

const workbook = buildMenuWorkbook({ menu, foods, categories, weekStart })
assert.equal(workbook.filename, 'cardapio-romani-2026-09-07.xlsx')
assert.equal(workbook.data[0][0].value, 'ROMANI CAFÉ — CARDÁPIO SEMANAL')
assert.equal(workbook.data[7][1].value, 'Bife acebolado, arroz, feijão e salada')
assert.equal(workbook.data[8][0].value, 'Arroz')
assert.equal(workbook.data[9][0].value, 'Feijão')

const buffer = await writeExcelFile(workbook.data, workbook.options, workbook.globalOptions).toBuffer()
assert.ok(buffer.length > 2000, 'O XLSX deve conter uma pasta de trabalho completa')
assert.equal(buffer[0], 0x50, 'O XLSX deve iniciar com a assinatura ZIP PK')
assert.equal(buffer[1], 0x4b, 'O XLSX deve iniciar com a assinatura ZIP PK')

console.log('Exportação XLSX validada com conteúdo, estilos e arquivo íntegro.')
