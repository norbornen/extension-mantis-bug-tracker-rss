SHELL=/bin/bash
KANGODIR=/opt/kango-framework/

build:
	python $(KANGODIR)/kango.py build ./

up:
	(git status && git pull)

ci:
	rm -rf `find . -name '.DS_Store'`
	rm -rf `find . -name DEADJOE`
	cp `ls -1 output/mantisbugtracker*.crx | sort -r | head -n 1` EXTENSIONS/mantisbugtrackerbrowserextention.crx
	cp `ls -1 output/mantisbugtracker*.xpi | sort -r | head -n 1` EXTENSIONS/mantisbugtrackerbrowserextention.xpi
	git status
	git add src/common/* EXTENSIONS/*
	git ci -m '.' -a
	git push
