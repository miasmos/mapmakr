function Node(x, y) {
  this.x = x;
  this.y = y;
  this.right = this;
  this.left = this;
  this.life = 3;
  this.inhibitation = 0;
  this.isWinner = 0;
}

/* the distance of the euklidian points */
Node.prototype.potential = function(sample) {
  return (sample.x - this.x) * (sample.x - this.x) + (sample.y - this.y) * (sample.y - this.y);
};

/* moves a single node in direction to the sample */
Node.prototype.move = function(city, value) {
  this.x += value * (city.x - this.x);
  this.y += value * (city.y - this.y);
};

/* computes the number of nodes between the to nodes on the ring */
Node.prototype.distance = function(other, length) {
  var right = 0;
  var left = 0;
  var current = other;

  while (current != this) {
  	current = current.left;
    left++;
  }
  right = length - left;
  return (left < right) ? left : right;
};

module.exports = Node