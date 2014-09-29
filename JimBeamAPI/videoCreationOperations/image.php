#!/bin/php
<?php

function overlay($img1, $img2, $file) {

  exec("composite -geometry +100+100 $img2 $img1 $file");
  #exec("montage -geometry +100+150 -quality 60 $img2 $img1 $file");

/*
  $logo_file = $img2; 
  $image_file = $img1; 
  $targetfile = $file; 
  $photo = imagecreatefrompng($image_file); 
  $fotoW = imagesx($photo); 
  $fotoH = imagesy($photo); 
  $logoImage = imagecreatefrompng($logo_file); 
  $logoW = imagesx($logoImage); 
  $logoH = imagesy($logoImage); 
  $photoFrame = imagecreatetruecolor($fotoW,$fotoH); 
  $dest_x = $fotoW - $logoW; 
  $dest_y = $fotoH - $logoH; 
  imagecopyresampled($photoFrame, $photo, 0, 0, 0, 0, $fotoW, $fotoH, $fotoW, $fotoH); 
  imagecopy($photoFrame, $logoImage, $dest_x, $dest_y, 0, 0, $logoW, $logoH); 
  imagepng($photoFrame, $targetfile, 8);

  imagedestroy($photo);
  imagedestroy($logoImage);
  imagedestroy($photoFrame);
*/
}

$path_src = './images/';
$path_dest = './images-overlay/';
$format = '%07d';
$format_head = '%03d';
$path_head = './heads/';

$s = 0; 
if ($handle = opendir($path_src))
{
  while (($file = readdir($handle)) !== false)
  {
     if (!in_array($file, array('.', '..')) && !is_dir($path_src.$file)) 
       $s++;
  }
}

echo PHP_EOL . 'There are ' . $s . ' images to process.' . PHP_EOL;

$start = microtime(true);

$h=0;
for ($i=1; $i <= $s; $i++) {
  $img1 = './images/image-' . sprintf($format, $i) . '.png';
  $img2 = './heads/head-' . sprintf($format_head, $h) . '.png';
  $dest = './images-overlay/image-' . sprintf($format, $i) . '.png';
  overlay($img1, $img2, $dest);
  ($h <= 359)? $h++ : $h=0;
}

$end = microtime(true);
$time_taken = $end - $start;

echo PHP_EOL . 'Process Time: ' . $time_taken . ' seconds' . PHP_EOL . PHP_EOL;

