function ajax(url) {
	return new Promise(function(resolve, reject) {
		kango.xhr.send(
			{
				'url'			: url,
				'method'		: 'GET',
				'async'			: true
			},
			function(data) {
				if (data.status == 200 && data.response != null) {
					var txt = data.response, result;
					txt = txt.replace(/^\s+/g, '');
					if (/\.json$/.test(url) || txt.indexOf('{') === 0) {
						result = JSON.parse(txt);
					} else if (/\.xlm$/.test(url) || /\.rss$/.test(url) || txt.indexOf('<') === 0) {
						var xml = (new window.DOMParser()).parseFromString(txt, "text/xml");
						var json = JSON.parse(xml2json(xml, ''));
						result = json.hasOwnProperty('rss') ? json.rss.channel : json;
					} else {
						result = {'error': 'Could not detect content type for ' + url, 'txt': txt};
					}
					return resolve(result);
				} else {
					return resolve({'url': url, 'status': data.status, 'error': data.response || 'Could not load ' + url});
				}
			}
		);
	});
}
