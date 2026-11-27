# chat-themes

Một mod cho Claude Code: thêm bảng **Chat themes** ngay trên ô chat để chọn hình nền ASCII chuyển động cho cuộc trò chuyện.

Bảng có tiêu đề `/chat-themes · ASCII wallpapers` và một hàng thẻ, mỗi thẻ là ảnh xem trước thu nhỏ của một cảnh kèm tên; thẻ đang dùng có viền màu và dấu ✓. Bấm tên dưới thẻ để đổi nền, bấm **Đóng** để thu bảng về một dòng (bấm **Đổi hình nền** để mở lại). Trong terminal, thẻ hiện bản xem trước bằng ký tự ASCII.

Ở góc phải thanh, ngay trên ô chat, có **một bạn Claude tí hon** (80×80 px) đội mũ bảo hộ, mặc áo phản quang:

- Khi Claude Code rảnh, bạn ấy đứng chill (thở, chớp mắt, huýt sáo ♪) rồi ngẫu nhiên nằm ngủ (zZ), lại dậy đứng chill.
- Khi Claude Code đang làm việc, bạn ấy ngồi gõ laptop, màn hình hắt sáng lên mặt.
- Mỗi lần đổi tư thế có động tác riêng: ngáp, vươn vai rồi ngã ra ngủ; giật mình "!" bật dậy; lôi laptop ra mở nắp; gập laptop cất đi rồi vươn vai.
- Trong terminal, bạn ấy là một khuôn mặt chữ: `(•‿•) ♪`, `(-_-) zZ`, `(•_•)⌨`.

- 🌊 **Dưới nước**: sóng `~~-~`, bong bóng `o O .` nổi lên, cá `><>` bơi ngang, rong `()` đung đưa trên cát.
- 🐟 **Mặt nước**: nhìn từ trên xuống mặt hồ: đàn 5 con cá vàng `><(((('>` bơi chéo qua, mỗi lượt một hướng; chiếc phao đỏ trắng trôi loanh quanh; cứ 30 giây có một đợt sóng nhẹ quét qua làm phao nảy lên.
- 🌙 **Bầu trời đêm**: sao `. * +` lấp lánh, trăng ASCII, mây trôi, thỉnh thoảng có sao băng trên dãy núi `^`.
- ✨ **Đom đóm**: đom đóm `*` phát sáng bay trên đồng cỏ `|/',vY`, phía sau là hàng thông.

Mỗi cảnh đi kèm bộ màu tối hợp với nó. Lựa chọn được nhớ cho các phiên sau. Lệnh `/chat-themes underwater | pond | night-sky | fireflies | off` cũng đổi được nền.

Hình nền chỉ hiện trong app desktop và mobile của Claude; terminal và VS Code chỉ hiện thanh nút.

## Cài đặt

Tại ô nhập của một phiên Claude Code trong terminal:

```
/plugin install chat-themes --marketplace long1nov07/chat-themes
```

Trả lời `y` để thêm marketplace, rồi chọn phạm vi **user** để mod chạy ở mọi phiên.

Từ shell:

```bash
claude plugin install chat-themes --marketplace long1nov07/chat-themes
```

Trong app desktop, nơi `/plugin` không chạy: bấm + cạnh ô nhập, chọn Plugins, Add marketplace với `long1nov07/chat-themes`, rồi Add plugin.
