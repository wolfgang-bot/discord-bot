type ValidationErrors<Props> = Partial<Record<keyof Props, string>>

export type Validator<Props> = {
    key: keyof Props,
    message: string,
    validate: (props: Props) => boolean
}

export class ValidationError extends Error {
    constructor(public errors: ValidationErrors<any>) {
        super()
    }

    toJSON() {
        return this.errors
    }
}

class Configuration {
    static validators: Validator<any>[] = []

    static validate(props: object) {
        const errors: ValidationErrors<typeof props> = {}

        this.validators.forEach(validator => {
            if (!validator.validate(props)) {
                errors[validator.key] = validator.message
            }
        })

        if (Object.keys(errors).length > 0) {
            throw new ValidationError(errors)
        }
    }

    constructor(props: object) {
        for (let key in props) {
            this[key] = props[key]
        }
    }
}

export default Configuration
