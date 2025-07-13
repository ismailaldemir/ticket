# İYönetim360 - Aidat Takip Sistemi

Bu proje, apartman ve site yönetimi için geliştirilmiş kapsamlı bir aidat takip sistemidir. MongoDB'den PostgreSQL'e başarıyla migrate edilmiştir.

## Özellikler

- **Üye Yönetimi**: Apartman sakinlerinin bilgilerini yönetme
- **Aidat Takibi**: Aylık aidat borçları ve ödemelerinin takibi
- **Kasa Yönetimi**: Gelir-gider takibi ve kasa raporları
- **Tarife Yönetimi**: Farklı aidat türleri ve fiyatlandırma
- **Raporlama**: Detaylı mali raporlar ve analizler
- **Rol Bazlı Yetkilendirme**: Farklı kullanıcı rolleri ve izinleri

## Teknolojiler

### Backend
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Ana veritabanı
- **Sequelize** - ORM (Object-Relational Mapping)
- **JWT** - Authentication
- **Multer** - Dosya yükleme

### Frontend
- **React.js** - UI framework
- **Material-UI** - Component library
- **Redux** - State management
- **Axios** - HTTP client

## Kurulum

### Gereksinimler
- Node.js (v14 veya üzeri)
- PostgreSQL (v12 veya üzeri)
- npm veya yarn

### Adımlar

1. **Repository'yi klonlayın**
```bash
git clone https://github.com/[KULLANICI_ADI]/iyonetim360.git
cd iyonetim360
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
cd client && npm install
```

3. **PostgreSQL veritabanı oluşturun**
```sql
CREATE DATABASE ticket_db;
```

4. **Environment dosyasını yapılandırın**
```bash
cp .env.example .env
```

5. **Veritabanı konfigürasyonunu güncelleyin**
`config/default.json` dosyasındaki veritabanı ayarlarını kontrol edin.

6. **Sunucuyu başlatın**
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/register` - Yeni kullanıcı kaydı

### Üye Yönetimi
- `GET /api/uyeler` - Tüm üyeleri listele
- `POST /api/uyeler` - Yeni üye ekle
- `PUT /api/uyeler/:id` - Üye bilgilerini güncelle

### Aidat Yönetimi
- `GET /api/borclar` - Borç listesi
- `POST /api/odemeler` - Ödeme kaydet
- `GET /api/raporlar/aylik-borc-raporu` - Aylık borç raporu

## Proje Yapısı

```
├── client/                 # React frontend
├── config/                 # Konfigürasyon dosyaları
├── middleware/             # Express middleware'ler
├── models/                 # Sequelize modelleri
├── routes/                 # API route'ları
├── services/               # İş mantığı servisleri
├── utils/                  # Yardımcı fonksiyonlar
├── uploads/                # Yüklenen dosyalar
└── server.js              # Ana server dosyası
```

## Migration Notları

Bu proje MongoDB'den PostgreSQL'e başarıyla migrate edilmiştir:

- **ORM Değişikliği**: Mongoose → Sequelize
- **Veri Tipleri**: ObjectId → UUID
- **İlişkiler**: Referans yapıları PostgreSQL foreign key'lerine dönüştürüldü
- **Şema**: Tüm MongoDB şemaları Sequelize modelleri olarak yeniden yazıldı

## Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add some amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.