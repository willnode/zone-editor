# BIND9 Zone Editor Library

![npm](https://img.shields.io/npm/v/@domcloud/zone-editor)

This library allows you to edit BIND9 zone file using list of text changes. Used by [DOM Cloud Bridge](https://github.com/domcloud/bridge/) for BIND9 DNS zone editing.

This library is ES only. [Open demo here](https://willnode.github.io/zone-editor/).

## Usage

```sh
npm install @domcloud/zone-editor
```

```js
import { parseNS, editNS, generateNS } from '@domcloud/zone-editor';
import fs from 'fs';

const path = '/var/named/example.com.hosts';
const input = fs.readFileSync(path, { encoding: 'utf8' });
const data = parseNS(str);
const changes = ['del txt @', 'add txt @ foo=bar baz'];
if (editNS(data, changes) > 0) { // return count of changes, data is mutable
    const result = generateNS(data); // optionally pass custom template here
    fs.writeFileSync(path, result);
}
```

## See also

+ [elgs/dns-zonefile](https://github.com/elgs/dns-zonefile)
