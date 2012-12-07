#!/bin/bash

cd `dirname $0`		# when run as .command, need to use this to have the correct PWD


# prepare the images
cd ../_img

for f in *_bg.* ; do
	# see: 	http://www.imagemagick.org/Usage/blur/
	# 		http://www.imagemagick.org/script/command-line-options.php
	# convert $f -blur 0x4 -quality 80 ../img/${f%.*}.jpg
	target=../img/${f%.*}.jpg
	if [[ ! -e $target ]] ; then
		echo "creating $target"
		convert $f -blur 0x4 -quality 80 -resize 1024x $target
	fi
done
for f in *_icon.* ; do
	target=../img/${f%.*}.png
	if [[ ! -e $target ]] ; then
		echo "creating $target"
		convert $f -resize 100x100 $target
	fi
done
