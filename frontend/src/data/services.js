export const categories = [
  {
    "id": "cat-hair",
    "slug": "hair",
    "name": "Tóc",
    "headline": "DIỆN MẠO MỚI",
    "summary": "Cắt · Nhuộm · Phục hồi",
    "description": "Màu tóc hài hòa, đường cắt phù hợp với gương mặt và liệu trình giúp tóc luôn khỏe đẹp.",
    "image": "/images/photo-1554519934-e32b1629d9ee.jpg",
    "order": 1,
    "active": true
  },
  {
    "id": "cat-nails",
    "slug": "nails",
    "name": "Móng",
    "headline": "TINH TẾ TỪ CHI TIẾT",
    "summary": "Sơn gel · Tạo dáng · Vẽ móng",
    "description": "Chăm sóc kỹ lưỡng, tạo dáng cân đối và hoàn thiện bộ móng theo phong cách riêng của bạn.",
    "image": "/images/photo-1610992015836-7c249d75782d.jpg",
    "order": 2,
    "active": true
  },
  {
    "id": "cat-lashes",
    "slug": "lashes",
    "name": "Mi",
    "headline": "ÁNH NHÌN RẠNG RỠ",
    "summary": "Nối mi · Uốn mi · Nhuộm mi",
    "description": "Thiết kế dáng mi phù hợp với đôi mắt, nhẹ nhàng và thoải mái trong sinh hoạt hằng ngày.",
    "image": "/images/photo-1567629307995-b9f33097bd30.jpg",
    "order": 3,
    "active": true
  },
  {
    "id": "cat-facial",
    "slug": "facial",
    "name": "Chăm sóc da",
    "headline": "LẮNG NGHE LÀN DA",
    "summary": "Tư vấn · Làm sạch · Dưỡng sáng",
    "description": "Bắt đầu từ việc hiểu làn da để chọn liệu trình và hướng dẫn chăm sóc phù hợp.",
    "image": "/images/photo-1693004927824-f2623bbedc8b.jpg",
    "order": 4,
    "active": true
  },
  {
    "id": "cat-spa",
    "slug": "spa",
    "name": "Thư giãn",
    "headline": "CHẬM LẠI MỘT CHÚT",
    "summary": "Gội đầu · Da đầu · Massage",
    "description": "Không gian yên tĩnh với các liệu trình chăm sóc da đầu và thư giãn nhẹ nhàng.",
    "image": "/images/photo-1693578538512-fc66f318c833.jpg",
    "order": 5,
    "active": true
  }
];

