"use client";
import React, { useState } from "react";
import { Map, Marker } from "pigeon-maps";

// ─── tipos ────────────────────────────────────────────────────────────────────

type LatLng = [number, number];

type SingleModeProps = {
	mode?: "single";
	/** Llamado cada vez que el usuario hace clic en el mapa */
	onChange: (lat: number, lon: number) => void;
	onDistance?: never;
};

type DistanceModeProps = {
	mode: "distance";
	onChange?: never;
	/**
	 * Llamado cuando ambos puntos están colocados.
	 * @param from  [lat, lng] del punto A
	 * @param to    [lat, lng] del punto B
	 * @param km    distancia en kilómetros (Haversine)
	 */
	onDistance?: (from: LatLng, to: LatLng, km: number) => void;
};

export type MyMapProps = SingleModeProps | DistanceModeProps;

// ─── fórmula Haversine ────────────────────────────────────────────────────────

function haversineKm(a: LatLng, b: LatLng): number {
	const R = 6371;
	const dLat = ((b[0] - a[0]) * Math.PI) / 180;
	const dLon = ((b[1] - a[1]) * Math.PI) / 180;
	const lat1 = (a[0] * Math.PI) / 180;
	const lat2 = (b[0] * Math.PI) / 180;
	const h =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
	return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// ─── línea SVG (hijo interno del Map) ────────────────────────────────────────
// pigeon-maps inyecta automáticamente latLngToPixel, mapState, left y top
// en todos los hijos directos del <Map>. Usamos left/top para alinear el SVG
// al origen (0, 0) del contenedor de overlays.

interface MapLineProps {
	from: LatLng;
	to: LatLng;
	// inyectados por pigeon-maps:
	latLngToPixel?: (latlng: LatLng) => [number, number];
	mapState?: { width: number; height: number };
	left?: number;
	top?: number;
}

function MapLine({ from, to, latLngToPixel, mapState, left = 0, top = 0 }: MapLineProps) {
	if (!latLngToPixel || !mapState) return null;

	const [x1, y1] = latLngToPixel(from);
	const [x2, y2] = latLngToPixel(to);
	const { width, height } = mapState;

	// El SVG empieza en (0,0) del contenedor compensando el translate que
	// pigeon-maps aplica en función del anchor (que por defecto es el centro).
	return (
		<svg
			style={{
				position: "absolute",
				left: -left,
				top: -top,
				pointerEvents: "none",
				overflow: "visible",
			}}
			width={width}
			height={height}
		>
			{/* sombra para legibilidad */}
			<line
				x1={x1} y1={y1} x2={x2} y2={y2}
				stroke="white"
				strokeWidth={5}
				strokeLinecap="round"
				opacity={0.6}
			/>
			{/* línea principal */}
			<line
				x1={x1} y1={y1} x2={x2} y2={y2}
				stroke="#2563eb"
				strokeWidth={3}
				strokeDasharray="10 5"
				strokeLinecap="round"
			/>
			{/* puntos en los extremos */}
			<circle cx={x1} cy={y1} r={5} fill="#16a34a" stroke="white" strokeWidth={2} />
			<circle cx={x2} cy={y2} r={5} fill="#dc2626" stroke="white" strokeWidth={2} />
		</svg>
	);
}

// ─── componente principal ─────────────────────────────────────────────────────

const DEFAULT_CENTER: LatLng = [-17.8290432, -63.1688971];

export function MyMap(props: MyMapProps) {
	const [center, setCenter] = useState<LatLng>(DEFAULT_CENTER);
	const [zoom, setZoom] = useState(11);

	// modo single
	const [markerSingle, setMarkerSingle] = useState<LatLng>();

	// modo distance
	const [pointA, setPointA] = useState<LatLng>();
	const [pointB, setPointB] = useState<LatLng>();
	const [distanceKm, setDistanceKm] = useState<number>();

	const handleClick = ({ latLng }: { latLng: LatLng }) => {
		if (props.mode === "distance") {
			if (!pointA || (pointA && pointB)) {
				// primer clic o reinicio: establecer punto A
				setPointA(latLng);
				setPointB(undefined);
				setDistanceKm(undefined);
			} else {
				// segundo clic: establecer punto B y calcular distancia
				const km = haversineKm(pointA, latLng);
				setPointB(latLng);
				setDistanceKm(km);
				props.onDistance?.(pointA, latLng, km);
			}
		} else {
			setMarkerSingle(latLng);
			setCenter(latLng);
			props.onChange(latLng[0], latLng[1]);
		}
	};

	return (
		<div className="relative w-full">
			{/* instrucciones y badge de distancia */}
			{props.mode === "distance" && (
				<div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
					{!pointA && (
						<span className="rounded bg-green-100 px-2 py-1 text-green-800 dark:bg-green-900 dark:text-green-200">
							Haz clic para marcar el punto A (origen)
						</span>
					)}
					{pointA && !pointB && (
						<span className="rounded bg-blue-100 px-2 py-1 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
							Ahora haz clic para marcar el punto B (destino)
						</span>
					)}
					{pointA && pointB && distanceKm !== undefined && (
						<>
							<span className="rounded bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
								<span className="font-semibold text-green-600">A</span>{" "}
								{pointA[0].toFixed(5)}, {pointA[1].toFixed(5)}
							</span>
							<span className="rounded bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
								<span className="font-semibold text-red-600">B</span>{" "}
								{pointB[0].toFixed(5)}, {pointB[1].toFixed(5)}
							</span>
							<span className="rounded bg-blue-600 px-3 py-1 font-bold text-white">
								{distanceKm < 1
									? `${(distanceKm * 1000).toFixed(0)} m`
									: `${distanceKm.toFixed(2)} km`}
							</span>
							<button
								onClick={() => {
									setPointA(undefined);
									setPointB(undefined);
									setDistanceKm(undefined);
								}}
								className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
							>
								Limpiar
							</button>
						</>
					)}
				</div>
			)}

			<Map
				height={400}
				center={center}
				zoom={zoom}
				onBoundsChanged={({ center, zoom }) => {
					setCenter(center);
					setZoom(zoom);
				}}
				onClick={handleClick}
			>
				{/* marcador modo single */}
				{props.mode !== "distance" && (
					<Marker width={50} anchor={markerSingle} color="#000000" />
				)}

				{/* marcadores modo distance */}
				{props.mode === "distance" && pointA && (
					<Marker width={40} anchor={pointA} color="#16a34a" />
				)}
				{props.mode === "distance" && pointB && (
					<Marker width={40} anchor={pointB} color="#dc2626" />
				)}

				{/* línea entre los dos puntos */}
				{props.mode === "distance" && pointA && pointB && (
					<MapLine from={pointA} to={pointB} />
				)}
			</Map>
		</div>
	);
}
