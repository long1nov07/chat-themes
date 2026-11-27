# chat-themes

Một mod cho Claude Code: thêm thanh **Chat themes** ngay trên ô chat để chọn hình nền ASCII chuyển động cho cuộc trò chuyện.

```
Chat themes  [🌊 Dưới nước]  [🌙 Bầu trời đêm]  [✨ Đom đóm]  [Tắt]
```

- 🌊 **Dưới nước**: sóng `~~-~`, bong bóng `o O .` nổi lên, cá `><>` bơi ngang, rong `()` đung đưa trên cát.
- 🌙 **Bầu trời đêm**: sao `. * +` lấp lánh, trăng ASCII, mây trôi, thỉnh thoảng có sao băng trên dãy núi `^`.
- ✨ **Đom đóm**: đom đóm `*` phát sáng bay trên đồng cỏ `|/',vY`, phía sau là hàng thông.

Mỗi cảnh đi kèm bộ màu tối hợp với nó. Lựa chọn được nhớ cho các phiên sau. Lệnh `/chat-themes underwater | night-sky | fireflies | off` cũng đổi được nền.

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
