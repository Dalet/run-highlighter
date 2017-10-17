#!/bin/bash

for file in common/*.*
do
	ln -f $file ./chrome/
	ln -f $file ./firefox/webextension/
done
