
// https://stackoverflow.com/a/64296576
export function splitLimit(/** @type {string} */ input,/** @type {string|RegExp} */  separator, /** @type {Number} */  limit) {
    // Ensure the separator is global
    if (!(separator instanceof RegExp) || !separator.global) {
        separator = new RegExp(separator, 'g');
    }
    // Allow the limit argument to be excluded
    limit = limit ?? -1;

    const output = [];
    let finalIndex = 0;

    while (--limit) {
        const lastIndex = separator.lastIndex;
        const search = separator.exec(input);
        if (search === null) {
            break;
        }
        finalIndex = separator.lastIndex;
        output.push(input.slice(lastIndex, search.index));
    }

    output.push(input.slice(finalIndex));

    return output;
}


// Returns whether an object has a given set of `key:value` pairs.
/**
 * @param {any} object
 * @param {Record<string, any>} attrs
 * @param {string} zone
 */
export function isNsMatch(object, attrs, zone) {
    var _keys = Object.keys(attrs);
    if (object == null) return !_keys.length;
    for (var i = 0; i < _keys.length; i++) {
        var key = _keys[i];
        if (attrs[key] === null) {
            continue;
        } else if (!(key in object)) {
            return false;
        } else if (["name", "host", "alias"].includes(key)) {
            // must compare in absolute
            if (turnNsToAbsolute(attrs[key], zone) !== turnNsToAbsolute(object[key], zone)) {
                return false;
            }
        } else {
            if (attrs[key] !== object[key]) return false;
        }
    }
    return true;
}

export const turnNsToAbsolute = (drec, zone) => {
    if (zone === "@") {
        // keep this to relative
        if (/\.@$/.test(drec)) {
            return drec.substring(0, drec.length - 2);
        } else {
            return drec;
        }
    } else {
        if (/\.$/.test(drec)) {
            return drec;
        } else if (/@$/.test(drec)) {
            return drec.substring(0, drec.length - 1) + zone;
        } else {
            return drec + "." + zone;
        }
    }
}

export const deleteIfExist = (/** @type {string} */ zone, /** @type {any[]} */ arr, /** @type {any} */ record) => {
    let idx, changecount = 0;
    while ((idx = arr.findIndex((x) => isNsMatch(x, record, zone))) != -1) {
        arr.splice(idx, 1);
        changecount++;
    }
    return changecount;
}
export const appendIfNotExist = (/** @type {string} */ zone,  /** @type {any[]} */ arr, /** @type {{}} */ record) => {
    const idx = arr.findIndex((x) => isNsMatch(x, record, zone));
    if (idx === -1) {
        arr.push(record);
        return 1;
    } else {
        return 0;
    }
}

export const mapKey = {
    'a': ( /** @type {string} */ name, /** @type {string} */ ip) => ({
        name,
        ip: ip || null,
    }),
    'aaaa': ( /** @type {string} */ name, /** @type {string} */ ip) => ({
        name,
        ip: ip || null,
    }),
    'ns': ( /** @type {string} */ name, /** @type {string} */ host) => ({
        name,
        host: host || null,
    }),
    'cname': ( /** @type {string} */ name, /** @type {string} */ alias) => ({
        name,
        alias: alias || null,
    }),
    'mx': ( /** @type {string} */ name, /** @type {string} */ preference, /** @type {string} */ host) => ({
        name,
        preference: preference == null ? null : parseInt(preference, 10),
        host: host || null,
    }),
    'ptr': ( /** @type {string} */ name, /** @type {string} */ host) => ({
        name,
        host: host || null,
    }),
    'txt': ( /** @type {string} */ name, /** @type {string[]} */ ...txt) => ({
        name,
        txt: txt.length == 0 || txt[0] === null ? null : joinByQuotes(txt),
    }),
    'srv': ( /** @type {string} */ name, /** @type {string} */ priority, /** @type {string} */ weight, /** @type {string} */ port, /** @type {string} */ target) => ({
        name,
        priority: priority == null ? null : parseInt(priority, 10),
        weight: weight == null ? null : parseInt(weight, 10),
        port: port == null ? null : parseInt(port, 10),
        target,
    }),
    'spf': ( /** @type {string} */ name, /** @type {string} */ s) => ({
        name,
        data: s || null,
    }),
    'caa': ( /** @type {string} */ name, /** @type {string} */ flags, /** @type {string} */ tag, /** @type {string} */ value) => ({
        name,
        flags: flags == null ? null : parseInt(flags, 10),
        tag: tag || null,
        value: value || null,
    }),
}

export const getArrayOf = ( /** @type {any} */ file, /** @type {keyof typeof mapKey | String} */ type) => {
    if (!mapKey[type])
        throw new Error('Unknown type ' + type);
    if (!file[type])
        file[type] = [];
    return file[type];
}

export const splitByQuotes = (input) => {
    if (input === null) {
        return [null];
    }

    const regex = /(?:[^\s"]+|"(?:\\.|[^"\\])*")+/g;
    const matches = input.match(regex) || [];

    return [...matches];
}

export function joinByQuotes(arr) {
    return arr.map(str => {
        if (/^".+"$/.test(str)) {
            return str;
        }
        return `"${str.replace(/"/g, '\\"')}"`;
    }).join(' ');
}