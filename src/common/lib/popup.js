KangoAPI.onReady(function(){
	/*
		Установим родную локаль пользователя
	*/
	var locale = window.navigator.userLanguage || window.navigator.language || 'en';
	moment.locale(locale);

	/*
		Покажем как открывается страница с настройками
	*/
	$('[role="icon-settings"]').on('click', function(){
		kango.ui.optionsPage.open();
	}).tooltip();

	/*
		Навесим обработчики на ссылки
	*/
	$('#content').on('click', 'a', function(e){
		e.stopPropagation();
		e.preventDefault();
		kango.browser.tabs.create({'url': $(this).attr('href')});
	});


	var storage = new Storage();
	var tasks = storage.urls().map(function(url){ return ajax(url) });
	Q.all(tasks).then(
		function(results){
			var items = [],
				dates =[],
				errors = [];
			results.forEach(function(n){
				if (n.error) {
					errors.push(new Err(n));
				} else {
					var list = !n.item ? [] : !Array.isArray(n.item) ? [n.item] : n.item; delete n.item;
					(list || []).forEach(function(item){
						item.feed = n;
						items.push(new Item(item));
						dates.push(Date.parse(item.pubDate));
					});
				}
			});

			/*
				обновим счётчик и погасим бейдж
			*/
			(new Badge()).handle(Math.max.apply(Math, dates), 1);

			/*
				собраны записи с нескольких потоков. отсортируем их
			*/
			items = items.sort(function(a, b){ return Date.parse(b.pubDate) - Date.parse(a.pubDate); });

			/*
				display it
			*/
			var divItems = $('#mantis'), divErrors = $('#errors');
			divItems.empty();
			divErrors.empty();
			items.forEach(function(o){
				o.write(divItems);
			});
			errors.forEach(function(o){
				o.write(divErrors);
			});
			$('[data-toggle="tooltip"]', divItems).tooltip();
		},
		function(err){
			console.error(err);
		}
	);
});

function Item(data) {
	var self = this;
	$.extend(true, this, data);

	this.write = function(el){
		var html = tmpl('template_mantis', {
			'title': self.title,
			'href': self.link,
			'date': moment(self.pubDate).calendar(),
			'category': self.category,
			'feed': self.feed.title,
			'feedHref': self.feed.link
		});
		if (el) {
			el.append(html);
		}
		return html;
	};
}
function Err(data){
	var self = this;
	$.extend(true, this, data);

	this.write = function(el){
		var html = tmpl('template_error', self);
		if (el) {
			el.append(html);
		}
		return html;
	};
}
