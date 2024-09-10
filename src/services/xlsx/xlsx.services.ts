import { Response } from 'express'
import { isNil } from 'lodash'
import { utils, write } from 'xlsx'
import { UserProjectFormFormat } from '../../typings'
export class XlsxService {
  private static instance: XlsxService

  createFile(form: { [key: string]: UserProjectFormFormat }, res: Response): void {
    const wb = utils.book_new()
    for (const id in form)
      if (Object.hasOwnProperty.call(form, id)) {
        const value = form[id]
        const ws = utils.json_to_sheet<any>(value.data)
        const wscols = this.fitToColumn(value.maxCharByCell)
        ws['!cols'] = [{ wch: 40 }, ...wscols]
        utils.book_append_sheet(wb, ws, value.formName)
      }

    const buf = write(wb, { bookType: 'xlsx', type: 'buffer' })
    res.writeHead(200, {
      'Cache-Control': 'max-age=3600, private',
      'Content-Length': buf.length,
      'Content-Disposition': `attachment;filename=${new Date().valueOf()}.xlsx`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    return res.end(buf)
  }

  fitToColumn(maxCharByCell: { [key: string]: number }) {
    const data = [] as { wch: number }[]
    for (const id in maxCharByCell)
      if (Object.hasOwnProperty.call(maxCharByCell, id)) {
        const value = maxCharByCell[id]
        data.push({ wch: value < 40 ? 40 : value })
      }

    return data
  }

  public static get Instance() {
    if (isNil(this.instance))
      this.instance = new this()

    return this.instance
  }
}
