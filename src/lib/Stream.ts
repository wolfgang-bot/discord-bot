export enum READING_STATES {
    FLOWING,
    PAUSED
}

export abstract class Readable<T> {    
    destStreams: Writable<T>[] = []
    state: READING_STATES = READING_STATES.PAUSED
    buffer: T[] = []

    abstract construct(): void
    abstract destroy(): void
    abstract collectBuffer(buffer: T[]): T

    push(data: T) {
        if (this.state === READING_STATES.FLOWING) {
            this.destStreams.forEach(stream => {
                stream.write(data)
            })
        } else if (this.state === READING_STATES.PAUSED) {
            this.buffer.push(data)
        }
    }

    pause() {
        this.state = READING_STATES.PAUSED
    }

    resume() {
        this.state = READING_STATES.FLOWING
        if (this.buffer.length > 0) {
            this.push(this.collectBuffer(this.buffer))
            this.buffer = []
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
