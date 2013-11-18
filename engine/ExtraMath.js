define(function(){

	var TO_RADIANS = Math.PI/180;
	var TO_DEGREES = 180/Math.PI;

	var ExtraMath = {

		TO_RADIANS : Math.PI/180,

		TO_DEGREES : 180/Math.PI,

		rotatePoints : function(x,y,angle)
		{
			angle *= TO_RADIANS;
			var point={};
			point.x = x*Math.cos(angle) - y*Math.sin(angle);
			point.y = x*Math.sin(angle) + y*Math.cos(angle);
			return point;
		},

		distance : function( point1, point2 )
		{
			var xs = 0;
			var ys = 0;
			xs = point2.x - point1.x;
			xs = xs * xs;
			ys = point2.y - point1.y;
			ys = ys * ys;
			return Math.sqrt( xs + ys );
		},

		angle :function(point1, point2)
		{
			calcAngle = Math.atan2(point1.x-point2.x,point1.y-point2.y) * TO_DEGREES;
			return calcAngle < 0 ? Math.abs(calcAngle) : 360 - calcAngle;
		},

		damp: function(Vel,Co,Dt)
		{
		    return (Vel - (Vel * Co * Dt));
		},

		dot : function(vec1,vec2)
		{
			return vec1.x*vec2.x+vec1.y*vec2.y;
		},

		lerp : function(a,b,t) { return a + t * (b - a); },
		vec_lerp : function(a,b,t) { return {x:this.lerp(a.x,b.x,t),y:this.lerp(a.y,b.y,t)}; },

		wrap : function(value, lower, upper)
		{
			dist = upper - lower;
			times = Math.floor((value - lower) / dist);
			return value - (times * dist);
		},

		short_angle : function(angle1,angle2)
		{
			diff = angle1 - angle2;
			dangle = this.wrap(diff, 0.0, 360);
			if(dangle >= 180.0) dangle -= 360.0;
			return dangle;
		},

		angle_distance : function(angle1,angle2)
		{
			mod_diff = (angle1 - angle2) % 360.0;
			mod_diff = mod_diff > 180.0 ? 360.0 - mod_diff : mod_diff;
			diff=mod_diff;
			return diff;
		},

		clip : function(number, min, max)
		{
			return Math.max(min, Math.min(number, max));
		},

		hitrect : function(rect,point)
		{
			if(	rect[0].x <= point.x && rect[1].x >= point.x &&
				rect[0].y <= point.y && rect[1].y >= point.y) return true;
			return false;
		},

		intersect : function(rect1,rect2)
		{
		return 	!(	rect2[0].x > rect1[1].x ||
					rect2[1].x < rect1[0].x ||
					rect2[0].y > rect1[1].y ||
					rect2[1].y < rect1[0].y);
		},

		crossintersect : function(rect1,rect2)
		{
			if(intersect(rect1,rect2)) return true;
			if(intersect(rect2,rect1)) return true;
			return false;
		}
	}

	var nope='';
	return ExtraMath;

});
