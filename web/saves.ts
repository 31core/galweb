class SaveData {
    dict: object = {};
    constructor() {}
    get(name: string): string {
        return this.dict[name];
    }
    to_string(): string {
        return JSON.stringify(this.dict);
    }
    to_url(): string {
        return encode_url_arg(this.dict);
    }
    from(data: string) {
        this.dict = JSON.parse(data);
    }
    get_saying(): string {
        return this.dict["saying"];
    }
    get_step(): number {
        return Number.parseInt(this.dict["step"]);
    }
    get_scene(): number {
        return Number.parseInt(this.dict["scene"]);
    }
}