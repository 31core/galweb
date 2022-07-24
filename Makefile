all:
	go build -o galweb *.go

run:
	make all
	./galweb