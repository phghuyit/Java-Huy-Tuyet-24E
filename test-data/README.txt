Test thêm category tại POST http://localhost:8080/api/categories

Chạy lần lượt:
1. 01-create-success.json: HTTP 201 (tên phải chưa tồn tại).
2. 02-create-duplicate.json: HTTP 409 (dùng cùng tên với bước 1).
3. 03-create-missing-name.json: HTTP 400 (thiếu name).

Có thể import category-create.postman_collection.json vào Postman rồi chạy Collection Runner.
Khi chạy lại, đổi biến categoryName thành tên chưa tồn tại.
Chỉ name là bắt buộc; description và status hiện là tùy chọn.
