export interface OptionsI {
	/**
	 * The upper bounds of each dimension.
	 */
	shape: number[];

	minDistance: number;

	/**
	 * Defaults to twice the minimum distance.
	 */
	maxDistance?: number;

	/**
	 * Defaults to 30
	 */
	tries?: number;

	// Both for variable density:
	distanceFunction?: DistanceFn;
	bias?: number;
}

export interface TinyNDArrayI<Data extends Array<unknown> | Uint32Array> {
	stride: Array<number>;
	data: Data;
}

export type NeighbourhoodI = PointI[];

/**
 * Creates a random number, like Math.random
 */
export type RandomFloatFn = () => number;

export type DistanceFn = (point: PointI) => number;

export type PointI = number[];

export interface ImplementationI {
	// constructor(options: Options, rng: RandomFloatFn): void;
	addRandomPoint(): PointI;
	addPoint(point: PointI): PointI | null;
	next(): PointI | null;
	fill(): PointI[];
	getAllPoints(): PointI[];
	getAllPointsWithDistance(): PointI[];
	reset(): void;
}
