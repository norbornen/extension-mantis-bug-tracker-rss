SHELL=/bin/bash
KANGODIR=/opt/kango-framework/

build:
	python $(KANGODIR)/kango.py build ./

up:
	(git status && git pull)

ci:
	cp `ls -1 output/mantisbugtrackerbrowserextention*.crx | sort -r | head -n 1` EXTENSIONS/mantisbugtrackerbrowserextention.crx
	cp `ls -1 output/mantisbugtrackerbrowserextention*.xpi | sort -r | head -n 1` EXTENSIONS/mantisbugtrackerbrowserextention.xpi
	git status
	git add *
	git ci -m '.'
	git push
