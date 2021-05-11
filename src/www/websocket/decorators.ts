import { error } from "./responses"

export function isBotAdmin(
    _target: any,
    _name: string,
    descriptor: PropertyDescriptor
) {
    const source = descriptor.value
    descriptor.value = async function (...args: any[]) {
        await this.socket.user.fetchIsBotAdmin()
        
        if (!this.socket.user.isBotAdmin) {
            const send = args[args.length - 1]
            send?.(error(403))
            return
        }

        return source.apply(this, args)
    }
}
