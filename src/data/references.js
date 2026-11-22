// Reference sources for the course. Kept in one place so the /references page
// and the footer cannot disagree about a link, and so a local PDF only ever
// has to be renamed in a single spot.
//
// `file` is a path inside public/references/. A source without `file` is
// external only (no download copy is hosted here).
export const REFERENCES = [
  {
    id: 'alex-xu',
    title: 'System Design Interview',
    author: 'Alex Xu',
    kind: 'Sách · PDF',
    // TODO: vol/edition is not printed on the file itself, so it is not claimed.
    file: 'references/system-design-interview-alex-xu.pdf',
    size: '10 MB',
    desc:
      'Cuốn sách phỏng vấn system design phổ biến nhất. Mỗi chương là một bài thiết kế hoàn chỉnh: yêu cầu, ước lượng, kiến trúc, rồi deep-dive vào chỗ dễ hỏng.',
    why:
      'Đọc song song với Module 5. Điểm mạnh là cách tác giả lượng hoá mọi thứ — QPS, storage, latency — thay vì nói chung chung.',
    // No external link on purpose: the reader already has the full PDF above,
    // and a second "bản gốc" link only competes with the two action buttons.
    external: null,
    externalLabel: null,
  },
  {
    id: '60-days',
    title: '60 Days of System Design Questions',
    // The PDF carries no /Author in its metadata and no name on the pages I
    // could extract, so the attribution comes from README.md. Worth a second
    // look before this page is presented as authoritative.
    author: 'Joud Awad',
    kind: 'Ebook · PDF',
    file: 'references/60-days-of-system-design.pdf',
    size: '33 MB',
    desc:
      'Lộ trình 60 ngày, mỗi ngày một chủ đề ngắn. Hợp với người cần nhịp học đều thay vì đọc một mạch, và dùng làm danh sách kiểm tra độ phủ kiến thức.',
    why:
      'Đối chiếu với lộ trình 12 tuần của site: chỗ nào bạn thấy lạ là chỗ nên đọc lại. Nội dung ngắn hơn Alex Xu nên đừng dùng làm nguồn duy nhất.',
    external: null,
    externalLabel: null,
  },
  {
    id: 'bytebytego-101',
    title: 'System Design 101',
    author: 'ByteByteGo',
    kind: 'Repo · GitHub',
    file: null,
    size: null,
    desc:
      'Bộ diagram giải thích hệ thống thật (Discord, Netflix, Uber) kèm ghi chú ngắn. Là nguồn tốt để học cách trình bày kiến trúc bằng hình.',
    why:
      'Dùng làm tham chiếu khi vẽ diagram cho bài tập: mỗi hình ở đây chỉ kể một ý, đúng nguyên tắc mà Module 7 khuyên khi trình bày.',
    external: 'https://github.com/ByteByteGoHq/system-design-101',
    externalLabel: 'github.com/ByteByteGoHq/system-design-101',
  },
  {
    id: 'system-design-primer',
    title: 'The System Design Primer',
    author: 'Donne Martin',
    kind: 'Repo · GitHub',
    file: null,
    size: null,
    desc:
      'Repo học system design lớn nhất trên GitHub: câu hỏi phỏng vấn kèm lời giải, danh sách paper, và phần "how to approach" rất chi tiết. Toàn bộ bằng tiếng Anh, miễn phí.',
    why:
      'Nguồn để tra khi cần hiểu sâu một building block (cache, queue, sharding). Mạnh về liên kết tới paper gốc và ví dụ code — bổ sung cho phần lý thuyết của site.',
    external: 'https://github.com/donnemartin/system-design-primer',
    externalLabel: 'github.com/donnemartin/system-design-primer',
  },
];
