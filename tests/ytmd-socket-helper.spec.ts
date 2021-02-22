import {expect} from "chai";
import {YtmdSocketHelper} from "../src/helper/ytmd-socket-helper";
import io, {Server} from 'socket.io';

describe('YTMD-Socket-Helper Socket', () => {
	let server: Server;
	let client: YtmdSocketHelper;

	beforeEach(() => {
		server = new io(5000);
		client = YtmdSocketHelper.getInstance();

		server.on('connection', socket => {
			socket.on('media-commands', (cmd, value) =>
				socket.emit('tick', {cmd, value})
			)

			socket.on('retrieve-info', () =>
				socket.emit('info', true)
			)

			socket.on('query-player', () =>
				socket.emit('player', true)
			)

			socket.on('query-track', () =>
				socket.emit('track', true)
			)

			socket.on('query-queue', () =>
				socket.emit('queue', true)
			)

			socket.on('query-playlist', () =>
				socket.emit('playlist', true)
			)

			socket.on('query-lyrics', () =>
				socket.emit('lyrics', true)
			)
		});
	});

	afterEach(() => {
		server.close();
		client.disconnect();
	})

	describe('connection', () => {
		it('should error', done => {
			const sub = client.onError$.subscribe(() => {
				sub.unsubscribe();
				return done();
			});
			client.setConnection({port: '5001', host: 'localhost', password: ''});
		}).timeout(5000)

		it('should connect', done => {
			let test = 0;
			const sub = client.onConnect$.subscribe(() => {
				sub.unsubscribe();
				return done();
			});
			const sub2 = client.onError$.subscribe(() => {
				test++;
				sub2.unsubscribe();
				if (test === 0)
					done(Error('Error while connecting'));
			});
			client.setConnection({port: '5000', host: 'localhost', password: ''});
		}).timeout(5000);
	});
	describe('methods', () => {
		beforeEach(() => {
			client.setConnection({password: '', host: 'localhost', port: '5000'});
		});

		it('trackPlayPause should get {cmd: "track-play-pause"}', () => {
			client.onTick$.subscribe(data => {
				expect(data).to.be.deep.equals({cmd: "track-play-pause"});
			});
			client.trackPlayPause();
		});

		it('trackPlay should get {cmd: "track-play"}', () => {
			client.onTick$.subscribe(data => {
				expect(data).to.be.deep.equals({cmd: "track-play"});
			});
			client.trackPlay();
		});

		it('trackPause should get {cmd: "track-pause"}', () => {
			client.onTick$.subscribe(data => {
				expect(data).to.be.deep.equals({cmd: "track-pause"});
			});
			client.trackPause();
		});

		it('trackNext should get {cmd: "track-previous"}', () => {
			client.onTick$.subscribe(data => {
				expect(data).to.be.deep.equals({cmd: "track-previous"});
			});
			client.trackNext();
		});

		it('trackThumbsUp should get {cmd: "track-thumbs-up"}', () => {
			client.onTick$.subscribe(data => {
				expect(data).to.be.deep.equals({cmd: "track-thumbs-up"});
			});
			client.trackThumbsUp();
		});

		it('trackThumbsDown should get {cmd: "track-thumbs-down"}', () => {
			client.onTick$.subscribe(data => {
				expect(data).to.be.deep.equals({cmd: "track-thumbs-down"});
			});
			client.trackThumbsDown();
		});

		it('playerVolumeUp should get {cmd: "player-volume-up"}', () => {
			client.onTick$.subscribe(data => {
				expect(data).to.be.deep.equals({cmd: "player-volume-up"});
			});
			client.playerVolumeUp();
		});

		it('playerVolumeDown should get {cmd: "player-volume-down"}', () => {
			client.onTick$.subscribe(data => {
				expect(data).to.be.deep.equals({cmd: "player-volume-down"});
			});
			client.playerVolumeDown();
		});

		it('playerForward should get {cmd: "player-forward"}', () => {
			client.onTick$.subscribe(data => {
				expect(data).to.be.deep.equals({cmd: "player-forward"});
			});
			client.playerForward();
		});

		it('playerRewind should get {cmd: "player-rewind"}', () => {
			client.onTick$.subscribe(data => {
				expect(data).to.be.deep.equals({cmd: "player-rewind"});
			});
			client.playerRewind();
		});

		it('playerSetSeekbar should get {cmd: "player-set-seekbar", value: 100}', () => {
			client.onTick$.subscribe(data => {
				expect(data).to.be.deep.equals({cmd: "player-set-seekbar", value: 100});
			});
			client.playerSetSeekbar(100);
		});

		it('playerSetVolume should get {cmd: "player-set-volume", value: 100}', () => {
			client.onTick$.subscribe(data => {
				expect(data).to.be.deep.equals({cmd: "player-set-volume", value: 100});
			});
			client.playerSetVolume(100);
		});

		it('playerSetQueue should get {cmd: "player-set-queue", value: 1}', () => {
			client.onTick$.subscribe(data => {
				expect(data).to.be.deep.equals({cmd: "player-set-queue", value: 1});
			});
			client.playerSetQueue(1);
		});

		it('playerRepeat should get {cmd: "player-repeat"}', () => {
			client.onTick$.subscribe(data => {
				expect(data).to.be.deep.equals({cmd: "player-repeat"});
			});
			client.playerRepeat();
		});

		it('playerShuffle should get {cmd: "player-shuffle"}', () => {
			client.onTick$.subscribe(data => {
				expect(data).to.be.deep.equals({cmd: "player-shuffle"});
			});
			client.playerShuffle();
		});

		it('playerAddLibrary should get {cmd: "player-add-library"}', () => {
			client.onTick$.subscribe(data => {
				expect(data).to.be.deep.equals({cmd: "player-add-library"});
			});
			client.playerAddLibrary();
		});

		it('playerAddPlaylist should get {cmd: "player-add-playlist", value: 1}', () => {
			client.onTick$.subscribe(data => {
				expect(data).to.be.deep.equals({cmd: "player-add-playlist", value: 1});
			});
			client.playerAddPlaylist(1);
		});

		it('showLyricsHidden should get {cmd: "show-lyrics-hidden"}', () => {
			client.onTick$.subscribe(data => {
				expect(data).to.be.deep.equals({cmd: "show-lyrics-hidden"});
			});
			client.showLyricsHidden();
		});

		it('requestPlayer should get true', () => {
			client.onPlayer$.subscribe(data => {
				expect(data).to.be.true;
			})
			client.requestPlayer();
		});

		it('requestTrack should get true', () => {
			client.onTrack$.subscribe(data => {
				expect(data).to.be.true;
			})
			client.requestTrack();
		});

		it('requestQueue should get true', () => {
			client.onQueue$.subscribe(data => {
				expect(data).to.be.true;
			})
			client.requestQueue();
		});

		it('requestPlaylist should get true', () => {
			client.onPlaylist$.subscribe(data => {
				expect(data).to.be.true;
			})
			client.requestPlaylist();
		});

		it('requestLyrics should get true', () => {
			client.onLyrics$.subscribe(data => {
				expect(data).to.be.true;
			})
			client.requestLyrics();
		})
	});
});
