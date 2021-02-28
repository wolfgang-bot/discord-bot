import DescriptiveObject from "../lib/DescriptiveObject"

/**
 * Key names cannot contain the character: "#"
 * -> This is used in the frontend to create a flat object hirarchie
 */
const config = new DescriptiveObject({
    value: {}
})

export default config
