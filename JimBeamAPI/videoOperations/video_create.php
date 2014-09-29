#!/bin/php
<?php


define("MOVIE", "11430_46875_a_5.mp4");
define("MOVIE_SLICED", 'sliced.mp4');
define("MOVIE_SLICE_TIME", '00:00:30');
define("MOVIE_OUT", 'out.mp4');
define("IMAGE","md-logo.png");
/*$duration = exec("ffmpeg -i " . MOVIE . "");

echo $duration . PHP_EOL . PHP_EOL;

$duration = exec("ffmpeg -i " . MOVIE . " 2>&1 | grep 'Duration' | cut -d ' ' -f 4 | sed s/,//");

$duration_split = explode(":", $duration);
*/

/*exec('ffmpeg -acodec copy -vcodec copy -ss 0 -t 00:00:15 -i ' . MOVIE . ' A' . MOVIE);
$duration = exec("ffmpeg -i A" . MOVIE);
echo 'AAA ' .  $duration . PHP_EOL . PHP_EOL;
exec('ffmpeg -acodec copy -vcodec copy -ss 00:00:15 -t 00:00:15 -i ' . MOVIE . ' B' . MOVIE);
$duration = exec("ffmpeg -i B" . MOVIE);
echo 'BBB ' . $duration . PHP_EOL . PHP_EOL;
exec('ffmpeg -acodec copy -vcodec copy -ss 00:00:30 -t 00:00:15 -i ' . MOVIE . ' C' . MOVIE);
$duration = exec("ffmpeg -i C" . MOVIE);
echo 'CCC ' . $duration . PHP_EOL . PHP_EOL;*/

#exec('ffmpeg -i ' . MOVIE . ' -vf "movie=' . IMAGE . ' [watermark]; [in][watermark] overlay=main_w-overlay_w-50:main_h-overlay_h-10 [out]" outputvideo.mp4');
#exec('ffmpeg -i ' . MOVIE . ' -acodec copy -vf "movie=' . IMAGE . ' [wm];[in][wm] overlay=35:35 [out]" -f mp4 -b 2500k -vcodec libx264  -ac 1 -y outputvideo.mp4');

#exec('ffmpeg -i ' . MOVIE . ' -sameq ./images/image-%07d.png');

/*$start1 = microtime(true);
usleep(2);
$time_taken1 = microtime(true) - $start1;
echo $time_taken1 . PHP_EOL;*/

#exec('ffmpeg -i ' . MOVIE . ' -ab 160k -ac 2 -ar 44100 -vn audio.mp3');

/**
 * Slice the movie
 */
exec('ffmpeg -acodec copy -vcodec copy -ss 0 -t ' . MOVIE_SLICE_TIME . ' -i ' . MOVIE . ' ' . MOVIE_SLICED);

/**
 * Movie to images
 */
#exec('ffmpeg -i ' . MOVIE_SLICED . ' -ab 160k -ac 2 -ar 11025 -vn audio.mp3');
#exec('ffmpeg -i ' . MOVIE_SLICED . '  -b:a 64k -ar 44000 -ac 1 -vn audio.mp3');
#exec('ffmpeg -i ' . MOVIE_SLICED . ' -sameq ./images/image-%07d.png');

/**
 * Put the movie back together
 */
$start = microtime(true);
#exec('ffmpeg -f image2 -i ./images/image-%07d.png -i ./images/audio.mp3 -vcodec libx264 -r 30 out.mp4');
exec('ffmpeg -f image2 -i ./images-overlay/image-%07d.png -i ./audio.mp3 -vcodec libx264 -r 30  -b 1000k out.mp4');
$end = microtime(true);
$time_taken = $end - $start;

echo PHP_EOL . 'Process Time: ' . $time_taken . ' seconds' . PHP_EOL . PHP_EOL;

