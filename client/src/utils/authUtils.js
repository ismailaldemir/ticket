/**
 * Kullanıcının belirli bir yetkiye sahip olup olmadığını kontrol eder
 * @param {Object} user - Kullanıcı nesnesi
 * @param {String} permissionCode - Kontrol edilecek yetki kodu
 * @returns {Boolean} - Kullanıcının yetkiye sahip olup olmadığı
 */
// Bu dosyadaki hasPermission fonksiyonu kaldırıldı. Tüm yetki kontrolleri için rbacUtils.js kullanılmalıdır.
// Proje genelinde import { hasPermission } from "../../utils/rbacUtils"; kullanılmalıdır.


/**
 * Yetki gerektiren bileşeni koşullu olarak render eden bileşen
 * @param {Object} props - Bileşen props'ları
 * @param {String} props.yetkiKodu - Gerekli yetki kodu
 * @param {Object} props.user - Kullanıcı nesnesi (opsiyonel, sağlanmazsa Redux'tan alınır)
 * @param {ReactNode} props.children - İçerik bileşenleri
 * @param {ReactNode} props.fallback - Yetki yoksa gösterilecek içerik (opsiyonel)
 */
// Bu dosyadaki PermissionRequired fonksiyonu kaldırıldı. Tüm yetki kontrolleri ve PermissionRequired için rbacUtils.js kullanılmalıdır.
// Proje genelinde import { PermissionRequired } from "../../utils/rbacUtils"; kullanılmalıdır.
