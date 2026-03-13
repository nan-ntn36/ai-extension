# AI Batch Image Generator 🎨

> Chrome Extension để tạo loạt hình ảnh & video tự động trên **Gemini**, **Grok** & **Veo 3** — hỗ trợ identity preservation, outfit swap, video generation.

![Chrome](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-34A853?logo=google&logoColor=white)
![Version](https://img.shields.io/badge/version-4.0.0-blue)

---

## ✨ Tính năng chính

| Tính năng | Mô tả |
|---|---|
| 🖼️ **Batch Image Generation** | Gửi danh sách prompts lần lượt và tự động thu thập kết quả |
| 📐 **Chọn kích thước** | Hỗ trợ 16:9, 9:16, 1:1 |
| 🖌️ **Reference Image** | Upload hình mẫu để AI tham chiếu (identity, outfit swap) |
| 🎬 **Video Generation** | Tạo video qua Veo 3 (Google Labs / Flow) |
| 🤖 **Multi-platform** | Hoạt động trên Gemini, Grok, và Google Labs |
| 📄 **Import TXT** | Nhập danh sách prompts từ file text |
| 🔍 **Lightbox** | Nhấn vào hình để xem phóng to |

---

## 📦 Cài đặt

1. Clone repo hoặc tải thư mục `gemini-image-batch/` về máy
   ```bash
   git clone https://github.com/<your-username>/ai-extension.git
   ```
2. Mở Chrome → Nhập `chrome://extensions` vào thanh địa chỉ
3. Bật **Developer mode** ở góc trên bên phải
4. Nhấn **Load unpacked**
5. Chọn thư mục `gemini-image-batch/`
6. Extension đã sẵn sàng! ✅

---

## 🚀 Sử dụng

1. Mở một trong các trang được hỗ trợ:
   - [gemini.google.com](https://gemini.google.com/app)
   - [grok.com](https://grok.com)
   - [labs.google](https://labs.google)
2. Đăng nhập tài khoản tương ứng
3. Nhấn nút 🎨 ở góc trên bên phải để mở panel
4. Chọn **kích thước hình** (16:9 / 9:16 / 1:1)
5. Upload **hình mẫu** nếu cần *(tùy chọn)*
6. Thêm danh sách **prompts** — nhập thủ công hoặc **Import TXT**
7. Nhấn **▶ Bắt đầu tạo hình ảnh**
8. Kết quả sẽ hiển thị ở cột phải, tự động tải về

---

## 🏗️ Cấu trúc dự án

```
ai-extension/
└── gemini-image-batch/
    ├── manifest.json          # Chrome Extension manifest (V3)
    ├── content.js             # Script chính — inject panel & automation
    ├── panel.css              # Giao diện panel
    ├── background.js          # Service worker (downloads, storage)
    ├── api-interceptor.js     # Intercept API responses (MAIN world)
    ├── adapters/
    │   ├── gemini.js          # Adapter cho Gemini
    │   ├── grok.js            # Adapter cho Grok
    │   ├── grok-imagine.js    # Adapter cho Grok Imagine
    │   └── flow.js            # Adapter cho Veo 3 / Google Labs
    ├── icons/
    │   ├── icon16.png
    │   ├── icon48.png
    │   └── icon128.png
    └── README.md
```

---

## 🔧 Platform Adapters

Extension sử dụng kiến trúc **adapter pattern** để hỗ trợ nhiều nền tảng:

- **`gemini.js`** — Tương tác với giao diện Gemini (gửi prompt, thu thập hình)
- **`grok.js`** — Tương tác với Grok text generation
- **`grok-imagine.js`** — Tương tác với Grok image generation
- **`flow.js`** — Tương tác với Google Labs / Veo 3 video generation

---

## ⚠️ Lưu ý

- Cần **đăng nhập** vào platform trước khi sử dụng
- **Không thao tác thủ công** trong khi extension đang chạy
- Mỗi prompt cần **30–120 giây** để AI xử lý
- Nếu gặp lỗi, nhấn **⏹ Dừng lại** và thử lại
- Extension hoạt động bằng cách tương tác trực tiếp với DOM, nên có thể bị ảnh hưởng khi platform cập nhật giao diện

---

## 📋 Yêu cầu hệ thống

- Google Chrome (phiên bản mới nhất khuyến nghị)
- Tài khoản trên platform muốn sử dụng (Google, xAI)

---

## 📄 License

MIT © 2025
