var compose = function(target) {
    var keys = Object.keys(target);
    target.comp = {};
    keys.forEach(function(key) {
        target.prototype[key] = function(other) {
            return target[key](this, other);
        };
        target.comp[key] = function(other) {
            return function(self) {
                return self[key](other);
            };
        };
    });

}

function Vector(x, y, z) {
    if (this instanceof Vector) {
        this.x = x;
        this.y = y;
        this.z = z;
    } else {
        return new Vector(x, y, z);
    }
}

Vector.add = function(self, other) {
    return new Vector(self.x + other.x, self.y + other.y, self.z + other.z);
};
Vector.sub = function(self, other) {
    return new Vector(self.x - other.x, self.y - other.y, self.z - other.z);
};
Vector.multiply = function(self, other) {
    return new Vector(self.x * other.x, self.y * other.y, self.z * other.z);
};
Vector.divide = function(self, other) {
    return new Vector(self.x / other.x, self.y / other.y, self.z / other.z);
};
Vector.magnitude = function(self) {
    return Math.sqrt(Math.pow(self.x, 2) + Math.pow(self.y, 2) + Math.pow(self.z, 2));
};
Vector.scale = function(self, factor) {
    return self.multiply(Vector(factor, factor, factor));
};
Vector.normalize = function(self) {
    return self.clamp(1);
};
Vector.dot = function(self, other) {
    return self.x * other.x + self.y * other.y + self.z * other.z;
};
Vector.angle = function(self, other) {
    return Math.acos(self.normalize().dot(other.normalize()));
};
Vector.angleDeg = function(self, other) {
    return self.angle(other) * (180 / Math.PI);
};
Vector.distance = function(self, other) {
    return self.sub(other).magnitude();
};
Vector.clamp = function(self, magnitude) {
    var ratio = (self.magnitude() / magnitude);
    return new Vector(self.x / ratio, self.y / ratio, self.z / ratio);
};
Vector.limit = function(self, magnitude) {
    if (magnitude < self.magnitude()) {
        return self.clamp(magnitude);
    } else {
        return self;
    }
};
Vector.reflect = function(self, axis) {
    axis = axis.normalize();
    return self.sub(axis.scale(self.dot(axis) * 2));
};

Vector.equals = function(self, other) {
    return self.x === other.x && self.y === other.y && self.z === other.z;
};

Vector.toArray = function(self) {
    return [self.x, self.y, self.z];
};
Vector.toObject = function(self) {
    return {
        x: self.x,
        y: self.y,
        z: self.z
    };
};

compose(Vector);

Vector.fromArray = function(arr) {
    return new Vector(arr[0], arr[1], arr[2]);
};
Vector.fromObject = function(obj) {
    return new Vector(obj.x, obj.y, obj.z);
};

Vector.back = new Vector(0, 0, -1);
Vector.forward = new Vector(0, 0, 1);
Vector.up = new Vector(0, 1, 0);
Vector.down = new Vector(0, -1, 0);
Vector.left = new Vector(-1, 0, 0);
Vector.right = new Vector(1, 0, 0);
Vector.zero = new Vector(0, 0, 0);
Vector.one = new Vector(1, 1, 1);

