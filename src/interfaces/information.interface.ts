export interface TrackAndPlayerInterface {
    player: PlayerInfoInterface,
    track: TrackInfoInterface
}

export interface PlayerInfoInterface {
    hasSong: boolean,
    isPaused: boolean,
    volumePercent: number,
    seekbarCurrentPosition: number,
    seekbarCurrentPositionHuman: string,
    statePercent: number,
    likeStatus: 'INDIFFERENT' | 'LIKE' | 'DISLIKE',
    repeatType: string
}

export interface TrackInfoInterface {
    author: string,
    title: string,
    album: string,
    cover: string,
    duration: number,
    durationHuman: string,
    url: string,
    id: string,
    isVideo: boolean,
    isAdvertisement: boolean,
    inLibrary: boolean
}

export interface QueueInfoInterface {
    automix: boolean,
    currentIndex: number,
    list: QueueInfoItemInterface[]
}

export interface QueueInfoItemInterface {
    cover: TrackInfoInterface['cover'],
    title: TrackInfoInterface['title'],
    author: TrackInfoInterface['author'],
    duration: TrackInfoInterface['duration']
}

export interface PlaylistInfoInterface {
    list: string[]
}

export interface AppInfoInterface {
    app: AppInfoItemInterface;
    server: ServerInfoInterface;
}

export interface ServerInfoInterface {
    name: string,
    listen: unknown[],
    port: number,
    isProtected: boolean,
    connections: number,
}

export interface AppInfoItemInterface {
    version: string;
}

export interface LyricsInfoInterface {
    provider: string,
    data: string,
    hasLoaded: boolean,
}
