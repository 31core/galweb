package main

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
)

type GameData struct {
	FileName string
	Config   *map[string]string
	f        *zip.ReadCloser
}

func (self *GameData) Open(file string) error {
	var err error
	self.f, err = zip.OpenReader(file)
	return err
}

func (self *GameData) GetFile(path string) ([]byte, error) {
	for _, f := range self.f.File {
		if f.Name == path {
			rc, _ := f.Open()
			var data bytes.Buffer
			io.Copy(&data, rc)
			rc.Close()
			return data.Bytes(), nil
		}
	}
	return []byte{}, fmt.Errorf("no such file: %s", path)
}

func (self *GameData) GetConfig(key string) string {
	if self.Config == nil {
		var config map[string]string
		cfg, _ := self.GetFile("config.json")
		json.Unmarshal(cfg, &config)
		self.Config = &config
		return config[key]
	}
	return (*self.Config)[key]
}

func (self *GameData) Close() error {
	return self.f.Close()
}
