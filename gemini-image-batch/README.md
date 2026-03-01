# Gemini Batch Image Generator 🎨

Chrome Extension để tạo loạt hình ảnh tự động trên [Gemini](https://gemini.google.com/app).

## ✨ Tính năng

- **Chọn kích thước khung hình**: 16:9, 9:16, 1:1
- **Upload hình ảnh chuẩn** (reference image) để Gemini tham chiếu
- **Danh sách prompts**: Thêm thủ công hoặc import từ file TXT
- **Tự động thực hiện**: Gửi từng prompt lần lượt vào Gemini và thu thập kết quả
- **Giao diện 2 cột**: Cột trái điều khiển, cột phải kết quả
- **Lightbox**: Nhấn vào hình để xem phóng to

## 📦 Cài đặt

1. Tải thư mục `gemini-image-batch` về máy
2. Mở Chrome → Nhập `chrome://extensions` vào thanh địa chỉ
3. Bật **Developer mode** (chế độ nhà phát triển) ở góc trên bên phải
4. Nhấn **Load unpacked** (Tải tiện ích chưa đóng gói)
5. Chọn thư mục `gemini-image-batch`
6. Extension đã được cài đặt! ✅

## 🚀 Sử dụng

1. Mở [https://gemini.google.com/app](https://gemini.google.com/app)
2. Đăng nhập tài khoản Google nếu chưa
3. Nhấn nút 🎨 ở góc trên bên phải để mở panel
4. **Bước 1**: Chọn kích thước hình (16:9, 9:16, hoặc 1:1)
5. **Bước 2**: Upload hình mẫu nếu cần (tùy chọn)
6. **Bước 3**: Thêm danh sách prompts
   - Nhập prompt và nhấn Enter
   - Hoặc nhấn **Import TXT** để nhập từ file text (mỗi dòng 1 prompt)
7. **Bước 4**: Nhấn **▶ Bắt đầu tạo hình ảnh**
8. Extension sẽ tự động gửi từng prompt vào Gemini và hiển thị kết quả ở cột phải

## ⚠️ Lưu ý

- Cần đăng nhập Gemini trước khi sử dụng
- Extension tương tác trực tiếp với giao diện Gemini, nên không nên thao tác thủ công trong khi đang chạy
- Mỗi prompt cần thời gian để Gemini xử lý (30-120 giây)
- Nếu gặp lỗi, nhấn **⏹ Dừng lại** và thử lại

## 📂 Cấu trúc

```
gemini-image-batch/
├── manifest.json     # Chrome Extension manifest
├── content.js        # Script chính - inject panel & automation
├── panel.css         # Giao diện panel
├── background.js     # Service worker
├── icons/            # Icon extension
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md         # Hướng dẫn
```
