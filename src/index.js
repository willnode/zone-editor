import dns from "dns-zonefile";
import { appendIfNotExist, deleteIfExist, getArrayOf, mapKey, splitByQuotes, splitLimit, turnNsToAbsolute } from "./utils";
const { generate, parse } = dns;

/**
 * @import {DNSZone} from 'dns-zonefile'
 * @typedef {string | {action: 'add'|'del', type: string, domain: string, value: string|null}} DNSChange
 */

/** 
 * @param {DNSZone} content mutable
 * @param {DNSChange[]} changes
 * @returns {Number}
*/
export function editNS(content, changes) {
    const changeList = changes.map(value => {
        if (typeof value !== 'string') return value;
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
    }).filter(x => x && typeof x === 'object');

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
 * @returns {DNSZone}
*/
export function parseNS(content) {
    return parse(content);
}

/** 
 * @param {DNSZone} content
 * @param {string|null} template
 * @returns {string}
*/
export function generateNS(content, template = null) {
    return generate(content, template);
}
