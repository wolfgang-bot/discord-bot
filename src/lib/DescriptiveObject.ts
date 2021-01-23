type DescriptiveObject = {
    [key: string]: {
        value: string | number | any[] | DescriptiveObject,
        description?: string,
        constraints?: string,
        verifyConstraints?: (...args: any) => boolean
    }
}

export default DescriptiveObject