import mongoose from "mongoose";

export type Track = {
    title: string
    bandwidth: number
    size: number
}

export type Bitrate = {
    timestamp: number
    bytes: number,
    fragments: number,
}

export type BitrateError = {
    timestamp: number
    code: string
    message: string
}

export type PlayerEvent = {
    type: string
    timestamp: number
}

export type PlayerError = {
    code: string
    timestamp: number
}

export type TelemeryModel = mongoose.Document & {
    streamInformation: {
        manifestUrl: string
        protocol: string
        availableVideoTracks: Track[]
        availableAudioTracks: Track[]
        availableTextTracks: string[]
        isLive: boolean
    },
    streamHistory: {
        video: {
            bitrates: Bitrate[]
            errors: BitrateError[]
        },
        audio: {
            bitrates: Bitrate[]
            errors: BitrateError[]
        }
    },
    playerStatistics: {
        timeSpentBuffering: number,
        averageBufferAvailable: number
    },
    playerEvents: PlayerEvent[],
    playerErrors: PlayerError[]
};

const telemetrySchema = new mongoose.Schema({
    streamInformation: {
        manifestUrl: String,
        protocol: String,
        availableVideoTracks: Array,
        availableAudioTracks: Array,
        availableTextTracks: Array,
        isLive: Boolean,
    },
    streamHistory: {
        video: {
            bitrates: Array,
            errors: Array,
        },
        audio: {
            bitrates: Array,
            errors: Array,
        }
    },
    playerStatistics: {
        timeSpentBuffering: Number,
        averageBufferAvailable: Number
    },
    playerEvents: Array,
    playerErrors: Array
}, { timestamps: true });

const Telemetry = mongoose.model("Telemetry", telemetrySchema);
export default Telemetry;
