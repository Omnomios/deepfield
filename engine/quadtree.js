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
	
	this.remove = remove;
	function remove(id)
	{
		delete ai[id].qt;
		this.node.splice(this.node.indexOf(id),1);
		
		//Ask parent to check children.
		if(this.parent != undefined)
			this.parent.prune();
	}

	this.prune = prune;
	function prune()
	{
		for(var si=0; si<=3; si++)
			if(this.children[si].count() > 0) return false;

		for(var si=0; si<=3; si++)
		{
			this.children[si].valid = true;
			delete this.children[si];
		}
		//Children are empty, remove them.
		this.children = [];

		//Recursive
		if(this.parent != undefined)
			this.parent.prune();		

		return true;
	}


	this.count = count;
	function count()
	{
		var nodes = this.node.length;
		if(this.children.length>0)
		for(var si=0; si<=3; si++)
			nodes += this.children[si].count();

		return nodes;	
	}


	this.insert = insert;
	function insert(id,type,point)
	{
		//Check to see if it's within this branch.
		if(!hitrect(this.boundary,point))
			return false;

		if (this.children.length == 0 && this.node.length < QT_NODES)
		{
			if(this.node.indexOf(id) == -1)
				this.node.push(id);
			ai[id].qt = this;
			return true;
		}

		//Subdivide and attempt to insert
		if (this.children.length == 0) this.subdivide();
		for(var si=0; si<=3; si++)
		{
			if(this.children[si].insert(id,type,point)) return true;
		}

		//The point cannot be inserted at all.
		return false;
	}


	this.subdivide = subdivide;
	function subdivide()
	{
		lx = [];
		ly = [];

		for(var iy=0;iy<=1;iy+=0.5)
			for(var ix=0;ix<=1;ix+=0.5)
			{
				lx[ix*2] = lerp(this.boundary[0].x,this.boundary[1].x,ix);
				ly[iy*2] = lerp(this.boundary[0].y,this.boundary[1].y,iy);
			}

		this.children[QT_CHILD_TL] = new QuadTree({x:lx[0],y:ly[0]},{x:lx[1],y:ly[1]},this);
		this.children[QT_CHILD_TR] = new QuadTree({x:lx[1],y:ly[0]},{x:lx[2],y:ly[1]},this);
		this.children[QT_CHILD_BL] = new QuadTree({x:lx[0],y:ly[1]},{x:lx[1],y:ly[2]},this);
		this.children[QT_CHILD_BR] = new QuadTree({x:lx[1],y:ly[1]},{x:lx[2],y:ly[2]},this);

		for(i in this.node)
		{
			for(var si=0; si<=3; si++)
			{
				if(this.children[si].insert(this.node[i],"ai",ai[this.node[i]].pos)) break;
			}
		}
		this.node=[];
		return true;
	}

	this.path = path;
	function path(point,root)
	{
		if(root == undefined) root = [];

		//Check to see if it's within this branch.
		if(!hitrect(this.boundary,point))
			return false;

		//Smallest unit in the quadtree?
		if(this.size < 4)
		{
		}

		if(this.children.length > 0)
		for(var si=0; si<=3; si++)
		{
			preroot = root;
			preroot.push(si);
			pathresult = this.children[si].path(point,preroot);
			if (pathresult != false) return pathresult;
		}

		//Could not find that point on the tree.
		return root;
	}


	this.query = query;
	function query(point,size)
	{
		if(size.x == undefined)
			var rect = [{x:point.x-size,y:point.y-size},{x:point.x+size,y:point.y+size}];
		else
			var rect = [point,size];

		//Check to see if it's within this branch.
		if(!intersect(this.boundary,rect))
			return [];

		if(this.node.length>0)
		{
			var outnode = [];

			for(var i in this.node)
			{
				if(ai[this.node[i]] != null)
					outnode.push(this.node[i]);
			}
			return outnode;
		}

		var result = [];
		if(this.children.length > 0)
			for(var ci=0; ci<=3; ci++)
			{
				result = result.concat(this.children[ci].query(point,size));
			}
		return result;
	}



	this.render = render;
	function render(label)
	{
		buffer.lineWidth=2;
		buffer.strokeStyle="#900";

		b1 = screen.fromworld(this.boundary[0]);
		b2 = screen.fromworld(this.boundary[1]);

		buffer.beginPath();
		buffer.moveTo(b1.x, b1.y);
		buffer.lineTo(b2.x, b1.y);

		buffer.moveTo(b2.x, b1.y);
		buffer.lineTo(b2.x, b2.y);

		buffer.moveTo(b2.x, b2.y);
		buffer.lineTo(b1.x, b2.y);

		buffer.moveTo(b1.x, b2.y);
		buffer.lineTo(b1.x, b1.y);
		buffer.stroke();

		buffer.lineWidth=1;

		buffer.fillStyle="#00E";
		buffer.font="12px Arial";
		buffer.fillText("N: "+this.node.length,b1.x,b1.y+12);

		if(label != undefined)
		{
			buffer.fillStyle="#E00";
			buffer.font="12px Arial";
			buffer.fillText(label,b1.x,b1.y);
		}

		if(this.children.length > 0)
		{
			chl = "";

			for(var rendri=0; rendri<=3; rendri++)
			{
				chl += ","+this.children[rendri].id;
				this.children[rendri].render();
			}
			//console.log(this.id+" - children:"+chl);
		}


	}


	this.spider = spider;
	function spider()
	{
		var children = [];

		if(this.children.length > 0)
		{
			for(var spideri=0; spideri<=3; spideri++)
			{
				children.push(this.children[spideri].spider());
			}
		}

		return {id:this.id,nodes:this.node,children:children};
	}


	return this;
}
