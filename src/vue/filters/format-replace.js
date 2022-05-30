export function changeStringByKeyword (str, searchStr, replaceStr) {
    if (searchStr.length === 0) return str;

    return str.split(searchStr).join(replaceStr);
}
