import React, { useEffect, useMemo, useRef, useState } from 'react';
import { campusMapPoints, distanceInKm, estimateDeliveryMinutes, loadAMap, type LngLat } from '../utils/amap';

type DeliveryMapProps = {
  className?: string;
  riderLocation?: LngLat | null;
  merchantLocation?: LngLat;
  customerLocation?: LngLat;
  showRider?: boolean;
  title?: string;
  subtitle?: string;
};

function DemoRouteLayer({
  riderLocation,
  merchantLocation,
  customerLocation,
  title,
  subtitle,
}: Required<Pick<DeliveryMapProps, 'merchantLocation' | 'customerLocation'>> & Omit<DeliveryMapProps, 'merchantLocation' | 'customerLocation'>) {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden bg-[#dff1ff]">
      <div className="absolute inset-0 opacity-70" style={{ backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,.72) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,.72) 1px, transparent 1px)', backgroundSize: '46px 46px' }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(37,99,235,.13),transparent_26%),radial-gradient(circle_at_78%_62%,rgba(20,184,166,.18),transparent_24%)]" />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 448 520" preserveAspectRatio="none" aria-hidden="true">
        <path d="M118 178 C172 282 254 328 354 246" fill="none" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" opacity=".28" />
        <path className="motion-trace" d="M118 178 C172 282 254 328 354 246" fill="none" stroke="#2563eb" strokeWidth="7" strokeLinecap="round" />
        <circle cx="118" cy="178" r="28" fill="#0f766e" opacity=".15" />
        <circle cx="224" cy="278" r="30" fill="#2563eb" opacity=".14" />
        <circle cx="354" cy="246" r="28" fill="#dc2626" opacity=".13" />
      </svg>
      <div className="absolute left-[96px] top-[154px] flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_10px_24px_rgba(15,23,42,.18)]">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f766e] text-[18px] font-bold text-white">店</div>
      </div>
      <div className="absolute left-[202px] top-[254px] flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_10px_24px_rgba(15,23,42,.2)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] text-[18px] font-bold text-white">骑</div>
      </div>
      <div className="absolute left-[332px] top-[222px] flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_10px_24px_rgba(15,23,42,.18)]">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dc2626] text-[18px] font-bold text-white">收</div>
      </div>
      <div className="absolute left-4 top-4 z-20 max-w-[76%] rounded-xl bg-white/95 px-sm py-xs shadow-sm backdrop-blur">
        <p className="text-label-md font-bold text-on-surface">{title || '配送地图'}</p>
        <p className="text-[11px] text-on-surface-variant">{subtitle || `骑手 ${riderLocation ? riderLocation.join(', ') : '待定位'} · 商家 ${merchantLocation.join(', ')} · 收货 ${customerLocation.join(', ')}`}</p>
      </div>
    </div>
  );
}

export default function DeliveryMap({
  className = '',
  riderLocation,
  merchantLocation = campusMapPoints.merchant,
  customerLocation = campusMapPoints.customer,
  showRider = true,
  title = '实时配送地图',
  subtitle,
}: DeliveryMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [mapError, setMapError] = useState('');
  const effectiveRider = riderLocation || campusMapPoints.riderFallback;
  const eta = useMemo(() => estimateDeliveryMinutes(effectiveRider, customerLocation), [effectiveRider, customerLocation]);
  const distance = useMemo(() => distanceInKm(effectiveRider, customerLocation).toFixed(1), [effectiveRider, customerLocation]);

  useEffect(() => {
    let disposed = false;
    loadAMap()
      .then((AMap) => {
        if (disposed || !containerRef.current || mapRef.current) {
          return;
        }
        const baseLayer = new AMap.TileLayer({
          zIndex: 1,
        });
        mapRef.current = new AMap.Map(containerRef.current, {
          zoom: 15,
          center: effectiveRider,
          viewMode: '2D',
          resizeEnable: true,
          features: ['bg', 'road', 'building', 'point'],
          layers: [baseLayer],
        });
        window.setTimeout(() => mapRef.current?.resize?.(), 0);
        setLoaded(true);
      })
      .catch((err) => setMapError(err instanceof Error ? err.message : '高德地图加载失败'));
    return () => {
      disposed = true;
      overlaysRef.current.forEach((overlay) => overlay?.setMap?.(null));
      overlaysRef.current = [];
      mapRef.current?.destroy?.();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const AMap = window.AMap;
    const map = mapRef.current;
    if (!AMap || !map) {
      return;
    }
    overlaysRef.current.forEach((overlay) => overlay?.setMap?.(null));
    const overlays: any[] = [];

    const marker = (position: LngLat, label: string, color: string) => {
      const item = new AMap.Marker({
        position,
        content: `<div style="width:34px;height:34px;border-radius:17px;background:${color};color:white;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 24px rgba(15,23,42,.22);font-size:16px;font-weight:700">${label}</div>`,
        anchor: 'center',
      });
      item.setMap(map);
      overlays.push(item);
    };

    marker(merchantLocation, '店', '#0f766e');
    marker(customerLocation, '收', '#dc2626');
    if (showRider) {
      marker(effectiveRider, '骑', '#2563eb');
    }

    const path = showRider ? [merchantLocation, effectiveRider, customerLocation] : [merchantLocation, customerLocation];
    const route = new AMap.Polyline({
      path,
      strokeColor: '#2563eb',
      strokeWeight: 7,
      strokeOpacity: 0.6,
      lineJoin: 'round',
      lineCap: 'round',
    });
    route.setMap(map);
    overlays.push(route);

    map.setFitView(overlays, false, [72, 180, 220, 96]);
    overlaysRef.current = overlays;
  }, [customerLocation, effectiveRider, merchantLocation, showRider, loaded]);

  return (
    <div className={`relative overflow-hidden bg-[#dff1ff] ${className}`}>
      <div ref={containerRef} className={`absolute inset-0 z-0 transition-opacity duration-300 ${loaded && !mapError ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
      {(!loaded || mapError) && (
        <DemoRouteLayer
          riderLocation={riderLocation}
          merchantLocation={merchantLocation}
          customerLocation={customerLocation}
          title={mapError || title}
          subtitle={subtitle || `距收货点 ${distance} km · 预计 ${eta} 分钟`}
        />
      )}
      {loaded && !mapError && (
        <div className="absolute left-4 top-4 z-20 max-w-[76%] rounded-xl bg-white/95 px-sm py-xs shadow-sm backdrop-blur pointer-events-none">
          <p className="text-label-md font-bold text-on-surface">{title}</p>
          <p className="text-[11px] text-on-surface-variant">{subtitle || `距收货点 ${distance} km · 预计 ${eta} 分钟`}</p>
        </div>
      )}
    </div>
  );
}
