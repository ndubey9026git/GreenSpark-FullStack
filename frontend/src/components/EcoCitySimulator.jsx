import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import * as THREE from 'three'; // Import Three.js methods
import './EcoCitySimulator.css';

// --- Game Configuration ---
const TILE_SIZE = 5; 
const GRID_WIDTH = 16;
const GRID_HEIGHT = 12;
const ORIGIN_X = -(GRID_WIDTH * TILE_SIZE) / 2 + TILE_SIZE / 2;
const ORIGIN_Z = -(GRID_HEIGHT * TILE_SIZE) / 2 + TILE_SIZE / 2;

const INITIAL_RESOURCES = {
    wealth: 500,
    population: 50,
    carbon: 10,
    health: 90,
    energy: 100,
    water: 100,
    research: 0,
    happiness: 70,
};

// Global References for Three.js objects
let scene, renderer, camera, heroMesh;
let gameObjects = new Map();
let map = []; // 0: Field, 1: Forest, 2: Clean River, 3: Polluted River, 5: Planted Tree

const materials = {
    field: new THREE.MeshLambertMaterial({ color: 0x82b74b }),
    forest: new THREE.MeshLambertMaterial({ color: 0x4a7c3b }),
    river: new THREE.MeshLambertMaterial({ color: 0x3b82f6 }),
    polluted: new THREE.MeshLambertMaterial({ color: 0x7e57c2 }),
    hero: new THREE.MeshLambertMaterial({ color: 0xffa000 }),
    plantedTree: new THREE.MeshLambertMaterial({ color: 0x004d40 }),
};

// Utility functions (outside of the component to avoid re-creation)
function getWorldPosition(x, z) {
    return new THREE.Vector3(
        ORIGIN_X + x * TILE_SIZE,
        0.25, 
        ORIGIN_Z + z * TILE_SIZE
    );
}
function createTile(x, z, type) {
    let material;
    if (type === 0) material = materials.field;
    else if (type === 1) material = materials.forest;
    else if (type === 2) material = materials.river;
    else if (type === 3) material = materials.polluted;
    else if (type === 5) material = materials.plantedTree;
    
    const geometry = new THREE.BoxGeometry(TILE_SIZE, 0.5, TILE_SIZE);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(getWorldPosition(x, z));
    mesh.position.y = 0; 
    scene.add(mesh);
    gameObjects.set(`${x},${z}`, mesh);
}
function initializeMap(startPos) {
    // Clear previous objects from scene
    gameObjects.forEach(mesh => scene.remove(mesh));
    gameObjects.clear();
    map = [];

    for (let z = 0; z < GRID_HEIGHT; z++) {
        map[z] = [];
        for (let x = 0; x < GRID_WIDTH; x++) {
            let type = 0;
            if (Math.random() < 0.15) type = 1;
            if (Math.random() < 0.05 && z > 5) type = 3;
            map[z][x] = type;
            createTile(x, z, type);
        }
    }
    if (map[startPos.z] && map[startPos.z][startPos.x] !== undefined) {
         map[startPos.z][startPos.x] = 0;
    }
}
function createHero(startPos) {
    const heroGeometry = new THREE.CylinderGeometry(TILE_SIZE * 0.2, TILE_SIZE * 0.2, TILE_SIZE * 0.8, 8);
    heroMesh = new THREE.Mesh(heroGeometry, materials.hero);
    scene.add(heroMesh);
    const worldPos = getWorldPosition(startPos.x, startPos.z);
    heroMesh.position.set(worldPos.x, TILE_SIZE * 0.4 + 0.25, worldPos.z);
}
function updateTileMesh(x, z, newType) {
    const key = `${x},${z}`;
    if (gameObjects.has(key)) {
        const oldMesh = gameObjects.get(key);
        scene.remove(oldMesh);
        gameObjects.delete(key);
    }
    map[z][x] = newType;
    createTile(x, z, newType);
}

// --- React Component ---

