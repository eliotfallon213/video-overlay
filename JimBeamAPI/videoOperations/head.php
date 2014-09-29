#!/bin/php
<?php

function overlay($img1, $degree, $file) {
  exec("convert -background None -rotate $degree $img1 $file");
}

$path_src = './';
$path_dest = './heads/';
$format = '%03d';
$img1 = './obama-head.png';

$start = microtime(true);

for ($i=0; $i <= 360; $i++) {
  $dest = './heads/head-' . sprintf($format, $i) . '.png';
  overlay($img1, $i, $dest);
}

$end = microtime(true);
$time_taken = $end - $start;

echo PHP_EOL . 'Process Time: ' . $time_taken . ' seconds' . PHP_EOL . PHP_EOL;
