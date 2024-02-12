export interface VolumeSettings {
    steps: number;
}

export interface PlayPauseSettings {
    action: 'PLAY' | 'PAUSE' | 'TOGGLE';
    displayFormat: string;
}