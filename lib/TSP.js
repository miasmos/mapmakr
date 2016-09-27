var Sample = require('./City'),
  Node = require('./Node'),
  Ring = require('./Ring'),
  Clustering = new (require('density-clustering')).OPTICS()

/* the simulator containing all the data */
function TravelingSalesman(opts) {
	if (!opts) opts = {}
	if (!opts.N) opts.N = opts.map.length; /* Number of cities. */
	if (!opts.cycle) opts.cycle = 0; /* Number of complete survey done */
	if (!opts.maxCycles) opts.maxCycles = 100; /* Number of complete suerveys */
	if (!opts.map) opts.map= null; /* the map source */
	if (!opts.neurons) opts.neurons = null; /* the neurons */
	if (!opts.alpha) opts.alpha = 0.05; /* learning rate */
	if (!opts.gain) opts.gain = 50; /* gain */
  if (!opts.complete) opts.complete = function(){}
	opts.lastLength = null; /* length of tour */
	opts.isRunning = false;
	opts.update = 5; /* screen update */

  var cities = []
  for (var key in opts.map) {
    var s = new Sample()
    s.x = opts.map[key][0]
    s.y = opts.map[key][1]
    cities.push(s)
  }
  opts.cities = cities

	this.opts = !opts ? {} : opts
  this.start()
}

/* creates the first node (ring) */
TravelingSalesman.prototype.createFirstNeuron = function(x, y) {
  var start = new Node(x,y);
  this.opts.neurons = new Ring(start);
};

/* deletes all nodes */
TravelingSalesman.prototype.deleteAllNeurons = function() {
  if (this.opts.neurons != null) {
    while (this.opts.neurons.start != null) {
    	this.opts.neurons.deleteNode(this.opts.neurons.start);
    }
    this.opts.neurons = null;
  }
};

/* prints positions of cities & nodes */
TravelingSalesman.prototype.print = function() {
	console.log("TSP: N= " + this.opts.N + ", cycle=" + this.opts.cycle + ", lastLength=" + this.opts.lastLength);
  for (var i=0; i<this.opts.cities.length; i++) {
  	var c = this.opts.cities[i];
    console.log("City: " + i + " (" + c.x + "," + c.y + ")");
  }
  var n = this.opts.neurons.start;
  for (i=0; i<this.opts.neurons.length; i++) {
    console.log("Node: " + i + "(" + n.x + "," + n.y + ")");
    n = n.right;
  }
};

TravelingSalesman.prototype.stop = function() {
	this.opts.isRunning = false;
	this.repaint();
	// this.opts.cities= null;
	this.deleteAllNeurons();
	console.log('stop')
	// console.log(this.opts.optimal, this.opts.optimal.length)
	this.filter()
	// console.log(this.opts.optimal, this.opts.optimal.length)
	// this.validate()
	this.cluster()
  this.opts.complete.call(this, this.opts)
};

TravelingSalesman.prototype.start = function() {
	// this.stop();
	console.log('start')
	this.init();
	this.opts.isRunning = true;
	this.run();
};

TravelingSalesman.prototype.init = function() {
  this.opts.cycle = 0;
  this.opts.lastLength = null;
  this.createFirstNeuron(this.opts.cities[0].x, this.opts.cities[0].y);
	// this.createRandomCities();
	// this.canvas = new Canvas(document.getElementById('canvas'));
	// this.repaint();
};

TravelingSalesman.prototype.repaint = function() {
  if (this.opts.neurons) {
    var n = this.opts.neurons.start;
    this.opts.optimal = []
    for (i=0; i<this.opts.neurons.length; i++) {
      this.opts.optimal.push({
        x: n.x,
        y: n.y
      })
      n = n.right;
    }
  }
};

TravelingSalesman.prototype.run = function() {
	var cnt = 0
  if (this.opts.neurons != null) {
  	// console.log(this.opts.cycle, this.opts.maxCycles, this.opts.isRunning)
    if (this.opts.cycle < this.opts.maxCycles && this.opts.isRunning) {
    	var done = this.surveyRun();
    	if (!done) {
    		var self = this;
    		// console.log('tick')
    		setInterval(function() { self.run(); }, 100);
    		return;
    	}
    } else {
    	this.stop()
    }
    // if (this.opts.isRunning) {
    // 	//this.print();
    // 	this.opts.isRunning = false;
    // 	this.repaint();
    // }
  }
};

