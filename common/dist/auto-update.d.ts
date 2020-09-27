export declare const enum IpcChannels {
    Error = "auto-update-error",
    StartedChecking = "auto-update-started-checking",
    UpdateAvailable = "auto-update-available",
    UpdateNotAvailable = "auto-update-not-available",
    DownloadProgressChanged = "auto-update-download-progress-changed",
    UpdateDownloaded = "auto-update-downloaded",
    DownloadAndInstallRequest = "auto-update-download-and-install-request",
    CancelRequest = "auto-update-download-and-install-cancel-request"
}
export interface AutoUpdateEvents {
    error: (error: Error) => void;
    updateError: (error: Error) => void;
    checkingForUpdatesStarted: () => void;
    updateAvailable: (info: UpdateInfo) => void;
    updateNotAvailable: (info: UpdateInfo) => void;
    downloadProgressChanged: (progress: ProgressInfo) => void;
    updateDownloaded: (info: UpdateInfo) => void;
}
export interface ProgressInfo {
    total: number;
    delta: number;
    transferred: number;
    percent: number;
    bytesPerSecond: number;
}
export interface ReleaseNoteInfo {
    /**
     * The version.
     */
    readonly version: string;
    /**
     * The note.
     */
    readonly note: string | null;
}
export interface BlockMapDataHolder {
    /**
     * The file size. Used to verify downloaded size (save one HTTP request to get length).
     * Also used when block map data is embedded into the file (appimage, windows web installer package).
     */
    size?: number;
    /**
     * The block map file size. Used when block map data is embedded into the file (appimage, windows web installer package).
     * This information can be obtained from the file itself, but it requires additional HTTP request,
     * so, to reduce request count, block map size is specified in the update metadata too.
     */
    blockMapSize?: number;
    /**
     * The file checksum.
     */
    readonly sha512: string;
    readonly isAdminRightsRequired?: boolean;
}
export interface UpdateFileInfo extends BlockMapDataHolder {
    url: string;
}
export interface UpdateInfo {
    /**
     * The version.
     */
    readonly version: string;
    readonly files: Array<UpdateFileInfo>;
    /** @deprecated */
    readonly path: string;
    /** @deprecated */
    readonly sha512: string;
    /**
     * The release name.
     */
    releaseName?: string | null;
    /**
     * The release notes. List if `updater.fullChangelog` is set to `true`, `string` otherwise.
     */
    releaseNotes?: string | Array<ReleaseNoteInfo> | null;
    /**
     * The release date.
     */
    releaseDate: string;
    /**
     * The [staged rollout](/auto-update#staged-rollouts) percentage, 0-100.
     */
    readonly stagingPercentage?: number;
}
