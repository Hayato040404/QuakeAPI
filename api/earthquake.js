const prefectures = [
  { name: "北海道", lat: 43.0642, lon: 141.3469 },
  { name: "青森県", lat: 40.8244, lon: 140.7400 },
  { name: "岩手県", lat: 39.7036, lon: 141.1527 },
  { name: "宮城県", lat: 38.2688, lon: 140.8719 },
  { name: "秋田県", lat: 39.7186, lon: 140.1024 },
  { name: "山形県", lat: 38.2404, lon: 140.3633 },
  { name: "福島県", lat: 37.7500, lon: 140.4678 },
  { name: "茨城県", lat: 36.3418, lon: 140.4468 },
  { name: "栃木県", lat: 36.5657, lon: 139.8836 },
  { name: "群馬県", lat: 36.3911, lon: 139.0608 },
  { name: "埼玉県", lat: 35.8574, lon: 139.6489 },
  { name: "千葉県", lat: 35.6051, lon: 140.1233 },
  { name: "東京都", lat: 35.6895, lon: 139.6917 },
  { name: "神奈川県", lat: 35.4478, lon: 139.6425 },
  { name: "新潟県", lat: 37.9022, lon: 139.0236 },
  { name: "富山県", lat: 36.6953, lon: 137.2113 },
  { name: "石川県", lat: 36.5947, lon: 136.6256 },
  { name: "福井県", lat: 36.0652, lon: 136.2219 },
  { name: "山梨県", lat: 35.6639, lon: 138.5683 },
  { name: "長野県", lat: 36.6513, lon: 138.1812 },
  { name: "岐阜県", lat: 35.3911, lon: 136.7223 },
  { name: "静岡県", lat: 34.9769, lon: 138.3831 },
  { name: "愛知県", lat: 35.1802, lon: 136.9066 },
  { name: "三重県", lat: 34.7303, lon: 136.5086 },
  { name: "滋賀県", lat: 35.0045, lon: 135.8686 },
  { name: "京都府", lat: 35.0214, lon: 135.7556 },
  { name: "大阪府", lat: 34.6863, lon: 135.5200 },
  { name: "兵庫県", lat: 34.6913, lon: 135.1830 },
  { name: "奈良県", lat: 34.6851, lon: 135.8327 },
  { name: "和歌山県", lat: 34.2260, lon: 135.1675 },
  { name: "鳥取県", lat: 35.5036, lon: 134.2381 },
  { name: "島根県", lat: 35.4723, lon: 133.0505 },
  { name: "岡山県", lat: 34.6618, lon: 133.9350 },
  { name: "広島県", lat: 34.3966, lon: 132.4596 },
  { name: "山口県", lat: 34.1859, lon: 131.4710 },
  { name: "徳島県", lat: 34.0658, lon: 134.5593 },
  { name: "香川県", lat: 34.3401, lon: 134.0433 },
  { name: "愛媛県", lat: 33.8416, lon: 132.7661 },
  { name: "高知県", lat: 33.5597, lon: 133.5311 },
  { name: "福岡県", lat: 33.6064, lon: 130.4181 },
  { name: "佐賀県", lat: 33.2494, lon: 130.2988 },
  { name: "長崎県", lat: 32.7448, lon: 129.8736 },
  { name: "熊本県", lat: 32.7898, lon: 130.7417 },
  { name: "大分県", lat: 33.2382, lon: 131.6126 },
  { name: "宮崎県", lat: 31.9111, lon: 131.4239 },
  { name: "鹿児島県", lat: 31.5602, lon: 130.5581 },
  { name: "沖縄県", lat: 26.2124, lon: 127.6809 }
];

// ハーバサイン公式で2点間の距離を計算（km）
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 地球の半径 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 震度計算（日本向け距離減衰式＋地盤増幅）
function computeSeismicIntensity(magnitude, distance, depth) {
  console.log(`[API] Calculating intensity: M=${magnitude}, D=${distance}, Depth=${depth}`);
  // 震源距離 R = sqrt(D^2 + h^2)
  const hypoDistance = Math.sqrt(distance ** 2 + depth ** 2);
  // PGA計算: log10(PGA) = 0.5*M - log10(R + 10) - 0.003*R + 0.2
  const logPGA = 0.5 * magnitude - Math.log10(hypoDistance + 10) - 0.003 * hypoDistance + 0.2;
  const pga = Math.pow(10, logPGA); // cm/s^2
  // 地盤増幅率1.5を適用
  const amplifiedPGA = pga * 1.5;
  // 震度換算: I = 2.68 + 1.72 * log10(amplifiedPGA)
  let intensity = 2.68 + 1.72 * Math.log10(amplifiedPGA);
  // 丸め処理（小数点1桁）
  intensity = Math.round(intensity * 10) / 10;
  // 範囲制限
  if (intensity < 0) intensity = 0;
  if (intensity > 7) {
    console.warn(`[API] High intensity detected: ${intensity} for R=${hypoDistance}`);
    intensity = 7;
  }
  console.log(`[API] PGA=${pga.toFixed(2)} cm/s^2, AmplifiedPGA=${amplifiedPGA.toFixed(2)} cm/s^2, Intensity=${intensity}`);
  return intensity;
}

// APIハンドラ
module.exports = async (req, res) => {
  console.log('[API] Received request:', req.method, req.url);
  if (req.method !== 'POST') {
    console.error('[API] Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  let data;
  try {
    data = req.body;
    console.log('[API] Request body:', data);
  } catch (e) {
    console.error('[API] JSON parse error:', e);
    return res.status(400).json({ error: 'Invalid JSON format' });
  }

  const { magnitude, estimatedMaxIntensity, latitude, longitude, depth } = data;

  // 入力バリデーション
  if (typeof magnitude !== 'number' || magnitude < 0 || magnitude > 10 ||
      typeof estimatedMaxIntensity !== 'number' || estimatedMaxIntensity < 0 || estimatedMaxIntensity > 7 ||
      typeof latitude !== 'number' || latitude < -90 || latitude > 90 ||
      typeof longitude !== 'number' || longitude < -180 || longitude > 180 ||
      typeof depth !== 'number' || depth < 0) {
    console.error('[API] Invalid input parameters:', data);
    return res.status(400).json({ error: 'Invalid or out-of-range parameters' });
  }

  console.log('[API] Processing prefectures');
  try {
    const intensities = prefectures.map(pref => {
      const distance = haversineDistance(latitude, longitude, pref.lat, pref.lon);
      const intensity = computeSeismicIntensity(magnitude, distance, depth);
      return { prefecture: pref.name, intensity };
    });

    console.log('[API] Sorting intensities');
    const significant = intensities.filter(i => i.intensity >= 1)
                                  .sort((a, b) => b.intensity - a.intensity);
    const negligible = intensities.filter(i => i.intensity < 1)
                                 .map(i => i.prefecture);

    const output = {
      earthquake: {
        magnitude,
        estimatedMaxIntensity,
        epicenter: { latitude, longitude },
        depth
      },
      intensities: {
        significant,
        negligible
      },
      timestamp: new Date().toISOString()
    };

    console.log('[API] Output generated:', output);
    return res.status(200).json(output);
  } catch (e) {
    console.error('[API] Computation error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
