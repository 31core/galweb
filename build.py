#!/usr/bin/python3

import os, glob

if os.path.isdir('resource') == False:
    os.mkdir('resource')

print('building galweb')
os.system('go build -o galweb -ldflags "-s -w" app/*.go')

print('processing m4')
for html in os.listdir('web'):
    if html.split('.')[-1] == 'html':
        os.system(f'm4 html.m4 web/{html} > resource/{html}')

for i in glob.glob("web/*.css"):
    os.system(f'cp {i} resource')

print('building TypeScript')
os.system('tsc -p web')
for js in os.listdir('web'):
    if js.split('.')[-1] == 'js':
        os.rename(f'web/{js}', f'resource/{js}')
