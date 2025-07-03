// Regexps involved with splitting words in various case formats.
const SPLIT_LOWER_UPPER_RE = /([\p{Ll}\d])(\p{Lu})/gu;
const SPLIT_UPPER_UPPER_RE = /(\p{Lu})([\p{Lu}][\p{Ll}])/gu;
// Used to iterate over the initial split result and separate numbers.
const SPLIT_SEPARATE_NUMBER_RE = /(\d)\p{Ll}|(\p{L})\d/u;
// Regexp involved with stripping non-word characters from the result.
const DEFAULT_STRIP_REGEXP = /[^\p{L}\d]+/giu;
// The replacement value for splits.
const SPLIT_REPLACE_VALUE = "$1\0$2";
// The default characters to keep after transforming case.
const DEFAULT_PREFIX_SUFFIX_CHARACTERS = "";
/**
 * Split any cased input strings into an array of words.
 */
function split(value) {
    let result = value.trim();
    result = result
        .replace(SPLIT_LOWER_UPPER_RE, SPLIT_REPLACE_VALUE)
        .replace(SPLIT_UPPER_UPPER_RE, SPLIT_REPLACE_VALUE);
    result = result.replace(DEFAULT_STRIP_REGEXP, "\0");
    let start = 0;
    let end = result.length;
    // Trim the delimiter from around the output string.
    while (result.charAt(start) === "\0")
        start++;
    if (start === end)
        return [];
    while (result.charAt(end - 1) === "\0")
        end--;
    return result.slice(start, end).split(/\0/g);
}
/**
 * Split the input string into an array of words, separating numbers.
 */
function splitSeparateNumbers(value) {
    const words = split(value);
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const match = SPLIT_SEPARATE_NUMBER_RE.exec(word);
        if (match) {
            const offset = match.index + (match[1] ?? match[2]).length;
            words.splice(i, 1, word.slice(0, offset), word.slice(offset));
        }
    }
    return words;
}
/**
 * Convert a string to space separated lower case (`foo bar`).
 */
function noCase(input, options) {
    const [prefix, words, suffix] = splitPrefixSuffix(input, options);
    return (prefix +
        words.map(lowerFactory(options?.locale)).join(options?.delimiter ?? " ") +
        suffix);
}
/**
 * Convert a string to camel case (`fooBar`).
 */
function camelCase(input, options) {
    const [prefix, words, suffix] = splitPrefixSuffix(input, options);
    const lower = lowerFactory(options?.locale);
    const upper = upperFactory(options?.locale);
    const transform = options?.mergeAmbiguousCharacters
        ? capitalCaseTransformFactory(lower, upper)
        : pascalCaseTransformFactory(lower, upper);
    return (prefix +
        words
            .map((word, index) => {
            if (index === 0)
                return lower(word);
            return transform(word, index);
        })
            .join(options?.delimiter ?? "") +
        suffix);
}
/**
 * Convert a string to pascal case (`FooBar`).
 */
function pascalCase(input, options) {
    const [prefix, words, suffix] = splitPrefixSuffix(input, options);
    const lower = lowerFactory(options?.locale);
    const upper = upperFactory(options?.locale);
    const transform = options?.mergeAmbiguousCharacters
        ? capitalCaseTransformFactory(lower, upper)
        : pascalCaseTransformFactory(lower, upper);
    return prefix + words.map(transform).join(options?.delimiter ?? "") + suffix;
}
/**
 * Convert a string to pascal snake case (`Foo_Bar`).
 */
function pascalSnakeCase(input, options) {
    return capitalCase(input, { delimiter: "_", ...options });
}
/**
 * Convert a string to capital case (`Foo Bar`).
 */
function capitalCase(input, options) {
    const [prefix, words, suffix] = splitPrefixSuffix(input, options);
    const lower = lowerFactory(options?.locale);
    const upper = upperFactory(options?.locale);
    return (prefix +
        words
            .map(capitalCaseTransformFactory(lower, upper))
            .join(options?.delimiter ?? " ") +
        suffix);
}
/**
 * Convert a string to constant case (`FOO_BAR`).
 */
function constantCase(input, options) {
    const [prefix, words, suffix] = splitPrefixSuffix(input, options);
    return (prefix +
        words.map(upperFactory(options?.locale)).join(options?.delimiter ?? "_") +
        suffix);
}
/**
 * Convert a string to dot case (`foo.bar`).
 */
function dotCase(input, options) {
    return noCase(input, { delimiter: ".", ...options });
}
/**
 * Convert a string to kebab case (`foo-bar`).
 */
function kebabCase(input, options) {
    return noCase(input, { delimiter: "-", ...options });
}
/**
 * Convert a string to path case (`foo/bar`).
 */
