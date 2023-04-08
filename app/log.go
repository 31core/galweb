package main

import (
	"fmt"
)

func INFO(format string, info ...any) {
	fmt.Print("\033[32mINFO\033[0m: ")
	fmt.Printf(format, info...)
	fmt.Println()
}

func WARN(format string, info ...any) {
	fmt.Print("\033[33mWARN\033[0m: ")
	fmt.Printf(format, info...)
	fmt.Println()
}

func ERR(format string, info ...any) {
	fmt.Print("\033[31mERR\033[0m: ")
	fmt.Printf(format, info...)
	fmt.Println()
}
