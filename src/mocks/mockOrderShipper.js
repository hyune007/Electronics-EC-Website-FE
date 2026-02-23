// import { p } from "framer-motion/client";

const mockOrderShipper = {
  newOrder: [
    {
      id: "HD011",
      name: "Nguyễn N",
      phone: "0909123456",
      address: "91/8D Đường Hưng Hóa - Phường noname - Thành phố Hồ Chí Minh",
      price: 1299000,
    },
    {
      id: "HD012",
      name: "Trường H",
      phone: "0909123457",
      address: "55B Nguyễn Thị Minh Khai - Bến Thành - Thành phố Hồ Chí Minh",
      price: 459900,
    },
    {
      id: "HD013",
      name: "Lê Khang",
      phone: "0909123458",
      address: "268 Lý Thường Kiệt - Phường 14 - Thành phố Hồ Chí Minh",
      price: 500000,
    },
    {
      id: "HD014",
      name: "Vũ L",
      phone: "0909123459",
      address: "128 Nguyễn Văn Nghi - Phường 5 - Thành phố Hồ Chí Minh",
      price: 500000,
    },
    {
      id: "HD015",
      name: "Đăng K",
      phone: "0909123460",
      address: "45 Lê Đức Thọ, Phường rgssg, Thành phố Hồ Chí Minh",
      price: 500000,
    },
  ],

  inTransitOrder: [
    {
      id: "HD006",
      name: "Nguyễn Văn F",
      phone: "0909123456",
      address: "91/8D Đường Hưng Hóa - Phường noname - Thành phố Hồ Chí Minh",
      price: 1299000,
      product: [
        {
          name: "Tai nghe Bluetooth AirPods Pro",
          price: 30000,
          qty: 1,
        },
        {
        name: "dien thoai iPhone 13 Pro Max",
          price: 30000,
          qty: 1,
        }
      ]
    },
    {
      id: "HD007",
      name: "Trần Thị J",
      phone: "0909123457",
      address: "55B Nguyễn Thị Minh Khai - Bến Thành - Thành phố Hồ Chí Minh",
      price: 459900,
       product: [
        {
          name: "Tai nghe Bluetooth AirPods Pro",
          price: 30000,
          qty: 1,
        },
        {
        name: "dien thoai iPhone 13 Pro Max",
          price: 30000,
          qty: 1,
        }
      ]
    },
    {
      id: "HD008",
      name: "Nguyễn Trường N",
      phone: "0909123458",
      address: "268 Lý Thường Kiệt - Phường 14 - Thành phố Hồ Chí Minh",
      price: 500000,
       product: [
        {
          name: "Tai nghe Bluetooth AirPods Pro",
          price: 30000,
          qty: 1,
        },
        {
        name: "dien thoai iPhone 13 Pro Max",
          price: 30000,
          qty: 1,
        }
      ]
    },
    {
      id: "HD009",
      name: "Nguyễn Trường B",
      phone: "0909123459",
      address: "128 Nguyễn Văn Nghi - Phường 5 - Thành phố Hồ Chí Minh",
      price: 500000,
       product: [
        {
          name: "Tai nghe Bluetooth AirPods Pro",
          price: 30000,
          qty: 1,
        },
        {
        name: "dien thoai iPhone 13 Pro Max",
          price: 30000,
          qty: 1,
        }
      ]
    },
    {
      id: "HD010",
      name: "Nguyễn Trường A",
      phone: "0909123460",
      address: "45 Lê Đức Thọ, Phường rgssg, Thành phố Hồ Chí Minh",
      price: 500000,
       product: [
        {
          name: "Tai nghe Bluetooth AirPods Pro",
          price: 30000,
          qty: 1,
        },
        {
        name: "dien thoai iPhone 13 Pro Max",
          price: 30000,
          qty: 1,
        }
      ]
    },
  ],
  completedOrder: [
     {
      id: "HD001",
      name: "Nguyễn Trường A",
      phone: "0909123460",
      address: "45 Lê Đức Thọ, Phường rgssg, Thành phố Hồ Chí Minh",
      price: 500000,
    },
       {
      id: "HD002",
      name: "Nguyễn Trường B",
      phone: "0909123461",
      address: "45 Lê Đức Thọ, Phường rgssg, Thành phố Hồ Chí Minh",
      price: 500000,
    },
       {
      id: "HD003",
      name: "Nguyễn Trường C",
      phone: "0909123462",
      address: "45 Lê Đức Thọ, Phường rgssg, Thành phố Hồ Chí Minh",
      price: 500000,
    },
       {
      id: "HD004",
      name: "Nguyễn Trường D",
      phone: "0909123463",
      address: "45 Lê Đức Thọ, Phường rgssg, Thành phố Hồ Chí Minh",
      price: 500000,
    },
       {
      id: "HD005",
      name: "Nguyễn Trường E",
      phone: "0909123464",
      address: "45 Lê Đức Thọ, Phường rgssg, Thành phố Hồ Chí Minh",
      price: 500000,
    },
  ],
  cancelledOrder: [
           {
      id: "HD016",
      name: "Tao Co Khien",
      phone: "0909123464",
      address: "45 Lê Đức Thọ, Phường rgssg, Thành phố Hồ Chí Minh",
      price: 500000,
      noteFromShipper: "Shipper không liên lạc được với khách hàng",
      noteFromCustomer: ""
    },
           {
      id: "HD018",
      name: "Kho Ga",
      phone: "0909123464",
      address: "45 Lê Đức Thọ, Phường rgssg, Thành phố Hồ Chí Minh",
      price: 500000,
      noteFromShipper: "Không giao được hàng do khách không có nhà 3/3 lần",
      noteFromCustomer: ""
    },
               {
      id: "HD019",
      name: "Vu Minh Hieu",
      phone: "0909123464",
      address: "45 Lê Đức Thọ, Phường rgssg, Thành phố Hồ Chí Minh",
      price: 500000,
      noteFromShipper: "",
      noteFromCustomer: "Khách hàng tự hủy đơn do mua nhầm sản phẩm"
    },
  ]

};

export default mockOrderShipper;
