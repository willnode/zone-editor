
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
        if (!(key in object)) {
            return false;
        } else if (["name", "host", "alias"].includes(key)) {
            // must compare in absolute
            if (turnNsToAbsolute(attrs[key], zone) !== turnNsToAbsolute(object[key], zone)) {
                return false;
            }
            // TODO: TXT
        } else {
            if (attrs[key] !== object[key]) return false;
        }
    }
    return true;
}

export const turnNsToAbsolute = (drec, zone) => {
    // must be absolute
    if (!drec.endsWith('.')) {
        if (drec.endsWith('@')) {
            drec = drec.substring(0, drec.length - 1);
        }
        drec += zone;
    }
    return drec;
}

export const deleteIfExist = (/** @type {string} */ zone, /** @type {any[]} */ arr, /** @type {any} */ record) => {
    const idx = arr.findIndex((x) => isNsMatch(x, record, zone));
    if (idx === -1) {
        return false;
    } else {
        arr.splice(idx, 1);
        return true;
    }
}
export const appendIfNotExist = (/** @type {string} */ zone,  /** @type {any[]} */ arr, /** @type {{}} */ record) => {
    const idx = arr.findIndex((x) => isNsMatch(x, record, zone));
    if (idx === -1) {
        arr.push(record);
        return true;
    } else {
        return false;
    }
}

const arrayKey = {
    A: 'a',
    AAAA: 'aaaa',
    NS: 'ns',
    CNAME: 'cname',
    MX: 'mx',
    PTR: 'ptr',
    TXT: 'txt',
    SRV: 'srv',
    SPF: 'spf',
    CAA: 'caa',
};

export const mapKey = {
    'a': ( /** @type {string} */ name, /** @type {string} */ ip) => ({
        name,
        ip
    }),
    'aaaa': ( /** @type {string} */ name, /** @type {string} */ ip) => ({
        name,
        ip
    }),
    'ns': ( /** @type {string} */ name, /** @type {string} */ host) => ({
        name,
        host
    }),
    'cname': ( /** @type {string} */ name, /** @type {string} */ alias) => ({
        name,
        alias
    }),
    'mx': ( /** @type {string} */ name, /** @type {string} */ preference, /** @type {string} */ host) => ({
        name,
        preference: parseInt(preference, 10),
        host,
    }),
    'ptr': ( /** @type {string} */ name, /** @type {string} */ host) => ({
        name,
        host
    }),
    'txt': ( /** @type {string} */ name, /** @type {string[]} */ ...txt) => ({
        name,
        txt: txt.join(' '),
    }),
    'srv': ( /** @type {string} */ name, /** @type {string} */ priority, /** @type {string} */ weight, /** @type {string} */ port, /** @type {string} */ target) => ({
        name,
        priority: parseInt(priority, 10),
        weight: parseInt(weight, 10),
        port: parseInt(port, 10),
        target,
    }),
    'spf': ( /** @type {string} */ name, /** @type {string} */ s) => ({
        name,
        data: s
    }),
    'caa': ( /** @type {string} */ name, /** @type {string} */ flags, /** @type {string} */ tag, /** @type {string} */ value) => ({
        name,
        flags: parseInt(flags, 10),
        tag,
        value: value.replace(new RegExp('^"(.+?)"$'), "$1"),
    }),
}

export const getArrayOf = ( /** @type {any} */ file, /** @type {keyof typeof arrayKey | String} */ type) => {
    if (!arrayKey[type])
        throw new Error('Unknown type ' + type);
    return file[arrayKey[type]] || (file[arrayKey[type]] = []);
}
