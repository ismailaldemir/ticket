import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Paper,
  Alert,
  Stack,
  Divider,
  Tooltip,
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Snackbar,
  InputAdornment,
  Grid, // Grid bileşenini import edildi
} from "@mui/material";
import {
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Videocam as VideocamIcon,
  InsertDriveFile as FileIcon,
  Description as WordIcon,
  Calculate as ExcelIcon,
  Slideshow as PowerPointIcon,
  AudioFile as AudioIcon,
  TextFields as TextIcon,
  Code as CodeIcon,
  Article as MarkdownIcon,
  Archive as ArchiveIcon,
  Print as PrintIcon,
  Fullscreen as FullscreenIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Share as ShareIcon,
  FileCopy as FileCopyIcon,
  Language as LanguageIcon,
  Book as BookIcon,
  ThreeDRotation as ThreeDIcon,
  FormatColorText as FormatColorTextIcon,
  DataObject as DataObjectIcon,
  Note as NoteIcon,
  MoreVert as MoreVertIcon, // Eksik olan import eklendi
  TextSnippet as TextSnippetIcon, // Eksik olan import eklendi
} from "@mui/icons-material";
import apiClient from "../../utils/api";
import { toast } from "react-toastify";

// Token alım yardımcı fonksiyonu - doğru header formatını kullanacak şekilde güncellendi
const getAuthToken = () => {
  const token = localStorage.getItem("token");
  return token || "";
};

// Genişletilmiş dosya uzantılarına göre MIME türleri sözlüğü
const MIME_TYPES = {
  // Resimler
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  bmp: "image/bmp",
  webp: "image/webp",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  tif: "image/tiff",
  tiff: "image/tiff",

  // Video
  mp4: "video/mp4",
  webm: "video/webm",
  videoOgg: "video/ogg",
  avi: "video/x-msvideo",
  mov: "video/quicktime",
  wmv: "video/x-ms-wmv",
  flv: "video/x-flv",
  mkv: "video/x-matroska",

  // Ses
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  m4a: "audio/mp4",
  flac: "audio/flac",
  aac: "audio/aac",

  // Belgeler
  pdf: "application/pdf",

  // Office belgeler
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  // Açık ofis formatları
  odt: "application/vnd.oasis.opendocument.text",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  odp: "application/vnd.oasis.opendocument.presentation",

  // Metin ve kod
  txt: "text/plain",
  csv: "text/csv",
  log: "text/plain",
  md: "text/markdown",
  json: "application/json",
  html: "text/html",
  xml: "application/xml",
  yaml: "application/x-yaml",
  yml: "application/x-yaml",
  ini: "text/plain",
  config: "text/plain",
  sql: "application/sql",

  // Programlama dilleri
  js: "text/javascript",
  ts: "text/typescript",
  jsx: "text/javascript",
  tsx: "text/typescript",
  css: "text/css",
  scss: "text/x-scss",
  less: "text/x-less",
  php: "application/x-php",
  py: "text/x-python",
  java: "text/x-java",
  c: "text/x-c",
  cpp: "text/x-c++",
  h: "text/x-c",
  cs: "text/x-csharp",
  go: "text/x-go",
  rb: "text/x-ruby",
  swift: "text/x-swift",
  kotlin: "text/x-kotlin",
  rust: "text/x-rust",

  // Sıkıştırılmış dosyalar
  zip: "application/zip",
  rar: "application/vnd.rar",
  "7z": "application/x-7z-compressed",
  tar: "application/x-tar",
  gz: "application/gzip",

  // E-kitaplar
  epub: "application/epub+zip",
  mobi: "application/x-mobipocket-ebook",
  azw: "application/vnd.amazon.ebook",

  // 3D ve CAD
  obj: "model/obj",
  stl: "model/stl",
  fbx: "application/octet-stream",
  dwg: "application/acad",
  dxf: "application/dxf",

  // Diğer
  ttf: "font/ttf",
  otf: "font/otf",
  woff: "font/woff",
  woff2: "font/woff2",
  db: "application/vnd.sqlite3",
  sqlite: "application/vnd.sqlite3",
};

