package main

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"os"
)

type GamePack struct {
	FileName string
	Config   *map[string]string
	f        *zip.ReadCloser
}

func (self *GamePack) Open(file string) error {
	var err error
	self.f, err = zip.OpenReader(file)
	return err
}

func (self *GamePack) GetFile(path string) ([]byte, error) {
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

func (self *GamePack) GetConfig(key string) string {
	if self.Config == nil {
		var config map[string]string
		cfg, _ := self.GetFile("config.json")
		json.Unmarshal(cfg, &config)
		self.Config = &config
		return config[key]
	}
	return (*self.Config)[key]
}

func (self *GamePack) Close() error {
	return self.f.Close()
}

func ListDir(path string) []string {
	var files []string
	dir, err := ioutil.ReadDir(path)
	if err != nil {
		return nil
	}
	for _, fi := range dir {
		if fi.IsDir() {
			files = append(files, ListDir(path+"/"+fi.Name())...)
		} else {
			files = append(files, path+"/"+fi.Name())
		}
	}
	return files
}

func BuildGamePack(src, out string) {
	var data bytes.Buffer
	z := zip.NewWriter(&data)
	for _, file := range ListDir(src) {
		content, _ := z.Create(file)
		dt, _ := ioutil.ReadFile(file)
		content.Write(dt)
	}
	z.Close()
	ioutil.WriteFile(out, data.Bytes(), os.ModePerm)
}
