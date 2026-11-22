/**
 * Rich module intros.
 *
 * The static site printed one of these at the top of each module page, above
 * the hero meta row. They are longer and more specific than the one-line card
 * description in modules.js (250-420 chars, with inline keyword highlights),
 * so they are kept verbatim here rather than regenerated from the description.
 */
export const MODULE_LEADS = {
  "0": "Trước khi thiết kế bất kỳ hệ thống nào, bạn phải hiểu những gì đang chạy bên dưới: gói tin đi qua đâu, thread được schedule thế nào, dữ liệu nằm trên đĩa ra sao, và tại sao hai máy không thể \"chỉ cần đồng bộ\" với nhau. Module này là phần đếm ngược từ vật lý lên đến kiến trúc.",
  "1": "Module này dạy bạn cách <em>tiếp cận</em> một bài toán thiết kế trước khi động đến công nghệ. Thứ tự luôn là: làm rõ yêu cầu → ước lượng quy mô → phác thảo kiến trúc → đào sâu điểm nghẽn → trình bày trade-off. Ai bỏ qua bước 1 và 2 sẽ thiết kế sai hệ thống.",
  "2": "Chín viên gạch này xuất hiện trong <em>mọi</em> buổi phỏng vấn system design, dù đề bài là Twitter, Uber hay Netflix. Học chúng theo trình tự: cái nào giải quyết vấn đề gì, hoạt động ra sao, và khi nào thì <span class=\"kw-y\">không</span> nên dùng. Người mới thường nhồi tất cả building block vào một thiết kế — đó là sai lầm nghiêm trọng nhất.",
  "3": "Trong phỏng vấn, câu hỏi <em>\"dữ liệu này lưu ở đâu?\"</em> xuất hiện sớm hơn mọi câu hỏi về scale. Chọn sai storage thì mọi thứ phía sau — replication, sharding, caching — đều là vá víu. Module này đi từ <span class=\"kw\">cơ chế bên trong</span> (B+ tree, LSM tree) đến <span class=\"kw-y\">hệ quả vận hành</span> (replication lag, quorum, hotspot) để bạn chọn đúng và bảo vệ được lựa chọn đó bằng số liệu.",
  "4": "Khi hệ thống có hơn một máy, mọi giả định đơn giản đều sụp đổ: mạng có thể đứt, đồng hồ lệch nhau, một tiến trình có thể \"chết\" mà thực ra vẫn đang chạy và ghi dữ liệu. Module này trang bị những mô hình đúng để suy luận — <span class=\"kw\">consensus</span>, <span class=\"kw\">fencing</span>, <span class=\"kw-y\">idempotency</span> — và những pattern thực dụng để sống chung với sự không chắc chắn thay vì cố loại bỏ nó.",
  "5": "Mười bài toán này chiếm phần lớn đề thi system design. Chúng không khó vì thuật toán — chúng khó vì phải chọn đúng <span class=\"kw\">điểm cân bằng</span> giữa nhất quán, độ trễ và chi phí, rồi bảo vệ lựa chọn đó bằng số liệu. Với mỗi bài, hãy học theo khung: <span class=\"kw-y\">yêu cầu → ước lượng → API → dữ liệu → luồng → điểm nghẽn → mở rộng</span>.",
  "6": "Đến đây bạn đã biết các khối rời. Câu hỏi của module này là: <span class=\"kw\">ghép chúng thành một hệ thống vận hành được</span> — chia service thế nào cho đúng, deploy ra sao để không sập, đo độ tin cậy bằng gì, và tại sao hoá đơn cloud lại cao hơn dự kiến 4 lần. Đây là phần biến người biết system design thành người <em>làm được</em> system design.",
  "7": "Bạn đã có kiến thức. Buổi phỏng vấn system design không kiểm tra bạn <em>biết</em> bao nhiêu mà kiểm tra bạn <span class=\"kw\">điều khiển cuộc hội thoại</span> thế nào trong 45 phút. Module này là phần huấn luyện: khung thời gian, cách nói trade-off, cách xử lý khi bị hỏi khó, và checklist trước khi kết thúc."
};
