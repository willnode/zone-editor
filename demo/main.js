
import yaml from 'js-yaml';
import { editNS, generateNS, parseNS } from '../src';

let inputEditor, changesEditor, resultEditor, changesLabel, diffCheckbox, diffBefore, diffAfter;

const theme = 'vs-dark';

/**
 * @param {import('monaco-editor').editor} editor 
 */
function setupEditors(editor) {
    inputEditor = editor.create(document.getElementById('input-editor'), {
        value: `$TTL 86400  ; Default TTL (1 day)
@   IN  SOA ns1.example.com. admin.example.com. (
        2025061101 ; Serial (YYYYMMDDnn)
        3600       ; Refresh (1 hour)
        1800       ; Retry (30 minutes)
        1209600    ; Expire (14 days)
        86400      ; Minimum (1 day)
)

; Name Servers
    IN  NS      ns1.example.com.
    IN  NS      ns2.example.com.

; Root Domain A/AAAA records
@           IN  A       192.0.2.1
@           IN  AAAA    2001:db8::1

; Name Server IPs
ns1         IN  A       192.0.2.10
ns2         IN  A       192.0.2.11

; Web Services
www         IN  A       192.0.2.2
www         IN  AAAA    2001:db8::2

; Mail Services
mail        IN  A       192.0.2.3
imap        IN  CNAME   mail.example.com.
smtp        IN  CNAME   mail.example.com.

; MX Records (Mail exchange)
@           IN  MX 10   mail.example.com.
@           IN  MX 20   mail2.example.com.
mail2       IN  A       192.0.2.4

; CNAMEs
ftp         IN  CNAME   www.example.com.
blog        IN  CNAME   www.example.com.

; SPF
@           IN  TXT     "v=spf1 ip4:192.0.2.0/24 include:_spf.google.com -all"

; DKIM (example selector "default")
default._domainkey IN TXT "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtestpublickey1234567..."

; DMARC
_dmarc      IN TXT     "v=DMARC1; p=reject; rua=mailto:dmarc@example.com"

; CAA (Only Let's Encrypt and DigiCert allowed to issue certs)
@           IN CAA 0 issue "letsencrypt.org"
@           IN CAA 0 issue "digicert.com"

; Subdomains
dev         IN  A       192.0.2.5
staging     IN  A       192.0.2.6
api         IN  A       192.0.2.7

; Wildcard subdomain
*.dev       IN  A       192.0.2.8

; Internal (optional, for split-horizon)
internal    IN  A       10.0.0.10
`,
        language: 'ini',
        theme,
        automaticLayout: true,
    });

    changesEditor = editor.create(document.getElementById('changes-editor'), {
        value: `- del a @
- add a @ 192.0.2.4
- add aaaa @ 2001:db8::3`,
        language: 'yaml',
        theme,
        automaticLayout: true,
    });

    const resultEditorHtml = document.getElementById('result-editor');
    resultEditorHtml.innerHTML = '';
    resultEditor = editor.create(resultEditorHtml, {
        value: '',
        language: 'ini',
        theme,
        readOnly: true,
        automaticLayout: true,
    });

    changesLabel = document.getElementById('changes-label');

    [inputEditor, changesEditor].forEach(e => {
        e.onDidChangeModelContent(updateResult);
    });

    diffCheckbox = document.getElementById('diffcheckbox');
    diffCheckbox.addEventListener('change', updateResult);
    diffCheckbox.addEventListener('change', (e) => {
        const v = e.currentTarget.checked;
        resultEditor.dispose();
        resultEditor = v ? editor.createDiffEditor(
            resultEditorHtml,
            {
                theme,
                readOnly: true,
                automaticLayout: true,
            }
        ) : editor.create(resultEditorHtml, {
            value: '',
            language: 'ini',
            theme,
            readOnly: true,
            automaticLayout: true,
        });


        if (v) {
            diffBefore = editor.createModel(
                "",
                "ini"
            );
            diffAfter = editor.createModel(
                "",
                "ini"
            );

            resultEditor.setModel({
                original: diffBefore,
                modified: diffAfter,
            });
        }

        updateResult();
    });

    updateResult();
}

function updateResult() {
    try {
        const input = parseNS(inputEditor.getValue());
        const changes = yaml.load(changesEditor.getValue());
        const useDiff = diffCheckbox.checked;
        const before = generateNS(input, template);
        changesLabel.innerText = editNS(input, changes) + " changes";
        if (changesLabel.innerText == "1 changes") changesLabel.innerText = "1 change";
        const after = generateNS(input, template);
        if (useDiff) {
            diffBefore.setValue(before);
            diffAfter.setValue(after);
        } else {
            resultEditor.setValue(after);
        }

    } catch (err) {
        resultEditor.setValue(`Error: ${err.message}\n${err.stack}`);
    }
}

(async function (params) {
    await import('./monaco.js');
    const { editor } = await import('monaco-editor');
    setupEditors(editor);
})()

const template = `; Zone: {zone}

{$origin}
{$ttl}

; SOA Record
{name} {ttl}	IN	SOA	{mname}{rname}(
{serial} ;serial
{refresh} ;refresh
{retry} ;retry
{expire} ;expire
{minimum} ;minimum ttl
)

; NS Records
{ns}

; MX Records
{mx}

; A Records
{a}

; AAAA Records
{aaaa}

; CNAME Records
{cname}

; PTR Records
{ptr}

; TXT Records
{txt}

; SRV Records
{srv}

; SPF Records
{spf}

; CAA Records
{caa}

; DS Records
{ds}

`