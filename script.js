const width = 1024;
const height = 720;
let canvas;
let ctx;
let img;

let kek = true;

function debug() {
    if(kek) {
        kek = false;
        console.log(...arguments);
    }
}

class Sphere {
    constructor(pos, radius, extra) {
        this.pos = pos;
        this.radius = radius;
        this.extra = extra;
    }

    cast(orig, dir) {
        dir = dir.normalize();
        const x = Math.pow(dir.dot(orig.sub(this.pos)), 2) - Math.pow(orig.distance(this.pos), 2) + Math.pow(this.radius, 2);
        if(x < 0) return null;
        const dist = -dir.dot(orig.sub(this.pos)) - Math.sqrt(x);
        if(dist < 0) return null;
        const pos = orig.add(dir.scale(dist));
        const norm = pos.sub(this.pos).normalize();
        return {
            pos,
            norm,
            extra: this.extra,
            orig,
            dir,
            hit: true,
        }
    }
}

class Plane {
    constructor(pos, norm, extra) {
        this.pos = pos;
        this.norm = norm;
        this.extra = extra;
    }

    cast(orig, dir) {
        dir = dir.normalize();
        const t = this.norm.dot(this.pos.sub(orig)) / this.norm.dot(dir);
        if(t < 0) return null;
        if(Math.abs(this.norm.dot(dir)) < 0.001) return null;

        const pos = orig.add(dir.scale(t));

        return {
            pos,
            norm: this.norm,
            extra: this.extra,
            orig,
            dir,
            hit: true,
        }
    }
}

const objects = [
    new Sphere(new Vector(0, 0, 5), 1, {
        color: new Vector(255, 255, 255),
        reflectivity: 0.9,
    }),
    new Sphere(new Vector(3, 0, 4), 1, {
        color: new Vector(0, 0, 255),
        reflectivity: 0.2,
    }),
    new Sphere(new Vector(-3, 0, 4), 1, {
        color: new Vector(255, 0, 0),
        reflectivity: 0.2,
    }),
    new Sphere(new Vector(0.7, -0.4, 5), 0.75, {
        color: new Vector(255, 255, 0),
        reflectivity: 0.4,
    }),
    new Sphere(new Vector(-0.7, -0.4, 5), 0.75, {
        color: new Vector(0, 255, 255),
        reflectivity: 0,
    }),
    new Sphere(new Vector(0.7, -0.5, 3), 0.25, {
        color: new Vector(0, 127, 255),
        reflectivity: 0.07,
    }),
    new Sphere(new Vector(-0.7, -0.5, 3), 0.25, {
        color: new Vector(127, 0, 255),
        reflectivity: 0.3,
    }),
    new Plane(new Vector(0, -0.75, 0), Vector.up, {
        color: new Vector(127, 127, 127),
        reflectivity: 0,
    }),
];

const light = {
    pos: new Vector(3, 5, 0),
};

window.onload = function reRender() {
    document.getElementById("btn").addEventListener("click", render);
    canvas = document.getElementById('canvas');
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d');
    img = ctx.createImageData(width, height);

    render();
};

function getColor(ray, step = 0) {
    if(ray === null) {
        return Vector.zero;
    }

    const MAX_STEP = 3;
    const ambient = 0.1;
    const toLight = light.pos.sub(ray.pos);
    const shadowCast = cast(ray.pos.add(ray.norm.scale(0.0001)), toLight.normalize());

    let color = ray.extra.color;

    let diffuse = 0;
    let specularLight = Vector.zero;
    if(shadowCast === null || ray.pos.distance(shadowCast.pos) > toLight.magnitude()) {
        diffuse = ray.norm.dot(toLight.normalize());
        if(diffuse < 0) diffuse = 0;

        let specular = ray.dir.dot(toLight.normalize().reflect(ray.norm));
        if(specular < 0) specular = 0;
        specular = Math.pow(specular, 256);
        specularLight = new Vector(255, 255, 255).scale(specular);
    }

    let reflectionColor = Vector.zero;
    if(ray.extra.reflectivity > 0 && step < MAX_STEP) {
        let reflection = cast(ray.pos, ray.dir.reflect(ray.norm));
        reflectionColor = getColor(reflection, step + 1);
    }

    color = color.scale(ambient + diffuse * (1 - ambient));
    color = color.scale(1 - ray.extra.reflectivity).add(reflectionColor.scale(ray.extra.reflectivity));
    color = color.add(specularLight);

    return color;
}

function cast(orig, dir) {
    let result = null;
    for(let object of objects) {
        let current = object.cast(orig, dir);
        if(current && (result === null || orig.distance(result.pos) > orig.distance(current.pos))) {
            result = current;
        }
    }

    return result;
}

async function render() {
    let lastY = 0;
    let lastDraw = Date.now();
    let x;
    let y;
    const camera = new Vector(0, 0, 0);
    const cameraDir = Vector.forward;
    const fov = 90 / 360 * Math.PI;

    async function sleep() {
        ctx.putImageData(img, 0, 0, 0, lastY, width, y - lastY);
        lastY = y;
        await new Promise(resolve => setTimeout(resolve, 0));
        kek = true;
    }

    for(y = 0; y < height; y++) {
        for(x = 0; x < width; x++) {
            const datapos = x * 4 + y * width * 4;

            let offset;
            let result;
            let color;

            offset = new Vector((x - width / 2) / width * Math.tan(fov), ((height - y) - height / 2) / width * Math.tan(fov), 0);
            result = cast(camera, cameraDir.add(offset));
            color = getColor(result);

            offset = new Vector((x + 0.5 - width / 2) / width * Math.tan(fov), ((height - y) - height / 2) / width * Math.tan(fov), 0);
            result = cast(camera, cameraDir.add(offset));
            color = color.add(getColor(result));

            offset = new Vector((x + 0.5 - width / 2) / width * Math.tan(fov), ((height - y + 0.5) - height / 2) / width * Math.tan(fov), 0);
            result = cast(camera, cameraDir.add(offset));
            color = color.add(getColor(result));

            offset = new Vector((x - width / 2) / width * Math.tan(fov), ((height - y + 0.5) - height / 2) / width * Math.tan(fov), 0);
            result = cast(camera, cameraDir.add(offset));
            color = color.add(getColor(result));

            color = color.scale(1/4);

            img.data[datapos] = color.x;
            img.data[datapos+1] = color.y;
            img.data[datapos+2] = color.z;
            img.data[datapos+3] = 255;
        }

        if(lastDraw + 100 < Date.now()) {
            await sleep();
        }
    }
    await sleep();
}
