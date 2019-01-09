var camera, scene, renderer;

var plane, cube;

var mouse, raycaster;

//indicates the key's states
var isShiftDown = false, isRotate = false;

//the red cube indicates the mouse position
var rollOverMesh, rollOverMaterial;

//width and the height of the html block
var width, height;

//light
var directionalLight;
var ambientLight;

//the objects in the scene
var objects = [];

//the object we select, which is used in setting the size of the geometry
var selected;

var type="cube";//形状
var texture="";//纹理


init();
render();
function init() {
    //init camera
    width=document.getElementById("canvas_frame").clientWidth;
    height=document.getElementById("canvas_frame").clientHeight;
    camera = new THREE.PerspectiveCamera( 45, width / height, 1, 10000 );
    camera.position.set( 500, 800, 1300 );
    camera.lookAt( 0, 0, 0 );

    //init scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x000000 );

    // init the red cube which indicates the position of the mouse
    var rollOverGeo = new THREE.BoxBufferGeometry( 50, 50, 50 );
    rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
    rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
    scene.add( rollOverMesh );

    // init the grid
    var gridHelper = new THREE.GridHelper( 1200, 24 );
    gridHelper.translateY(0.1);
    scene.add( gridHelper );

    //raycaster can help us select the geometry according the mouse position
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    //init the floor
    var geometry = new THREE.PlaneBufferGeometry( 1200, 1200 );
    geometry.rotateX( - Math.PI / 2 );
    plane = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial( { color: 0x808080, roughness: 0, metalness: 0 } ) );
    scene.add( plane );
    objects.push( plane );

    // init ambientlight
    ambientLight = new THREE.AmbientLight( 0xffffff );
    scene.add( ambientLight );

    // init directionlight
    directionalLight = new THREE.DirectionalLight( 0xf0f0f0 );
    directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
    scene.add( directionalLight );

    //init renderer here
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( width, height );

    //add the dom to the html block
    document.getElementById("canvas_frame").appendChild( renderer.domElement );

    //add event listener
    document.getElementById("canvas_frame").addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.getElementById("canvas_frame").addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'keydown', onDocumentKeyDown, false );
    document.addEventListener( 'keyup', onDocumentKeyUp, false );

}

function onDocumentMouseMove( event ) {

    event.preventDefault();

    //We should set the mouse position reference coordinate is the left side of the html block
    //instead of the left side of the window
    var x=event.clientX-440;
    var y=event.clientY-30;
    mouse.set( ( x / width ) * 2 - 1, - ( y / height ) * 2 + 1 );
    raycaster.setFromCamera( mouse, camera );

    //calculate the intersection, we can get an array of geometry, the first one is we selected
    var intersects = raycaster.intersectObjects( objects );
    //set the transparent red cube
    if ( intersects.length > 0 ) {
        var intersect = intersects[ 0 ];
        rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
        rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
    }
    render();
}

