import * as changeCase from "change-case";
type TSelector<T> = T extends keyof HTMLElementTagNameMap ? T : string;
type TConfig = {
    headCase?: Exclude<keyof typeof changeCase, "split" | "splitSeparateNumbers">;
};
/**
 * Process data from standard table (no col/row span)
 * @param selector for querySelector
 * @param config
 */
export declare const mapTable: <T>(selector: TSelector<T>, config?: TConfig) => void | any[][] | {
    [index: string]: any;
}[];
export {};