const PreviewModal = ({ open, onClose, document, onDownload }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [textContent, setTextContent] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [metaData, setMetaData] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [notes, setNotes] = useState("");
  const [shareMenuAnchor, setShareMenuAnchor] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);

  const contentRef = useRef(null);
  const searchInputRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });

  // Dosya türlerini belirleme
  const fileExtension = document?.orijinalDosyaAdi
    ?.split(".")
    .pop()
    ?.toLowerCase();

  // Dosya türü kontrol değişkenleri
  const isPdf =
    fileExtension === "pdf" ||
    (document?.mimeTur && document.mimeTur.includes("pdf"));
  const isImage =
    [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "webp",
      "svg",
      "ico",
      "tif",
      "tiff",
    ].includes(fileExtension) ||
    (document?.mimeTur && document.mimeTur.startsWith("image/"));
  const isVideo = [
    "mp4",
    "webm",
    "videoOgg",
    "avi",
    "mov",
    "wmv",
    "flv",
    "mkv",
  ].includes(fileExtension);
  const isAudio = ["mp3", "wav", "ogg", "m4a", "flac", "aac"].includes(
    fileExtension
  );
  const isWord = ["doc", "docx", "odt"].includes(fileExtension);
  const isExcel = ["xls", "xlsx", "ods"].includes(fileExtension);
  const isPowerPoint = ["ppt", "pptx", "odp"].includes(fileExtension);
  const isText = ["txt", "log"].includes(fileExtension);
  const isCSV = fileExtension === "csv";
  const isCode = [
    "js",
    "ts",
    "jsx",
    "tsx",
    "css",
    "scss",
    "less",
    "php",
    "py",
    "java",
    "c",
    "cpp",
    "h",
    "cs",
    "go",
    "rb",
    "swift",
    "kotlin",
    "rust",
  ].includes(fileExtension);
  const isJson = fileExtension === "json";
  const isHTML = ["html", "xml"].includes(fileExtension);
  const isMarkdown = fileExtension === "md";
  const isArchive = ["zip", "rar", "7z", "tar", "gz"].includes(fileExtension);

  // Yeni dosya türü kontrolleri
  const isFont = ["ttf", "otf", "woff", "woff2"].includes(fileExtension);
  const isDatabase = ["db", "sqlite"].includes(fileExtension);
  const isEbook = ["epub", "mobi", "azw"].includes(fileExtension);
  const is3DModel = ["obj", "stl", "fbx"].includes(fileExtension);
  const isCAD = ["dwg", "dxf"].includes(fileExtension);
  const isOpenDoc = ["odt", "ods", "odp"].includes(fileExtension);
  const isConfig = ["yaml", "yml", "ini", "config"].includes(fileExtension);
  const isSQL = fileExtension === "sql";

  // Metin içerikli dosyalar için içerik getirme fonksiyonu
  const fetchTextContent = async () => {
    try {
      // Doküman bilgisinin kontrolü
      if (!document || !document._id) {
        setError("Doküman bilgisi bulunamadı veya eksik.");
        setLoading(false);
        return;
      }

      // Metin tabanlı dosyalar için içeriği getir
      if (
        document &&
        (isText ||
          isMarkdown ||
          isJson ||
          isCode ||
          isHTML ||
          isConfig ||
          isSQL)
      ) {
        try {
          const token = getAuthToken();
          const response = await apiClient.get(
            `/evraklar/metin/${document._id}`,
            {
              headers: {
                "x-auth-token": token,
              },
            }
          );

          if (response.data && response.data.content) {
            setTextContent(response.data.content);
            if (response.data.truncated) {
              toast.warning("Dosya çok büyük, sadece bir kısmı gösteriliyor.");
            }
          } else {
            setTextContent("Dosya içeriği boş veya okunamıyor.");
          }
          setLoading(false);
        } catch (error) {
          console.error("Metin içeriği yükleme hatası:", error);

          // Token hatası kontrolü
          if (error.response && error.response.status === 401) {
            setError(
              "Oturum süresi dolmuş olabilir. Lütfen sayfayı yenileyip tekrar giriş yapın."
            );
          } else {
            setError(
              "Metin içeriği yüklenirken bir hata oluştu: " +
                (error.message || "Bilinmeyen hata")
            );
          }
          setLoading(false);
        }
      } else {
        // Diğer dosya türleri için yükleme işlemi
        // Metadata'yı çıkarmayı dene
        fetchMetadata();

        setTimeout(() => setLoading(false), 1000);
      }
    } catch (err) {
      console.error("Dosya yükleme hatası:", err);
      setError(
        "Dosya yüklenirken beklenmeyen bir hata oluştu: " +
          (err.message || "Bilinmeyen hata")
      );
      setLoading(false);
    }
  };

  // Metadata çıkarma fonksiyonu
  const extractMetadata = async (blob) => {
    try {
      // Basit metadata çıkarımı
      const metadata = {
        boyut: formatFileSize(blob.size),
        tür: blob.type,
        oluşturulma: document.createdAt
          ? new Date(document.createdAt).toLocaleString()
          : "Bilinmiyor",
        güncelleme: document.updatedAt
          ? new Date(document.updatedAt).toLocaleString()
          : "Bilinmiyor",
      };

      setMetaData(metadata);
    } catch (error) {
      console.error("Metadata çıkarma hatası:", error);
    }
  };

  // Metadata getirme API çağrısı
  const fetchMetadata = async () => {
    if (!document || !document._id) return;

    try {
      const token = getAuthToken();
      const response = await apiClient.get(
        `/evraklar/metadata/${document._id}`,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      if (response.data) {
        setMetaData(response.data);
      }
    } catch (error) {
      console.error("Metadata getirme hatası:", error);
    }
  };

  // Arama işlevi
  const handleSearch = () => {
    if (!textContent || !searchText.trim()) return;

    try {
      const contentArea = contentRef.current;
      if (!contentArea) return;

      // Metni vurgulama için içeriği HTML olarak işle
      const highlightedContent = textContent.replace(
        new RegExp(searchText, "gi"),
        (match) =>
          `<mark style="background-color: #ffeb3b; color: black;">${match}</mark>`
      );

      // İçeriği güvenli bir şekilde gösterme
      contentArea.innerHTML = `<pre style="margin: 0">${highlightedContent}</pre>`;

      // İlk eşleşmeye odaklan
      const firstMatch = contentArea.querySelector("mark");
      if (firstMatch) {
        firstMatch.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch (error) {
      console.error("Arama hatası:", error);
      toast.error("Arama işlemi sırasında bir hata oluştu.");
    }
  };

  // Metin kopyalama
  const handleCopyText = () => {
    if (!textContent) return;

    try {
      navigator.clipboard.writeText(textContent);
      setSnackbarMessage("Metin panoya kopyalandı");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Kopyalama hatası:", error);
      toast.error("Metin kopyalanırken bir hata oluştu");
    }
  };

  // Paylaşım menüsü
  const handleShareClick = (event) => {
    setShareMenuAnchor(event.currentTarget);
  };

  const handleShareClose = () => {
    setShareMenuAnchor(null);
  };

  // Daha fazla menüsü
  const handleMoreClick = (event) => {
    setMoreMenuAnchor(event.currentTarget);
  };

  const handleMoreClose = () => {
    setMoreMenuAnchor(null);
  };

  // Paylaşım fonksiyonları
  const handleShareLink = () => {
    if (!document) return;

    const shareUrl = `${window.location.origin}/evraklar/goruntule/${document._id}`;

    try {
      navigator.clipboard.writeText(shareUrl);
      setSnackbarMessage("Paylaşım linki panoya kopyalandı");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Link kopyalama hatası:", error);
      toast.error("Link kopyalanırken bir hata oluştu");
    }

    handleShareClose();
  };

  const handleShareEmail = () => {
    if (!document) return;

    const subject = encodeURIComponent(
      `Doküman Paylaşımı: ${document.orijinalDosyaAdi}`
    );
    const body = encodeURIComponent(
      `Aşağıdaki linkten dokümana erişebilirsiniz:\n\n${window.location.origin}/evraklar/goruntule/${document._id}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);

    handleShareClose();
  };

  // OCR - Görüntüden metin çıkarma
  const handleOCR = async () => {
    if (!document || !document._id || !isImage) return;

    try {
      setLoading(true);

      const token = getAuthToken();
      const response = await apiClient.post(
        `/evraklar/ocr/${document._id}`,
        {},
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      if (response.data && response.data.text) {
        setTextContent(response.data.text);
        setTabValue(1); // Text sekmesine geç
        toast.success("Görüntüden metin başarıyla çıkarıldı");
      } else {
        toast.warning("Görüntüde okunabilir metin bulunamadı");
      }
    } catch (error) {
      console.error("OCR hatası:", error);
      toast.error("Görüntüden metin çıkarma işlemi sırasında bir hata oluştu");
    } finally {
      setLoading(false);
      handleMoreClose();
    }
  };

  // Dosya dönüştürme
  const handleConvert = async (targetFormat) => {
    if (!document || !document._id) return;

    try {
      setLoading(true);

      const token = getAuthToken();
      const response = await apiClient.post(
        `/evraklar/convert/${document._id}`,
        {
          targetFormat,
        },
        {
          headers: {
            "x-auth-token": token,
          },
          responseType: "blob",
        }
      );

      // Dosyayı indir
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${document.orijinalDosyaAdi.split(".")[0]}.${targetFormat}`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(
        `Dosya ${targetFormat.toUpperCase()} formatına dönüştürüldü`
      );
    } catch (error) {
      console.error("Dönüştürme hatası:", error);
      toast.error("Dosya dönüştürme işlemi sırasında bir hata oluştu");
    } finally {
      setLoading(false);
      handleMoreClose();
    }
  };

  // Sekme değiştirme işleyici
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Notlar değişiklik işleyici
  const handleNotesChange = (event) => {
    setNotes(event.target.value);
  };

  // Notları kaydetme
  const handleSaveNotes = async () => {
    if (!document || !document._id) return;

    try {
      // API özelliği kullanıma hazır olup olmadığını kontrol eden bayrak
      // TODO: Backend hazır olduğunda bu bayrağı true yapın
      const notesApiActive = false;

      if (!notesApiActive) {
        // API henüz hazır değilse yerel depolama kullanarak geçici çözüm
        localStorage.setItem(`evrak_notes_${document._id}`, notes);
        toast.success(
          "Notlar başarıyla kaydedildi (geçici olarak tarayıcıda saklanıyor)"
        );
        return;
      }

      const token = getAuthToken();
      await apiClient.post(
        `/evraklar/notes/${document._id}`,
        {
          notes,
        },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      toast.success("Notlar başarıyla kaydedildi");
    } catch (error) {
      console.error("Not kaydetme hatası:", error);
      toast.error("Notlar kaydedilirken bir hata oluştu");
    }
  };

  // Notları getirme
  const fetchNotes = async () => {
    if (!document || !document._id) return;

    try {
      // API özelliği kullanıma hazır olup olmadığını kontrol eden bayrak
      // TODO: Backend hazır olduğunda bu bayrağı true yapın
      const notesApiActive = false;

      if (!notesApiActive) {
        // API henüz hazır değilse yerel depolama kullanarak geçici çözüm
        const localNotes = localStorage.getItem(`evrak_notes_${document._id}`);
        if (localNotes) {
          setNotes(localNotes);
        }
        return;
      }

      const token = getAuthToken();
      const response = await apiClient.get(`/evraklar/notes/${document._id}`, {
        headers: {
          "x-auth-token": token,
        },
      });

      if (response.data && response.data.notes) {
        setNotes(response.data.notes);
      }
    } catch (error) {
      console.error("Not getirme hatası:", error);
      // Hata mesajını gösterme, sadece sessizce başarısız ol
      // Backend API'si hazır olduğunda bu kısmı tekrar aktifleştirebilirsiniz
    }
  };

  // Görünüm kontrolü için işlev tanımlamaları
  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.2, 0.5));
  };

  const handleZoomReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleRotateLeft = () => {
    setRotation((rotation - 90) % 360);
  };

  const handleRotateRight = () => {
    setRotation((rotation + 90) % 360);
  };

  const handleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  const handleDownload = () => {
    if (document && document._id && onDownload) {
      onDownload(document);
    } else {
      toast.error("Dosya indirme işlemi gerçekleştirilemedi");
    }
  };

  const handlePrint = () => {
    if (!document) return;

    // PDF için doğrudan yazdırma
    if (isPdf) {
      const printWindow = window.open(
        `/api/evraklar/indir/${document._id}?token=${getAuthToken()}`,
        "_blank"
      );
      if (printWindow) {
        printWindow.addEventListener("load", () => {
          printWindow.print();
        });
      }
      return;
    }

    // Diğer dosya türleri için indirip yazdırma yöntemi
    handleDownload();
    toast.info("Dosya indirildi. İndirilen dosyayı açıp yazdırabilirsiniz.");
  };

  useEffect(() => {
    // Modal açıldığında yükleme durumunu sıfırla
    if (open) {
      setLoading(true);
      setError(null);
      setZoom(1);
      setRotation(0);
      setTextContent(null);
      setCurrentPage(1);
      setTabValue(0); // Her zaman ilk sekmeye ayarlıyoruz
      setMetaData(null);
      setSearchText("");
      setShowSearch(false);

      // Notları getir
      fetchNotes();

      // Metin tabanlı dosyalar için içeriği getir
      if (
        document &&
        (isText ||
          isMarkdown ||
          isJson ||
          isCode ||
          isHTML ||
          isConfig ||
          isSQL)
      ) {
        fetchTextContent();
      } else if (document) {
        // Dosya türüne özel kontrol - yükleme başlatma
        if (
          isImage ||
          (document?.mimeTur && document.mimeTur.startsWith("image/"))
        ) {
          console.log(
            "Resim dosyası yükleniyor:",
            document.orijinalDosyaAdi,
            document.mimeTur
          );
          // Resim dosyası için özel işlem gerekmez, render aşamasında ImageWithAuth kullanılacak
          setLoading(false);
        } else if (
          isAudio ||
          (document?.mimeTur && document.mimeTur.startsWith("audio/"))
        ) {
          // Ses dosyası için özel işlem gerekmez, render aşamasında AudioWithAuth kullanılacak
          setLoading(false);
        } else if (
          isVideo ||
          (document?.mimeTur && document.mimeTur.startsWith("video/"))
        ) {
          // Video dosyası için özel işlem gerekmez, render aşamasında VideoWithAuth kullanılacak
          setLoading(false);
        } else if (
          isPdf ||
          (document?.mimeTur && document.mimeTur.includes("pdf"))
        ) {
          // PDF dosyası için özel işlem gerekmez, render aşamasında IframeWithAuth kullanılacak
          setLoading(false);
        } else {
          // Diğer dosya türleri için genel yükleme işlemi
          setTimeout(() => setLoading(false), 300);
        }
      }
    }
  }, [
    open,
    document,
    isText,
    isMarkdown,
    isJson,
    isCode,
    isHTML,
    isConfig,
    isSQL,
    isImage,
    isAudio,
    isVideo,
    isPdf,
    fetchNotes,
    fetchTextContent,
  ]);

  // Genişletilmiş dosya tipine göre ikon belirleme
  const getFileIcon = () => {
    if (isPdf) return <PdfIcon color="error" fontSize="large" />;
    if (isImage) return <ImageIcon color="primary" fontSize="large" />;
    if (isVideo) return <VideocamIcon color="success" fontSize="large" />;
    if (isAudio) return <AudioIcon color="secondary" fontSize="large" />;
    if (isWord || isOpenDoc)
      return <WordIcon color="primary" fontSize="large" />;
    if (isExcel) return <ExcelIcon color="success" fontSize="large" />;
    if (isPowerPoint)
      return <PowerPointIcon color="warning" fontSize="large" />;
    if (isText) return <TextIcon color="info" fontSize="large" />;
    if (isMarkdown) return <MarkdownIcon color="action" fontSize="large" />;
    if (isCode || isConfig)
      return <CodeIcon color="default" fontSize="large" />;
    if (isArchive) return <ArchiveIcon color="default" fontSize="large" />;
    if (isFont) return <FormatColorTextIcon color="primary" fontSize="large" />;
    if (isDatabase || isSQL)
      return <DataObjectIcon color="info" fontSize="large" />;
    if (isEbook) return <BookIcon color="secondary" fontSize="large" />;
    if (is3DModel || isCAD)
      return <ThreeDIcon color="warning" fontSize="large" />;
    if (isJson) return <DataObjectIcon color="primary" fontSize="large" />;
    if (isHTML) return <LanguageIcon color="info" fontSize="large" />;
    return <FileIcon color="action" fontSize="large" />;
  };

  // Önizleme render fonksiyonları
  const renderImagePreview = () => {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          overflow: "auto",
          position: "relative",
        }}
        onMouseDown={(e) => {
          if (e.button === 0) {
            setIsDragging(true);
            dragStartPos.current = { x: e.clientX, y: e.clientY };
          }
        }}
        onMouseMove={(e) => {
          if (isDragging) {
            const el = e.currentTarget;
            const dx = e.clientX - dragStartPos.current.x;
            const dy = e.clientY - dragStartPos.current.y;

            dragOffset.current = {
              x: dragOffset.current.x + dx,
              y: dragOffset.current.y + dy,
            };

            dragStartPos.current = { x: e.clientX, y: e.clientY };
            el.scrollLeft -= dx;
            el.scrollTop -= dy;
          }
        }}
        onMouseUp={() => {
          setIsDragging(false);
        }}
        onMouseLeave={() => {
          setIsDragging(false);
        }}
      >
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : document ? (
          <ImageWithAuth
            src={document._id}
            alt={document.orijinalDosyaAdi}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: "transform 0.2s ease",
              cursor: isDragging ? "grabbing" : "grab",
            }}
            onError={() => setError("Görüntü yüklenirken bir hata oluştu")}
          />
        ) : (
          <Alert severity="info">Görüntülenecek dosya yok</Alert>
        )}
      </Box>
    );
  };

  const renderVideoPreview = () => {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : document ? (
          <VideoWithAuth
            docId={document._id}
            controls={true}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
            }}
            onError={() => setError("Video yüklenirken bir hata oluştu")}
          />
        ) : (
          <Alert severity="info">Görüntülenecek video yok</Alert>
        )}
      </Box>
    );
  };

  const renderAudioPreview = () => {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          p: 3,
          gap: 2,
        }}
      >
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : document ? (
          <>
            <AudioIcon sx={{ fontSize: 100, color: "secondary.main" }} />
            <Typography variant="h6">{document.orijinalDosyaAdi}</Typography>
            <AudioWithAuth
              docId={document._id}
              controls={true}
              style={{ width: "100%" }}
              onError={() =>
                setError("Ses dosyası yüklenirken bir hata oluştu")
              }
            />
          </>
        ) : (
          <Alert severity="info">Görüntülenecek ses dosyası yok</Alert>
        )}
      </Box>
    );
  };

  const renderPdfPreview = () => {
    return (
      <Box
        sx={{
          height: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : document ? (
          <IframeWithAuth
            docId={document._id}
            title={document.orijinalDosyaAdi}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            onLoad={() => setLoading(false)}
            onError={() => setError("PDF yüklenirken bir hata oluştu")}
          />
        ) : (
          <Alert severity="info">Görüntülenecek PDF yok</Alert>
        )}
      </Box>
    );
  };

  const renderOfficePreview = () => {
    return (
      <Box
        sx={{
          height: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : document ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 3,
              height: "100%",
              overflow: "auto",
            }}
          >
            {isWord ? (
              <WordIcon color="primary" sx={{ fontSize: 100 }} />
            ) : isExcel ? (
              <ExcelIcon color="success" sx={{ fontSize: 100 }} />
            ) : (
              <PowerPointIcon color="warning" sx={{ fontSize: 100 }} />
            )}
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              {document.orijinalDosyaAdi}
            </Typography>
            <Alert severity="info" sx={{ mt: 2, mb: 3, width: "100%" }}>
              Office belgelerini doğrudan önizlemek için sistemde Office
              görüntüleyici kurulu olmalıdır. Dosyayı indirip
              görüntüleyebilirsiniz.
            </Alert>
            <Button
              variant="contained"
              color="primary"
              startIcon={<FileDownloadIcon />}
              onClick={handleDownload}
              sx={{ mt: 2 }}
            >
              Dosyayı İndir
            </Button>
          </Box>
        ) : (
          <Alert severity="info">Görüntülenecek ofis belgesi yok</Alert>
        )}
      </Box>
    );
  };

  const renderTextPreview = () => {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          border: "1px solid #ddd",
          p: 2,
          overflow: "auto",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          bgcolor: "#f5f5f5",
        }}
      >
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <pre style={{ margin: 0 }} ref={contentRef}>
            {textContent}
          </pre>
        )}
      </Box>
    );
  };

  const renderCodePreview = () => {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          border: "1px solid #ddd",
          p: 2,
          overflow: "auto",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          bgcolor: "#f5f5f5",
          maxHeight: fullscreen ? "95vh" : "90vh",
          ...(fullscreen ? { width: "95vw" } : {}),
        }}
      >
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <pre style={{ margin: 0 }} ref={contentRef}>
            {textContent}
          </pre>
        )}
      </Box>
    );
  };

  // Önizleme içeriğini render etme
  const renderPreviewContent = () => {
    // Resim dosyaları için güçlendirilmiş kontrol
    if (
      isImage ||
      (document?.mimeTur && document.mimeTur.startsWith("image/"))
    ) {
      return renderImagePreview();
    }
    if (
      isVideo ||
      (document?.mimeTur && document.mimeTur.startsWith("video/"))
    ) {
      return renderVideoPreview();
    }
    if (
      isAudio ||
      (document?.mimeTur && document.mimeTur.startsWith("audio/"))
    ) {
      return renderAudioPreview();
    }
    if (isPdf || (document?.mimeTur && document.mimeTur.includes("pdf"))) {
      return renderPdfPreview();
    }
    if (isWord || isExcel || isPowerPoint) return renderOfficePreview();
    if (isCode || isMarkdown || isJson || isHTML || isText || isConfig || isSQL)
      return renderCodePreview();

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          p: 3,
          gap: 2,
        }}
      >
        {getFileIcon()}
        <Typography variant="h6">{document?.orijinalDosyaAdi}</Typography>
        <Alert severity="info">
          Bu dosya türü için önizleme desteklenmiyor. Dosyayı indirip
          açabilirsiniz.
        </Alert>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FileDownloadIcon />}
          onClick={handleDownload}
        >
          Dosyayı İndir
        </Button>
      </Box>
    );
  };

  // Kontrol çubuğunu render etme
  const renderControls = () => {
    return (
      <Paper sx={{ mb: 1.5, p: 0.5 }}>
        <Stack direction="row" spacing={1} justifyContent="space-between">
          <Box>
            {(isImage || isPdf) && (
              <>
                <Tooltip title="Yakınlaştır">
                  <IconButton size="small" onClick={handleZoomIn}>
                    <ZoomInIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Uzaklaştır">
                  <IconButton size="small" onClick={handleZoomOut}>
                    <ZoomOutIcon />
                  </IconButton>
                </Tooltip>
                {isImage && (
                  <>
                    <Tooltip title="Sola Döndür">
                      <IconButton size="small" onClick={handleRotateLeft}>
                        <RotateLeftIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sağa Döndür">
                      <IconButton size="small" onClick={handleRotateRight}>
                        <RotateRightIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
                <Tooltip title="Sıfırla">
                  <IconButton size="small" onClick={handleZoomReset}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              </>
            )}
            <Tooltip title="İndir">
              <IconButton size="small" onClick={handleDownload}>
                <FileDownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Yazdır">
              <IconButton size="small" onClick={handlePrint}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
            {(isText ||
              isCode ||
              isMarkdown ||
              isJson ||
              isHTML ||
              isConfig ||
              isSQL) && (
              <Tooltip title={showSearch ? "Aramayı Kapat" : "Metinde Ara"}>
                <IconButton
                  size="small"
                  onClick={() => {
                    setShowSearch(!showSearch);
                    if (!showSearch) {
                      setTimeout(() => searchInputRef.current?.focus(), 100);
                    }
                  }}
                >
                  <SearchIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Paylaş">
              <IconButton size="small" onClick={handleShareClick}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Box>
            <Tooltip title="Daha Fazla">
              <IconButton size="small" onClick={handleMoreClick}>
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Tam Ekran">
              <IconButton size="small" onClick={handleFullscreen}>
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Stack>
      </Paper>
    );
  };

  // Tabs bileşeninin kullanıldığı kısımda değişiklik yapıyoruz
  const renderTabs = () => {
    const tabs = [
      { id: "preview", label: "Önizleme" },
      ...(isText ||
      isCode ||
      isMarkdown ||
      isJson ||
      isHTML ||
      isConfig ||
      isSQL ||
      isImage
        ? [{ id: "text", label: "Metin" }]
        : []),
      { id: "info", label: "Bilgiler" },
      { id: "notes", label: "Notlar" },
    ];

    return (
      <>
        <Tabs
          value={tabs.findIndex((tab, index) => index === tabValue)}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: "divider", mb: 1.5 }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={tab.id}
              label={tab.label}
              id={`tab-${index}`}
              aria-controls={`tabpanel-${index}`}
            />
          ))}
        </Tabs>

        {/* Önizleme içeriği */}
        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            display: tabValue === 0 ? "flex" : "none",
            flexDirection: "column",
            bgcolor: isDragging ? "rgba(0,0,0,0.02)" : "transparent",
            transition: "background-color 0.2s ease",
            border: "1px solid #ddd",
            borderRadius: 1,
          }}
        >
          {renderPreviewContent()}
        </Box>

        {/* Metin içeriği - Görüntülenecek indeksi dinamik hesaplıyoruz */}
        {(isText ||
          isCode ||
          isMarkdown ||
          isJson ||
          isHTML ||
          isConfig ||
          isSQL ||
          isImage) && (
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              display:
                tabValue === tabs.findIndex((tab) => tab.id === "text")
                  ? "block"
                  : "none",
              border: "1px solid #ddd",
              borderRadius: 1,
              p: 2,
              fontFamily: "monospace",
              bgcolor: "background.paper",
            }}
            ref={contentRef}
          >
            {loading ? (
              <CircularProgress />
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {textContent ||
                  "Bu dosya türü için metin içeriği görüntülenemiyor."}
              </pre>
            )}
          </Box>
        )}

        {/* Bilgiler sekmesi - Görüntülenecek indeksi dinamik hesaplıyoruz */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            display:
              tabValue === tabs.findIndex((tab) => tab.id === "info")
                ? "block"
                : "none",
            border: "1px solid #ddd",
            borderRadius: 1,
            p: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Dosya Bilgileri
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {/* Dosya bilgileri içeriği */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Dosya Adı
              </Typography>
              <Typography variant="body1" gutterBottom>
                {document?.orijinalDosyaAdi || "Bilinmiyor"}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Dosya Türü
              </Typography>
              <Typography variant="body1" gutterBottom>
                {document?.mimeTur || "Bilinmiyor"}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Dosya Boyutu
              </Typography>
              <Typography variant="body1" gutterBottom>
                {document?.dosyaBoyutu
                  ? formatFileSize(document.dosyaBoyutu)
                  : "Bilinmiyor"}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Oluşturulma Tarihi
              </Typography>
              <Typography variant="body1" gutterBottom>
                {document?.createdAt
                  ? new Date(document.createdAt).toLocaleString()
                  : "Bilinmiyor"}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Son Düzenleme
              </Typography>
              <Typography variant="body1" gutterBottom>
                {document?.updatedAt
                  ? new Date(document.updatedAt).toLocaleString()
                  : "Bilinmiyor"}
              </Typography>
            </Grid>

            {metaData &&
              Object.entries(metaData).map(
                ([key, value]) =>
                  key !== "boyut" &&
                  key !== "tür" && (
                    <Grid item xs={12} sm={6} key={key}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {value || "Bilinmiyor"}
                      </Typography>
                    </Grid>
                  )
              )}

            {document?.aciklama && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Açıklama
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {document.aciklama}
                </Typography>
              </Grid>
            )}
          </Grid>

          {!document && !metaData && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Dosya bilgileri bulunamadı.
            </Alert>
          )}
        </Box>

        {/* Notlar sekmesi - Görüntülenecek indeksi dinamik hesaplıyoruz */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            display:
              tabValue === tabs.findIndex((tab) => tab.id === "notes")
                ? "block"
                : "none",
            border: "1px solid #ddd",
            borderRadius: 1,
            p: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Doküman Notları</Typography>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleSaveNotes}
              startIcon={<NoteIcon />}
            >
              Notları Kaydet
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <TextField
            fullWidth
            multiline
            rows={8}
            placeholder="Bu doküman hakkında notlarınızı buraya yazabilirsiniz..."
            value={notes}
            onChange={handleNotesChange}
            variant="outlined"
            sx={{ mb: 2 }}
          />

          <Typography variant="caption" color="text.secondary">
            Yazdığınız notlar bu dokümanla ilişkilendirilecek ve yalnızca siz
            görebileceksiniz.
            {!Boolean(localStorage.getItem(`evrak_notes_${document?._id}`)) &&
              !notes && (
                <Box component="span" sx={{ display: "block", mt: 1 }}>
                  Henüz bu doküman için kayıtlı not bulunmuyor.
                </Box>
              )}
          </Typography>
        </Box>
      </>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          height: "90vh",
          maxHeight: fullscreen ? "95vh" : "90vh",
          width: fullscreen ? "95vw" : undefined,
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{ maxWidth: "80%", overflow: "hidden" }}
          >
            {getFileIcon()}
            <Typography variant="h6" noWrap title={document?.orijinalDosyaAdi}>
              {document?.orijinalDosyaAdi}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 1.5,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {document && (
          <>
            {/* Kontrol çubuğu */}
            {renderControls()}

            {/* Arama çubuğu */}
            {showSearch && (
              <Paper
                sx={{
                  p: 1,
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <TextField
                  placeholder="Aranacak metin..."
                  size="small"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  inputRef={searchInputRef}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSearch}
                  disabled={!searchText.trim()}
                >
                  Ara
                </Button>
              </Paper>
            )}

            {/* Tabs ve içeriği render ediyoruz */}
            {renderTabs()}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {document?.dosyaBoyutu &&
              `Boyut: ${formatFileSize(document.dosyaBoyutu)}`}
            {document?.mimeTur && ` · Tür: ${document.mimeTur}`}
          </Typography>
        </Box>
        <Button onClick={onClose} color="primary" variant="outlined">
          Kapat
        </Button>
      </DialogActions>

      {/* Paylaşım menüsü */}
      <Menu
        anchorEl={shareMenuAnchor}
        open={Boolean(shareMenuAnchor)}
        onClose={handleShareClose}
        sx={{ mt: 1 }}
      >
        <MenuItem onClick={handleShareLink}>
          <ListItemIcon>
            <FileCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Bağlantıyı Kopyala</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleShareEmail}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>E-posta olarak gönder</ListItemText>
        </MenuItem>
      </Menu>

      {/* Daha fazla menüsü */}
      <Menu
        anchorEl={moreMenuAnchor}
        open={Boolean(moreMenuAnchor)}
        onClose={handleMoreClose}
        sx={{ mt: 1 }}
      >
        {isImage && (
          <MenuItem onClick={handleOCR}>
            <ListItemIcon>
              <TextSnippetIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Görüntüden Metin Çıkar (OCR)</ListItemText>
          </MenuItem>
        )}

        <MenuItem onClick={() => handleConvert("pdf")}>
          <ListItemIcon>
            <PdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>PDF'e Dönüştür</ListItemText>
        </MenuItem>

        {(isWord || isOpenDoc || isText || isMarkdown) && (
          <MenuItem onClick={() => handleConvert("docx")}>
            <ListItemIcon>
              <WordIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Word Belgesine Dönüştür</ListItemText>
          </MenuItem>
        )}

        {(isExcel || isText || isCSV) && (
          <MenuItem onClick={() => handleConvert("xlsx")}>
            <ListItemIcon>
              <ExcelIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Excel Belgesine Dönüştür</ListItemText>
          </MenuItem>
        )}

        <MenuItem onClick={() => handleConvert("txt")}>
          <ListItemIcon>
            <TextIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Metin Belgesine Dönüştür</ListItemText>
        </MenuItem>
      </Menu>

      {/* Bildirim çubuğu */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Dialog>
  );
};

// Tokenli Görsel bileşeni - geliştirilmiş hata yönetimi ile
const ImageWithAuth = ({ src, alt, style, onLoad, onError }) => {
  const [imgSrc, setImgSrc] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(`/api/evraklar/indir/${src}`, {
          headers: {
            "x-auth-token": token,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Yetkilendirme hatası: Oturum süresi dolmuş olabilir (401)"
            );
          } else {
            throw new Error(`Görsel yüklenemedi: ${response.status}`);
          }
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setImgSrc(objectUrl);
        setLoadError(null);
      } catch (error) {
        console.error("Görsel yüklenirken hata:", error);
        setLoadError(error.message);
        onError && onError(error);
      }
    };

    if (src) {
      loadImage();
    }

    return () => {
      if (imgSrc) {
        URL.revokeObjectURL(imgSrc);
      }
    };
  }, [src, onError, imgSrc]);

  if (loadError) {
    return <Alert severity="error">{loadError}</Alert>;
  }

  return imgSrc ? (
    <img
      src={imgSrc}
      alt={alt}
      style={style}
      onLoad={onLoad}
      onError={(e) => {
        console.error("Görsel render hatası:", e);
        onError && onError(e);
      }}
    />
  ) : (
    <CircularProgress />
  );
};

