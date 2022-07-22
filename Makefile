all:
	go build -o webgal *.go

run:
	make all
	./webgal