function onDocumentMouseDown( event ) {

    event.preventDefault();

    //We should set the mouse position reference coordinate is the left side of the html block
    //instead of the left side of the window
    var x=event.clientX-440;
    var y=event.clientY-30;
    mouse.set( ( x / width ) * 2 - 1, - ( y / height ) * 2 + 1 );

    raycaster.setFromCamera( mouse, camera );

    //calculate the intersection, we can get an array of geometry, the first one is we selected
    var intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 ) {
        var intersect = intersects[ 0 ];//the intersect indicates the cube the mouse choice

        //press the Shift and the Alt at th same time
        if(isRotate && isShiftDown){
            selected=intersect.object;
        } else if(isRotate && !isShiftDown){ //just press the Alt
            if ( intersect.object !== plane ) {
                intersect.object.rotateY(Math.PI/2);
            }
        } else if ( isShiftDown && !isRotate ) { //just press the Shift
            // if the geometry isn't the floor, delete it.
            if ( intersect.object !== plane ) {
                scene.remove( intersect.object );
                objects.splice( objects.indexOf( intersect.object ), 1 );
            }
        } else { // create the geometry
            var voxel;

            if(type==="cube"){
                var cubeGeo = new THREE.BoxBufferGeometry( 50, 50, 50 );
                if(texture===""){ //if no texture
                    cubeMaterial = new THREE.MeshLambertMaterial( {
                        color: document.getElementById("color").value
                    } );
                }else{ //if a texture is selected
                    cubeMaterial = new THREE.MeshLambertMaterial( {
                        color: document.getElementById("color").value,
                        // load texture here
                        map: new THREE.TextureLoader().load( texture )
                    } );
                }
                // new the geometry according the geometry and the material
                voxel = new THREE.Mesh( cubeGeo, cubeMaterial );
                voxel.position.copy( intersect.point ).add( intersect.face.normal );
                voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
            }else if(type==="ball"){
                var geometry = new THREE.SphereGeometry(25, 40, 40);
                if(texture===""){
                    material = new THREE.MeshLambertMaterial( {
                        //set color according to the value in <input> </input>
                        color: document.getElementById("color").value
                    } );
                }else{
                    material = new THREE.MeshLambertMaterial( {
                        color: document.getElementById("color").value,
                        //load texture according the texture path
                        map: new THREE.TextureLoader().load( texture )
                    } );
                }
                // new the geometry according the geometry and the material
                voxel = new THREE.Mesh(geometry, material);
                voxel.position.copy( intersect.point ).add( intersect.face.normal );
                voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
            }else if(type==="cylinder"){
                var geometry = new THREE.CylinderGeometry(25, 25, 50, 25);
                if(texture===""){
                    material = new THREE.MeshLambertMaterial( {

                        color: document.getElementById("color").value
                    } );
                }else{
                    material = new THREE.MeshLambertMaterial( {

                        color: document.getElementById("color").value,

                        map: new THREE.TextureLoader().load( texture )
                    } );
                }
                voxel = new THREE.Mesh(geometry, material);
                voxel.position.copy( intersect.point ).add( intersect.face.normal );
                voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
            }else if(type==="cone"){
                var geometry = new THREE.CylinderGeometry(0, 25, 50, 25);
                if(texture===""){
                    material = new THREE.MeshLambertMaterial( {

                        color: document.getElementById("color").value
                    } );
                }else{
                    material = new THREE.MeshLambertMaterial( {

                        color: document.getElementById("color").value,

                        map: new THREE.TextureLoader().load( texture )
                    } );
                }
                voxel = new THREE.Mesh(geometry, material);
                voxel.position.copy( intersect.point ).add( intersect.face.normal );
                voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
            }else if(type==="truncated"){
                var geometry = new THREE.CylinderGeometry(12, 25, 50, 25);
                if(texture===""){
                    material = new THREE.MeshLambertMaterial( {

                        color: document.getElementById("color").value
                    } );
                }else{
                    material = new THREE.MeshLambertMaterial( {

                        color: document.getElementById("color").value,

                        map: new THREE.TextureLoader().load( texture )
                    } );
                }
                voxel = new THREE.Mesh(geometry, material);
                voxel.position.copy( intersect.point ).add( intersect.face.normal );
                voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
            }else if(type==="octahedron"){
                var geometry = new THREE.OctahedronGeometry(25);
                if(texture===""){
                    material = new THREE.MeshLambertMaterial( {

                        color: document.getElementById("color").value
                    } );
                }else{
                    material = new THREE.MeshLambertMaterial( {

                        color: document.getElementById("color").value,

                        map: new THREE.TextureLoader().load( texture )
                    } );
                }
                voxel = new THREE.Mesh(geometry, material);
                voxel.position.copy( intersect.point ).add( intersect.face.normal );
                voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
            }else if(type==="bunny"){

                var loader = new THREE.OBJLoader();

                loader.load('../image/bunny.obj',function (obj) {
                    // the obj contains a group of Mesh

                    //set the size of the object
                    obj.children[0].scale.set(15,15,15);
                    voxel=obj.children[0];

                    // set the object after load it
                    //obj.children[0].geometry.center();//网格模型的几何体居中
                    //obj.children[0].material.color.set(0xff0000);//设置材质颜色
                    voxel.position.copy( intersect.point ).add( intersect.face.normal );
                    voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );

                    scene.add(voxel);
                    objects.push(voxel);
                })
            }else if(type==="dragon"){

                var loader = new THREE.OBJLoader();

                loader.load('../image/dragon.obj',function (obj) {
                    // the obj contains a group of Mesh

                    //set the size of the object
                    obj.children[0].scale.set(50,50,50);//网格模型缩放
                    voxel=obj.children[0];

                    // set the object after load it
                    //obj.children[0].geometry.center();//网格模型的几何体居中
                    //obj.children[0].material.color.set(0xff0000);//设置材质颜色
                    voxel.position.copy( intersect.point ).add( intersect.face.normal );
                    voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
                    scene.add(voxel);
                    objects.push(voxel);
                })
            }else if(type==="bigger"){
                var previous=intersect.object.scale;
                intersect.object.scale.set(previous.x + 1,previous.x + 1, previous.x + 1 );
            }else if(type==="smaller"){
                var previous=intersect.object.scale;
                console.log(previous);
                if(previous.x>1 && previous.y>1 && previous.z>1){
                    intersect.object.scale.set(previous.x -1 ,previous.x - 1, previous.x - 1 );
                }
            }
            if(type!="bunny" && type!="dragon" && type!="bigger" && type!="smaller"){
                scene.add( voxel );
                objects.push( voxel );
            }


        }
        render();
    }

}