// Tokenli PDF/İframe bileşeni
const IframeWithAuth = ({ docId, title, style, onLoad, onError }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !docId) return;

    const loadContent = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(`/api/evraklar/onizleme/${docId}`, {
          headers: {
            "x-auth-token": token,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Yetkilendirme hatası: Oturum süresi dolmuş olabilir (401)"
            );
          } else {
            throw new Error(`PDF yüklenemedi: ${response.status}`);
          }
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        iframe.src = objectUrl;
        iframe.onload = onLoad;

        return () => {
          URL.revokeObjectURL(objectUrl);
        };
      } catch (error) {
        console.error("PDF yüklenirken hata:", error);
        onError && onError(error);
      }
    };

    loadContent();
  }, [docId, onLoad, onError]);

  return <iframe ref={iframeRef} title={title} style={style} />;
};

// Tokenli Video bileşeni
const VideoWithAuth = ({ docId, style, controls, onLoadedData, onError }) => {
  const [videoSrc, setVideoSrc] = useState(null);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(`/api/evraklar/indir/${docId}`, {
          headers: {
            "x-auth-token": token,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Yetkilendirme hatası: Oturum süresi dolmuş olabilir (401)"
            );
          } else {
            throw new Error(`Video yüklenemedi: ${response.status}`);
          }
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setVideoSrc(objectUrl);
      } catch (error) {
        console.error("Video yüklenirken hata:", error);
        onError && onError(error);
      }
    };

    if (docId) {
      loadVideo();
    }

    return () => {
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [docId, onError, videoSrc]);

  return videoSrc ? (
    <video
      src={videoSrc}
      style={style}
      controls={controls}
      onLoadedData={onLoadedData}
      onError={onError}
    />
  ) : null;
};

