const http = require("http");

console.log("Sunucu durumu kontrol ediliyor...");

const options = {
  host: "localhost",
  port: 5000,
  path: "/api/health",
  method: "HEAD",
  timeout: 3000,
};

const request = http.request(options, (res) => {
  console.log(
    `Sunucu Durumu: ${res.statusCode === 200 ? "ÇALIŞIYOR ✅" : "HATA ❌"}`
  );
  console.log(`HTTP Durum Kodu: ${res.statusCode}`);

  process.exit(res.statusCode === 200 ? 0 : 1);
});

request.on("error", (err) => {
  console.error("Sunucu Durumu: ÇALIŞMIYOR ❌");
  console.error(`Hata: ${err.message}`);
  console.log("\nLütfen aşağıdaki komutlarla sunucuyu başlatın:");
  console.log("  cd e:\\çalışma odam\\yazılım çalışmalarım\\nodejs\\iaidat");
  console.log("  npm run server\n");
  process.exit(1);
});

request.on("timeout", () => {
  console.error("Sunucu Durumu: ZAMAN AŞIMI ⏱️");
  console.error("Sunucu yanıt vermiyor. Lütfen sunucuyu yeniden başlatın.");
  process.exit(1);
});

request.end();