// the camera_theta and the camera_y indicates the position of the camera
var camera_theta=Math.PI/2;
var camera_y=Math.PI/4;

//the light's position
var light_x=1.0, light_y=0.75, light_z=0.5;

//the ambientlight's intensity
var ambientlight_intensity=0.9;

//handle the key press event
function onDocumentKeyDown( event ) {

    //console.log(event);
    switch ( event.key ) {
        case "Shift": isShiftDown = true; break;
        case "Alt": isRotate = true; break;

        //change the position of the camera
        case "a": {
            camera_theta -= 0.05;
            camera.position.set( 1393*Math.sin(camera_theta), 1606*Math.sin(camera_y), 1393*Math.cos(camera_theta) );
            camera.lookAt(0,0,0);
            render();
            break;
        }
        case "d": {
            camera_theta += 0.05;
            camera.position.set( 1393*Math.sin(camera_theta), 1606*Math.sin(camera_y), 1393*Math.cos(camera_theta) );
            camera.lookAt(0,0,0);
            render();
            break;
        }
        case "w": {
            if(camera_y>=Math.PI/2){
                break;
            }
            camera_y+=0.05;
            camera.position.set( 1393*Math.sin(camera_theta), 1606*Math.sin(camera_y), 1393*Math.cos(camera_theta) );
            camera.lookAt(0,0,0);
            render();
            break;
        }
        case "s": {
            if(camera_y<=-Math.PI/2){
                break;
            }
            camera_y-=0.05;
            camera.position.set( 1393*Math.sin(camera_theta), 1606*Math.sin(camera_y), 1393*Math.cos(camera_theta) );
            camera.lookAt(0,0,0);
            render();
            break;
        }

        // change the intensity of the camera
        case "=":{
            if(ambientlight_intensity<1){
                console.log(ambientlight_intensity);
                ambientlight_intensity+=0.05;
                ambientLight.intensity = ambientlight_intensity;
                scene.add(ambientLight);
            }
            render();
            break;
        }
        case "-":{
            if(ambientlight_intensity>0){
                console.log(ambientlight_intensity);
                ambientlight_intensity-=0.05;
                ambientLight.intensity = ambientlight_intensity;
                scene.add(ambientLight);
            }
            render();
            break;
        }

        //change the light's position
        case "l": {
            light_x-=0.1;
            directionalLight.position.set( light_x, light_y, light_z ).normalize();
            render();
            break;
        }
        case "j": {
            light_x+=0.1;
            directionalLight.position.set( light_x, light_y, light_z ).normalize();
            render();
            break;
        }
        case "i": {
            light_y-=0.1;
            directionalLight.position.set( light_x, light_y, light_z ).normalize();
            render();
            break;
        }
        case "k": {
            light_y+=0.1;
            directionalLight.position.set( light_x, light_y, light_z ).normalize();
            render();
            break;
        }
        case "n": {
            light_z-=0.1;
            directionalLight.position.set( light_x, light_y, light_z ).normalize();
            render();
            break;
        }
        case "m": {
            light_z += 0.1;
            directionalLight.position.set(light_x, light_y, light_z).normalize();
            render();
            break;
        }
    }

}

function onDocumentKeyUp( event ) {
    switch ( event.key ) {
        case "Shift": isShiftDown = false; break;
        case "Alt": isRotate=false; break;
    }
}

function render(select) {
    renderer.render( scene, camera );

    //when the shift and the alt is pressed at the same time, the object rotate
    if(isShiftDown && isRotate){
        selected.rotateY(0.01);
        requestAnimationFrame(render);
    }

}

//set the type, which decides the shape of the geometry we create.
function addcube(){
    console.log(objects);
    type="cube";
}
function addball(){
    type="ball";
}
function addcylinder(){
    type="cylinder";
}
function addcone(){
    type="cone";
}
function addtruncated(){
    type="truncated";
}
function addoctahedron(){
    type="octahedron";
}
function notexture(){
    texture="";
}

//set the texture, which determines the material of the geometry we create
function drape(){
    texture="../image/square-outline-textured.png";
}
function water(){
    texture="../image/water.jpg";
}
function granite(){
    texture="../image/disturb.jpg";
}
function grass(){
    texture="../image/grass.png";
}
function solid(){
    texture="../image/dirt.png";
}
function bunny(){
    type="bunny";
}
function dragon(){
    type="dragon";
}

//change the color of the ambentlight
function change_ambientlight_color(){
    ambientLight.color.setHex(document.getElementById("light_color").value);
    render();
}

//change the color of the directioncolor
function change_direction_color(){
    directionalLight.color.setHex(document.getElementById("light_color").value);
    render();
}


function bigger(){
    type="bigger";
}
function smaller(){
    type="smaller";
}

