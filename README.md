# BIND9 Zone Editor Library

This library allows you to edit DNS using list of text changes. Used by [DOM Cloud Bridge](https://github.com/domcloud/bridge/) for BIND9 DNS zone editing.

This library is ES only. [Open demo here](https://willnode.github.io/zone-editor/).

## Usage

```sh
npm install @willnode/zone-editor
```

```js
import { parseNS, editNS, generateNS } from '@willnode/zone-editor';
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
