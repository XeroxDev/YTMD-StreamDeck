import {SettingsInterface} from "../interfaces/settings.interface";
import {AvailableCommandsInterface} from "../interfaces/available-commands.interface";
import {Observable, Subject} from "rxjs";
import {
	TrackAndPlayerInterface,
	PlayerInfoInterface,
	AppInfoInterface,
	TrackInfoInterface, QueueInfoInterface, PlaylistInfoInterface, LyricsInfoInterface
} from "../interfaces/information.interface";
import io from 'socket.io-client';

export class YtmdSocketHelper {
	private static _instance: YtmdSocketHelper;

	public static getInstance(): YtmdSocketHelper {
		if (!this._instance)
			this._instance = new YtmdSocketHelper();
		return this._instance;
	}

	private socket: SocketIOClient.Socket;
	private _onTick$: Subject<TrackAndPlayerInterface> = new Subject<TrackAndPlayerInterface>();
	private _onPlayer$: Subject<PlayerInfoInterface> = new Subject<PlayerInfoInterface>();
	private _onTrack$: Subject<TrackInfoInterface> = new Subject<TrackInfoInterface>();
	private _onQueue$: Subject<QueueInfoInterface> = new Subject<QueueInfoInterface>();
	private _onPlaylist$: Subject<PlaylistInfoInterface> = new Subject<PlaylistInfoInterface>();
	private _onLyrics$: Subject<LyricsInfoInterface> = new Subject<LyricsInfoInterface>();
	private _onError$: Subject<void> = new Subject<void>();
	private _onConnect$: Subject<void> = new Subject<void>();


	private constructor() {
		this.setConnection();
	}

	public setConnection({host, port, password}: SettingsInterface = {host: 'localhost', port: '9863', password: ''}): YtmdSocketHelper {
		if (this.socket)
			this.socket.disconnect();

		this.socket = password ? io(`http://${host}:${port}`, {
			transportOptions: {
				polling: {
					extraHeaders: {
						password
					}
				}
			}
		}) : io(`http://${host}:${port}`);

		this.socket.on('error', () => this._onError$.next());
		this.socket.on('connect_error', () => this._onError$.next());

		this.socket.on("connect", () => {
			this._onConnect$.next();
			this.socket.on('tick', (data: any) => {
				this._onTick$.next(data);
			});
			this.socket.on('player', (data: any) => {
				this._onPlayer$.next(data);
			});
			this.socket.on('track', (data: any) => {
				this._onTrack$.next(data);
			});
			this.socket.on('queue', (data: any) => {
				this._onQueue$.next(data);
			});
			this.socket.on('playlist', (data: any) => {
				this._onPlaylist$.next(data);
			});
			this.socket.on('lyrics', (data: any) => {
				this._onLyrics$.next(data);
			});
		});

		return this;
	}

	public trackPlayPause() {
		this.emit({cmd: 'track-play-pause'});
	}

	public trackPlay() {
		this.emit({cmd: 'track-play'});
	}

	public trackPause() {
		this.emit({cmd: 'track-pause'});
	}

	public trackNext() {
		this.emit({cmd: 'track-next'});
	}

	public trackPrevious() {
		this.emit({cmd: 'track-previous'});
	}

	public trackThumbsUp() {
		this.emit({cmd: 'track-thumbs-up'});
	}

	public trackThumbsDown() {
		this.emit({cmd: 'track-thumbs-down'});
	}

	public playerVolumeUp() {
		this.emit({cmd: 'player-volume-up'});
	}

	public playerVolumeDown() {
		this.emit({cmd: 'player-volume-down'});
	}

	public playerForward() {
		this.emit({cmd: 'player-forward'});
	}

	public playerRewind() {
		this.emit({cmd: 'player-rewind'});
	}

	public playerSetSeekbar(seconds: PlayerInfoInterface['seekbarCurrentPosition']) {
		this.emit({cmd: 'player-set-seekbar', value: seconds});
	}

	public playerSetVolume(percentage: PlayerInfoInterface['volumePercent']) {
		this.emit({cmd: 'player-set-volume', value: percentage});
	}

	public playerSetQueue(index: number) {
		this.emit({cmd: 'player-set-queue', value: index});
	}

	public playerRepeat() {
		this.emit({cmd: 'player-repeat'});
	}

	public playerShuffle() {
		this.emit({cmd: 'player-shuffle'});
	}

	public playerAddLibrary() {
		this.emit({cmd: 'player-add-library'});
	}

	public playerAddPlaylist(index: number) {
		this.emit({cmd: 'player-add-playlist', value: index});
	}

	public showLyricsHidden() {
		this.emit({cmd: 'show-lyrics-hidden'});
	}

	public requestPlayer() {
		this.emit(<AvailableCommandsInterface>{event: "query-player"});
	}

	public requestTrack() {
		this.emit(<AvailableCommandsInterface>{event: "query-track"});
	}

	public requestQueue() {
		this.emit(<AvailableCommandsInterface>{event: "query-queue"});
	}

	public requestPlaylist() {
		this.emit(<AvailableCommandsInterface>{event: "query-playlist"});
	}

	public requestLyrics() {
		this.emit(<AvailableCommandsInterface>{event: "query-lyrics"});
	}

	public disconnect() {
		this.socket.disconnect();
	}

	get onTick$(): Observable<TrackAndPlayerInterface> {
		return this._onTick$;
	}

	get onPlayer$(): Observable<PlayerInfoInterface> {
		return this._onPlayer$;
	}

	get onTrack$(): Observable<TrackInfoInterface> {
		return this._onTrack$;
	}

	get onQueue$(): Observable<QueueInfoInterface> {
		return this._onQueue$;
	}

	get onPlaylist$(): Observable<PlaylistInfoInterface> {
		return this._onPlaylist$;
	}

	get onLyrics$(): Observable<LyricsInfoInterface> {
		return this._onLyrics$;
	}

	get onError$(): Subject<void> {
		return this._onError$;
	}

	get onConnect$(): Subject<void> {
		return this._onConnect$;
	}

	private emit({event = 'media-commands', cmd = 'player-rewind', value = true}: AvailableCommandsInterface) {
		this.socket.emit(event, cmd, value);
	}
}
