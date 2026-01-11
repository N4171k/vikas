'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

// Component to handle face tracking and model positioning
function FaceTrackedModel({ modelPath, scale = 1, offset = [0, 0, 0], rotationOffset = [0, 0, 0], videoRef, faceLandmarkerRef, modelType }) {
    const objRef = useRef();

    // Extract folder path for texture resolving
    const folderPath = modelPath.substring(0, modelPath.lastIndexOf('/') + 1);

    // Load materials and object
    const materials = useLoader(MTLLoader, `${modelPath}.mtl`, (loader) => {
        loader.setResourcePath(folderPath);
    });

    const obj = useLoader(OBJLoader, `${modelPath}.obj`, (loader) => {
        materials.preload();
        loader.setMaterials(materials);
    });

    useFrame((state, delta) => {
        if (!faceLandmarkerRef.current || !videoRef.current || videoRef.current.readyState !== 4) return;

        // Perform detection
        const startTimeMs = performance.now();
        const results = faceLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const landmarks = results.faceLandmarks[0];

            // Key landmarks
            // 1: Base of nose
            // 168: Midpoint between eyes (glabella)
            // 454: Right ear tragus
            // 234: Left ear tragus
            // 10: Top of forehead
            // 152: Chin

            // Get Canvas size for normalized coordinates mapping
            const { width, height } = state.viewport; // Viewport width/height in 3D units at z=0

            // Helper to map normalized landmark to 3D space
            // Note: MediaPipe returns normalized [0,1], 3D world depends on camera FOV/Aspect
            // This is a simplified projection for overlay.

            // For a robust AR, we'd need a solver (PnP), but for 3js overlay we can approximate positions
            // assuming the webcam plane is at Z=0 (or specific depth).

            // Let's position the object roughly at Z=0 and map x/y

            // We need to mirror X because we mirrored the video

            // Anchors
            let anchorIndex = 168; // Glabella (Between eyes) - good for glasses
            if (modelType === 'cap') anchorIndex = 10; // Forehead

            const anchor = landmarks[anchorIndex];

            // Approximate Depth: Use the distance between eyes to estimate Z
            const leftEye = landmarks[33];
            const rightEye = landmarks[263];
            const eyeDist = Math.sqrt(
                Math.pow(leftEye.x - rightEye.x, 2) +
                Math.pow(leftEye.y - rightEye.y, 2) +
                Math.pow(leftEye.z - rightEye.z, 2)
            );

            // Simple depth scaling heuristic
            // The closer the face, the larger the distance.
            // Calibrate: scale factor / eyeDist

            if (objRef.current) {
                // Determine 3D Position
                // Match the mapping to the camera FOV (50deg) at z=0 (dist=5)
                // Visible height at z=0 is approx 4.66. Normalized -0.5 to 0.5 maps to -2.33 to 2.33.
                // Multiplier ~ 4.66. 
                // However, we want to align with the video plane which might be scaled "cover".
                // Let's use a heuristic that feels right for the "cover" typical mobile/desktop view.

                // Correction factors
                const xMult = 5.5;
                const yMult = 4.5;

                const bx = -(anchor.x - 0.5) * xMult; // Flipped back to negative to fix inversion
                const by = -(anchor.y - 0.5) * yMult;
                // const bz = -eyeDist * 2; // Depth effect

                // Apply Model Config Offsets (position is pass as prop via config, but we need to access it here)
                // We'll pass `offset` prop to FaceTrackedModel
                const offsetX = (offset?.[0] || 0);
                const offsetY = (offset?.[1] || 0);
                const offsetZ = (offset?.[2] || 0);

                const finalX = bx + offsetX;
                const finalY = by + offsetY;
                const finalZ = 0 + offsetZ; // Keep Z mostly flat for stability, or add bz if desired

                // Lerp for smoothness
                objRef.current.position.lerp(new THREE.Vector3(finalX, finalY, finalZ), 0.5);

                // Determine Rotation
                // Yaw (Face turning left/right): Left Eye Z vs Right Eye Z
                const yaw = Math.atan2(rightEye.z - leftEye.z, rightEye.x - leftEye.x);

                // Roll (Tilting head): Left Eye Y vs Right Eye Y
                const roll = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);

                // Pitch (Looking up/down): Forehead (10) vs Chin (152) z/y diff
                // Simple pitch approximation
                const pitch = (landmarks[10].z - landmarks[152].z) * 5; // Amplified

                const rotX = (rotationOffset?.[0] || 0);
                const rotY = (rotationOffset?.[1] || 0);
                const rotZ = (rotationOffset?.[2] || 0);

                // Use direct Yaw/Roll from atan2.
                // When facing forward, rightEye.x > leftEye.x, so dx > 0. dy ~ 0, dz ~ 0.
                // So yaw ~ 0, roll ~ 0.
                // This ensures the object faces forward by default (0 rotation).

                // Rotation Directions:
                // We corrected the signs to Positive to match the mirrored video behavior.
                // Left Tilt -> +Roll -> +RotZ (CCW) -> Matches Screen Left Tilt.

                objRef.current.rotation.set(pitch + 0.1 + rotX, yaw + rotY, roll + rotZ);

                // Determine Scale
                const baseScale = eyeDist * 15; // Tunable factor
                const finalScale = baseScale * scale;

                objRef.current.scale.set(finalScale, finalScale, finalScale);
            }
        }
    });

    return (
        <primitive
            ref={objRef}
            object={obj}
        />
    );
}

