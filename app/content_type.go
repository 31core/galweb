package main

import (
	"strings"
)

func DetectContentTypeByType(filename string) string {
	ectend := strings.Split(filename, ".")[1]
	if ectend == "html" {
		return "text/html; charset=utf-8"
	}
	if ectend == "css" {
		return "text/css; charset=utf-8"
	}
	if ectend == "js" {
		return "text/javascript; charset=utf-8"
	}
	return "application/octect-stream"
}
