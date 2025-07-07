import * as changeCase from "change-case"

const processHeadColumns = (thead: HTMLTableSectionElement, mapType: TMapType) => {
    const colsTh = thead.querySelectorAll<HTMLTableCellElement>("tr > th")
    // in case it's not standard
    const colsTd = thead.querySelectorAll<HTMLTableCellElement>("tr > td")
    const cols = colsTh.length ? colsTh : colsTd
    const cellGetFunction = mapType === "html" ? getDomInnerHtml : getDomInnerText
    return Array.from(cols).map(cellGetFunction)
}

const processBodyRows = (tbody: HTMLTableSectionElement, mapType: TMapType) => {
    const rows = tbody.querySelectorAll("tr")
    const cellGetFunction = mapType === "html" ? getDomInnerHtml : getDomInnerText
    return Array.from(rows).map(row => {
        return Array.from(row.querySelectorAll("td")).map(cellGetFunction)
    })
}

const getDomInnerHtml = (d: HTMLTableCellElement) => d.innerHTML
const getDomInnerText = (d: HTMLTableCellElement) => d.innerText

type TSelector<T> = T extends keyof HTMLElementTagNameMap ? T : string

type TConfig = {
    headCase?: Exclude<keyof typeof changeCase, "split" | "splitSeparateNumbers">
    headMapType?: TMapType
    dataMapType?: TMapType
}

type TMapType = "html" | "text"

/**
 * Process data from standard table (no col/row span)
 * @param selector dom or selector for querySelector
 * @param config
 */
export const mapTable = <T>(selector: TSelector<T> | HTMLTableElement, config?: TConfig) => {
    const table = selector instanceof HTMLTableElement ? selector : document.querySelector(selector)
    if (!table) return console.error(`No dom matched for selector: ${selector}`)

    let cols: string[] | undefined
    const thead: HTMLTableSectionElement | null = table.querySelector("thead")
    if (thead) {
        cols = processHeadColumns(thead, config?.headMapType ?? "text")
        const headCase = config?.headCase
        if (headCase) cols = cols.map(col => changeCase[headCase](col))
    }

    let rows: any[][] | undefined
    const tbody: HTMLTableSectionElement | null = table.querySelector("tbody")
    if (tbody) rows = processBodyRows(tbody, config?.dataMapType || "text")


    if (rows?.length) {
        if (!cols) return rows
        const indexLength = cols.length
        const dataRows: { [index: string]: any }[] = []
        const _cols = [...cols]
        rows.forEach(row => {
            const data: { [index: string]: any } = {}
            for (let i = 0; i < indexLength; i++) {
                data[_cols[i]] = row[i]
            }
            dataRows.push(data)
        })
        return dataRows
    }
    return []
}
