class AzureEventHandler {

    constructor(player, telemetryManager) {
        this.telemetryManager = telemetryManager
        this.player = player
        console.log("AzureEventHandler created", player, telemetryManager)
    }

    timestampEvent(evt) {
        const timestamp = Date.now()
        console.log(`${evt.type}: ${timestamp}`)
        
        this.telemetryManager.stampEvent(evt)
    }

    bitrateEvent(evt) {
        if (evt.type === amp.eventName.downloadbitratechanged) {
            console.log(evt.type + ": " + this.player.currentDownloadBitrate() + "\n")
        } else {
            console.log(evt.type + ": " + this.player.currentPlaybackBitrate() + "\n")
        }
    }

    logBufferData(evt, type, bufferData) {
        if (evt.type === amp.bufferDataEventName.downloadfailed) {
            console.log(`Download failed:`,bufferData.downloadFailed)
            this.telemetryManager.stampStreamBitrateError(type, bufferData.downloadFailed)
        }
        // else if (evt.type === amp.bufferDataEventName.downloadrequested) {
        //     var downloadRequested = bufferData.downloadRequested
        //     console.log(`Download requested:`,bufferData)
        // }
        else if (evt.type === amp.bufferDataEventName.downloadcompleted) {
            const eventData = bufferData.downloadCompleted
            // console.log(`Download completed:`, eventData)
            this.telemetryManager.stampStreamBitrate(type, eventData)
            this.telemetryManager.updateAverageBufferAvailable(bufferData)
            telemetryManager.addTimeSpentBuffering()
        }
    }

}