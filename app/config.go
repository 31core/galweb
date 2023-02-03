package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
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
	json_data, err := ioutil.ReadFile("config.json")
	if err != nil {
		log.Fatalln("Could not read 'config.json'")
	}
	json.Unmarshal(json_data, &config)
}
