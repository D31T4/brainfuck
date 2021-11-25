
export default class InputReader {
    public readonly values: number[];
    private pointer: number = 0;

    public constructor(input: string) {
        this.values = new Array(input.length);

        for (let i = 0; i < input.length; ++i) {
            this.values[i] = input.charCodeAt(i) & 255;
        }
    }

    public read(): number {
        if (this.pointer < this.values.length) {
            return this.values[this.pointer++];
        } else {
            return 0;
        }
    }
}
