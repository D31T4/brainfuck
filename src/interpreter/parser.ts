
/**valid chars */
const validChars = [
    '>',
    '<',
    '+',
    '-',
    '[',
    ']',
    ',',
    '.'
] as const;

/**character */
export type token = (typeof validChars)[number];

/**
 * tokenize brainfuck code
 * @param code brainfuck code
 * @returns tokens
 */
export default function lex(code: string): token[] {
    // @ts-ignore
    const tokens: token[] = code
        .split('')
        .filter(char => (validChars as readonly string[]).includes(char));

    let bracket = 0;
    tokens.forEach(token => {
        if (token === '[') {
            ++bracket;
        } else if (token === ']') {
            --bracket;
        }

        if (bracket < 0)
            throw Error('unexpected \']\'');
    });

    if (bracket > 0)
        throw Error('unexpected \'[\'');

    return tokens;
}


