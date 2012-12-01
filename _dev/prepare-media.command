#!/bin/bash

cd `dirname $0`		# when run as .command, need to use this to have the correct PWD
echo $PWD


# prepare the images
cd ../_img

for f in *_bg.* ; do
	# see: 	http://www.imagemagick.org/Usage/blur/
	# 		http://www.imagemagick.org/script/command-line-options.php
	# convert $f -blur 0x4 -quality 80 ../img/${f%.*}.jpg
	convert $f -blur 0x4 -quality 80 -resize 800x ../img/${f%.*}.jpg
done

for f in *_icon.* ; do
	convert $f -resize 100x100 ../img/${f%.*}.png
done
