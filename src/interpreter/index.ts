
import lex, { token } from './parser';
import InputReader from './inputReader';

export default class Interpreter {
    /**memory size */
    private static readonly memorySize = 30000;

    /**step size per iteration */
    private static readonly stepSize = 20;

    /**splitted tokens */
    private readonly tokens: token[];
    /**input reader */
    private readonly reader: InputReader;

    /**memory */
    private readonly memory: number[] = new Array(Interpreter.memorySize).fill(0);

    /**memory pointer */
    private memoryPointer: number = 0;

    /**code pointer */
    private codePointer: number = 0;
    
    private loopStack: number[] = [];

    /**output string */
    private output: string = '';

    private accumulator: {
        move: number;
        add: number;
    } = {
        move: 0,
        add: 0
    }

    private halted: boolean = false;

    public constructor(code: string, input: string) {
        this.tokens = lex(code);
        this.reader = new InputReader(input);
    }

    private get currentToken(): token | undefined {
        if (this.codePointer < this.tokens.length) {
            return this.tokens[this.codePointer];
        } else {
            return undefined;
        }
    }

    private get nextToken(): token | undefined {
        if (this.codePointer + 1 < this.tokens.length) {
            return this.tokens[this.codePointer + 1];
        } else {
            return undefined;
        }
    }

    private step(): void {
        const currentToken = this.currentToken,
            nextToken = this.nextToken;

        switch (currentToken) {
            case '>':
            case '<':
                this.accumulator.move += currentToken === '>' ? 1 : -1;

                if (nextToken !== '>' && nextToken !== '<') {
                    this.memoryPointer += this.accumulator.move;
                    this.accumulator.move = 0;
                    
                    this.memoryPointer = Math.max(this.memoryPointer, 0);
                    this.memoryPointer = Math.min(this.memoryPointer, Interpreter.memorySize - 1);
                }

                ++this.codePointer;
                return;
            case '+':
            case '-':
                this.accumulator.add += currentToken === '+' ? 1 : -1;

                if (nextToken !== '+' && nextToken !== '-') {
                    this.memory[this.memoryPointer] = (this.memory[this.memoryPointer] + this.accumulator.add) & 255;
                    this.accumulator.add = 0;
                }

                ++this.codePointer;
                return;
            case ',':
                this.memory[this.memoryPointer] = this.reader.read();
                ++this.codePointer;
                return;
            case '.':
                this.output += String.fromCharCode(this.memory[this.memoryPointer]);
                ++this.codePointer;
                return;
            case '[':
                this.loopStack.push(this.codePointer);
                ++this.codePointer;
                return;
            case ']':
                let newPointer = this.loopStack.pop() as number;
                if (this.memory[this.memoryPointer] !== 0) {
                    this.codePointer = newPointer;
                } else {
                    ++this.codePointer;
                }
                return;
        }
    }

    public async run() {
        while (this.codePointer < this.tokens.length && !this.halted) {
            // a trick to avoid blocking
            await new Promise<void>(resolve => {
                setTimeout(() => {
                    for (let i = 0; i < Interpreter.stepSize; ++i)
                        this.step();

                    resolve();
                });
            });
        }

        if (this.halted) throw Error('cancelled');

        return this.output;
    }

    public halt(): void {
        this.halted = true;
    }
}
