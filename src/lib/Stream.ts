export enum READING_STATES {
    FLOWING,
    PAUSED
}

export abstract class Readable<T> {    
    destStreams: Writable<T>[] = []
    state: READING_STATES = READING_STATES.PAUSED
    buffer: T[] = []
    monoBuffer: T = null
    
    useMonoBuffer: boolean

    abstract construct(): void
    abstract destroy(): void
    abstract collectBuffer(buffer: T | T[]): T

    constructor({ useMonoBuffer = false }: {
        useMonoBuffer?: boolean
    } = {}) {
        this.useMonoBuffer = useMonoBuffer
    }

    push(data: T) {
        if (this.state === READING_STATES.FLOWING) {
            this.destStreams.forEach(stream => {
                stream.write(data)
            })
        } else if (this.state === READING_STATES.PAUSED) {
            this.pushToBuffer(data)
        }
    }

    pause() {
        this.state = READING_STATES.PAUSED
    }

    resume() {
        this.state = READING_STATES.FLOWING
        if (
            this.useMonoBuffer && this.monoBuffer ||
            !this.useMonoBuffer && this.buffer.length > 0
        ) {
            this.push(this.collectBuffer(this.getBuffer()))
            this.buffer = []
            this.monoBuffer = null
        }
    }

    getBuffer(): T | T[] {
        return this.useMonoBuffer ? this.monoBuffer : this.buffer
    }

    pushToBuffer(data: T) {
        if (this.useMonoBuffer) {
            this.monoBuffer = data
        } else {
            this.buffer.push(data)
        }
    }

    pipe(stream: Writable<T>) {
        this.destStreams.push(stream)
        
        if (this.state === READING_STATES.PAUSED) {
            this.resume()
            this.construct()
        }

        return stream
    }
}

export abstract class Writable<T> {
    abstract write(data: T): void
}
