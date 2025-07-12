import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  addBorc,
  getBorcById,
  updateBorc,
  clearBorcError,
} from "../../redux/borc/borcSlice";
import { getKisiler } from "../../redux/kisi/kisiSlice";
import { getUcretlerByKullanimAlani } from "../../redux/ucret/ucretSlice";
import apiClient from "../../utils/api";
import CustomForm from "../../components/common/CustomForm";
import { PermissionRequired, hasPermission } from "../../utils/rbacUtils";

const aylar = [
  { value: 1, label: "Ocak" },
  { value: 2, label: "Şubat" },
  { value: 3, label: "Mart" },
  { value: 4, label: "Nisan" },
  { value: 5, label: "Mayıs" },
  { value: 6, label: "Haziran" },
  { value: 7, label: "Temmuz" },
  { value: 8, label: "Ağustos" },
  { value: 9, label: "Eylül" },
  { value: 10, label: "Ekim" },
  { value: 11, label: "Kasım" },
  { value: 12, label: "Aralık" },
];

const BorcForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { borc, loading, error } = useSelector((state) => state.borc);
  const { kisiler } = useSelector((state) => state.kisi);
  const { ucretler } = useSelector((state) => state.ucret);
  const { user } = useSelector((state) => state.auth);

  const [donemKontrolYapiliyor, setDonemKontrolYapiliyor] = useState(false);
  const [secilenUcret, setSecilenUcret] = useState(null);

  const [formData, setFormData] = useState({
    kisi_id: "",
    ucret_id: "",
    yil: new Date().getFullYear(),
    ay: new Date().getMonth() + 1,
    borcTutari: "",
    miktar: 1, // Varsayılan miktar 1
    aciklama: "",
    odendi: false,
    sonOdemeTarihi: "",
  });

  // Hata mesajı geldiğinde otomatik resetleme
  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearBorcError());
      }, 5000);
    }
  }, [error, dispatch]);

  useEffect(() => {
    dispatch(getKisiler());
    dispatch(getUcretlerByKullanimAlani("borclar")); // Sadece borçlar kullanım alanı işaretli ücretleri getir
    if (id) {
      dispatch(getBorcById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (borc && id) {
      setFormData({
        kisi_id: borc.kisi_id?._id || "",
        ucret_id: borc.ucret_id?._id || "",
        yil: borc.yil || new Date(borc.borclandirmaTarihi).getFullYear(),
        ay: borc.ay || new Date(borc.borclandirmaTarihi).getMonth() + 1,
        borcTutari: borc.borcTutari || "",
        miktar: borc.miktar || 1,
        aciklama: borc.aciklama || "",
        odendi: borc.odendi || false,
        sonOdemeTarihi: borc.sonOdemeTarihi
          ? new Date(borc.sonOdemeTarihi).toISOString().split("T")[0]
          : "",
      });

      // Seçili ücreti ayarla
      if (borc.ucret_id) {
        const ucret = ucretler.find((u) => u._id === borc.ucret_id._id);
        if (ucret) {
          setSecilenUcret(ucret);
        }
      }
    }
  }, [borc, id, ucretler]);

  // Aynı dönem için borç kaydı var mı kontrol et
  const donemKontrol = async () => {
    if (formData.kisi_id && formData.yil && formData.ay) {
      try {
        setDonemKontrolYapiliyor(true);
        const res = await apiClient.get(
          `/borclar/donem-kontrol/${formData.kisi_id}/${formData.yil}/${formData.ay}`
        );

        // Eğer bu dönem için borç kaydı varsa ve düzenleme durumunda farklı bir borç ise false döndür
        if (res.data.borcVar && (!id || (id && res.data.borc._id !== id))) {
          const kisi = kisiler.find((k) => k._id === formData.kisi_id);
          const kisiAdi = kisi ? `${kisi.ad} ${kisi.soyad}` : "Seçili kişi";
          toast.warning(
            `${kisiAdi} için ${formData.ay}. ay ${formData.yil} dönemine ait borç kaydı zaten mevcut!`
          );
          setDonemKontrolYapiliyor(false);
          return false;
        }
        setDonemKontrolYapiliyor(false);
        return true;
      } catch (err) {
        setDonemKontrolYapiliyor(false);
        return true; // Hata durumunda devam et
      }
    }
    return true; // Gerekli alanlar yoksa devam et
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    // Eğer ücret seçiliyorsa
    if (name === "ucret_id") {
      const ucret = ucretler.find((u) => u._id === value);
      setSecilenUcret(ucret);

      // Ücretin birim ücret olup olmamasına göre borç tutarını hesapla
      if (ucret) {
        if (ucret.birimUcret) {
          // Birim ücret ise miktar * tutar hesapla
          setFormData((prev) => ({
            ...prev,
            [name]: value,
            borcTutari: (prev.miktar || 1) * ucret.tutar,
          }));
        } else {
          // Birim ücret değilse direkt tutarı kullan
          setFormData((prev) => ({
            ...prev,
            [name]: value,
            borcTutari: ucret.tutar,
          }));
        }
      }
      return;
    }

    // Miktar değiştiriliyorsa
    if (name === "miktar") {
      if (secilenUcret && secilenUcret.birimUcret) {
        const miktar = parseFloat(value) || 0;
        setFormData((prev) => ({
          ...prev,
          miktar: miktar,
          borcTutari: miktar * secilenUcret.tutar,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          miktar: value,
        }));
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Dönem kontrolü yapılıyorsa bekle
    if (donemKontrolYapiliyor) {
      toast.info("Dönem kontrolü yapılıyor, lütfen bekleyin...");
      return;
    }

    // Yetki kontrolü: ekleme veya güncelleme
    if (id) {
      if (!hasPermission(user, "borclar_guncelleme")) {
        toast.error("Borç güncellemek için yetkiniz yok.");
        return;
      }
    } else {
      if (!hasPermission(user, "borclar_ekleme")) {
        toast.error("Borç eklemek için yetkiniz yok.");
        return;
      }
    }

    // Form verilerini hazırla
    const borcData = {
      ...formData,
      borclandirmaTarihi: new Date(formData.yil, formData.ay - 1),
      // Miktar verisini de gönder
      miktar: parseFloat(formData.miktar) || 1,
      // Son ödeme tarihi
      sonOdemeTarihi: formData.sonOdemeTarihi || null,
    };

    if (id) {
      dispatch(updateBorc({ id, borcData }))
        .unwrap()
        .then(() => navigate("/borclar"))
        .catch((err) => {
          // Hata zaten Redux tarafından yönetiliyor
        });
    } else {
      dispatch(addBorc(borcData))
        .unwrap()
        .then(() => navigate("/borclar"))
        .catch((err) => {
          // Hata zaten Redux tarafından yönetiliyor
        });
    }
  };

  const yillar = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - 5 + i
  );

  // Borç form alanları
  const formFields = [
    {
      name: "kisi_id",
      label: "Kişi",
      type: "select",
      options: kisiler.map((kisi) => ({
        value: kisi._id,
        label: `${kisi.ad} ${kisi.soyad}`,
      })),
      required: true,
    },
    {
      name: "ucret_id",
      label: "Ücret",
      type: "select",
      options: ucretler.map((ucret) => ({
        value: ucret._id,
        label:
          ucret.tarife_id && ucret.tarife_id.ad
            ? `${ucret.tarife_id.ad} - ₺${ucret.tutar}${
                ucret.birimUcret ? " (Birim Ücret)" : ""
              }`
            : `Tarife Tanımlanmamış - ₺${ucret.tutar}${
                ucret.birimUcret ? " (Birim Ücret)" : ""
              }`,
      })),
      required: true,
    },
    {
      name: "yil",
      label: "Yıl",
      type: "select",
      options: yillar.map((yil) => ({ value: yil, label: yil.toString() })),
      required: true,
      halfWidth: true,
    },
    {
      name: "ay",
      label: "Ay",
      type: "select",
      options: aylar,
      required: true,
      halfWidth: true,
    },
    // Miktar alanını koşullu olarak ekle
    ...(secilenUcret && secilenUcret.birimUcret
      ? [
          {
            name: "miktar",
            label: "Miktar",
            type: "number",
            required: true,
            halfWidth: true,
          },
        ]
      : []),
    {
      name: "borcTutari",
      label: "Borç Tutarı (₺)",
      type: "number",
      required: true,
      halfWidth: true,
      readOnly: secilenUcret?.birimUcret || false, // Birim ücretse salt okunur yap
      helperText: secilenUcret?.birimUcret
        ? "Miktar x birim ücret olarak hesaplanır"
        : "",
    },
    {
      name: "sonOdemeTarihi",
      label: "Son Ödeme Tarihi",
      type: "date",
      halfWidth: true,
    },
    {
      name: "aciklama",
      label: "Açıklama",
      multiline: true,
      rows: 2,
    },
    {
      name: "odendi",
      label: "Ödendi",
      type: "switch",
    },
  ];

  return (
    <PermissionRequired
      user={user} // Kullanıcı nesnesini prop olarak ekliyoruz
      yetkiKodu={id ? "borclar_guncelleme" : "borclar_ekleme"}
      fallback={
        <div style={{ padding: 32 }}>
          <h2>Bu sayfayı görüntülemek için yetkiniz yok.</h2>
        </div>
      }
    >
      <CustomForm
        title={id ? "Borç Düzenle" : "Yeni Borç Ekle"}
        fields={formFields}
        values={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        loading={loading || donemKontrolYapiliyor}
        error={error?.msg}
        onBack={() => navigate("/borclar")}
      />
    </PermissionRequired>
  );
};

export default BorcForm;
