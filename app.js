const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const tracks = [
  { title: 'Blue Skies', artist: 'Nova Lane', duration: '3:24', art: 'linear-gradient(135deg,#e5c17e,#8da97a)' },
  { title: 'Electric Dreams', artist: 'Velvet Echo', duration: '2:58', art: 'linear-gradient(135deg,#3e2c78,#d45c9e)' },
  { title: 'Somewhere, Slowly', artist: 'June Wilder', duration: '4:12', art: 'linear-gradient(135deg,#9ac3bd,#31485b)' },
  { title: 'Satellite Heart', artist: 'Atlas Bloom', duration: '3:41', art: 'linear-gradient(135deg,#6c9ca6,#192d48)' },
  { title: 'Midnight City', artist: 'Neon Avenue', duration: '3:52', art: 'linear-gradient(135deg,#5b4b9a,#d66ba6)' },
  { title: 'Golden Hour', artist: 'Mira Sol', duration: '3:18', art: 'linear-gradient(135deg,#e8bb67,#d77c56)' },
  { title: 'Focus Flow', artist: 'Soundwave Studio', duration: '5:04', art: 'linear-gradient(135deg,#a9c4ef,#24364e)' },
  { title: 'After Hours', artist: 'Velvet Echo', duration: '3:36', art: 'linear-gradient(135deg,#30164f,#d26d87)' },
  { title: 'The Daily Lift', artist: 'Soundwave Mix', duration: '30:00', art: 'linear-gradient(135deg,#a9c879,#354f45)' },
  { title: 'Bedroom Pop', artist: 'Soundwave Mix', duration: '28:00', art: 'linear-gradient(135deg,#f2a4be,#7f75bd)' },
  { title: 'Soft Reset', artist: 'Soundwave Mix', duration: '25:00', art: 'linear-gradient(135deg,#9bb8c6,#3c5163)' },
  { title: 'Indie Radar', artist: 'Soundwave Mix', duration: '32:00', art: 'linear-gradient(135deg,#e3a879,#503d6f)' }
];
let currentTrack = null;
let isPlaying = false;
let elapsed = 0;
let timer = null;
let liked = false;
let shuffle = false;
let repeat = false;
let toastTimer;
const parseTime = (value) => { const [m, s] = value.split(':').map(Number); return m * 60 + s; };
const formatTime = (value) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}
function findTrack(title) { return tracks.find(track => track.title.toLowerCase() === title.toLowerCase()) || { title, artist: 'Soundwave Mix', duration: '3:30', art: 'linear-gradient(135deg,#b9f36a,#354f45)' }; }
function renderPlayer() {
  if (!currentTrack) return;
  $('#nowTitle').textContent = currentTrack.title;
  $('#nowArtist').textContent = currentTrack.artist;
  $('#nowArt').style.background = currentTrack.art;
  $('#nowArt').textContent = '♫';
  $('#totalTime').textContent = currentTrack.duration;
  $('#currentTime').textContent = formatTime(elapsed);
  $('#progress').value = Math.min(100, elapsed / parseTime(currentTrack.duration) * 100);
  $('#progress').style.background = `linear-gradient(to right,var(--green) 0%,var(--green) ${$('#progress').value}%,#414141 ${$('#progress').value}%,#414141 100%)`;
  $('#mainPlay').textContent = isPlaying ? 'Ⅱ' : '▶';
  $('#mainPlay').setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
  $('#likeButton').textContent = liked ? '♥' : '♡';
  $('#likeButton').classList.toggle('liked', liked);
  $$('.track-row').forEach(row => {
    const active = row.dataset.play === currentTrack.title;
    row.classList.toggle('playing', active);
    const playIcon = $('.track-play', row);
    if (playIcon) playIcon.textContent = active && isPlaying ? 'Ⅱ' : '▶';
  });
}
function playTrack(title) {
  currentTrack = findTrack(title);
  elapsed = 0;
  isPlaying = true;
  liked = false;
  renderPlayer();
  clearInterval(timer);
  timer = setInterval(() => {
    if (!isPlaying || !currentTrack) return;
    elapsed += 1;
    if (elapsed >= parseTime(currentTrack.duration)) {
      if (repeat) elapsed = 0;
      else { elapsed = parseTime(currentTrack.duration); isPlaying = false; clearInterval(timer); }
    }
    renderPlayer();
  }, 1000);
}
function togglePlay() {
  if (!currentTrack) { playTrack('Blue Skies'); return; }
  isPlaying = !isPlaying;
  renderPlayer();
}
function nextTrack(direction = 1) {
  const pool = shuffle ? [...tracks].sort(() => Math.random() - .5) : tracks;
  const index = pool.findIndex(track => track.title === currentTrack?.title);
  const next = pool[(index + direction + pool.length) % pool.length];
  playTrack(next.title);
}
$$('[data-play]').forEach(element => element.addEventListener('click', () => playTrack(element.dataset.play)));
$('#mainPlay').addEventListener('click', togglePlay);
$('#nextButton').addEventListener('click', () => nextTrack(1));
$('#previousButton').addEventListener('click', () => { if (elapsed > 3) { elapsed = 0; renderPlayer(); } else nextTrack(-1); });
$('#progress').addEventListener('input', event => {
  if (!currentTrack) return;
  elapsed = Math.round(parseTime(currentTrack.duration) * Number(event.target.value) / 100);
  renderPlayer();
});
$('#volume').addEventListener('input', event => {
  event.target.style.background = `linear-gradient(to right,var(--green) 0%,var(--green) ${event.target.value}%,#414141 ${event.target.value}%,#414141 100%)`;
});
$('#likeButton').addEventListener('click', () => {
  if (!currentTrack) { showToast('Play a track first to save it to Liked Songs.'); return; }
  liked = !liked;
  renderPlayer();
  showToast(liked ? `Added “${currentTrack.title}” to Liked Songs` : 'Removed from Liked Songs');
});
$('#shuffleButton').addEventListener('click', event => {
  shuffle = !shuffle;
  event.currentTarget.style.color = shuffle ? 'var(--green)' : '';
  showToast(shuffle ? 'Shuffle is on' : 'Shuffle is off');
});
$('#repeatButton').addEventListener('click', event => {
  repeat = !repeat;
  event.currentTarget.style.color = repeat ? 'var(--green)' : '';
  showToast(repeat ? 'Repeat is on' : 'Repeat is off');
});
$('#createPlaylist').addEventListener('click', () => { $('#playlistName').value = ''; $('#playlistDialog').showModal(); $('#playlistName').focus(); });
$('#savePlaylist').addEventListener('click', event => {
  const input = $('#playlistName');
  if (!input.reportValidity()) { event.preventDefault(); return; }
  const name = input.value.trim();
  if (!name) { event.preventDefault(); input.focus(); return; }
  const button = document.createElement('button');
  button.className = 'collection-item';
  const cover = document.createElement('span'); cover.className = 'collection-cover focus-cover'; cover.textContent = '♫';
  const details = document.createElement('span');
  const title = document.createElement('b'); title.textContent = name;
  const subtitle = document.createElement('small'); subtitle.textContent = 'Playlist · 0 songs';
  details.append(title, subtitle); button.append(cover, details);
  $('#collectionList').prepend(button);
  showToast(`Playlist “${name}” created`);
});
$('#upgradeButton').addEventListener('click', () => showToast('Premium preview — this demo has no paid features.'));
$('#installButton').addEventListener('click', () => showToast('Tip: use your browser menu to install or create a shortcut.'));
$$('.see-all').forEach(button => button.addEventListener('click', () => showToast(`You're viewing all available ${button.dataset.seeAll === 'mixes' ? 'personalized mixes' : 'trending tracks'} in this demo.`)));
$('#backButton').addEventListener('click', () => { if (history.length > 1) history.back(); else showToast('You are on the home screen.'); });
$('#forwardButton').addEventListener('click', () => { history.forward(); });
$$('.nav-link').forEach(link => link.addEventListener('click', () => {
  $$('.nav-link').forEach(item => item.classList.remove('active'));
  link.classList.add('active');
}));
$$('.collection-item').forEach(button => button.addEventListener('click', () => {
  const title = $('b', button)?.textContent || 'Daily Mix 01';
  if (title === 'Liked Songs') showToast('Your liked tracks will appear here as you save them.');
  else if (title === 'Your Library') $('#library').scrollIntoView({ behavior: 'smooth' });
  else showToast(`Opening ${title} — choose a track to start listening.`);
}));
$('#volume').style.background = 'linear-gradient(to right,var(--green) 0%,var(--green) 65%,#414141 65%,#414141 100%)';
// This is a front-end UI prototype: controls demonstrate player states; no copyrighted audio is streamed.