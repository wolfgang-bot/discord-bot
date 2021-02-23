import DescriptiveObject from "@personal-discord-bot/shared/dist/DescriptiveObject"
import { HEX_COLOR_REGEX } from "@personal-discord-bot/shared/dist/constraints"

/**
 * Key names cannot contain the character: "#"
 * -> This is used in the frontend to create a flat object hirarchie
 */
const config = new DescriptiveObject({
    value: {
        colors: new DescriptiveObject({
            value: {
                primary: new DescriptiveObject({
                    value: "#3f51b5",
                    constraints: "Must be a valid hexadecimal color-code",
                    verifyConstraints: (value) => HEX_COLOR_REGEX.test(value)
                })
            }
        }),

        main: new DescriptiveObject({
            value: {
                userRole: new DescriptiveObject({
                    description: "Role each user receives when joining the guild",
                    value: "User"
                })
            }
        })
    }
})

export default config