/* one cycle in the simulation */
TravelingSalesman.prototype.surveyRun = function() {
  var done = false;
  if (this.opts.neurons != null) {
    for (var i=0; i<this.opts.cities.length; i++) {
      this.opts.neurons.moveAllNodes(this.opts.cities[i], this.opts.gain );
    }
  }
  this.surveyFinish();
  this.opts.gain = this.opts.gain * (1 - this.opts.alpha );
  if (this.opts.cycle++ % this.opts.update == 0) {
    var length = this.opts.neurons.tourLength();
  	//this.print();
    // this.repaint();
    if (length == this.opts.lastLength) {
      done = true;
    } else {
      this.opts.lastLength = length;
    }
  }
  return done;	
};

/* after moving creating & deleting is done */
TravelingSalesman.prototype.surveyFinish = function() {
  if (this.opts.neurons == null) {
    return;
  }
  var node = this.opts.neurons.start;
  for (var i=0; i<this.opts.neurons.length; i++) {
    node.inhibitation = 0;
    switch (node.isWinner) {
    case 0:
      node.life//;
      if (node.life == 0) {
        this.opts.neurons.deleteNode(node);
      }
      break;
    case 1:
      node.life = 3;
      break;
    default:
      node.life = 3;
      this.opts.neurons.duplicateNode(node);
      break;
    }
    node.isWinner = 0;
    node = node.right;
  }
};

TravelingSalesman.prototype.cluster = function() {
	var collapsedNodes = this.opts.optimal.map((item) => {
		return [item.x, item.y]
	})

	var clusters = Clustering.run(collapsedNodes, 10, 3)//.filter((item) => {
		// return item.data.length && !!item.mean[0] && !!item.mean[1]
	// }).map((item) => {
	// 	return {
	// 		x: item.mean[0],
	// 		y: item.mean[1]
	// 	}
	// })

this.opts.clusters = clusters
	//draw it
	// var canvas = document.getElementById('canvas'),
	// 	ctx = canvas.getContext('2d')

	// for (var i in clusters) {
	// 	var coords = {
	// 		x: clusters[i].x * (this.canvas.width/100),
	// 		y: clusters[i].y * (this.canvas.height/100)
	// 	}

	// 	this.canvas.ctx.fillStyle = "#F00";
	// 	this.canvas.ctx.fillRect(coords.x, coords.y, 10, 10)
	// }
}

TravelingSalesman.prototype.validate = function() {
	for (var i in this.opts.cities) {
		var passed = false
		for (var j in this.opts.optimal) {
			if (this.opts.optimal[j].x == this.opts.cities[i].x && this.opts.optimal[j].y == this.opts.cities[i].y) {
				passed = true
				break
			}
		}
		if (!passed) console.log('node failed validation:', i)
	}

	for (var j in this.opts.optimal) {
	// console.log(this.opts.optimal[j])
		if (this.opts.optimal[j].x > 100 || this.opts.optimal[j].y > 100) {
			console.log('found', j, 'is too large', this.opts.optimal[j].x , this.opts.optimal[j].y)
		}
	}
}

//eliminates nodes that are within .1 of another node
TravelingSalesman.prototype.filter = function() {
	console.log('filter')
	var accuracy = 0.1
	for (var i in this.opts.cities) {
		var srcNode = this.opts.cities[i],
			lowbound = {
				x: srcNode.x - accuracy,
				y: srcNode.y - accuracy
			},
			highbound = {
				x: srcNode.x + accuracy,
				y: srcNode.y + accuracy
			}
			exists = false

		for (var j in this.opts.optimal) {
			var computedNode = this.opts.optimal[j]
// console.log(srcNode.x - accuracy, srcNode.x + accuracy, srcNode.y - accuracy, srcNode.y + accuracy)
			if (lowbound.x <= computedNode.x && highbound.x >= computedNode.x &&
				lowbound.y <= computedNode.y && highbound.y >= computedNode.y) {
				if (!exists) {
					exists = true
					this.opts.optimal[j] = computedNode
				} else {
					this.opts.optimal.splice(j,1)
				}
			}
		}
	}
}

module.exports = TravelingSalesman
