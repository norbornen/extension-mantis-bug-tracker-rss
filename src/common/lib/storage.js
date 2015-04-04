function Storage(){
	this.urlsName = 'urls';
	this.badgeName = 'badge';
	this.itemsName = 'items';
}
Storage.prototype = {
	/*
		Urls
	*/
	'rawData': function(){
		return kango.storage.getItem(this.urlsName) || {};
	},
	'urls': function(){
		return Object.keys(this.rawData());
	},
	'touchUrl': function(url){
		url = url.replace(/^\s+|\s+$/g, '');
		var data = this.rawData();
		if (!data.hasOwnProperty(url)) {
			data[url] = {};
			this.save(data);
		}
	},
	'save' : function(data){
		kango.storage.setItem(this.urlsName, data);
	},
	'renew' : function(urls){
		var data = this.rawData(),
			newData = {};
		urls.forEach(function(url){
			url = url.replace(/^\s+|\s+$/g, '');
			newData[ url ] = data[ url ] || {};
		});
		this.save(newData);
	},

	/*
		Badge
	*/
	'badge' : function (n){
		var badge = kango.storage.getItem(this.badgeName);
		return parseInt(badge || 0, 10);
	},
	'saveBadge' : function(n) {
		if (n > 0) {
			kango.storage.setItem(this.badgeName, parseInt(n, 10));
		}
	},

	/*
		Items
	*/
	'items' : function (n){
		return kango.storage.getItem(this.itemsName) || [];
	},
	'saveItems' : function(items) {
		kango.storage.setItem(this.itemsName, items || []);
	}
};
