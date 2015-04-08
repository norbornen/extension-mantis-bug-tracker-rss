function MantisBTExtension() {
    var self = this;

    setTimeout(function(){
        self.poll();
    }, 10000);
}

MantisBTExtension.prototype = {
    'poll' : function(){
        var self = this,
            tasks = app.storage.urls().map(function(url){
                        return app.ajax(url);
                    });

    	if (tasks.length > 0) {
            Q.all(tasks).then(
        		function(results){
        			var dates = [];
        			results.forEach(function(n){
        				if (!n.error) {
                            var list = !n.item ? [] : !Array.isArray(n.item) ? [n.item] : n.item; delete n.item;
                            list.forEach(function(item){
                                dates.push(Date.parse(item.pubDate));
                            });
        				}
        			});
                    app.badge.handle(Math.max.apply(Math, dates));
        		},
        		function(err){
        			console.error(err);
        		}
        	);
        } else {
            app.badge.touch('?');
        }

        setTimeout(function(){
            self.poll();
        }, 10*60*1000);
    }
};

var extension = new MantisBTExtension();