// Fallback Model for when tracking isn't initializing but we want to show something
function StaticModel({ modelPath, scale }) {
    const obj = useLoader(OBJLoader, `${modelPath}.obj`, (loader) => {
        const materials = useLoader(MTLLoader, `${modelPath}.mtl`);
        if (materials) {
            materials.preload();
            loader.setMaterials(materials);
        }
    });
    return <primitive object={obj} scale={[scale, scale, scale]} />;
}


export default function ARView({ modelType = 'glasses', onClose }) {
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);
    const faceLandmarkerRef = useRef(null);
    const [error, setError] = useState(null);
    const [trackingReady, setTrackingReady] = useState(false);

    // Initialize Camera
    useEffect(() => {
        async function startCamera() {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'user',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Camera error:", err);
                setError("Unable to access camera. Please allow camera permissions.");
            }
        }
        startCamera();
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    // Initialize Face Landmarker
    useEffect(() => {
        async function loadLandmarker() {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
                );

                faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                        delegate: "GPU"
                    },
                    outputFaceBlendshapes: false,
                    runningMode: "VIDEO",
                    numFaces: 1
                });

                setTrackingReady(true);
            } catch (err) {
                console.error("Failed to load FaceLandmarker:", err);
                setError("Failed to load AR Engine.");
            }
        }
        loadLandmarker();
    }, []);


    // Select model configuration
    const getModelConfig = () => {
        if (modelType === 'glasses') {
            return {
                path: '/models/glasses/oculos',
                scale: 0.6,
                offset: [0, -0.5, 0],
                type: 'glasses'
            };
        }
        if (modelType === 'cap') {
            return {
                path: '/models/cap/10131_BaseballCap_v2_L3',
                scale: 0.08,
                position: [0, 0.5, -0.5], // Offset relative to forehead anchor
                rotation: [-Math.PI / 2, 0, Math.PI], // Rotate 90 degrees on X axis
                type: 'cap'
            };
        }
        if (modelType === 'knitcap') {
            return {
                path: '/models/knitcap/10156_WinterKnitCap_v1-L3',
                scale: 0.2,
                position: [0, 0.0, -0.5], // Offset relative to forehead
                rotation: [-Math.PI / 2, 0, 0], // Base rotation
                type: 'cap'
            };
        }
        if (modelType === 'glasses2') {
            return {
                path: '/models/glasses2/glasses2',
                scale: 0.5,
                offset: [0, -0.5, 0],
                type: 'glasses'
            };
        }
        return null;
    };

    const config = getModelConfig();

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 2000, background: '#000' }}>
            <button
                onClick={onClose}
                style={{
                    position: 'absolute', top: '20px', right: '20px', zIndex: 2002,
                    background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none',
                    borderRadius: '50%', width: '40px', height: '40px', fontSize: '20px', cursor: 'pointer'
                }}
            >✕</button>

            {/* Hidden Video Element for ML processing */}
            {stream && (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        objectFit: 'cover', transform: 'scaleX(-1)'
                    }}
                />
            )}

            {/* AR Overlay - Canvas */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2001, pointerEvents: 'none' }}>
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                    <ambientLight intensity={1.0} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} />
                    <pointLight position={[-10, -10, -10]} intensity={1} />

                    <Suspense fallback={null}>
                        {config && trackingReady && (
                            <FaceTrackedModel
                                modelPath={config.path}
                                scale={config.scale}
                                offset={config.position}
                                rotationOffset={config.rotation}
                                videoRef={videoRef}
                                faceLandmarkerRef={faceLandmarkerRef}
                                modelType={config.type}
                            />
                        )}
                        {!trackingReady && <Html center><div style={{ color: 'white', background: 'rgba(0,0,0,0.7)', padding: '10px', borderRadius: '5px' }}>Loading Face Tracker...</div></Html>}
                    </Suspense>
                </Canvas>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    background: 'white', padding: '20px', borderRadius: '8px', zIndex: 2003, textAlign: 'center'
                }}>
                    <h3 style={{ color: 'black' }}>Error</h3>
                    <p style={{ color: 'black' }}>{error}</p>
                    <button onClick={onClose} style={{ marginTop: '10px', padding: '8px 16px', background: '#333', color: 'white', border: 'none', borderRadius: '4px' }}>Close</button>
                </div>
            )}

            <div style={{
                position: 'absolute', bottom: '30px', left: '0', width: '100%', textAlign: 'center', zIndex: 2002,
                color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.8)', pointerEvents: 'none'
            }}>
                <p>Ensure face is visible for tracking</p>
            </div>
        </div>
    );
}
