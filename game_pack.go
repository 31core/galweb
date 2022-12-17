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
			data, _ := io.ReadAll(rc)
			rc.Close()
			return data, nil
		}
	}
	return []byte{}, fmt.Errorf("no such file: %s", path)
}

func (self *GamePack) GetConfig(key string) (string, error) {
	if self.Config == nil {
		var config map[string]string
		cfg, err := self.GetFile("package.json")
		if err != nil {
			return "", fmt.Errorf("Couldn't read package.json\n")
		}
		json.Unmarshal(cfg, &config)
		self.Config = &config
		return config[key], nil
	}
	return (*self.Config)[key], nil
}

func (self *GamePack) Close() error {
	return self.f.Close()
}

func ListDir(path string) []string {
	if len(path) > 1 && path[0:2] == "./" {
		path = path[2:]
	}
	var files []string
	dir, err := ioutil.ReadDir(path)
	if err != nil {
		return nil
	}
	for _, fi := range dir {
		if fi.IsDir() {
			files = append(files, ListDir(path+"/"+fi.Name())...)
		} else {
			if path[0] == '.' {
				files = append(files, fi.Name())
			} else {
				files = append(files, path+"/"+fi.Name())
			}
		}
	}
	return files
}

func BuildGamePack(src, out string) {
	now_dir, _ := os.Getwd()
	os.Chdir(src)
	var data bytes.Buffer
	z := zip.NewWriter(&data)
	for _, file := range ListDir(".") {
		fmt.Printf("Adding %s\n", file)
		content, _ := z.Create(file)
		dt, _ := ioutil.ReadFile(file)
		content.Write(dt)
	}
	z.Close()
	os.Chdir(now_dir)
	ioutil.WriteFile(out, data.Bytes(), os.ModePerm)
}