export const services = [
  {
    "id": "svc-balayage",
    "slug": "signature-balayage",
    "name": "Nhuộm Balayage VELA",
    "categorySlug": "hair",
    "summary": "Sắc màu chuyển nhẹ, hài hòa với nền tóc tự nhiên.",
    "description": "Từng lọn tóc được nhuộm thủ công để tạo chiều sâu và giữ phần chân tóc chuyển màu mềm mại. Nhân viên tư vấn sắc độ phù hợp trước khi thực hiện.",
    "durationMin": 90,
    "price": 1800000,
    "image": "/images/photo-1619520167112-c8cb9961e30a.jpg",
    "gallery": [
      "/images/photo-1598461947262-153e592d4e72.jpg",
      "/images/photo-1554519934-e32b1629d9ee.jpg",
      "/images/photo-1779153862705-5969578ac606.jpg"
    ],
    "includes": [
      "Tư vấn màu tóc",
      "Nhuộm Balayage thủ công",
      "Điều chỉnh sắc độ",
      "Phục hồi liên kết tóc",
      "Sấy và tạo kiểu"
    ],
    "active": true,
    "featured": true,
    "signature": true,
    "order": 1,
    "aftercare": [
      "Chờ 72 giờ trước lần gội đầu tiên",
      "Dùng dầu gội không sulfate",
      "Làm mới màu sau 8–10 tuần"
    ]
  },
  {
    "id": "svc-haircut",
    "slug": "precision-haircut",
    "name": "Cắt tóc thiết kế",
    "categorySlug": "hair",
    "summary": "Đường cắt được tạo theo gương mặt và nếp tóc của bạn.",
    "description": "Chúng tôi dành thời gian quan sát nếp tóc và lắng nghe mong muốn trước khi cắt. Kiểu tóc được thiết kế để bạn dễ chăm sóc tại nhà.",
    "durationMin": 60,
    "price": 450000,
    "image": "/images/photo-1779153862705-5969578ac606.jpg",
    "includes": [
      "Tư vấn kiểu tóc",
      "Gội và massage da đầu",
      "Cắt tóc thiết kế",
      "Sấy hoàn thiện"
    ],
    "active": true,
    "featured": true,
    "order": 2
  },
  {
    "id": "svc-glass-treatment",
    "slug": "glass-hair-treatment",
    "name": "Phục hồi tóc bóng mượt",
    "categorySlug": "hair",
    "summary": "Chăm sóc biểu bì tóc để có độ bóng và mềm mại.",
    "description": "Liệu trình bổ sung dưỡng chất, làm mượt bề mặt và hỗ trợ phục hồi mái tóc khô. Phù hợp với tóc đã qua nhuộm hoặc thường xuyên tạo kiểu.",
    "durationMin": 45,
    "price": 600000,
    "image": "/images/photo-1627410800570-f9a2c872a7cf.jpg",
    "gallery": [
      "/images/photo-1614283233556-f35b0c801ef1.jpg",
      "/images/photo-1598461947262-153e592d4e72.jpg"
    ],
    "includes": [
      "Đánh giá tình trạng tóc",
      "Bổ sung dưỡng chất",
      "Ủ phục hồi",
      "Sấy hoàn thiện"
    ],
    "active": true,
    "featured": true,
    "signature": true,
    "order": 3
  },
  {
    "id": "svc-signature-blonde",
    "slug": "signature-blonde",
    "name": "Nhuộm tóc sáng VELA",
    "categorySlug": "hair",
    "summary": "Nâng tông và điều chỉnh sắc độ với chăm sóc phục hồi.",
    "description": "Nhân viên đánh giá nền tóc, tư vấn mức sáng phù hợp và chăm sóc tóc trong từng bước thực hiện để giữ mái tóc khỏe đẹp.",
    "durationMin": 180,
    "price": 2500000,
    "image": "/images/photo-1779399147716-a3ca1e519406.jpg",
    "gallery": [
      "/images/photo-1619520167112-c8cb9961e30a.jpg",
      "/images/photo-1554519934-e32b1629d9ee.jpg"
    ],
    "includes": [
      "Tư vấn màu tóc",
      "Nâng tông có bảo vệ tóc",
      "Điều chỉnh sắc độ",
      "Ủ phục hồi",
      "Sấy và tạo kiểu"
    ],
    "active": true,
    "featured": true,
    "signature": true,
    "order": 4,
    "aftercare": [
      "Dùng sản phẩm giữ màu theo tư vấn",
      "Bảo vệ tóc trước khi dùng nhiệt",
      "Làm mới sắc độ sau 6 tuần"
    ]
  },
  {
    "id": "svc-root-touch",
    "slug": "root-retouch",
    "name": "Nhuộm chân tóc",
    "categorySlug": "hair",
    "summary": "Làm đều phần chân tóc với màu tóc hiện tại.",
    "description": "Dịch vụ tập trung vào phần tóc mới mọc, giúp duy trì màu đồng đều mà hạn chế tác động lên phần tóc đã nhuộm.",
    "durationMin": 75,
    "price": 900000,
    "image": "/images/photo-1629397685944-7073f5589754.jpg",
    "includes": [
      "Nhuộm chân tóc",
      "Điều chỉnh sắc độ",
      "Gội và sấy"
    ],
    "active": true,
    "featured": false,
    "order": 5
  },
  {
    "id": "svc-blowout",
    "slug": "editorial-blowout",
    "name": "Sấy tạo kiểu",
    "categorySlug": "hair",
    "summary": "Mái tóc có độ phồng tự nhiên và chuyển động mềm mại.",
    "description": "Tóc được chia từng lớp khi sấy và định hình theo phong cách bạn mong muốn. Phù hợp trước một buổi hẹn hoặc sự kiện.",
    "durationMin": 45,
    "price": 350000,
    "image": "/images/photo-1580618672591-eb180b1a973f.jpg",
    "includes": [
      "Gội và massage da đầu",
      "Sấy theo lớp",
      "Định hình kiểu tóc",
      "Hoàn thiện nhẹ nhàng"
    ],
    "active": true,
    "featured": false,
    "order": 6
  },
  {
    "id": "svc-keratin",
    "slug": "smoothing-keratin",
    "name": "Làm mượt tóc Keratin",
    "categorySlug": "hair",
    "summary": "Giảm xơ rối, giữ độ mềm mại tự nhiên.",
    "description": "Liệu trình làm mượt phù hợp với mái tóc khó vào nếp. Nhân viên đánh giá tình trạng tóc và tư vấn cách chăm sóc sau dịch vụ.",
    "durationMin": 150,
    "price": 2200000,
    "image": "/images/photo-1524504388940-b1c1722653e1.jpg",
    "includes": [
      "Gội làm sạch",
      "Bổ sung Keratin",
      "Định hình tóc",
      "Hướng dẫn chăm sóc"
    ],
    "active": true,
    "featured": false,
    "order": 7,
    "aftercare": [
      "Không gội trong 48 giờ",
      "Dùng sản phẩm chăm sóc phù hợp"
    ]
  },
  {
    "id": "svc-gel-set",
    "slug": "luxury-gel-set",
    "name": "Sơn gel cao cấp",
    "categorySlug": "nails",
    "summary": "Tạo dáng cân đối và hoàn thiện lớp gel bền đẹp.",
    "description": "Móng được chăm sóc phần viền, tạo cấu trúc và sơn từng lớp mỏng. Bạn có thể chọn sắc màu phù hợp với phong cách hằng ngày.",
    "durationMin": 90,
    "price": 550000,
    "image": "/images/photo-1610992015762-45dca7fa3a85.jpg",
    "gallery": [
      "/images/photo-1610992015836-7c249d75782d.jpg",
      "/images/photo-1610992015732-2449b76344bc.jpg",
      "/images/photo-1643648854897-7b5845b4c04c.jpg"
    ],
    "includes": [
      "Chăm sóc viền móng",
      "Tạo dáng móng",
      "Sơn gel",
      "Dưỡng viền móng"
    ],
    "active": true,
    "featured": true,
    "signature": true,
    "order": 8,
    "aftercare": [
      "Dưỡng viền móng hằng ngày",
      "Tháo gel tại salon",
      "Chăm sóc lại sau 3–4 tuần"
    ]
  },
  {
    "id": "svc-classic-mani",
    "slug": "classic-manicure",
    "name": "Chăm sóc móng tay",
    "categorySlug": "nails",
    "summary": "Tạo dáng, chăm sóc viền và sơn móng tỉ mỉ.",
    "description": "Dịch vụ cơ bản với các bước chăm sóc nhẹ nhàng, massage tay và hoàn thiện màu sơn bạn lựa chọn.",
    "durationMin": 45,
    "price": 250000,
    "image": "/images/photo-1630843599725-32ead7671867.jpg",
    "includes": [
      "Ngâm và tạo dáng",
      "Chăm sóc viền móng",
      "Massage tay",
      "Sơn hoặc đánh bóng"
    ],
    "active": true,
    "featured": false,
    "order": 9
  },
  {
    "id": "svc-nail-art",
    "slug": "bespoke-nail-art",
    "name": "Vẽ móng theo yêu cầu",
    "categorySlug": "nails",
    "summary": "Họa tiết thủ công và chi tiết theo phong cách riêng.",
    "description": "Tư vấn mẫu thiết kế phù hợp với dáng bàn tay, sau đó hoàn thiện các đường nét, hiệu ứng ánh kim hoặc họa tiết theo yêu cầu.",
    "durationMin": 30,
    "price": 300000,
    "image": "/images/photo-1587729927069-ef3b7a5ab9b4.jpg",
    "gallery": [
      "/images/photo-1632345031435-8727f6897d53.jpg",
      "/images/photo-1643648854897-7b5845b4c04c.jpg"
    ],
    "includes": [
      "Tư vấn mẫu thiết kế",
      "Vẽ chi tiết thủ công",
      "Phủ bảo vệ"
    ],
    "active": true,
    "featured": true,
    "order": 10
  },
  {
    "id": "svc-pedicure",
    "slug": "spa-pedicure",
    "name": "Chăm sóc móng chân",
    "categorySlug": "nails",
    "summary": "Ngâm ấm, làm sạch và massage thư giãn.",
    "description": "Thư giãn trong không gian chăm sóc móng chân với ngâm khoáng, chăm sóc viền móng, tẩy tế bào chết và massage.",
    "durationMin": 60,
    "price": 400000,
    "image": "/images/photo-1610992015732-2449b76344bc.jpg",
    "includes": [
      "Ngâm khoáng",
      "Chăm sóc móng và viền",
      "Tẩy tế bào chết",
      "Massage chân",
      "Sơn móng"
    ],
    "active": true,
    "featured": false,
    "order": 11
  },
  {
    "id": "svc-volume-lash",
    "slug": "russian-volume-lashes",
    "name": "Nối mi tạo độ dày",
    "categorySlug": "lashes",
    "summary": "Dáng mi được thiết kế theo hình dáng đôi mắt.",
    "description": "Các cụm mi được tạo thủ công và phân bố theo dáng mắt. Nhân viên lựa chọn độ dày phù hợp với mi tự nhiên để giữ cảm giác thoải mái.",
    "durationMin": 120,
    "price": 950000,
    "image": "/images/photo-1548902378-2ec44c906391.jpg",
    "gallery": [
      "/images/photo-1683719312734-e31de63957ab.jpg",
      "/images/photo-1639629509821-c54cdd984227.jpg"
    ],
    "includes": [
      "Tư vấn dáng mi",
      "Tạo cụm mi thủ công",
      "Kiểm tra từng sợi mi",
      "Hướng dẫn chăm sóc"
    ],
    "active": true,
    "featured": true,
    "order": 12,
    "aftercare": [
      "Giữ mi khô trong 24 giờ",
      "Vệ sinh mi nhẹ nhàng",
      "Dặm mi sau 2–3 tuần"
    ]
  },
  {
    "id": "svc-classic-lash",
    "slug": "classic-lash-extensions",
    "name": "Nối mi tự nhiên",
    "categorySlug": "lashes",
    "summary": "Từng sợi mi nhẹ nhàng, tôn nét tự nhiên.",
    "description": "Một sợi mi nối được gắn lên từng sợi mi tự nhiên với chiều dài cân đối. Phù hợp khi bạn muốn đôi mắt rõ nét mà vẫn nhẹ nhàng.",
    "durationMin": 90,
    "price": 700000,
    "image": "/images/photo-1535310172250-0dcb6b63324e.jpg",
    "includes": [
      "Tư vấn dáng mi",
      "Nối mi từng sợi",
      "Hướng dẫn chăm sóc"
    ],
    "active": true,
    "featured": false,
    "order": 13
  },
  {
    "id": "svc-lash-lift",
    "slug": "lash-lift-and-tint",
    "name": "Uốn và nhuộm mi",
    "categorySlug": "lashes",
    "summary": "Làm cong mi tự nhiên và tạo sắc độ rõ nét.",
    "description": "Mi của bạn được nâng nhẹ từ chân và nhuộm màu phù hợp. Dịch vụ giúp làm nổi bật ánh nhìn mà không cần nối mi.",
    "durationMin": 60,
    "price": 500000,
    "image": "/images/photo-1561505445-3d89277edf4c.jpg",
    "includes": [
      "Uốn mi",
      "Dưỡng mi",
      "Nhuộm mi",
      "Chăm sóc chân mày"
    ],
    "active": true,
    "featured": true,
    "order": 14
  },
  {
    "id": "svc-signature-facial",
    "slug": "signature-facial",
    "name": "Chăm sóc da VELA",
    "categorySlug": "facial",
    "summary": "Hiểu làn da trước khi chọn từng bước chăm sóc.",
    "description": "Bắt đầu bằng đánh giá tình trạng da, sau đó làm sạch, tẩy tế bào chết và dưỡng theo nhu cầu. Bạn nhận hướng dẫn chăm sóc tại nhà sau liệu trình.",
    "durationMin": 60,
    "price": 800000,
    "image": "/images/photo-1728949202477-bad2935775cb.jpg",
    "gallery": [
      "/images/photo-1693004927824-f2623bbedc8b.jpg",
      "/images/photo-1728727267814-792db55ce678.jpg"
    ],
    "includes": [
      "Đánh giá da",
      "Làm sạch hai bước",
      "Tẩy tế bào chết nhẹ",
      "Làm sạch vùng cần thiết",
      "Mặt nạ và dưỡng",
      "Hướng dẫn tại nhà"
    ],
    "active": true,
    "featured": true,
    "order": 15
  },
  {
    "id": "svc-glow-peel",
    "slug": "glow-peel",
    "name": "Làm sáng da nhẹ nhàng",
    "categorySlug": "facial",
    "summary": "Chăm sóc bề mặt da theo mức độ phù hợp.",
    "description": "Nhân viên đánh giá da trước khi thực hiện, lựa chọn sản phẩm phù hợp và kết thúc bằng mặt nạ làm dịu, hỗ trợ hàng rào bảo vệ da.",
    "durationMin": 45,
    "price": 850000,
    "image": "/images/photo-1728727267814-792db55ce678.jpg",
    "includes": [
      "Đánh giá da",
      "Chăm sóc bề mặt da",
      "Làm dịu",
      "Mặt nạ phục hồi",
      "Chống nắng"
    ],
    "active": true,
    "featured": true,
    "order": 16,
    "aftercare": [
      "Dùng kem chống nắng theo tư vấn",
      "Tạm ngưng sản phẩm tác động mạnh"
    ]
  },
  {
    "id": "svc-brightening-facial",
    "slug": "brightening-vitamin-facial",
    "name": "Dưỡng sáng da Vitamin C",
    "categorySlug": "facial",
    "summary": "Bổ sung dưỡng chất giúp làn da tươi sáng.",
    "description": "Liệu trình tập trung vào độ sáng và sắc da đồng đều với Vitamin C cùng các bước chăm sóc nhẹ nhàng theo tình trạng da.",
    "durationMin": 75,
    "price": 950000,
    "image": "/images/photo-1761718210089-ba3bb5ccb54f.jpg",
    "includes": [
      "Đánh giá da",
      "Bổ sung dưỡng chất",
      "Chăm sóc Vitamin C",
      "Dưỡng hoàn thiện",
      "Chống nắng"
    ],
    "active": true,
    "featured": false,
    "order": 17
  },
  {
    "id": "svc-head-spa",
    "slug": "japanese-head-spa",
    "name": "Gội đầu thư giãn Nhật Bản",
    "categorySlug": "spa",
    "summary": "90 phút chăm sóc da đầu trong không gian yên tĩnh.",
    "description": "Đánh giá da đầu, chăm sóc bằng dầu ấm và massage nhẹ nhàng trước khi gội. Ánh sáng dịu và không gian yên tĩnh giúp bạn thư giãn trọn vẹn.",
    "durationMin": 90,
    "price": 750000,
    "image": "/images/photo-1634449571010-02389ed0f9b0.jpg",
    "gallery": [
      "/images/photo-1611920629515-3f76f8c36b37.jpg",
      "/images/photo-1761470575018-135c213340eb.jpg",
      "/images/photo-1769011496342-2bd1ad232d8f.jpg"
    ],
    "includes": [
      "Đánh giá da đầu",
      "Chăm sóc dầu ấm",
      "Massage thư giãn",
      "Gội đầu",
      "Sấy hoàn thiện"
    ],
    "active": true,
    "featured": true,
    "signature": true,
    "order": 18,
    "aftercare": [
      "Uống đủ nước",
      "Chăm sóc da đầu theo hướng dẫn"
    ]
  },
  {
    "id": "svc-scalp-detox",
    "slug": "scalp-detox-ritual",
    "name": "Làm sạch da đầu",
    "categorySlug": "spa",
    "summary": "Làm sạch cặn sản phẩm và cân bằng da đầu.",
    "description": "Liệu trình ngắn với làm sạch, xông nhẹ và bổ sung dưỡng chất theo nhu cầu của da đầu.",
    "durationMin": 45,
    "price": 450000,
    "image": "/images/photo-1761470575018-135c213340eb.jpg",
    "includes": [
      "Đánh giá da đầu",
      "Làm sạch nhẹ nhàng",
      "Xông thư giãn",
      "Dưỡng cân bằng"
    ],
    "active": true,
    "featured": false,
    "order": 19
  },
  {
    "id": "svc-vela-ritual",
    "slug": "the-vela-ritual",
    "name": "Liệu trình thư giãn VELA",
    "categorySlug": "spa",
    "summary": "Chăm sóc da đầu và thư giãn trong một buổi hẹn.",
    "description": "Một buổi chăm sóc chuyên sâu do nhân viên phụ trách xuyên suốt, kết hợp gội đầu, massage và dưỡng da trong phòng yên tĩnh.",
    "durationMin": 210,
    "price": 2800000,
    "image": "/images/photo-1776763018829-ad685e621871.jpg",
    "gallery": [
      "/images/photo-1611920629515-3f76f8c36b37.jpg",
      "/images/photo-1763873993447-1d0be71a96d9.jpg"
    ],
    "includes": [
      "Chăm sóc da đầu",
      "Massage thư giãn",
      "Dưỡng da",
      "Trà thảo mộc",
      "Không gian yên tĩnh"
    ],
    "active": true,
    "featured": true,
    "signature": true,
    "order": 20
  }
];

export const serviceById = new Map(services.map(s => [s.id, s]));
export const serviceBySlug = new Map(services.map(s => [s.slug, s]));
export const categoryBySlug = new Map(categories.map(c => [c.slug, c]));
