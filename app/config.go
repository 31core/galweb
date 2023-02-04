package main

import (
	"encoding/json"
	"log"
	"os"
)

var config map[string]string

func DefaultConfig() {
	if _, ok := config["host"]; !ok {
		config["host"] = "localhost"
	}
	if _, ok := config["port"]; !ok {
		config["port"] = "5000"
	}
}

func LoadConfig() {
	json_data, err := os.ReadFile("config.json")
	if err != nil {
		log.Fatalln("Could not read 'config.json'")
	}
	json.Unmarshal(json_data, &config)
}
