type DescriptiveObjectProps = {
    value: any,
    description?: string
    constraints?: string
    verifyConstraints?: (...args: any) => boolean
}

class DescriptiveObject implements DescriptiveObjectProps {
    value: any
    description?: string
    constraints?: string
    verifyConstraints?: (...args: any) => boolean

    constructor(props: DescriptiveObjectProps) {
        this.value = props.value
        this.description = props.description
        this.constraints = props.constraints
        this.verifyConstraints = props.verifyConstraints
    }

    /**
     * Create a vanilla object from the value of this object
     */
    toVanillaObject() {
        let result: any = {}

        if (this.value instanceof DescriptiveObject) {
            result = this.value.toVanillaObject()
        } else if (this.value.constructor.name === "Object") {
            for (let key in this.value) {
                if (this.value[key] instanceof DescriptiveObject) {
                    result[key] = (this.value[key] as DescriptiveObject).toVanillaObject()
                } else {
                    result[key] = this.value[key]
                }
            }
        } else {
            result = this.value
        }

        return result
    }

    /**
     * Assign a vanilla object to a copy of this object
     */
    assignVanillaObject(source: any): DescriptiveObject {
        const result = this.clone()

        if (source.constructor.name === "Object") {
            for (let key in source) {
                if (result.value[key] instanceof DescriptiveObject) {
                    if (source[key].constructor.name === "Object") {
                        (result.value[key] as DescriptiveObject).assignVanillaObject(source[key])
                    } else {
                        result.value[key].value = source[key]
                    }
                } else {
                    result.value[key] = source[key]
                }
            }
        } else {
            result.value = source
        }

        return result
    }

    /**
     * Run all constraint methods and return errors
     */
    runConstraints(root: DescriptiveObject = this): any | undefined {
        let errors: {
            error?: string,
            [key: string]: any
        } | undefined = undefined

        if (this.value instanceof DescriptiveObject) {
            errors = this.value.runConstraints(root)
        } else if (this.value.constructor.name === "Object") {
            for (let key in this.value) {
                if (this.value[key] instanceof DescriptiveObject) {
                    const error = (this.value[key] as DescriptiveObject).runConstraints(root)
                    
                    if (error) {
                        if (!errors) {
                            errors = {}
                        }

                        errors[key] = error
                    }
                }
            }
        }

        if (this.verifyConstraints && !this.verifyConstraints(this.value, root.toVanillaObject())) {
            if (!errors) {
                errors = {}
            }

            errors.error = this.constraints
        }

        return errors
    }

    /**
     * Create a new instance with the same values as this one
     */
    clone() {
        const result = new DescriptiveObject(this)

        if (result.value instanceof DescriptiveObject) {
            result.value = result.value.clone()
        } else if (result.value.constructor.name === "Object") {
            result.value = { ...result.value }
            for (let key in result.value) {
                if (result.value[key] instanceof DescriptiveObject) {
                    result.value[key] = result.value[key].clone()
                }
            }
        }

        return result
    }
}

export default DescriptiveObject