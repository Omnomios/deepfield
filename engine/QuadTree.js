define(['ExtraMath','GameState'],function(ExtraMath, GameState){

	var QT_NODES = 5;
	var QT_CHILD_TL = 0;
	var QT_CHILD_TR = 1;
	var QT_CHILD_BL = 2;
	var QT_CHILD_BR = 3;

	var qt_point = {x:0,y:0};
	var qt_aabb = [qt_point,qt_point];
	var qt_node = {id:0,type:""};

	var qtcount = 0;

	function QuadTree(point1,point2,parent)
	{
		this.id = qtcount++;
		this.boundary = [point1,point2];
		this.node = [];
		this.children = [];
		this.parent = parent;
		this.size = (point2.x-point1.x) * (point2.y-point1.y);
		this.valid = true;
	}

	QuadTree.prototype = {
		remove: function remove(item) {
			for( var ns in this.node ) {
				if(this.node[ns].id == item.id) {
					this.node.splice(ns,1);

					if(item.type == "ai") {						
						delete GameState.unit[item.id].qt;
					}
				}
			}

			//Ask parent to check children.
			if(typeof this.parent != "undefined")
				this.parent.prune();
		},

		prune: function prune() {
			if(this.children.length === 0)
				return true;

			for(var si=0; si<=3; si++) {
				if(this.children[si].count() > 0) return false;
			}

			for(var si=0; si<=3; si++) {
				this.children[si].valid = true;
				delete GameState.dev_qt[this.children[si].id];
				delete this.children[si];
			}
			//Children are empty, remove them.
			this.children = [];

			//Recursive
			if(typeof this.parent != "undefined")
				this.parent.prune();

			return true;
		},


		count: function count() {
			var nodes = this.node.length;
			if(this.children.length>0)
			for(var si=0; si<=3; si++)
				nodes += this.children[si].count();

			return nodes;
		},


		insert: function insert(item) {
			//Check to see if it's within this branch.
			if(!ExtraMath.hitrect(this.boundary,item.point))
				return false;

			if (this.children.length === 0 && this.node.length < QT_NODES) {
				for( var ns in this.node ) {
					if(this.node[ns].id == item.id)
						return true;
				}

				this.node.push(item);

				if(item.type == "ai")
					GameState.unit[item.id].qt = this;

				return true;
			}

			//Subdivide and attempt to insert
			if (this.children.length === 0) this.subdivide();
			for(var si=0; si<=3; si++) {
				if(this.children[si].insert(item)) return true;
			}

			//The point cannot be inserted at all.
			return false;
		},


		subdivide: function subdivide()
		{
			lx = [];
			ly = [];

			for(var iy=0;iy<=1;iy+=0.5) {
				for(var ix=0;ix<=1;ix+=0.5) {
					lx[ix*2] = ExtraMath.lerp(this.boundary[0].x,this.boundary[1].x,ix);
					ly[iy*2] = ExtraMath.lerp(this.boundary[0].y,this.boundary[1].y,iy);
				}
			}

			this.children[QT_CHILD_TL] = new QuadTree({x:lx[0],y:ly[0]},{x:lx[1],y:ly[1]},this);
			this.children[QT_CHILD_TR] = new QuadTree({x:lx[1],y:ly[0]},{x:lx[2],y:ly[1]},this);
			this.children[QT_CHILD_BL] = new QuadTree({x:lx[0],y:ly[1]},{x:lx[1],y:ly[2]},this);
			this.children[QT_CHILD_BR] = new QuadTree({x:lx[1],y:ly[1]},{x:lx[2],y:ly[2]},this);

			for(var i in this.node) {
				for(var si=0; si<=3; si++) {
					if(this.node[i] === null) {
						console.log("Null node in QT: ",this.id);
						continue;
					}
					if(this.node[i].type == "ai" && GameState.unit[this.node[i].id] === null) {
						this.node[i] = null;
						continue;
					}
					if(this.children[si].insert(this.node[i])) break;
				}
			}
			this.node=[];
			return true;
		},

		path: function path(point,root) {
			if(typeof root == "undefined") root = [];

			//Check to see if it's within this branch.
			if(!ExtraMath.hitrect(this.boundary,point))
				return false;

			//Smallest unit in the quadtree?
			if(this.size < 4) {
			}

			if(this.children.length > 0)
			for(var si=0; si<=3; si++) {
				preroot = root;
				preroot.push(si);
				pathresult = this.children[si].path(point,preroot);
				if (pathresult !== false) return pathresult;
			}

			//Could not find that point on the tree.
			return root;
		},


		query: function query(point,size) {
			var rect;

			if(typeof size.x == "undefined")
				rect = [{x:point.x-size,y:point.y-size},{x:point.x+size,y:point.y+size}];
			else
				rect = [point,size];

			//Check to see if it's within this branch.
			if(!ExtraMath.intersect(this.boundary,rect))
				return [];

			if(this.node.length>0) {
				var outnode = [];

				for(var i in this.node) {
					if(this.node[i] === null) {
						console.log("Null node in QT: ",this.id);
						continue;
					}

					switch(this.node[i].type) {
						case "ai":
							if(GameState.unit[this.node[i].id] !== null) outnode.push(this.node[i]);
						break;

						default:
							outnode.push(this.node[i]);
						break;
					}
				}
				return outnode;
			}

			var result = [];
			if(this.children.length > 0) {
				for(var ci=0; ci<=3; ci++) {
					result = result.concat(this.children[ci].query(point,size));
				}
			}

			return result;
		},

		render: function render(label) {
			if(this.children.length > 0) {
				chl = "";
				for(var rendri=0; rendri<=3; rendri++) {
					chl += ","+this.children[rendri].id;
					this.children[rendri].render();
				}
				return;
			}

			surface.buffer.lineWidth=2;
			surface.buffer.strokeStyle="rgba(255,0,0,0.5)";

			b1 = surface.coord(this.boundary[0]);
			b2 = surface.coord(this.boundary[1]);

			surface.buffer.beginPath();
			surface.buffer.rect(b1.x, b1.y,b2.x-b1.x, b2.y-b1.y);
			surface.buffer.stroke();

			surface.buffer.lineWidth=2;

			surface.buffer.fillStyle="#00E";
			surface.buffer.font="12px Arial";
			surface.buffer.fillText(this.node.length,ExtraMath.lerp(b1.x,b2.x,0.5),ExtraMath.lerp(b1.y,b2.y,0.5));

			if(typeof label != "undefined") {
				surface.buffer.fillStyle="#E00";
				surface.buffer.font="12px Arial";
				surface.buffer.fillText(label,b1.x,b1.y);
			}

		},

		spider: function spider() {
			var children = [];

			if(this.children.length > 0) {
				for(var spideri=0; spideri<=3; spideri++) {
					children.push(this.children[spideri].spider());
				}
			}

			return {id:this.id,nodes:this.node,children:children};
		}
	};

	return QuadTree;
});
