#!/bin/bash
clear

readonly MOVIE=11508_42577_a_4.mp4
#readonly IMAGE=md-logo.png
#readonly DURATION=$(ffmpeg -i $MOVIE  2>&1 | grep 'Duration' | cut -d ' ' -f 4 | sed s/,//)
#readonly SECONDS=$(date -d $DURATION)
#echo $DURATION
#echo $SECONDS
#ffmpeg -acodec copy -vcodec copy -ss 0 -t 00:15:00 -i ORIGINALFILE.mp4 OUTFILE-1.mp4
#ffmpeg -acodec copy -vcodec copy -ss 00:15:00 -t 00:15:00 -i ORIGINALFILE.mp4 OUTFILE-2.mp4
#ffmpeg -acodec copy -vcodec copy -ss 00:30:00 -t 00:15:00 -i ORIGINALFILE.mp4 OUTFILE-3.mp4

rm audio.mp3
rm out.mp4
rm sliced.mp4
rm -rf ./images
rm -rf ./images-overlay
rm -rf ./heads
mkdir ./images
mkdir ./images-overlay
mkdir ./heads
php video_slice.php
php head.php
php image.php
php video_create.php
ls -lah
