'use client';

import { motion } from 'framer-motion';

interface WorldMapProps {
    lat?: number;
    lon?: number;
    connected: boolean;
}

export function WorldMap({ lat, lon, connected }: WorldMapProps) {
    // Map coordinates to SVG pixels (Simplified Mercator or linear mapping for dashboard feel)
    const mapWidth = 800;
    const mapHeight = 400;

    const x = lon ? (lon + 180) * (mapWidth / 360) : 0;
    const y = lat ? (90 - lat) * (mapHeight / 180) : 0;

    return (
        <div className="relative w-full aspect-[2/1] bg-neutral-900/50 rounded-xl border border-neutral-800 overflow-hidden group">
            <svg
                viewBox={`0 0 ${mapWidth} ${mapHeight}`}
                className="w-full h-full opacity-30 group-hover:opacity-40 transition-opacity duration-700"
            >
                {/* Simple World SVG Path (simplified for performance and aesthetics) */}
                <path
                    d="M150,150 L160,140 L180,145 L200,130 L250,150 L300,120 L350,140 L400,150 L450,130 L500,160 L550,140 L600,150 L650,140 L700,160 L750,150 L800,130 L800,400 L0,400 L0,150 Z"
                    fill="#3b82f6"
                    className="animate-pulse"
                />

                {/* This is a placeholder for a real world path. 
                    In a production app, we'd use a GeoJSON path. 
                    For this WOW effect, let's use a stylish abstract grid. */}
                {[...Array(20)].map((_, i) => (
                    <line
                        key={`h-${i}`}
                        x1="0"
                        y1={i * (mapHeight / 20)}
                        x2={mapWidth}
                        y2={i * (mapHeight / 20)}
                        stroke="#404040"
                        strokeWidth="0.5"
                    />
                ))}
                {[...Array(40)].map((_, i) => (
                    <line
                        key={`v-${i}`}
                        x1={i * (mapWidth / 40)}
                        y1="0"
                        x2={i * (mapWidth / 40)}
                        y2={mapHeight}
                        stroke="#404040"
                        strokeWidth="0.5"
                    />
                ))}
            </svg>

            {connected && lat && lon && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute"
                    style={{
                        left: `${(x / mapWidth) * 100}%`,
                        top: `${(y / mapHeight) * 100}%`,
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    {/* Pulsing ring */}
                    <motion.div
                        animate={{
                            scale: [1, 2, 2.5],
                            opacity: [0.5, 0.2, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeOut",
                        }}
                        className="absolute inset-0 w-8 h-8 -ml-4 -mt-4 rounded-full bg-blue-500/50"
                    />
                    {/* Glowing Core */}
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] border-2 border-white" />
                </motion.div>
            )}

            <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-xs font-mono text-neutral-400">
                    {connected && lat !== undefined && lon !== undefined ? `GEOLOCATION: ${lat.toFixed(4)}, ${lon.toFixed(4)}` : 'SIGNAL OFFLINE'}
                </span>
            </div>

            <div className="absolute top-4 right-4 text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
                Atlantic Global Intercept v1.0
            </div>
        </div>
    );
}
