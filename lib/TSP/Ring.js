var Node = require('./Node')

/* the neural network as a ring of neurons */
function Ring(start) {
  this.start = start;
  this.length = 1;
}

/* moves all nodes to in direction of the sample */
Ring.prototype.moveAllNodes = function(city, gain) {
  var current = this.start;
  var best = this.findMinimum(city);

  for (var i=0; i<this.length; i++) {
    current.move(city, this.f(gain, best.distance(current, this.length)));
    current = current.right;
  }
};

/* finds the node with the least distance to the sample */
Ring.prototype.findMinimum = function(city) {
  var actual;
  var node = this.start;
  var best = node;
  var min = node.potential(city);
  for (var i=1; i<this.length; i++) {
    node = node.right;
    actual = node.potential(city);
    if (actual < min) {
      min = actual;
      best = node;
    }
  }
  best.isWinner++;
  return best;
};

/* deletes a node */
Ring.prototype.deleteNode = function(node) {
  var previous = node.left;
  var next = node.right;

  if (previous != null) {
    previous.right = next;
  }
  if (next != null) {
    next.left = previous;
  }
  if (next == node) {
    next = null;
  }
  if (this.start == node) {
    this.start = next;
  }
  this.length//;
};

/* a node is duplicated & inserted into the ring */
Ring.prototype.duplicateNode = function(node) {
  var newNode = new Node(node.x, node.y);
  var next = node.left;
  next.right = newNode;
  node.left = newNode;
  node.inhibitation = 1;  
  newNode.left = next;
  newNode.right = node;
  newNode.inhibitation = 1;
  this.length++;
};

/* length of tour */
Ring.prototype.tourLength = function() {
  var dist = 0.0;
  var current = this.start;
  var previous = current.left;

  for (var i=0; i<this.length; i++) {
    dist += Math.sqrt( 
    		(current.x - previous.x) * (current.x - previous.x) + 
    		(current.y - previous.y) * (current.y - previous.y));
    current = previous;
    previous = previous.left;
  }
  return dist;
};

Ring.prototype.f = function(gain, n) {
	return (0.70710678 * Math.exp(-(n * n) / (gain * gain)));
};

module.exports = Ring