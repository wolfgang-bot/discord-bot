import emojiRegex from "emoji-regex/RGI_Emoji"

const CHANNEL_NAME_MIN_LENGTH = 1
const CHANNEL_NAME_MAX_LENGTH = 50

export type Constraint<T> = {
    constraints: string,
    verifyConstraints: (value: T) => boolean
}

export function useConstraint<
    TProps extends Record<string, any>,
    TValue extends TProps[keyof TProps]
>(key: keyof TProps, constraint: Constraint<TValue>) {
    return {
        key,
        validate: (props: TProps) => constraint.verifyConstraints(props[key]),
        message: constraint.constraints
    }
}

export function minMaxConstraint<T = number>(options: {
    min: number,
    max: number,
    subjectName?: string,
    getNumericValue?: (value: T) => number
}): Constraint<T> {
    const getNumericValue = options.getNumericValue || ((value: T) => value)

    let constraints = ""
    constraints += options.subjectName ? `${options.subjectName} must` : "Must"
    constraints += ` be between ${options.min} and ${options.max}`

    return {
        constraints,
        verifyConstraints: (value: T) =>
            getNumericValue(value) >= options.min &&
            getNumericValue(value) <= options.max
    }
}

export function hasSameLength(...arrays: any[][]) {
    return arrays.some(array => !arrays.some(
        _array => array.length !== _array.length
    ))
}

export function everyGreaterThanZero(array: number[]) {
    return array.every(value => value > 0)
}

export function everyGreaterThanPreceeding(array: number[]) {
    return array.every((value, i) => (
        i === 0 ? true : value > array[i - 1]
    ))
}

// Match hex colors
export const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}){1,2}$/
// Match hex colors and discord color names
export const COLOR_REGEX = /^((#([0-9a-fA-F]{3}){1,2})|(DEFAULT|WHITE|AQUA|GREEN|BLUE|YELLOW|PURPLE|LUMINOUS_VIVID_PINK|GOLD|ORANGE|RED|GREY|DARKER_GREY|NAVY|DARK_AQUA|DARK_GREEN|DARK_BLUE|DARK_PURPLE|DARK_VIVID_PINK|DARK_GOLD|DARK_ORANGE|DARK_RED|DARK_GREY|LIGHT_GREY|DARK_NAVY|BLURPLE|GREYPLE|DARK_BUT_NOT_BLACK|NOT_QUITE_BLACK|RANDOM))$/

export const emojiConstraint: Constraint<string> = {
    constraints: "Must be one unicode emoji",
    verifyConstraints: (value) =>
        emojiRegex().test(value) &&
        value.match(emojiRegex()).length === 1
}

export const channelNameConstraint = minMaxConstraint({
    min: CHANNEL_NAME_MIN_LENGTH,
    max: CHANNEL_NAME_MAX_LENGTH,
    subjectName: "Length",
    getNumericValue: (value: string) => value.length
})
