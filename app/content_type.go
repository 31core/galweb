package main

import (
	"strings"
)

func DetectContentTypeByType(filename string) string {
	if strings.Split(filename, ".")[1] == "html" {
		return "text/html; charset=utf-8"
	}
	if strings.Split(filename, ".")[1] == "css" {
		return "text/css; charset=utf-8"
	}
	if strings.Split(filename, ".")[1] == "js" {
		return "text/javascript; charset=utf-8"
	}
	return "application/octect-stream"
}
