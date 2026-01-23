import { Search } from "lucide-react";
import { useOrderLogic } from "./OrderLogic.js";
import "./Order.css";

export default function OrderManage() {
    const om = useOrderLogic();

    return (
        <div className="order-manage">
            {/* TOOLBAR */}
            <div className="toolbar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        placeholder="Tìm theo mã đơn / khách hàng..."
                        value={om.search}
                        onChange={e => om.setSearch(e.target.value)}
                    />
                </div>

                <select
                    className="status-filter"
                    value={om.statusFilter}
                    onChange={e => om.setStatusFilter(e.target.value)}
                >
                    <option value="ALL">Tất cả</option>
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                </select>
            </div>

            {/* TABLE */}
            <div className="table-wrap">
                <table>
                    <thead>
                    <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Ngày tạo</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                    </tr>
                    </thead>
                    <tbody>
                    {om.filteredOrders.map(o => (
                        <tr key={o.order_id}>
                            <td>{o.order_id}</td>
                            <td>{o.customer_name}</td>
                            <td>{o.created_at}</td>
                            <td>
                                {o.total_amount.toLocaleString()} ₫
                            </td>
                            <td>
                                    <span className={`status ${o.status.toLowerCase()}`}>
                                        {o.status}
                                    </span>
                            </td>
                        </tr>
                    ))}

                    {om.filteredOrders.length === 0 && (
                        <tr>
                            <td colSpan="5" className="empty">
                                Không có đơn hàng
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
