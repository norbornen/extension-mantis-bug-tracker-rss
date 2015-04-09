SHELL=/bin/bash
KANGODIR=/opt/kango-framework/

up:
	(git status && git pull)

ci:
	git status
	git pull
	git add src/common/* EXTENSIONS/*
	git ci -m '.' -a
	git push

_build:
	python $(KANGODIR)/kango.py build ./

build:
	rm -rf `find . -name '.DS_Store'`
	rm -rf `find . -name DEADJOE`
	rm -f src/common/static/bootstrap/css/bootstrap-theme.css
	rm -f src/common/static/bootstrap/css/bootstrap-theme.css.map
	rm -f src/common/static/bootstrap/css/bootstrap-theme.min.css
	rm -f src/common/static/bootstrap/css/bootstrap.css
	rm -f src/common/static/bootstrap/css/bootstrap.css.map
	rm -f src/common/static/bootstrap/js/bootstrap.js
	rm -f src/common/static/bootstrap/js/npm.js
	python $(KANGODIR)/kango.py build ./
	cp `ls -1 output/mantisbugtracker*.crx | sort -r | head -n 1` EXTENSIONS/mantisbugtrackerbrowserextention.crx
	cp `ls -1 output/mantisbugtracker*.xpi | sort -r | head -n 1` EXTENSIONS/mantisbugtrackerbrowserextention.xpi
