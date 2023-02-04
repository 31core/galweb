package main

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"os"
)

type GamePack struct {
	FileName string
	Config   *map[string]string
	pack_fd  *zip.ReadCloser
}

func (gp *GamePack) Open(file string) error {
	var err error
	gp.pack_fd, err = zip.OpenReader(file)
	return err
}

func (gp *GamePack) GetFile(path string) ([]byte, error) {
	for _, f := range gp.pack_fd.File {
		if f.Name == path {
			rc, _ := f.Open()
			data, _ := io.ReadAll(rc)
			rc.Close()
			return data, nil
		}
	}
	return []byte{}, fmt.Errorf("no such file: %s", path)
}

func (gp *GamePack) GetConfig(key string) (string, error) {
	if gp.Config == nil {
		var config map[string]string
		cfg, err := gp.GetFile("package.json")
		if err != nil {
			return "", fmt.Errorf("couldn't read package.json")
		}
		json.Unmarshal(cfg, &config)
		gp.Config = &config
		return config[key], nil
	}
	return (*gp.Config)[key], nil
}

func (gp *GamePack) Close() error {
	return gp.pack_fd.Close()
}

func ListDir(path string) []string {
	if len(path) > 1 && path[0:2] == "./" {
		path = path[2:]
	}
	var files []string
	dir, err := os.ReadDir(path)
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
		dt, _ := os.ReadFile(file)
		content.Write(dt)
	}
	z.Close()
	os.Chdir(now_dir)
	os.WriteFile(out, data.Bytes(), os.ModePerm)
}
