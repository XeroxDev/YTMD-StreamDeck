export interface VolumeSettings {
    steps: number;
}

export interface PlayPauseSettings {
    action: 'PLAY' | 'PAUSE' | 'TOGGLE';
    displayFormat: string;
    displayTitleFormat: string;
    customLayout: string;
}

export interface PlaylistSettings {
    playlistId?: string;
    playlistUrl?: string;
}
