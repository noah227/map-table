const processHeadColumns = (thead: HTMLTableSectionElement) => {
    const colsTh = thead.querySelectorAll("tr > th")
    // in case it's not standard
    const colsTd = thead.querySelectorAll("tr > td")
    const cols = colsTh.length ? colsTh : colsTd
    return Array.from(cols).map(item => item.innerHTML)
}

const processBodyRows = (tbody: HTMLTableSectionElement) => {
    const rows = tbody.querySelectorAll("tr")
    return Array.from(rows).map(row => {
        return Array.from(row.querySelectorAll("td")).map(td => td.innerHTML)
    })
}
type TSelector<T> = T extends keyof HTMLElementTagNameMap ? T : string
/**
 * Process data from standard table (no col/row span)
 * @param selector
 */
export const mapTable = <T>(selector: TSelector<T>) => {
    const table = document.querySelector(selector)
    if (!table) return console.error(`No dom matched for selector: ${selector}`)

    let cols: string[] | undefined
    const thead: HTMLTableSectionElement | null = table.querySelector("thead")
    if (thead) cols = processHeadColumns(thead)

    let rows: any[][] | undefined
    const tbody: HTMLTableSectionElement | null = table.querySelector("tbody")
    if (tbody) rows = processBodyRows(tbody)


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
