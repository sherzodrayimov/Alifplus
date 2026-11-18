"""Run portable conversion tests and validate the illustrated macOS key map."""
from pathlib import Path
import re,html,subprocess,tempfile,sys,plistlib
root=Path(__file__).resolve().parent.parent
s=(root/'macos/Alif+.bundle/Contents/Resources/Alif+.keylayout').read_text()
maps={int(i):{int(k):html.unescape(v) for k,v in re.findall(r'<key code="(\d+)" output="([^"]*)"',b)} for i,b in re.findall(r'<keyMap index="(\d+)">(.*?)</keyMap>',s,re.S)}
assert [maps[0][k] for k in [33,30,41,39,50,42]]==list('öğşç’;')
assert [maps[1][k] for k in [33,30,41,39,43,47]]==list('ÖĞŞÇ“”')
assert [maps[3][k] for k in [33,30,41,39,42]]==list('[];\'\\')
assert [maps[6][k] for k in [0,1,2,33,30,41,39]]==list('asdöğşç')
assert [maps[8][k] for k in [0,33,30,39,42]]==list('A{}"|')
with (root/'macos/Alif+.bundle/Contents/Info.plist').open('rb') as f: assert plistlib.load(f)['CFBundleVersion']=='1.2.0'
for path in ['macos/build_dmg.sh','macos/create_dmg.sh',"macos/O'rnatish (1-klik).command"]: subprocess.run(['bash','-n',str(root/path)],check=True)
with tempfile.TemporaryDirectory() as d:
    subprocess.run(['clang',str(root/'tests/conversion.c'),'-o',d+'/test'],check=True)
    subprocess.run([d+'/test'],check=True)
    if sys.platform=='darwin':
        Path(d+'/main.swift').write_text('import Foundation\nassert(Conversion.full("O\'zbek Sh SH Ch CH g‘ayrat") == "Özbek Ş Ş Ç Ç ğayrat")\nassert(Conversion.pair("0", "\'") == nil)\nprint("Swift conversion passed")\n')
        subprocess.run(['swiftc','-module-cache-path',d+'/cache',str(root/'macos/Conversion.swift'),d+'/main.swift','-o',d+'/swift-test'],check=True)
        subprocess.run([d+'/swift-test'],check=True)
print('C conversion, key layout, plist and shell syntax passed')
