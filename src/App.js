import './App.css';
import {Canvas, useFrame, useLoader} from "@react-three/fiber";
import {useMemo, useRef, useState} from "react";
import {FlyControls, OrbitControls, PerspectiveCamera} from "@react-three/drei";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import nj from "@d4c/numjs";
import * as THREE from 'three'


const coords = [[ -242.0 , 196.0 ],
    [ -132.0 , 197.0 ],
    [ -96.0 , 124.0 ],
    [ 0.0 , 104.0 ],
    [ 101.0 , 181.0 ],
    [ 81.0 , 95.0 ],
    [ 4.0 , 65.0 ],
    [ 76.0 , 34.0 ],
    [ 166.0 , 60.0 ],
    [ 163.0 , 17.0 ],
    [ 83.0 , -31.0 ],
    [ 83.0 , -136.0 ],
    [ 135.0 , -147.0 ],
    [ 151.0 , -91.0 ],
    [ 243.0 , -66.0 ],
    [ 221.0 , 21.0 ],
    [ 266.0 , -9.0 ],
    [ 290.0 , -65.0 ],
    [ 354.0 , -106.0 ],
    [ 316.0 , -179.0 ],
    [ 277.0 , -136.0 ],
    [ 277.0 , -103.0 ],
    [ 197.0 , -155.0 ],
    [ 167.0 , -222.0 ],
    [ 89.0 , -183.0 ],
    [ 89.0 , -251.0 ],
    [ 4.0 , -269.0 ],
    [ 29.0 , -122.0 ],
    [ -44.0 , -105.0 ],
    [ -200.0 , -180.0 ],
    [ -286.0 , -180.0 ],
    [ -128.0 , -41.0 ],
    [ -188.0 , -47.0 ],
    [ -305.0 , -118.0 ],
    [ -306.0 , -163.0 ],
    [ -354.0 , -161.0 ],
    [ -327.0 , -14.0 ],
    [ -167.0 , 63.0 ],
    [ -223.0 , 74.0 ],
    [ -305.0 , 40.0 ],
    [ -286.0 , 89.0 ],
    [ -345.0 , 103.0 ],
    [ -238.0 , 144.0 ],
    [ -237.0 , 121.0 ],
    [ -182.0 , 131.0 ],
    [ -149.0 , 131.0 ]]

// const coords = [[0, 0],[20, 20],[20,-20]]

function Box(props) {
  // This reference will give us direct access to the mesh
  const meshRef = useRef()
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (meshRef.current.rotation.x += 10 * delta))
  // Return view, these are regular three.js elements expressed in JSX
  return (
      <mesh
          {...props}
          ref={meshRef}
          scale={active ? 1.5 : 1}
          onClick={(event) => setActive(!active)}
          onPointerOver={(event) => setHover(true)}
          onPointerOut={(event) => setHover(false)}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
      </mesh>
  )
}

function Plane(props) {
    const planeMeshRef = useRef()
    return (
        <mesh ref={planeMeshRef} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry {...props} />
            <meshPhongMaterial color="#75C2F6" />
        </mesh>
    );
}

function Lines() {
    const lineRef = useRef()
    const points = []
    for (let i in coords) {
        let p = coords[i]
        points.push(new THREE.Vector3(p[0], 10, -p[1]))
    }
    points.push(new THREE.Vector3(coords[0][0], 10, -coords[0][1]))

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)

    return (
        <>
            <group >
                <line ref={lineRef} geometry={lineGeometry}>
                    <lineBasicMaterial attach="material" color={'red'} linewidth={100} linecap={'round'} linejoin={'round'} />
                </line>
            </group>
        </>
    )
}

function Sphere(props) {
    return (
        <mesh
            {...props}>
            <sphereGeometry args={[1, 24, 24]} />
            <meshStandardMaterial color={"blue"} />
        </mesh>
    );
};

function Model(props) {
    const result = useLoader(GLTFLoader, '/Wall.gltf')
    const copy = useMemo(() => result.scene.clone(), [result.scene])
    const modRef = useRef()

    // You don't need to check for the presence of the result, when we're here
    // the result is guaranteed to be present since useLoader suspends the component
    return <primitive ref={modRef} object={copy} {...props}/>
}

function Drone(props) {
    const result = useLoader(GLTFLoader, '/drone.glb')
    const copy = useMemo(() => result.scene.clone(), [result.scene])
    const droneRef = useRef()

    // You don't need to check for the presence of the result, when we're here
    // the result is guaranteed to be present since useLoader suspends the component
    return <primitive ref={droneRef} object={copy} {...props}/>
}

function Walls(){
    const models = []
    for (let i in coords){
        let index = parseInt(i)
        let p = coords[index]
        console.log("First is " + index + " next is " + ((index+1) % coords.length))
        let q = coords[(index+1) % coords.length]
        let r = [(p[0]+q[0])/2, (p[1]+q[1])/2]
        let a = nj.array([q[0]-p[0], q[1]-p[1]], 'float64')
        let b = nj.array([0.0, -1.0], 'float64')
        let angle = Math.atan2(a.get(1), a.get(0)) - Math.atan2(b.get(1), b.get(0))
        if (angle > Math.PI)        { angle -= 2 * Math.PI; }
        else if (angle <= -Math.PI) { angle += 2 * Math.PI; }

        let dirx = q[0] - p[0]
        let diry = q[1] - p[1]
        let dist = Math.sqrt(dirx * dirx + diry * diry)
        let unit_v = nj.array([dirx, diry])
        unit_v = unit_v.divide(dist)
        let k = Math.floor(dist / 20)
        console.log(i + " is " + k)

        for (let j = 0; j < k; j++){
            let pt = nj.array(p)
            pt = pt.add( unit_v.multiply(10 + 20 * j))
            models.push(<Model position={[pt.get(0), 0, -pt.get(1)]} rotation={[0, angle + Math.PI/2, 0]} />)
        }
        let pt = nj.array(q)
        pt = pt.add( unit_v.multiply(-10 ))
        models.push(<Model position={[pt.get(0), 0, -pt.get(1)]} rotation={[0, angle + Math.PI/2, 0]} />)
        // models.push(<Model position={[r[0], 0, -r[1]]} rotation={[0, 0, 0]} />)
        // models.push(<Sphere position={[p[0], 10, -p[1]]} />)
    }
    models.push(<Lines/>)
    models.push(<Drone position={[0, 6, -1.5]} rotation={[0, 0, 0]} scale={8}/>)
    // models.push(<Sphere position={[0, 6, 0]} />)
    return ([...models])
}

function App() {
    return (
      <div id="canvas-container" >
        <Canvas camera={{position: [0, 0, 30]}}>
            {/*<PerspectiveCamera makeDefault camera={{position: [0, 0, 30]}} fov={30}/>*/}
            <OrbitControls/>
          <ambientLight />
          <pointLight position={[10, 10, 30]} />
            {/*<Box position={[0, 0.5, 0]} />*/}
            <Plane args={[1000, 1000]}/>
            <axesHelper args={[20]} />
            <gridHelper args={[1000, 50, 0xff0000, 'teal']} />
            <Walls/>
        </Canvas>
      </div>
  );
}

export default App;
