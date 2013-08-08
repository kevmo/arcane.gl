var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(50, $(window).width() / $(window).height(), 1, 1000);
var renderer = new THREE.WebGLRenderer();
var cubes = [];
var controls;

document.body.appendChild(renderer.domElement);

var i = 0;
// cube factory
for(var x = 0; x < 30; x += 2) {
    var j = 0;
    cubes[i] = [];
    for(var y = 0; y < 30; y += 2) {
        var geometry = new THREE.CubeGeometry(1.0, 1.0, 1.0);
        var material = new THREE.MeshPhongMaterial({
            ambient: 0x808080,
            specular: 0xffffff,
            shininess: 20,
            reflectivity: 5.5
        });

        cubes[i][j] = new THREE.Mesh(geometry, material);
        cubes[i][j].position = new THREE.Vector3(x, y, 0);

        scene.add(cubes[i][j]);
        j++;
    }
    i++;
}
// thru line 74 is all pretty boilerplaye
var light = new THREE.AmbientLight(0x505050);
scene.add(light);

var uniforms = {
    color: { type: "c", value: new THREE.Color( 0xffffff ) }
};

var attributes = {
    size: { type: 'f', value: [] }
};

for (var q=0; q < attributes.size.value.length; q++) {
    attributes.size.value[q] = 5 + Math.floor(Math.random() * 10);
}

/* Lighting initialization */
var directionalLight,
    lightPosition = [ [0, 1, 1],
                      [1, 1, 0],
                      [0,-1,-1],
                      [-1,-1,0] ];

for (var lights = 0; lights < lightPosition.length; lights++){
    debugger;
    directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(lightPosition[lights][0], lightPosition[lights][1], lightPosition[lights][2]);
    scene.add(directionalLight);
}

// equations to center camera init point around cube locations
var len = cubes.length - 1.;
camera.position.x = (cubes[len][0].position.x + cubes[0][0].position.x) / 2.0;
camera.position.y = (cubes[0][len].position.y + cubes[0][0].position.y) / 2.0;
camera.position.z = cubes[0][0].position.z + 80.;

controls = new THREE.OrbitControls(camera, $('canvas'));
controls.addEventListener('change', render);

for(var i = 0; i < 7; i++) {
    controls.pan(new THREE.Vector3( 1, 0, 0 ));
    controls.pan(new THREE.Vector3( 0, 1, 0 ));
}

// TODO: delete this
var tempcount=0;
// @last increments @counter each second
// @visual represents the starting point for the visual style
var last = 0, counter = 0, visual = 1;
var render = function (cycles) {
    // enter loop if BitArray exists and play button has been pressed
    if(typeof array === 'object' && array.length > 0 && $('#play').length === 0) {
        // increment counter each second
        if (cycles - last > 1000) {
            last = cycles;
            counter++;
        }
        // k represents an index in the bit array
        var k = 0;
        // 'circle' is the only meaningful visual at the moment
        // 'grid' works but is boring
        var styleList = ['grid', 'circle', 'fan', 'triangle'];
        var iLen = cubes.length, jLen = cubes[0].length;
        var arcDeg = 360./iLen, maxCycle = 50;
        /*
         * @lastScale = previous fully completed data sequence of frequency data
         * @tempScale = current scale sequence
         */
        var lotusSize = [], lastScale = [], tempScale = [];

        for(var i = 0, iLen = cubes.length; i < iLen; i++) {
            tempScale[i] = [];
            for(var j = 0, jLen = cubes.length; j < jLen; j++) {
                tempScale[i][j] = (array[k] + boost) / 30;
                k += (k < array.length ? 1 : 0);
                var timeScale = counter+(cycles-last)/1000; // ms since play()
                switch (styleList[visual]) {
                    case 'grid':

                        cubes[i][j].scale.z = (tempScale[i][j] < 1 ? 1 : tempScale[i][j]);
                        cubes[i][j].material.color.r = Math.abs(Math.sin(iLen/(i+1)+Math.log(tempScale[i][j]*(i+1))));
                        cubes[i][j].material.color.g = Math.abs(Math.cos(iLen/(i+1)+Math.log(tempScale[i][j]*(i+1))));
                        cubes[i][j].material.color.b = Math.abs(Math.tan(iLen/(i+1)+Math.log(tempScale[i][j]+tempScale[i][j])));
                        break;
                    case 'circle':
                        var degree = arcDeg*j;
                        //var radian = degree*Math.PI/180.;
                        var damp = Math.log(tempScale[i][j]*tempScale[i][j]) > 0.5 ? Math.log(tempScale[i][j]*tempScale[i][j]) : 0.5;
                        cubes[i][j].scale.y    = 2.0*tempScale[i][j] + .001;
                        cubes[i][j].scale.x    = damp;
                        cubes[i][j].scale.z    = damp;
                        /*
                         * Range of timeScale+10 = 10-60
                         * maxCycle/5.           = 10
                         * pos.x and pos.y scale over time by an increasing factor from 1-5;
                         */
                        var positionScale = (timeScale+10)/(maxCycle/5.);
                        cubes[i][j].position.x = positionScale*tempScale[i][j]*Math.cos(degree);
                        cubes[i][j].position.y = positionScale*tempScale[i][j]*Math.sin(degree);

                        if (counter < 10) {
                            cubes[i][j].rotation.z = degree+Math.PI/2.;
                            cubes[i][j].position.z = i*timeScale+damp;
                        } else if (counter < 20) {
                            if (cubes[i][j].rotation.z != 0){
                                cubes[i][j].rotation.z -= .01;
                            }
                        } else if (counter < 35) {
                            cubes[i][j].rotation.y -= .01;
                            cubes[i][j].rotation.x -= .01;
                            cubes[i][j].rotation.z += .002;
                        } else if (counter < maxCycle) {
                            cubes[i][j].rotation.y += Math.sin(cycles/5000)/(maxCycle-counter);
                            cubes[i][j].rotation.x -= Math.cos(cycles/5000)/(maxCycle-counter);
                            if (counter > 40)
                                cubes[i][j].position.z = i*(50-timeScale)+damp;
                        } else {
                            // counter resets after 50 seconds
                            counter = 0;
                            // visual is WIP. will advance case to 'fan'
//                                visual++;
                        }
                        // overly complicated color assignment
                        cubes[i][j].material.color.r = Math.abs(Math.sin(iLen/(i+1)+Math.log(tempScale[i][j]*(i+1))));
                        cubes[i][j].material.color.g = Math.abs(Math.cos(iLen/(i+1)+Math.log(tempScale[i][j]*(i+1))));
                        cubes[i][j].material.color.b = Math.abs(Math.tan(iLen/(i+1)+Math.log(tempScale[i][j]+tempScale[i][j])));
                        break;
                    case 'fan':
                    /*
                     * WIP
                     * calls arcLength() in mathUtils.js
                     * the goal here is to unravel each lotus like it were a fan
                     */
                        var arc = arcLength(j, jLen, tempScale[i][j]);
                        if (arc && j === 0 && tempcount < 50) {
                            console.log(arc, j);
                            tempcount++;
                        }
                        break;
                    /*
                     * WIP
                     */
                    case 'triangle':
                        var triLimit = triLimit || sumLimit(iLen);
                        cubes[i][j].scale.z = (tempScale[i][j] < 1 ? 1 : tempScale[i][j]);
                        cubes[i][j].position.y = (iLen*(i+1)+j)/2.;
                        cubes[i][j].position.x = (i+1)*j;
                        break;
                }
            }
        }
        lastScale = tempScale;
    }
    // update @cycles with current execution time
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);
};

renderer.setSize($(window).width(), $(window).height());