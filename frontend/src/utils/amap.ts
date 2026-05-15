const AMAP_KEY = (import.meta.env.VITE_AMAP_KEY || '6d6a9b6c3af5e81e074cb45d10751e7d').trim();
const AMAP_SECURITY_JS_CODE = (import.meta.env.VITE_AMAP_SECURITY_JS_CODE || '').trim();

type AMapGlobal = Record<string, any>;

declare global {
  interface Window {
    AMap?: AMapGlobal;
    _AMapSecurityConfig?: { securityJsCode?: string };
    __chengyiAmapPromise?: Promise<AMapGlobal>;
  }
}

export type LngLat = [number, number];

export const campusMapPoints = {
  merchant: [106.675033, 26.441325] as LngLat,
  customer: [106.672601, 26.446149] as LngLat,
  riderFallback: [106.672979, 26.442886] as LngLat,
};

export function loadAMap() {
  if (window.AMap) {
    return Promise.resolve(window.AMap);
  }
  if (window.__chengyiAmapPromise) {
    return window.__chengyiAmapPromise;
  }
  if (AMAP_SECURITY_JS_CODE) {
    window._AMapSecurityConfig = { securityJsCode: AMAP_SECURITY_JS_CODE };
  }
  window.__chengyiAmapPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const params = new URLSearchParams({
      v: '2.0',
      key: AMAP_KEY,
      plugin: 'AMap.Geolocation,AMap.GeometryUtil',
    });
    script.src = `https://webapi.amap.com/maps?${params.toString()}`;
    script.async = true;
    script.onload = () => {
      if (window.AMap) {
        resolve(window.AMap);
      } else {
        reject(new Error('高德地图 SDK 加载失败'));
      }
    };
    script.onerror = () => {
      window.__chengyiAmapPromise = undefined;
      reject(new Error('无法连接高德地图 SDK'));
    };
    document.head.appendChild(script);
  });
  return window.__chengyiAmapPromise;
}

export function distanceInKm(from: LngLat, to: LngLat) {
  const radius = 6371;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(to[1] - from[1]);
  const dLng = toRad(to[0] - from[0]);
  const lat1 = toRad(from[1]);
  const lat2 = toRad(to[1]);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function estimateDeliveryMinutes(from: LngLat, to: LngLat) {
  const km = distanceInKm(from, to);
  return Math.max(6, Math.ceil((km / 18) * 60 + 4));
}
