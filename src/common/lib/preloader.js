/*
	http://codepen.io/zachernuk/details/myQpBO
*/
function Preloader(opt){
	$.extend(true, this, opt);

	var requestAnimationFrame = window.requestAnimationFrame ||
								window.mozRequestAnimationFrame ||
                        		window.webkitRequestAnimationFrame ||
								window.msRequestAnimationFrame,
		c = document.createElement('canvas'),
		g = c.getContext('2d');
	c.width = this.width || (this.width = 50);
	c.height = this.height || (this.height = 50);
	var TOTALRAD = this.height/5;

	this.run = function(){
		var self = this;
		this.update();
		requestAnimationFrame(function(){
			self.run();
		});
		return c;
	};
	this.hide = function(){
		$(c).hide();
	};
	this.update = function() {
		var DURATION = 3.5;
		var LAYERS = 7;

		c.width= this.width;
		g.translate(this.width/2, this.height/2);
		g.strokeStyle = this.color || (this.color = "#808080");
		g.lineWidth= TOTALRAD/LAYERS+0.2;

		var now = (new Date().getTime()/1000)%DURATION;
		g.rotate(-now*Math.PI/DURATION-0.5);

		for (var i = 0; i < LAYERS; i++) {
			var pi = now/DURATION;
			pi = ease(pi);
			pi = Math.max(0,Math.min(0.999, pi+i/20));
			pi = ease(pi);
			pi = ease(pi);
			pi = ease(pi);
			pi = ease(pi);
			pi = ease(pi);
			pi +=1;
			g.globalAlpha = 0.9-i/LAYERS;
			g.beginPath();
			g.arc(0, 0, TOTALRAD+TOTALRAD*i/LAYERS, Math.PI*pi, Math.PI*pi+Math.PI);
			g.stroke();
		}
	};
	function ease(pi, a, b) {
		var ip = 1 - pi;
		return 3*ip*ip*pi*(a||0.05) + 3*ip*pi*pi*(b||0.95) + 1*pi*pi*pi;
	}
}
