import Logger from "./logger";
import notifications from "./notifications";

const errorHandler = {
  handle: (error, customMessage = null) => {
    // API hatası mı kontrol et
    if (error.response) {
      // Sunucu cevap döndü ama hata kodu geldi
      const statusCode = error.response.status;
      const errorData = error.response.data;

      Logger.error(`API Hatası: ${statusCode}`, errorData);

      // Hata durumuna göre özel mesajlar
      switch (statusCode) {
        case 401:
          notifications.error(
            "Oturum süreniz doldu, lütfen tekrar giriş yapın"
          );
          // Burada oturum yenileme veya çıkış yapma işlemleri eklenebilir
          break;
        case 403:
          notifications.error("Bu işlem için yetkiniz bulunmuyor");
          break;
        case 404:
          notifications.error("İstenen kaynak bulunamadı");
          break;
        case 422:
          // Doğrulama hataları
          const validationErrors = errorData.errors || [];
          if (validationErrors.length > 0) {
            validationErrors.forEach((err) => {
              notifications.warning(err.msg || "Doğrulama hatası");
            });
          } else {
            notifications.error(errorData.msg || "Veriler geçersiz");
          }
          break;
        case 500:
          notifications.error(
            "Sunucu hatası, lütfen daha sonra tekrar deneyin"
          );
          break;
        default:
          notifications.error(customMessage || "Bir hata oluştu");
      }
    } else if (error.request) {
      // Sunucuya istek gitti ama cevap dönmedi
      Logger.error("Sunucu yanıt vermiyor", error.request);
      notifications.error(
        "Sunucu yanıt vermiyor, lütfen internet bağlantınızı kontrol edin"
      );
    } else {
      // İstek yapılmadan hata oluştu
      Logger.error("İstek hatası", error.message);
      notifications.error(
        customMessage || "İstek oluşturulurken bir hata meydana geldi"
      );
    }

    return error;
  },
};

export default errorHandler;