// Tokenli Ses bileşeni
const AudioWithAuth = ({ docId, style, controls, onLoadedData, onError }) => {
  const [audioSrc, setAudioSrc] = useState(null);

  useEffect(() => {
    const loadAudio = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(`/api/evraklar/indir/${docId}`, {
          headers: {
            "x-auth-token": token,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Yetkilendirme hatası: Oturum süresi dolmuş olabilir (401)"
            );
          } else {
            throw new Error(`Ses dosyası yüklenemedi: ${response.status}`);
          }
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setAudioSrc(objectUrl);
      } catch (error) {
        console.error("Ses dosyası yüklenirken hata:", error);
        onError && onError(error);
      }
    };

    if (docId) {
      loadAudio();
    }

    return () => {
      if (audioSrc) {
        URL.revokeObjectURL(audioSrc);
      }
    };
  }, [docId, onError, audioSrc]);

  return audioSrc ? (
    <audio
      src={audioSrc}
      style={style}
      controls={controls}
      onLoadedData={onLoadedData}
      onError={onError}
    />
  ) : null;
};

// Dosya boyutunu formatlamak için yardımcı fonksiyon
const formatFileSize = (bytes) => {
  if (!bytes) return "Bilinmiyor";
  const suffixes = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (bytes >= 1024 && i < suffixes.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${suffixes[i]}`;
};

export default PreviewModal;
