#!/bin/bash

for file in common/*.*
do
	ln -f $file ./chrome/
	ln -f $file ./firefox/data/
done

for file in common/lib/*.*
do
	ln -f $file ./chrome/lib
	ln -f $file ./firefox/data/lib
done
