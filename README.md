# AutoDiscord Bot

Một Chrome extension tự động hóa hành động trên Discord với các tính năng điều khiển, độ trễ, cooldown và hồi máu tự động.

## 🎯 Tính năng

- **Tự động bấm nút** - Tự động nhấp vào các nút được ưu tiên trên Discord
- **Hồi máu tự động** - Tự động sử dụng kỹ năng hồi phục khi cần thiết
- **Điều khiển Delay** - Đặt độ trễ giữa các hành động (ms)
- **Cooldown** - Đặt thời gian chờ tối thiểu giữa các lần bấm (ms)
- **UI Bật/Tắt** - Dễ dàng bật/tắt từ popup extension
- **Lọc nút tự động** - Loại trừ các nút không cần thiết

## 📋 Yêu cầu

- Google Chrome hoặc Chromium-based browser
- Quyền truy cập vào https://discord.com

## 🚀 Cài đặt

1. Clone hoặc download project:
```bash
git clone https://github.com/Daylight2k/AutoTuTienDiscord.git
```

2. Mở Chrome và truy cập `chrome://extensions/`

3. Bật "Developer mode" (góc trên bên phải)

4. Nhấp "Load unpacked" và chọn thư mục project

5. Extension sẽ xuất hiện trong danh sách extensions

## 🎮 Cách sử dụng

1. Mở Discord trong Chrome
2. Nhấp vào icon extension AutoDiscord Bot
3. Cấu hình các tùy chọn:
   - **Auto hồi máu** - Bật/tắt tính năng hồi máu tự động
   - **Delay (ms)** - Độ trễ giữa các lần bấm (mặc định: 2000ms)
   - **Cooldown (ms)** - Thời gian chờ tối thiểu giữa các lần bấm (mặc định: 10000ms)
4. Nhấp **"Bắt đầu"** để kích hoạt bot

## ⚙️ Cấu trúc tệp

- `manifest.json` - Cấu hình extension
- `popup.html` - Giao diện người dùng
- `popup.js` - Xử lý logic popup
- `content.js` - Script chạy trên trang Discord
- `inject.js` - Script được tiêm vào trang
- `popup.css` - Kiểu dáng UI

## 🔧 Tùy chỉnh

### Ưu tiên nút

Chỉnh sửa mảng `SPECIAL_PRIORITIES` và `PRIORITIES` trong `inject.js` để thay đổi thứ tự ưu tiên bấm nút:

```javascript
const SPECIAL_PRIORITIES = ['hứng lấy linh nhũ', 'để lại cho sinh linh khác', ...];
const PRIORITIES = ['sinh', 'hưu', 'cảnh', ...];
```

### Loại trừ nút

Chỉnh sửa mảng `EXCLUDES` để thêm/xóa các nút cần loại bỏ:

```javascript
const EXCLUDES = ['rời', 'khóa phòng', 'làm mới', ...];
```

## ⚠️ Lưu ý

- Sử dụng extension này có trách nhiệm của bạn
- Kiểm tra điều khoản dịch vụ của Discord trước khi sử dụng
- Extension này chỉ tự động hóa hành động trên giao diện người dùng

## 📝 Changelog

### v1.0
- Phiên bản đầu tiên
- Tính năng tự động bấm nút cơ bản
- Hồi máu tự động
- Điều khiển delay và cooldown
- Giao diện popup đơn giản

## 🤝 Đóng góp

Hoan nghênh các pull request và issue!

## 📄 Giấy phép

Dự án này được cấp phép dưới giấy phép MIT.

## ✉️ Liên hệ

Tác giả: Daylight2k  
GitHub: https://github.com/Daylight2k