const EcoCitySimulator = ({ gameId, gameData }) => {
    const [gameStatus, setGameStatus] = useState('ready');
    const [resources, setResources] = useState(INITIAL_RESOURCES);
    const [currentYear, setCurrentYear] = useState(1);
    const [message, setMessage] = useState('Welcome, Mayor!');
    const [playerGridPos, setPlayerGridPos] = useState({ x: 8, z: 6 });
    const [isSceneReady, setIsSceneReady] = useState(false);
    const navigate = useNavigate();

    const sceneRef = useRef(null);
    const gameIntervalRef = useRef(null);
    
    // --- Three.js Initialization ---
    const initThreeJs = useCallback(() => {
        if (!sceneRef.current || isSceneReady) return;

        const container = sceneRef.current;
        const CANVAS_WIDTH = container.clientWidth;
        const CANVAS_HEIGHT = 500;

        // Cleanup existing canvas if re-initializing
        if (renderer) {
             renderer.dispose();
             if(renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        
        // Setup Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);
        renderer.setClearColor(0x87ceeb);
        
        // ✅ FIX: Explicitly append the canvas to the ref container
        container.appendChild(renderer.domElement);

        // Setup Scene and Camera
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, CANVAS_WIDTH / CANVAS_HEIGHT, 0.1, 1000);
        camera.position.set(30, 30, 30);
        camera.lookAt(0, 0, 0);

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(20, 40, 20);
        scene.add(dirLight);

        // Initialize Game World
        initializeMap(playerGridPos);
        createHero(playerGridPos);
        
        // Start rendering loop
        animate();
        setIsSceneReady(true);
    }, [isSceneReady, playerGridPos]);
    
    // Animate loop function 
    const animate = () => {
        requestAnimationFrame(animate);
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    };
    
    // Effect to run initialization when the component mounts and the ref is available
    useEffect(() => {
        initThreeJs();
        // Cleanup function for unmounting
        return () => {
            if (renderer) {
                renderer.dispose();
            }
        };
    }, [initThreeJs]);
    
    // --- Map Interaction Logic ---
    const updateHeroPosition = (newX, newZ) => {
        newX = Math.max(0, Math.min(GRID_WIDTH - 1, newX));
        newZ = Math.max(0, Math.min(GRID_HEIGHT - 1, newZ));
        
        setPlayerGridPos({ x: newX, z: newZ });
        
        const worldPos = getWorldPosition(newX, newZ);
        if(heroMesh) heroMesh.position.set(worldPos.x, TILE_SIZE * 0.4 + 0.25, worldPos.z);
        if(camera) camera.lookAt(worldPos.x, worldPos.y, worldPos.z);
    };

    // Keyboard input for movement
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (gameStatus !== 'playing') return;
            let { x, z } = playerGridPos;

            switch (event.key) {
                case 'ArrowUp': z--; break;
                case 'ArrowDown': z++; break;
                case 'ArrowLeft': x--; break;
                case 'ArrowRight': x++; break;
                default: return;
            }
            updateHeroPosition(x, z);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [gameStatus, playerGridPos]);

    // --- Game Logic Loop (Runs every 3 seconds for a game "Year") ---
    const gameTick = useCallback(() => {
        if (gameStatus !== 'playing') return;

        const newResources = { ...resources };
        newResources.health = Math.max(0, newResources.health - newResources.carbon * 0.05);
        newResources.energy = Math.max(0, newResources.energy - newResources.population * 0.5);
        newResources.water = Math.max(0, newResources.water - newResources.population * 0.4);
        newResources.carbon = Math.min(100, newResources.carbon + newResources.wealth * 0.01 + newResources.population * 0.02);

        if (newResources.health <= 0) {
            setMessage('Ecosystem Collapse! Mission Failed.');
            setGameStatus('finished');
        } else if (currentYear >= gameData.gameDuration) {
            setMessage('Sustainable Future Achieved! Mission Success.');
            setGameStatus('finished');
        }

        setResources(newResources);
        setCurrentYear(prev => prev + 1);
        setMessage(`Year ${currentYear}: Monitoring City Status...`);
    }, [gameStatus, resources, currentYear, gameData]);

    useEffect(() => {
        if (gameStatus === 'playing') {
            gameIntervalRef.current = setInterval(gameTick, 3000); 
        } else if (gameStatus === 'finished') {
            clearInterval(gameIntervalRef.current);
        }
        return () => clearInterval(gameIntervalRef.current);
    }, [gameStatus, gameTick]);

    // --- Actions ---
    const performAction = (actionType) => {
        if (gameStatus !== 'playing' || !isSceneReady) return;
        const { x, z } = playerGridPos;
        const currentTileType = map[z][x];
        const newResources = { ...resources };

        if (actionType === 'plant') {
            if (currentTileType === 0) {
                updateTileMesh(x, z, 5); // 5 = Planted Tree
                newResources.wealth += 20;
                newResources.health = Math.min(100, newResources.health + 5);
                setMessage(`Planted a tree at (${x}, ${z})! Health +5.`);
            } else {
                setMessage("Cannot plant here. Move to an open field (Green).");
                return;
            }
        } else if (actionType === 'clean') {
            if (currentTileType === 3) { // 3 = Polluted River
                updateTileMesh(x, z, 2); // 2 = Clean River
                newResources.wealth += 15;
                newResources.carbon = Math.max(0, newResources.carbon - 10);
                setMessage(`Cleaned pollution at (${x}, ${z})! Carbon -10.`);
            } else {
                setMessage("No pollution found to clean here.");
                return;
            }
        }
        setResources(newResources);
    };

    const startGame = () => {
        setResources(INITIAL_RESOURCES);
        setCurrentYear(1);
        setGameStatus('playing');
        // Re-initialize map and hero for fresh start
        if(isSceneReady) {
            initializeMap(playerGridPos);
            createHero(playerGridPos);
        }
        setMessage('Simulation started! Use ARROW KEYS to move and take action.');
    };
    
    const handleSubmitScore = async () => {
        const finalScore = resources.wealth + resources.health * 5 - resources.carbon * 5;
        
        try {
            await API.post(`/games/${gameId}/submit-score`, { score: finalScore });
            alert(`Score submitted! Final Score: ${Math.round(finalScore)}.`);
            navigate('/dashboard');
        } catch (err) {
            console.error("Error submitting score:", err);
            alert('Failed to submit score.');
        }
    };

    const StatusOverlay = ({ message, score }) => (
        <motion.div 
            className="game-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
            <h2 className="text-4xl font-extrabold">{message}</h2>
            <p className="text-xl">Final Score: {Math.round(score)}</p>
            {gameStatus === 'finished' && (
                <div className="flex flex-col gap-3 mt-5">
                    <button onClick={handleSubmitScore} className="game-button primary">Submit Final Score</button>
                    <button onClick={startGame} className="game-button secondary">Play Again</button>
                </div>
            )}
            {gameStatus === 'ready' && (
                <button onClick={startGame} className="game-button primary">Start New City</button>
            )}
            <p className="text-sm mt-4">Use ARROW KEYS to move the hero.</p>
        </motion.div>
    );

    return (
        <div className="eco-city-container">
            <AnimatePresence>
                {(gameStatus === 'ready' || gameStatus === 'finished') && 
                    <StatusOverlay message={message} score={resources.wealth + resources.health * 5 - resources.carbon * 5} />
                }
            </AnimatePresence>
            
            {/* --- Game Header/Stats UI --- */}
            <div className="game-ui-header">
                <div className="stat-box year-box">Year: **{currentYear}** / {gameData.gameDuration}</div>
                <div className="stat-box health-box">Health: **{Math.round(resources.health)}%**</div>
                <div className="stat-box carbon-box">Carbon: **{Math.round(resources.carbon)}%**</div>
                <div className="stat-box wealth-box">Wealth: **${Math.round(resources.wealth)}**</div>
                <button className="dashboard-button" onClick={() => navigate('/learn/lessons')}>Back</button>
            </div>
            
            <div className="flex flex-col md:flex-row w-full flex-1">
                {/* --- 3D Scene Container --- */}
                <div ref={sceneRef} className="game-scene-canvas w-full md:w-3/4">
                    {!isSceneReady && <div className="loading-message">Loading 3D world...</div>}
                </div>

                {/* --- Action/Build Menu (Right Sidebar) --- */}
                <div className="game-ui-actions w-full md:w-1/4 p-4 flex flex-col gap-4">
                    <h4 className="text-lg font-bold text-gray-700">Actions:</h4>
                    <button onClick={() => performAction('plant')} className="action-button btn-tree" disabled={gameStatus !== 'playing'}>
                        🌳 Plant Tree (+Health)
                    </button>
                    <button onClick={() => performAction('clean')} className="action-button btn-river" disabled={gameStatus !== 'playing'}>
                        💧 Clean River (-Carbon)
                    </button>
                    <div className="message-log bg-gray-100 p-3 rounded-lg flex-grow overflow-y-auto">
                        <p className="text-xs font-semibold mb-1 text-gray-600">Mission Status:</p>
                        <p className="text-sm text-gray-800 font-medium">{message}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EcoCitySimulator;
