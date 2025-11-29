/**
 * Convierte TopoJSON a GeoJSON
 * Basado en la especificación de topojson-client
 */

interface TopoJSON {
  type: string;
  bbox?: number[];
  transform?: {
    scale: number[];
    translate: number[];
  };
  objects: {
    [key: string]: any;
  };
  arcs?: number[][][];
}

interface GeoJSONFeature {
  type: 'Feature';
  properties: any;
  geometry: any;
}

interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

/**
 * Decodifica los arcos de TopoJSON
 */
function decodeArcs(arcs: number[][][], transform?: any): number[][][] {
  if (!transform) return arcs;

  const scale = transform.scale;
  const translate = transform.translate;
  const decodedArcs: number[][][] = [];

  arcs.forEach((arc) => {
    const points: number[][] = [];
    let x = 0, y = 0;

    arc.forEach((point) => {
      x += point[0];
      y += point[1];
      points.push([
        x * scale[0] + translate[0],
        y * scale[1] + translate[1],
      ]);
    });

    decodedArcs.push(points);
  });

  return decodedArcs;
}

/**
 * Convierte referencias de arcos a coordenadas
 */
function arcToCoordinates(arcIndices: number[][], decodedArcs: number[][][]): number[][][] {
  const rings: number[][][] = [];

  arcIndices.forEach((ring) => {
    const coordinates: number[][] = [];

    ring.forEach((arcIndex) => {
      const arc = decodedArcs[Math.abs(arcIndex) - 1];
      if (!arc) return;

      const points = arcIndex < 0 ? [...arc].reverse() : arc;
      coordinates.push(...points);
    });

    if (coordinates.length > 0) {
      rings.push(coordinates);
    }
  });

  return rings;
}

/**
 * Convierte una geometría TopoJSON a GeoJSON
 */
function convertGeometry(geometry: any, decodedArcs: number[][][]): any {
  if (!geometry) return null;

  const type = geometry.type;

  switch (type) {
    case 'Polygon':
      return {
        type: 'Polygon',
        coordinates: arcToCoordinates(geometry.arcs, decodedArcs),
      };

    case 'MultiPolygon':
      return {
        type: 'MultiPolygon',
        coordinates: geometry.arcs.map((arcs: number[][]) =>
          arcToCoordinates([arcs], decodedArcs)
        ),
      };

    case 'Point':
      return {
        type: 'Point',
        coordinates: geometry.coordinates,
      };

    case 'MultiPoint':
      return {
        type: 'MultiPoint',
        coordinates: geometry.coordinates,
      };

    case 'LineString':
      return {
        type: 'LineString',
        coordinates: arcToCoordinates([geometry.arcs], decodedArcs),
      };

    case 'MultiLineString':
      return {
        type: 'MultiLineString',
        coordinates: geometry.arcs.map((arcs: number[][]) =>
          arcToCoordinates([arcs], decodedArcs)[0]
        ),
      };

    default:
      return null;
  }
}

/**
 * Convierte TopoJSON a GeoJSON FeatureCollection
 */
export function topoJsonToGeoJson(topo: TopoJSON, objectName: string): GeoJSONFeatureCollection {
  const object = topo.objects[objectName];
  if (!object) {
    throw new Error(`Object "${objectName}" not found in TopoJSON`);
  }

  const decodedArcs = decodeArcs(topo.arcs || [], topo.transform);
  const features: GeoJSONFeature[] = [];

  if (object.type === 'GeometryCollection') {
    object.geometries.forEach((geometry: any) => {
      const convertedGeometry = convertGeometry(geometry, decodedArcs);
      if (convertedGeometry) {
        features.push({
          type: 'Feature',
          properties: geometry.properties || {},
          geometry: convertedGeometry,
        });
      }
    });
  }

  return {
    type: 'FeatureCollection',
    features,
  };
}
