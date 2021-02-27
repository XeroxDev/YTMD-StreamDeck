export interface AvailableCommandsInterface {
    cmd: 'track-play-pause' | 'track-play' | 'track-pause' | 'track-next' | 'track-previous' | 'track-thumbs-up' | 'track-thumbs-down'
        | 'player-volume-up' | 'player-volume-down' | 'player-forward' | 'player-rewind' | 'player-set-seekbar' | 'player-set-volume'
        | 'player-set-queue' | 'player-repeat' | 'player-shuffle' | 'player-add-library' | 'player-add-playlist' | 'show-lyrics-hidden';
    event?: 'media-commands' | 'retrieve-info' | 'query-player' | 'query-track' | 'query-queue' | 'query-playlist' | 'query-lyrics';
    value?: any;
}