function pathCase(input, options) {
    return noCase(input, { delimiter: "/", ...options });
}
/**
 * Convert a string to path case (`Foo bar`).
 */
function sentenceCase(input, options) {
    const [prefix, words, suffix] = splitPrefixSuffix(input, options);
    const lower = lowerFactory(options?.locale);
    const upper = upperFactory(options?.locale);
    const transform = capitalCaseTransformFactory(lower, upper);
    return (prefix +
        words
            .map((word, index) => {
            if (index === 0)
                return transform(word);
            return lower(word);
        })
            .join(options?.delimiter ?? " ") +
        suffix);
}
/**
 * Convert a string to snake case (`foo_bar`).
 */
function snakeCase(input, options) {
    return noCase(input, { delimiter: "_", ...options });
}
/**
 * Convert a string to header case (`Foo-Bar`).
 */
function trainCase(input, options) {
    return capitalCase(input, { delimiter: "-", ...options });
}
function lowerFactory(locale) {
    return locale === false
        ? (input) => input.toLowerCase()
        : (input) => input.toLocaleLowerCase(locale);
}
function upperFactory(locale) {
    return locale === false
        ? (input) => input.toUpperCase()
        : (input) => input.toLocaleUpperCase(locale);
}
function capitalCaseTransformFactory(lower, upper) {
    return (word) => `${upper(word[0])}${lower(word.slice(1))}`;
}
function pascalCaseTransformFactory(lower, upper) {
    return (word, index) => {
        const char0 = word[0];
        const initial = index > 0 && char0 >= "0" && char0 <= "9" ? "_" + char0 : upper(char0);
        return initial + lower(word.slice(1));
    };
}
function splitPrefixSuffix(input, options = {}) {
    const splitFn = options.split ?? (options.separateNumbers ? splitSeparateNumbers : split);
    const prefixCharacters = options.prefixCharacters ?? DEFAULT_PREFIX_SUFFIX_CHARACTERS;
    const suffixCharacters = options.suffixCharacters ?? DEFAULT_PREFIX_SUFFIX_CHARACTERS;
    let prefixIndex = 0;
    let suffixIndex = input.length;
    while (prefixIndex < input.length) {
        const char = input.charAt(prefixIndex);
        if (!prefixCharacters.includes(char))
            break;
        prefixIndex++;
    }
    while (suffixIndex > prefixIndex) {
        const index = suffixIndex - 1;
        const char = input.charAt(index);
        if (!suffixCharacters.includes(char))
            break;
        suffixIndex = index;
    }
    return [
        input.slice(0, prefixIndex),
        splitFn(input.slice(prefixIndex, suffixIndex)),
        input.slice(suffixIndex),
    ];
}

var changeCase = /*#__PURE__*/Object.freeze({
    __proto__: null,
    camelCase: camelCase,
    capitalCase: capitalCase,
    constantCase: constantCase,
    dotCase: dotCase,
    kebabCase: kebabCase,
    noCase: noCase,
    pascalCase: pascalCase,
    pascalSnakeCase: pascalSnakeCase,
    pathCase: pathCase,
    sentenceCase: sentenceCase,
    snakeCase: snakeCase,
    split: split,
    splitSeparateNumbers: splitSeparateNumbers,
    trainCase: trainCase
});

const processHeadColumns = (thead) => {
    const colsTh = thead.querySelectorAll("tr > th");
    // in case it's not standard
    const colsTd = thead.querySelectorAll("tr > td");
    const cols = colsTh.length ? colsTh : colsTd;
    return Array.from(cols).map(item => item.innerHTML);
};
const processBodyRows = (tbody) => {
    const rows = tbody.querySelectorAll("tr");
    return Array.from(rows).map(row => {
        return Array.from(row.querySelectorAll("td")).map(td => td.innerHTML);
    });
};
/**
 * Process data from standard table (no col/row span)
 * @param selector for querySelector
 * @param config
 */
const mapTable = (selector, config) => {
    const table = document.querySelector(selector);
    if (!table)
        return console.error(`No dom matched for selector: ${selector}`);
    let cols;
    const thead = table.querySelector("thead");
    if (thead) {
        cols = processHeadColumns(thead);
        const headCase = config?.headCase;
        if (headCase)
            cols = cols.map(col => changeCase[headCase](col));
    }
    let rows;
    const tbody = table.querySelector("tbody");
    if (tbody)
        rows = processBodyRows(tbody);
    if (rows?.length) {
        if (!cols)
            return rows;
        const indexLength = cols.length;
        const dataRows = [];
        const _cols = [...cols];
        rows.forEach(row => {
            const data = {};
            for (let i = 0; i < indexLength; i++) {
                data[_cols[i]] = row[i];
            }
            dataRows.push(data);
        });
        return dataRows;
    }
    return [];
};

export { mapTable };
