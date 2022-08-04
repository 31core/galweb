all:
	go build

release:
	go build -ldflags "-s -w"

run:
	make all
	./galweb