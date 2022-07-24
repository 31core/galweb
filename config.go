package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
)

var config map[string]string

func DefaultConfig() {
	if _, ok := config["text-speed"]; !ok {
		config["text-speed"] = "100"
	}
}

func LoadConfig() {
	json_data, err := ioutil.ReadFile("config.json")
	if err != nil {
		log.Fatalln("Could not read 'config.json'")
	}
	json.Unmarshal(json_data, &config)
}
