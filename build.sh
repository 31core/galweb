#/usr/bin/bash

echo 'building galweb'
go build -o galweb -ldflags "-s -w" app/*.go

echo 'processing m4'
pushd web
for i in *.html
do
    m4 ../html.m4 $i > ../resource/$i
done
cp *.ts ../resource
cp *.css ../resource
cp tsconfig.json ../resource
popd

echo 'building TypeScript'
tsc -p resource
