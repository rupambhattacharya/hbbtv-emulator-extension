/**
 * HbbTV Emulator - Player Type Detection
 * Decides which player (dash/hls/native) should handle a URL.
 */

export function detectPlayerType(url) {
  if (!url) return 'native';

  // Decide by the file extension of the URL path (query/fragment stripped)
  var path = url.toLowerCase().split('#')[0].split('?')[0];
  var extMatch = path.match(/\.([a-z0-9]+)$/);
  if (extMatch) {
    var ext = extMatch[1];
    if (ext === 'mpd') return 'dash';
    if (ext === 'm3u8') return 'hls';
    if (ext === 'mp4' || ext === 'm4v' || ext === 'webm' || ext === 'mpeg' ||
        ext === 'mpg' || ext === 'ts' || ext === 'mp3' || ext === 'aac') {
      return 'native';
    }
  }

  // No recognizable extension: fall back to heuristics
  if (path.indexOf('.mpd') !== -1 || path.indexOf('dash') !== -1) {
    return 'dash';
  }
  if (path.indexOf('.m3u8') !== -1) {
    return 'hls';
  }
  return 'native';
}
