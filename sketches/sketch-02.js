//TODO: Clean up code.

const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');


const settings = {
    dimensions: [1080, 1080],
    animate: true,
    fps: 24,
    duration: 15,
    playbackRate: 'throttle',
    loop: true
};

const sketch = ({width, height, playhead}) => {

    //First array for radius, second for startAngle, last for endAngle
    const arcRanges = [
        [0.5, 1.5],
        [1, -8],
        [1, 5]
    ]

    const arcArray = []
    const numOfArcs = 50

    const colorBeat = 4;
    const colorCount = 0;

    for (let i = 0; i < numOfArcs; i++) {
        const x = width * 0.5;
        const y = width * 0.5;
        const radius = width * 0.3 * random.range(arcRanges[0][0], arcRanges[0][1]);
        const startAngle = math.degToRad(random.range(0, 360))
        const endAngle = startAngle + math.degToRad(random.range(30, 40))
        const lineWidth = random.range(5, 10);

        arcArray.push(new Arc(x, y, radius, startAngle, endAngle, lineWidth));
    }

    const cx = width * 0.5;
    const cy = height * 0.5;
    const radius = width * 0.3;

    const colorArray = ["#e1243d", "#fffbe0", "#21211f", "#e934a8"];

    let colorTracker = new ColorTracker(colorArray, colorCount, 30, playhead);
    let clockColor = new ColorTracker(colorArray, colorCount, 30, playhead)
    let clock = new Clock(cx, cy, 40, radius, height * 0.1);

    return ({context, width, height, playhead}) => {

        colorTracker.colorUpdate(context, playhead);

        context.fillRect(0, 0, width, height);

        clockColor.colorUpdate(context, playhead)

        const w = width * 0.007;
        const h = height * 0.05;


        arcArray.forEach(arc => {
            arc.update(playhead);
            arc.draw(context);
        })
        clock.draw(context, w, h, playhead);
        console.log(playhead);
    };
};

canvasSketch(sketch, settings);

//TODO: Remove unused parameters and look for better solution for colorUpdate
class ColorTracker {
    constructor(colorArray, colorBeat, colorLimit, playhead) {
        this.colorArray = colorArray;
        this.colorBeat = colorBeat;
        this.colorLimit = colorLimit;

        this.duration = settings.duration;

        this.scheduledChanges = this.duration * 2;
        this.fraction = 1 / this.scheduledChanges;
        this.currentFraction = 0;
        this.color = 'black';
    }

    colorUpdate(context, playhead) {

        if (0.99 < playhead){
            this.currentFraction = 0;
        }
        if (playhead > this.currentFraction){
            let color = random.pick(this.colorArray)
            while (color === context.fillStyle){
                color = random.pick(this.colorArray);
            }
            context.fillStyle = color;
            this.currentFraction = this.currentFraction + this.fraction;
            this.color = color;
        }
        else{
            context.fillStyle = this.color;
        }
    }
}

class Arc {
    constructor(x, y, radius, startAngle, endAngle, lineWidth) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.lineWidth = lineWidth;
        this.speedMod = random.range(0.5, 5);
    }

    draw(context) {
        context.lineWidth = this.lineWidth;

        context.beginPath();
        context.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle);
        context.stroke();
    }

    update() {
        this.startAngle = this.startAngle + (2 * Math.PI / settings.duration / settings.fps * this.speedMod);
        this.endAngle = this.endAngle + (2 * Math.PI / settings.duration / settings.fps * this.speedMod);
    }

}

class Clock {
    constructor(x, y, slices, radius, height) {
        this.x = x;
        this.y = y;
        this.slices = slices;
        this.radius = radius;
        this.valuesToUse = this.generateClock(height)
    }

    generateClock(h) {
        let randomValues = [
                [],
                [],
                [],
                []
            ]
        ;
        for (let i = 0; i < this.slices; i++) {
            randomValues[0].push(random.range(0.5, 2));
            randomValues[1].push(random.range(1, 2));
            randomValues[2].push(random.range(-h * 0.2, -h * 0.25));
            randomValues[3].push(random.pick([random.range(-1, -0.5), random.range(0.5, 1)]));
        }
        return randomValues;
    }

    draw(context, w, h, playhead) {
        for (let i = 0; i < this.slices; i++) {
            const currentSlice = math.degToRad(360 / this.slices);
            const angle = currentSlice * i + (2 * Math.PI * playhead);

            let currentX = this.x + this.radius * Math.sin(angle);
            let currentY = this.y + this.radius * Math.cos(angle);

            context.save();
            context.translate(currentX, currentY);
            context.rotate(-angle);
            context.scale(this.valuesToUse[0][i],
                this.valuesToUse[1][i]);

            context.beginPath();
            context.rect(-w * 0.5, this.valuesToUse[2][i] * this.valuesToUse[3][i]
                * Math.sin(4 * Math.PI * playhead), w, h);
            context.fill();
            context.restore();
        }
    }
}