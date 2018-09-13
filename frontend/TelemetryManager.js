class TelemetryManager {
    constructor(player) {
        this.player = player
        this.resetTelemetry()
        console.log('TelemetryManager created')
    }

    resetTelemetry() {
        this.telemetryObject = {
            streamInformation: {
                manifestUrl: "",
                protocol: "",
                availableVideoTracks: [],
                availableAudioTracks: [],
                availableTextTracks: [],
                // There is no declared way to determine if the video is live or on-demand
                isLive: false,
            },
            streamHistory: {
                video: {
                    bitrates: [],
                    errors: [],
                },
                audio: {
                    bitrates: [],
                    errors: [],
                }
            },
            playerStatistics: {
                timeSpentBuffering: 0,
                averageBufferAvailable: 0
            },
            playerEvents: [],
            playerErrors: []
        }
        this.recordedBufferLevels = []
    }

    getTelemetry() {
        return this.telemetryObject
    }

    addStreamInformation() {
        this.addManifestUrl()
        this.addProtocol()
        this.addAvailableTracksForAudioStreamList()
        this.addAvailableTracksForVideoStreamList()
        this.addTextTracks()
    }

    addManifestUrl() {
        this.telemetryObject.streamInformation.manifestUrl = this.player.src()
    }

    addProtocol() {
        this.telemetryObject.streamInformation.protocol = this.player.currentType()
    }

    addTextTracks() {
        const trackLanguages = this.player.textTracks().tracks_.map(track => track.srcLang)
        this.telemetryObject.streamInformation.availableTextTracks = trackLanguages
    }

    addAvailableTracksForVideoStreamList() {
        const videoStreamList = this.player.currentVideoStreamList()
        const selectedIndex = videoStreamList.selectedIndex
        const currentStream = videoStreamList.streams[selectedIndex]
        const availableTracks = currentStream.tracks || []
        console.log(`Available tracks for video`, availableTracks)
        this.telemetryObject.streamInformation.availableVideoTracks = availableTracks.map(track => {
            return {
                title: track.title,
                bandwidth: track.bitrate,
                // There's supposed to be track size, but I have not found this data in the docs
            }
        })
    }

    addAvailableTracksForAudioStreamList() {
        const audioStreamList = this.player.currentAudioStreamList()
        const availableTracks = audioStreamList.streams
        console.log(`Available tracks for audio`, availableTracks)
        this.telemetryObject.streamInformation.availableAudioTracks = availableTracks.map(track => {
            return {
                title: track.title,
                bandwidth: track.bitrate,
                // There's supposed to be track size, but I have not found this data in the docs
            }
        })  
    }

    addTimeSpentBuffering() {
        const buffered = this.player.buffered()
        // console.log(buffered)
        const timeRanges = buffered._timeRanges
        if (timeRanges) {
            const timeSpentBuffering = timeRanges.reduce((sum, timeRange) => {
                return sum + timeRange.endInSec - timeRange.startInSec
            }, 0)
            // console.log(`addTimeSpentBuffering > ${timeSpentBuffering}`)
            this.telemetryObject.playerStatistics.timeSpentBuffering = timeSpentBuffering
        } else {
            console.log(`addTimeSpentBuffering > no timeRanges data yet`)
        }
    }

    updateAverageBufferAvailable(bufferData) {
        this.recordedBufferLevels.push(bufferData.bufferLevel)
        const averageBufferAvailable = this.recordedBufferLevels.reduce((sum, level) => {
            return sum + level
        },0) / this.recordedBufferLevels.length
        // console.log(`updateAverageBufferAvailable > ${averageBufferAvailable}`)
        this.telemetryObject.playerStatistics.averageBufferAvailable = averageBufferAvailable
    }
    
    addBufferListeners(buffer, callback) {
        if (buffer) {
            buffer.addEventListener(amp.bufferDataEventName.downloadrequested, callback);
            buffer.addEventListener(amp.bufferDataEventName.downloadcompleted, callback);
            buffer.addEventListener(amp.bufferDataEventName.downloadfailed, callback);
        }
    }

    timestamp() {
        // Better to use so-called DateFactory here, so it could be tested
        return Date.now()
    }

    stampEvent(evt) {
        // Cheap check if the event is error, could be improved if needed
        if (evt.type === amp.eventName.error) {
            this.telemetryObject.playerErrors.push({
                code: this.player.error().code,
                timestamp: this.timestamp()
            })
        } else {
            this.telemetryObject.playerEvents.push({
                type: evt.type,
                timestamp: this.timestamp()
            })
        }
    }

    stampStreamBitrate(streamType, downloadCompleted) {
        const streamHistory = this.telemetryObject.streamHistory[streamType]
        if (streamHistory && downloadCompleted) {
            streamHistory.bitrates.push({
                timestamp: this.timestamp(),
                bytes: downloadCompleted.totalBytes,
                // Here it's supposed to be amount of fragments per bitrate, but I have not found this data in bufferData object
                fragments: downloadCompleted.measuredBandwidth,
            })
        }
    }

    stampStreamBitrateError(streamType, downloadFailed) {
        this.telemetryObject.streamHistory[streamType].errors.push({
            timestamp: this.timestamp(),
            code: downloadFailed.code && downloadFailed.code.toString(),
            message: downloadFailed.message
        })
    }
}