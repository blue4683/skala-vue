import axios from 'axios'

const BASE = '/viirs/identify'

export function radianceToDarknessScore(radiance) {
  if (!Number.isFinite(radiance)) return null
  return Math.round(Math.max(0, Math.min(100, 100 - 30 * Math.log10(1 + Math.max(0, radiance)))))
}

export async function fetchLightPollution(site) {
  const response = await axios.get(BASE, {
    params: {
      f: 'json',
      geometry: JSON.stringify({
        x: site.longitude,
        y: site.latitude,
        spatialReference: { wkid: 4326 },
      }),
      geometryType: 'esriGeometryPoint',
      returnGeometry: false,
      returnCatalogItems: true,
      maxItemCount: 1,
      mosaicRule: JSON.stringify({
        mosaicMethod: 'esriMosaicAttribute',
        sortField: 'end_date',
        ascending: false,
        mosaicOperation: 'MT_FIRST',
      }),
      renderingRule: JSON.stringify({ rasterFunction: 'Average Monthly Radiance (Raw Values)' }),
    },
  })

  if (response.data?.error) throw new Error(response.data.error.message ?? 'VIIRS 조회 실패')

  const rawValue = Array.isArray(response.data?.value)
    ? response.data.value[0]
    : response.data?.value
  const radiance = Number.parseFloat(rawValue)
  if (!Number.isFinite(radiance)) throw new Error('이 좌표에는 VIIRS 야간광 값이 없습니다')

  const observedAt = response.data?.catalogItems?.features?.[0]?.attributes?.end_date ?? null
  return {
    radianceNanoWatts: radiance,
    darknessScore: radianceToDarknessScore(radiance),
    observedAt: observedAt ? new Date(observedAt).toISOString() : null,
  }
}
