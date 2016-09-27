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
  if (!opts.clusterRadius) opts.clusterRadius = 1
  if (!opts.clusterMinNeighbours) opts.clusterMinNeighbours = 10
  if (!opts.limit) opts.limit = false
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
	this.deleteAllNeurons();
  console.log(`approximated ${this.opts.optimal.length} nodes`)
	this.filter()
  this.opts.complete.call(this, this.opts)
};

TravelingSalesman.prototype.start = function() {
	console.log('start')
  this.cluster()
	this.init();
	this.opts.isRunning = true;
	this.run();
};

TravelingSalesman.prototype.init = function() {
  this.opts.cycle = 0;
  this.opts.lastLength = null;
  this.createFirstNeuron(this.opts.cities[0].x, this.opts.cities[0].y);
};

TravelingSalesman.prototype.repaint = function() {
  if (this.opts.neurons) {
    var n = this.opts.neurons.start;
    this.opts.optimal = []
    for (i=0; i<this.opts.neurons.length; i++) {
      this.opts.optimal.push([
        n.x,
        n.y
      ])
      n = n.right;
    }
  }
};

TravelingSalesman.prototype.run = function() {
	var cnt = 0
  if (this.opts.neurons != null) {
    if (this.opts.cycle < this.opts.maxCycles && this.opts.isRunning) {
    	var done = this.surveyRun();
    	if (!done) {
    		var self = this;
    		setInterval(function() { self.run(); }, 100);
    		return;
    	}
    } else {
    	this.stop()
    }
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
  console.log(`got ${this.opts.cities.length} nodes total`)
  var cities = this.opts.cities.map((item) => {
    return [item.x, item.y]
  })
	var clusters = Clustering.run(cities, this.opts.clusterRadius, this.opts.clusterMinNeighbours)

  var averagePoints = []
  for (var i in clusters) {
    var totalX = 0, totalY = 0
    for (var j in clusters[i]) {
      var point = {
        x: cities[clusters[i][j]][0],
        y: cities[clusters[i][j]][1]
      }
      totalX += point.x
      totalY += point.y
    }
    averagePoints.push([
      totalX/clusters[i].length,
      totalY/clusters[i].length
    ])
  }

  this.opts.coordinates = this.opts.cities
  this.opts.cities = averagePoints.map((item) => {
    return {
      x: item[0],
      y: item[1]
    }
  })
  if (!!this.opts.limit) this.opts.cities = this.opts.cities.slice(0, this.opts.limit)  //restrict node count for development
  var log = !!this.opts.limit ? ' (truncated by debug flag)' : ''
  console.log(`condensed to ${this.opts.cities.length} clusters`+log)
}

//maps TSP nodes to the original coordinates
TravelingSalesman.prototype.filter = function() {
	console.log('filter')
	var accuracy = 0.01

  var path = [], lastNode
  for (var i in this.opts.optimal) {
    var computedNode = {
      x: Math.round(this.opts.optimal[i][0] * 100) / 100,
      y: Math.round(this.opts.optimal[i][1] * 100) / 100
    }

    if (!!lastNode && isWithinProximity(lastNode, computedNode, accuracy)) {
      continue
    }

    for (var j in this.opts.cities) {
      var srcNode = this.opts.cities[j]
      if (isWithinProximity(srcNode, computedNode, accuracy)) {
          path.push([
            srcNode.x, srcNode.y
          ])
          lastNode = computedNode
          break
      }
    }
  }

  for (var i = 1; i < path.length-1; i++) {
    if (path[i][0] == path[i-1][0] && path[i][1] == path[i-1][1]) {

      path.splice(i,1)
    }
  }

  if (path.length !== this.opts.cities.length) {
    console.error(`Failed to filter completely, path has ${path.length} nodes and coordinates array has ${this.opts.cities.length}`)
  } else {
    console.log(`Filtered successfully with a max accuracy of ${accuracy}`)
  }

  this.opts.optimal = path

  function isWithinProximity(n1, n2, accuracy) {
    var lowbound = {
        x: n1.x - accuracy,
        y: n1.y - accuracy
      },
      highbound = {
        x: n1.x + accuracy,
        y: n1.y + accuracy
      }
    return lowbound.x <= n2.x && highbound.x >= n2.x &&
        lowbound.y <= n2.y && highbound.y >= n2.y
  }
}

module.exports = TravelingSalesman
