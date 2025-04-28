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
  const hypoDistance = Math.sqrt(distance ** 2 + depth ** 2);
  const logPGA = 0.5 * magnitude - Math.log10(hypoDistance + 10) - 0.003 * hypoDistance + 0.2;
  const pga = Math.pow(10, logPGA); // cm/s^2
  const amplifiedPGA = pga * 1.5;
  let intensity = 2.68 + 1.72 * Math.log10(amplifiedPGA);
  intensity = Math.round(intensity * 10) / 10;
  if (intensity < 0) intensity = 0;
  if (intensity > 7) {
    console.warn(`[API] High intensity detected: ${intensity} for R=${hypoDistance}`);
    intensity = 7;
  }
  console.log(`[API] PGA=${pga.toFixed(2)} cm/s^2, AmplifiedPGA=${amplifiedPGA.toFixed(2)} cm/s^2, Intensity=${intensity}`);
  return intensity;
}

// テスト用HTML
const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>緊急地震速報 - 予想震度APIテスト</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    textarea { width: 100%; height: 150px; }
    pre { background: #f4f4f4; padding: 10px; overflow-x: auto; }
    button { padding: 10px 20px; margin: 10px 0; }
  </style>
</head>
<body>
  <h1>緊急地震速報 - 予想震度APIテスト</h1>
  <p>地震情報を入力して、APIをテストします。POSTリクエストを/api/earthquakeに送信します。</p>
  <h2>テスト用データ入力</h2>
  <p>以下の形式でJSONデータを入力してください:</p>
  <pre>
{
  "magnitude": 6.0,
  "estimatedMaxIntensity": 5.5,
  "latitude": 35.6895,
  "longitude": 139.6917,
  "depth": 10
}
  </pre>
  <textarea id="inputJson" placeholder="JSONデータを入力"></textarea><br>
  <button id="testButton">APIをテスト</button>
  <h2>APIレスポンス</h2>
  <pre id="jsonOutput"></pre>
  <script>
    async function testApi() {
      const inputJson = document.getElementById('inputJson').value;
      let data;
      try {
        data = JSON.parse(inputJson);
      } catch (e) {
        console.error('JSON parse error:', e);
        document.getElementById('jsonOutput').textContent = JSON.stringify({ error: '無効なJSON形式です: ' + e.message }, null, 2);
        return;
      }
      try {
        const apiUrl = '/api/earthquake';
        console.log('Sending request to:', apiUrl);
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!response.ok) {
          throw new Error(\`HTTP error! Status: \${response.status}\`);
        }
        const result = await response.json();
        document.getElementById('jsonOutput').textContent = JSON.stringify(result, null, 2);
      } catch (e) {
        console.error('API call failed:', e);
        document.getElementById('jsonOutput').textContent = JSON.stringify({ error: 'API呼び出しに失敗しました: ' + e.message }, null, 2);
      }
    }
    const testButton = document.getElementById('testButton');
    testButton.addEventListener('click', testApi);
  </script>
</body>
</html>
`;

// APIハンドラ
module.exports = async (req, res) => {
  console.log('[API] Received request:', req.method, req.url);

  // APIエンドポイント: POST /api/earthquake
  if (req.method === 'POST' && req.url === '/api/earthquake') {
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
  }

  // テスト用HTML: GET /
  if (req.method === 'GET' && req.url === '/') {
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(htmlContent);
  }

  // その他のリクエスト: 404
  console.error('[API] Route not found:', req.method, req.url);
  return res.status(404).json({ error: 'Route not found' });
};
