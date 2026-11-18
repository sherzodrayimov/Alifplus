"""Rebuild modifiers without changing the illustrated Alif+ base key positions."""
from pathlib import Path
import re,itertools
p=Path('macos/Alif+.bundle/Contents/Resources/Alif+.keylayout')
s=p.read_text()
maps={int(i):body for i,body in re.findall(r'<keyMap index="(\d+)">(.*?)</keyMap>',s,re.S)}
# Caps+Shift: lowercase letters and shifted punctuation, rather than Option symbols.
body=maps[1]
for a,b in list(zip('ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'))+[('&#x00D6;','&#x00F6;'),('&#x011E;','&#x011F;'),('&#x015E;','&#x015F;'),('&#x00C7;','&#x00E7;')]:
    body=body.replace('output="'+a+'"','output="'+b+'"')
maps[6]=body
# Command+Shift retains US shortcuts independently of the Alif punctuation layer.
body=maps[2]
shift=dict(zip('1234567890-=[],./;\'`\\','!@#$%^&*()_+{}<>?:"~|'))
import html
body=re.sub(r'output="([^"]*)"',lambda m:'output="'+html.escape(shift.get(html.unescape(m[1]),html.unescape(m[1]).upper() if len(html.unescape(m[1]))==1 and html.unescape(m[1]).isascii() and html.unescape(m[1]).isalpha() else html.unescape(m[1])),quote=True)+'"' if not m[1].startswith('&#x00') and not m[1].startswith('&#x001') else m[0],body)
maps[8]=body
sels={i:[] for i in maps}
for sh,cap,opt,ctrl,cmd in itertools.product([False,True],repeat=5):
    index=(8 if sh else 2) if cmd else 7 if ctrl else (4 if sh^cap else 3) if opt else (6 if sh else 5) if cap else (1 if sh else 0)
    keys=' '.join(k for v,k in zip((sh,cap,opt,ctrl,cmd),('anyShift','caps','anyOption','anyControl','command')) if v)
    sels[index].append('            <modifier keys="'+keys+'" />')
mods='    <modifierMap id="Modifiers" defaultIndex="0">\n'+''.join('        <keyMapSelect mapIndex="'+str(i)+'">\n'+'\n'.join(v)+'\n        </keyMapSelect>\n' for i,v in sels.items())+'    </modifierMap>'
s=re.sub(r'    <modifierMap.*?</modifierMap>',lambda _:mods,s,flags=re.S)
s=re.sub(r'    <keyMapSet.*?</keyMapSet>',lambda _:'    <keyMapSet id="ANSI">\n'+''.join('        <keyMap index="'+str(i)+'">'+b+'</keyMap>\n' for i,b in maps.items())+'    </keyMapSet>',s,flags=re.S)
p.write_text(s)
