type LimitLinePoint = {
    t: number;
    lat: number;
    lon: number;
}

type GlobalEclipseFeatures = {
    beginTime: number;
    endTime: number;
    umbraLimitNorth: LimitLinePoint[];
    umbraLimitSouth: LimitLinePoint[];
    bounds: number[][],
    center: number[],
}

export default GlobalEclipseFeatures;