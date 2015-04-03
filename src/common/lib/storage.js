function Storage(){
	this.storageName = 'urls';
	this.badgeName = 'badge';
}
Storage.prototype = {
	'rawData': function(){
		return kango.storage.getItem(this.storageName) || {};
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
		kango.storage.setItem(this.storageName, data);
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

	'badge' : function (n){
		var badge = kango.storage.getItem(this.badgeName);
		return parseInt(badge || 0, 10);
	},
	'saveBadge' : function(n) {
		if (n > 0) {
			kango.storage.setItem(this.badgeName, parseInt(n, 10));
		}
	}
};
