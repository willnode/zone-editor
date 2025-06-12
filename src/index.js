import dns from "dns-zonefile";
import { appendIfNotExist, deleteIfExist, getArrayOf, mapKey, splitByQuotes, splitLimit, turnNsToAbsolute } from "./utils";
const { generate, parse } = dns;

/** 
 * @param {import("dns-zonefile").DNSZone} content mutable
 * @param {string[]} changes
 * @returns {Number}
*/
export function editNS(content, changes) {
    const changeList = changes.filter(x => typeof x === 'string').map(value => {
        if (!/^(add|del) /i.test(value)) {
            value = `add ${value}`;
        }
        const values = splitLimit(value + '', / /g, 4);
        if (values.length >= 3) {
            return {
                action: values[0],
                type: values[1],
                domain: values[2],
                value: values[3] || null,
            };
        }
    }).filter(x => !!x);

    var changecount = 0;
    const zone = content.soa.name;

    for (let mod of changeList) {
        var action = mod.action.toLowerCase();
        var type = mod.type.toLowerCase();
        var arr = getArrayOf(content, type);
        var domain = turnNsToAbsolute((mod.domain || '').toLowerCase(), zone);
        var map = mapKey[type](domain, ...splitByQuotes(mod.value));
        if (action === 'add') {
            changecount += appendIfNotExist(zone, arr, map);
        }
        if (action === 'del') {
            changecount += deleteIfExist(zone, arr, map);
        }
    }
    if (changecount === 0) {
        return 0;
    }
    content.soa.serial++;
    return changecount;
}

/** 
 * @param {string} content
 * @returns {import("dns-zonefile").DNSZone}
*/
export function parseNS(content) {
    return parse(content);
}

/** 
 * @param {string} content
 * @returns {import("dns-zonefile").DNSZone}
*/
export function generateNS(content, template = null) {
    return generate(content, template);
}
